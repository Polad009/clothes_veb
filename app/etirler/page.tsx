"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Droplets, Truck } from "lucide-react";
import { useStoreData, useSupport } from "@/context/StoreDataContext";
import { useLanguage } from "@/context/LanguageContext";
import { ProductTile } from "@/components/store/ProductTile";
import { T, tr } from "@/components/store/i18n";
import { CONCENTRATIONS, FAMILIES, isPerfume, type Family } from "@/lib/perfume";

const P = {
  eyebrow: { az: "Horwalle ətirləri", en: "Horwalle fragrance", ru: "Ароматы Horwalle", tr: "Horwalle parfümleri" },
  title: { az: "Ətirlər", en: "Fragrance", ru: "Ароматы", tr: "Parfümler" },
  intro: {
    az: "Geyimlərimizlə eyni xarakterdə qoxular. Hər ətirin üst, orta və baza notlarını məhsul səhifəsində görə bilərsiniz.",
    en: "Scents with the same character as our clothes. Every perfume page lists its top, heart and base notes.",
    ru: "Ароматы в характере нашей одежды. На странице каждого аромата — верхние, средние и базовые ноты.",
    tr: "Kıyafetlerimizle aynı karakterde kokular. Her parfümün üst, orta ve alt notalarını ürün sayfasında görebilirsiniz.",
  },
  family: { az: "Qoxu ailəsi", en: "Scent family", ru: "Семейство", tr: "Koku ailesi" },
  all: { az: "Hamısı", en: "All", ru: "Все", tr: "Tümü" },
  soonTitle: { az: "Tezliklə", en: "Coming soon", ru: "Скоро", tr: "Çok yakında" },
  soonText: {
    az: "İlk Horwalle ətirləri hazırlanır. Çıxan kimi xəbər tutmaq üçün WhatsApp-da yazın.",
    en: "The first Horwalle fragrances are on the way. Message us on WhatsApp to hear when they drop.",
    ru: "Первые ароматы Horwalle уже в работе. Напишите нам в WhatsApp, чтобы узнать о выходе.",
    tr: "İlk Horwalle parfümleri hazırlanıyor. Çıktığında haber almak için WhatsApp'tan yazın.",
  },
  none: { az: "Bu ailədə ətir yoxdur.", en: "No perfumes in this family.", ru: "В этом семействе пока нет ароматов.", tr: "Bu ailede parfüm yok." },
  shipping: {
    az: "Ətirlər yalnız Azərbaycan daxilinə çatdırılır (alışqan maye olduğu üçün xaricə göndərilmir).",
    en: "Perfume ships within Azerbaijan only (it is a flammable liquid and cannot be sent abroad).",
    ru: "Ароматы доставляются только по Азербайджану (легковоспламеняющаяся жидкость, за рубеж не отправляется).",
    tr: "Parfümler yalnızca Azerbaycan içine gönderilir (yanıcı sıvı olduğu için yurt dışına gönderilmez).",
  },
  guide: { az: "Konsentrasiya nədir?", en: "What the concentration means", ru: "Что значит концентрация", tr: "Konsantrasyon nedir?" },
};

export default function PerfumePage() {
  const { products } = useStoreData();
  const { language } = useLanguage();
  const support = useSupport();
  const [family, setFamily] = useState<Family | "all">("all");

  const perfumes = useMemo(() => products.filter(isPerfume), [products]);
  const families = useMemo(
    () => (Object.keys(FAMILIES) as Family[]).filter((f) => perfumes.some((p) => p.perfume?.families.includes(f))),
    [perfumes]
  );
  const list = family === "all" ? perfumes : perfumes.filter((p) => p.perfume?.families.includes(family));

  const chip = (on: boolean) =>
    `whitespace-nowrap border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition ${
      on ? "border-bone bg-bone text-ink" : "border-white/20 text-bone hover:border-bone"
    }`;

  return (
    <div className="min-h-screen bg-ink font-grotesk text-bone">
      <div className="mx-auto max-w-[1600px] px-4 pb-20 pt-10 sm:px-6 lg:px-10 lg:pt-14">
        <nav className="text-[11px] font-bold uppercase tracking-[0.16em] text-bone-faint">
          <Link href="/collections" className="hover:text-bone">{tr(language, T.allProducts)}</Link>
          <span className="mx-2">/</span>
          <span className="text-bone-dim">{tr(language, P.title)}</span>
        </nav>

        <header className="mt-6 max-w-2xl">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-bone-dim">{tr(language, P.eyebrow)}</p>
          <h1 className="mt-3 text-5xl font-black uppercase leading-[0.9] tracking-[-0.02em] [font-stretch:118%] sm:text-7xl">{tr(language, P.title)}</h1>
          <p className="mt-5 text-[15px] leading-relaxed text-bone-dim">{tr(language, P.intro)}</p>
        </header>

        <p className="mt-6 inline-flex items-start gap-2 border border-white/10 px-4 py-3 text-[13px] text-bone-dim">
          <Truck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {tr(language, P.shipping)}
        </p>

        {perfumes.length === 0 ? (
          <section className="mt-12 flex flex-col items-start border border-white/10 p-8 sm:p-12">
            <Droplets className="h-10 w-10 text-bone-dim" aria-hidden />
            <h2 className="mt-5 text-3xl font-black uppercase tracking-tight [font-stretch:112%]">{tr(language, P.soonTitle)}</h2>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-bone-dim">{tr(language, P.soonText)}</p>
            <a
              href={support.link("Salam! Horwalle ətirləri çıxanda xəbər verin.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 rounded-full bg-bone px-7 py-3.5 text-[12px] font-extrabold uppercase tracking-[0.16em] text-ink hover:bg-white"
            >
              WhatsApp
            </a>
          </section>
        ) : (
          <>
            {families.length > 1 && (
              <div className="mt-10">
                <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-bone-dim">{tr(language, P.family)}</p>
                <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
                  <button type="button" className={chip(family === "all")} onClick={() => setFamily("all")}>
                    {tr(language, P.all)}
                  </button>
                  {families.map((f) => (
                    <button key={f} type="button" className={chip(family === f)} onClick={() => setFamily(f)}>
                      {tr(language, FAMILIES[f])}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="mt-8 text-[12px] font-bold uppercase tracking-[0.16em] text-bone-faint">
              {list.length} {tr(language, T.products)}
            </p>
            {list.length === 0 ? (
              <p className="mt-6 text-[14px] text-bone-dim">{tr(language, P.none)}</p>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
                {list.map((p, i) => (
                  <ProductTile key={p.id} product={p} priority={i < 4} />
                ))}
              </div>
            )}
          </>
        )}

        <section className="mt-16 border-t border-white/10 pt-10">
          <h2 className="text-xl font-black uppercase tracking-tight [font-stretch:112%]">{tr(language, P.guide)}</h2>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.values(CONCENTRATIONS).map((c) => (
              <div key={c.short} className="border border-white/10 p-5">
                <dt className="text-[13px] font-extrabold uppercase tracking-[0.12em]">{tr(language, c.label)}</dt>
                <dd className="mt-2 text-[13px] text-bone-dim">{tr(language, c.hint)}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}
