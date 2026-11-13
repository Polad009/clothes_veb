"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ImageOff, Printer, QrCode, Search } from "lucide-react";
import type { ProductUnit, UnitBatch } from "@/lib/db/authenticity";
import { adminFetch, formatDate } from "@/lib/adminClient";
import { Badge, Button, Card, ConfirmButton, EmptyState, Field, Input, PageHeader, Select, useToast } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

export interface ProductOption {
  id: string;
  name: string;
  refCode: string;
  image: string;
  /** Photo per colour name, so the chosen colour can be seen too. */
  colorImages: Record<string, string>;
  colors: string[];
  sizes: string[];
}

/** Small version through the Next image resizer: product photos are 1000–1600 px wide. */
function thumbUrl(src: string) {
  return /^https?:\/\//.test(src) || src.startsWith("/") ? `/_next/image?url=${encodeURIComponent(src)}&w=128&q=70` : src;
}

function Thumb({ src, className }: { src?: string; className?: string }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={thumbUrl(src)} alt="" loading="lazy" className={cn("shrink-0 rounded-md border border-stone-200 bg-stone-100 object-cover", className)} />
  ) : (
    <span className={cn("flex shrink-0 items-center justify-center rounded-md border border-stone-200 bg-stone-100 text-stone-400", className)}>
      <ImageOff className="h-4 w-4" />
    </span>
  );
}

/** Product picker with photos, so the right garment is chosen at a glance. */
function ProductPicker({ products, value, onChange }: { products: ProductOption[]; value: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const selected = products.find((p) => p.id === value);

  useEffect(() => {
    if (!open) return;
    search.current?.focus();
    const close = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const needle = q.trim().toLowerCase();
  const list = needle
    ? products.filter((p) => p.name.toLowerCase().includes(needle) || p.refCode.toLowerCase().includes(needle))
    : products;

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-left text-sm hover:border-stone-400 focus:border-stone-900 focus:outline-none"
      >
        {selected ? (
          <>
            <Thumb src={selected.image} className="h-12 w-12" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-stone-900">{selected.name}</span>
              {selected.refCode && <span className="block truncate font-mono text-xs text-stone-500">{selected.refCode}</span>}
            </span>
          </>
        ) : (
          <span className="flex-1 py-3 pl-1 text-stone-500">Məhsul seçin…</span>
        )}
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-stone-500 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-lg">
          <div className="border-b border-stone-100 p-2">
            <Input ref={search} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ad və ya kodla axtar…" />
          </div>
          <ul role="listbox" className="max-h-80 overflow-y-auto py-1">
            {list.length === 0 && <li className="px-3 py-6 text-center text-sm text-stone-500">Məhsul tapılmadı.</li>}
            {list.map((p) => (
              <li key={p.id} role="option" aria-selected={p.id === value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(p.id);
                    setOpen(false);
                    setQ("");
                  }}
                  className={cn("flex w-full items-center gap-3 px-2.5 py-2 text-left text-sm hover:bg-stone-50", p.id === value && "bg-stone-50")}
                >
                  <Thumb src={p.image} className="h-14 w-14" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-stone-900">{p.name}</span>
                    <span className="block truncate text-xs text-stone-500">
                      {[p.refCode, p.colors.join(", ")].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  {p.id === value && <Check className="h-4 w-4 shrink-0 text-stone-900" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
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
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

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
              <ProductPicker
                products={products}
                value={productId}
                onChange={(id) => {
                  setProductId(id);
                  const next = products.find((p) => p.id === id);
                  setColor(next?.colors.length === 1 ? next.colors[0] : "");
                  setSize("");
                }}
              />
            </Field>
            {product && color && product.colorImages[color] && product.colorImages[color] !== product.image && (
              <div className="flex items-center gap-3 rounded-lg bg-stone-50 p-2 text-sm text-stone-600">
                <Thumb src={product.colorImages[color]} className="h-16 w-16" />
                Seçilmiş rəng: <span className="font-medium text-stone-900">{color}</span>
              </div>
            )}
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
                      {(() => {
                        const p = b.productId ? byId.get(b.productId) : undefined;
                        return (
                          <span className="flex items-center gap-3">
                            <Thumb src={p ? p.colorImages[b.color] || p.image : undefined} className="h-10 w-10" />
                            <span>
                              {p?.name || "Silinmiş məhsul"}
                              <span className="text-stone-500"> {[b.color, b.size].filter(Boolean).join(" / ")}</span>
                            </span>
                          </span>
                        );
                      })()}
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
