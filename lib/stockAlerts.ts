// "Notify me when it's back in stock".
// A customer leaves an e-mail on a sold-out colour/size; when the admin restocks it
// (or a cancelled order puts units back), the customer gets one e-mail with a direct link.
// Table: stock_alerts (server-only, RLS on).

import { db } from '@/lib/db/client';
import { findProduct } from '@/lib/db/products';
import { availableQty } from '@/lib/stock';
import { sendBackInStockEmail } from '@/lib/email/emailService';

const EMAIL_RE = /^[^\s@<>]{1,64}@[^\s@<>]{1,190}\.[A-Za-z]{2,24}$/;
const LANGS = ['az', 'en', 'ru', 'tr'];

const clean = (v: unknown, max: number) => String(v ?? '').replace(/[<>]/g, '').trim().slice(0, max);

/** Is this colour/size of the product available right now? */
function isAvailable(product: any, color: string, size: string): boolean {
  if (!product || product.hidden || product.inStock === false) return false;
  const left = availableQty(product, color, size);
  return left === null || left > 0; // null = stock not tracked
}

export async function addStockAlert(input: {
  productId: unknown;
  color: unknown;
  size: unknown;
  email: unknown;
  language: unknown;
}): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const email = clean(input.email, 254).toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'invalid_email', status: 400 };
  const productId = clean(input.productId, 80);
  const color = clean(input.color, 80);
  const size = clean(input.size, 40);
  const language = LANGS.includes(String(input.language)) ? String(input.language) : 'az';

  const product = await findProduct(productId);
  if (!product) return { ok: false, error: 'not_found', status: 404 };
  const sizes: string[] = Array.isArray((product as any).sizes) ? (product as any).sizes : [];
  if (size && sizes.length && !sizes.includes(size)) return { ok: false, error: 'bad_size', status: 400 };
  // only for things that really are sold out
  if (isAvailable(product, color, size)) return { ok: false, error: 'in_stock', status: 409 };

  const { error } = await db()
    .from('stock_alerts')
    .insert({ product_id: (product as any).supaId || (product as any).id, color, size, email, language });
  // 23505 = already waiting for this variant: treat as success
  if (error && error.code !== '23505') throw new Error(`Stok xəbərdarlığı yazılmadı: ${error.message}`);
  return { ok: true };
}

/** Waiting customers per colour/size, for the admin product page. */
export async function pendingAlertCounts(productId: string): Promise<Array<{ color: string; size: string; count: number }>> {
  const { data, error } = await db()
    .from('stock_alerts')
    .select('color, size')
    .eq('product_id', productId)
    .is('notified_at', null);
  if (error) return [];
  const map = new Map<string, { color: string; size: string; count: number }>();
  for (const r of data || []) {
    const key = `${r.color}|${r.size}`;
    const hit = map.get(key) || { color: r.color, size: r.size, count: 0 };
    hit.count += 1;
    map.set(key, hit);
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

/**
 * Sends the back-in-stock e-mails for everything that is available again.
 * `productId` limits it to one product (after an admin save); without it every waiting
 * request is checked (after an order is cancelled and its units come back).
 * Never throws: a failure here must not break the admin save.
 */
export async function notifyBackInStock(productId?: string): Promise<number> {
  try {
    let q = db().from('stock_alerts').select('id, product_id, color, size, email, language').is('notified_at', null).limit(500);
    if (productId) q = q.eq('product_id', productId);
    const { data: alerts, error } = await q;
    if (error || !alerts?.length) return 0;

    const products = new Map<string, any>();
    let sent = 0;
    for (const a of alerts) {
      if (!products.has(a.product_id)) products.set(a.product_id, await findProduct(a.product_id).catch(() => null));
      const product = products.get(a.product_id);
      if (!product || !isAvailable(product, a.color, a.size)) continue;

      const ok = await sendBackInStockEmail({
        to: a.email,
        language: a.language,
        product,
        color: a.color,
        size: a.size,
      });
      if (ok) {
        await db().from('stock_alerts').update({ notified_at: new Date().toISOString() }).eq('id', a.id);
        sent += 1;
      }
    }
    return sent;
  } catch (e) {
    console.warn('[StockAlerts] notify failed:', e);
    return 0;
  }
}
