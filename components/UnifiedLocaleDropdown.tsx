"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Globe } from "lucide-react";
import {
  FlagAzerbaijan,
  FlagUSA,
  FlagTurkey,
  FlagRussia,
  FlagEU,
} from "@/components/flags";
import { LanguageCode } from "@/lib/translations";
import { LANGUAGES, LanguageInfo, useLanguage } from "@/context/LanguageContext";
import { useCurrency, CurrencyCode, CURRENCY_CONFIG } from "@/context/CurrencyContext";

export function renderFlag(countryCode: string, className = "w-4 h-3") {
  switch (countryCode.toUpperCase()) {
    case "AZ":
      return <FlagAzerbaijan className={className} />;
    case "US":
    case "EN":
      return <FlagUSA className={className} />;
    case "TR":
      return <FlagTurkey className={className} />;
    case "RU":
      return <FlagRussia className={className} />;
    case "EU":
      return <FlagEU className={className} />;
    default:
      return <FlagAzerbaijan className={className} />;
  }
}

interface UnifiedLocaleDropdownProps {
  direction?: "down" | "up";
  align?: "left" | "right";
  className?: string;
  buttonClassName?: string;
  compact?: boolean;
  variant?: "dark" | "light";
}

export function UnifiedLocaleDropdown({
  direction = "down",
  align = "right",
  className = "",
  buttonClassName = "",
  compact = false,
  variant = "dark",
}: UnifiedLocaleDropdownProps) {
  const { language, setLanguage, t } = useLanguage();
  const { currency, setCurrency, symbol } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"both" | "lang" | "curr">("both");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const currentLang: LanguageInfo = LANGUAGES[language] || LANGUAGES.az;
  const currentCurr = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.AZN;

  const languagesList: LanguageInfo[] = Object.values(LANGUAGES);
  const currenciesList: CurrencyCode[] = ["AZN", "USD", "EUR"];

  const isDark = variant === "dark";

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* 
        Single Unified Luxury Trigger Capsule
      */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 shadow-sm cursor-pointer ${
          isDark
            ? "bg-white/15 hover:bg-white/25 border border-white/25 text-white"
            : "bg-black/5 hover:bg-black/10 border border-[#EAE3D8] text-stone-700"
        } ${buttonClassName}`}
        aria-expanded={isOpen}
        title="Bölgə, Dil və Valyuta Seçimi / Language & Currency"
      >
        {/* Flag of active language */}
        <span className="flex items-center">
          {renderFlag(currentLang.countryCode, "w-4 h-2.5 sm:w-4.5 sm:h-3")}
        </span>

        {/* Unified Tag: "AZ · ₼ AZN" */}
        <div className="flex items-center gap-1 font-bold tracking-tight text-[11px] sm:text-xs">
          <span className={`uppercase ${isDark ? "text-white" : "text-zinc-900"}`}>{currentLang.label}</span>
          <span className={`${isDark ? "text-white/40" : "text-zinc-300"} select-none`}>/</span>
          <span className={`${isDark ? "text-[#E6C280]" : "text-zinc-600"} font-medium`}>{currentCurr.symbol}</span>
          <span className={`${isDark ? "text-white font-bold" : "text-zinc-900 font-bold"}`}>{currentCurr.code}</span>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.18, ease: "easeInOut" }}
          className={`${isDark ? "text-white/70 group-hover:text-white" : "text-zinc-400 group-hover:text-zinc-900"} ml-0.5`}
        >
          <ChevronDown size={13} />
        </motion.div>
      </button>

      {/* Unified Floating Preferences Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: direction === "down" ? -6 : 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: direction === "down" ? -6 : 6, scale: 0.98, transition: { duration: 0.15, ease: "easeIn" } }}
            transition={{
              duration: 0.22,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              backgroundColor: isDark ? "#140B05" : "#FAF7F2",
              transformOrigin:
                direction === "down"
                  ? align === "right"
                    ? "top right"
                    : "top left"
                  : align === "right"
                  ? "bottom right"
                  : "bottom left",
            }}
            className={`absolute z-[100] w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl p-3.5 shadow-2xl border ${
              isDark
                ? "border-white/20 text-white shadow-[0_25px_70px_rgba(0,0,0,0.7)]"
                : "border-[#E8E2D8] text-[#1A1517] shadow-[0_25px_70px_rgba(0,0,0,0.2)]"
            } ${
              align === "right" ? "right-0 left-auto" : "left-0 right-auto"
            } ${
              direction === "down"
                ? "top-full mt-2"
                : "bottom-full mb-2"
            }`}
          >
            {/* Popover Header */}
            <div className={`flex items-center justify-between pb-2.5 mb-2.5 border-b ${isDark ? "border-white/10" : "border-zinc-100"}`}>
              <div className="flex items-center gap-1.5">
                <Globe size={14} className={isDark ? "text-[#E6C280]" : "text-zinc-500"} />
                <span className={`text-xs font-black uppercase tracking-wider ${isDark ? "text-white" : "text-zinc-800"}`}>
                  {language === "az" ? "Bölgə və Seçimlər" : language === "tr" ? "Bölge ve Tercihler" : language === "ru" ? "Регион и Валюта" : "Region & Preferences"}
                </span>
              </div>
              <span className={`text-[10px] font-semibold uppercase tracking-widest ${isDark ? "text-[#E6C280]" : "text-zinc-400"}`}>
                HORVVALLE
              </span>
            </div>

            {/* Section 1: Dil / Language */}
            <div className="space-y-1.5 mb-3.5">
              <div className="flex items-center justify-between px-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-white/60" : "text-zinc-400"}`}>
                  {language === "az" ? "Saytın Dili" : language === "tr" ? "Dil Seçimi" : language === "ru" ? "Язык сайта" : "Language"}
                </span>
                <span className={`text-[10px] font-semibold ${isDark ? "text-white/80" : "text-zinc-500"}`}>
                  {currentLang.nativeName}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {languagesList.map((item) => {
                  const isSelected = item.code === language;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setLanguage(item.code)}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all border cursor-pointer ${
                        isSelected
                          ? isDark
                            ? "bg-white text-black font-bold border-white shadow-sm"
                            : "bg-zinc-900 text-white font-bold border-zinc-900 shadow-sm"
                          : isDark
                          ? "bg-white/10 hover:bg-white/20 text-white border-white/15"
                          : "bg-white hover:bg-stone-50 text-zinc-800 hover:text-black border-stone-200/90 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {renderFlag(item.countryCode, "w-4 h-3")}
                        <span className="truncate">{item.nativeName}</span>
                      </div>
                      {isSelected && <Check size={13} className={`${isDark ? "text-black" : "text-white"} shrink-0`} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Valyuta / Currency */}
            <div className={`space-y-1.5 pt-2.5 border-t ${isDark ? "border-white/10" : "border-zinc-100"}`}>
              <div className="flex items-center justify-between px-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-white/60" : "text-zinc-400"}`}>
                  {language === "az" ? "Valyuta" : language === "tr" ? "Para Birimi" : language === "ru" ? "Валюта" : "Currency"}
                </span>
                <span className={`text-[10px] font-semibold ${isDark ? "text-white/80" : "text-zinc-500"}`}>
                  1 AZN ≈ {currentCurr.rateAgainstAzn.toFixed(2)} {currentCurr.code}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {currenciesList.map((code) => {
                  const curr = CURRENCY_CONFIG[code];
                  const isSelected = curr.code === currency;
                  return (
                    <button
                      key={curr.code}
                      type="button"
                      onClick={() => setCurrency(curr.code)}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs transition-all border cursor-pointer ${
                        isSelected
                          ? isDark
                            ? "bg-white text-black font-bold border-white shadow-sm"
                            : "bg-zinc-900 text-white font-bold border-zinc-900 shadow-sm"
                          : isDark
                          ? "bg-white/10 hover:bg-white/20 text-white border-white/15"
                          : "bg-white hover:bg-stone-50 text-zinc-800 hover:text-black border-stone-200/90 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center gap-1 font-bold">
                        <span className={`text-sm ${isSelected && isDark ? "text-black" : isDark ? "text-[#E6C280]" : ""}`}>{curr.symbol}</span>
                        <span>{curr.code}</span>
                      </div>
                      <span className={`text-[9px] mt-0.5 truncate ${isSelected ? (isDark ? "text-black/70" : "text-zinc-300") : (isDark ? "text-white/50" : "text-zinc-400")}`}>
                        {code === "AZN" ? "Manat" : code === "USD" ? "Dollar" : "Avro"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Smart Auto-save Footer Note */}
            <div className={`mt-3 pt-2 border-t ${isDark ? "border-white/10 text-white/50" : "border-zinc-100 text-zinc-400"} flex items-center justify-between text-[10px] px-1`}>
              <span className={`flex items-center gap-1.5 ${isDark ? "text-white/70" : "text-zinc-500"} font-medium`}>
                <Check size={12} className="text-[#E6C280] shrink-0" />
                {language === "az" ? "Seçimlər avtomatik tətbiq edilir" : "Settings auto-saved"}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={`font-bold underline cursor-pointer ${isDark ? "text-white hover:text-[#E6C280]" : "text-zinc-700 hover:text-black"}`}
              >
                {language === "az" ? "Bağla" : "Done"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
