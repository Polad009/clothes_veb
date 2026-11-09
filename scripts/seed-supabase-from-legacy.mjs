// One-off migration helper: copies the data the old code kept as JSON blobs in
// Supabase Storage (config/store_config.json, config/promos.json) into the real
// tables created by supabase/migrations/20261109_single_source_of_truth.sql.
//
//   node scripts/seed-supabase-from-legacy.mjs            # dry run, prints what it would write
//   node scripts/seed-supabase-from-legacy.mjs --apply    # writes (rows that already exist are kept)
//   node scripts/seed-supabase-from-legacy.mjs --apply --force   # overwrite existing rows
//
// Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APPLY = process.argv.includes('--apply');
const FORCE = process.argv.includes('--force');
const BUCKET = 'product-images';

function loadEnv() {
  const file = path.join(ROOT, '.env.local');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m || process.env[m[1]]) continue;
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

loadEnv();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY tapılmadı (.env.local).');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const bundled = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'storeData.json'), 'utf8'));

async function downloadJson(file) {
  const { data, error } = await supabase.storage.from(BUCKET).download(file);
  if (error || !data) {
    console.warn(`  ! ${file} oxunmadı (${error?.message || 'boş'}) — layihədəki ilkin dəyərlər istifadə olunur`);
    return null;
  }
  return JSON.parse(await data.text());
}

async function write(table, rows, onConflict) {
  if (rows.length === 0) return;
  if (!APPLY) return;
  const { error } = await supabase.from(table).upsert(rows, { onConflict, ignoreDuplicates: !FORCE });
  if (error) throw new Error(`${table}: ${error.message}`);
}

const config = (await downloadJson('config/store_config.json')) || {};
const promos = (await downloadJson('config/promos.json')) || bundled.promoCodes || [];

// ── content & settings ───────────────────────────────────────────────────────
const content = { ...(bundled.content || {}), ...(config.content || {}) };
const categories = Array.isArray(content.categories) ? content.categories : [];
delete content.categories;
const settings = { ...(bundled.settings || {}), ...(config.settings || {}) };

await write('site_settings', [
  { key: 'content', value: content },
  { key: 'settings', value: settings },
], 'key');
console.log(`site_settings: content (${Object.keys(content).join(', ')}), settings (${Object.keys(settings).length} sahə)`);

// ── categories ───────────────────────────────────────────────────────────────
const categoryRows = categories.map((c, index) => {
  const { id, title, desc, description, image, active, ...extra } = c;
  return {
    id: String(id || `cat-${index + 1}`),
    title: String(title || ''),
    description: String(desc ?? description ?? ''),
    image: String(image || ''),
    active: active !== false,
    sort_order: index + 1,
    extra,
  };
});
await write('categories', categoryRows, 'id');
console.log(`categories: ${categoryRows.length} (${categoryRows.map((c) => c.id).join(', ')})`);

// ── promo codes ──────────────────────────────────────────────────────────────
const seen = new Set();
const promoRows = [];
for (const p of Array.isArray(promos) ? promos : []) {
  const code = String(p.code || '').trim().toUpperCase();
  if (!code || seen.has(code)) continue;
  seen.add(code);
  const maxUses = Number(p.maxUses);
  const expires = p.expiresAt ? new Date(p.expiresAt) : null;
  promoRows.push({
    id: String(p.id || `promo-${code.toLowerCase()}`),
    code,
    type: p.type === 'fixed' ? 'fixed' : 'percent',
    value: Number(p.value) || 0,
    min_amount: Number(p.minAmount) || 0,
    active: p.active !== false,
    description: String(p.desc || ''),
    uses: Math.max(0, Math.round(Number(p.uses) || 0)),
    max_uses: Number.isFinite(maxUses) && maxUses > 0 ? Math.round(maxUses) : null,
    expires_at: expires && !Number.isNaN(expires.getTime()) ? expires.toISOString() : null,
  });
}
await write('promo_codes', promoRows, 'code');
console.log(`promo_codes: ${promoRows.length} (${promoRows.map((p) => p.code).join(', ')})`);

console.log(APPLY ? `\nYazıldı${FORCE ? ' (mövcud sətirlər üzərinə yazıldı)' : ' (mövcud sətirlər saxlanıldı)'}.` : '\nDRY RUN — heç nə yazılmadı. Yazmaq üçün: --apply');
