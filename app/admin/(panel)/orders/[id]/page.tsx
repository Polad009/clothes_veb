import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/adminSession";
import { findOrder } from "@/lib/db/orders";
import { formatDate, formatMoney } from "@/lib/adminClient";
import { AdminPage } from "@/components/admin/AdminShell";
import { Badge, Card } from "@/components/admin/ui";
import { OrderActions } from "@/components/admin/OrderActions";

export const dynamic = "force-dynamic";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <dt className="text-stone-500">{label}</dt>
      <dd className="text-right text-stone-900">{children}</dd>
    </div>
  );
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  requireAdmin();
  const order = await findOrder(decodeURIComponent(params.id));
  if (!order) notFound();

  const c = order.customer;
  const currency = order.currency || "AZN";
  const addressLines = [
    c.address,
    c.addressLine2,
    [c.city, c.stateOrRegion, c.postalCode].filter(Boolean).join(", "),
    c.country,
  ].filter(Boolean);

  return (
    <AdminPage narrow>
      <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900">
        <ArrowLeft className="h-4 w-4" /> Sifarişlər
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="font-sans text-2xl font-semibold tracking-tight">{order.id}</h1>
        {order.isTest && <Badge tone="violet">Test sifarişi</Badge>}
        <span className="text-sm text-stone-500">{formatDate(order.date)}</span>
        <Link
          href={`/admin/orders/${encodeURIComponent(order.id)}/receipt`}
          className="ml-auto inline-flex h-9 items-center rounded-lg border border-stone-300 bg-white px-3 text-[13px] font-medium text-stone-800 hover:bg-stone-50"
        >
          Qəbzi çap et
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Məhsullar">
            <ul className="divide-y divide-stone-100">
              {order.items.map((item, i) => {
                const custom = item.isCustom ? item.customData || {} : null;
                const preview = custom?.previewImage || custom?.uploadedImage || custom?.originalImage;
                return (
                  <li key={i} className="flex gap-4 px-5 py-4">
                    {preview && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={preview} alt="" className="h-16 w-16 shrink-0 rounded-lg border border-stone-200 bg-stone-50 object-contain" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-stone-900">
                        {item.name} {item.isCustom && <Badge tone="amber">Fərdi çap</Badge>}
                      </p>
                      <p className="mt-0.5 text-xs text-stone-500">
                        {[item.color, item.size && `Ölçü: ${item.size}`, custom?.placement].filter(Boolean).join(" · ")}
                      </p>
                      {custom?.customerNote && <p className="mt-1 text-xs text-stone-600">Qeyd: {custom.customerNote}</p>}
                    </div>
                    <div className="shrink-0 text-right text-sm tabular-nums">
                      <p className="font-medium">{formatMoney(item.price * item.quantity, currency)}</p>
                      <p className="mt-0.5 text-xs text-stone-500">{item.quantity} × {formatMoney(item.price, currency)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <dl className="border-t border-stone-200 px-5 py-3">
              <Row label="Ara cəm">{formatMoney(order.subtotal, currency)}</Row>
              {order.discount > 0 && (
                <Row label={`Endirim${order.promoCode ? ` (${order.promoCode})` : ""}`}>−{formatMoney(order.discount, currency)}</Row>
              )}
              <Row label={`Çatdırılma${order.shippingMethodLabel ? ` · ${order.shippingMethodLabel}` : ""}`}>
                {order.shipping > 0 ? formatMoney(order.shipping, currency) : "Pulsuz"}
              </Row>
              <div className="mt-1.5 flex justify-between border-t border-stone-200 pt-2.5 text-base font-semibold">
                <dt>Yekun</dt>
                <dd className="tabular-nums">{formatMoney(order.total, currency)}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Ödəniş">
            <dl className="px-5 py-3">
              <Row label="Üsul">{order.paymentMethod}</Row>
              <Row label="Provayder">{order.provider || "—"}</Row>
              <Row label="Əməliyyat nömrəsi">
                <span className="break-all font-mono text-xs">{order.providerPaymentId || "—"}</span>
              </Row>
              <Row label="İzləmə kodu">
                <span className="font-mono text-xs">{order.trackingCode || "—"}</span>
              </Row>
              {order.estimatedDelivery && <Row label="Təxmini çatdırılma">{order.estimatedDelivery}</Row>}
            </dl>
          </Card>
        </div>

        <div className="space-y-6">
          <OrderActions id={order.id} orderStatus={order.orderStatus} paymentStatus={order.paymentStatus} />

          <Card title="Müştəri">
            <div className="space-y-3 px-5 py-4 text-sm">
              <p className="font-medium text-stone-900">{c.fullName}</p>
              <p>
                <a href={`tel:${c.phone.replace(/[^+\d]/g, "")}`} className="text-stone-700 underline-offset-2 hover:underline">{c.phone}</a>
              </p>
              {c.email && (
                <p>
                  <a href={`mailto:${c.email}`} className="break-all text-stone-700 underline-offset-2 hover:underline">{c.email}</a>
                </p>
              )}
            </div>
          </Card>

          <Card title="Çatdırılma ünvanı">
            <address className="px-5 py-4 text-sm not-italic leading-relaxed text-stone-700">
              {addressLines.map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
            </address>
          </Card>
        </div>
      </div>
    </AdminPage>
  );
}
