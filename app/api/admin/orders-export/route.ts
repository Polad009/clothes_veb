import { NextRequest, NextResponse } from 'next/server';
import { isAdminOwner } from '@/lib/adminAuth';
import { listOrders } from '@/lib/db/orders';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/orders-export?test=0|1 — every order as a spreadsheet (one row per item),
 * semicolon-separated with a BOM so Excel opens the columns and Azerbaijani letters correctly.
 * Owner only: it contains every customer's contact details.
 */
export async function GET(req: NextRequest) {
  if (!isAdminOwner(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const withTest = req.nextUrl.searchParams.get('test') === '1';
  const orders = (await listOrders()).filter((o) => withTest || !o.isTest);

  const cell = (v: unknown) => {
    let s = String(v ?? '');
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // never let a value run as a spreadsheet formula
    return `"${s.replace(/"/g, '""')}"`;
  };
  const num = (v: unknown) => (Number(v) || 0).toFixed(2).replace('.', ',');
  const date = (d: string) => {
    const t = new Date(d);
    return Number.isNaN(t.getTime()) ? d : t.toLocaleString('az-AZ', { timeZone: 'Asia/Baku' });
  };

  const header = [
    'Sifariş', 'Tarix', 'Status', 'Ödəniş', 'Ödəniş üsulu', 'Müştəri', 'Telefon', 'E-poçt',
    'Ölkə', 'Şəhər', 'Ünvan', 'Məhsul', 'Öz dizayn', 'Rəng', 'Ölçü', 'Say', 'Qiymət', 'Məbləğ',
    'Çatdırılma', 'Endirim', 'Sifariş cəmi', 'Valyuta', 'İzləmə kodu', 'Test',
  ];
  const lines = [header.map(cell).join(';')];
  for (const o of orders) {
    const c: any = o.customer || {};
    const items = o.items.length ? o.items : [{ name: '', color: '', size: '', quantity: 0, price: 0, isCustom: false } as any];
    items.forEach((it: any, i: number) => {
      lines.push(
        [
          cell(o.id), cell(date(o.date)), cell(o.orderStatus), cell(o.paymentStatus), cell((o as any).paymentMethod || ''),
          cell(c.fullName), cell(c.phone), cell(c.email), cell(c.country), cell(c.city),
          cell([c.address, c.addressLine2, c.postalCode].filter(Boolean).join(', ')),
          cell(it.name), cell(it.isCustom ? 'bəli' : ''), cell(it.color), cell(it.size), cell(it.quantity),
          cell(num(it.price)), cell(num((Number(it.price) || 0) * (Number(it.quantity) || 0))),
          // order-level money only on the first row of the order, so sums stay right
          cell(i === 0 ? num((o as any).shipping) : ''), cell(i === 0 ? num((o as any).discount) : ''),
          cell(i === 0 ? num(o.total) : ''), cell(o.currency || 'AZN'), cell(o.trackingCode || ''), cell(o.isTest ? 'bəli' : ''),
        ].join(';')
      );
    });
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse('\uFEFF' + lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="horwalle-sifarisler-${stamp}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
