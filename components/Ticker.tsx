"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

interface TickerProps {
  className?: string;
}

export function Ticker({ className = "" }: TickerProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const isHome = pathname === "/";

  const rawList = [
    t.announcements?.cottonLinen || "100% PREMİUM DARANMIŞ PAMBIQ VƏ TƏBİİ KƏTAN KOLLEKSİYASI",
    t.announcements?.guaranteedReturns || "14 GÜN ƏRZİNDƏ ASAN VƏ ZƏMANƏTLİ QAYTARILMA",
    t.announcements?.freeShipping || "BAKI VƏ SUMQAYIT ƏRAZİSİNƏ ÇATDIRILMA TAM PULSUZDUR",
    t.announcements?.customStudio || "FƏRDİ ÇAP STUDİYASI — ÖZ DİZAYNINI KÖYNƏYƏ ÇAP ET",
  ];

  const tickerString = rawList.join(" • ") + " • ";

  return (
    <div
      style={{
        background: isHome ? "var(--hero-header-bg, #542E13)" : undefined,
        transition: "background 0.75s ease-in-out",
      }}
      className={`w-full py-2 overflow-hidden text-[10.5px] sm:text-[11px] font-medium tracking-[0.12em] uppercase select-none relative z-40 ${
        isHome
          ? "text-white/90 border-none"
          : "bg-stone-900 text-stone-300 border-b border-stone-800"
      } ${className}`}
      aria-label="Elanlar"
    >
      <div className="animate-marquee-30 whitespace-nowrap flex items-center">
        <span className="inline-block px-4">{tickerString}</span>
        <span className="inline-block px-4">{tickerString}</span>
        <span className="inline-block px-4">{tickerString}</span>
        <span className="inline-block px-4">{tickerString}</span>
      </div>
    </div>
  );
}
