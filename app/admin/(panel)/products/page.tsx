import { requireAdmin } from "@/lib/adminSession";
import { listProducts } from "@/lib/db/products";
import { AdminPage } from "@/components/admin/AdminShell";
import { ProductsTable } from "@/components/admin/ProductsTable";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  requireAdmin();
  const products = await listProducts();
  return (
    <AdminPage>
      <ProductsTable products={products} />
    </AdminPage>
  );
}
