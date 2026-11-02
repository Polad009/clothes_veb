"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { MoveHorizontal, ArrowUpRight } from "lucide-react";
import { useStoreData } from "@/context/StoreDataContext";
import { useCurrency } from "@/context/CurrencyContext";

interface RunwayItem {
  id: string;
  slug: string;
  src: string;
  title: string;
  tag: string;
  defaultPrice: number;
  link: string;
}

const RUNWAY_TOP: RunwayItem[] = [
  {
    id: "1",
    slug: "horwalle-bmw-m-motorsport-heavyweight-fleece-hoodie",
    src: "/images/uploads/bmw_hoodie_black_front_v3.png",
    title: "BMW M Motorsport Qara Hudi",
    tag: "380 GSM FLEECE",
    defaultPrice: 20,
    link: "/products/horwalle-bmw-m-motorsport-heavyweight-fleece-hoodie",
  },
  {
    id: "2",
    slug: "horwalle-mclaren-750s-heavyweight-oversized-tee",
    src: "/images/uploads/mclaren_tee_white_studio_front.png",
    title: "McLaren 750S Oversized Ağ Tee",
    tag: "240 GSM HEAVYWEIGHT",
    defaultPrice: 29.99,
    link: "/products/horwalle-mclaren-750s-heavyweight-oversized-tee",
  },
  {
    id: "3",
    slug: "horwalle-bmw-m-motorsport-heavyweight-fleece-hoodie",
    src: "/images/uploads/bmw_hoodie_grey_front_v3.png",
    title: "BMW M Motorsport Melanj Boz",
    tag: "PREMIUM FLEECE",
    defaultPrice: 20,
    link: "/products/horwalle-bmw-m-motorsport-heavyweight-fleece-hoodie",
  },
  {
    id: "4",
    slug: "horwalle-angelus-heavyweight-vintage-polo",
    src: "/images/uploads/polo_angel_black_front_cutout.png",
    title: "Angelus Vintage Qara Polo",
    tag: "HEAVY PIQUE",
    defaultPrice: 79,
    link: "/products/horwalle-angelus-heavyweight-vintage-polo",
  },
  {
    id: "5",
    slug: "horwalle-mclaren-750s-heavyweight-oversized-tee",
    src: "/images/uploads/mclaren_tee_black_front_v2.png",
    title: "McLaren 750S Qara Edition",
    tag: "STREETWEAR OVERSIZE",
    defaultPrice: 29.99,
    link: "/products/horwalle-mclaren-750s-heavyweight-oversized-tee",
  },
  {
    id: "6",
    slug: "horwalle-angel-dust-vintage-hoodie",
    src: "/images/uploads/angel_dust_hoodie_cutout.png",
    title: "Angel Dust Vintage Hudi",
    tag: "380 GSM COUTURE",
    defaultPrice: 49,
    link: "/products/horwalle-angel-dust-vintage-hoodie",
  },
];

const RUNWAY_BOTTOM: RunwayItem[] = [
  {
    id: "7",
    slug: "horwalle-mclaren-750s-heavyweight-oversized-tee",
    src: "/images/uploads/mclaren_tee_white_studio_back.png",
    title: "McLaren 750S Supercar Çap",
    tag: "ULTRA HD DTG",
    defaultPrice: 29.99,
    link: "/products/horwalle-mclaren-750s-heavyweight-oversized-tee",
  },
  {
    id: "8",
    slug: "horwalle-bmw-m-motorsport-heavyweight-fleece-hoodie",
    src: "/images/uploads/bmw_hoodie_black_back_v3.png",
    title: "BMW M Motorsport Arxa Loqo",
    tag: "DTF ARTWORK",
    defaultPrice: 20,
    link: "/products/horwalle-bmw-m-motorsport-heavyweight-fleece-hoodie",
  },
  {
    id: "9",
    slug: "horwalle-angelus-heavyweight-vintage-polo",
    src: "/images/uploads/polo_angel_white_front_v8.png",
    title: "Angelus Vintage Ağ Polo",
    tag: "EMBROIDERED LUXURY",
    defaultPrice: 79,
    link: "/products/horwalle-angelus-heavyweight-vintage-polo",
  },
  {
    id: "10",
    slug: "horwalle-mclaren-750s-heavyweight-oversized-tee",
    src: "/images/uploads/mclaren_tee_sand_front_v3.png",
    title: "McLaren 750S Qum Beji",
    tag: "VINTAGE DYE",
    defaultPrice: 29.99,
    link: "/products/horwalle-mclaren-750s-heavyweight-oversized-tee",
  },
  {
    id: "11",
    slug: "horwalle-bmw-m-motorsport-heavyweight-fleece-hoodie",
    src: "/images/uploads/bmw_hoodie_white_front_v3.png",
    title: "BMW M Motorsport Ağ Hudi",
    tag: "LIMITED EDITION",
    defaultPrice: 20,
    link: "/products/horwalle-bmw-m-motorsport-heavyweight-fleece-hoodie",
  },
  {
    id: "12",
    slug: "horwalle-angelus-heavyweight-vintage-polo",
    src: "/images/uploads/polo_angel_black_back.png",
    title: "Angelus Arxa Mələk Dizayn",
    tag: "VINTAGE WASH",
    defaultPrice: 79,
    link: "/products/horwalle-angelus-heavyweight-vintage-polo",
  },
];

interface RunwayCardProps {
  item: RunwayItem;
  staggerIndex: number;
  isPriority: boolean;
  isAnimated: boolean;
  formattedPrice: string;
  isDuplicate?: boolean;
  onImageLoad?: () => void;
}

function RunwayCard({
  item,
  staggerIndex,
  isPriority,
  isAnimated,
  formattedPrice,
  isDuplicate = false,
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
        <Link
          href={item.link}
          tabIndex={isDuplicate ? -1 : undefined}
          aria-hidden={isDuplicate ? true : undefined}
          className="relative block aspect-[4/5] rounded-2xl sm:rounded-3xl border border-[#EAE3D8] bg-[#FAF7F2] shadow-sm overflow-hidden select-none isolate cursor-pointer group"
          style={{ contain: "layout paint style" }}
        >
          {/* Product Image via next/image for optimal decoding and memory containment */}
          <div className="relative w-full h-full overflow-hidden bg-white/70">
            <Image
              src={item.src}
              alt={item.title}
              fill
              sizes="360px"
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
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
            <h3 className="text-xs sm:text-sm font-serif-luxury font-normal leading-tight text-[#FAF7F2] line-clamp-1">
              {item.title}
            </h3>
            <div className="flex items-center justify-between mt-1 pt-0.5 border-t border-white/15">
              <span className="text-xs sm:text-sm font-bold text-[#E6C994] font-serif-luxury">
                {formattedPrice}
              </span>
              <span className="text-[10px] text-stone-300 font-mono tracking-wider">
                HORVVALLE
              </span>
            </div>
          </div>
        </Link>
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
  const { products } = useStoreData();
  const { formatPrice } = useCurrency();

  const getPrice = (item: RunwayItem) => {
    const prod = products.find((p) => p.slug === item.slug);
    const p = prod ? prod.price : item.defaultPrice;
    return formatPrice(p);
  };

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
      <div className="relative w-full overflow-hidden mb-5 sm:mb-8 py-3">
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
                formattedPrice={getPrice(item)}
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
                isDuplicate={true}
                formattedPrice={getPrice(item)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Flowing Rightward with Continuous Wave (Non-stopping, always fluid) */}
      <div className="relative w-full overflow-hidden py-3">
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
                formattedPrice={getPrice(item)}
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
                isDuplicate={true}
                formattedPrice={getPrice(item)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
