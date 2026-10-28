"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/**
 * SDU-Style Butter-Smooth Momentum & Inertia Scrolling.
 * Powered by Lenis for fluid, luxurious 120 FPS momentum scrolling.
 * Supports intelligent scroll restoration on back-navigation.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();
  const isPopStateRef = useRef(false);
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    // Enable browser standard history scroll restoration
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "auto";
    }

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    const lenis = new Lenis({
      duration: isMobile ? 1.0 : 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth exponential curve
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    // Expose lenis globally for external scroll triggers if needed
    (window as any).__lenis = lenis;

    // Detect browser Back / Forward actions
    const handlePopState = () => {
      isPopStateRef.current = true;
    };
    window.addEventListener("popstate", handlePopState);

    // Save scroll position before unloading or navigating (debounced)
    let scrollTimeout: NodeJS.Timeout | null = null;
    const handleSaveScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        try {
          const y = window.scrollY || document.documentElement.scrollTop || 0;
          sessionStorage.setItem(`hv_scroll_${window.location.pathname}`, String(y));
        } catch {}
      }, 150);
    };

    window.addEventListener("scroll", handleSaveScroll, { passive: true });

    return () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      (window as any).__lenis = null;
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("scroll", handleSaveScroll);
    };
  }, []);

  // Handle route changes: scroll to top for forward navigation, restore for back navigation
  useEffect(() => {
    const isPop = isPopStateRef.current;
    isPopStateRef.current = false;

    if (isPop) {
      // User pressed BACK/FORWARD: restore previous scroll position
      try {
        const savedY = sessionStorage.getItem(`hv_scroll_${pathname}`);
        if (savedY !== null) {
          const targetY = parseFloat(savedY);
          const restore = () => {
            if (lenisRef.current) {
              lenisRef.current.scrollTo(targetY, { immediate: true });
            }
            window.scrollTo({ top: targetY, left: 0, behavior: "instant" });
          };
          restore();
          const t1 = setTimeout(restore, 30);
          const t2 = setTimeout(restore, 120);
          return () => {
            clearTimeout(t1);
            clearTimeout(t2);
          };
        }
      } catch {}
      return;
    }

    // Normal forward navigation (e.g. clicking a product): start at the very top (0, 0)
    const scrollToTop = () => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { immediate: true });
      }
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    scrollToTop();
    const t = setTimeout(scrollToTop, 50);

    prevPathnameRef.current = pathname;
    return () => clearTimeout(t);
  }, [pathname]);

  return <>{children}</>;
}
