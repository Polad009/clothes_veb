"use client";

import React from "react";

export interface HorvvalleLogoProps {
  className?: string;
  size?: number;
  variant?: "default" | "burgundy" | "cream" | "gold" | "dark" | "solid-cream" | "solid-gold";
  withText?: boolean;
  textClassName?: string;
  tagline?: boolean;
}

/**
 * Official HORVVALE Luxury Couture Identity (Directly matching user brand reference Image 2).
 *
 * Characteristics:
 * - Circular seal with fine, delicate border.
 * - Monogram: Overlapping double-V / 'W' serif couture monogram with calligraphic thick-thin contrast,
 *   sharp serifs, and central intersection.
 * - Editorial Wordmark: "Horvvale" in exquisite high-contrast transitional serif typography.
 * - Color System:
 *   - Deep Bordeaux / Wine: #3D1420
 *   - Luxury Linen Cream: #F6F2EA
 *   - Obsidian Black: #121212
 *   - Antique Champagne Gold: #B3925C / #A68042
 */
export function HorvvalleLogo({
  className = "",
  size = 36,
  variant = "default",
  withText = false,
  textClassName = "",
  tagline = false,
}: HorvvalleLogoProps) {
  // Determine color scheme based on variant
  let circleStroke = "#3D1420";
  let letterColor = "#3D1420";
  let textColor = "#3D1420";
  let circleFill = "none";

  if (variant === "cream") {
    circleStroke = "#F6F2EA";
    letterColor = "#F6F2EA";
    textColor = "#F6F2EA";
    circleFill = "none";
  } else if (variant === "gold") {
    circleStroke = "#B3925C";
    letterColor = "#B3925C";
    textColor = "#B3925C";
    circleFill = "none";
  } else if (variant === "dark") {
    circleStroke = "#121212";
    letterColor = "#121212";
    textColor = "#121212";
    circleFill = "none";
  } else if (variant === "solid-cream") {
    circleFill = "#F6F2EA";
    circleStroke = "#F6F2EA";
    letterColor = "#3D1420";
    textColor = "#F6F2EA";
  } else if (variant === "solid-gold") {
    circleFill = "#A68042";
    circleStroke = "#A68042";
    letterColor = "#121212";
    textColor = "#A68042";
  }

  // The Iconic Circular Monogram Icon
  const iconSvg = (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: size, height: size }}
      className={`shrink-0 select-none ${className}`}
      aria-label="Horvvale Monogram"
    >
      {/* Outer Circular Ring (or filled circle) */}
      <circle
        cx="50"
        cy="50"
        r="46"
        stroke={circleFill === "none" ? circleStroke : "none"}
        strokeWidth="2.4"
        fill={circleFill}
      />

      {/* The Exquisite 'W' / Interlocking Double-V Haute Couture Monogram */}
      <g fill={letterColor}>
        {/* Left 'V' - Left Downstroke (Thick calligraphic stroke) with top serif */}
        <polygon points="26,34 32,34 30.5,36 39,63 43.5,63 43.5,66 36.5,66 36.5,63 38,63 28.5,36 26,36" />
        
        {/* Left 'V' - Right Upstroke (Delicate hairline diagonal) with central cross connector */}
        <polygon points="39,63 49.5,37 53,37 53,35 46.5,35 46.5,37 48.5,37 40,60" />

        {/* Right 'V' - Left Downstroke (Thick stroke crossing through the center) */}
        <polygon points="46.5,35 53.5,35 52,37 60.5,63 64.5,63 64.5,66 58,66 58,63 59.5,63 50.5,37 48,37" />

        {/* Right 'V' - Right Upstroke (Delicate hairline diagonal) with top serif */}
        <polygon points="60.5,63 70.5,37 74,37 74,35 67.5,35 67.5,37 69.5,37 61.5,60" />

        {/* Delicate Horizontal Crossbar (linking the monogram as in Image 2) */}
        <line
          x1="33"
          y1="49.5"
          x2="67"
          y2="49.5"
          stroke={letterColor}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );

  if (!withText) {
    return iconSvg;
  }

  return (
    <div className="inline-flex items-center gap-3.5 select-none group">
      {iconSvg}
      <div className={`flex flex-col justify-center ${textClassName}`}>
        <span
          className="text-2xl sm:text-[27px] font-normal tracking-[0.02em] leading-none text-zinc-950 font-serif-luxury transition-colors group-hover:text-black"
          style={{ color: textColor }}
        >
          Horvvalle
        </span>
        {tagline && (
          <span className="text-[8.5px] uppercase tracking-[0.32em] text-zinc-400 font-semibold leading-none mt-1 pl-0.5">
            HAUTE COUTURE
          </span>
        )}
      </div>
    </div>
  );
}

// Backward compatibility export
export const NovaLogo = HorvvalleLogo;
