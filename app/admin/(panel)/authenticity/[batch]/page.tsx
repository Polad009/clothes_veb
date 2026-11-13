import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { requireOwner } from "@/lib/adminSession";
import { listBatchUnits } from "@/lib/db/authenticity";
import { findProduct } from "@/lib/db/products";
import { formatDate } from "@/lib/adminClient";
import { AdminPage } from "@/components/admin/AdminShell";
import { UnitStatusBadge, VoidToggle } from "@/components/admin/AuthenticityManager";
import { Card, PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function BatchPage({ params }: { params: { batch: string } }) {
  await requireOwner();
  const units = await listBatchUnits(decodeURIComponent(params.batch));
  if (units.length === 0) notFound();
  const first = units[0];
  const product = first.productId ? await findProduct(first.productId) : null;
  const variant = [first.color, first.size].filter(Boolean).join(" / ");

  return (
    <AdminPage narrow>
      <Link href="/admin/authenticity" className="mb-4 inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900">
        <ArrowLeft className="h-4 w-4" /> Orijinallıq kodları
      </Link>
      <PageHeader
        title={`Partiya ${first.batch}`}
        description={`${product?.name || "Silinmiş məhsul"} ${variant} · ${units.length} kod · ${formatDate(first.createdAt)}`}
        actions={
          <Link
            href={`/admin/authenticity/${first.batch}/print`}
            className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-stone-800"
          >
            <Printer className="h-4 w-4" /> Etiketləri çap et
          </Link>
        }
      />
      <Card>
        <ul className="divide-y divide-stone-100">
          {units.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-sm">
              <span className="w-44 font-mono">{u.serial}</span>
              <span className="min-w-0 flex-1 truncate font-mono text-xs text-stone-500">{u.code}</span>
              <span className="text-xs text-stone-500">{u.lastScannedAt ? `son: ${formatDate(u.lastScannedAt)}` : ""}</span>
              <UnitStatusBadge unit={u} />
              <VoidToggle unit={u} />
            </li>
          ))}
        </ul>
      </Card>
    </AdminPage>
  );
}
