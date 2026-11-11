import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/adminSession";
import { findProduct } from "@/lib/db/products";
import { listCategories } from "@/lib/db/site";
import { pendingAlertCounts } from "@/lib/stockAlerts";
import { AdminPage } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";
import { Card } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function ProductEditPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const isNew = params.id === "new";
  const [product, categories] = await Promise.all([
    isNew ? Promise.resolve(null) : findProduct(decodeURIComponent(params.id)),
    listCategories(),
  ]);
  if (!isNew && !product) notFound();
  const waiting = product ? await pendingAlertCounts(product.id) : [];
  const total = waiting.reduce((n, w) => n + w.count, 0);

  return (
    <AdminPage narrow>
      {total > 0 && (
        <div className="mb-6">
          <Card title={`Stoka gəlməsini gözləyənlər: ${total} nəfər`}>
            <div className="space-y-3 p-5">
              <p className="text-sm text-stone-600">
                Bu ölçülər bitib və müştərilər e-poçt qoyub. Stoku artırıb yadda saxlayan kimi onlara avtomatik məktub gedəcək.
              </p>
              <ul className="divide-y divide-stone-100 rounded-lg border border-stone-200">
                {waiting.map((w) => (
                  <li key={`${w.color}|${w.size}`} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span className="text-stone-800">{[w.color, w.size].filter(Boolean).join(" / ") || "—"}</span>
                    <span className="font-semibold text-stone-900">{w.count} nəfər</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      )}
      <ProductForm product={product} categories={categories.map((c) => ({ id: c.id, title: c.title }))} />
    </AdminPage>
  );
}
