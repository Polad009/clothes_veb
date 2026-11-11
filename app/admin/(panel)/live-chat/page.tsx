import { requireAdmin } from "@/lib/adminSession";
import { LiveChatConsole } from "@/components/admin/LiveChatConsole";

export const dynamic = "force-dynamic";

export default async function LiveChatPage() {
  await requireAdmin();
  return <LiveChatConsole />;
}
