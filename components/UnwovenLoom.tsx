"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { MoveHorizontal, ArrowUpRight } from "lucide-react";

interface RunwayItem {
  id: string;
  src: string;
  title: string;
  tag: string;
  price: string;
  link: string;
}

const RUNWAY_TOP: RunwayItem[] = [
  {
    id: "1",
    src: "/images/products/beige-linen-relaxed-shirt/mockup.webp",
    title: "Bej Kətan Yay Köynəyi",
    tag: "TƏBİİ KƏTAN",
    price: "62 ₼",
    link: "/products/beige-linen-relaxed-shirt",
  },
  {
    id: "2",
    src: "/images/products/vintage-king-of-pop-tee/front.webp",
    title: "King of Pop Vintage Tee",
    tag: "OVERSIZE DTG",
    price: "55 ₼",
    link: "/products/vintage-king-of-pop-tee",
  },
  {
    id: "3",
    src: "/images/products/white-oxford-button-down-shirt/mockup.webp",
    title: "Klassik Ağ Oxford Köynək",
    tag: "220 GSM COUTURE",
    price: "55 ₼",
    link: "/products/white-oxford-button-down-shirt",
  },
  {
    id: "4",
    src: "/images/products/beige-slim-chino-pants/mockup.webp",
    title: "Qum Beji Slim Chino",
    tag: "DƏQİQ KƏSİM",
    price: "68 ₼",
    link: "/products/beige-slim-chino-pants",
  },
  {
    id: "5",
    src: "/images/products/urban-echo-world-tour-tee/mockup.webp",
    title: "Urban Echo World Tour Tee",
    tag: "STREETWEAR",
    price: "52 ₼",
    link: "/products/urban-echo-world-tour-tee",
  },
  {
    id: "6",
    src: "/images/products/classic-straight-indigo-jeans/mockup.webp",
    title: "İndiqo Düz Kəsim Cins",
    tag: "DENİM",
    price: "74 ₼",
    link: "/products/classic-straight-indigo-jeans",
  },
];

const RUNWAY_BOTTOM: RunwayItem[] = [
  {
    id: "7",
    src: "/images/products/modern-utility-cargo-pants/mockup.webp",
    title: "Taktiki Qara Kargo Şalvar",
    tag: "UTILITY",
    price: "72 ₼",
    link: "/products/modern-utility-cargo-pants",
  },
  {
    id: "8",
    src: "/images/products/essential-white-cotton-tee/mockup.webp",
    title: "Ağ Pambıq Baza T-Shirt",
    tag: "220 GSM PAMBIQ",
    price: "32 ₼",
    link: "/products/essential-white-cotton-tee",
  },
  {
    id: "9",
    src: "/images/products/black-formal-smart-trousers/mockup.webp",
    title: "Qara Ziyafət Şalvarı",
    tag: "SMART TAILORED",
    price: "85 ₼",
    link: "/products/black-formal-smart-trousers",
  },
  {
    id: "10",
    src: "/images/products/black-tailored-cotton-shirt/mockup.webp",
    title: "Qara Klassik Pambıq Köynək",
    tag: "ELEGANT",
    price: "58 ₼",
    link: "/products/black-tailored-cotton-shirt",
  },
  {
    id: "11",
    src: "/images/products/urban-echo-world-tour-tee/back.webp",
    title: "World Tour Tur Çoxpanelli Çap",
    tag: "DTG PRINT",
    price: "52 ₼",
    link: "/products/urban-echo-world-tour-tee",
  },
  {
    id: "12",
    src: "/images/products/heavyweight-hoodie-black/mockup.webp",
    title: "3iplik Qalın Qara Hudi",
    tag: "380 GSM QALIN",
    price: "78 ₼",
    link: "/products/heavyweight-hoodie-black",
  },
];

interface RunwayCardProps {
  item: RunwayItem;
  staggerIndex: number;
  isPriority: boolean;
  isAnimated: boolean;
  onImageLoad?: () => void;
}

function RunwayCard({
  item,
  staggerIndex,
  isPriority,
  isAnimated,
  onImageLoad,
}: RunwayCardProps) {
  // Stagger sinusoidal wave delays for fluid ocean-wave motion (pure CSS)
  const waveDelay = (staggerIndex * 0.48) % 5.8;

  return (
    <div className="shrink-0 w-[170px] sm:w-[215px] lg:w-[240px]">
      {/* Wave wrapper: strictly handles vertical sinusoidal translation and rotation */}
      <div
        className="runway-wave-inner"
        style={{ animationDelay: `-${waveDelay.toFixed(2)}s` }}
        data-paused={!isAnimated}
      >
        <div
          className="relative block aspect-[4/5] rounded-2xl sm:rounded-3xl border border-[#EAE3D8] bg-[#FAF7F2] shadow-sm overflow-hidden select-none isolate pointer-events-none cursor-default"
          style={{ contain: "layout paint style" }}
        >
          {/* Product Image via next/image for optimal decoding and memory containment */}
          <div className="relative w-full h-full overflow-hidden">
            <Image
              src={item.src}
              alt={item.title}
              fill
              sizes="360px"
              className="object-cover"
              priority={isPriority}
              loading={isPriority ? "eager" : "lazy"}
              decoding="async"
              onLoad={onImageLoad}
            />
          </div>

          {/* Top Category Chip - Solid crisp background, NO backdrop-filter */}
          <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 z-10 pointer-events-none">
            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-white/95 text-[#3D1424] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border border-white/80 shadow-xs">
              {item.tag}
            </span>
          </div>

          {/* Bottom Details Platter - Pure static CSS gradient, zero filters */}
          <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black/85 via-black/45 to-transparent text-white flex flex-col justify-end pointer-events-none">
            <h4 className="text-xs sm:text-sm font-serif-luxury font-normal leading-tight text-[#FAF7F2] line-clamp-1">
              {item.title}
            </h4>
            <div className="flex items-center justify-between mt-1 pt-0.5 border-t border-white/15">
              <span className="text-xs sm:text-sm font-bold text-[#E6C994] font-serif-luxury">
                {item.price}
              </span>
              <span className="text-[10px] text-stone-300 font-mono tracking-wider">
                HORVVALLE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UnwovenLoom() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [imagesReady, setImagesReady] = useState(false);
  const loadedCountRef = useRef(0);

  // Track initial image loading so marquee starts smoothly without initial decode hitch
  const handleImageLoad = useCallback(() => {
    loadedCountRef.current += 1;
    // When the first 4 priority images load, release the marquee
    if (loadedCountRef.current >= 4) {
      setImagesReady(true);
    }
  }, []);

  // Fallback safety timer: start animation within 400ms regardless of cache status
  useEffect(() => {
    const timer = setTimeout(() => {
      setImagesReady(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // IntersectionObserver: automatically pauses animations when scrolled out of view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        rootMargin: "150px 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isAnimated = imagesReady && isInView;

  return (
    <div
      ref={containerRef}
      className="relative w-full py-8 sm:py-12 select-none overflow-hidden"
    >
      {/* Top Status Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#B08D57] animate-pulse" />
          <span className="text-[11px] sm:text-xs uppercase font-bold tracking-[0.25em] text-[#3D1424]">
            HORVVALLE CANLI DALĞALI RUNWAY · 2026 COUTURE
          </span>
        </div>

        <div className="flex items-center gap-2 text-stone-500 text-[11px] font-medium hidden sm:flex">
          <MoveHorizontal size={14} className="text-[#B08D57]" />
          <span>Davamlı axıcı dalğalı kətan · 2026 Couture</span>
        </div>
      </div>

      {/* Row 1: Flowing Leftward with Continuous Wave (Non-stopping, always fluid) */}
      <div className="relative w-full overflow-hidden mb-5 sm:mb-8 py-3 pointer-events-none">
        <div
          className="runway-track-left will-change-transform"
          data-paused={!isAnimated}
        >
          {/* Primary Set */}
          <div className="flex items-center gap-4 sm:gap-6 pr-4 sm:pr-6">
            {RUNWAY_TOP.map((item, idx) => (
              <RunwayCard
                key={`top-a-${item.id}`}
                item={item}
                staggerIndex={idx}
                isPriority={idx < 4}
                isAnimated={isAnimated}
                onImageLoad={handleImageLoad}
              />
            ))}
          </div>

          {/* Seamless Duplicate Set (Exact identical width + padding for seamless 50% loop) */}
          <div className="flex items-center gap-4 sm:gap-6 pr-4 sm:pr-6" aria-hidden="true">
            {RUNWAY_TOP.map((item, idx) => (
              <RunwayCard
                key={`top-b-${item.id}`}
                item={item}
                staggerIndex={idx}
                isPriority={false}
                isAnimated={isAnimated}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Flowing Rightward with Continuous Wave (Non-stopping, always fluid) */}
      <div className="relative w-full overflow-hidden py-3 pointer-events-none">
        <div
          className="runway-track-right will-change-transform"
          data-paused={!isAnimated}
        >
          {/* Primary Set */}
          <div className="flex items-center gap-4 sm:gap-6 pr-4 sm:pr-6">
            {RUNWAY_BOTTOM.map((item, idx) => (
              <RunwayCard
                key={`bot-a-${item.id}`}
                item={item}
                staggerIndex={idx + 4}
                isPriority={idx < 4}
                isAnimated={isAnimated}
                onImageLoad={handleImageLoad}
              />
            ))}
          </div>

          {/* Seamless Duplicate Set (Exact identical width + padding for seamless 50% loop) */}
          <div className="flex items-center gap-4 sm:gap-6 pr-4 sm:pr-6" aria-hidden="true">
            {RUNWAY_BOTTOM.map((item, idx) => (
              <RunwayCard
                key={`bot-b-${item.id}`}
                item={item}
                staggerIndex={idx + 4}
                isPriority={false}
                isAnimated={isAnimated}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
