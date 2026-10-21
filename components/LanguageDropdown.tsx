"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import {
  FlagAzerbaijan,
  FlagUSA,
  FlagTurkey,
  FlagRussia,
} from "@/components/flags";
import { LanguageCode } from "@/lib/translations";
import { LANGUAGES, LanguageInfo, useLanguage } from "@/context/LanguageContext";

export function renderLanguageFlag(code: LanguageCode, className = "w-5 h-3.5") {
  switch (code) {
    case "az":
      return <FlagAzerbaijan className={className} />;
    case "en":
      return <FlagUSA className={className} />;
    case "tr":
      return <FlagTurkey className={className} />;
    case "ru":
      return <FlagRussia className={className} />;
    default:
      return <FlagAzerbaijan className={className} />;
  }
}

interface LanguageDropdownProps {
  direction?: "down" | "up";
  className?: string;
}

export function LanguageDropdown({
  direction = "down",
  className = "",
}: LanguageDropdownProps) {
  const { language, setLanguage, isAutoDetected, detectedCountry } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
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

  const currentOption: LanguageInfo = LANGUAGES[language] || LANGUAGES.az;

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  const languageList: LanguageInfo[] = Object.values(LANGUAGES);

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button with Real Vector Flag */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200/90 text-xs font-semibold text-zinc-800 transition-all active:scale-95 shadow-2xs hover:border-zinc-300"
        aria-expanded={isOpen}
        title="Dili dəyiş / Change language"
      >
        <span className="flex items-center">{renderLanguageFlag(currentOption.code, "w-5 h-3.5")}</span>
        <span className="font-bold tracking-tight uppercase">{currentOption.label}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="text-zinc-500 group-hover:text-zinc-900"
        >
          <ChevronDown size={14} />
        </motion.div>
      </button>

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: direction === "down" ? -8 : 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: direction === "down" ? -6 : 6, scale: 0.96, transition: { duration: 0.14, ease: "easeIn" } }}
            transition={{
              type: "spring",
              damping: 24,
              stiffness: 380,
              mass: 0.7,
            }}
            style={{
              transformOrigin: direction === "down" ? "top left" : "bottom left",
            }}
            className={`absolute z-50 min-w-[210px] rounded-2xl bg-white/95 backdrop-blur-md p-1.5 shadow-apple border border-zinc-200/80 ${
              direction === "down"
                ? "top-full mt-1.5 right-0 sm:right-auto sm:left-0"
                : "bottom-full mb-1.5 right-0 sm:right-auto sm:left-0"
            }`}
          >
            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              <span>Dil Seçimi</span>
              {detectedCountry && (
                <span className="font-mono text-[9px] text-zinc-400">
                  IP: {detectedCountry}
                </span>
              )}
            </div>
            <div className="space-y-0.5">
              {languageList.map((langItem) => {
                const isCurrent = langItem.code === language;
                return (
                  <button
                    key={langItem.code}
                    type="button"
                    onClick={() => handleSelect(langItem.code)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      isCurrent
                        ? "bg-zinc-900 text-white font-bold shadow-2xs"
                        : "text-zinc-700 hover:bg-zinc-100 hover:text-black"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center">
                        {renderLanguageFlag(langItem.code, "w-5 h-3.5")}
                      </span>
                      <div className="flex flex-col text-left">
                        <span className="font-bold leading-none">{langItem.nativeName}</span>
                        <span
                          className={`text-[10px] leading-tight mt-0.5 ${
                            isCurrent ? "text-zinc-300" : "text-zinc-500"
                          }`}
                        >
                          {langItem.countryName}
                        </span>
                      </div>
                    </div>
                    {isCurrent && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <Check size={14} className="text-white" />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
