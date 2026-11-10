import { requireAdmin } from "@/lib/adminSession";
import { listPromos } from "@/lib/db/site";
import { AdminPage } from "@/components/admin/AdminShell";
import { PromosManager } from "@/components/admin/PromosManager";

export const dynamic = "force-dynamic";

export default async function PromosPage() {
  requireAdmin();
  return (
    <AdminPage>
      <PromosManager promos={await listPromos()} />
    </AdminPage>
  );
}
