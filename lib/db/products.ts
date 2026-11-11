import type { SupabaseClient } from '@supabase/supabase-js';
import { unitPriceFor } from '@/lib/pricing';
import { db, isUuid, unwrap } from './client';
import { stockKey } from '@/lib/stock';
import type { AppliedCampaign } from '@/lib/campaigns';

const DEFAULT_IMAGE = '/images/hero/black-tee.jpg';
const DEFAULT_SIZES = ['S', 'M', 'L', 'XL'];

/** Product shape used by the storefront and the admin panel. */
export interface CatalogProduct {
  id: string;
  supaId: string;
  metaId: string;
  slug: string;
  name: string;
  refCode: string;
  price: number;
  internationalPrice?: number;
  compareAtPrice?: number;
  category: string;
  gender: string;
  badge: string;
  rating: number;
  reviewCount: number;
  fit: string;
  fabric: string;
  composition: string;
  care: string;
  isNew: boolean;
  /** Can be bought now: switched on in the admin and, when tracked, units left. */
  inStock: boolean;
  /** The admin's "on sale" switch, regardless of stock. */
  onSale: boolean;
  description: string;
  image: string;
  images: string[];
  hoverImage: string;
  leftShoulderImage?: string;
  rightShoulderImage?: string;
  gallery?: string[];
  colors: any[];
  sizes: string[];
  features: any[];
  /** Print-ready design files: [{ name, url, desc }] (downloadable in the admin). */
  printLayers: any[];
  /** Hidden from the shop (admin only); kept for old orders and links. */
  hidden: boolean;
  /** When false the product sells without limit and `stock` is empty. */
  trackStock: boolean;
  /** Units per colour/size, keyed by stockKey(color, size). */
  stock: Record<string, number>;
  /** Name and description in other languages; Azerbaijani is the main field. */
  translations?: Partial<Record<'en' | 'ru' | 'tr', { name?: string; description?: string; composition?: string; fit?: string; care?: string }>>;
  /** Set on storefront copies while a discount runs (see lib/db/catalog.ts). */
  campaign?: AppliedCampaign;
}

function num(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function rowToProduct(r: any): CatalogProduct {
  const extra = r.extra && typeof r.extra === 'object' ? r.extra : {};
  const colors = Array.isArray(r.colors) ? r.colors : [];
  const rowImages = Array.isArray(r.images) ? r.images : [];
  const image = extra.image || colors[0]?.image || rowImages[0] || DEFAULT_IMAGE;
  const sizes: string[] = Array.isArray(r.sizes) && r.sizes.length > 0 ? r.sizes : DEFAULT_SIZES;
  const trackStock = Boolean(r.track_stock);
  const stock: Record<string, number> = {};
  if (trackStock) {
    // Every colour/size on sale gets an entry; a missing row means none left.
    for (const c of colors.length > 0 ? colors : [{ name: '' }]) {
      for (const s of sizes) stock[stockKey(c.name || '', s)] = 0;
    }
    for (const row of Array.isArray(r.product_stock) ? r.product_stock : []) {
      stock[stockKey(row.color, row.size)] = Math.max(0, Number(row.quantity) || 0);
    }
  }
  const anyLeft = !trackStock || Object.values(stock).some((q) => q > 0);

  return {
    id: r.id,
    supaId: r.id,
    metaId: r.id,
    slug: r.slug,
    name: r.name,
    refCode: r.ref_code || r.slug,
    price: Number(r.price) || 0,
    internationalPrice: num(r.international_price),
    compareAtPrice: num(r.compare_at_price),
    category: r.category,
    gender: r.gender || 'unisex',
    badge: r.badge || '',
    rating: num(r.rating) ?? 5,
    reviewCount: num(r.review_count) ?? 0,
    fit: r.fit || 'Regular Fit',
    fabric: r.fabric || '',
    composition: r.composition || '',
    care: r.care || '',
    isNew: Boolean(r.is_new),
    inStock: r.in_stock !== false && anyLeft,
    onSale: r.in_stock !== false,
    description: r.long_description || '',
    image,
    images: rowImages.length > 0 ? rowImages : [image],
    hoverImage: extra.hoverImage || colors[0]?.hoverImage || '',
    leftShoulderImage: extra.leftShoulderImage || undefined,
    rightShoulderImage: extra.rightShoulderImage || undefined,
    gallery: Array.isArray(extra.gallery) ? extra.gallery : undefined,
    colors,
    sizes,
    features: Array.isArray(r.features) ? r.features : [],
    printLayers: Array.isArray(extra.printLayers) ? extra.printLayers : [],
    hidden: extra.hidden === true,
    trackStock,
    stock,
    translations: extra.translations && typeof extra.translations === 'object' ? extra.translations : undefined,
  };
}

export function slugify(input: string): string {
  const map: Record<string, string> = { ə: 'e', ı: 'i', ö: 'o', ü: 'u', ş: 's', ç: 'c', ğ: 'g' };
  const slug = String(input || '')
    .toLowerCase()
    .replace(/[əıöüşçğ]/g, (ch) => map[ch] || ch)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'mehsul';
}

export async function listProducts(client: SupabaseClient = db()): Promise<CatalogProduct[]> {
  const rows = unwrap(
    await client
      .from('products')
      .select('*, product_stock(*)')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }),
    'Məhsullar oxunmadı'
  );
  return (rows || []).map(rowToProduct);
}

async function findProductRow(idOrSlug: string): Promise<any | null> {
  if (!idOrSlug) return null;
  const column = isUuid(idOrSlug) ? 'id' : 'slug';
  const row = unwrap(
    await db().from('products').select('*, product_stock(*)').eq(column, idOrSlug).maybeSingle(),
    'Məhsul axtarılmadı'
  );
  return row || null;
}

export async function findProduct(idOrSlug: string): Promise<CatalogProduct | null> {
  const row = await findProductRow(idOrSlug);
  return row ? rowToProduct(row) : null;
}

async function uniqueSlug(base: string): Promise<string> {
  const rows = unwrap(
    await db().from('products').select('slug').like('slug', `${base}%`),
    'Slug yoxlanılmadı'
  );
  const taken = new Set((rows || []).map((r: any) => r.slug));
  if (!taken.has(base)) return base;
  for (let i = 2; i < 1000; i++) {
    if (!taken.has(`${base}-${i}`)) return `${base}-${i}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

/**
 * Creates or updates a product. An existing product is matched by its id
 * (or, for payloads that only carry a slug, by exact slug) — never by name.
 * Fields absent from `input` keep their stored value.
 */
export async function saveProduct(input: any): Promise<CatalogProduct> {
  if (!input || typeof input !== 'object') throw new Error('Məhsul məlumatı yanlışdır.');

  let existing: any | null = null;
  for (const candidate of [input.supaId, input.id, input.metaId]) {
    if (!existing && isUuid(candidate)) existing = await findProductRow(candidate);
  }
  const hasId = Boolean(input.id || input.supaId);
  if (!existing && hasId && input.slug) existing = await findProductRow(String(input.slug));

  const name = String(input.name ?? existing?.name ?? '').trim();
  if (!name) throw new Error('Məhsulun adı tələb olunur.');

  const price = num(input.price) ?? num(existing?.price);
  if (price === undefined || price < 0) throw new Error('Məhsulun qiyməti yanlışdır.');

  const row: Record<string, any> = { name, price, updated_at: new Date().toISOString() };

  const text = (key: string, column: string) => {
    if (input[key] !== undefined && input[key] !== null) row[column] = String(input[key]);
  };
  text('category', 'category');
  text('gender', 'gender');
  text('refCode', 'ref_code');
  text('description', 'long_description');
  text('badge', 'badge');
  text('fit', 'fit');
  text('fabric', 'fabric');
  text('composition', 'composition');
  text('care', 'care');

  const list = (key: string, column: string) => {
    if (Array.isArray(input[key])) row[column] = input[key];
  };
  list('sizes', 'sizes');
  list('colors', 'colors');
  list('images', 'images');
  list('features', 'features');

  if (input.inStock !== undefined) row.in_stock = Boolean(input.inStock);
  if (input.trackStock !== undefined) row.track_stock = Boolean(input.trackStock);
  if (input.isNew !== undefined) row.is_new = Boolean(input.isNew);
  if (num(input.rating) !== undefined) row.rating = num(input.rating);
  if (num(input.reviewCount) !== undefined) row.review_count = Math.round(num(input.reviewCount)!);
  if (num(input.sortOrder) !== undefined) row.sort_order = Math.round(num(input.sortOrder)!);

  // The admin form omits compareAtPrice to mean "no discount", so absence clears it.
  row.compare_at_price = num(input.compareAtPrice) ?? null;
  // International price: an explicit null / '' clears it, undefined keeps it.
  if ('internationalPrice' in input) row.international_price = num(input.internationalPrice) ?? null;

  const extra: Record<string, any> = { ...(existing?.extra || {}) };
  for (const key of ['image', 'hoverImage', 'leftShoulderImage', 'rightShoulderImage']) {
    if (typeof input[key] === 'string') {
      if (input[key]) extra[key] = input[key];
      else delete extra[key];
    }
  }
  if (Array.isArray(input.gallery)) extra.gallery = input.gallery;
  if (Array.isArray(input.printLayers)) {
    extra.printLayers = input.printLayers
      .filter((l: any) => l && typeof l.url === 'string' && /^(\/|https:\/\/)/.test(l.url))
      .slice(0, 30)
      .map((l: any) => ({
        name: String(l.name || '').replace(/[<>]/g, '').trim().slice(0, 80),
        url: String(l.url).trim(),
        desc: String(l.desc || '').replace(/[<>]/g, '').trim().slice(0, 200),
      }));
  }
  if (typeof input.hidden === 'boolean') {
    if (input.hidden) extra.hidden = true;
    else delete extra.hidden;
  }
  if (input.translations && typeof input.translations === 'object') {
    const t: Record<string, Record<string, string>> = {};
    const limits: Record<string, number> = { name: 160, description: 5000, composition: 300, fit: 120, care: 300 };
    for (const lang of ['en', 'ru', 'tr']) {
      const src = (input.translations as any)[lang] || {};
      const entry: Record<string, string> = {};
      for (const [field, max] of Object.entries(limits)) {
        const v = String(src[field] || '').replace(/[<>]/g, '').trim().slice(0, max);
        if (v) entry[field] = v;
      }
      if (Object.keys(entry).length) t[lang] = entry;
    }
    extra.translations = t;
  }
  row.extra = extra;

  if (existing) {
    unwrap(await db().from('products').update(row).eq('id', existing.id), 'Məhsul yenilənmədi');
    await writeStock(existing.id, input.stock);
    return (await findProduct(existing.id))!;
  }

  row.slug = await uniqueSlug(slugify(name));
  if (!row.category) row.category = 'koynek';
  if (!row.gender) row.gender = 'unisex';
  if (!row.ref_code) row.ref_code = row.slug;

  const saved = unwrap(
    await db().from('products').insert(row).select('id').single(),
    'Məhsul əlavə olunmadı'
  ) as { id: string };
  await writeStock(saved.id, input.stock);
  return (await findProduct(saved.id))!;
}

/**
 * Replaces the stored counts with the ones the admin entered, if any were sent.
 * Only the stock editor sends `stock`; other saves (e.g. the "on sale" switch) leave counts alone.
 */
async function writeStock(productId: string, stock: unknown): Promise<void> {
  if (!stock || typeof stock !== 'object' || Array.isArray(stock)) return;
  const rows = Object.entries(stock as Record<string, unknown>)
    .map(([key, value]) => {
      const cut = key.lastIndexOf('|');
      return {
        product_id: productId,
        color: cut >= 0 ? key.slice(0, cut) : '',
        size: cut >= 0 ? key.slice(cut + 1) : key,
        quantity: Math.min(100000, Math.max(0, Math.floor(Number(value) || 0))),
        updated_at: new Date().toISOString(),
      };
    })
    .filter((r) => r.size);

  unwrap(await db().from('product_stock').delete().eq('product_id', productId), 'Stok yenilənmədi');
  if (rows.length > 0) {
    unwrap(await db().from('product_stock').insert(rows), 'Stok yenilənmədi');
  }
}

export async function deleteProduct(idOrSlug: string): Promise<boolean> {
  const existing = await findProductRow(idOrSlug);
  if (!existing) return false;
  unwrap(await db().from('products').delete().eq('id', existing.id), 'Məhsul silinmədi');
  return true;
}

/**
 * Authoritative unit price for a cart line (same rule as the storefront, lib/pricing.ts).
 * `foreign` is decided by the delivery country: the Azerbaijan price is only for
 * deliveries in Azerbaijan. Whatever price the browser sent is ignored.
 */
export function resolveUnitPrice(
  product: Pick<CatalogProduct, 'price' | 'internationalPrice'>,
  currency: 'AZN' | 'USD',
  opts: { foreign: boolean; markupPct: number }
): number {
  return unitPriceFor(product, { foreign: opts.foreign, currency, markupPct: opts.markupPct });
}
