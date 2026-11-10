"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCategories, useStoreData } from "@/context/StoreDataContext";
import { categoryDescription, categoryTitle, type Category } from "@/lib/categories";
import { ProductTile } from "@/components/store/ProductTile";
import { T, contentText, tr } from "@/components/store/i18n";
import { DEFAULT_PHOTOS } from "@/components/store/photos";
import { useRegionCopy } from "@/components/store/region";

const pill =
  "inline-flex items-center gap-2 rounded-full bg-bone px-7 py-3.5 text-[12px] font-extrabold uppercase tracking-[0.16em] text-ink transition hover:bg-white active:scale-[0.98] [font-stretch:108%]";

/** Text on the left, a large photo filling the right side (full-bleed on phones). */
function EditorialBlock({
  photo,
  alt,
  kicker,
  title,
  body,
  href,
  cta,
  full = false,
  priority = false,
}: {
  photo: string;
  alt: string;
  kicker: string;
  title: string;
  body?: string;
  href: string;
  cta: string;
  full?: boolean;
  priority?: boolean;
}) {
  return (
    <section className={`group relative w-full overflow-hidden border-b border-white/10 bg-ink ${full ? "h-[100svh] min-h-[640px]" : "h-[82svh] min-h-[520px]"}`}>
      <div className="absolute inset-0 sm:left-auto sm:w-[62%]">
        <Image
          src={photo}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, 62vw"
          className="object-cover object-center transition duration-[1200ms] ease-out group-hover:scale-[1.03]"
        />
        {/* blend the photo into the black: left edge on desktop, bottom on phones */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent sm:bg-gradient-to-r sm:from-ink sm:via-ink/20 sm:to-transparent" />
      </div>

      <div className={`relative z-10 mx-auto flex h-full max-w-[1600px] items-end px-4 font-grotesk text-bone sm:items-center sm:px-6 lg:px-10 ${full ? "pb-12 sm:pb-0" : "pb-10 sm:pb-0"}`}>
        <div className="max-w-xl sm:max-w-[46%]">
          {kicker && <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-bone-dim [font-stretch:110%]">{kicker}</p>}
          {full ? (
            <h1 className="mt-3 text-[13vw] font-black uppercase leading-[0.86] tracking-[-0.02em] [font-stretch:115%] sm:text-6xl lg:text-8xl">{title}</h1>
          ) : (
            <h2 className="mt-3 text-[15vw] font-black uppercase leading-[0.86] tracking-[-0.02em] [font-stretch:118%] sm:text-6xl lg:text-8xl">{title}</h2>
          )}
          {body && <p className="mt-5 max-w-md text-[14px] leading-relaxed text-bone-dim sm:text-[15px]">{body}</p>}
          <Link href={href} className={`${pill} mt-8`}>
            {cta}
          </Link>
        </div>
      </div>
    </section>
  );
}

function Hero() {
  const { language } = useLanguage();
  const { content } = useStoreData();
  const hero = content?.hero || {};
  const region = useRegionCopy();
  return (
    <EditorialBlock
      full
      priority
      photo={hero.photo || DEFAULT_PHOTOS.hero}
      alt="Horwalle"
      kicker={contentText(content, language, "hero", "kicker", { az: "", en: "", ru: "", tr: "" })}
      title={contentText(content, language, "hero", "title", { az: "Yeni sezon", en: "New season", ru: "Новый сезон", tr: "Yeni sezon" })}
      body={(language === "az" ? hero.text : content?.i18n?.[language]?.hero?.text) || region.heroText}
      href={hero.link || "/collections"}
      cta={tr(language, T.shopNow)}
    />
  );
}

function ShippingStrip() {
  const { language } = useLanguage();
  const region = useRegionCopy();
  return (
    <div className="border-y border-white/10 bg-ink font-grotesk">
      <div className="mx-auto flex max-w-[1600px] items-center justify-center gap-4 px-4 py-3.5 text-center text-[10px] font-extrabold uppercase tracking-[0.14em] text-bone [font-stretch:105%] sm:text-[11px] sm:tracking-[0.18em]">
        <span>{region.strip}</span>
        <Link href="/collections" className="hidden items-center gap-1 underline-offset-4 hover:underline sm:inline-flex">
          {tr(language, T.shopAll)} <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}

/** One editorial banner per category: text left, the category's photo large on the right. */
function CategoryBanner({ category, index }: { category: Category; index: number }) {
  const { language } = useLanguage();
  const photo = (category as any).banner || DEFAULT_PHOTOS[category.id] || DEFAULT_PHOTOS.hero;
  return (
    <EditorialBlock
      photo={photo}
      alt={categoryTitle(category, language)}
      kicker=""
      title={categoryTitle(category, language)}
      body={categoryDescription(category, language) || undefined}
      href={`/collections?category=${encodeURIComponent(category.id)}`}
      cta={tr(language, T.shopNow)}
    />
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
          {art && <Image src={art} alt="" fill sizes="(max-width: 768px) 90vw, 40vw" className="object-cover mix-blend-multiply" />}
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
  const { products, content } = useStoreData();
  const categories = useCategories();

  const available = useMemo(() => products.filter((p) => p.inStock !== false), [products]);
  const banners = useMemo(
    () => categories.filter((c) => available.some((p) => p.category === c.id)),
    [categories, available]
  );

  return (
    <div className="flex w-full flex-col bg-ink text-bone">
      <Hero />
      <ShippingStrip />

      {banners.map((c, i) => (
        <CategoryBanner key={c.id} category={c} index={i} />
      ))}

      {available.length > 0 && (
        <section className="mx-auto w-full max-w-[1600px] px-4 py-16 font-grotesk sm:px-6 lg:px-10 lg:py-24">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
            <h2 className="text-[10vw] font-black uppercase leading-none tracking-[-0.02em] [font-stretch:118%] sm:text-6xl">
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

      <StudioBanner art={(content?.podBanner?.photo as string) || DEFAULT_PHOTOS.studio} />
    </div>
  );
}
