"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Printer, QrCode, Search } from "lucide-react";
import type { ProductUnit, UnitBatch } from "@/lib/db/authenticity";
import { adminFetch, formatDate } from "@/lib/adminClient";
import { Badge, Button, Card, ConfirmButton, EmptyState, Field, Input, PageHeader, Select, useToast } from "@/components/admin/ui";

export interface ProductOption {
  id: string;
  name: string;
  colors: string[];
  sizes: string[];
}

export function UnitStatusBadge({ unit, warnAt = 5 }: { unit: Pick<ProductUnit, "status" | "scanCount">; warnAt?: number }) {
  if (unit.status === "void") return <Badge tone="red">Ləğv edilib</Badge>;
  if (unit.scanCount === 0) return <Badge>Yoxlanılmayıb</Badge>;
  if (unit.scanCount >= warnAt) return <Badge tone="amber">{unit.scanCount} yoxlama</Badge>;
  return <Badge tone="green">{unit.scanCount} yoxlama</Badge>;
}

export function VoidToggle({ unit }: { unit: ProductUnit }) {
  const router = useRouter();
  const toast = useToast();
  const set = async (status: "active" | "void") => {
    try {
      await adminFetch(`/api/admin/authenticity/${unit.id}`, { method: "PATCH", body: { status } });
      toast.success(status === "void" ? `${unit.serial} ləğv edildi.` : `${unit.serial} yenidən aktivdir.`);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };
  return unit.status === "void" ? (
    <Button size="sm" onClick={() => set("active")}>Aktiv et</Button>
  ) : (
    <ConfirmButton onConfirm={() => set("void")} confirmLabel="Bəli, ləğv et">Ləğv et</ConfirmButton>
  );
}

export function AuthenticityManager({
  batches,
  products,
  query,
  found,
}: {
  batches: UnitBatch[];
  products: ProductOption[];
  query: string;
  found: (ProductUnit & { productName: string }) | null;
}) {
  const router = useRouter();
  const toast = useToast();
  const [productId, setProductId] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState("10");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState(query);

  const product = products.find((p) => p.id === productId);
  const names = useMemo(() => new Map(products.map((p) => [p.id, p.name])), [products]);

  const create = async () => {
    const qty = Math.floor(Number(quantity));
    if (!product) return toast.error("Məhsul seçin.");
    if (!(qty >= 1 && qty <= 500)) return toast.error("Say 1 ilə 500 arasında olmalıdır.");
    setSaving(true);
    try {
      const res = await adminFetch<{ batch: string; count: number }>("/api/admin/authenticity", {
        body: { productId, color, size, quantity: qty },
      });
      toast.success(`${res.count} kod yaradıldı.`);
      router.push(`/admin/authenticity/${res.batch}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Orijinallıq kodları"
        description="Hər geyim üçün unikal QR kod. Müştəri etiketi oxudanda məhsulun orijinal olduğunu və onun səhifəsini görür."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card title="Yeni kodlar yarat">
          <div className="space-y-4 p-5">
            <Field label="Məhsul">
              <Select value={productId} onChange={(e) => { setProductId(e.target.value); setColor(""); setSize(""); }}>
                <option value="">Seçin…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Rəng">
                <Select value={color} onChange={(e) => setColor(e.target.value)} disabled={!product}>
                  <option value="">—</option>
                  {product?.colors.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </Field>
              <Field label="Ölçü">
                <Select value={size} onChange={(e) => setSize(e.target.value)} disabled={!product}>
                  <option value="">—</option>
                  {product?.sizes.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Say" hint="Neçə geyim tikilir/gəlir — hər birinə bir kod (ən çox 500).">
              <Input type="number" min={1} max={500} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </Field>
            <Button variant="primary" onClick={create} loading={saving} disabled={!product}>
              <QrCode className="h-4 w-4" /> Kodları yarat
            </Button>
          </div>
        </Card>

        <Card title="Kodu yoxla">
          <form
            className="flex gap-2 p-5"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(`/admin/authenticity?q=${encodeURIComponent(search.trim())}`);
            }}
          >
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Kod və ya seriya (HW-…)" />
            <Button type="submit"><Search className="h-4 w-4" /> Axtar</Button>
          </form>
          {query && !found && <p className="px-5 pb-5 text-sm text-red-700">“{query}” tapılmadı.</p>}
          {found && (
            <div className="space-y-2 border-t border-stone-100 px-5 py-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono font-medium">{found.serial}</span>
                <UnitStatusBadge unit={found} />
              </div>
              <p className="text-stone-700">{found.productName} {[found.color, found.size].filter(Boolean).join(" / ")}</p>
              <p className="break-all font-mono text-xs text-stone-500">{found.code}</p>
              <p className="text-stone-500">
                İlk yoxlama: {found.firstScannedAt ? formatDate(found.firstScannedAt) : "—"} · Son: {found.lastScannedAt ? formatDate(found.lastScannedAt) : "—"}
              </p>
              <div className="flex gap-2 pt-1">
                <VoidToggle unit={found} />
                <Link href={`/admin/authenticity/${found.batch}`} className="text-sm text-stone-600 underline">Partiyaya bax</Link>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Card title="Partiyalar" className="mt-6">
        {batches.length === 0 ? (
          <EmptyState title="Hələ kod yaradılmayıb" description="Yuxarıdan məhsul seçib ilk partiyanı yaradın." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left text-xs text-stone-500">
                  <th className="px-5 py-2.5 font-medium">Partiya</th>
                  <th className="px-5 py-2.5 font-medium">Məhsul</th>
                  <th className="px-5 py-2.5 text-right font-medium">Kod</th>
                  <th className="px-5 py-2.5 text-right font-medium">Yoxlanılıb</th>
                  <th className="px-5 py-2.5 font-medium">Tarix</th>
                  <th className="px-5 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {batches.map((b) => (
                  <tr key={b.batch} className="hover:bg-stone-50">
                    <td className="px-5 py-3 font-mono">
                      <Link href={`/admin/authenticity/${b.batch}`} className="hover:underline">{b.batch}</Link>
                    </td>
                    <td className="px-5 py-3">
                      {(b.productId && names.get(b.productId)) || "Silinmiş məhsul"}
                      <span className="text-stone-500"> {[b.color, b.size].filter(Boolean).join(" / ")}</span>
                    </td>
                    <td className="px-5 py-3 text-right">{b.count}{b.voided ? <span className="text-red-700"> ({b.voided} ləğv)</span> : null}</td>
                    <td className="px-5 py-3 text-right">{b.scanned}</td>
                    <td className="px-5 py-3 text-stone-500">{formatDate(b.createdAt)}</td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/admin/authenticity/${b.batch}/print`} className="inline-flex items-center gap-1 text-stone-700 hover:text-stone-950">
                        <Printer className="h-4 w-4" /> Çap
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
