"use client";

import { getGeo } from "@/lib/geoClient";
import { compareAtFor, DEFAULT_FOREIGN_MARKUP, unitPriceFor } from "@/lib/pricing";

import React, { createContext, useContext, useState, useEffect } from "react";

export type CurrencyCode = "AZN" | "USD";

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  label: string;
  flag: string;
  rateAgainstAzn: number; // 1 AZN in this currency
}

export const CURRENCY_CONFIG: Record<CurrencyCode, CurrencyInfo> = {
  AZN: {
    code: "AZN",
    symbol: "₼",
    label: "AZN (₼) - Manat",
    flag: "🇦🇿",
    rateAgainstAzn: 1.0,
  },
  USD: {
    code: "USD",
    symbol: "$",
    label: "USD ($) - Dollar",
    flag: "🇺🇸",
    rateAgainstAzn: 1 / 1.70, // 1 USD = 1.70 AZN => 1 AZN = ~0.588 USD
  },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (priceInAzn: number) => string;
  convertPrice: (priceInAzn: number) => number;
  getProductPrice: (product: { price: number; internationalPrice?: number }) => number;
  formatProductPrice: (product: { price: number; internationalPrice?: number }) => string;
  symbol: string;
  isAzerbaijan: boolean;
  detectedCountry: string | null;
  /** true when this buyer pays foreign prices (delivery country, else visitor country) */
  foreignPricing: boolean;
  /** checkout tells the prices which country the order is delivered to (null = visitor country) */
  setDeliveryCountry: (code: string | null) => void;
  /** crossed-out "was" price for a product on sale, already formatted, or "" */
  formatCompareAt: (product: { price: number; compareAtPrice?: number; internationalPrice?: number }) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = "atelier_selected_currency_v1";

export function CurrencyProvider({ children, foreignMarkup = DEFAULT_FOREIGN_MARKUP }: { children: React.ReactNode; foreignMarkup?: number }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("AZN");
  const [detectedCountry, setDetectedCountry] = useState<string | null>("AZ");
  const [isAzerbaijan, setIsAzerbaijan] = useState<boolean>(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [deliveryCountry, setDeliveryCountryState] = useState<string | null>(null);
  const setDeliveryCountry = (code: string | null) => setDeliveryCountryState(code ? code.toUpperCase() : null);
  const foreignPricing = deliveryCountry ? deliveryCountry !== "AZ" : !isAzerbaijan;
  const priceOpts = { foreign: foreignPricing, currency, markupPct: foreignMarkup };

  useEffect(() => {
    let hasUserChoice = false;

    try {
      // 1. Check cookies (set by edge middleware)
      const matchCookie = document.cookie.match(/atelier_selected_currency_v1=([^;]+)/);
      const cookieCurr = matchCookie ? (matchCookie[1].trim() as CurrencyCode) : null;
      if (cookieCurr && CURRENCY_CONFIG[cookieCurr]) {
        setCurrencyState(cookieCurr);
      }

      const matchCountry = document.cookie.match(/horwalle_geo_country=([^;]+)/);
      if (matchCountry) {
        const c = matchCountry[1].trim().toUpperCase();
        setDetectedCountry(c);
        setIsAzerbaijan(c === "AZ");
      }

      // 2. Check localStorage
      const stored = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
      if (stored && CURRENCY_CONFIG[stored]) {
        setCurrencyState(stored);
        hasUserChoice = true;
      }
    } catch {
      // ignore
    }

    // 3. If no explicit user choice, verify with fast geo endpoint
    const detectGeo = async () => {
      try {
        const data = await getGeo();
        if (data) {
          const country = String(data.country || "AZ").toUpperCase();
          const isAz = country === "AZ";
          setDetectedCountry(country);
          setIsAzerbaijan(isAz);

          if (!hasUserChoice) {
            const autoCurrency: CurrencyCode = isAz ? "AZN" : "USD";
            setCurrencyState(autoCurrency);
          }
        }
      } catch {
        // fallback
      } finally {
        setIsHydrated(true);
      }
    };

    detectGeo();
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    if (!CURRENCY_CONFIG[code]) return;
    setCurrencyState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
      document.cookie = `${STORAGE_KEY}=${code}; path=/; max-age=2592000; SameSite=Lax`;
    } catch {
      // ignore
    }
  };

  const convertPrice = (priceInAzn: number): number => {
    const num = Number(priceInAzn) || 0;
    const rate = CURRENCY_CONFIG[currency]?.rateAgainstAzn ?? 1.0;
    return num * rate;
  };

  const formatPrice = (priceInAzn: number): string => {
    const converted = convertPrice(priceInAzn);
    if (currency === "USD") {
      return `$${converted.toFixed(2)}`;
    }
    return `${converted.toFixed(2)} ₼`;
  };

  // Price for this buyer: Azerbaijan price or foreign price (see lib/pricing.ts)
  const getProductPrice = (product: { price: number; internationalPrice?: number }): number => {
    if (!product) return 0;
    return unitPriceFor(product, priceOpts);
  };

  const formatCompareAt = (product: { price: number; compareAtPrice?: number; internationalPrice?: number }): string => {
    const was = product ? compareAtFor(product, priceOpts) : null;
    if (was === null) return "";
    return currency === "USD" ? `$${was.toFixed(2)}` : `${was.toFixed(2)} ₼`;
  };

  const formatProductPrice = (product: { price: number; internationalPrice?: number }): string => {
    if (!product) return currency === "USD" ? "$0.00" : "0.00 ₼";
    const finalAmount = getProductPrice(product);

    if (currency === "USD") {
      return `$${finalAmount.toFixed(2)}`;
    }
    return `${finalAmount.toFixed(2)} ₼`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        convertPrice,
        getProductPrice,
        formatProductPrice,
        symbol: CURRENCY_CONFIG[currency]?.symbol || "₼",
        isAzerbaijan,
        detectedCountry,
        foreignPricing,
        setDeliveryCountry,
        formatCompareAt,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    // Graceful fallback if used outside provider
    return {
      currency: "AZN" as CurrencyCode,
      setCurrency: () => {},
      formatPrice: (p: number) => `${Number(p || 0).toFixed(2)} ₼`,
      convertPrice: (p: number) => Number(p || 0),
      getProductPrice: (p: { price: number; internationalPrice?: number }) => Number(p?.price || 0),
      formatProductPrice: (p: { price: number; internationalPrice?: number }) => `${Number(p?.price || 0).toFixed(2)} ₼`,
      symbol: "₼",
      isAzerbaijan: true,
      detectedCountry: "AZ",
      foreignPricing: false,
      setDeliveryCountry: () => {},
      formatCompareAt: () => "",
    };
  }
  return ctx;
}
