"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type CurrencyCode = "AZN" | "USD" | "EUR";

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
  EUR: {
    code: "EUR",
    symbol: "€",
    label: "EUR (€) - Avro",
    flag: "🇪🇺",
    rateAgainstAzn: 1 / 1.85, // 1 EUR = 1.85 AZN => 1 AZN = ~0.541 EUR
  },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (priceInAzn: number) => string;
  convertPrice: (priceInAzn: number) => number;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = "atelier_selected_currency_v1";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("AZN");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
      if (stored && CURRENCY_CONFIG[stored]) {
        setCurrencyState(stored);
      }
    } catch {
      // ignore
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    if (!CURRENCY_CONFIG[code]) return;
    setCurrencyState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
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
    const info = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.AZN;

    if (currency === "USD") {
      return `$${converted.toFixed(2)}`;
    }
    if (currency === "EUR") {
      return `€${converted.toFixed(2)}`;
    }
    return `${converted.toFixed(2)} ₼`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        convertPrice,
        symbol: CURRENCY_CONFIG[currency]?.symbol || "₼",
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
      symbol: "₼",
    };
  }
  return ctx;
}
