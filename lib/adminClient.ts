/** Browser-side helper for the admin API. Throws an Error with a readable message. */
export async function adminFetch<T = any>(
  path: string,
  options: { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; body?: unknown; form?: FormData } = {}
): Promise<T> {
  const init: RequestInit = { method: options.method || (options.body || options.form ? 'POST' : 'GET'), cache: 'no-store' };
  if (options.form) {
    init.body = options.form;
  } else if (options.body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(options.body);
  }

  let res: Response;
  try {
    res = await fetch(path, init);
  } catch {
    throw new Error('Serverə qoşulmaq alınmadı. İnternet bağlantınızı yoxlayın.');
  }

  const data = await res.json().catch(() => null);
  if (res.status === 401) {
    throw new Error('Sessiyanın vaxtı bitib. Giriş linkinizlə yenidən daxil olun.');
  }
  if (!res.ok || (data && data.success === false)) {
    throw new Error(data?.error || data?.message || `Xəta baş verdi (${res.status})`);
  }
  return data as T;
}

export function formatMoney(amount: number | undefined | null, currency: string = 'AZN'): string {
  const value = (Number(amount) || 0).toFixed(2);
  return currency === 'USD' ? `$${value}` : `${value} ₼`;
}

export function formatDate(iso: string | undefined | null, withTime = true): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
  return withTime ? `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}` : date;
}

export const ORDER_STATUSES = ['Yeni Sifariş', 'Təsdiqləndi', 'Kuryerdədir', 'Çatdırıldı', 'Ləğv edildi'] as const;

export const POD_STATUSES: Array<{ value: string; label: string }> = [
  { value: 'Pending Print', label: 'Gözləmədə' },
  { value: 'In Production', label: 'Çapdadır' },
  { value: 'Printed', label: 'Çap olundu' },
  { value: 'Shipped', label: 'Göndərildi' },
];

/** Category choices for admin selects; keeps an unknown current value selectable. */
export function categoryOptions(
  categories: Array<{ id: string; title: string }>,
  current?: string
): Array<{ value: string; label: string }> {
  const options = categories.map((c) => ({ value: c.id, label: c.title || c.id }));
  if (current && !options.some((o) => o.value === current)) options.push({ value: current, label: `${current} (siyahıda yoxdur)` });
  return options;
}

export const GENDERS: Array<{ value: string; label: string }> = [
  { value: 'unisex', label: 'Uniseks' },
  { value: 'men', label: 'Kişi' },
  { value: 'women', label: 'Qadın' },
];

export type Tone = 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet';

export function orderStatusTone(status: string): Tone {
  const s = (status || '').toLowerCase();
  if (s.includes('ləğv')) return 'red';
  if (s.includes('çatdırıldı')) return 'green';
  if (s.includes('kuryer')) return 'violet';
  if (s.includes('çap')) return 'amber';
  if (s.includes('təsdiq')) return 'blue';
  return 'neutral';
}

export function paymentLabel(status: string): { label: string; tone: Tone } {
  const s = (status || '').toLowerCase().replace(/\s+/g, '_');
  if (s === 'paid') return { label: 'Ödənilib', tone: 'green' };
  if (s === 'test_paid') return { label: 'Test ödəniş', tone: 'violet' };
  if (s === 'failed') return { label: 'Uğursuz', tone: 'red' };
  if (s === 'refunded') return { label: 'Geri qaytarılıb', tone: 'amber' };
  if (s.startsWith('pending')) return { label: 'Ödəniş gözlənilir', tone: 'amber' };
  return { label: status || '—', tone: 'neutral' };
}
