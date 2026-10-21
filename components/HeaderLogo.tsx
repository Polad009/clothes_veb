"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface HeaderLogoProps {
  className?: string;
  markSize?: number;
  withText?: boolean;
  light?: boolean;
}

const BRAND_LETTERS = ["H", "O", "R", "V", "A", "L", "L", "E"];
// Hand-drawn bezier path with ~2% organic jitter on control points for hand-stitching look
const STITCH_PATH_W =
  "M 31.4 37.1 C 32.8 46.5 38.2 58.2 41.1 63.8 C 43.4 58.1 46.9 48.7 49.7 42.6 C 52.4 48.3 56.2 58.6 58.8 64.2 C 61.3 57.9 66.8 46.2 68.9 36.8";

export function HeaderLogo({
  className = "",
  markSize = 50,
  withText = true,
  light = false,
}: HeaderLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ringGroupRef = useRef<SVGGElement>(null);
  const wPathRef = useRef<SVGPathElement>(null);
  const needleRef = useRef<SVGGElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const subtitleRef = useRef<HTMLDivElement>(null);

  const [settled, setSettled] = useState(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Check if animation already played once in session
    const hasPlayed =
      typeof window !== "undefined" &&
      sessionStorage.getItem("hv_logo_intro_settled") === "true";

    if (prefersReducedMotion || hasPlayed) {
      setSettled(true);
      if (wPathRef.current) {
        wPathRef.current.style.strokeDasharray = "none";
        wPathRef.current.style.strokeDashoffset = "0";
      }
      if (wordmarkRef.current) {
        wordmarkRef.current.style.letterSpacing = "0.34em";
      }
      letterRefs.current.forEach((el) => {
        if (el) el.style.opacity = "1";
      });
      if (subtitleRef.current) {
        subtitleRef.current.style.opacity = "1";
      }
      return;
    }

    // Play 4.5s Handcrafted Intro Animation
    const ctx = gsap.context(() => {
      const wPath = wPathRef.current;
      const needle = needleRef.current;
      const ringGroup = ringGroupRef.current;
      const wordmark = wordmarkRef.current;
      const subtitle = subtitleRef.current;
      const validLetters = letterRefs.current.filter(Boolean) as HTMLSpanElement[];

      if (!wPath) return;

      const pathLength = wPath.getTotalLength() || 140;
      gsap.set(wPath, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
      });

      if (needle) {
        const startPt = wPath.getPointAtLength(0);
        needle.setAttribute("transform", `translate(${startPt.x}, ${startPt.y}) rotate(-45)`);
        gsap.set(needle, { opacity: 0 });
      }

      if (wordmark) {
        gsap.set(wordmark, { letterSpacing: "0.2em" });
      }

      if (validLetters.length > 0) {
        gsap.set(validLetters, { opacity: 0 });
      }

      if (subtitle) {
        gsap.set(subtitle, { opacity: 0 });
      }

      const masterTl = gsap.timeline({
        onComplete: () => {
          setSettled(true);
          try {
            sessionStorage.setItem("hv_logo_intro_settled", "true");
          } catch {
            // ignore storage failure
          }
        },
      });

      // 1. Hand-stitched W drawing + Needle tracking (1.8s, ease-in-out)
      const stitchProxy = { progress: 0 };
      masterTl.to(
        stitchProxy,
        {
          progress: 1,
          duration: 1.8,
          ease: "power2.inOut",
          onStart: () => {
            if (needle) needle.style.opacity = "1";
          },
          onUpdate: () => {
            const currentDist = stitchProxy.progress * pathLength;
            wPath.style.strokeDashoffset = `${pathLength - currentDist}px`;

            if (needle && stitchProxy.progress > 0.01 && stitchProxy.progress < 0.99) {
              const pt = wPath.getPointAtLength(currentDist);
              const sampleAhead = Math.min(pathLength, currentDist + 1.5);
              const ptAhead = wPath.getPointAtLength(sampleAhead);
              const angle =
                Math.atan2(ptAhead.y - pt.y, ptAhead.x - pt.x) * (180 / Math.PI);
              needle.setAttribute(
                "transform",
                `translate(${pt.x}, ${pt.y}) rotate(${angle + 90})`
              );
            }
          },
          onComplete: () => {
            if (needle) {
              gsap.to(needle, { opacity: 0, duration: 0.25, ease: "power1.out" });
            }
          },
        },
        0.1
      );

      // 2. Continuous 360° outer ring rotation over 12s (linear, slow seal-press effect)
      if (ringGroup) {
        masterTl.add(() => {
          gsap.to(ringGroup, {
            rotation: 360,
            repeat: -1,
            ease: "none",
            duration: 12,
            transformOrigin: "50% 50%",
          });
        }, 1.9);
      }

      // 3. HORVALLE wordmark: letters fade in one-by-one (stagger 40ms)
      if (validLetters.length > 0) {
        masterTl.to(
          validLetters,
          {
            opacity: 1,
            duration: 0.35,
            stagger: 0.04,
            ease: "power2.out",
          },
          1.85
        );
      }

      // Letter-spacing animates from 0.2em to 0.34em (final letterpress look)
      if (wordmark) {
        masterTl.to(
          wordmark,
          {
            letterSpacing: "0.34em",
            duration: 1.2,
            ease: "power2.out",
          },
          1.9
        );
      }

      // 4. "— FƏRDİ ATELYE —" subtitle fades in last (0.6s)
      if (subtitle) {
        masterTl.to(
          subtitle,
          {
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
          },
          2.6
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`inline-flex items-center gap-3 select-none group cursor-pointer ${className}`}
      aria-label="HORVVALLE Fərdi Atelye Ana Səhifə"
    >
      {/* Handcrafted Atelier Seal with Hand-drawn W Monogram */}
      <div
        style={{ width: markSize, height: markSize }}
        className="relative shrink-0 flex items-center justify-center"
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible"
        >
          {/* Subtle Paper-toned backing disk (NO gradients) */}
          <circle cx="50" cy="50" r="47" fill="#FAF6EF" stroke="none" />

          {/* Outer Double Gold Ring with Atelier Seal Marks (Rotates 360° over 12s linear) */}
          <g ref={ringGroupRef}>
            {/* Outer solid brass ring */}
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="#9A7B4F"
              strokeWidth="1.2"
              fill="none"
            />
            {/* Inner dashed gold hairline ring */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#9A7B4F"
              strokeWidth="0.8"
              strokeDasharray="2.5 2"
              fill="none"
              opacity="0.85"
            />
            {/* 4 Atelier Seal Compass Nodes (enhances continuous linear rotation feel) */}
            <circle cx="50" cy="6" r="1.3" fill="#9A7B4F" />
            <circle cx="94" cy="50" r="1.3" fill="#9A7B4F" />
            <circle cx="50" cy="94" r="1.3" fill="#9A7B4F" />
            <circle cx="6" cy="50" r="1.3" fill="#9A7B4F" />
          </g>

          {/* Hand-drawn Hand-stitched 'W' Monogram in Brass (#9A7B4F) */}
          <path
            ref={wPathRef}
            d={STITCH_PATH_W}
            stroke="#9A7B4F"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            className="transition-colors duration-200 group-hover:stroke-[#B08D57]"
          />

          {/* Tiny Needle SVG following the stroke tip during 1.8s draw */}
          <g ref={needleRef} className="pointer-events-none" style={{ opacity: 0 }}>
            {/* Needle shaft & pointed tip */}
            <path
              d="M 0 -8 L 1 -2 L 0.5 7 L 0 9 L -0.5 7 L -1 -2 Z"
              fill="#B08D57"
              stroke="#2E1A22"
              strokeWidth="0.3"
            />
            {/* Needle eyelet hole */}
            <ellipse cx="0" cy="-5" rx="0.35" ry="1.1" fill="#2E1A22" />
            {/* Brass thread tail trailing from needle eye */}
            <path
              d="M 0 -6 Q -1.5 -9 -3 -11"
              stroke="#9A7B4F"
              strokeWidth="0.75"
              fill="none"
              strokeLinecap="round"
              opacity="0.9"
            />
          </g>
        </svg>
      </div>

      {/* Brand Wordmark & Atelier Subtitle */}
      {withText && (
        <div className="flex flex-col justify-center select-none">
          {/* Main Wordmark: letters fade in staggered 40ms, letter-spacing animates 0.2em -> 0.34em */}
          <div
            ref={wordmarkRef}
            style={{ letterSpacing: settled ? "0.34em" : "0.2em" }}
            className={`font-fraunces text-[18px] sm:text-[20px] font-bold leading-none uppercase tracking-[0.34em] transition-colors duration-200 ${
              light
                ? "text-white group-hover:text-white/90"
                : "text-[#2E1A22] group-hover:text-[#3B1F2B]"
            }`}
          >
            {BRAND_LETTERS.map((letter, idx) => (
              <span
                key={`${letter}-${idx}`}
                ref={(el) => {
                  letterRefs.current[idx] = el;
                }}
                style={{ opacity: settled ? 1 : 0 }}
                className="inline-block"
              >
                {letter}
              </span>
            ))}
          </div>

          {/* Subtitle: "— FƏRDİ ATELYE —" fades in last (0.6s) */}
          <div
            ref={subtitleRef}
            style={{ opacity: settled ? 1 : 0 }}
            className={`text-[9px] uppercase tracking-[0.24em] font-['Instrument_Sans',sans-serif] font-semibold mt-1 leading-none ${
              light ? "text-[#E6C280]" : "text-[#9A7B4F]"
            }`}
          >
            — FƏRDİ ATELYE —
          </div>
        </div>
      )}
    </div>
  );
}
