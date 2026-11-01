"use client";

import { useEffect } from "react";

/**
 * Universal Body Scroll Lock hook for desktop & mobile (iOS Safari / Android).
 * Completely prevents background page scrolling when modals, drawers, or overlays are open,
 * including seamless integration with Lenis smooth scroll momentum.
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked || typeof window === "undefined") return;

    // 1. Pause Lenis smooth scroll immediately
    const lenis = (window as any).__lenis;
    if (lenis && typeof lenis.stop === "function") {
      lenis.stop();
    }

    // 2. Prevent layout shift from scrollbar disappearing on desktop
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyTouchAction = document.body.style.touchAction;
    const originalPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      // Restore Lenis momentum scroll
      if (lenis && typeof lenis.start === "function") {
        lenis.start();
      }
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.touchAction = originalBodyTouchAction;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isLocked]);
}

