import { requireAdmin } from "@/lib/adminSession";
import { LiveChatConsole } from "@/components/admin/LiveChatConsole";

export const dynamic = "force-dynamic";

export default function LiveChatPage() {
  requireAdmin();
  return <LiveChatConsole />;
}
