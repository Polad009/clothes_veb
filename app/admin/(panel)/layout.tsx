import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { currentAdminRole } from "@/lib/adminSession";
import { AdminShell } from "@/components/admin/AdminShell";
import { countOpenWork } from "@/lib/db/stats";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "İdarəetmə",
  robots: { index: false, follow: false },
};

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  // a removed staff account loses access here even while its cookie is still valid
  const role = await currentAdminRole();
  if (!role) notFound();
  const counts = await countOpenWork().catch(() => ({ orders: 0, pod: 0, chat: 0 }));
  return <AdminShell counts={counts} role={role}>{children}</AdminShell>;
}
