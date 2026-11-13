import { requireOwner } from "@/lib/adminSession";
import { findUnit, listBatches } from "@/lib/db/authenticity";
import { listProducts } from "@/lib/db/products";
import { AdminPage } from "@/components/admin/AdminShell";
import { AuthenticityManager } from "@/components/admin/AuthenticityManager";

export const dynamic = "force-dynamic";

export default async function AuthenticityPage({ searchParams }: { searchParams: { q?: string } }) {
  await requireOwner();
  const query = String(searchParams.q || "").trim().slice(0, 60);
  const [batches, products, unit] = await Promise.all([
    listBatches(),
    listProducts(),
    query ? findUnit(query) : Promise.resolve(null),
  ]);

  const options = products.map((p) => ({
    id: p.id,
    name: p.hidden ? `${p.name} (gizli)` : p.name,
    colors: (p.colors || []).map((c: any) => String(c?.name || "")).filter(Boolean),
    sizes: p.sizes || [],
  }));
  const found = unit
    ? { ...unit, productName: products.find((p) => p.id === unit.productId)?.name || "Silinmiş məhsul" }
    : null;

  return (
    <AdminPage>
      <AuthenticityManager batches={batches} products={options} query={query} found={found} />
    </AdminPage>
  );
}
