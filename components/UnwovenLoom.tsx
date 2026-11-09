"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
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

  // Dynamic runway items derived from active catalog products (filtering out inStock === false)
  const { runwayTop, runwayBottom } = useMemo(() => {
    const active = products.filter((p) => p.inStock !== false);
    const cards: RunwayItem[] = [];

    active.forEach((p) => {
      const mainImg = p.image || p.colors?.[0]?.image || "";
      if (p.colors && p.colors.length > 0) {
        p.colors.forEach((c, cIdx) => {
          const imgSrc = c.image || mainImg;
          if (imgSrc) {
            cards.push({
              id: `${p.id || p.slug}-c${cIdx}-front`,
              slug: p.slug,
              src: imgSrc,
              title: c.name && c.name !== "Standart" ? `${p.name} (${c.name})` : p.name,
              tag: p.composition?.split(",")[0]?.trim() || p.fit || "ATELIER COUTURE",
              defaultPrice: p.price,
              link: `/products/${p.slug}`,
            });
          }
          if (c.hoverImage && c.hoverImage !== imgSrc) {
            cards.push({
              id: `${p.id || p.slug}-c${cIdx}-back`,
              slug: p.slug,
              src: c.hoverImage,
              title: `${p.name} · Studio View`,
              tag: p.fit || "PREMIUM FIT",
              defaultPrice: p.price,
              link: `/products/${p.slug}`,
            });
          }
        });
      } else if (mainImg) {
        cards.push({
          id: `${p.id || p.slug}-main`,
          slug: p.slug,
          src: mainImg,
          title: p.name,
          tag: p.composition?.split(",")[0]?.trim() || p.fit || "ATELIER COUTURE",
          defaultPrice: p.price,
          link: `/products/${p.slug}`,
        });
      }
    });

    if (cards.length === 0) {
      return { runwayTop: [], runwayBottom: [] };
    }

    const topList: RunwayItem[] = [];
    const bottomList: RunwayItem[] = [];

    cards.forEach((card, index) => {
      if (index % 2 === 0) {
        topList.push(card);
      } else {
        bottomList.push(card);
      }
    });

    if (bottomList.length === 0) {
      bottomList.push(...topList);
    }

    const ensureMinItems = (list: RunwayItem[], minCount: number): RunwayItem[] => {
      if (list.length === 0) return [];
      let result = [...list];
      let multiplier = 1;
      while (result.length < minCount) {
        multiplier++;
        result = [
          ...result,
          ...list.map((item, idx) => ({
            ...item,
            id: `${item.id}-dup${multiplier}-${idx}`,
          })),
        ];
      }
      return result;
    };

    return {
      runwayTop: ensureMinItems(topList, 4),
      runwayBottom: ensureMinItems(bottomList, 4),
    };
  }, [products]);

  const getPrice = (item: RunwayItem) => {
    const prod = products.find((p) => p.slug === item.slug);
    const p = prod ? prod.price : item.defaultPrice;
    return formatPrice(p);
  };

  if (runwayTop.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full py-6 sm:py-10 select-none overflow-hidden"
    >
      {/* Row 1: Flowing Leftward with Continuous Wave (Non-stopping, always fluid) */}
      <div className="relative w-full overflow-hidden mb-5 sm:mb-8 py-3">
        <div
          className="runway-track-left will-change-transform"
          data-paused={!isAnimated}
        >
          {/* Primary Set */}
          <div className="flex items-center gap-4 sm:gap-6 pr-4 sm:pr-6">
            {runwayTop.map((item, idx) => (
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
            {runwayTop.map((item, idx) => (
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
            {runwayBottom.map((item, idx) => (
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
            {runwayBottom.map((item, idx) => (
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
