import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { requireOwner } from "@/lib/adminSession";
import { getDashboard } from "@/lib/db/stats";
import { formatDate, formatMoney, orderStatusTone, paymentLabel } from "@/lib/adminClient";
import { AdminPage } from "@/components/admin/AdminShell";
import { Badge, Card, EmptyState, PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

function Stat({ label, value, sub, href }: { label: string; value: string; sub?: string; href?: string }) {
  const body = (
    <div className="h-full rounded-xl border border-stone-200 bg-white p-5 transition-colors hover:border-stone-300">
      <p className="text-[13px] text-stone-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-stone-900 tabular-nums">{value}</p>
      {sub && <p className="mt-1 text-xs text-stone-500">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export default async function DashboardPage() {
  await requireOwner();
  const d = await getDashboard();
  const peak = Math.max(1, ...d.daily.map((x) => x.revenue));

  return (
    <AdminPage>
      <PageHeader title="İcmal" description="Satış rəqəmlərinə yalnız ödənilmiş real sifarişlər daxildir. USD sifarişləri 1.70 məzənnə ilə manata çevrilir." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Bugünkü satış" value={formatMoney(d.today.revenue)} sub={`${d.today.orders} sifariş`} />
        <Stat label="Son 30 gün" value={formatMoney(d.last30.revenue)} sub={`${d.last30.orders} sifariş · orta ${formatMoney(d.last30.average)}`} />
        <Stat label="Yeni sifarişlər" value={String(d.newOrders)} sub={d.awaitingPayment ? `${d.awaitingPayment} ödəniş gözləyir` : "Baxılmağı gözləyir"} href="/admin/orders?status=Yeni+Sifariş" />
        <Stat label="Məhsullar" value={String(d.products.total)} sub={d.products.outOfStock ? `${d.products.outOfStock} stokda yoxdur` : "Hamısı stokdadır"} href="/admin/products" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card title="Son 14 gün" className="lg:col-span-2">
          <div className="p-5">
            <div className="flex h-40 items-end gap-1.5" role="img" aria-label="Son 14 günün gündəlik satış qrafiki">
              {d.daily.map((day) => (
                <div key={day.date} className="group relative flex h-full flex-1 items-end">
                  <div
                    className="w-full rounded-t bg-stone-800 transition-colors group-hover:bg-[#B08D57]"
                    style={{ height: `${Math.max(day.revenue > 0 ? 4 : 1, (day.revenue / peak) * 100)}%`, opacity: day.revenue > 0 ? 1 : 0.15 }}
                  />
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-stone-900 px-2 py-1 text-xs text-white group-hover:block">
                    {day.date.slice(8, 10)}.{day.date.slice(5, 7)} · {formatMoney(day.revenue)} · {day.orders} sifariş
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-stone-400 tabular-nums">
              <span>{d.daily[0].date.slice(8, 10)}.{d.daily[0].date.slice(5, 7)}</span>
              <span>bu gün</span>
            </div>
            {d.testOrders > 0 && (
              <p className="mt-4 text-xs text-stone-500">
                {d.testOrders} test sifarişi rəqəmlərə daxil edilməyib.
              </p>
            )}
          </div>
        </Card>

        <Card
          title="Son sifarişlər"
          className="lg:col-span-3"
          actions={
            <Link href="/admin/orders" className="inline-flex items-center gap-1 text-[13px] font-medium text-stone-600 hover:text-stone-900">
              Hamısı <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {d.recent.length === 0 ? (
            <EmptyState title="Hələ sifariş yoxdur" description="İlk sifariş gələn kimi burada görünəcək." />
          ) : (
            <ul className="divide-y divide-stone-100">
              {d.recent.map((o) => {
                const pay = paymentLabel(o.paymentStatus);
                return (
                  <li key={o.id}>
                    <Link href={`/admin/orders/${encodeURIComponent(o.id)}`} className="flex items-center gap-4 px-5 py-3 hover:bg-stone-50">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-stone-900">
                          {o.customer.fullName} <span className="font-normal text-stone-400">· {o.id}</span>
                        </p>
                        <p className="mt-0.5 text-xs text-stone-500">{formatDate(o.date)}</p>
                      </div>
                      <div className="hidden shrink-0 gap-1.5 sm:flex">
                        <Badge tone={orderStatusTone(o.orderStatus)}>{o.orderStatus}</Badge>
                        <Badge tone={pay.tone}>{pay.label}</Badge>
                      </div>
                      <p className="w-24 shrink-0 text-right text-sm font-medium tabular-nums">{formatMoney(o.total, o.currency)}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </AdminPage>
  );
}
