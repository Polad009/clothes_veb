import type { SupabaseClient } from '@supabase/supabase-js';
import { db, isUuid, unwrap } from './client';

const DEFAULT_IMAGE = '/images/hero/black-tee.jpg';
const DEFAULT_SIZES = ['S', 'M', 'L', 'XL'];
const USD_PER_AZN = 1 / 1.7;

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
  inStock: boolean;
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
  printLayers: any[];
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
    inStock: r.in_stock !== false,
    description: r.long_description || '',
    image,
    images: rowImages.length > 0 ? rowImages : [image],
    hoverImage: extra.hoverImage || colors[0]?.hoverImage || '',
    leftShoulderImage: extra.leftShoulderImage || undefined,
    rightShoulderImage: extra.rightShoulderImage || undefined,
    gallery: Array.isArray(extra.gallery) ? extra.gallery : undefined,
    colors,
    sizes: Array.isArray(r.sizes) && r.sizes.length > 0 ? r.sizes : DEFAULT_SIZES,
    features: Array.isArray(r.features) ? r.features : [],
    printLayers: Array.isArray(extra.printLayers) ? extra.printLayers : [],
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
      .select('*')
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
    await db().from('products').select('*').eq(column, idOrSlug).maybeSingle(),
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
  if (Array.isArray(input.printLayers)) extra.printLayers = input.printLayers;
  row.extra = extra;

  if (existing) {
    const saved = unwrap(
      await db().from('products').update(row).eq('id', existing.id).select('*').single(),
      'Məhsul yenilənmədi'
    );
    return rowToProduct(saved);
  }

  row.slug = await uniqueSlug(slugify(name));
  if (!row.category) row.category = 'koynek';
  if (!row.gender) row.gender = 'unisex';
  if (!row.ref_code) row.ref_code = row.slug;

  const saved = unwrap(
    await db().from('products').insert(row).select('*').single(),
    'Məhsul əlavə olunmadı'
  );
  return rowToProduct(saved);
}

export async function deleteProduct(idOrSlug: string): Promise<boolean> {
  const existing = await findProductRow(idOrSlug);
  if (!existing) return false;
  unwrap(await db().from('products').delete().eq('id', existing.id), 'Məhsul silinmədi');
  return true;
}

/**
 * Authoritative unit price for a cart line.
 *
 * Mirrors the storefront rule in context/CurrencyContext.tsx: shoppers in
 * Azerbaijan pay the AZN price (converted when they view USD); shoppers abroad
 * pay the international USD price (converted when they view AZN). The price the
 * client sent is only accepted when it equals one of those catalogue prices.
 */
export function resolveUnitPrice(
  product: Pick<CatalogProduct, 'price' | 'internationalPrice'>,
  currency: 'AZN' | 'USD',
  clientPrice: unknown
): number {
  const azn = Number(product.price) || 0;
  const intlUsd = product.internationalPrice ?? azn * USD_PER_AZN;

  const domestic = currency === 'USD' ? azn * USD_PER_AZN : azn;
  const international = currency === 'USD' ? intlUsd : intlUsd * 1.7;

  const claimed = Number(clientPrice);
  if (Number.isFinite(claimed)) {
    for (const allowed of [domestic, international]) {
      if (Math.abs(claimed - allowed) < 0.011) return Math.round(allowed * 100) / 100;
    }
  }
  const fallback = currency === 'USD' ? international : domestic;
  return Math.round(fallback * 100) / 100;
}
