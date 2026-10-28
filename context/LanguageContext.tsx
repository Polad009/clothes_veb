"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { LanguageCode, TRANSLATIONS, Translations } from "@/lib/translations";

export interface LanguageInfo {
  code: LanguageCode;
  label: string;
  nativeName: string;
  countryName: string;
  countryCode: string;
}

export const LANGUAGES: Record<LanguageCode, LanguageInfo> = {
  az: {
    code: "az",
    label: "AZ",
    nativeName: "Azərbaycan",
    countryName: "Azərbaycan",
    countryCode: "AZ",
  },
  en: {
    code: "en",
    label: "EN",
    nativeName: "English",
    countryName: "Global / US",
    countryCode: "US",
  },
  ru: {
    code: "ru",
    label: "RU",
    nativeName: "Русский",
    countryName: "Россия / СНГ",
    countryCode: "RU",
  },
  tr: {
    code: "tr",
    label: "TR",
    nativeName: "Türkçe",
    countryName: "Türkiye",
    countryCode: "TR",
  },
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: Translations;
  detectedCountry: string | null;
  isAutoDetected: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "horvvalle_user_language_v1";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("az");
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // 1. Check if user already manually selected a language
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
      if (stored && LANGUAGES[stored]) {
        setLanguageState(stored);
        setIsHydrated(true);
        return;
      }
    } catch {
      // ignore
    }

    // 2. If no saved language, detect automatically via IP Geolocation
    const detectFromIpAndLocale = async () => {
      let resolvedCountry: string | null = null;
      let matchedLang: LanguageCode | null = null;

      try {
        // Fast, privacy-friendly IP country detection endpoint
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const res = await fetch("https://api.country.is/", {
          signal: controller.signal,
          cache: "no-store",
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data && data.country) {
            resolvedCountry = String(data.country).toUpperCase();
            setDetectedCountry(resolvedCountry);

            // Country to Language Mapping:
            if (resolvedCountry === "AZ") {
              matchedLang = "az";
            } else if (resolvedCountry === "TR") {
              matchedLang = "tr";
            } else if (
              ["RU", "BY", "KZ", "KG", "UZ", "TJ", "UA"].includes(resolvedCountry)
            ) {
              matchedLang = "ru";
            } else {
              matchedLang = "en"; // Global / US / Europe / Rest of World
            }
          }
        }
      } catch (e) {
        // IP lookup timed out or failed (e.g. ad-blocker), fallback to browser locale
      }

      // 3. Fallback to browser locale (navigator.language)
      if (!matchedLang && typeof navigator !== "undefined") {
        const nav = (navigator.language || "").toLowerCase();
        if (nav.startsWith("az")) {
          matchedLang = "az";
        } else if (nav.startsWith("tr")) {
          matchedLang = "tr";
        } else if (nav.startsWith("ru")) {
          matchedLang = "ru";
        } else {
          matchedLang = "en";
        }
      }

      const finalLang = matchedLang || "az";
      setLanguageState(finalLang);
      setIsAutoDetected(true);
      setIsHydrated(true);
    };

    detectFromIpAndLocale();
  }, []);

  const setLanguage = (code: LanguageCode) => {
    if (!LANGUAGES[code]) return;
    setLanguageState(code);
    setIsAutoDetected(false);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // ignore
    }
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.az;

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        detectedCountry,
        isAutoDetected,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
