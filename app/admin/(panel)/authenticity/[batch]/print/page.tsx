import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireOwner } from "@/lib/adminSession";
import { listBatchUnits, verifyUrl } from "@/lib/db/authenticity";
import { qrSvg } from "@/lib/qr";
import { AdminPage } from "@/components/admin/AdminShell";
import { PrintButton } from "@/components/admin/PrintButton";

export const dynamic = "force-dynamic";

/** Groups the code in fours so it can be read out and typed by hand. */
function spaced(code: string) {
  return code.replace(/(.{4})(?=.)/g, "$1 ");
}

export default async function BatchPrintPage({ params }: { params: { batch: string } }) {
  await requireOwner();
  const units = (await listBatchUnits(decodeURIComponent(params.batch))).filter((u) => u.status === "active");
  if (units.length === 0) notFound();
  const labels = await Promise.all(units.map(async (u) => ({ ...u, svg: await qrSvg(verifyUrl(u.code)) })));

  return (
    <AdminPage>
      <style>{"@page { size: A4; margin: 8mm; }"}</style>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={`/admin/authenticity/${units[0].batch}`} className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900">
          <ArrowLeft className="h-4 w-4" /> Partiya {units[0].batch}
        </Link>
        <p className="text-sm text-stone-500">
          {labels.length} etiket · QR 22 mm · ağ üzərində qara çap edin, çapda ölçünü kiçiltməyin (miqyas 100%).
        </p>
        <PrintButton />
      </div>

      <div className="grid gap-[2mm] bg-white [grid-template-columns:repeat(auto-fill,38mm)]">
        {labels.map((l) => (
          <div
            key={l.id}
            className="flex h-[42mm] w-[38mm] break-inside-avoid flex-col items-center justify-between border border-dashed border-stone-300 p-[2mm] text-black"
          >
            <p className="text-[7pt] font-bold tracking-[0.25em]">HORWALLE</p>
            <div className="h-[22mm] w-[22mm]" dangerouslySetInnerHTML={{ __html: l.svg }} />
            <div className="text-center leading-tight">
              <p className="text-[5.5pt] uppercase">Orijinallığı yoxla · horwalle.com/v</p>
              <p className="font-mono text-[6pt]">{spaced(l.code)}</p>
              <p className="font-mono text-[5.5pt] text-stone-600">
                {l.serial}
                {l.size ? ` · ${l.size}` : ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </AdminPage>
  );
}
