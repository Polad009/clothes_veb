"use client";

import React from "react";
import Link from "next/link";

export type LogoTheme = "light" | "dark" | "auto";

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  theme?: LogoTheme;
  size?: "sm" | "md" | "lg";
}

/**
 * Official HORVVALLE Luxury Brand Mark:
 * 3D sculpted 'H' monogram emblem with fluid metallic ribbon wave.
 */
export function LogoMark({
  className = "h-11 w-11",
  theme = "auto",
}: {
  className?: string;
  theme?: LogoTheme;
}) {
  const isDarkBg = theme === "dark";
  const isLightBg = theme === "light";

  return (
    <div className={`${className} shrink-0 relative flex items-center justify-center select-none`}>
      {isLightBg ? (
        <img
          src="/brand/icon-dark.png"
          alt="HORVVALLE"
          className="w-full h-full object-contain filter drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
        />
      ) : isDarkBg ? (
        <img
          src="/brand/icon-light.png"
          alt="HORVVALLE"
          className="w-full h-full object-contain filter drop-shadow-[0_4px_16px_rgba(230,194,128,0.25)] transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <>
          <img
            src="/brand/icon-dark.png"
            alt="HORVVALLE"
            className="w-full h-full object-contain block dark:hidden filter drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
          />
          <img
            src="/brand/icon-light.png"
            alt="HORVVALLE"
            className="w-full h-full object-contain hidden dark:block filter drop-shadow-[0_4px_16px_rgba(230,194,128,0.25)] transition-transform duration-300 group-hover:scale-105"
          />
        </>
      )}
    </div>
  );
}

export default function Logo({
  className = "",
  showTagline = true,
  theme = "auto",
  size = "md",
}: LogoProps) {
  // Theme-aware styles for striking visibility on any background
  const textTitleClass =
    theme === "light"
      ? "text-[#111827] group-hover:text-[#2E1A22]"
      : theme === "dark"
      ? "text-[#FFFFFF] group-hover:text-[#FAF6EF]"
      : "text-stone-900 group-hover:text-stone-700";

  const textSubtitleClass =
    theme === "light"
      ? "text-[#8A6D3B]"
      : theme === "dark"
      ? "text-[#E8C98A]"
      : "text-[#9A7B4F]";

  const markSizeClass =
    size === "sm" ? "h-7 w-7 sm:h-9 sm:w-9" : size === "lg" ? "h-11 w-11 sm:h-14 sm:w-14" : "h-8 w-8 sm:h-11 sm:w-11";

  const titleSizeClass =
    size === "sm"
      ? "text-[15px] sm:text-[20px] tracking-[0.12em] sm:tracking-[0.24em]"
      : size === "lg"
      ? "text-[22px] sm:text-[30px] tracking-[0.18em] sm:tracking-[0.28em]"
      : "text-[16px] sm:text-[22px] md:text-[25px] tracking-[0.14em] sm:tracking-[0.26em]";

  const subSizeClass =
    size === "sm"
      ? "text-[7.5px] sm:text-[8.5px] tracking-[0.2em] sm:tracking-[0.32em]"
      : "text-[8px] sm:text-[9.5px] tracking-[0.22em] sm:tracking-[0.36em]";

  return (
    <Link
      href="/"
      aria-label="HORVVALLE — Fərdi Atelye"
      className={`inline-flex items-center gap-2 sm:gap-3 select-none group transition-opacity duration-200 active:scale-[0.99] ${className}`}
    >
      <LogoMark className={markSizeClass} theme={theme} />
      
      <span className="flex flex-col leading-none justify-center">
        {/* Main Wordmark */}
        <span
          className={`font-eb-garamond font-semibold uppercase leading-none transition-colors duration-200 ${titleSizeClass} ${textTitleClass}`}
        >
          HORVVALLE
        </span>
        
        {/* Couture Tagline */}
        {showTagline && (
          <span
            className={`font-sans font-bold uppercase mt-1.5 leading-none transition-colors duration-200 ${subSizeClass} ${textSubtitleClass}`}
          >
            FƏRDİ ATELYE
          </span>
        )}
      </span>
    </Link>
  );
}
