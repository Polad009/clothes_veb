
"use client";

function localizeHeroFit(fit: string | undefined, lang: string) {
  if (!fit) return "";
  const f = fit.toLowerCase();
  if (f.includes("hody qalın") || f.includes("3iplik")) {
    return lang === "en" ? "Heavyweight Hoodie (3-Thread)" : lang === "ru" ? "Плотное худи (3-нитка)" : lang === "tr" ? "Kalın Hudi (3 İplik)" : fit;
  }
  if (f.includes("kepka") || f.includes("qalın")) {
    return lang === "en" ? "Heavyweight Snapback Cap" : lang === "ru" ? "Плотная кепка" : lang === "tr" ? "Kalın Şapka" : fit;
  }
  if (f.includes("kətan eko çanta")) {
    return lang === "en" ? "Canvas Eco Tote Bag" : lang === "ru" ? "Хлопковый эко-шоппер" : lang === "tr" ? "Keten Eko Çanta" : fit;
  }
  return fit;
}

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { SizeChip } from "@/components/ui/SizeChip";
import { useStoreData } from "@/context/StoreDataContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";

export interface HeroProductItem {
  id: string;
  name: string;
  category: string;
  title: string;
  subtitle?: string;
  price: string;
  compareAtPrice?: string;
  colorHex: string;
  image: string;
  bgGradient: string;
  headerBg: string;
  topGradient: string;
  sizes: string[];
  slug: string;
}

// Curated high-end atelier luxury themes for ambient backdrop & header color synchronization
function getProductHeroPalette(product: any, idx: number) {
  const nameLower = (product.name || "").toLowerCase();
  const hex = (product.colors?.[0]?.hex || "").toLowerCase();

  // 1. BMW Motorsport / M-Power items -> Deep Motorsport Carbon Slate
  if (nameLower.includes("bmw") || nameLower.includes("motorsport")) {
    return {
      bgGradient: "radial-gradient(circle at 50% 36%, #222632 0%, #13161F 48%, #08090D 100%)",
      headerBg: "#13161F",
      topGradient: "linear-gradient(180deg, #08090D 0%, #13161F 100%)",
      colorHex: "#1A1A1A",
    };
  }

  // 2. White / Clean Light garments (e.g. McLaren 750S White Tee) -> Rich Charcoal Graphite Slate
  if (hex === "#f5f5f7" || hex === "#ffffff" || hex === "#f4f0e8" || nameLower.includes("white")) {
    return {
      bgGradient: "radial-gradient(circle at 50% 36%, #353842 0%, #1E2026 48%, #0E0F13 100%)",
      headerBg: "#1E2026",
      topGradient: "linear-gradient(180deg, #0E0F13 0%, #1E2026 100%)",
      colorHex: "#F5F5F7",
    };
  }

  // 3. Black / Washed Black garments (e.g. Angelus Polo, Angel Dust Hoodie) -> Deep Obsidian Noir
  if (hex === "#1a1a1a" || hex === "#111111" || nameLower.includes("black")) {
    return {
      bgGradient: "radial-gradient(circle at 50% 36%, #282A33 0%, #16171D 48%, #090A0D 100%)",
      headerBg: "#16171D",
      topGradient: "linear-gradient(180deg, #090A0D 0%, #16171D 100%)",
      colorHex: "#1A1A1A",
    };
  }

  // 4. Default refined luxury dark slate palettes
  const fallbackPalettes = [
    {
      bgGradient: "radial-gradient(circle at 50% 36%, #2C2F38 0%, #181A20 48%, #0A0B0E 100%)",
      headerBg: "#181A20",
      topGradient: "linear-gradient(180deg, #0A0B0E 0%, #181A20 100%)",
      colorHex: "#1A1A1A",
    },
    {
      bgGradient: "radial-gradient(circle at 50% 36%, #242B38 0%, #141924 48%, #080B12 100%)",
      headerBg: "#141924",
      topGradient: "linear-gradient(180deg, #080B12 0%, #141924 100%)",
      colorHex: "#2E5A96",
    },
    {
      bgGradient: "radial-gradient(circle at 50% 36%, #322A36 0%, #1D1721 48%, #0D0910 100%)",
      headerBg: "#1D1721",
      topGradient: "linear-gradient(180deg, #0D0910 0%, #1D1721 100%)",
      colorHex: "#6E4567",
    },
  ];

  return fallbackPalettes[idx % fallbackPalettes.length];
}

// Fallback initial products if store data is still loading
const INITIAL_FALLBACK_PRODUCTS: HeroProductItem[] = [
  {
    id: "bmw-hoodie",
    name: "HORWALLE \"BMW M Motorsport\" Heavyweight Fleece Hoodie",
    category: "hudi",
    title: "HORWALLE \"BMW M MOTORSPORT\" HEAVYWEIGHT FLEECE HOODIE",
    subtitle: "Hody qalın (3iplik)",
    price: "20₼",
    compareAtPrice: "129₼",
    colorHex: "#1A1A1A",
    image: "/images/uploads/bmw_hoodie_black_front_v3.png",
    bgGradient: "radial-gradient(circle at 50% 36%, #222632 0%, #13161F 48%, #08090D 100%)",
    headerBg: "#13161F",
    topGradient: "linear-gradient(180deg, #08090D 0%, #13161F 100%)",
    sizes: ["S", "M", "L", "XL", "XXL"],
    slug: "horwalle-bmw-m-motorsport-heavyweight-fleece-hoodie",
  },
];

export function Hero() {
  const { products } = useStoreData();
  const { formatPrice, formatProductPrice } = useCurrency();
  const { t, language } = useLanguage();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>("L");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [direction, setDirection] = useState<number>(1); // 1 = right-to-left, -1 = left-to-right

  // Map live store products into rich hero items
  const heroProducts: HeroProductItem[] = useMemo(() => {
    if (!products || products.length === 0) {
      return INITIAL_FALLBACK_PRODUCTS;
    }

    return products.map((p, idx) => {
      const palette = getProductHeroPalette(p, idx);
      const primaryColor = p.colors && p.colors[0] ? p.colors[0] : null;
      // Prioritize pure transparent garment cutouts for hero presentation
      const bestImage =
        p.image ||
        primaryColor?.image ||
        "/images/hero/lookbook.webp";

      return {
        id: p.id || `prod-${idx}`,
        name: p.name,
        category: p.category || "koynek",
        title: (p.name || "Horvvalle Couture").toUpperCase(),
        subtitle: localizeHeroFit(p.fit || p.composition || p.category, language),
        price: formatProductPrice(p),
        compareAtPrice: p.compareAtPrice ? formatPrice(p.compareAtPrice) : undefined,
        colorHex: primaryColor?.hex || palette.colorHex,
        image: bestImage,
        bgGradient: palette.bgGradient,
        headerBg: palette.headerBg,
        topGradient: palette.topGradient,
        sizes: p.sizes && p.sizes.length > 0 ? p.sizes : ["S", "M", "L", "XL", "XXL"],
        slug: p.slug || p.id,
      };
    });
  }, [products, formatPrice, formatProductPrice]);

  const total = heroProducts.length;
  const safeCurrentIndex = total > 0 ? currentIndex % total : 0;
  const currentItem = heroProducts[safeCurrentIndex] || INITIAL_FALLBACK_PRODUCTS[0];
  const nextIndex = total > 0 ? (safeCurrentIndex + 1) % total : 0;
  const nextItem = heroProducts[nextIndex] || currentItem;

  // Ensure selected size exists in the active product
  useEffect(() => {
    if (currentItem && currentItem.sizes && currentItem.sizes.length > 0) {
      if (!currentItem.sizes.includes(selectedSize)) {
        setSelectedSize(currentItem.sizes[0]);
      }
    }
  }, [currentItem, selectedSize]);

  // Sync active slide color to document body, root and adaptive scrollbar
  useEffect(() => {
    if (typeof document === "undefined" || !currentItem) return;

    const updateScrollbar = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const isPastHero = scrollY > 400;

      if (isPastHero) {
        document.documentElement.style.setProperty("--scrollbar-track", "#FAF7F2");
        document.documentElement.style.setProperty("--scrollbar-thumb", "#D5CEBF");
        document.documentElement.style.setProperty("--scrollbar-thumb-hover", "#B08D57");
      } else {
        document.documentElement.style.setProperty("--scrollbar-track", currentItem.headerBg);
        document.documentElement.style.setProperty("--scrollbar-thumb", currentItem.colorHex);
        document.documentElement.style.setProperty("--scrollbar-thumb-hover", "#E6C280");
      }
    };

    document.documentElement.style.setProperty("--hero-header-bg", currentItem.headerBg);
    document.documentElement.style.setProperty("--hero-top-gradient", currentItem.topGradient);
    document.documentElement.style.setProperty("--hero-bg", currentItem.bgGradient);
    document.documentElement.style.setProperty("--hero-ink", currentItem.colorHex);
    document.body.style.backgroundColor = currentItem.headerBg;

    updateScrollbar();
    window.addEventListener("scroll", updateScrollbar, { passive: true });

    window.dispatchEvent(
      new CustomEvent("hv-hero-color-change", {
        detail: {
          headerBg: currentItem.headerBg,
          topGradient: currentItem.topGradient,
          bgGradient: currentItem.bgGradient,
          colorHex: currentItem.colorHex,
        },
      })
    );

    return () => {
      window.removeEventListener("scroll", updateScrollbar);
    };
  }, [safeCurrentIndex, currentItem]);

  // Slider navigation
  const handleNext = useCallback(() => {
    if (isAnimating || total === 0) return;
    setIsAnimating(true);
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % total);
    setTimeout(() => setIsAnimating(false), 450);
  }, [isAnimating, total]);

  const handlePrev = useCallback(() => {
    if (isAnimating || total === 0) return;
    setIsAnimating(true);
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
    setTimeout(() => setIsAnimating(false), 450);
  }, [isAnimating, total]);

  const heroRef = useRef<HTMLElement | null>(null);
  const lastWheelTimeRef = useRef<number>(0);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  // Intercept horizontal wheel / trackpad gestures (deltaX) on the hero container to cycle slides
  // smoothly and prevent horizontal trackpad swipes from triggering Lenis vertical scroll and stretching.
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // If horizontal gesture is clearly dominant
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 18) {
        e.preventDefault();
        const now = Date.now();
        if (now - lastWheelTimeRef.current > 420) {
          lastWheelTimeRef.current = now;
          if (e.deltaX > 0) {
            handleNext();
          } else {
            handlePrev();
          }
        }
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, [handleNext, handlePrev]);

  // Slider animation - Smooth horizontal glide (right-to-left / left-to-right)
  const productVariants = {
    initial: (dir: number) => ({
      x: dir > 0 ? "85%" : "-85%",
      opacity: 0,
      scale: 0.94,
    }),
    animate: {
      x: "0%",
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 280, damping: 28 },
        opacity: { duration: 0.35, ease: "easeOut" },
        scale: { duration: 0.35, ease: "easeOut" },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-85%" : "85%",
      opacity: 0,
      scale: 0.94,
      transition: {
        x: { type: "spring", stiffness: 280, damping: 28 },
        opacity: { duration: 0.28, ease: "easeIn" },
        scale: { duration: 0.28, ease: "easeIn" },
      },
    }),
  };

  return (
    <section
      ref={heroRef}
      id="hero-section"
      style={{
        background: currentItem.bgGradient,
        transition: "background 0.75s ease-in-out",
        ["--hero-bg" as any]: currentItem.bgGradient,
        ["--hero-ink" as any]: currentItem.colorHex,
      }}
      className="relative w-full h-[calc(100dvh-32px)] max-h-[calc(100dvh-32px)] lg:h-[100dvh] lg:max-h-[100dvh] flex flex-col justify-between overflow-hidden text-white select-none isolate pb-2 lg:pb-0"
      aria-label="Horvvalle Atelier Hero"
    >
      {/* =========================================================================
          MAIN HERO CONTENT (Left Typography, Center Product, Right Spec)
          ========================================================================= */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-20 pb-1 sm:pb-2 lg:pb-1 flex-1 flex flex-col justify-center min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-4 lg:gap-8 items-center w-full my-auto">
          
          {/* =====================================================================
              LEFT COLUMN: HEADLINE (EB Garamond) + DESCRIPTION + CTAS
              ===================================================================== */}
          <div className="lg:col-span-4 flex flex-col justify-center space-y-1.5 sm:space-y-3 text-center lg:text-left order-2 lg:order-1">
            {/* Headline */}
            <h1 className="font-eb-garamond text-xl sm:text-2xl lg:text-[2.2rem] xl:text-[2.45rem] font-normal leading-[1.12] tracking-tight">
              {language === "az" ? (
                <>
                  <span>Sənin ölçün,</span>
                  <span className="block italic text-[#E6C280]">sənin üslubun.</span>
                </>
              ) : language === "en" ? (
                <>
                  <span>Your fit,</span>
                  <span className="block italic text-[#E6C280]">your style.</span>
                </>
              ) : language === "ru" ? (
                <>
                  <span>Твой размер,</span>
                  <span className="block italic text-[#E6C280]">твой стиль.</span>
                </>
              ) : (
                <>
                  <span>Senin bedenin,</span>
                  <span className="block italic text-[#E6C280]">senin stilin.</span>
                </>
              )}
            </h1>

            {/* Localized Description (compact on mobile) */}
            <p className="text-white/80 text-[11px] sm:text-[13.5px] leading-relaxed max-w-xs sm:max-w-sm mx-auto lg:mx-0 font-sans line-clamp-2 sm:line-clamp-none">
              {language === "az"
                ? "Atelyedə hər geyim ölçünə görə tikilir, istədiyin dizayn isə canlı DTG çapla köynəyə köçürülür."
                : language === "en"
                ? "Every garment is crafted to your exact fit, with bespoke DTG prints brought to life."
                : language === "ru"
                ? "Каждая вещь шьется точно по вашей фигуре, а ваш дизайн переносится живой печатью DTG."
                : "Her kıyafet bedeninize özel dikilir, dilediğiniz tasarım canlı DTG baskıyla hayata geçer."}
            </p>

            {/* Shared UI Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-0.5 sm:pt-1">
              <Button variant="primary" href="/studio" className="!px-3.5 !py-1.5 sm:!px-5 sm:!py-2.5 text-xs sm:text-sm">
                <span>{t.hero.designBtn || "Fərdi Studiyada dizayn et"}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Button>

              <Button variant="secondary" href="/collections" className="!px-3.5 !py-1.5 sm:!px-5 sm:!py-2.5 text-xs sm:text-sm">
                {t.hero.collectionBtn || "Kolleksiyaya bax"}
              </Button>
            </div>
          </div>

          {/* =====================================================================
              CENTER COLUMN: DYNAMIC PRODUCT ON HANGER/CUTOUT + OVAL SHADOW + ‹ ›
              ===================================================================== */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center order-1 lg:order-2 my-1 lg:my-0">
            <div className="relative w-full flex flex-col items-center justify-center">
              
              {/* Product with Horizontal Right-to-Left / Left-to-Right Entrance */}
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentItem.id}
                  custom={direction}
                  variants={productVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full flex flex-col items-center justify-center overflow-visible"
                >
                  {/* Floating Garment Container - Clickable to open Product Details */}
                  <Link
                    href={`/products/${currentItem.slug}`}
                    className="group cursor-pointer relative flex flex-col items-center justify-center focus:outline-none"
                    aria-label={`Məhsula bax: ${currentItem.name}`}
                  >
                    {/* Transparent Cutout Image with natural ambient shadow */}
                    <div className="relative select-none drop-shadow-[0_16px_28px_rgba(0,0,0,0.52)] transition-transform duration-300 group-hover:scale-[1.03] w-[200px] xs:w-[240px] sm:w-[320px] lg:w-[420px] h-[21vh] xs:h-[24vh] sm:h-[32vh] lg:h-[44vh] max-h-[380px] min-h-[160px]">
                      <Image
                        src={currentItem.image}
                        alt={currentItem.name}
                        fill
                        priority
                        sizes="(max-width: 640px) 240px, (max-width: 1024px) 320px, 420px"
                        className="object-contain"
                      />
                    </div>
                  </Link>

                  {/* Oval Blurred Floating Drop Shadow Directly Beneath the Garment */}
                  <div
                    className="w-28 xs:w-32 sm:w-44 h-2.5 sm:h-3.5 bg-black/45 rounded-[50%] blur-md mt-1 pointer-events-none select-none"
                    aria-hidden="true"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ‹ › Slider Controls positioned directly UNDER the product */}
            <div className="flex items-center justify-center gap-8 sm:gap-16 mt-1 sm:mt-1.5 z-20">
              <Button
                variant="arrow"
                arrowDirection="left"
                onClick={handlePrev}
                aria-label="Əvvəlki məhsul"
                className="!w-8 !h-8 sm:!w-10 sm:!h-10"
              />

              <Button
                variant="arrow"
                arrowDirection="right"
                onClick={handleNext}
                aria-label="Növbəti məhsul"
                className="!w-8 !h-8 sm:!w-10 sm:!h-10"
              />
            </div>
          </div>

          {/* =====================================================================
              RIGHT COLUMN: PRODUCT TITLE + PRICE + COMPARE PRICE + SIZE CIRCLES
              ===================================================================== */}
          <div className="lg:col-span-3 flex flex-col items-center lg:items-end justify-center space-y-1.5 sm:space-y-3.5 text-center lg:text-right order-3">
            {/* Product Title and Price Block with Direct Product Link */}
            <Link
              href={`/products/${currentItem.slug}`}
              className="group hover:opacity-90 transition block focus:outline-none"
            >
              <div className="text-[10px] sm:text-xs uppercase tracking-[0.14em] font-medium text-white/80 group-hover:text-white transition-colors line-clamp-1 sm:line-clamp-2 max-w-xs">
                {currentItem.title}
              </div>
              <div className="text-xl sm:text-2xl lg:text-[2.5rem] font-bold text-white tracking-tight leading-none mt-0.5 sm:mt-1">
                {currentItem.price}
              </div>
              {currentItem.compareAtPrice && (
                <div className="line-through text-white/75 text-xs sm:text-sm font-normal mt-0.5">
                  {currentItem.compareAtPrice}
                </div>
              )}
            </Link>

            {/* Size Selector */}
            <div className="pt-0.5">
              <span className="text-white/80 text-[10px] sm:text-xs font-medium block mb-1 sm:mb-1.5">
                {t.hero.selectSize || "Ölçünü seç"}
              </span>

              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center lg:justify-end">
                {currentItem.sizes.map((size) => (
                  <SizeChip
                    key={size}
                    size={size}
                    active={selectedSize === size}
                    onClick={() => setSelectedSize(size)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM ROW: SOCIAL ICONS (LEFT), SLOGAN (CENTER), NEXT THUMBNAIL (RIGHT)
          ========================================================================= */}
      <div className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 sm:pb-5 lg:pb-4 pt-1 sm:pt-2 flex items-center justify-between shrink-0">
        
        {/* Left: Social Media Icons */}
        <div className="flex items-center gap-1 text-white/90">
          {/* Instagram */}
          <a
            href="https://www.instagram.com/horwalle?vrfl=dGJ0anppbmYyeXRy&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </a>

          {/* TikTok */}
          <a
            href="https://www.tiktok.com/@horwalle"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
            </svg>
          </a>
        </div>

        {/* Center: Multilingual Slogan in EB Garamond */}
        <div className="font-eb-garamond text-center text-white/95 text-xs sm:text-base lg:text-lg leading-tight px-2">
          {language === "az" ? (
            <>
              <div>Daha yaxşı geyin. Daha yaxşı hiss et.</div>
            </>
          ) : language === "en" ? (
            <>
              <div>Dress better. Feel better.</div>
            </>
          ) : language === "ru" ? (
            <>
              <div>Одевайся лучше. Чувствуй лучше.</div>
            </>
          ) : (
            <>
              <div>Daha iyi giyin. Daha iyi hisset.</div>
            </>
          )}
        </div>

        {/* Right: Next Product Mini Thumbnail */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={handleNext}
            aria-label={`${language === "az" ? "Növbəti məhsul" : "Next"}: ${nextItem.title}`}
            className="group cursor-pointer flex items-center gap-1.5 hover:scale-105 transition-transform"
          >
            <span className="hidden sm:inline-block text-[11px] font-medium uppercase tracking-wider text-white/70">
              {language === "az" ? "Növbəti" : "Next"}
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex items-center justify-center">
              <Image
                src={nextItem.image}
                alt={nextItem.title}
                fill
                sizes="40px"
                className="object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]"
              />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
