import { requireAdmin } from "@/lib/adminSession";
import { getContent, getSettings } from "@/lib/db/site";
import { AdminPage } from "@/components/admin/AdminShell";
import { ContentEditor } from "@/components/admin/ContentEditor";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  requireAdmin();
  const [content, settings]: [any, any] = await Promise.all([getContent(), getSettings()]);
  return (
    <AdminPage narrow>
      <ContentEditor
        initial={{
          heroTag: content.hero?.tag || "",
          announcements: Array.isArray(content.announcements) ? content.announcements : [],
          whatsappNumber: settings.whatsappNumber || "",
          podBanner: content.podBanner || {},
          promoBanner: content.promoBanner || {},
          campaignSecondary: content.campaignSecondary || {},
          i18n: content.i18n || {},
        }}
      />
    </AdminPage>
  );
}
