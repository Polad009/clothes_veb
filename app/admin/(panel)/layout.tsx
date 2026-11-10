import type { Metadata } from "next";
import { requireAdmin } from "@/lib/adminSession";
import { AdminShell } from "@/components/admin/AdminShell";
import { countOpenWork } from "@/lib/db/stats";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "İdarəetmə",
  robots: { index: false, follow: false },
};

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  requireAdmin();
  const counts = await countOpenWork().catch(() => ({ orders: 0, pod: 0, chat: 0 }));
  return <AdminShell counts={counts}>{children}</AdminShell>;
}
