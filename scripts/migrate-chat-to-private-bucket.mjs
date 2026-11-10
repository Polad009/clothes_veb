// Moves live-chat transcripts out of the PUBLIC `product-images` bucket into a
// private bucket that only the server (service role) can read.
//
//   node scripts/migrate-chat-to-private-bucket.mjs            # dry run
//   node scripts/migrate-chat-to-private-bucket.mjs --copy     # create bucket, copy newer files (safe to repeat)
//   node scripts/migrate-chat-to-private-bucket.mjs --purge    # after the new code is live: final copy, then delete
//                                                              # the public chat files and the legacy config JSON
//
// Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const COPY = process.argv.includes('--copy') || process.argv.includes('--purge');
const PURGE = process.argv.includes('--purge');
const PUBLIC_BUCKET = 'product-images';
const PRIVATE_BUCKET = 'private-data';
const PREFIX = 'livechat';
const LEGACY_CONFIG = ['config/promos.json', 'config/store_config.json'];

for (const line of fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function listAll(bucket) {
  const out = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.storage.from(bucket).list(PREFIX, { limit: 1000, offset });
    if (error) {
      if (/not found/i.test(error.message)) return out;
      throw new Error(`${bucket}: ${error.message}`);
    }
    out.push(...(data || []).filter((f) => f.name.endsWith('.json')));
    if (!data || data.length < 1000) return out;
  }
}

if (COPY) {
  const { error } = await supabase.storage.createBucket(PRIVATE_BUCKET, { public: false });
  if (error && !/already exists/i.test(error.message)) throw new Error(`Bucket yaradılmadı: ${error.message}`);
}

const source = await listAll(PUBLIC_BUCKET);
const target = new Map((await listAll(PRIVATE_BUCKET)).map((f) => [f.name, f]));
const stale = source.filter((f) => {
  const copy = target.get(f.name);
  return !copy || new Date(f.updated_at) > new Date(copy.updated_at);
});
console.log(`Açıq bucket-də ${source.length} çat faylı, qapalı bucket-də ${target.size}; köçürüləcək: ${stale.length}`);

if (COPY) {
  let copied = 0;
  for (const f of stale) {
    const key = `${PREFIX}/${f.name}`;
    const { data, error } = await supabase.storage.from(PUBLIC_BUCKET).download(key);
    if (error || !data) throw new Error(`${key} oxunmadı: ${error?.message}`);
    const up = await supabase.storage
      .from(PRIVATE_BUCKET)
      .upload(key, Buffer.from(await data.arrayBuffer()), { contentType: 'application/json', upsert: true });
    if (up.error) throw new Error(`${key} yazılmadı: ${up.error.message}`);
    copied++;
  }
  console.log(`Köçürüldü: ${copied}`);
}

if (PURGE) {
  const after = new Set((await listAll(PRIVATE_BUCKET)).map((f) => f.name));
  const missing = source.filter((f) => !after.has(f.name));
  if (missing.length) throw new Error(`Silmə dayandırıldı: ${missing.length} fayl qapalı bucket-də yoxdur.`);

  // Keep a local copy of the legacy config blobs before removing them
  const backupDir = path.join(ROOT, '.claude', 'legacy-config-backup');
  fs.mkdirSync(backupDir, { recursive: true });
  for (const key of LEGACY_CONFIG) {
    const { data } = await supabase.storage.from(PUBLIC_BUCKET).download(key);
    if (data) fs.writeFileSync(path.join(backupDir, path.basename(key)), Buffer.from(await data.arrayBuffer()));
  }

  const keys = [...source.map((f) => `${PREFIX}/${f.name}`), ...LEGACY_CONFIG];
  for (let i = 0; i < keys.length; i += 100) {
    const { error } = await supabase.storage.from(PUBLIC_BUCKET).remove(keys.slice(i, i + 100));
    if (error) throw new Error(`Silinmədi: ${error.message}`);
  }
  console.log(`Açıq bucket-dən silindi: ${source.length} çat faylı + köhnə konfiqurasiya faylları (ehtiyat: .claude/legacy-config-backup)`);
}

if (!COPY) console.log('DRY RUN — heç nə dəyişmədi.');
