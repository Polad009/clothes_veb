"use client";

import { getGeo } from "@/lib/geoClient";

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
      // Check cookies first (set by edge middleware)
      const matchCookie = document.cookie.match(/horvvalle_user_language_v1=([^;]+)/);
      const cookieLang = matchCookie ? (matchCookie[1].trim() as LanguageCode) : null;
      if (cookieLang && LANGUAGES[cookieLang]) {
        setLanguageState(cookieLang);
      }

      const stored = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
      if (stored && LANGUAGES[stored]) {
        setLanguageState(stored);
        setIsHydrated(true);
        return;
      }
    } catch {
      // ignore
    }

    // 2. If no saved language, detect automatically via Edge Geo API / IP Geolocation
    const detectFromIpAndLocale = async () => {
      let resolvedCountry: string | null = null;
      let matchedLang: LanguageCode | null = null;

      try {
        // Fast internal Edge endpoint
        const geoData = await getGeo();
        {
          if (geoData && geoData.country) {
            resolvedCountry = String(geoData.country).toUpperCase();
            setDetectedCountry(resolvedCountry);
            matchedLang = geoData.defaultLang as LanguageCode;
          }
        }
      } catch (e) {
        // ignore fallback
      }

      // External fallback if internal geo didn't resolve country
      if (!resolvedCountry) {
        try {
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
              if (resolvedCountry === "AZ") {
                matchedLang = "az";
              } else {
                matchedLang = "en";
              }
            }
          }
        } catch {
          // ignore
        }
      }

      // Fallback to browser locale (navigator.language)
      if (!matchedLang && typeof navigator !== "undefined") {
        const nav = (navigator.language || "").toLowerCase();
        if (nav.startsWith("az")) {
          matchedLang = "az";
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
      document.cookie = `${STORAGE_KEY}=${code}; path=/; max-age=2592000; SameSite=Lax`;
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
