import { requireAdmin } from "@/lib/adminSession";
import { listPodOrders } from "@/lib/db/orders";
import { AdminPage } from "@/components/admin/AdminShell";
import { PodBoard } from "@/components/admin/PodBoard";

export const dynamic = "force-dynamic";

export default async function PodOrdersPage() {
  await requireAdmin();
  const pods = await listPodOrders();
  const jobs = pods.map((p) => {
    const custom = p.customData || {};
    const front = p.frontDesign || {};
    const back = p.backDesign || {};
    const files = [
      p.originalImage,
      front.originalImage,
      front.uploadedImage,
      front.artworkUrl,
      back.originalImage,
      back.uploadedImage,
      back.artworkUrl,
      custom.uploadedImage,
    ].filter((src: unknown): src is string => typeof src === "string" && src.length > 0);

    return {
      id: p.id,
      orderId: p.orderId,
      createdAt: p.createdAt,
      customerName: p.customerName,
      customerPhone: p.customerPhone,
      garmentType: p.garmentType,
      garmentColor: p.garmentColor,
      size: p.size,
      price: p.price,
      placement: p.placement || "",
      customerNote: p.customerNote || "",
      status: p.status as string,
      preview: p.previewImage || custom.previewImage || files[0] || "",
      artwork: Array.from(new Set(files)),
    };
  });

  return (
    <AdminPage>
      <PodBoard jobs={jobs} />
    </AdminPage>
  );
}
