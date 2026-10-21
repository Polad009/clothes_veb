"use client";

import React, { useEffect, useRef } from "react";
import Lenis from "lenis";

/**
 * SDU-Style Butter-Smooth Momentum & Inertia Scrolling.
 * Powered by Lenis for fluid, luxurious 120 FPS momentum scrolling.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Only enable Lenis on non-touch devices or where appropriate for smooth luxury feel
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

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      (window as any).__lenis = null;
    };
  }, []);

  return <>{children}</>;
}
