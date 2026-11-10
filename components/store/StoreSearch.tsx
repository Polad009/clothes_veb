"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, X } from "lucide-react";
import { useCategories, useStoreData } from "@/context/StoreDataContext";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";
import { categoryTitle } from "@/lib/categories";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { T, tr } from "@/components/store/i18n";

const norm = (s: string) =>
  (s || "")
    .toLocaleLowerCase("az")
    .replace(/[ə]/g, "e")
    .replace(/[ı]/g, "i")
    .replace(/[ö]/g, "o")
    .replace(/[ü]/g, "u")
    .replace(/[ş]/g, "s")
    .replace(/[ç]/g, "c")
    .replace(/[ğ]/g, "g");

/** Full-width search sheet that drops from the top, dark. */
export function StoreSearch({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const { language } = useLanguage();
  const { formatProductPrice } = useCurrency();
  const { products } = useStoreData();
  const categories = useCategories();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", esc);
    };
  }, [isOpen, onClose]);

  const q = norm(query.trim());
  const results = useMemo(() => {
    if (!q) return [];
    return products.filter((p) => {
      const cat = categories.find((c) => c.id === p.category);
      const hay = norm([p.name, p.description, p.fit, p.composition, p.badge, cat ? categoryTitle(cat, language) : p.category].join(" "));
      return q.split(/\s+/).every((word) => hay.includes(word));
    });
  }, [q, products, categories, language]);

  if (!isOpen) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    router.push(`/collections?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div data-lenis-prevent className="fixed inset-0 z-[75] font-grotesk text-bone">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="hw-rise relative max-h-[100dvh] overflow-y-auto border-b border-white/10 bg-ink">
        <div className="mx-auto max-w-[1600px] px-4 pb-10 pt-6 sm:px-6 lg:px-10">
          <form onSubmit={submit} className="flex items-center gap-3 border-b border-white/20 pb-4 focus-within:border-bone">
            <Search size={22} strokeWidth={1.6} className="shrink-0 text-bone-dim" />
            <input
              ref={inputRef}
              type="text"
              enterKeyHint="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tr(language, { az: "Nə axtarırsınız?", en: "What are you looking for?", ru: "Что вы ищете?", tr: "Ne arıyorsunuz?" })}
              className="w-full bg-transparent text-2xl font-bold uppercase tracking-tight text-bone placeholder:text-bone-faint focus:outline-none sm:text-4xl [font-stretch:110%]"
            />
            <button type="button" onClick={onClose} className="shrink-0 p-2 text-bone-dim hover:text-bone" aria-label={tr(language, T.close)}>
              <X size={22} strokeWidth={1.6} />
            </button>
          </form>

          {!q ? (
            <div className="pt-8">
              <p className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.18em] text-bone-faint">
                {tr(language, { az: "Kateqoriyalar", en: "Categories", ru: "Категории", tr: "Kategoriler" })}
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/collections?category=${encodeURIComponent(c.id)}`}
                    onClick={onClose}
                    className="border border-white/20 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.14em] transition hover:border-bone hover:bg-bone hover:text-ink"
                  >
                    {categoryTitle(c, language)}
                  </Link>
                ))}
                <Link
                  href="/studio"
                  onClick={onClose}
                  className="border border-white/20 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.14em] transition hover:border-bone hover:bg-bone hover:text-ink"
                >
                  {tr(language, T.studio)}
                </Link>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-xl font-black uppercase [font-stretch:112%]">
                {tr(language, { az: "Heç nə tapılmadı", en: "Nothing found", ru: "Ничего не найдено", tr: "Sonuç bulunamadı" })}
              </p>
              <p className="mt-2 text-[13px] text-bone-dim">
                {tr(language, { az: "Başqa söz yazın və ya bütün məhsullara baxın.", en: "Try another word or browse all products.", ru: "Попробуйте другое слово или смотрите все товары.", tr: "Başka bir kelime deneyin veya tüm ürünlere bakın." })}
              </p>
              <Link href="/collections" onClick={onClose} className="mt-6 inline-flex rounded-full bg-bone px-6 py-3 text-[12px] font-extrabold uppercase tracking-[0.14em] text-ink hover:bg-white">
                {tr(language, T.allProducts)}
              </Link>
            </div>
          ) : (
            <div className="pt-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-bone-faint">
                  {results.length} {tr(language, T.products)}
                </p>
                <button type="button" onClick={submit} className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-bone-dim hover:text-bone">
                  {tr(language, { az: "Hamısını göstər", en: "Show all", ru: "Показать все", tr: "Tümünü göster" })} <ArrowRight size={13} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
                {results.slice(0, 12).map((p) => (
                  <Link key={p.id} href={`/products/${p.slug}`} onClick={onClose} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-tile">
                      <Image src={p.colors[0]?.image || "/images/hero/black-tee.jpg"} alt={p.name} fill sizes="(max-width: 640px) 50vw, 16vw" className="object-contain p-[8%] mix-blend-multiply transition group-hover:scale-[1.04]" />
                    </div>
                    <p className="mt-2 line-clamp-2 text-[12px] font-medium leading-snug">{p.name}</p>
                    <p className="mt-0.5 text-[12px] font-semibold tabular-nums text-bone-dim">{formatProductPrice(p)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
