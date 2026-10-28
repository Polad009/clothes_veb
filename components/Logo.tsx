"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

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
        <Image
          src="/brand/icon-dark.png"
          alt="HORVVALLE"
          width={44}
          height={44}
          priority
          className="w-full h-full object-contain filter drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
        />
      ) : isDarkBg ? (
        <Image
          src="/brand/icon-light.png"
          alt="HORVVALLE"
          width={44}
          height={44}
          priority
          className="w-full h-full object-contain filter drop-shadow-[0_4px_16px_rgba(230,194,128,0.25)] transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <>
          <Image
            src="/brand/icon-dark.png"
            alt="HORVVALLE"
            width={44}
            height={44}
            priority
            className="w-full h-full object-contain block dark:hidden filter drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
          />
          <Image
            src="/brand/icon-light.png"
            alt="HORVVALLE"
            width={44}
            height={44}
            priority
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
  const markSizeClass =
    size === "sm"
      ? "h-7 w-7 sm:h-8.5 sm:w-8.5"
      : size === "lg"
      ? "h-11 w-11 sm:h-13 sm:w-13"
      : "h-8 w-8 sm:h-10 sm:w-10";

  const wordmarkHeightClass =
    size === "sm"
      ? "h-3.5 sm:h-4.5"
      : size === "lg"
      ? "h-6 sm:h-7.5"
      : "h-4 sm:h-5 md:h-5.5";

  return (
    <Link
      href="/"
      aria-label="HORVVALLE"
      className={`inline-flex items-center gap-2 sm:gap-2.5 select-none group transition-opacity duration-200 active:scale-[0.99] ${className}`}
    >
      <LogoMark className={markSizeClass} theme={theme} />

      {/* Official Signature Ribbon Wordmark from Image 1 */}
      <div className="flex items-center justify-center shrink-0">
        {theme === "light" ? (
          <Image
            src="/brand/wordmark-dark.png"
            alt="HORVVALLE"
            width={140}
            height={20}
            priority
            className={`${wordmarkHeightClass} w-auto object-contain select-none pointer-events-none transition-transform duration-300 group-hover:scale-[1.02]`}
          />
        ) : theme === "dark" ? (
          <Image
            src="/brand/wordmark-light.png"
            alt="HORVVALLE"
            width={140}
            height={20}
            priority
            className={`${wordmarkHeightClass} w-auto object-contain select-none pointer-events-none transition-transform duration-300 group-hover:scale-[1.02] filter drop-shadow-[0_2px_10px_rgba(230,194,128,0.25)]`}
          />
        ) : (
          <>
            <Image
              src="/brand/wordmark-dark.png"
              alt="HORVVALLE"
              width={140}
              height={20}
              priority
              className={`${wordmarkHeightClass} w-auto object-contain block dark:hidden select-none pointer-events-none transition-transform duration-300 group-hover:scale-[1.02]`}
            />
            <Image
              src="/brand/wordmark-light.png"
              alt="HORVVALLE"
              width={140}
              height={20}
              priority
              className={`${wordmarkHeightClass} w-auto object-contain hidden dark:block select-none pointer-events-none transition-transform duration-300 group-hover:scale-[1.02] filter drop-shadow-[0_2px_10px_rgba(230,194,128,0.25)]`}
            />
          </>
        )}
      </div>
    </Link>
  );
}
