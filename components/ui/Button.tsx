"use client";

import React from "react";
import Link from "next/link";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "arrow" | "ghost";
  arrowDirection?: "left" | "right";
  href?: string;
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
}

export function Button({
  variant = "primary",
  arrowDirection = "right",
  href,
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  // Arrow circular button (‹ › slider / carousel controls from Hero)
  if (variant === "arrow") {
    const arrowClass = `w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/45 hover:bg-black/75 text-white flex items-center justify-center cursor-pointer backdrop-blur-xs transition-transform active:scale-90 shadow-lg border border-white/15 select-none ${className}`;
    const arrowIcon = (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {arrowDirection === "left" ? (
          <polyline points="15 18 9 12 15 6" />
        ) : (
          <polyline points="9 18 15 12 9 6" />
        )}
      </svg>
    );

    if (href) {
      return (
        <Link href={href} className={arrowClass} aria-label={props["aria-label"]}>
          {arrowIcon}
        </Link>
      );
    }

    return (
      <button type="button" className={arrowClass} {...props}>
        {arrowIcon}
      </button>
    );
  }

  // Primary white rounded-full pill CTA with black text (Hero CTA)
  if (variant === "primary") {
    const primaryClass = `inline-flex items-center justify-center gap-2.5 bg-white text-black font-semibold text-xs sm:text-sm h-11 sm:h-12 px-6 sm:px-8 rounded-full hover:bg-white/90 hover:scale-[1.02] transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap select-none ${className}`;
    if (href) {
      return (
        <Link href={href} className={primaryClass}>
          {children}
        </Link>
      );
    }
    return (
      <button type="button" className={primaryClass} {...props}>
        {children}
      </button>
    );
  }

  // Secondary soft glass pill button with subtle border
  if (variant === "secondary") {
    const secondaryClass = `inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 h-11 sm:h-12 px-5 sm:px-6 rounded-full text-xs sm:text-sm font-medium hover:border-white/40 transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap select-none ${className}`;
    if (href) {
      return (
        <Link href={href} className={secondaryClass}>
          {children}
        </Link>
      );
    }
    return (
      <button type="button" className={secondaryClass} {...props}>
        {children}
      </button>
    );
  }

  // Ghost text button with border-b
  const ghostClass = `text-white/90 hover:text-white text-sm font-medium px-3 py-1.5 border-b border-white/40 hover:border-white transition-all cursor-pointer whitespace-nowrap select-none ${className}`;
  if (href) {
    return (
      <Link href={href} className={ghostClass}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={ghostClass} {...props}>
      {children}
    </button>
  );
}
