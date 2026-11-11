import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/adminSession";
import { findProduct } from "@/lib/db/products";
import { listCategories } from "@/lib/db/site";
import { AdminPage } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function ProductEditPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const isNew = params.id === "new";
  const [product, categories] = await Promise.all([
    isNew ? Promise.resolve(null) : findProduct(decodeURIComponent(params.id)),
    listCategories(),
  ]);
  if (!isNew && !product) notFound();

  return (
    <AdminPage narrow>
      <ProductForm product={product} categories={categories.map((c) => ({ id: c.id, title: c.title }))} />
    </AdminPage>
  );
}
