import { requireAdmin } from "@/lib/adminSession";
import { countProductsByCategory, listCategories } from "@/lib/db/site";
import { AdminPage } from "@/components/admin/AdminShell";
import { CategoriesManager } from "@/components/admin/CategoriesManager";
import type { Category } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  requireAdmin();
  const [categories, counts] = await Promise.all([listCategories(), countProductsByCategory()]);
  return (
    <AdminPage narrow>
      <CategoriesManager categories={categories as unknown as Category[]} counts={counts} />
    </AdminPage>
  );
}
