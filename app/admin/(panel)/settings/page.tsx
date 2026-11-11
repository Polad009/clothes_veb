import { requireOwner } from "@/lib/adminSession";
import { getContent, getSettings } from "@/lib/db/site";
import { resolveShippingRates } from "@/lib/shipping";
import { foreignMarkup } from "@/lib/pricing";
import { AdminPage } from "@/components/admin/AdminShell";
import { SettingsEditor } from "@/components/admin/SettingsEditor";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireOwner();
  const [content, settings]: [any, any] = await Promise.all([getContent(), getSettings()]);
  return (
    <AdminPage narrow>
      <SettingsEditor
        shipping={resolveShippingRates(settings.shipping)}
        privacy={String(content.policies?.privacy || "")}
        terms={String(content.policies?.terms || "")}
        markup={foreignMarkup(settings)}
      />
    </AdminPage>
  );
}
