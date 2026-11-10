import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/adminSession";
import { findProduct } from "@/lib/db/products";
import { AdminPage } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function ProductEditPage({ params }: { params: { id: string } }) {
  requireAdmin();
  const isNew = params.id === "new";
  const product = isNew ? null : await findProduct(decodeURIComponent(params.id));
  if (!isNew && !product) notFound();

  return (
    <AdminPage narrow>
      <ProductForm product={product} />
    </AdminPage>
  );
}
