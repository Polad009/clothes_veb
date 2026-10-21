"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export interface StageProduct {
  id: string;
  name: string;
  category: string;
  code: string;
  title: string;
  price: string;
  image: string;
  hex: string;
  tagline: string;
  // Stage Theme Palette
  bg: string;
  fg: string;
  muted: string;
  buttonBg: string;
  buttonFg: string;
}

const STAGE_PRODUCTS: StageProduct[] = [
  {
    id: "oxford",
    name: "Ağ",
    category: "koynek",
    code: "№ 01",
    title: "Klassik Ağ Oxford",
    price: "55₼",
    image: "/images/products/white-oxford-button-down-shirt/mockup.jpg",
    hex: "#FAF6EF",
    tagline: "100% daranmış pambıq · 220 GSM",
    bg: "#F3EDE3", // cream
    fg: "#2E1A22", // oxblood
    muted: "#6B5E52", // contrast-verified > 4.5:1 on #F3EDE3
    buttonBg: "#2E1A22",
    buttonFg: "#FAF6EF",
  },
  {
    id: "hoodie",
    name: "Qalın",
    category: "hudi",
    code: "№ 02",
    title: "3iplik Qalın Qara Hudi",
    price: "78₼",
    image: "/images/products/heavyweight-hoodie-black/mockup.jpg",
    hex: "#1F1B1D",
    tagline: "Qalın 380 GSM toxuma",
    bg: "#2E1A22", // oxblood
    fg: "#F3EDE3", // cream
    muted: "#A89C8D", // contrast-verified > 4.5:1 on #2E1A22
    buttonBg: "#FAF6EF",
    buttonFg: "#2E1A22",
  },
  {
    id: "linen",
    name: "Kətan",
    category: "koynek",
    code: "№ 03",
    title: "Bej Kətan Yay Köynəyi",
    price: "62₼",
    image: "/images/products/beige-linen-relaxed-shirt/mockup.jpg",
    hex: "#D8C7B0",
    tagline: "Təbii fransız kətanı · 190 GSM",
    bg: "#E4D9C4", // khaki
    fg: "#2E1A22", // oxblood
    muted: "#5E5244", // contrast-verified > 4.5:1 on #E4D9C4
    buttonBg: "#2E1A22",
    buttonFg: "#FAF6EF",
  },
  {
    id: "tailored",
    name: "Qəhvəyi",
    category: "koynek",
    code: "№ 04",
    title: "Klassik Qəhvəyi Kətan",
    price: "58₼",
    image: "/images/products/black-tailored-cotton-shirt/mockup.jpg",
    hex: "#8C735A",
    tagline: "Xalis daranmış pambıq · Dəqiq kəsim",
    bg: "#D8C9AE", // sand
    fg: "#3B1F2B", // oxblood-2
    muted: "#5A4839", // contrast-verified > 4.5:1 on #D8C9AE
    buttonBg: "#3B1F2B",
    buttonFg: "#FAF6EF",
  },
];

const SIZES = ["XL", "2XL", "3XL", "4XL"];

export function EditorialHero({ introRevealed = true }: { introRevealed?: boolean }) {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [stageState, setStageState] = useState<"idle" | "exiting" | "entering">("idle");
  const [isSettling, setIsSettling] = useState<boolean>(false);
  const [selectedSize, setSelectedSize] = useState<string>("XL");
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  const activeProduct = STAGE_PRODUCTS[activeIdx];
  const nextIdx = (activeIdx + 1) % STAGE_PRODUCTS.length;
  const nextProduct = STAGE_PRODUCTS[nextIdx];

  // Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(media.matches);
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, []);

  // Choreographed Product Switch
  const triggerSwitch = useCallback(
    (targetIdx: number) => {
      if (targetIdx === activeIdx) return;
      if (reducedMotion) {
        setActiveIdx(targetIdx);
        return;
      }
      if (stageState !== "idle") return;

      // 1. Current product + hanger: translateY(-110%), scale(0.96), fade out (0.55s)
      setStageState("exiting");

      // 2. Simultaneously change active index after 550ms exit completes
      setTimeout(() => {
        setActiveIdx(targetIdx);
        setStageState("entering");
        setIsSettling(true);

        // 3. New product enters: translateY(-110%) -> 0 (0.7s)
        setTimeout(() => {
          setStageState("idle");
        }, 700);

        // 4. Hanger damp swing settles over 2000ms
        setTimeout(() => {
          setIsSettling(false);
        }, 2000);
      }, 550);
    },
    [activeIdx, stageState, reducedMotion]
  );

  const handleNext = useCallback(() => {
    triggerSwitch((activeIdx + 1) % STAGE_PRODUCTS.length);
  }, [activeIdx, triggerSwitch]);

  const handlePrev = useCallback(() => {
    triggerSwitch((activeIdx - 1 + STAGE_PRODUCTS.length) % STAGE_PRODUCTS.length);
  }, [activeIdx, triggerSwitch]);

  // Auto-advance every 7s (pauses on hover & hidden tab)
  useEffect(() => {
    if (reducedMotion) return;

    let timer: NodeJS.Timeout | null = null;

    const startTimer = () => {
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        if (!isHovered && typeof document !== "undefined" && !document.hidden) {
          handleNext();
        }
      }, 7000);
    };

    startTimer();

    const handleVisibility = () => {
      if (document.hidden && timer) {
        clearInterval(timer);
      } else {
        startTimer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isHovered, handleNext, reducedMotion]);

  // Mouse Parallax (opposite cursor, max 12px)
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (reducedMotion || (typeof window !== "undefined" && window.innerWidth <= 768)) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseOffset({
      x: -normX * 24, // max 12px
      y: -normY * 24, // max 12px
    });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
    setIsHovered(false);
  };

  // Compute transform & transition for Product + Wooden Hanger
  const getProductTransform = () => {
    if (reducedMotion) return "none";
    if (stageState === "exiting") {
      return "translate3d(0, -110%, 0) scale(0.96)";
    }
    if (stageState === "entering") {
      return "translate3d(0, 0, 0) scale(1)";
    }
    return `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0)`;
  };

  const getProductTransition = () => {
    if (reducedMotion) return "none";
    if (stageState === "exiting") {
      return "transform 0.55s cubic-bezier(0.55, 0, 0.55, 0.2), opacity 0.55s cubic-bezier(0.55, 0, 0.55, 0.2)";
    }
    if (stageState === "entering") {
      return "transform 0.7s cubic-bezier(0.22, 1.4, 0.36, 1), opacity 0.45s ease";
    }
    return "transform 0.25s cubic-bezier(0.2, 0, 0, 1)";
  };

  const marqueeText =
    "DARANMIŞ PAMBIQ ✦ CANLI 3D ÇAP ✦ FƏRDİ ATELYE ✦ BAKI ÜZRƏ KURYER ✦ DARANMIŞ PAMBIQ ✦ CANLI 3D ÇAP ✦ FƏRDİ ATELYE ✦ BAKI ÜZRƏ KURYER ✦ ";

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={
        {
          "--stage-bg": activeProduct.bg,
          "--stage-fg": activeProduct.fg,
          "--stage-muted": activeProduct.muted,
          backgroundColor: activeProduct.bg,
          color: activeProduct.fg,
          transition: reducedMotion
            ? "none"
            : "background-color 0.8s ease, color 0.8s ease",
        } as React.CSSProperties
      }
      className="relative w-full min-h-[calc(100vh-74px)] sm:min-h-[calc(100vh-80px)] flex flex-col justify-between overflow-hidden select-none"
      aria-label="Horvvalle Atelier Hero"
    >
      {/* =========================================================================
          AUTHENTIC SVG PAPER GRAIN OVERLAY (Persists on ALL themes at 3% opacity)
          ========================================================================= */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.032] mix-blend-multiply z-0"
      >
        <filter id="atelierStageGrain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#atelierStageGrain)" />
      </svg>

      {/* =========================================================================
          MAIN EDITORIAL GRID: LEFT (TYPOGRAPHY) / CENTER (PRODUCT) / RIGHT (SPEC)
          ========================================================================= */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 lg:pt-12 pb-6 sm:pb-8 flex-1 flex flex-col justify-center">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-6 items-center w-full">
          
          {/* =====================================================================
              ZONE 1 (LEFT / Mobile Order 1 & 4): HEADLINE BLOCK & CTAS
              ===================================================================== */}
          <div className="w-full lg:col-span-4 flex flex-col justify-center space-y-5 sm:space-y-6 order-1 lg:order-1">
            
            {/* Eyebrow: 11px uppercase, brass, tracking 0.14em, 80px hairline after */}
            <div className="flex items-center gap-3">
              <span className="text-[#9A7B4F] text-xs leading-none select-none">◆</span>
              <span className="text-[11px] uppercase tracking-[0.14em] font-['Instrument_Sans',sans-serif] font-medium text-[#9A7B4F]">
                HORVVALLE ATELIER — BAKI
              </span>
              <span className="w-[80px] h-[1px] bg-[#9A7B4F] shrink-0" />
            </div>

            {/* Headline (Fraunces, 3 lines, line-mask reveal 0.9s cubic-bezier(0.22,1,0.36,1), stagger 0.12s) */}
            <h1 className="space-y-0 font-fraunces leading-[1.04] tracking-[-0.025em] text-[2.75rem] sm:text-[3.5rem] lg:text-[3.8rem] xl:text-[4.2rem] transition-colors duration-700">
              <div className="overflow-hidden">
                <motion.div
                  initial={reducedMotion ? false : { y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 0.9,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.05,
                  }}
                  className="block"
                >
                  Pambığın ən incə
                </motion.div>
              </div>

              <div className="overflow-hidden">
                <motion.div
                  initial={reducedMotion ? false : { y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 0.9,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.17,
                  }}
                  className="block"
                >
                  <span className="italic text-[#9A7B4F] font-normal">forması,</span>
                </motion.div>
              </div>

              <div className="overflow-hidden">
                <motion.div
                  initial={reducedMotion ? false : { y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 0.9,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.29,
                  }}
                  className="block"
                >
                  üzərinə işlənir.
                </motion.div>
              </div>
            </h1>

            {/* Body Copy (max 44ch, muted color auto-inverts per stage theme) */}
            <p
              style={{ color: "var(--stage-muted)" }}
              className="max-w-[44ch] text-[14px] sm:text-[15px] leading-relaxed font-['Instrument_Sans',sans-serif] font-normal transition-colors duration-700"
            >
              Daranmış premium pambıq, dəqiq kəsim və canlı 3D çap — hər sifariş
              atelyedə hazırlanır.
            </p>

            {/* CTAs (Desktop) */}
            <div className="hidden lg:flex items-center gap-6 pt-2">
              {/* Primary CTA: solid pill, 3px radius, auto-inverts per theme */}
              <Link
                href="/studio"
                style={{
                  backgroundColor: activeProduct.buttonBg,
                  color: activeProduct.buttonFg,
                }}
                className="group relative inline-flex items-center justify-center px-6 py-3.5 text-[13px] uppercase tracking-[0.08em] font-['Instrument_Sans',sans-serif] font-semibold rounded-[3px] border border-[#9A7B4F]/40 hover:border-[#9A7B4F] transition-all duration-300 cursor-pointer shadow-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#9A7B4F]"
              >
                <span>3D Studiyada dizayn et</span>
                {/* Thin SVG arrow translates 4px on hover */}
                <svg
                  className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M 3 8 L 13 8 M 9 4 L 13 8 L 9 12"
                    stroke="#B08D57"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>

              {/* Secondary text-link: 'Kolleksiyaya bax' with brass underline-draw */}
              <Link
                href="/collections"
                className="group relative inline-flex items-center py-1 text-[13px] tracking-[0.08em] uppercase font-['Instrument_Sans',sans-serif] font-medium transition-colors hover:text-[#9A7B4F] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#9A7B4F]"
              >
                <span>Kolleksiyaya bax</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#9A7B4F] transition-all duration-300 ease-out group-hover:w-full" />
              </Link>
            </div>
          </div>

          {/* =====================================================================
              ZONE 2 (CENTER / Mobile Order 2): CENTER PRODUCT STAGE ON WOODEN HANGER
              ===================================================================== */}
          <div className="w-full lg:col-span-5 flex flex-col items-center justify-center order-2 lg:order-2 my-2 lg:my-0">
            <div className="relative w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[430px] flex flex-col items-center">
              
              {/* Product Flanking Arrows (thin-circle SVG chevrons flanking product lower-third) */}
              <div className="absolute inset-y-0 -left-4 sm:-left-8 lg:-left-12 flex items-end pb-20 sm:pb-24 z-30 pointer-events-auto">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Əvvəlki məhsul"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-current opacity-60 hover:opacity-100 hover:text-[#9A7B4F] hover:border-[#9A7B4F] transition-all flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#9A7B4F] shadow-sm bg-[var(--stage-bg)]"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
              </div>

              <div className="absolute inset-y-0 -right-4 sm:-right-8 lg:-right-12 flex items-end pb-20 sm:pb-24 z-30 pointer-events-auto">
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Növbəti məhsul"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-current opacity-60 hover:opacity-100 hover:text-[#9A7B4F] hover:border-[#9A7B4F] transition-all flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#9A7B4F] shadow-sm bg-[var(--stage-bg)]"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>

              {/* Wooden Hanger + Garment Container (aspect 3/4, 380-460px) */}
              <div
                style={{
                  transform: getProductTransform(),
                  transition: getProductTransition(),
                  opacity: stageState === "exiting" ? 0 : 1,
                }}
                className={`relative w-full aspect-[3/4] flex flex-col items-center justify-center ${
                  reducedMotion
                    ? ""
                    : isSettling
                    ? "animate-damp-swing"
                    : "animate-hanger-sway"
                }`}
              >
                {/* Handcrafted Wooden Atelier Hanger SVG */}
                <div className="relative z-20 w-36 sm:w-44 h-12 -mb-5 flex items-center justify-center select-none pointer-events-none">
                  <svg
                    viewBox="0 0 160 55"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full overflow-visible"
                    aria-hidden="true"
                  >
                    {/* Atelier Rail Line */}
                    <path
                      d="M 10 12 L 150 12"
                      stroke="#9A7B4F"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      opacity="0.3"
                    />

                    {/* Brass Swivel Hook */}
                    <path
                      d="M 80 28 L 80 18 C 79.8 11.5 86.8 6.5 91.5 10.5 C 95.8 14.2 90.8 21.2 86.5 20.8"
                      stroke="#9A7B4F"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Brass Hook Swivel Ring */}
                    <ellipse cx="80" cy="28" rx="2.2" ry="1.4" fill="#B08D57" stroke="#9A7B4F" strokeWidth="0.6" />

                    {/* Wooden Hanger Shoulders (Carved Rich Natural Oak/Walnut Contour) */}
                    <path
                      d="M 18 45 C 38 41 62 33 80 30 C 98 33 122 41 142 45 C 138 48 100 40 80 37 C 60 40 22 48 18 45 Z"
                      fill="#8E623E"
                      stroke="#6E482B"
                      strokeWidth="1"
                    />

                    {/* Wood Bevel Highlight Ridge */}
                    <path
                      d="M 22 44 C 42 40 64 33 80 30.5 C 96 33 118 40 138 44"
                      stroke="#B3865D"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      opacity="0.75"
                    />

                    {/* Center Brass Logo Inset on Wood */}
                    <circle cx="80" cy="34" r="2.2" fill="#9A7B4F" />
                  </svg>
                </div>

                {/* Garment: Object-fit: CONTAIN with padding: 6% — FULL garment visible, never cropped */}
                <div className="relative w-full h-full p-[6%] flex items-center justify-center overflow-visible">
                  <img
                    src={activeProduct.image}
                    alt={activeProduct.title}
                    className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_16px_36px_rgba(0,0,0,0.45)]"
                    loading="eager"
                  />
                </div>

                {/* Soft Drop Shadow Ellipse under garment (blurred, stage-dark at 18%) */}
                <div
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[74%] h-7 rounded-[50%] blur-sm pointer-events-none select-none"
                  style={{ backgroundColor: "rgba(0, 0, 0, 0.18)" }}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          {/* =====================================================================
              ZONE 3 (RIGHT / Mobile Order 3): PRICE TOP-RIGHT & SIZES & FABRICS
              ===================================================================== */}
          <div className="w-full lg:col-span-3 flex flex-col justify-center space-y-6 order-3 lg:order-3 lg:pl-6">
            
            {/* Price Block Top-Right (Swaps with 0.3s fade + 6px rise per product) */}
            <div className="space-y-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeProduct.id}
                  initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <div
                    style={{ color: "var(--stage-muted)" }}
                    className="text-[11px] uppercase tracking-[0.14em] font-['Instrument_Sans',sans-serif] font-semibold leading-none transition-colors duration-700"
                  >
                    {activeProduct.title}
                  </div>
                  <div className="font-fraunces text-[2.4rem] sm:text-[2.6rem] font-bold leading-none mt-1.5 transition-colors duration-700">
                    {activeProduct.price}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-[#9A7B4F] font-semibold mt-1">
                    {activeProduct.tagline}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Size Selector Block */}
            <div className="space-y-2.5 pt-2 border-t border-current/15">
              <span
                style={{ color: "var(--stage-muted)" }}
                className="text-[11px] uppercase tracking-[0.14em] font-['Instrument_Sans',sans-serif] font-medium block transition-colors duration-700"
              >
                Ölçünü seç
              </span>

              {/* Sizes: XL/2XL/3XL/4XL outlined circles (1px fg border, brass ring+fill when selected) */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {SIZES.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`w-11 h-11 rounded-full text-[12px] font-semibold tracking-wider flex items-center justify-center transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#9A7B4F] ${
                        isSelected
                          ? "border border-[#9A7B4F] bg-[#9A7B4F] text-[#2E1A22] shadow-sm ring-2 ring-[#9A7B4F]/40"
                          : "border border-current/35 hover:border-[#9A7B4F] hover:text-[#9A7B4F]"
                      }`}
                      aria-label={`Ölçü ${size}`}
                      aria-pressed={isSelected}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fabric Swatch Dots: "Ağ · Qalın · Kətan" */}
            <div className="space-y-2 pt-2 border-t border-current/15">
              <span
                style={{ color: "var(--stage-muted)" }}
                className="text-[11px] uppercase tracking-[0.14em] font-['Instrument_Sans',sans-serif] font-medium block transition-colors duration-700"
              >
                Parça seçimi
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {STAGE_PRODUCTS.map((prod, idx) => {
                  const isActive = activeIdx === idx;
                  return (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => triggerSwitch(idx)}
                      className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-[3px] text-[11px] font-['Instrument_Sans',sans-serif] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#9A7B4F] ${
                        isActive
                          ? "border border-[#9A7B4F] bg-[#FAF6EF]/15 shadow-sm font-semibold"
                          : "border border-transparent hover:border-current/30 text-[var(--stage-muted)]"
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/30 shrink-0"
                        style={{ backgroundColor: prod.hex }}
                        aria-hidden="true"
                      />
                      <span>{prod.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile CTAs Container (Full-width primary on mobile) */}
            <div className="flex lg:hidden flex-col gap-3 pt-3 w-full">
              <Link
                href="/studio"
                style={{
                  backgroundColor: activeProduct.buttonBg,
                  color: activeProduct.buttonFg,
                }}
                className="w-full inline-flex items-center justify-center px-6 py-3.5 text-[13px] uppercase tracking-[0.08em] font-['Instrument_Sans',sans-serif] font-semibold rounded-[3px] border border-[#9A7B4F]/40 shadow-md active:scale-[0.99] cursor-pointer"
              >
                <span>3D Studiyada dizayn et</span>
                <svg
                  className="w-4 h-4 ml-2"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M 3 8 L 13 8 M 9 4 L 13 8 L 9 12"
                    stroke="#B08D57"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <Link
                href="/collections"
                className="w-full inline-flex items-center justify-center py-2 text-[12px] tracking-[0.08em] uppercase font-['Instrument_Sans',sans-serif] text-[var(--stage-muted)] hover:text-current cursor-pointer"
              >
                Kolleksiyaya bax
              </Link>
            </div>
          </div>
        </div>

        {/* =====================================================================
            BOTTOM ROW: SOCIALS (LEFT) + TAGLINE (CENTER) + MINI THUMBNAIL (RIGHT)
            ===================================================================== */}
        <div className="w-full pt-8 sm:pt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-current/15 text-xs">
          
          {/* BOTTOM-LEFT: Instagram / TikTok / X inline SVG, 18px, fg 60% -> brass on hover */}
          <div className="flex items-center gap-4 opacity-60 order-2 sm:order-1">
            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:opacity-100 hover:text-[#9A7B4F] transition-all cursor-pointer p-1"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
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
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="hover:opacity-100 hover:text-[#9A7B4F] transition-all cursor-pointer p-1"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            </a>

            {/* X */}
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              className="hover:opacity-100 hover:text-[#9A7B4F] transition-all cursor-pointer p-1"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
              </svg>
            </a>
          </div>

          {/* BOTTOM-CENTER: "Tikilir. Çap olunur. Sizin olur." (Fraunces italic, fg 70%) */}
          <div className="font-fraunces italic opacity-70 text-[14px] sm:text-[15px] tracking-[0.02em] text-center order-1 sm:order-2 transition-colors duration-700">
            Tikilir. Çap olunur. Sizin olur.
          </div>

          {/* BOTTOM-RIGHT: Mini product thumbnail (next item, ~90px, 3px radius, hairline border) + caption, clickable */}
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-3 group cursor-pointer order-3 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#9A7B4F] p-1.5 rounded-[3px] hover:bg-[#FAF6EF]/10 transition-all"
            aria-label={`Növbəti məhsul: ${nextProduct.title} ${nextProduct.price}`}
          >
            <div className="w-[74px] h-[74px] sm:w-[90px] sm:h-[90px] rounded-[3px] bg-[#FAF6EF]/10 border border-[#9A7B4F]/40 overflow-hidden flex items-center justify-center p-1.5 group-hover:border-[#9A7B4F] transition-colors shrink-0">
              <img
                src={nextProduct.image}
                alt={nextProduct.title}
                className="w-full h-full object-contain pointer-events-none transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col">
              <span
                style={{ color: "var(--stage-muted)" }}
                className="text-[9px] uppercase tracking-[0.14em] font-semibold transition-colors duration-700"
              >
                Növbəti model
              </span>
              <span className="text-[12px] font-semibold tracking-wide text-[#9A7B4F] font-['Instrument_Sans',sans-serif] mt-0.5">
                {nextProduct.code} — {nextProduct.price}
              </span>
              <span className="text-[10px] opacity-75 truncate max-w-[110px] mt-0.5">
                {nextProduct.name}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* =========================================================================
          FULL-WIDTH BOTTOM EDGE: MARQUEE TICKER (11px uppercase, brass 30px/s)
          ========================================================================= */}
      {!reducedMotion && (
        <div className="relative z-10 w-full overflow-hidden bg-black/20 border-t border-current/10 py-2.5 select-none">
          <div className="animate-marquee-30 whitespace-nowrap">
            <span className="inline-block text-[11px] uppercase tracking-[0.18em] font-['Instrument_Sans',sans-serif] font-medium text-[#9A7B4F] px-4">
              {marqueeText}
            </span>
            <span className="inline-block text-[11px] uppercase tracking-[0.18em] font-['Instrument_Sans',sans-serif] font-medium text-[#9A7B4F] px-4">
              {marqueeText}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
