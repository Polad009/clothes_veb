import { requireAdmin } from "@/lib/adminSession";
import { getContent } from "@/lib/db/site";
import { AdminPage } from "@/components/admin/AdminShell";
import { ContentEditor } from "@/components/admin/ContentEditor";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  requireAdmin();
  const content: any = await getContent();
  return (
    <AdminPage narrow>
      <ContentEditor
        initial={{
          heroTag: content.hero?.tag || "",
          podBanner: content.podBanner || {},
          promoBanner: content.promoBanner || {},
          campaignSecondary: content.campaignSecondary || {},
        }}
      />
    </AdminPage>
  );
}
