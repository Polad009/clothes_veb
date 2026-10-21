"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useIntroAudio } from "@/hooks/useIntroAudio";

const STORAGE_KEY = "hv-intro";

// Luxurious cinematic bezier curves
const EASE_CINEMATIC_DRAW = [0.65, 0, 0.35, 1] as const;
const EASE_MASKED_REVEAL = [0.16, 1, 0.3, 1] as const;

export function Intro() {
  const { startAudio, fadeOutAudio } = useIntroAudio();

  // Animation step tracker (3.6s total presentation, curtain wipe at t=3.6s, done at 4.2s)
  const [animStep, setAnimStep] = useState(0);
  const [isWiped, setIsWiped] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    // 1. If inside an iframe (like admin portal preview), dismiss immediately
    if (typeof window !== "undefined" && window.parent !== window) {
      document.documentElement.dataset.intro = "off";
      setIsCompleted(true);
      return;
    }

    // 2. Check session storage or ?intro=1 bypass
    const forceIntro = typeof window !== "undefined" && window.location.search.includes("intro=1");
    if (forceIntro) {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {}
    } else {
      try {
        if (sessionStorage.getItem(STORAGE_KEY)) {
          document.documentElement.dataset.intro = "off";
          setIsCompleted(true);
          return;
        }
      } catch {}
    }

    // Mark intro active on html tag
    document.documentElement.dataset.intro = "on";

    // Start audio
    startAudio();

    // Check prefers-reduced-motion
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      const t1 = setTimeout(() => {
        try {
          sessionStorage.setItem(STORAGE_KEY, "seen");
        } catch {}
        document.documentElement.dataset.intro = "off";
        window.dispatchEvent(new CustomEvent("hv-intro-reveal"));
        setIsWiped(true);
      }, 800);

      const t2 = setTimeout(() => {
        setIsCompleted(true);
      }, 1200);

      timeoutsRef.current.push(t1, t2);
      return;
    }

    // 3. Deliberate luxury couture presentation choreography:
    const schedule = (step: number, ms: number) => {
      const id = setTimeout(() => setAnimStep(step), ms);
      timeoutsRef.current.push(id);
    };

    // Step 1: Subtle warm atelier velvet lighting (t=0.2s)
    schedule(1, 200);

    // Step 2: Hanger hook draws smoothly in polished gold (t=0.6s)
    schedule(2, 600);

    // Step 3: VV / W monogram draws in radiant gold (t=1.1s)
    schedule(3, 1100);

    // Step 4: Wordmark "HORVVALLE" slides up letter by letter (t=1.7s)
    schedule(4, 1700);

    // Step 5: Golden divider line expands & "FƏRDİ ATELYE" reveals (t=2.4s)
    schedule(5, 2400);

    // Step 6: Full brand crest settles with warm glow (t=3.0s)
    schedule(6, 3000);

    // Step 7: Audio fade-out (t=3.3s)
    const tFade = setTimeout(() => {
      fadeOutAudio(500);
    }, 3300);
    timeoutsRef.current.push(tFade);

    // Step 8: Curtain lift upward unveiling the store (t=3.6s)
    const tWipe = setTimeout(() => {
      try {
        sessionStorage.setItem(STORAGE_KEY, "seen");
      } catch {}

      window.dispatchEvent(new CustomEvent("hv-intro-reveal"));
      document.documentElement.dataset.intro = "off";
      setIsWiped(true);
    }, 3600);
    timeoutsRef.current.push(tWipe);

    // Step 9: Unmount intro from DOM (t=4.2s)
    const tFinish = setTimeout(() => {
      setIsCompleted(true);
    }, 4200);
    timeoutsRef.current.push(tFinish);

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, [startAudio, fadeOutAudio]);

  const handleDismiss = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    try {
      sessionStorage.setItem(STORAGE_KEY, "seen");
    } catch {}
    window.dispatchEvent(new CustomEvent("hv-intro-reveal"));
    document.documentElement.dataset.intro = "off";
    setIsWiped(true);
    setTimeout(() => {
      setIsCompleted(true);
    }, 450);
  };

  if (isCompleted) {
    return null;
  }

  const brandLetters = ["H", "O", "R", "V", "V", "A", "L", "L", "E"];

  return (
    <div
      id="intro"
      aria-hidden={isWiped}
      onClick={handleDismiss}
      className="fixed inset-0 z-[9999] pointer-events-auto select-none bg-[#090706] text-white overflow-hidden flex items-center justify-center cursor-default"
      style={{
        clipPath: isWiped ? "inset(0 0 100% 0)" : "inset(0 0 0% 0)",
        transition: isWiped
          ? "clip-path 0.75s cubic-bezier(0.77, 0, 0.175, 1)"
          : "none",
      }}
    >
      {/* 1. Deep Luxury Atelier Velvet & Silk Ambiance (Pure Haute Couture, zero AI tech dots) */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          opacity: animStep >= 1 ? 1 : 0,
          background:
            "radial-gradient(ellipse 65% 55% at 50% 48%, rgba(212, 175, 55, 0.10) 0%, rgba(22, 16, 12, 0.65) 50%, #090706 90%)",
        }}
      />

      {/* 2. Bespoke Tailor Architectural Frame (Delicate, timeless luxury aesthetic) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={animStep >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute inset-4 sm:inset-8 md:inset-12 rounded-3xl border border-[#D4AF37]/15 pointer-events-none"
      >
        {/* Subtle Luxury Corner Notches */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#D4AF37]/40 rounded-tl-md" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#D4AF37]/40 rounded-tr-md" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#D4AF37]/40 rounded-bl-md" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#D4AF37]/40 rounded-br-md" />
      </motion.div>

      {/* Center Stage Brand Showcase */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-xl mx-auto">
        
        {/* 3. Official Haute-Couture Hanger Monogram (VV / W) */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 mb-6 flex items-center justify-center">
          
          {/* Warm Silk Glow */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={animStep >= 2 ? { scale: 1.1, opacity: 0.25 } : { scale: 0.8, opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0 rounded-full bg-radial from-[#D4AF37]/25 to-transparent blur-2xl pointer-events-none"
          />

          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 14 }}
            animate={
              animStep >= 2
                ? { scale: 1, opacity: 1, y: 0 }
                : { scale: 0.7, opacity: 0, y: 14 }
            }
            transition={{
              duration: 1.1,
              ease: EASE_CINEMATIC_DRAW,
            }}
            className="w-full h-full flex items-center justify-center filter drop-shadow-[0_8px_32px_rgba(230,194,128,0.35)]"
          >
            <img
              src="/brand/icon-light.png"
              alt="HORVVALLE Emblemi"
              className="w-full h-full object-contain select-none pointer-events-none"
            />
          </motion.div>
        </div>

        {/* 4. Official Wordmark: "HORVVALLE" with Staggered Rise */}
        <div className="flex items-center justify-center overflow-hidden py-1 mb-2">
          {brandLetters.map((char, index) => (
            <span key={`${char}-${index}`} className="inline-block overflow-hidden mx-[1px] sm:mx-[2px]">
              <motion.span
                initial={{ y: "120%", opacity: 0 }}
                animate={
                  animStep >= 4
                    ? { y: "0%", opacity: 1 }
                    : { y: "120%", opacity: 0 }
                }
                transition={{
                  duration: 0.65,
                  delay: index * 0.045,
                  ease: EASE_MASKED_REVEAL,
                }}
                className="inline-block font-eb-garamond text-4xl sm:text-5xl md:text-6xl font-medium text-[#FAF7F2] tracking-[0.24em] select-none"
              >
                {char}
              </motion.span>
            </span>
          ))}
        </div>

        {/* 5. Fine Gold Divider Hairline */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={
            animStep >= 5
              ? { scaleX: 1, opacity: 1 }
              : { scaleX: 0, opacity: 0 }
          }
          transition={{
            duration: 0.7,
            ease: EASE_MASKED_REVEAL,
          }}
          className="h-[1.5px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent origin-center w-48 sm:w-64 my-3"
        />

        {/* 6. Subtitle: "F Ə R D İ   A T E L Y E" */}
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={
            animStep >= 5
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 10 }
          }
          transition={{
            duration: 0.6,
            delay: 0.1,
            ease: EASE_MASKED_REVEAL,
          }}
          className="text-[11px] sm:text-[12px] font-sans font-bold uppercase tracking-[0.45em] text-[#E8C98A] select-none"
        >
          FƏRDİ ATELYE
        </motion.span>

        {/* 7. Subtle Bespoke Tag */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={animStep >= 6 ? { opacity: 0.55 } : { opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="text-[9px] uppercase tracking-[0.28em] text-stone-400 mt-4 select-none font-mono"
        >
          HAUTE COUTURE · BAKI 2026
        </motion.span>

      </div>
    </div>
  );
}
