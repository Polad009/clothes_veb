import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/adminSession";
import { findOrder } from "@/lib/db/orders";
import { getStoreSnapshot } from "@/lib/storeSnapshot";
import { whatsappNumber } from "@/lib/contact";
import { code128Svg } from "@/lib/barcode";
import { formatDate, formatMoney } from "@/lib/adminClient";
import { AdminPage } from "@/components/admin/AdminShell";
import { PrintButton } from "@/components/admin/PrintButton";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({ params }: { params: { id: string } }) {
  requireAdmin();
  const order = await findOrder(decodeURIComponent(params.id));
  if (!order) notFound();
  const { settings } = await getStoreSnapshot();

  const c = order.customer;
  const currency = order.currency || "AZN";
  const barcode = code128Svg(order.id);

  return (
    <AdminPage narrow>
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href={`/admin/orders/${encodeURIComponent(order.id)}`} className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900">
          <ArrowLeft className="h-4 w-4" /> Sifariş {order.id}
        </Link>
        <PrintButton />
      </div>

      <article className="mx-auto max-w-md rounded-xl border border-stone-200 bg-white p-6 text-stone-900 print:max-w-none print:border-0 print:p-0">
        <header className="border-b border-dashed border-stone-300 pb-4 text-center">
          <p className="text-lg font-semibold tracking-[0.2em]">HORWALLE</p>
          <p className="mt-1 text-xs text-stone-500">Satış qəbzi · {whatsappNumber(settings)}</p>
        </header>

        <dl className="space-y-1 border-b border-dashed border-stone-300 py-4 text-sm">
          <div className="flex justify-between gap-4"><dt className="text-stone-500">Sifariş</dt><dd className="font-mono">{order.id}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-stone-500">Tarix</dt><dd>{formatDate(order.date)}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-stone-500">Müştəri</dt><dd className="text-right">{c.fullName}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-stone-500">Telefon</dt><dd>{c.phone}</dd></div>
          <div className="flex justify-between gap-4">
            <dt className="text-stone-500">Ünvan</dt>
            <dd className="text-right">{[c.address, c.city, c.country].filter(Boolean).join(", ")}</dd>
          </div>
          <div className="flex justify-between gap-4"><dt className="text-stone-500">Ödəniş</dt><dd className="text-right">{order.paymentMethod}</dd></div>
        </dl>

        <table className="w-full border-b border-dashed border-stone-300 text-sm">
          <thead>
            <tr className="text-left text-xs text-stone-500">
              <th className="py-2 font-medium">Məhsul</th>
              <th className="py-2 text-right font-medium">Say</th>
              <th className="py-2 text-right font-medium">Cəm</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={i} className="align-top">
                <td className="py-1.5 pr-2">
                  {item.name}
                  <span className="block text-xs text-stone-500">{[item.color, item.size].filter(Boolean).join(" / ")}</span>
                </td>
                <td className="py-1.5 text-right tabular-nums">{item.quantity}</td>
                <td className="py-1.5 text-right tabular-nums">{formatMoney(item.price * item.quantity, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="space-y-1 py-4 text-sm tabular-nums">
          <div className="flex justify-between"><dt>Ara cəm</dt><dd>{formatMoney(order.subtotal, currency)}</dd></div>
          {order.discount > 0 && (
            <div className="flex justify-between"><dt>Endirim{order.promoCode ? ` (${order.promoCode})` : ""}</dt><dd>−{formatMoney(order.discount, currency)}</dd></div>
          )}
          <div className="flex justify-between"><dt>Çatdırılma</dt><dd>{order.shipping > 0 ? formatMoney(order.shipping, currency) : "Pulsuz"}</dd></div>
          <div className="flex justify-between border-t border-stone-300 pt-2 text-base font-semibold"><dt>Yekun</dt><dd>{formatMoney(order.total, currency)}</dd></div>
        </dl>

        <footer className="border-t border-dashed border-stone-300 pt-4 text-center">
          <div className="mx-auto max-w-full overflow-hidden [&_svg]:mx-auto [&_svg]:h-14 [&_svg]:w-auto [&_svg]:max-w-full" dangerouslySetInnerHTML={{ __html: barcode }} />
          <p className="mt-1 font-mono text-xs tracking-widest">{order.id}</p>
          <p className="mt-3 text-xs text-stone-500">Təşəkkür edirik!</p>
        </footer>
      </article>
    </AdminPage>
  );
}
