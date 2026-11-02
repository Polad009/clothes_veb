"use client";

import React, { memo } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

interface TickerProps {
  className?: string;
}

export const Ticker = memo(function Ticker({ className = "" }: TickerProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const isHome = pathname === "/";

  const rawList = [
    t.announcements?.cottonLinen || "100% PREMİUM DARANMIŞ PAMBIQ VƏ TƏBİİ KƏTAN KOLLEKSİYASI",
    t.announcements?.guaranteedReturns || "14 GÜN ƏRZİNDƏ ASAN VƏ ZƏMANƏTLİ QAYTARILMA",
    t.announcements?.freeShipping || "BAKI VƏ SUMQAYIT ƏRAZİSİNƏ ÇATDIRILMA TAM PULSUZDUR",
    t.announcements?.customStudio || "FƏRDİ ÇAP STUDİYASI — ÖZ DİZAYNINI KÖYNƏYƏ ÇAP ET",
  ];

  return (
    <div
      style={{
        background: isHome ? "var(--hero-header-bg, #13161F)" : "#1c1917",
        contain: "paint layout",
      }}
      className={`ticker-container w-full py-2 overflow-hidden text-[10.5px] sm:text-[11px] font-medium tracking-[0.14em] uppercase select-none relative z-40 flex border-b ${
        isHome
          ? "text-white/90 border-white/10"
          : "bg-stone-900 text-stone-300 border-stone-800"
      } ${className}`}
      aria-label="Elanlar"
    >
      {/* Track 1: Compositor-thread GPU accelerated continuous stream */}
      <div className="animate-marquee-smooth flex items-center justify-around shrink-0 min-w-full">
        {rawList.map((item, idx) => (
          <span key={`t1-${idx}`} className="inline-flex items-center px-4 sm:px-6 whitespace-nowrap">
            <span>{item}</span>
            <span className="ml-4 sm:ml-6 text-[#E6C280]/80">•</span>
          </span>
        ))}
      </div>

      {/* Track 2: Seamless secondary stream running in tandem for zero-jump loop */}
      <div className="animate-marquee-smooth flex items-center justify-around shrink-0 min-w-full" aria-hidden="true">
        {rawList.map((item, idx) => (
          <span key={`t2-${idx}`} className="inline-flex items-center px-4 sm:px-6 whitespace-nowrap">
            <span>{item}</span>
            <span className="ml-4 sm:ml-6 text-[#E6C280]/80">•</span>
          </span>
        ))}
      </div>
    </div>
  );
});
