"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export const INTRO_MODE: "session" | "always" = "session";
const SESSION_STORAGE_KEY = "introSeen";
const BRAND_LETTERS = ["H", "O", "R", "V", "V", "A", "L", "L", "E"];

/**
 * Luxury 4-Point Diamond Sparkle Star (Parıldayan Ulduz)
 */
function SparkleStar({
  x,
  y,
  size = 14,
  delay = 0,
}: {
  x: string;
  y: string;
  size?: number;
  delay?: number;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none z-30"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        transform: "translate(-50%, -50%)",
      }}
      initial={{ scale: 0, opacity: 0, rotate: 0 }}
      animate={{
        scale: [0, 1.25, 0.9, 1.3, 0],
        opacity: [0, 1, 0.8, 1, 0],
        rotate: [0, 45, 90, 135, 180],
      }}
      transition={{
        duration: 1.35,
        delay,
        repeat: Infinity,
        repeatDelay: 0.5,
        ease: "easeInOut",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-full h-full filter drop-shadow-[0_0_8px_rgba(255,235,160,0.95)]"
      >
        <path
          d="M 12 0 Q 12 12 0 12 Q 12 12 12 24 Q 12 12 24 12 Q 12 12 12 0 Z"
          fill="#FFFDF5"
        />
        <circle cx="12" cy="12" r="2.5" fill="#FFFFFF" />
      </svg>
    </motion.div>
  );
}

/**
 * Minimalist & Elite Studio Luminaire with Beam Falling Directly on HORVVALLE
 * 
 * - Beam originates at lens (y=64) and falls directly onto the logo & typography.
 * - Expanding theatrical cones envelop HORVVALLE so there is zero black gap behind it.
 * - Terminates gracefully at the typography baseline; zero beam below HORVVALLE.
 * - Pure SVG linear gradients without CSS blur filters to eliminate GPU caching artifacts.
 * - Zero artificial circular ambient radial glow disc.
 */
interface MinimalistLuminaireProps {
  xPercent: number; // 20%, 50%, 80% (strict 30% equal spacing)
  angle: number | number[];
  beamLength: number;
  transitionDuration: number;
  transitionEase: any;
  animStep: number;
  gradientId: string;
  isCenter?: boolean;
}

function MinimalistLuminaire({
  xPercent,
  angle,
  beamLength,
  transitionDuration,
  transitionEase,
  animStep,
  gradientId,
  isCenter = false,
}: MinimalistLuminaireProps) {
  const safeLength = Math.max(380, beamLength);
  const svgHeight = safeLength + 40;

  return (
    <div
      className="absolute top-0 pointer-events-none z-20 flex flex-col items-center"
      style={{
        left: `${xPercent}%`,
        transform: "translateX(-50%)",
      }}
    >
      {/* 1. Minimalist Ceiling Track Adapter (Fixed to top rail) */}
      <div className="w-3.5 h-2.5 bg-[#141414] border-b border-white/20 rounded-b-[1px] flex items-center justify-center">
        <div className="w-1.5 h-1 bg-[#D4AF37]/50 rounded-[0.5px]" />
      </div>

      {/* 2. Swiveling Luminaire Head + Attached Volumetric Beam */}
      <motion.div
        className="relative"
        style={{
          transformOrigin: "50% 20px",
          willChange: "transform",
        }}
        animate={{ rotate: angle }}
        transition={{
          duration: transitionDuration,
          ease: transitionEase,
        }}
      >
        <svg
          width="800"
          height={svgHeight}
          viewBox={`-400 0 800 ${svgHeight}`}
          className="overflow-visible"
        >
          <defs>
            {/* Core Volumetric Silk Beam Gradient - 100% transparent at safeLength */}
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.96" />
              <stop offset="12%" stopColor="#FFF2DE" stopOpacity="0.80" />
              <stop offset="40%" stopColor="#E6C280" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#B08D57" stopOpacity="0.22" />
              <stop offset="90%" stopColor="#7A5810" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#030303" stopOpacity="0" />
            </linearGradient>

            {/* Soft Ambient Outer Halo Beam Gradient */}
            <linearGradient id={`outer-${gradientId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
              <stop offset="16%" stopColor="#FFF2DE" stopOpacity="0.30" />
              <stop offset="48%" stopColor="#E6C280" stopOpacity="0.15" />
              <stop offset="78%" stopColor="#B08D57" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#030303" stopOpacity="0" />
            </linearGradient>

            {/* Minimalist Matte Obsidian Canister Gradient */}
            <linearGradient id={`housing-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0E0E0E" />
              <stop offset="50%" stopColor="#222222" />
              <stop offset="85%" stopColor="#141414" />
              <stop offset="100%" stopColor="#0A0A0A" />
            </linearGradient>
          </defs>

          {/* 
            ===================================================================
            A. VOLUMETRIC LIGHT BEAMS (FALLING DIRECTLY ON HORVVALLE)
            - Origin: lens aperture at y=64
            - Expands into majestic theatrical cones covering the emblem & letters
            - Fades smoothly at the typography baseline (safeLength)
            =================================================================== 
          */}
          {/* Layer 1: Soft Outer Volumetric Feathering */}
          <motion.polygon
            points={
              animStep >= 4
                ? `-22,64 22,64 95,${safeLength} -95,${safeLength}` // Broad cone bathing the brand mark
                : `-24,64 24,64 125,${safeLength} -125,${safeLength}` // Sweeping search cone
            }
            fill={`url(#outer-${gradientId})`}
            animate={
              animStep >= 1
                ? { opacity: isCenter ? 0.40 : 0.50 }
                : { opacity: 0 }
            }
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          {/* Layer 2: Core Concentrated Optical Shaft */}
          <motion.polygon
            points={
              animStep >= 4
                ? `-12,64 12,64 58,${safeLength} -58,${safeLength}` // Radiant optical core illuminating HORVVALLE
                : `-15,64 15,64 72,${safeLength} -72,${safeLength}`
            }
            fill={`url(#${gradientId})`}
            animate={
              animStep >= 4
                ? { opacity: isCenter ? 0.88 : 0.96 }
                : animStep >= 1
                ? { opacity: isCenter ? 0.50 : 0.75 }
                : { opacity: 0 }
            }
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          {/* 
            ===================================================================
            B. MINIMALIST & ELITE CANISTER FIXTURE BODY
            =================================================================== 
          */}
          {/* Swivel Stem */}
          <rect x="-2" y="10" width="4" height="11" rx="1" fill="#444" />

          {/* Minimalist Slim Yoke */}
          <path
            d="M -16,18 L -16,30 Q -16,36 -10,36 L 10,36 Q 16,36 16,30 L 16,18"
            stroke="#2A2A2A"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />

          {/* Sleek Matte Obsidian Canister */}
          <rect
            x="-13"
            y="24"
            width="26"
            height="32"
            rx="2.5"
            fill={`url(#housing-${gradientId})`}
            stroke="#111"
            strokeWidth="0.8"
          />

          {/* Minimalist Champagne Gold Accent Ring */}
          <line x1="-13" y1="38" x2="13" y2="38" stroke="#D4AF37" strokeWidth="0.75" opacity="0.6" />

          {/* Tapered Bezel leading to the lens */}
          <polygon
            points="-13,56 13,56 18,64 -18,64"
            fill={`url(#housing-${gradientId})`}
            stroke="#1A1A1A"
            strokeWidth="0.6"
          />

          {/* 
            ===================================================================
            C. OPTICAL LENS APERTURE (Origin of the light beam at y=64)
            =================================================================== 
          */}
          {/* Fine Champagne Chamfer Rim */}
          <ellipse
            cx="0"
            cy="64"
            rx="18"
            ry="4.5"
            fill="none"
            stroke="#EAD295"
            strokeWidth="0.8"
            opacity="0.8"
          />

          {/* Glowing Lens Disc */}
          <motion.ellipse
            cx="0"
            cy="64"
            rx="16"
            ry="4"
            fill="#FFFFFF"
            animate={
              animStep >= 1
                ? { opacity: [0.85, 1, 0.9, 1] }
                : { opacity: 0 }
            }
            transition={{ duration: 0.4 }}
          />

          {/* Specular Aperture Flare Ring */}
          <motion.ellipse
            cx="0"
            cy="64"
            rx="24"
            ry="6"
            fill="none"
            stroke="#FFE7A0"
            strokeWidth="1.2"
            opacity={animStep >= 1 ? 0.75 : 0}
          />
        </svg>
      </motion.div>
    </div>
  );
}

export function Intro() {
  const pathname = usePathname();
  const [status, setStatus] = useState<"checking" | "playing" | "fading" | "completed">("checking");
  const [animStep, setAnimStep] = useState(0);
  const [revealedLetterCount, setRevealedLetterCount] = useState(0);
  const [windowDimensions, setWindowDimensions] = useState<{ width: number; height: number }>({
    width: 1440,
    height: 900,
  });

  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    // 1. Only show on home page root ("/"), NEVER on subpages or when refreshing any other page
    if (pathname !== "/") {
      setStatus("completed");
      return;
    }

    // 2. If inside an iframe (like admin preview), dismiss immediately
    if (typeof window !== "undefined" && window.parent !== window) {
      setStatus("completed");
      return;
    }

    // 3. Check persistent storage for "introSeen" - persists across F5 and reloads
    let alreadySeen = false;
    try {
      alreadySeen =
        localStorage.getItem(SESSION_STORAGE_KEY) === "true" ||
        sessionStorage.getItem(SESSION_STORAGE_KEY) === "true";
    } catch {}

    const forceIntro = typeof window !== "undefined" && window.location.search.includes("intro=1");

    if (alreadySeen && !forceIntro) {
      // User has already seen the intro: do not play on F5/refresh
      setStatus("completed");
      return;
    }

    // Mark as seen in both storages immediately so any subsequent F5 will never replay it
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, "true");
      sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
    } catch {}

    // First visit: Lock body scroll & start intro
    setStatus("playing");
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.classList.add("intro-running");

    const updateDimensions = () => {
      setWindowDimensions({
        width: window.innerWidth || 1440,
        height: window.innerHeight || 900,
      });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    const schedule = (step: number, ms: number) => {
      const id = setTimeout(() => setAnimStep(step), ms);
      timeoutsRef.current.push(id);
    };

    // Fast, crisp cinematic animation (~2.1s total)
    schedule(1, 50);
    schedule(2, 300);

    BRAND_LETTERS.forEach((_, idx) => {
      const id = setTimeout(() => {
        setRevealedLetterCount(idx + 1);
      }, 450 + idx * 60);
      timeoutsRef.current.push(id);
    });

    schedule(4, 1100);
    schedule(5, 1300);

    const tFade = setTimeout(() => {
      document.documentElement.classList.remove("intro-running");
      document.documentElement.dataset.intro = "off";
      window.dispatchEvent(new CustomEvent("hv-intro-reveal"));
      setStatus("fading");
    }, 2100);
    timeoutsRef.current.push(tFade);

    const tFinish = setTimeout(() => {
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, "true");
        sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
      } catch {}
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      setStatus("completed");
    }, 2500);
    timeoutsRef.current.push(tFinish);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " ") {
        dismissImmediately();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("keydown", handleKeyDown);
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.documentElement.classList.remove("intro-running");
    };
  }, []);

  const dismissImmediately = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, "true");
      sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
    } catch {}
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    document.documentElement.classList.remove("intro-running");
    document.documentElement.dataset.intro = "off";
    window.dispatchEvent(new CustomEvent("hv-intro-reveal"));
    setStatus("completed");
  }, []);

  if (status !== "playing" && status !== "fading") {
    return null;
  }

  const isFading = status === "fading";

  // =========================================================================
  // LASER-ACCURATE CONVERGENCE DIRECTLY ONTO "HORVVALLE"
  // =========================================================================
  const { width: W, height: H } = windowDimensions;
  const deltaX = 0.30 * W;
  const deltaY = Math.max(340, Math.round(0.50 * H + 45));
  const targetAngleDeg = Math.round(Math.atan2(deltaX, deltaY) * (180 / Math.PI));

  const sideBeamLength = Math.round(Math.sqrt(deltaX * deltaX + deltaY * deltaY));
  const centerBeamLength = Math.round(deltaY);

  const leftAngle =
    animStep >= 4
      ? -targetAngleDeg
      : animStep >= 1
      ? [-8, -26, 20, -14, -targetAngleDeg]
      : 0;

  const rightAngle =
    animStep >= 4
      ? targetAngleDeg
      : animStep >= 1
      ? [8, 26, -20, 14, targetAngleDeg]
      : 0;

  const centerAngle =
    animStep >= 4
      ? 0
      : animStep >= 1
      ? [0, -10, 10, -3, 0]
      : 0;

  const transitionDuration = animStep >= 4 ? 0.95 : 2.65;
  const transitionEase = animStep >= 4 ? [0.16, 1, 0.3, 1] : "easeInOut";

  return (
    <div
      id="intro"
      aria-hidden={isFading}
      onClick={dismissImmediately}
      className={`fixed inset-0 z-[99999] select-none bg-[#030303] text-white overflow-hidden flex items-center justify-center transition-all duration-700 ease-out isolate cursor-pointer ${
        isFading
          ? "opacity-0 scale-[1.02] -translate-y-2 pointer-events-none"
          : "opacity-100 scale-100 translate-y-0 pointer-events-auto"
      }`}
      style={{
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        willChange: "transform, opacity",
      }}
    >

      {/* 1. Deep Obsidian Velvet Solid Canvas (100% clean solid black; NO circular ambient radial glow) */}
      <div className="absolute inset-0 bg-[#030303] pointer-events-none" />

      {/* =====================================================================
          2. MINIMALIST HORIZONTAL CEILING TRACK RAIL
          ===================================================================== */}
      <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-b from-[#282828] via-[#141414] to-[#080808] border-b border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.85)] z-30 pointer-events-none" />

      {/* =====================================================================
          3. THREE EQUALLY SPACED STUDIO TRACK SPOTLIGHTS (20%, 50%, 80%)
          Equal spacing: 30% interval between each fixture.
          Beams are physically locked to the lamps, sweep with rich choreography,
          and fall directly onto the emblem and typography of HORVVALLE.
          ===================================================================== */}
      <MinimalistLuminaire
        xPercent={20}
        angle={leftAngle}
        beamLength={sideBeamLength}
        transitionDuration={transitionDuration}
        transitionEase={transitionEase}
        animStep={animStep}
        gradientId="leftUnifiedBeam"
      />

      <MinimalistLuminaire
        xPercent={50}
        angle={centerAngle}
        beamLength={centerBeamLength}
        transitionDuration={transitionDuration}
        transitionEase={transitionEase}
        animStep={animStep}
        gradientId="centerUnifiedBeam"
        isCenter={true}
      />

      <MinimalistLuminaire
        xPercent={80}
        angle={rightAngle}
        beamLength={sideBeamLength}
        transitionDuration={transitionDuration}
        transitionEase={transitionEase}
        animStep={animStep}
        gradientId="rightUnifiedBeam"
      />

      {/* =====================================================================
          4. CENTER STAGE: OFFICIAL SCULPTED 3D EMBLEM & "HORVVALLE"
          Bathed in the converging spotlight beams.
          Reveals smoothly in tandem with the light sweep.
          Includes brilliant twinkling diamond sparkle star effects!
          ===================================================================== */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-xl mx-auto">
        
        {/* Official 3D Sculpted Ribbon 'H' Emblem */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-4 flex items-center justify-center">
          
          {/* Emblem container smoothly emerging under the spotlights */}
          <motion.div
            initial={{ scale: 0.90, opacity: 0, y: 10 }}
            animate={
              animStep >= 4
                ? { scale: 1, opacity: 1, y: 0 }
                : animStep >= 2
                ? { scale: 0.96, opacity: 0.70, y: 3 }
                : { scale: 0.90, opacity: 0, y: 10 }
            }
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full h-full flex items-center justify-center filter drop-shadow-[0_14px_36px_rgba(240,210,130,0.55)] overflow-hidden rounded-2xl"
          >
            <Image
              src="/brand/icon-light.png"
              alt="HORVVALLE Monogram"
              fill
              priority
              sizes="112px"
              className="object-contain select-none pointer-events-none"
            />

            {/* Specular Light Gleam sweeping across the 3D ribbon */}
            <motion.div
              initial={{ x: "-130%", opacity: 0 }}
              animate={
                animStep >= 4
                  ? { x: "150%", opacity: [0, 0.85, 0] }
                  : { x: "-130%", opacity: 0 }
              }
              transition={{ duration: 0.9, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/55 to-transparent -skew-x-12 pointer-events-none"
            />
          </motion.div>

          {/* Twinkling Diamond Star Sparkles on the 3D Ribbon Emblem */}
          {animStep >= 4 && (
            <>
              <SparkleStar x="68%" y="16%" size={16} delay={0.1} />
              <SparkleStar x="30%" y="62%" size={14} delay={0.65} />
              <SparkleStar x="50%" y="42%" size={18} delay={1.1} />
            </>
          )}
        </div>

        {/* 
          Official Wordmark: "HORVVALLE" 
          Illuminated directly by the convergent beams.
          Progressively written & revealed letter-by-letter in harmony with moving light!
        */}
        <div className="relative flex items-center justify-center overflow-visible py-1">
          {BRAND_LETTERS.map((char, index) => {
            const isRevealed = revealedLetterCount > index;
            return (
              <span key={`${char}-${index}`} className="inline-block overflow-hidden mx-[2px] sm:mx-[3px]">
                <motion.span
                  initial={{ y: "125%", opacity: 0, filter: "blur(4px)" }}
                  animate={
                    isRevealed
                      ? { y: "0%", opacity: 1, filter: "blur(0px)" }
                      : { y: "125%", opacity: 0, filter: "blur(4px)" }
                  }
                  transition={{
                    duration: 0.55,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="inline-block font-eb-garamond text-3xl sm:text-4xl md:text-5xl font-semibold text-[#FAF7F2] tracking-[0.26em] select-none"
                >
                  {char}
                </motion.span>
              </span>
            );
          })}

          {/* Twinkling Diamond Star Sparkles on "HORVVALLE" Letters */}
          {animStep >= 4 && (
            <>
              {/* Star on 'H' */}
              <SparkleStar x="5%" y="18%" size={15} delay={0.3} />
              {/* Star on first 'V' */}
              <SparkleStar x="40%" y="28%" size={14} delay={0.8} />
              {/* Star on 'A' */}
              <SparkleStar x="62%" y="12%" size={16} delay={0.45} />
              {/* Star on final 'E' */}
              <SparkleStar x="95%" y="22%" size={15} delay={0.95} />
              {/* Star on center 'O' */}
              <SparkleStar x="19%" y="40%" size={13} delay={1.25} />
            </>
          )}
        </div>

      </div>
    </div>
  );
}
