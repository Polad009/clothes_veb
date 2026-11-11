import { requireOwner } from "@/lib/adminSession";
import { listCustomers } from "@/lib/db/stats";
import { AdminPage } from "@/components/admin/AdminShell";
import { CustomersTable } from "@/components/admin/CustomersTable";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  await requireOwner();
  return (
    <AdminPage>
      <CustomersTable customers={await listCustomers()} />
    </AdminPage>
  );
}
