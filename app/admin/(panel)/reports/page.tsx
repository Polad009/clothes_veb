import { requireAdmin } from "@/lib/adminSession";
import { listOrders } from "@/lib/db/orders";
import { AdminPage } from "@/components/admin/AdminShell";
import { ReportsView, type ReportRow } from "@/components/admin/ReportsView";

export const dynamic = "force-dynamic";

const AZN_PER_USD = 1.7;

function isCash(method: string) {
  return /nağd|nagd|cash|cod|qapıda/i.test(method || "");
}

export default async function ReportsPage() {
  requireAdmin();
  const orders = await listOrders();

  const rows: ReportRow[] = orders.map((o) => ({
    id: o.id,
    date: o.date,
    name: o.customer.fullName,
    place: [o.customer.city, o.customer.country].filter(Boolean).join(", "),
    paymentMethod: o.paymentMethod,
    cash: isCash(o.paymentMethod),
    totalAzn: Math.round((o.currency === "USD" ? o.total * AZN_PER_USD : o.total) * 100) / 100,
    currency: o.currency || "AZN",
    paymentStatus: (o.paymentStatus || "").toLowerCase(),
    cancelled: (o.orderStatus || "").toLowerCase().includes("ləğv"),
    isTest: Boolean(o.isTest),
  }));

  return (
    <AdminPage>
      <ReportsView rows={rows} />
    </AdminPage>
  );
}
