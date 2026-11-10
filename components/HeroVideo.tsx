"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Play, Pause, ArrowRight } from "lucide-react";

export interface HeroVideoProps {
  posterDesktop: string;
  posterMobile: string;
  videoDesktopSrc: string;
  videoMobileSrc: string;
  title: string | React.ReactNode;
  subtitle: string | React.ReactNode;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  kicker?: string;
  children?: React.ReactNode;
  className?: string;
}

export function HeroVideo({
  posterDesktop,
  posterMobile,
  videoDesktopSrc,
  videoMobileSrc,
  title,
  subtitle,
  ctaText,
  ctaLink,
  secondaryCtaText,
  secondaryCtaLink,
  kicker,
  children,
  className = "",
}: HeroVideoProps) {
  const containerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState<boolean>(false);
  const [isUserPaused, setIsUserPaused] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  // Safe play helper handling browser autoplay policies
  const safePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play().catch(() => {
      // Browser autoplay restriction: listen to first user interaction
      const resumeOnInteraction = () => {
        if (!isUserPaused) {
          video.play().catch(() => {});
        }
        window.removeEventListener("click", resumeOnInteraction);
        window.removeEventListener("touchstart", resumeOnInteraction);
      };
      window.addEventListener("click", resumeOnInteraction, { once: true });
      window.addEventListener("touchstart", resumeOnInteraction, { once: true });
    });
  }, [isUserPaused]);

  // Video playback lifecycle & IntersectionObserver
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    if (prefersReducedMotion) {
      video.pause();
      setIsPlaying(false);
      return;
    }

    // 1. IntersectionObserver: pause when < 20% visible, resume when >= 20% visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio < 0.2) {
            video.pause();
            setIsPlaying(false);
          } else if (!isUserPaused && !document.hidden) {
            safePlay();
            setIsPlaying(true);
          }
        });
      },
      { threshold: [0, 0.2, 0.5] }
    );

    observer.observe(container);

    // 2. Tab visibility listener
    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause();
        setIsPlaying(false);
      } else if (!isUserPaused) {
        safePlay();
        setIsPlaying(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isUserPaused, prefersReducedMotion, safePlay]);

  // Toggle user pause/play
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      setIsUserPaused(true);
    } else {
      safePlay();
      setIsPlaying(true);
      setIsUserPaused(false);
    }
  };

  return (
    <section
      ref={containerRef}
      id="hero-section"
      className={`relative w-full min-h-[100svh] flex flex-col justify-between overflow-hidden bg-[#090A0E] text-white select-none isolate ${className}`}
      aria-label="Horwalle Ambient Video Hero"
    >
      {/* =========================================================================
          1. ZERO-CLS POSTER FALLBACK (Responsive <picture>)
          ========================================================================= */}
      <picture className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
        <source media="(max-width: 767px)" srcSet={posterMobile} type="image/webp" />
        <img
          src={posterDesktop}
          alt="Horwalle Ambient Poster"
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover object-center"
        />
      </picture>

      {/* =========================================================================
          2. DUAL-CUT RESPONSIVE AMBIENT VIDEO LOOP
          ========================================================================= */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        disablePictureInPicture
        onPlaying={() => setIsVideoLoaded(true)}
        aria-hidden="true"
        tabIndex={-1}
        className={`absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-opacity duration-700 ease-out z-[1] ${
          isVideoLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <source media="(max-width: 767px)" src={videoMobileSrc} type="video/mp4" />
        <source src={videoDesktopSrc} type="video/mp4" />
      </video>

      {/* =========================================================================
          3. CINEMATIC LUXURY OVERLAYS (Vignette + Scrims + Grain)
          ========================================================================= */}
      {/* Radial Atelier Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-[2] bg-[radial-gradient(circle_at_50%_45%,rgba(9,10,14,0.15)_0%,rgba(9,10,14,0.72)_75%,rgba(9,10,14,0.95)_100%)]"
        aria-hidden="true"
      />

      {/* Top Header Scrim */}
      <div
        className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#090A0E]/95 via-[#090A0E]/60 to-transparent pointer-events-none z-[2]"
        aria-hidden="true"
      />

      {/* Bottom Atmosphere Scrim */}
      <div
        className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#090A0E] via-[#090A0E]/80 to-transparent pointer-events-none z-[2]"
        aria-hidden="true"
      />

      {/* =========================================================================
          4. EDITORIAL HERO CONTENT & LUXURY TYPOGRAPHY
          ========================================================================= */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-40 pb-16 sm:pb-20 flex-1 flex flex-col justify-center items-center text-center">
        {/* Editorial Kicker */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#E6C280] text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] mb-4 sm:mb-6 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E6C280]" />
          <span>{kicker || "HORWALLE · 2026 COLLECTION"}</span>
        </div>

        {/* Headline */}
        <h1 className="font-eb-garamond text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-normal leading-[1.08] tracking-tight max-w-4xl text-white drop-shadow-md">
          {title}
        </h1>

        {/* Subtitle / Manifesto */}
        <p className="mt-4 sm:mt-6 text-white/85 text-xs sm:text-sm lg:text-base leading-relaxed max-w-xl mx-auto font-sans font-light">
          {subtitle}
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-10">
          {/* Primary CTA (Inverted Luxury White Pill) */}
          <Link
            href={ctaLink}
            prefetch={true}
            className="group px-7 sm:px-8 py-3 sm:py-3.5 rounded-full bg-white text-stone-950 hover:bg-[#E6C280] hover:text-stone-950 font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-xl hover:shadow-[0_10px_25px_rgba(230,194,128,0.35)] active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <span>{ctaText}</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Secondary CTA (Frosted Glass Pill) */}
          {secondaryCtaText && secondaryCtaLink && (
            <Link
              href={secondaryCtaLink}
              prefetch={true}
              className="px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/25 hover:border-white/40 backdrop-blur-md font-semibold text-xs uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer shadow-sm"
            >
              <span>{secondaryCtaText}</span>
            </Link>
          )}
        </div>

        {/* Optional Custom Injected Content / Slider Children */}
        {children && <div className="w-full mt-6">{children}</div>}
      </div>

      {/* =========================================================================
          5. ACCESSIBLE VIDEO CONTROLS & BOTTOM LUXURY ACCENTS
          ========================================================================= */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 flex items-center justify-between text-xs text-white/60">
        <div className="hidden sm:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="uppercase tracking-widest text-[10px] font-semibold text-white/70">
            BAKU · PREMIUM APPAREL
          </span>
        </div>

        {/* Accessible Play/Pause Toggle Pill (WCAG 2.2.2) */}
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Videonu dayandır" : "Videonu başlat"}
          className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 hover:border-white/40 text-white/80 hover:text-white transition-all cursor-pointer ml-auto"
        >
          {isPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
          <span className="text-[10px] font-medium uppercase tracking-wider">
            {isPlaying ? "Pauza" : "Oynat"}
          </span>
        </button>
      </div>

      {/* Atmospheric bottom seam extension */}
      <div
        className="absolute -bottom-1 inset-x-0 h-4 bg-[#090A0E] pointer-events-none z-10"
        aria-hidden="true"
      />
    </section>
  );
}
