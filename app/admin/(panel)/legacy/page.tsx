import { requireAdmin } from "@/lib/adminSession";

export const dynamic = "force-dynamic";

/**
 * The previous single-file panel, kept reachable for the tools that have not
 * been rebuilt yet (POS barcode & receipt, tax reports, e-mail campaigns).
 */
export default function LegacyAdminPage() {
  requireAdmin();
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col lg:h-dvh">
      <p className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-[13px] text-amber-900">
        Bu, köhnə paneldir. Yalnız hələ köçürülməmiş alətlər üçün istifadə edin: POS barkod və qəbz, vergi hesabatı, e-poçt kampaniyası.
      </p>
      <iframe src={`/admin.html?v=${Date.now()}`} title="Köhnə idarəetmə paneli" className="w-full flex-1 border-0 bg-white" />
    </div>
  );
}
