import { db, isUuid, unwrap } from './client';
import type { StoreOrder, PodOrder } from './types';

const ORDER_SELECT = '*, order_items(*)';

/** Thrown when an order asks for more units of a colour/size than are left. */
export class OutOfStockError extends Error {
  constructor(public item: string, public color: string, public size: string, public available: number) {
    super(
      available > 0
        ? `"${item}" (${[color, size].filter(Boolean).join(' / ')}) üçün stokda yalnız ${available} ədəd qalıb.`
        : `"${item}" (${[color, size].filter(Boolean).join(' / ')}) stokda qalmayıb.`
    );
    this.name = 'OutOfStockError';
  }
}

function toStockError(message: string): OutOfStockError | null {
  const m = /OUT_OF_STOCK:(.*)\|(.*)\|(.*)\|(\d+)/.exec(message || '');
  return m ? new OutOfStockError(m[1], m[2], m[3], Number(m[4])) : null;
}

async function reserveStock(orderUuid: string): Promise<void> {
  const { error } = await db().rpc('reserve_order_stock', { p_order_id: orderUuid });
  if (error) throw toStockError(error.message) || new Error(`Stok yoxlanılmadı: ${error.message}`);
}

async function releaseStock(orderUuid: string): Promise<void> {
  const { error } = await db().rpc('release_order_stock', { p_order_id: orderUuid });
  if (error) throw new Error(`Stok geri qaytarılmadı: ${error.message}`);
}

/** An order keeps its units out of stock unless it is cancelled or its payment failed. */
function holdsStock(row: { order_status?: string | null; payment_status?: string | null }): boolean {
  const cancelled = String(row.order_status || '').toLowerCase().includes('ləğv');
  const failed = String(row.payment_status || '').toLowerCase() === 'failed';
  return !cancelled && !failed;
}

function money(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Characters that are safe inside a PostgREST filter value. */
function safeCode(value: string): string {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 60);
}

export function rowToOrder(r: any): StoreOrder {
  const items = (r.order_items || [])
    .slice()
    .sort((a: any, b: any) => String(a.created_at).localeCompare(String(b.created_at)))
    .map((it: any) => ({
      productId: it.product_id || '',
      name: it.item_name,
      size: it.size || '',
      color: it.color || '',
      price: money(it.unit_price),
      quantity: it.quantity || 1,
      isCustom: Boolean(it.is_custom),
      customData: it.custom_data || undefined,
    }));

  const total = money(r.total_amount);
  const shipping = money(r.shipping_amount);
  const discount = money(r.discount_amount);
  const country = r.delivery_country || 'Azərbaycan';

  return {
    id: r.order_number || String(r.id),
    trackingCode: r.tracking_code || undefined,
    userId: r.user_id || undefined,
    source: 'Supabase',
    date: r.created_at,
    customer: {
      fullName: r.customer_name || 'Müştəri',
      phone: r.customer_phone || '-',
      email: r.customer_email || '',
      address: r.delivery_address || '-',
      addressLine2: r.delivery_address_line2 || undefined,
      city: r.delivery_city || '',
      stateOrRegion: r.delivery_state || undefined,
      postalCode: r.delivery_postal_code || undefined,
      country,
      countryCode: r.delivery_country_code || undefined,
    },
    items,
    paymentMethod: r.payment_method || 'Kart',
    paymentStatus: r.payment_status || 'pending',
    orderStatus: r.order_status || 'Yeni Sifariş',
    subtotal: r.subtotal != null ? money(r.subtotal) : Math.max(0, total - shipping + discount),
    shipping,
    shippingMethod: r.shipping_method || undefined,
    shippingMethodLabel: r.shipping_method_label || undefined,
    estimatedDelivery: r.estimated_delivery || undefined,
    discount,
    total,
    isTest: Boolean(r.is_test) || r.payment_status === 'test_paid',
    provider: r.provider || undefined,
    providerPaymentId: r.provider_payment_id || undefined,
    promoCode: r.promo_code || undefined,
    currency: r.currency || 'AZN',
  };
}

export async function listOrders(filter?: 'test' | 'real' | 'all' | null): Promise<StoreOrder[]> {
  const rows = unwrap(
    await db().from('orders').select(ORDER_SELECT).order('created_at', { ascending: false }),
    'Sifarişlər oxunmadı'
  );
  const orders = (rows || []).map(rowToOrder);
  if (filter === 'test') return orders.filter((o) => o.isTest);
  if (filter === 'real') return orders.filter((o) => !o.isTest);
  return orders;
}

/** Finds one order by its public number, its tracking code or its database id. */
async function findOrderRow(idOrCode: string): Promise<any | null> {
  const raw = String(idOrCode || '').trim();
  if (!raw) return null;

  if (isUuid(raw)) {
    const row = unwrap(
      await db().from('orders').select(ORDER_SELECT).eq('id', raw).maybeSingle(),
      'Sifariş axtarılmadı'
    );
    return row || null;
  }

  for (const column of ['order_number', 'tracking_code']) {
    const rows = unwrap(
      await db().from('orders').select(ORDER_SELECT).eq(column, raw).order('created_at', { ascending: false }).limit(1),
      'Sifariş axtarılmadı'
    );
    if (rows && rows.length > 0) return rows[0];
  }
  return null;
}

export async function findOrder(idOrCode: string): Promise<StoreOrder | null> {
  const row = await findOrderRow(idOrCode);
  return row ? rowToOrder(row) : null;
}

function randomDigits(length: number): string {
  let out = '';
  for (let i = 0; i < length; i++) out += Math.floor(Math.random() * 10);
  return out.replace(/^0/, '1');
}

/**
 * Stores a new order with its items and returns it as saved.
 * The public order number is generated here (unique in the database);
 * the order is never considered placed unless this resolves.
 */
export async function createOrder(order: Omit<StoreOrder, 'id' | 'trackingCode' | 'date'>): Promise<StoreOrder> {
  const base: Record<string, any> = {
    user_id: isUuid(order.userId) ? order.userId : null,
    customer_name: order.customer.fullName,
    customer_phone: order.customer.phone,
    customer_email: order.customer.email || null,
    delivery_address: order.customer.address,
    delivery_address_line2: order.customer.addressLine2 || null,
    delivery_city: order.customer.city || '',
    delivery_state: order.customer.stateOrRegion || null,
    delivery_postal_code: order.customer.postalCode || null,
    delivery_country: order.customer.country || 'Azərbaycan',
    delivery_country_code: order.customer.countryCode || null,
    subtotal: money(order.subtotal),
    discount_amount: money(order.discount),
    shipping_amount: money(order.shipping),
    shipping_method: order.shippingMethod || null,
    shipping_method_label: order.shippingMethodLabel || null,
    estimated_delivery: order.estimatedDelivery || null,
    total_amount: money(order.total),
    currency: order.currency || 'AZN',
    payment_method: order.paymentMethod,
    payment_status: order.paymentStatus,
    order_status: order.orderStatus || 'Yeni Sifariş',
    is_test: Boolean(order.isTest),
    promo_code: order.promoCode || null,
    provider: order.provider || null,
    provider_payment_id: order.providerPaymentId || null,
  };

  let saved: any = null;
  let lastError = '';
  for (let attempt = 0; attempt < 6 && !saved; attempt++) {
    const digits = randomDigits(6);
    const res = await db()
      .from('orders')
      .insert({ ...base, order_number: `HW-${digits}`, tracking_code: `HW-TRK-${digits}` })
      .select('*')
      .single();

    if (!res.error) {
      saved = res.data;
    } else if (res.error.code === '23503' && base.user_id) {
      // The account has no profile row: keep the order, drop the link.
      base.user_id = null;
      lastError = res.error.message;
    } else if (res.error.code === '23505') {
      lastError = res.error.message; // order number collision: try another one
    } else {
      throw new Error(`Sifariş yadda saxlanılmadı: ${res.error.message}`);
    }
  }
  if (!saved) throw new Error(`Sifariş yadda saxlanılmadı: ${lastError}`);

  const itemRows = (order.items || []).map((i) => ({
    order_id: saved.id,
    product_id: i.productId ? String(i.productId) : null,
    item_name: String(i.name || 'Məhsul'),
    color: String(i.color || ''),
    size: String(i.size || ''),
    quantity: Number(i.quantity) || 1,
    unit_price: money(i.price),
    total_price: Math.round(money(i.price) * (Number(i.quantity) || 1) * 100) / 100,
    is_custom: Boolean(i.isCustom),
    custom_data: i.isCustom ? i.customData || null : null,
  }));

  if (itemRows.length > 0) {
    const itemsRes = await db().from('order_items').insert(itemRows).select('*');
    if (itemsRes.error) {
      // An order without its items is useless: undo it and report the failure.
      await db().from('orders').delete().eq('id', saved.id);
      throw new Error(`Sifariş məhsulları yadda saxlanılmadı: ${itemsRes.error.message}`);
    }
    saved.order_items = itemsRes.data;
  }

  // Take the units out of stock; if anything ran out, the order is not placed.
  try {
    await reserveStock(saved.id);
  } catch (stockError) {
    await db().from('order_items').delete().eq('order_id', saved.id);
    await db().from('orders').delete().eq('id', saved.id);
    throw stockError;
  }

  return rowToOrder(saved);
}

export async function updateOrder(
  idOrCode: string,
  patch: { orderStatus?: string; paymentStatus?: string; providerPaymentId?: string }
): Promise<StoreOrder | null> {
  const row = await findOrderRow(idOrCode);
  if (!row) return null;

  const update: Record<string, any> = { updated_at: new Date().toISOString() };
  if (patch.orderStatus) update.order_status = patch.orderStatus;
  if (patch.paymentStatus) update.payment_status = patch.paymentStatus;
  if (patch.providerPaymentId) update.provider_payment_id = patch.providerPaymentId;

  const heldBefore = holdsStock(row);
  const holdsAfter = holdsStock({
    order_status: update.order_status ?? row.order_status,
    payment_status: update.payment_status ?? row.payment_status,
  });
  // Reopening a cancelled order needs its units back first; fails if they are gone.
  if (!heldBefore && holdsAfter) await reserveStock(row.id);

  const saved = unwrap(
    await db().from('orders').update(update).eq('id', row.id).select(ORDER_SELECT).single(),
    'Sifariş yenilənmədi'
  );
  if (heldBefore && !holdsAfter) await releaseStock(row.id);
  return rowToOrder(saved);
}

async function deleteOrderRows(rows: any[]): Promise<number> {
  if (rows.length === 0) return 0;
  const ids = rows.map((r) => r.id);
  const numbers = rows.map((r) => r.order_number).filter(Boolean);

  // Deleted orders give their units back
  for (const id of ids) await releaseStock(id);

  unwrap(await db().from('order_items').delete().in('order_id', ids), 'Sifariş məhsulları silinmədi');
  if (numbers.length > 0) {
    unwrap(await db().from('pod_orders').delete().in('order_id', numbers), 'Öz dizayn sifarişləri silinmədi');
  }
  unwrap(await db().from('orders').delete().in('id', ids), 'Sifariş silinmədi');
  return ids.length;
}

export async function deleteOrder(idOrCode: string): Promise<boolean> {
  const row = await findOrderRow(idOrCode);
  if (!row) return false;
  await deleteOrderRows([row]);
  return true;
}

export async function deleteTestOrders(): Promise<number> {
  const rows = unwrap(
    await db().from('orders').select('id, order_number').or('is_test.eq.true,payment_status.eq.test_paid'),
    'Test sifarişləri oxunmadı'
  );
  return deleteOrderRows(rows || []);
}

export async function deleteAllOrders(): Promise<number> {
  const rows = unwrap(await db().from('orders').select('id, order_number'), 'Sifarişlər oxunmadı');
  const count = await deleteOrderRows(rows || []);
  unwrap(await db().from('pod_orders').delete().neq('id', ''), 'Öz dizayn sifarişləri silinmədi');
  return count;
}

/** Same phone and same total within the last few seconds = a double submit. */
export async function findRecentDuplicate(phone: string, total: number, withinMs = 20000): Promise<StoreOrder | null> {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length < 7) return null;
  const since = new Date(Date.now() - withinMs).toISOString();
  const rows = unwrap(
    await db()
      .from('orders')
      .select(ORDER_SELECT)
      .eq('customer_phone_digits', digits)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(5),
    'Təkrar sifariş yoxlanılmadı'
  );
  const match = (rows || []).find((r: any) => Math.abs(money(r.total_amount) - total) < 0.01);
  return match ? rowToOrder(match) : null;
}

export async function searchOrders(query: { email?: string; phoneDigits?: string; code?: string }): Promise<StoreOrder[]> {
  let q = db().from('orders').select(ORDER_SELECT);

  if (query.email) {
    // ilike without wildcards = case-insensitive equality; escape LIKE metacharacters
    q = q.ilike('customer_email', query.email.trim().replace(/([\\%_])/g, '\\$1'));
  } else if (query.phoneDigits) {
    const digits = query.phoneDigits.replace(/\D/g, '');
    if (digits.length < 7) return [];
    q = q.like('customer_phone_digits', `%${digits.slice(-9)}`);
  } else if (query.code) {
    const raw = query.code.trim();
    if (isUuid(raw)) {
      q = q.eq('id', raw);
    } else {
      // Exact match only — never a substring — so order tracking cannot be used
      // to enumerate other customers' orders from a short partial code.
      const code = safeCode(raw);
      const digits = code.replace(/[^0-9]/g, '');
      const candidates = new Set<string>();
      if (/^[A-Z]{2,}-/.test(code) && code.length >= 7) candidates.add(code); // full code, e.g. HW-123456 / HW-TRK-123456
      if (digits.length >= 6) {
        const d = digits.slice(-6);
        candidates.add(`HW-${d}`);
        candidates.add(`HW-TRK-${d}`);
        candidates.add(`VTX-ORD-${d}`); // legacy order numbers
        candidates.add(`AZ-EXP-${d}`);  // legacy tracking codes
      }
      if (candidates.size === 0) return [];
      const list = Array.from(candidates); // values are already restricted to [A-Z0-9-]
      q = q.or([...list.map((v) => `order_number.eq.${v}`), ...list.map((v) => `tracking_code.eq.${v}`)].join(','));
    }
  } else {
    return [];
  }

  const rows = unwrap(await q.order('created_at', { ascending: false }).limit(50), 'Sifariş axtarılmadı');
  return (rows || []).map(rowToOrder);
}

// ─── Custom print (POD) orders ───────────────────────────────────────────────

export function rowToPodOrder(r: any): PodOrder {
  return {
    id: r.id,
    orderId: r.order_id || '',
    customerName: r.customer_name || '',
    customerPhone: r.customer_phone || '',
    customerEmail: r.customer_email || '',
    garmentType: r.garment_type || '',
    garmentColor: r.garment_color || '',
    size: r.size || '',
    price: money(r.price),
    frontDesign: r.front_design || {},
    backDesign: r.back_design || {},
    status: r.status || 'Pending Print',
    createdAt: r.created_at,
    originalImage: r.original_image || '',
    placement: r.placement || '',
    customerNote: r.customer_note || '',
    placementData: r.placement_data || null,
    previewImage: r.preview_image || '',
    customData: r.custom_data || null,
  };
}

export async function listPodOrders(): Promise<PodOrder[]> {
  const rows = unwrap(
    await db().from('pod_orders').select('*').order('created_at', { ascending: false }),
    'Öz dizayn sifarişləri oxunmadı'
  );
  return (rows || []).map(rowToPodOrder);
}

export async function createPodOrder(pod: Omit<PodOrder, 'id' | 'createdAt'>): Promise<PodOrder> {
  const row = {
    order_id: pod.orderId || null,
    customer_name: pod.customerName || '',
    customer_phone: pod.customerPhone || '',
    customer_email: pod.customerEmail || '',
    garment_type: pod.garmentType || '',
    garment_color: pod.garmentColor || '',
    size: pod.size || '',
    price: money(pod.price),
    placement: pod.placement || '',
    customer_note: pod.customerNote || '',
    original_image: pod.originalImage || '',
    preview_image: pod.previewImage || '',
    front_design: pod.frontDesign || {},
    back_design: pod.backDesign || {},
    placement_data: pod.placementData ?? null,
    custom_data: pod.customData ?? null,
    status: pod.status || 'Pending Print',
  };

  let lastError = '';
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await db().from('pod_orders').insert({ ...row, id: `POD-${randomDigits(6)}` }).select('*').single();
    if (!res.error) return rowToPodOrder(res.data);
    lastError = res.error.message;
    if (res.error.code !== '23505') break;
  }
  throw new Error(`Öz dizayn sifarişi yadda saxlanılmadı: ${lastError}`);
}

export async function updatePodOrderStatus(id: string, status: string): Promise<PodOrder | null> {
  const rows = unwrap(
    await db()
      .from('pod_orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*'),
    'Öz dizayn sifarişi yenilənmədi'
  );
  return rows && rows.length > 0 ? rowToPodOrder(rows[0]) : null;
}

export async function findPodOrderByOrderId(orderId: string): Promise<PodOrder | null> {
  if (!orderId) return null;
  const rows = unwrap(
    await db().from('pod_orders').select('*').eq('order_id', orderId).limit(1),
    'Öz dizayn sifarişi axtarılmadı'
  );
  return rows && rows.length > 0 ? rowToPodOrder(rows[0]) : null;
}

export async function searchPodOrders(query: { phoneDigits?: string; code?: string }): Promise<PodOrder[]> {
  if (query.code) {
    const code = safeCode(query.code);
    if (code.length < 6) return [];
    const rows = unwrap(
      // exact (case-insensitive) id match, never a substring
      await db().from('pod_orders').select('*').ilike('id', code).order('created_at', { ascending: false }).limit(10),
      'Öz dizayn sifarişi axtarılmadı'
    );
    return (rows || []).map(rowToPodOrder);
  }

  if (query.phoneDigits) {
    const digits = query.phoneDigits.replace(/\D/g, '');
    if (digits.length < 7) return [];
    const tail = digits.slice(-9);
    // Match on the light columns first: the design payloads can be large.
    const phones = unwrap(
      await db().from('pod_orders').select('id, customer_phone').order('created_at', { ascending: false }),
      'Öz dizayn sifarişi axtarılmadı'
    );
    const ids = (phones || [])
      .filter((p: any) => String(p.customer_phone || '').replace(/\D/g, '').endsWith(tail))
      .slice(0, 10)
      .map((p: any) => p.id);
    if (ids.length === 0) return [];
    const rows = unwrap(
      await db().from('pod_orders').select('*').in('id', ids).order('created_at', { ascending: false }),
      'Öz dizayn sifarişi axtarılmadı'
    );
    return (rows || []).map(rowToPodOrder);
  }
  return [];
}
