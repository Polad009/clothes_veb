"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Plus, Search } from "lucide-react";
import type { CatalogProduct } from "@/lib/db/products";
import { adminFetch, formatMoney, GENDERS } from "@/lib/adminClient";
import { Badge, Button, Card, EmptyState, Input, PageHeader, Select, Toggle, useToast } from "@/components/admin/ui";

const label = (list: Array<{ value: string; label: string }>, value: string) =>
  list.find((x) => x.value === value)?.label || value;

export function ProductsTable({ products, categories }: { products: CatalogProduct[]; categories: Array<{ value: string; label: string }> }) {
  const router = useRouter();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [stock, setStock] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      return !q || p.name.toLowerCase().includes(q) || p.refCode.toLowerCase().includes(q) || p.slug.includes(q);
    });
  }, [products, query, category]);

  const toggleStock = async (p: CatalogProduct, next: boolean) => {
    setBusy(p.id);
    setStock((s) => ({ ...s, [p.id]: next }));
    try {
      // Only the switch changes; stock counts are left as they are
      const { stock: _counts, ...rest } = p;
      await adminFetch("/api/admin/products", { body: { ...rest, inStock: next } });
      toast.success(next ? `"${p.name}" satışa qaytarıldı.` : `"${p.name}" stokda yoxdur kimi işarələndi.`);
      router.refresh();
    } catch (e: any) {
      setStock((s) => ({ ...s, [p.id]: !next }));
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Məhsullar"
        description={`${products.length} məhsul`}
        actions={
          <Link href="/admin/products/new">
            <Button variant="primary">
              <Plus className="h-4 w-4" /> Yeni məhsul
            </Button>
          </Link>
        }
      />

      <Card>
        <div className="flex flex-wrap gap-2 border-b border-stone-200 p-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden />
            <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ad və ya kod üzrə axtar" aria-label="Məhsullarda axtar" className="pl-9" />
          </div>
          <Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Kateqoriya üzrə süz" className="w-auto">
            <option value="all">Bütün kateqoriyalar</option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>
        </div>

        {visible.length === 0 ? (
          <EmptyState
            title={products.length === 0 ? "Hələ məhsul yoxdur" : "Uyğun məhsul tapılmadı"}
            description={products.length === 0 ? "İlk məhsulunuzu əlavə edin, dərhal saytda görünəcək." : "Axtarışı və ya kateqoriyanı dəyişin."}
            action={products.length === 0 ? <Link href="/admin/products/new"><Button variant="primary">Yeni məhsul</Button></Link> : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left text-xs text-stone-500">
                  <th className="px-5 py-2.5 font-medium">Məhsul</th>
                  <th className="px-3 py-2.5 font-medium">Kateqoriya</th>
                  <th className="px-3 py-2.5 text-right font-medium">Qiymət</th>
                  <th className="px-3 py-2.5 font-medium">Satışda</th>
                  <th className="px-5 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {visible.map((p) => {
                  const onSale = stock[p.id] ?? p.onSale;
                  const counts = Object.values(p.stock);
                  const units = counts.reduce((a, b) => a + b, 0);
                  const soldOut = counts.filter((q) => q <= 0).length;
                  return (
                    <tr key={p.id} className="hover:bg-stone-50">
                      <td className="px-5 py-3">
                        <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.image} alt="" loading="lazy" className="h-14 w-11 shrink-0 rounded-md border border-stone-200 bg-stone-100 object-cover" />
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-stone-900 underline-offset-2 hover:underline">{p.name}</span>
                            <span className="mt-0.5 block text-xs text-stone-500">
                              {p.refCode} · {p.colors.length} rəng · {p.sizes.join(", ")}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-stone-700">
                        {label(categories, p.category)}
                        <span className="block text-xs text-stone-500">{label(GENDERS, p.gender)}</span>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        <span className="font-medium">{formatMoney(p.price)}</span>
                        {p.compareAtPrice ? <span className="block text-xs text-stone-400 line-through">{formatMoney(p.compareAtPrice)}</span> : null}
                        {p.internationalPrice ? <span className="block text-xs text-stone-500">{formatMoney(p.internationalPrice, "USD")}</span> : null}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <Toggle checked={onSale} disabled={busy === p.id} onChange={(next) => toggleStock(p, next)} label={`${p.name}: satışda`} />
                          {p.hidden ? (
                            <Badge tone="neutral">Saytda gizli</Badge>
                          ) : !onSale ? (
                            <Badge tone="neutral">Satışdan çıxarılıb</Badge>
                          ) : p.trackStock && units === 0 ? (
                            <Badge tone="red">Stok bitib</Badge>
                          ) : null}
                        </div>
                        {p.trackStock && (
                          <p className="mt-1 text-xs text-stone-500">
                            {units} ədəd{soldOut > 0 && units > 0 ? ` · ${soldOut} variant bitib` : ""}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <a href={`/products/${p.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900">
                          Saytda bax <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
