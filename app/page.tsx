"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/data/products";
import { useLanguage } from "@/context/LanguageContext";
import { useCategories, useStoreData } from "@/context/StoreDataContext";
import { categoryDescription, categoryTitle, type Category } from "@/lib/categories";
import { ProductTile } from "@/components/store/ProductTile";
import { T, contentText, tr } from "@/components/store/i18n";
import { useCutouts } from "@/components/store/useCutout";

const pill =
  "inline-flex items-center gap-2 rounded-full bg-bone px-7 py-3.5 text-[12px] font-extrabold uppercase tracking-[0.16em] text-ink transition hover:bg-white active:scale-[0.98] [font-stretch:108%]";

function frontImage(p?: Product) {
  return p?.colors?.[0]?.image || p?.image || "";
}
function Hero({ featured, art }: { featured?: Product; art?: string }) {
  const { language } = useLanguage();
  const { content } = useStoreData();
  const tag = contentText(content, language, "hero", "tag", { az: "Yeni kolleksiya", en: "New collection", ru: "Новая коллекция", tr: "Yeni koleksiyon" });

  return (
    <section className="relative flex h-[100svh] min-h-[620px] w-full items-end overflow-hidden bg-ink">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,#2b2b2b_0%,#0f0f0f_55%,#0a0a0a_100%)]" />
      {/* giant wordmark behind the garment */}
      <div className="pointer-events-none absolute inset-x-0 top-[18%] select-none text-center font-grotesk text-[23vw] font-black uppercase leading-none tracking-[-0.04em] text-white/[0.04] [font-stretch:125%] sm:top-[12%]">
        Horwalle
      </div>
      {art && (
        <div className="hw-rise absolute inset-x-0 bottom-[14%] top-[12%] sm:bottom-[6%] sm:top-[10%]">
          <Image src={art} alt={featured?.name || "Horwalle"} fill priority sizes="100vw" className="object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.6)]" />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink via-ink/60 to-transparent" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 pb-10 font-grotesk text-bone sm:px-6 sm:pb-14 lg:px-10">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-bone-dim [font-stretch:110%]">{tag}</p>
          <h1 lang="en" className="mt-2 max-w-4xl text-[8.5vw] font-black uppercase leading-[0.9] tracking-[-0.02em] [font-stretch:112%] sm:text-6xl lg:text-7xl">
            {featured?.name?.replace(/^HOR(W|VV)ALLE\s+/i, "") || "Horwalle"}
          </h1>
        </div>
        <Link href={featured ? `/products/${featured.slug}` : "/collections"} className={`${pill} self-start`}>
          {tr(language, T.shopNow)}
        </Link>
      </div>
    </section>
  );
}

function ShippingStrip() {
  const { language } = useLanguage();
  return (
    <div className="border-y border-white/10 bg-ink font-grotesk">
      <div className="mx-auto flex max-w-[1600px] items-center justify-center gap-4 px-4 py-3.5 text-center text-[10px] font-extrabold uppercase tracking-[0.14em] text-bone [font-stretch:105%] sm:text-[11px] sm:tracking-[0.18em]">
        <span>{tr(language, T.freeShipping)}</span>
        <Link href="/collections" className="hidden items-center gap-1 underline-offset-4 hover:underline sm:inline-flex">
          {tr(language, T.shopAll)} <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}

/** Full-width banner per category, with that category's garments laid out side by side. */
function CategoryBanner({ category, items, index, pics }: { category: Category; items: Product[]; index: number; pics: string[] }) {
  const { language } = useLanguage();
  const flip = index % 2 === 1;
  const desc = categoryDescription(category, language);

  return (
    <section className="group relative h-[78svh] min-h-[480px] w-full overflow-hidden border-b border-white/10 bg-ink-850">
      <div
        className={`absolute inset-0 ${
          flip ? "bg-[radial-gradient(ellipse_at_30%_50%,#262626_0%,#101010_65%)]" : "bg-[radial-gradient(ellipse_at_70%_50%,#262626_0%,#101010_65%)]"
        }`}
      />
      <div className={`absolute inset-y-[8%] flex items-center justify-center ${flip ? "left-0 right-0 sm:right-[30%]" : "left-0 right-0 sm:left-[30%]"}`}>
        {pics.map((src, i) => (
          <div
            key={src + i}
            className="relative h-full w-1/3 min-w-[38%] transition duration-700 ease-out group-hover:scale-[1.03]"
            style={{ marginLeft: i === 0 ? 0 : "-9%", zIndex: pics.length - Math.abs(i - 1), transform: `translateY(${i === 1 ? "-3%" : "3%"})` }}
          >
            <Image src={src} alt="" fill sizes="(max-width: 640px) 50vw, 30vw" className="object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.55)]" />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent sm:bg-gradient-to-r sm:from-black/70 sm:via-transparent" />

      <div className="relative z-10 mx-auto flex h-full max-w-[1600px] items-end px-4 pb-10 font-grotesk text-bone sm:px-6 sm:pb-14 lg:px-10">
        <div className="flex w-full flex-col gap-6">
          <div className="max-w-xl">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-bone-dim [font-stretch:110%]">
              {tr(language, T.collection)} · {String(index + 1).padStart(2, "0")}
            </p>
            <h2 className="mt-2 text-6xl font-black uppercase leading-[0.86] tracking-[-0.02em] [font-stretch:118%] sm:text-8xl">
              {categoryTitle(category, language)}
            </h2>
            {desc && <p className="mt-4 max-w-md text-[14px] leading-relaxed text-bone-dim">{desc}</p>}
          </div>
          <Link href={`/collections?category=${encodeURIComponent(category.id)}`} className={`${pill} self-start`}>
            {tr(language, T.shopNow)}
          </Link>
        </div>
      </div>
    </section>
  );
}

function StudioBanner({ art }: { art?: string }) {
  const { language } = useLanguage();
  const { content } = useStoreData();
  const tag = contentText(content, language, "podBanner", "tag", { az: "3D Dizayn Studiyası", en: "3D Design Studio", ru: "3D Студия дизайна", tr: "3D Tasarım Stüdyosu" });
  const title = contentText(content, language, "podBanner", "title", {
    az: "Öz dizaynını yarat",
    en: "Create your own design",
    ru: "Создай свой дизайн",
    tr: "Kendi tasarımını yarat",
  });
  const body = contentText(content, language, "podBanner", "description", {
    az: "Şəklini və ya loqonu yüklə, geyimin üzərində yerləşdir və sifariş ver.",
    en: "Upload your image or logo, place it on the garment and order.",
    ru: "Загрузи изображение или логотип, размести на одежде и закажи.",
    tr: "Görselini veya logonu yükle, giysiye yerleştir ve sipariş ver.",
  });
  const cta = contentText(content, language, "podBanner", "ctaText", { az: "Studiyaya keç", en: "Open the studio", ru: "Открыть студию", tr: "Stüdyoyu aç" });

  return (
    <section className="border-b border-white/10 bg-bone text-ink">
      <div className="mx-auto grid max-w-[1600px] items-center gap-10 px-4 py-16 font-grotesk sm:px-6 md:grid-cols-2 lg:px-10 lg:py-24">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-ink/60 [font-stretch:110%]">{tag}</p>
          <h2 className="mt-3 text-4xl font-black uppercase leading-[0.9] tracking-[-0.02em] [font-stretch:115%] sm:text-6xl">{title}</h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink/70">{body}</p>
          <Link
            href={(content?.podBanner?.ctaLink as string) || "/studio"}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-[12px] font-extrabold uppercase tracking-[0.16em] text-bone transition hover:bg-black [font-stretch:108%]"
          >
            {cta} <ArrowRight size={14} />
          </Link>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-lg">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#dcd8cf_0%,#edeae3_70%)]" />
          {art && <Image src={art} alt="" fill sizes="(max-width: 768px) 90vw, 40vw" className="object-contain p-6" />}
          <div className="absolute left-1/2 top-[30%] flex h-[34%] w-[30%] -translate-x-1/2 items-center justify-center border-2 border-dashed border-bone/80 bg-black/10 backdrop-blur-[1px]">
            <span className="text-center text-[11px] font-extrabold uppercase tracking-[0.16em] text-bone">
              {tr(language, { az: "Sənin dizaynın", en: "Your design", ru: "Твой дизайн", tr: "Senin tasarımın" })}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { language } = useLanguage();
  const { products } = useStoreData();
  const categories = useCategories();

  const available = useMemo(() => products.filter((p) => p.inStock !== false), [products]);
  const images = useMemo(() => Array.from(new Set(available.map(frontImage).filter(Boolean))), [available]);
  const cutouts = useCutouts(images);
  const isCut = (p: Product) => Boolean(cutouts?.includes(frontImage(p)));
  const featured = available.find(isCut) || available[0];
  const banners = useMemo(
    () =>
      categories
        .map((c) => {
          const items = available.filter((p) => p.category === c.id);
          return { category: c, items, pics: items.filter(isCut).slice(0, 3).map(frontImage) };
        })
        .filter((b) => b.items.length > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories, available, cutouts]
  );
  const studioTee = available.find((p) => p.category === "koynek" && isCut(p)) || available.find(isCut);

  return (
    <div className="flex w-full flex-col bg-ink text-bone">
      <Hero featured={featured} art={featured && isCut(featured) ? frontImage(featured) : undefined} />
      <ShippingStrip />

      {banners.map((b, i) => (
        <CategoryBanner key={b.category.id} category={b.category} items={b.items} pics={b.pics} index={i} />
      ))}

      {available.length > 0 && (
        <section className="mx-auto w-full max-w-[1600px] px-4 py-16 font-grotesk sm:px-6 lg:px-10 lg:py-24">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="text-4xl font-black uppercase leading-none tracking-[-0.02em] [font-stretch:118%] sm:text-6xl">
              {tr(language, T.newArrivals)}
            </h2>
            <Link href="/collections" className="inline-flex shrink-0 items-center gap-1 text-[12px] font-extrabold uppercase tracking-[0.16em] text-bone-dim hover:text-bone">
              {tr(language, T.shopAll)} <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
            {available.slice(0, 8).map((p, i) => (
              <ProductTile key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        </section>
      )}

      <StudioBanner art={studioTee ? frontImage(studioTee) : undefined} />
    </div>
  );
}
