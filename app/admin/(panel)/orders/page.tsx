import { currentAdminRole, requireAdmin } from "@/lib/adminSession";
import { listOrders } from "@/lib/db/orders";
import { AdminPage } from "@/components/admin/AdminShell";
import { OrdersTable } from "@/components/admin/OrdersTable";

export const dynamic = "force-dynamic";

export default async function OrdersPage({ searchParams }: { searchParams: { status?: string } }) {
  await requireAdmin();
  const orders = await listOrders();
  // The list only needs light rows: custom design payloads stay on the detail page.
  const rows = orders.map((o) => ({
    id: o.id,
    date: o.date,
    name: o.customer.fullName,
    phone: o.customer.phone,
    email: o.customer.email,
    city: [o.customer.city, o.customer.country].filter(Boolean).join(", "),
    items: o.items.reduce((n, i) => n + i.quantity, 0),
    hasCustom: o.items.some((i) => i.isCustom),
    total: o.total,
    currency: o.currency || "AZN",
    orderStatus: o.orderStatus,
    paymentStatus: o.paymentStatus,
    isTest: Boolean(o.isTest),
    trackingCode: o.trackingCode || "",
  }));

  return (
    <AdminPage>
      <OrdersTable orders={rows} initialStatus={searchParams.status || "all"} isOwner={(await currentAdminRole()) === "owner"} />
    </AdminPage>
  );
}
