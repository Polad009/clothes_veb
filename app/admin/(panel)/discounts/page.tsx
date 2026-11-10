import { requireAdmin } from "@/lib/adminSession";
import { listCampaigns } from "@/lib/db/campaigns";
import { listProducts } from "@/lib/db/products";
import { listCategories } from "@/lib/db/site";
import { AdminPage } from "@/components/admin/AdminShell";
import { DiscountsManager } from "@/components/admin/DiscountsManager";

export const dynamic = "force-dynamic";

export default async function DiscountsPage() {
  requireAdmin();
  const [campaigns, products, categories] = await Promise.all([listCampaigns(), listProducts(), listCategories()]);
  return (
    <AdminPage narrow>
      <DiscountsManager
        campaigns={campaigns}
        products={products.map((p) => ({ id: p.id, name: p.name, category: p.category, price: p.price, image: p.image }))}
        categories={categories.map((c) => ({ id: c.id, title: c.title }))}
      />
    </AdminPage>
  );
}
