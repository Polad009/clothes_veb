import { requireAdmin } from "@/lib/adminSession";
import { listProducts } from "@/lib/db/products";
import { listCategories } from "@/lib/db/site";
import { categoryOptions } from "@/lib/adminClient";
import { AdminPage } from "@/components/admin/AdminShell";
import { ProductsTable } from "@/components/admin/ProductsTable";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  requireAdmin();
  const [products, categories] = await Promise.all([listProducts(), listCategories()]);
  return (
    <AdminPage>
      <ProductsTable products={products} categories={categoryOptions(categories)} />
    </AdminPage>
  );
}
