import { requireOwner } from "@/lib/adminSession";
import { getSettings } from "@/lib/db/site";
import { AdminPage } from "@/components/admin/AdminShell";
import { StudioPricesEditor } from "@/components/admin/StudioPricesEditor";

export const dynamic = "force-dynamic";

export default async function StudioPricesPage() {
  await requireOwner();
  const settings: any = await getSettings();
  return (
    <AdminPage>
      <StudioPricesEditor initial={settings.studioPrices || {}} />
    </AdminPage>
  );
}
