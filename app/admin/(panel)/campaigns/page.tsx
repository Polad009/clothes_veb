import { requireAdmin } from "@/lib/adminSession";
import { db } from "@/lib/db/client";
import { isEmailConfigured } from "@/lib/email/emailService";
import { AdminPage } from "@/components/admin/AdminShell";
import { CampaignComposer } from "@/components/admin/CampaignComposer";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  requireAdmin();
  const users = await db().auth.admin.listUsers({ page: 1, perPage: 1000 });
  const recipients = users.error
    ? 0
    : new Set(users.data.users.map((u) => (u.email || "").toLowerCase()).filter((e) => e.includes("@"))).size;

  return (
    <AdminPage narrow>
      <CampaignComposer recipients={recipients} emailConfigured={isEmailConfigured()} />
    </AdminPage>
  );
}
