"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCategories, useStoreData } from "@/context/StoreDataContext";
import { categoryDescription, categoryTitle } from "@/lib/categories";
import { availableQty } from "@/lib/stock";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { ProductTile } from "@/components/store/ProductTile";
import { T, tr, type Phrase } from "@/components/store/i18n";
import type { Product } from "@/data/products";

const GENDERS: Array<{ id: string; label: Phrase }> = [
  { id: "all", label: { az: "Hamısı", en: "All", ru: "Все", tr: "Tümü" } },
  { id: "men", label: { az: "Kişi", en: "Men", ru: "Мужское", tr: "Erkek" } },
  { id: "women", label: { az: "Qadın", en: "Women", ru: "Женское", tr: "Kadın" } },
  { id: "unisex", label: { az: "Unisex", en: "Unisex", ru: "Унисекс", tr: "Unisex" } },
];

const SORTS: Array<{ id: string; label: Phrase }> = [
  { id: "featured", label: { az: "Seçilmiş", en: "Featured", ru: "Рекомендуемые", tr: "Öne çıkan" } },
  { id: "price_asc", label: { az: "Qiymət: ucuzdan bahaya", en: "Price: low to high", ru: "Цена: по возрастанию", tr: "Fiyat: artan" } },
  { id: "price_desc", label: { az: "Qiymət: bahadan ucuza", en: "Price: high to low", ru: "Цена: по убыванию", tr: "Fiyat: azalan" } },
  { id: "sale", label: { az: "Endirimdə olanlar", en: "On sale first", ru: "Сначала со скидкой", tr: "Önce indirimli" } },
];

function matchesGender(p: Product, gender: string) {
  if (gender === "all") return true;
  if (gender === "unisex") return p.gender === "unisex";
  return p.gender === gender || p.gender === "unisex";
}

function hasSize(p: Product, size: string) {
  if (size === "all") return true;
  if (!p.sizes.includes(size)) return false;
  return p.colors.some((c) => availableQty(p, c.name, size) !== 0);
}

function CollectionsView() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { language } = useLanguage();
  const { products } = useStoreData();
  const categories = useCategories();

  const category = params.get("category") || "all";
  const gender = (params.get("gender") || "all").toLowerCase();
  const query = (params.get("q") || "").trim().toLowerCase();
  const [size, setSize] = useState("all");
  const [sort, setSort] = useState("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dense, setDense] = useState(false);
  useBodyScrollLock(filtersOpen);
  useEffect(() => setSize("all"), [category]);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const scoped = useMemo(
    () => products.filter((p) => (category === "all" || p.category === category) && matchesGender(p, gender)),
    [products, category, gender]
  );
  const sizes = useMemo(() => Array.from(new Set(scoped.flatMap((p) => p.sizes))), [scoped]);
  const list = useMemo(() => {
    const filtered = scoped.filter(
      (p) =>
        hasSize(p, size) &&
        (!query || p.name.toLowerCase().includes(query) || (p.description || "").toLowerCase().includes(query))
    );
    const sorted = filtered.slice();
    if (sort === "price_asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price_desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "sale") sorted.sort((a, b) => Number(Boolean(b.compareAtPrice)) - Number(Boolean(a.compareAtPrice)));
    // sold-out pieces go last
    return sorted.sort((a, b) => Number(a.inStock === false) - Number(b.inStock === false));
  }, [scoped, size, sort, query]);

  const active = categories.find((c) => c.id === category);
  const title = active ? categoryTitle(active, language) : query ? `“${params.get("q")}”` : tr(language, T.allProducts);
  const description = active ? categoryDescription(active, language) : "";

  const chip = (on: boolean) =>
    `whitespace-nowrap border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition ${
      on ? "border-bone bg-bone text-ink" : "border-white/20 text-bone hover:border-bone"
    }`;

  const filterBody = (
    <div className="space-y-8">
      <div>
        <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-bone-dim">
          {tr(language, { az: "Cins", en: "Gender", ru: "Пол", tr: "Cinsiyet" })}
        </p>
        <div className="flex flex-wrap gap-2">
          {GENDERS.map((g) => (
            <button key={g.id} type="button" className={chip(gender === g.id)} onClick={() => setParam("gender", g.id)}>
              {tr(language, g.label)}
            </button>
          ))}
        </div>
      </div>
      {sizes.length > 0 && (
        <div>
          <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-bone-dim">
            {tr(language, { az: "Ölçü", en: "Size", ru: "Размер", tr: "Beden" })}
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={chip(size === "all")} onClick={() => setSize("all")}>
              {tr(language, GENDERS[0].label)}
            </button>
            {sizes.map((s) => (
              <button key={s} type="button" className={chip(size === s)} onClick={() => setSize(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
      <div>
        <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-bone-dim">
          {tr(language, { az: "Sıralama", en: "Sort by", ru: "Сортировка", tr: "Sırala" })}
        </p>
        <div className="flex flex-col items-start gap-2">
          {SORTS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSort(s.id)}
              className={`text-[13px] transition ${sort === s.id ? "font-bold text-bone underline underline-offset-4" : "text-bone-dim hover:text-bone"}`}
            >
              {tr(language, s.label)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink font-grotesk text-bone">
      <div className="mx-auto max-w-[1600px] px-4 pb-24 pt-8 sm:px-6 lg:px-10">
        <nav className="text-[11px] font-bold uppercase tracking-[0.16em] text-bone-faint">
          <Link href="/" className="hover:text-bone">Horwalle</Link>
          <span className="mx-2">/</span>
          <span className="text-bone-dim">{title}</span>
        </nav>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="break-words text-[11vw] font-black uppercase leading-[0.9] tracking-[-0.02em] [font-stretch:112%] sm:text-7xl">{title}</h1>
            {description && <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-bone-dim">{description}</p>}
          </div>
          <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-bone-faint">
            {list.length} {tr(language, T.products)}
          </p>
        </div>

        {/* category tabs */}
        <div className="-mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
          <button type="button" className={chip(category === "all")} onClick={() => setParam("category", "all")}>
            {tr(language, T.allProducts)}
          </button>
          {categories.map((c) => (
            <button key={c.id} type="button" className={chip(category === c.id)} onClick={() => setParam("category", c.id)}>
              {categoryTitle(c, language)}
            </button>
          ))}
        </div>

        {/* toolbar */}
        <div className="sticky top-16 z-20 -mx-4 mt-6 flex items-center justify-between border-y border-white/10 bg-ink/95 px-4 py-3 backdrop-blur-md sm:mx-0 sm:px-0">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.16em] hover:opacity-70"
          >
            <SlidersHorizontal size={15} strokeWidth={1.8} />
            {tr(language, { az: "Filtr və sıralama", en: "Filter & sort", ru: "Фильтр и сортировка", tr: "Filtre ve sıralama" })}
          </button>
          <div className="flex items-center gap-1">
            {[false, true].map((d) => (
              <button
                key={String(d)}
                type="button"
                onClick={() => setDense(d)}
                aria-label={d ? "4" : "2"}
                className={`flex h-8 w-8 items-center justify-center ${dense === d ? "text-bone" : "text-bone-faint hover:text-bone"}`}
              >
                <span className={`grid gap-0.5 ${d ? "grid-cols-4" : "grid-cols-2"}`}>
                  {Array.from({ length: d ? 8 : 4 }).map((_, i) => (
                    <span key={i} className={`${d ? "h-1.5 w-1" : "h-1.5 w-1.5"} bg-current`} />
                  ))}
                </span>
              </button>
            ))}
          </div>
        </div>

        {list.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-2xl font-black uppercase [font-stretch:115%]">
              {tr(language, { az: "Heç nə tapılmadı", en: "Nothing found", ru: "Ничего не найдено", tr: "Sonuç bulunamadı" })}
            </p>
            <button
              type="button"
              onClick={() => {
                setSize("all");
                router.replace(pathname, { scroll: false });
              }}
              className="mt-6 rounded-full bg-bone px-7 py-3 text-[12px] font-extrabold uppercase tracking-[0.14em] text-ink"
            >
              {tr(language, { az: "Filtrləri sıfırla", en: "Clear filters", ru: "Сбросить фильтры", tr: "Filtreleri temizle" })}
            </button>
          </div>
        ) : (
          <div className={`mt-8 grid gap-x-3 gap-y-10 sm:gap-x-5 ${dense ? "grid-cols-3 lg:grid-cols-6" : "grid-cols-2 lg:grid-cols-4"}`}>
            {list.map((p, i) => (
              <ProductTile key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {filtersOpen && (
          <div data-lenis-prevent className="fixed inset-0 z-[70]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70" onClick={() => setFiltersOpen(false)} />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-y-0 left-0 flex h-[100dvh] w-full max-w-sm flex-col border-r border-white/10 bg-ink font-grotesk text-bone"
            >
              <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
                <p className="text-sm font-extrabold uppercase tracking-[0.16em]">
                  {tr(language, { az: "Filtr", en: "Filter", ru: "Фильтр", tr: "Filtre" })}
                </p>
                <button type="button" onClick={() => setFiltersOpen(false)} className="-mr-2 p-2" aria-label={tr(language, T.close)}>
                  <X size={20} strokeWidth={1.6} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-6">{filterBody}</div>
              <div className="border-t border-white/10 p-5">
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="w-full rounded-full bg-bone py-3.5 text-[12px] font-extrabold uppercase tracking-[0.16em] text-ink"
                >
                  {tr(language, { az: `${list.length} məhsulu göstər`, en: `Show ${list.length} products`, ru: `Показать ${list.length}`, tr: `${list.length} ürünü göster` })}
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <CollectionsView />
    </Suspense>
  );
}
