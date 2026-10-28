"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { SizeChip } from "@/components/ui/SizeChip";
import { useStoreData } from "@/context/StoreDataContext";
import { useCurrency } from "@/context/CurrencyContext";

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
    price: "89₼",
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
  const { formatPrice } = useCurrency();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>("L");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

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
        subtitle: p.fit || p.composition || p.category,
        price: formatPrice(p.price),
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
  }, [products, formatPrice]);

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
    setCurrentIndex((prev) => (prev + 1) % total);
    setTimeout(() => setIsAnimating(false), 550);
  }, [isAnimating, total]);

  const handlePrev = useCallback(() => {
    if (isAnimating || total === 0) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
    setTimeout(() => setIsAnimating(false), 550);
  }, [isAnimating, total]);

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

  // Slider animation
  const productVariants = {
    initial: {
      y: "-110%",
      opacity: 0,
      scale: 0.96,
    },
    animate: {
      y: "0%",
      opacity: 1,
      scale: 1,
      transition: {
        y: { type: "spring", stiffness: 240, damping: 26 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 },
      },
    },
    exit: {
      y: "110%",
      opacity: 0,
      scale: 0.96,
      transition: {
        duration: 0.48,
        ease: [0.55, 0, 0.55, 0.2],
      },
    },
  };

  return (
    <section
      id="hero-section"
      style={{
        background: currentItem.bgGradient,
        transition: "background 0.75s ease-in-out",
        ["--hero-bg" as any]: currentItem.bgGradient,
        ["--hero-ink" as any]: currentItem.colorHex,
      }}
      className="relative w-full min-h-[100dvh] h-auto lg:h-[100dvh] lg:max-h-[100dvh] -mt-[88px] sm:-mt-[96px] flex flex-col justify-between overflow-x-hidden lg:overflow-hidden text-white select-none isolate"
      aria-label="Horvvalle Atelier Hero"
    >
      {/* =========================================================================
          MAIN HERO CONTENT (Left Typography, Center Product, Right Spec)
          ========================================================================= */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-24 pb-2 lg:pb-1 flex-1 flex flex-col justify-center min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center w-full">
          
          {/* =====================================================================
              LEFT COLUMN: HEADLINE (EB Garamond) + DESCRIPTION + CTAS
              ===================================================================== */}
          <div className="lg:col-span-4 flex flex-col justify-center space-y-3 sm:space-y-3.5 text-center lg:text-left order-2 lg:order-1">
            {/* Headline */}
            <h1 className="font-eb-garamond text-2xl sm:text-3xl lg:text-[2.2rem] xl:text-[2.45rem] font-normal leading-[1.14] tracking-tight">
              <span>Sənin ölçün,</span>
              <span className="block italic text-[#E6C280]">sənin üslubun.</span>
            </h1>

            {/* Azerbaijani Description */}
            <p className="text-white/80 text-xs sm:text-[13.5px] leading-relaxed max-w-sm mx-auto lg:mx-0 font-sans">
              Atelyedə hər geyim ölçünə görə tikilir, istədiyin dizayn isə canlı 3D çapla köynəyə köçürülür.
            </p>

            {/* Shared UI Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-1">
              <Button variant="primary" href="/studio">
                <span>3D Studiyada dizayn et</span>
                <svg
                  width="13"
                  height="13"
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

              <Button variant="secondary" href="/collections">
                Kolleksiyaya bax
              </Button>
            </div>
          </div>

          {/* =====================================================================
              CENTER COLUMN: DYNAMIC PRODUCT ON HANGER/CUTOUT + OVAL SHADOW + ‹ ›
              ===================================================================== */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center order-1 lg:order-2 my-2 lg:my-0">
            <div className="relative w-full flex flex-col items-center justify-center">
              
              {/* Product with Downward Exit / Topward Entrance */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentItem.id}
                  variants={productVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full flex flex-col items-center justify-center"
                >
                  {/* Floating Garment Container - Clickable to open Product Details */}
                  <Link
                    href={`/products/${currentItem.slug}`}
                    className="group cursor-pointer relative flex flex-col items-center justify-center focus:outline-none"
                    aria-label={`Məhsula bax: ${currentItem.name}`}
                  >
                    {/* Transparent Cutout Image with natural ambient shadow */}
                    <div className="relative select-none drop-shadow-[0_22px_38px_rgba(0,0,0,0.52)] transition-transform duration-300 group-hover:scale-[1.03] w-[300px] sm:w-[360px] lg:w-[430px] h-[30vh] sm:h-[36vh] lg:h-[45vh] max-h-[430px] min-h-[200px]">
                      <Image
                        src={currentItem.image}
                        alt={currentItem.name}
                        fill
                        priority
                        sizes="(max-width: 640px) 300px, (max-width: 1024px) 360px, 430px"
                        className="object-contain"
                      />
                    </div>
                  </Link>

                  {/* Oval Blurred Floating Drop Shadow Directly Beneath the Garment */}
                  <div
                    className="w-36 sm:w-48 h-3.5 sm:h-4 bg-black/45 rounded-[50%] blur-md mt-1.5 pointer-events-none select-none"
                    aria-hidden="true"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ‹ › Slider Controls positioned directly UNDER the product */}
            <div className="flex items-center justify-center gap-10 sm:gap-20 mt-1.5 sm:mt-2 z-20">
              <Button
                variant="arrow"
                arrowDirection="left"
                onClick={handlePrev}
                aria-label="Əvvəlki məhsul"
              />

              <Button
                variant="arrow"
                arrowDirection="right"
                onClick={handleNext}
                aria-label="Növbəti məhsul"
              />
            </div>
          </div>

          {/* =====================================================================
              RIGHT COLUMN: PRODUCT TITLE + PRICE + COMPARE PRICE + SIZE CIRCLES
              ===================================================================== */}
          <div className="lg:col-span-3 flex flex-col items-center lg:items-end justify-center space-y-3 sm:space-y-4 text-center lg:text-right order-3">
            {/* Product Title and Price Block with Direct Product Link */}
            <Link
              href={`/products/${currentItem.slug}`}
              className="group hover:opacity-90 transition block focus:outline-none"
            >
              <div className="text-[11px] sm:text-xs uppercase tracking-[0.14em] font-medium text-white/80 group-hover:text-white transition-colors line-clamp-2 max-w-xs">
                {currentItem.title}
              </div>
              <div className="text-2xl sm:text-3xl lg:text-[2.6rem] font-bold text-white tracking-tight leading-none mt-1">
                {currentItem.price}
              </div>
              {currentItem.compareAtPrice && (
                <div className="line-through text-white/55 text-sm sm:text-base font-normal mt-0.5">
                  {currentItem.compareAtPrice}
                </div>
              )}
            </Link>

            {/* Size Selector */}
            <div className="pt-0.5">
              <span className="text-white/90 text-xs sm:text-sm font-medium block mb-2">
                Ölçünü seç
              </span>

              <div className="flex items-center gap-2 flex-wrap justify-center lg:justify-end">
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
      <div className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-5 sm:pb-6 lg:pb-6 pt-3 mt-4 lg:mt-0 flex flex-col sm:flex-row items-center justify-between shrink-0 gap-3.5 sm:gap-4">
        
        {/* Left: Social Media Icons + Mobile Thumbnail Toggle */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-4 order-2 sm:order-1">
          <div className="flex items-center gap-3.5 sm:gap-4 text-white/90">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:opacity-75 transition-opacity cursor-pointer p-0.5"
            >
              <svg
                width="17"
                height="17"
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

            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              className="hover:opacity-75 transition-opacity cursor-pointer p-0.5"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
              </svg>
            </a>

            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="hover:opacity-75 transition-opacity cursor-pointer p-0.5"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>

            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="hover:opacity-75 transition-opacity cursor-pointer p-0.5"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>

            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="hover:opacity-75 transition-opacity cursor-pointer p-0.5"
            >
              <svg
                width="17"
                height="17"
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

          {/* Mobile-only compact Next Product Preview */}
          <button
            type="button"
            onClick={handleNext}
            aria-label={`Növbəti məhsul: ${nextItem.title}`}
            className="sm:hidden flex items-center gap-1.5 text-xs text-white/80 hover:text-white transition cursor-pointer"
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/70">Növbəti</span>
            <div className="w-8 h-8 relative flex items-center justify-center">
              <Image
                src={nextItem.image}
                alt={nextItem.title}
                fill
                sizes="32px"
                className="object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
              />
            </div>
          </button>
        </div>

        {/* Center: Azerbaijani Slogan in EB Garamond */}
        <div className="font-eb-garamond text-center text-white/95 text-lg sm:text-xl lg:text-2xl leading-snug order-1 sm:order-2">
          <div>Daha yaxşı geyin.</div>
          <div>Daha yaxşı hiss et.</div>
        </div>

        {/* Desktop/Tablet: Next Product Mini Thumbnail */}
        <div className="hidden sm:flex order-3 shrink-0">
          <button
            type="button"
            onClick={handleNext}
            aria-label={`Növbəti məhsul: ${nextItem.title}`}
            className="group cursor-pointer flex items-center justify-center p-1 hover:scale-110 transition-transform shrink-0"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 relative flex items-center justify-center">
              <Image
                src={nextItem.image}
                alt={nextItem.title}
                fill
                sizes="64px"
                className="object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] transition-transform duration-300 group-hover:scale-110 pointer-events-none select-none"
              />
            </div>
          </button>
        </div>
      </div>

      {/* Seamless bottom brown extension to eliminate any subpixel/scaling white gap */}
      <div
        style={{ background: currentItem.bgGradient }}
        className="absolute -bottom-8 inset-x-0 h-10 pointer-events-none z-10"
        aria-hidden="true"
      />
    </section>
  );
}
