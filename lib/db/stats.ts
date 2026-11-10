import { db, unwrap } from './client';
import { listOrders } from './orders';
import { countUnreadThreads } from './chat';
import type { StoreOrder } from './types';

const AZN_PER_USD = 1.7;

function inAzn(order: StoreOrder): number {
  return order.currency === 'USD' ? order.total * AZN_PER_USD : order.total;
}

function isCancelled(order: StoreOrder): boolean {
  return (order.orderStatus || '').toLowerCase().includes('ləğv');
}

function isPaid(order: StoreOrder): boolean {
  return (order.paymentStatus || '').toLowerCase() === 'paid';
}

/** Work waiting for the shop owner; shown as badges in the navigation. */
export async function countOpenWork(): Promise<{ orders: number; pod: number; chat: number }> {
  const [orders, pod, chat] = await Promise.all([
    db().from('orders').select('id', { count: 'exact', head: true }).eq('order_status', 'Yeni Sifariş').eq('is_test', false),
    db().from('pod_orders').select('id', { count: 'exact', head: true }).eq('status', 'Pending Print'),
    countUnreadThreads().catch(() => 0),
  ]);
  return { orders: orders.count || 0, pod: pod.count || 0, chat };
}

export interface DashboardData {
  today: { orders: number; revenue: number };
  last30: { orders: number; revenue: number; average: number };
  newOrders: number;
  awaitingPayment: number;
  testOrders: number;
  products: { total: number; outOfStock: number };
  daily: Array<{ date: string; revenue: number; orders: number }>;
  recent: StoreOrder[];
}

function dayKey(d: Date): string {
  // Shop days follow Baku time (UTC+4, no DST)
  return new Date(d.getTime() + 4 * 3600 * 1000).toISOString().slice(0, 10);
}

/**
 * Sales figures count real (non-test) orders that are paid and not cancelled.
 * USD orders are converted to AZN at the storefront's fixed rate.
 */
export async function getDashboard(): Promise<DashboardData> {
  const [orders, productRows] = await Promise.all([
    listOrders(),
    db().from('products').select('in_stock').then((res) => unwrap(res, 'Məhsullar oxunmadı')),
  ]);

  const real = orders.filter((o) => !o.isTest);
  const sold = real.filter((o) => isPaid(o) && !isCancelled(o));

  const now = new Date();
  const todayKey = dayKey(now);
  const days: string[] = [];
  for (let i = 13; i >= 0; i--) days.push(dayKey(new Date(now.getTime() - i * 86400000)));
  const since30 = now.getTime() - 30 * 86400000;

  const perDay = new Map(days.map((d) => [d, { date: d, revenue: 0, orders: 0 }]));
  let todayOrders = 0;
  let todayRevenue = 0;
  let orders30 = 0;
  let revenue30 = 0;

  for (const o of sold) {
    const created = new Date(o.date);
    const key = dayKey(created);
    const amount = inAzn(o);
    const bucket = perDay.get(key);
    if (bucket) {
      bucket.revenue += amount;
      bucket.orders += 1;
    }
    if (key === todayKey) {
      todayOrders += 1;
      todayRevenue += amount;
    }
    if (created.getTime() >= since30) {
      orders30 += 1;
      revenue30 += amount;
    }
  }

  const round = (n: number) => Math.round(n * 100) / 100;

  return {
    today: { orders: todayOrders, revenue: round(todayRevenue) },
    last30: { orders: orders30, revenue: round(revenue30), average: orders30 ? round(revenue30 / orders30) : 0 },
    newOrders: real.filter((o) => o.orderStatus === 'Yeni Sifariş').length,
    awaitingPayment: real.filter((o) => (o.paymentStatus || '').toLowerCase().startsWith('pending') && !isCancelled(o)).length,
    testOrders: orders.length - real.length,
    products: {
      total: (productRows || []).length,
      outOfStock: (productRows || []).filter((p: any) => p.in_stock === false).length,
    },
    daily: days.map((d) => {
      const b = perDay.get(d)!;
      return { ...b, revenue: round(b.revenue) };
    }),
    recent: orders.slice(0, 8),
  };
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  createdAt: string;
  orders: number;
  spent: number;
  lastOrderAt: string | null;
}

/** Registered accounts (auth users + profiles) with their real order totals. */
export async function listCustomers(): Promise<Customer[]> {
  const [profiles, orders, users] = await Promise.all([
    db().from('profiles').select('*').then((res) => unwrap(res, 'Profillər oxunmadı')),
    listOrders('real'),
    db().auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);
  if (users.error) throw new Error(`İstifadəçilər oxunmadı: ${users.error.message}`);

  const profileById = new Map((profiles || []).map((p: any) => [p.id, p]));

  return users.data.users
    .map((u) => {
      const p: any = profileById.get(u.id) || {};
      const email = (u.email || '').toLowerCase();
      const mine = orders.filter(
        (o) => o.userId === u.id || (email && (o.customer.email || '').toLowerCase() === email)
      );
      const counted = mine.filter((o) => isPaid(o) && !isCancelled(o));
      return {
        id: u.id,
        name: p.full_name || (u.user_metadata as any)?.full_name || (u.user_metadata as any)?.name || '',
        email: u.email || '',
        phone: p.phone || u.phone || '',
        city: p.city || '',
        address: p.address || '',
        createdAt: u.created_at,
        orders: mine.length,
        spent: Math.round(counted.reduce((sum, o) => sum + inAzn(o), 0) * 100) / 100,
        lastOrderAt: mine[0]?.date || null,
      };
    })
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export interface AdminPulse {
  orders: number;
  pod: number;
  chat: number;
  latestOrder: { id: string; name: string; total: number; currency: string; at: string; isTest: boolean } | null;
}

/** Light status check the admin panel polls to notice new orders, print jobs and chats. */
export async function getPulse(): Promise<AdminPulse> {
  const [counts, latest] = await Promise.all([
    countOpenWork(),
    db()
      .from('orders')
      .select('order_number, id, customer_name, total_amount, currency, created_at, is_test')
      .order('created_at', { ascending: false })
      .limit(1)
      .then((res) => unwrap(res, 'Sifariş oxunmadı')),
  ]);
  const o = latest?.[0];
  return {
    ...counts,
    latestOrder: o
      ? {
          id: o.order_number || String(o.id),
          name: o.customer_name || 'Müştəri',
          total: Number(o.total_amount) || 0,
          currency: o.currency || 'AZN',
          at: o.created_at,
          isTest: Boolean(o.is_test),
        }
      : null,
  };
}
