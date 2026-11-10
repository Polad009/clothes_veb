"use client";

import React, { memo } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useStoreData } from "@/context/StoreDataContext";

interface TickerProps {
  className?: string;
}

export const Ticker = memo(function Ticker({ className = "" }: TickerProps) {
  const pathname = usePathname();
  const { t, language } = useLanguage();
  const { content } = useStoreData();
  const isHome = pathname === "/";

  const translated = [
    t.announcements?.freeShipping || "BAKI VƏ SUMQAYIT ƏRAZİSİNƏ ÇATDIRILMA PULSUZDUR",
    t.announcements?.customStudio || "FƏRDİ ÇAP STUDİYASI — ÖZ DİZAYNINI KÖYNƏYƏ ÇAP ET",
    t.announcements?.cottonLinen || "100% PREMİUM DARANMIŞ PAMBIQ VƏ TƏBİİ KƏTAN KOLLEKSİYASI",
    t.announcements?.guaranteedReturns || "14 GÜN ƏRZİNDƏ ASAN VƏ ZƏMANƏTLİ QAYTARILMA",
  ];

  // Announcements come from the admin per language; a language without its own list uses the built-in texts.
  const source = language === "az" ? content?.announcements : content?.i18n?.[language]?.announcements;
  const managed: string[] = Array.isArray(source)
    ? source.filter((a: unknown): a is string => typeof a === "string" && a.trim().length > 0)
    : [];
  const announcementsList = managed.length > 0 ? managed : translated;

  return (
    <div
      style={{
        background: isHome ? "var(--hero-header-bg, #13161F)" : "#1c1917",
      }}
      className={`ticker-container w-full py-2 overflow-hidden text-[10px] sm:text-[11px] font-medium tracking-[0.14em] uppercase select-none relative z-40 flex border-b transition-colors duration-500 ${
        isHome
          ? "text-white/90 border-white/10"
          : "bg-stone-900 text-stone-300 border-stone-800"
      } ${className}`}
      aria-label="Elanlar"
    >
      {/* Track 1: Compositor-thread GPU accelerated continuous stream */}
      <div className="animate-marquee-smooth flex items-center shrink-0">
        {announcementsList.map((item, idx) => (
          <span key={`t1-${idx}`} className="inline-flex items-center px-4 sm:px-8 whitespace-nowrap">
            <span>{item}</span>
            <span className="ml-4 sm:ml-8 text-[#E6C280]/90 font-bold">•</span>
          </span>
        ))}
      </div>

      {/* Track 2: Seamless secondary stream running in tandem for zero-jump loop */}
      <div className="animate-marquee-smooth flex items-center shrink-0" aria-hidden="true">
        {announcementsList.map((item, idx) => (
          <span key={`t2-${idx}`} className="inline-flex items-center px-4 sm:px-8 whitespace-nowrap">
            <span>{item}</span>
            <span className="ml-4 sm:ml-8 text-[#E6C280]/90 font-bold">•</span>
          </span>
        ))}
      </div>
    </div>
  );
});
