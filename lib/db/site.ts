import defaults from '@/data/storeData.json';
import { DEFAULT_WHATSAPP } from '@/lib/contact';
import type { SupabaseClient } from '@supabase/supabase-js';
import { db, unwrap } from './client';
import type { StoreContent, StorePromoCode, StoreSettings } from './types';

// ─── Site content & settings ─────────────────────────────────────────────────

type SiteKey = 'content' | 'settings';

async function readDoc(key: SiteKey, client: SupabaseClient = db()): Promise<Record<string, any>> {
  const row = unwrap(
    await client.from('site_settings').select('value').eq('key', key).maybeSingle(),
    'Sayt tənzimləmələri oxunmadı'
  );
  return (row?.value as Record<string, any>) || {};
}

async function writeDoc(key: SiteKey, value: Record<string, any>): Promise<void> {
  unwrap(
    await db()
      .from('site_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' }),
    'Sayt tənzimləmələri yadda saxlanılmadı'
  );
}

const NESTED_CONTENT_KEYS = ['hero', 'promoBanner', 'campaignSecondary', 'podBanner', 'policies'] as const;

function mergeContent(base: Record<string, any>, patch: Record<string, any>): Record<string, any> {
  const merged: Record<string, any> = { ...base, ...patch };
  for (const key of NESTED_CONTENT_KEYS) {
    if (base?.[key] || patch?.[key]) {
      merged[key] = { ...(base?.[key] || {}), ...(patch?.[key] || {}) };
    }
  }
  if (!Array.isArray(patch?.announcements)) merged.announcements = base?.announcements || [];
  // Categories live in their own table.
  delete merged.categories;
  return merged;
}

/** Stored content layered over the built-in defaults, with live categories. */
export async function getContent(client: SupabaseClient = db()): Promise<StoreContent> {
  const [stored, categories] = await Promise.all([readDoc('content', client), listCategories(client)]);
  const content = mergeContent(defaults.content as Record<string, any>, stored);
  content.categories = categories;
  return content as StoreContent;
}

export async function getSettings(client: SupabaseClient = db()): Promise<StoreSettings> {
  const stored = await readDoc('settings', client);
  return { whatsappNumber: DEFAULT_WHATSAPP, ...(defaults.settings as StoreSettings), ...stored } as StoreSettings;
}

export async function saveContent(patch: Record<string, any>): Promise<StoreContent> {
  const stored = await readDoc('content');
  await writeDoc('content', mergeContent(stored, patch || {}));
  return getContent();
}

export async function saveSettings(patch: Record<string, any>): Promise<StoreSettings> {
  const stored = await readDoc('settings');
  await writeDoc('settings', { ...stored, ...(patch || {}) });
  return getSettings();
}

// ─── Categories ──────────────────────────────────────────────────────────────

export interface StoreCategory {
  id: string;
  title: string;
  desc: string;
  image: string;
  active: boolean;
  [key: string]: any;
}

function rowToCategory(r: any): StoreCategory {
  return {
    ...(r.extra || {}),
    id: r.id,
    title: r.title || '',
    desc: r.description || '',
    image: r.image || '',
    active: r.active !== false,
    sortOrder: r.sort_order || 0,
  };
}

export async function listCategories(client: SupabaseClient = db()): Promise<StoreCategory[]> {
  const rows = unwrap(
    await client
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }),
    'Kateqoriyalar oxunmadı'
  );
  return (rows || []).map(rowToCategory);
}

export async function saveCategory(input: any): Promise<StoreCategory> {
  const { id: rawId, title, desc, description, image, active, sortOrder, ...extra } = input || {};
  const id = String(rawId || '').trim() || `cat-${Date.now().toString(36)}`;

  const existing = unwrap(
    await db().from('categories').select('*').eq('id', id).maybeSingle(),
    'Kateqoriya axtarılmadı'
  );

  const row: Record<string, any> = {
    id,
    title: String(title ?? existing?.title ?? ''),
    description: String(desc ?? description ?? existing?.description ?? ''),
    image: String(image ?? existing?.image ?? ''),
    active: active !== undefined ? Boolean(active) : existing?.active ?? true,
    extra: { ...(existing?.extra || {}), ...extra },
    updated_at: new Date().toISOString(),
  };
  if (sortOrder !== undefined && Number.isFinite(Number(sortOrder))) {
    row.sort_order = Math.round(Number(sortOrder));
  } else if (!existing) {
    const all = await listCategories();
    row.sort_order = all.reduce((max, c) => Math.max(max, Number(c.sortOrder) || 0), 0) + 1;
  }

  const saved = unwrap(
    await db().from('categories').upsert(row, { onConflict: 'id' }).select('*').single(),
    'Kateqoriya yadda saxlanılmadı'
  );
  return rowToCategory(saved);
}

export async function deleteCategory(id: string): Promise<void> {
  unwrap(await db().from('categories').delete().eq('id', id), 'Kateqoriya silinmədi');
}

// ─── Promo codes ─────────────────────────────────────────────────────────────

function rowToPromo(r: any): StorePromoCode {
  return {
    id: r.id,
    code: r.code,
    type: r.type === 'fixed' ? 'fixed' : 'percent',
    value: Number(r.value) || 0,
    minAmount: Number(r.min_amount) || 0,
    active: r.active !== false,
    desc: r.description || '',
    uses: r.uses || 0,
    maxUses: r.max_uses ?? null,
    expiresAt: r.expires_at ?? null,
  };
}

export async function listPromos(): Promise<StorePromoCode[]> {
  const rows = unwrap(
    await db().from('promo_codes').select('*').order('created_at', { ascending: false }),
    'Promokodlar oxunmadı'
  );
  return (rows || []).map(rowToPromo);
}

export async function findPromo(code: string): Promise<StorePromoCode | null> {
  const clean = String(code || '').trim().toUpperCase();
  if (!clean) return null;
  const row = unwrap(
    await db().from('promo_codes').select('*').eq('code', clean).maybeSingle(),
    'Promokod axtarılmadı'
  );
  return row ? rowToPromo(row) : null;
}

export async function savePromo(input: any): Promise<StorePromoCode> {
  const code = String(input?.code || '').trim().toUpperCase();
  if (!code) throw new Error('Promokod tələb olunur.');

  let existing: any = null;
  if (input.id) {
    existing = unwrap(
      await db().from('promo_codes').select('*').eq('id', String(input.id)).maybeSingle(),
      'Promokod axtarılmadı'
    );
  }
  if (!existing) {
    existing = unwrap(
      await db().from('promo_codes').select('*').eq('code', code).maybeSingle(),
      'Promokod axtarılmadı'
    );
  }

  const row: Record<string, any> = { code, updated_at: new Date().toISOString() };
  if (input.type !== undefined) row.type = input.type === 'fixed' ? 'fixed' : 'percent';
  if (input.value !== undefined) row.value = Math.max(0, Number(input.value) || 0);
  if (input.minAmount !== undefined) row.min_amount = Math.max(0, Number(input.minAmount) || 0);
  if (input.active !== undefined) row.active = Boolean(input.active);
  if (input.desc !== undefined) row.description = String(input.desc || '');
  if (input.uses !== undefined) row.uses = Math.max(0, Math.round(Number(input.uses) || 0));
  if (input.maxUses !== undefined) {
    const max = Number(input.maxUses);
    row.max_uses = Number.isFinite(max) && max > 0 ? Math.round(max) : null;
  }
  if (input.expiresAt !== undefined) {
    const time = input.expiresAt ? new Date(input.expiresAt).getTime() : NaN;
    row.expires_at = Number.isNaN(time) ? null : new Date(time).toISOString();
  }

  const res = existing
    ? await db().from('promo_codes').update(row).eq('id', existing.id).select('*').single()
    : await db().from('promo_codes').insert(input.id ? { ...row, id: String(input.id) } : row).select('*').single();

  return rowToPromo(unwrap(res, 'Promokod yadda saxlanılmadı'));
}

export async function deletePromo(idOrCode: string): Promise<void> {
  const value = String(idOrCode || '').trim();
  if (!value) return;
  unwrap(await db().from('promo_codes').delete().eq('id', value), 'Promokod silinmədi');
  unwrap(await db().from('promo_codes').delete().eq('code', value.toUpperCase()), 'Promokod silinmədi');
}

export async function incrementPromoUses(code: string): Promise<void> {
  const promo = await findPromo(code);
  if (!promo?.id) return;
  unwrap(
    await db().from('promo_codes').update({ uses: (promo.uses || 0) + 1 }).eq('id', promo.id),
    'Promokod istifadəsi yenilənmədi'
  );
}

export type PromoCheck =
  | { ok: true; promo: StorePromoCode; discount: number }
  | { ok: false; reason: 'invalid' | 'expired' | 'maxed' | 'min_amount'; promo?: StorePromoCode };

/** The single place a promo code is judged; used by checkout and the public lookup. */
export async function checkPromo(code: unknown, subtotal: number): Promise<PromoCheck> {
  if (typeof code !== 'string' || !code.trim()) return { ok: false, reason: 'invalid' };
  const promo = await findPromo(code);
  if (!promo || promo.active === false) return { ok: false, reason: 'invalid' };

  if (promo.expiresAt) {
    const expires = new Date(promo.expiresAt).getTime();
    if (!Number.isNaN(expires) && Date.now() > expires) return { ok: false, reason: 'expired', promo };
  }
  if (typeof promo.maxUses === 'number' && promo.maxUses > 0 && (promo.uses || 0) >= promo.maxUses) {
    return { ok: false, reason: 'maxed', promo };
  }
  if (subtotal < (promo.minAmount || 0)) return { ok: false, reason: 'min_amount', promo };

  const discount = promo.type === 'fixed'
    ? Math.min(subtotal, promo.value)
    : (subtotal * Math.min(100, Math.max(0, promo.value))) / 100;

  return { ok: true, promo, discount: Math.round(discount * 100) / 100 };
}
