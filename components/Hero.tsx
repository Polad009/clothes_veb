"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { SizeChip } from "@/components/ui/SizeChip";

interface HeroProductItem {
  id: string;
  name: string;
  category: string;
  title: string;
  price: string;
  compareAtPrice?: string;
  colorHex: string;
  image: string;
  bgGradient: string;
  headerBg: string;
  topGradient: string;
}

const HERO_PRODUCTS: HeroProductItem[] = [
  {
    id: "linen-shirt",
    name: "Kətan",
    category: "koynek",
    title: "Klassik qəhvəyi kətan",
    price: "58₼",
    compareAtPrice: "75₼",
    colorHex: "#8C6541",
    image: "/shirts/keten-koynek.png",
    bgGradient: "radial-gradient(circle at 50% 36%, #7D4C28 0%, #542E13 48%, #2A1406 100%)",
    headerBg: "#542E13",
    topGradient: "linear-gradient(180deg, #3A1B07 0%, #542E13 100%)",
  },
  {
    id: "magenta-tee",
    name: "Pambıq",
    category: "koynek",
    title: "Canlı magenta pambıq t-shirt",
    price: "45₼",
    compareAtPrice: "60₼",
    colorHex: "#E60067",
    image: "/shirts/magenta.png",
    bgGradient: "radial-gradient(circle at 50% 36%, #A80D4E 0%, #6E0530 48%, #360216 100%)",
    headerBg: "#6E0530",
    topGradient: "linear-gradient(180deg, #42021B 0%, #6E0530 100%)",
  },
  {
    id: "black-hoodie",
    name: "Qalın",
    category: "hudi",
    title: "3iplik qalın qara hudi",
    price: "78₼",
    compareAtPrice: "95₼",
    colorHex: "#111111",
    image: "/shirts/hudi-qara.png",
    bgGradient: "radial-gradient(circle at 50% 36%, #2F3138 0%, #18191D 48%, #090A0D 100%)",
    headerBg: "#18191D",
    topGradient: "linear-gradient(180deg, #090A0D 0%, #18191D 100%)",
  },
  {
    id: "khaki-cargo",
    name: "Şalvar",
    category: "salvar",
    title: "Xaki kargo şalvar",
    price: "65₼",
    compareAtPrice: "80₼",
    colorHex: "#706A4F",
    image: "/shirts/kargo-salvar.png",
    bgGradient: "radial-gradient(circle at 50% 36%, #55573D 0%, #3B3C2A 48%, #1D1E14 100%)",
    headerBg: "#3B3C2A",
    topGradient: "linear-gradient(180deg, #1E1F15 0%, #3B3C2A 100%)",
  },
  {
    id: "white-tee",
    name: "Ağ",
    category: "koynek",
    title: "Ağ klassik pambıq t-shirt",
    price: "40₼",
    compareAtPrice: "55₼",
    colorHex: "#EAEAEA",
    image: "/shirts/ag-tisort.png",
    bgGradient: "radial-gradient(circle at 50% 36%, #5A5E66 0%, #383A3F 48%, #1C1D20 100%)",
    headerBg: "#383A3F",
    topGradient: "linear-gradient(180deg, #1C1D20 0%, #383A3F 100%)",
  },
];

const SIZES = ["XL", "2XL", "3XL", "4XL"];

export function Hero() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>("XL");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const currentItem = HERO_PRODUCTS[currentIndex];
  const nextIndex = (currentIndex + 1) % HERO_PRODUCTS.length;
  const nextItem = HERO_PRODUCTS[nextIndex];

  // Sync active slide color to document body, root and adaptive scrollbar
  useEffect(() => {
    if (typeof document === "undefined") return;

    const updateScrollbar = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const isPastHero = scrollY > 400;

      if (isPastHero) {
        // Scrolled down into white / cream atelier content: light scrollbar
        document.documentElement.style.setProperty("--scrollbar-track", "#FAF7F2");
        document.documentElement.style.setProperty("--scrollbar-thumb", "#D5CEBF");
        document.documentElement.style.setProperty("--scrollbar-thumb-hover", "#B08D57");
      } else {
        // At top in Hero: scrollbar matches active garment and hero background
        document.documentElement.style.setProperty("--scrollbar-track", currentItem.headerBg);
        document.documentElement.style.setProperty("--scrollbar-thumb", currentItem.colorHex);
        document.documentElement.style.setProperty("--scrollbar-thumb-hover", "#E6C280");
      }
    };

    document.documentElement.style.setProperty("--hero-header-bg", currentItem.headerBg);
    document.documentElement.style.setProperty("--hero-top-gradient", currentItem.topGradient);
    document.documentElement.style.setProperty("--hero-bg", currentItem.bgGradient);
    document.documentElement.style.setProperty("--hero-ink", currentItem.colorHex);

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
  }, [currentIndex, currentItem]);

  // Slider navigation
  const handleNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % HERO_PRODUCTS.length);
    setTimeout(() => setIsAnimating(false), 550);
  }, [isAnimating]);

  const handlePrev = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + HERO_PRODUCTS.length) % HERO_PRODUCTS.length);
    setTimeout(() => setIsAnimating(false), 550);
  }, [isAnimating]);

  // Keyboard navigation (ArrowLeft & ArrowRight)
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

  // Slider animation: Köhnə məhsul aşağı sürüşür (y: 110%), yenisi yuxarıdan enir (y: -110% -> 0)
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
      className="relative w-full h-[100dvh] min-h-[600px] max-h-[100dvh] flex flex-col justify-between overflow-hidden text-white select-none isolate"
      aria-label="Horvvalle Atelier Hero"
    >
      {/* =========================================================================
          MAIN HERO CONTENT (Left Typography, Center Product, Right Spec)
          ========================================================================= */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-24 pb-1 flex-1 flex flex-col justify-center min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center w-full">
          
          {/* =====================================================================
              LEFT COLUMN: HEADLINE (EB Garamond) + DESCRIPTION + CTAS
              ===================================================================== */}
          <div className="lg:col-span-4 flex flex-col justify-center space-y-3 text-left order-2 lg:order-1">
            {/* Headline: EB Garamond, zərif və kompakt */}
            <h1 className="font-eb-garamond text-2xl sm:text-3xl lg:text-[2.2rem] xl:text-[2.45rem] font-normal leading-[1.12] tracking-tight">
              <span>Sənin ölçün,</span>
              <span className="block italic text-[#E6C280]">sənin üslubun.</span>
            </h1>

            {/* Azerbaijani Description */}
            <p className="text-white/80 text-xs sm:text-[13.5px] leading-relaxed max-w-sm font-sans">
              Atelyedə hər geyim ölçünə görə tikilir, istədiyin dizayn isə canlı 3D çapla köynəyə köçürülür.
            </p>

            {/* Shared UI Buttons: Primary "3D Studiyada dizayn et" + Secondary "Kolleksiyaya bax" */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
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
              CENTER COLUMN: PRODUCT ON WOODEN HANGER + OVAL SHADOW + ‹ › CONTROLS
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
                  {/* Floating Garment Container (~55-60% of viewport height) */}
                  <div className="relative flex flex-col items-center justify-center">
                    
                    {/* Transparent Cutout Image with natural wooden hanger */}
                    <img
                      src={currentItem.image}
                      alt={currentItem.title}
                      className={`w-auto object-contain pointer-events-none select-none drop-shadow-[0_22px_38px_rgba(0,0,0,0.48)] transition-transform duration-300 ${
                        currentItem.id === "khaki-cargo"
                          ? "h-[36vh] sm:h-[39vh] lg:h-[42vh] max-h-[400px] min-h-[220px]"
                          : "h-[38vh] sm:h-[42vh] lg:h-[45vh] max-h-[430px] min-h-[240px]"
                      }`}
                      loading="eager"
                    />
                  </div>

                  {/* Oval Blurred Floating Drop Shadow Directly Beneath the Garment */}
                  <div
                    className="w-36 sm:w-48 h-3.5 sm:h-4 bg-black/45 rounded-[50%] blur-md mt-1.5 pointer-events-none select-none"
                    aria-hidden="true"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ‹ › Slider Controls positioned directly UNDER the product (using shared Button variant="arrow") */}
            <div className="flex items-center justify-center gap-12 sm:gap-20 mt-1.5 sm:mt-2 z-20">
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
          <div className="lg:col-span-3 flex flex-col lg:items-end justify-center space-y-5 text-left lg:text-right order-3">
            {/* Product Title and Price Block */}
            <div>
              <div className="text-xs uppercase tracking-[0.14em] font-medium text-white/75">
                {currentItem.title}
              </div>
              <div className="text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-white tracking-tight leading-none mt-1">
                {currentItem.price}
              </div>
              {currentItem.compareAtPrice && (
                <div className="line-through text-white/55 text-base sm:text-lg font-normal mt-1">
                  {currentItem.compareAtPrice}
                </div>
              )}
            </div>

            {/* Size Selector: XL (Active White) / 2XL / 3XL / 4XL (using shared SizeChip) */}
            <div className="pt-1">
              <span className="text-white/90 text-xs sm:text-sm font-medium block mb-2.5">
                Ölçünü seç
              </span>

              <div className="flex items-center gap-2 flex-wrap justify-start lg:justify-end">
                {SIZES.map((size) => (
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
      <div className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-5 lg:pb-6 pt-1 flex items-end justify-between shrink-0">
        
        {/* Bottom-Left: Social Media Icons */}
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

        {/* Bottom-Center: Azerbaijani Slogan in EB Garamond */}
        <div className="font-eb-garamond text-center text-white/95 text-lg sm:text-2xl leading-snug">
          <div>Daha yaxşı geyin.</div>
          <div>Daha yaxşı hiss et.</div>
        </div>

        {/* Bottom-Right: Next Product Mini Thumbnail */}
        <button
          type="button"
          onClick={handleNext}
          aria-label={`Növbəti məhsul: ${nextItem.title}`}
          className="group cursor-pointer flex items-center justify-center p-1 hover:scale-110 transition-transform"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
            <img
              src={nextItem.image}
              alt={nextItem.title}
              className="w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] transition-transform duration-300 group-hover:scale-110 pointer-events-none select-none"
            />
          </div>
        </button>
      </div>
    </section>
  );
}
