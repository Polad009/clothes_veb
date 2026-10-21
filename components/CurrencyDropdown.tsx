"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

// Crisp Authentic Vector Flag Components (Bypasses Windows emoji limitation)
export function FlagAzerbaijan({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 40"
      className={`inline-block shrink-0 rounded-[3px] shadow-2xs border border-black/15 overflow-hidden ${className}`}
      aria-label="Azərbaycan Bayrağı"
    >
      {/* Blue Top Stripe */}
      <rect width="60" height="13.33" fill="#0092bc" />
      {/* Red Middle Stripe */}
      <rect y="13.33" width="60" height="13.34" fill="#e4002b" />
      {/* Green Bottom Stripe */}
      <rect y="26.67" width="60" height="13.33" fill="#009a44" />
      {/* Crescent */}
      <circle cx="28" cy="20" r="5" fill="#ffffff" />
      <circle cx="29.3" cy="20" r="4.1" fill="#e4002b" />
      {/* 8-pointed star */}
      <g transform="translate(34, 20) scale(2.2)">
        <polygon
          points="0,-1 0.28,-0.28 1,0 0.28,0.28 0,1 -0.28,0.28 -1,0 -0.28,-0.28"
          fill="#ffffff"
        />
        <polygon
          points="0,-1 0.28,-0.28 1,0 0.28,0.28 0,1 -0.28,0.28 -1,0 -0.28,-0.28"
          fill="#ffffff"
          transform="rotate(45)"
        />
      </g>
    </svg>
  );
}

export function FlagUSA({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 40"
      className={`inline-block shrink-0 rounded-[3px] shadow-2xs border border-black/15 overflow-hidden ${className}`}
      aria-label="ABŞ Bayrağı"
    >
      {/* 13 Stripes */}
      <rect width="60" height="40" fill="#b22234" />
      <rect y="3.08" width="60" height="3.08" fill="#ffffff" />
      <rect y="9.23" width="60" height="3.08" fill="#ffffff" />
      <rect y="15.38" width="60" height="3.08" fill="#ffffff" />
      <rect y="21.54" width="60" height="3.08" fill="#ffffff" />
      <rect y="27.69" width="60" height="3.08" fill="#ffffff" />
      <rect y="33.85" width="60" height="3.08" fill="#ffffff" />
      {/* Blue Canton */}
      <rect width="26" height="21.54" fill="#3c3b6e" />
      {/* Stars Grid */}
      <circle cx="5" cy="4" r="0.9" fill="#ffffff" />
      <circle cx="11" cy="4" r="0.9" fill="#ffffff" />
      <circle cx="17" cy="4" r="0.9" fill="#ffffff" />
      <circle cx="23" cy="4" r="0.9" fill="#ffffff" />
      <circle cx="8" cy="7.5" r="0.9" fill="#ffffff" />
      <circle cx="14" cy="7.5" r="0.9" fill="#ffffff" />
      <circle cx="20" cy="7.5" r="0.9" fill="#ffffff" />
      <circle cx="5" cy="11" r="0.9" fill="#ffffff" />
      <circle cx="11" cy="11" r="0.9" fill="#ffffff" />
      <circle cx="17" cy="11" r="0.9" fill="#ffffff" />
      <circle cx="23" cy="11" r="0.9" fill="#ffffff" />
      <circle cx="8" cy="14.5" r="0.9" fill="#ffffff" />
      <circle cx="14" cy="14.5" r="0.9" fill="#ffffff" />
      <circle cx="20" cy="14.5" r="0.9" fill="#ffffff" />
      <circle cx="5" cy="18" r="0.9" fill="#ffffff" />
      <circle cx="11" cy="18" r="0.9" fill="#ffffff" />
      <circle cx="17" cy="18" r="0.9" fill="#ffffff" />
      <circle cx="23" cy="18" r="0.9" fill="#ffffff" />
    </svg>
  );
}

export function FlagEU({ className = "w-5 h-3.5" }: { className?: string }) {
  const radius = 9;
  const cx = 30;
  const cy = 20;
  const stars = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 * Math.PI) / 180;
    return {
      x: cx + radius * Math.sin(angle),
      y: cy - radius * Math.cos(angle),
    };
  });

  return (
    <svg
      viewBox="0 0 60 40"
      className={`inline-block shrink-0 rounded-[3px] shadow-2xs border border-black/15 overflow-hidden ${className}`}
      aria-label="Avropa İttifaqı Bayrağı"
    >
      <rect width="60" height="40" fill="#003399" />
      {stars.map((pos, idx) => (
        <circle key={idx} cx={pos.x} cy={pos.y} r="1.15" fill="#ffcc00" />
      ))}
    </svg>
  );
}

export interface CurrencyOption {
  code: string;
  symbol: string;
  label: string;
  countryName: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: "AZN", symbol: "₼", label: "Manat", countryName: "Azərbaycan" },
  { code: "USD", symbol: "$", label: "Dollar", countryName: "ABŞ" },
  { code: "EUR", symbol: "€", label: "Avro", countryName: "Avropa" },
];

export function renderCurrencyFlag(code: string, className = "w-5 h-3.5") {
  switch (code) {
    case "AZN":
      return <FlagAzerbaijan className={className} />;
    case "USD":
      return <FlagUSA className={className} />;
    case "EUR":
      return <FlagEU className={className} />;
    default:
      return <FlagAzerbaijan className={className} />;
  }
}

interface CurrencyDropdownProps {
  value?: string;
  onChange?: (code: string) => void;
  direction?: "down" | "up";
  className?: string;
}

export function CurrencyDropdown({
  value = "AZN",
  onChange,
  direction = "down",
  className = "",
}: CurrencyDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(value);
  }, [value]);

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

  const currentOption = CURRENCIES.find((c) => c.code === selected) || CURRENCIES[0];

  const handleSelect = (code: string) => {
    setSelected(code);
    onChange?.(code);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button with Real SVG Flag Image */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200/90 text-xs font-semibold text-zinc-800 transition-all active:scale-95 shadow-2xs hover:border-zinc-300"
        aria-expanded={isOpen}
      >
        <span className="flex items-center">{renderCurrencyFlag(currentOption.code, "w-5 h-3.5")}</span>
        <span className="font-bold tracking-tight">{currentOption.code}</span>
        <span className="text-zinc-500 text-[11px] font-semibold">({currentOption.symbol})</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="text-zinc-500 group-hover:text-zinc-900"
        >
          <ChevronDown size={14} />
        </motion.div>
      </button>

      {/* Animated Dropdown Menu with Flag Images */}
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
            className={`absolute z-50 min-w-[200px] rounded-2xl bg-white/95 backdrop-blur-md p-1.5 shadow-apple border border-zinc-200/80 ${
              direction === "down"
                ? "top-full mt-1.5 right-0 sm:right-auto sm:left-0"
                : "bottom-full mb-1.5 right-0 sm:right-auto sm:left-0"
            }`}
          >
            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Valyuta Seçimi
            </div>
            <div className="space-y-0.5">
              {CURRENCIES.map((curr) => {
                const isCurrent = curr.code === selected;
                return (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => handleSelect(curr.code)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      isCurrent
                        ? "bg-zinc-900 text-white font-bold shadow-2xs"
                        : "text-zinc-700 hover:bg-zinc-100 hover:text-black"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center">{renderCurrencyFlag(curr.code, "w-5 h-3.5")}</span>
                      <div className="flex flex-col text-left">
                        <span className="font-bold leading-none">{curr.code}</span>
                        <span className={`text-[10px] leading-tight mt-0.5 ${isCurrent ? "text-zinc-300" : "text-zinc-500"}`}>
                          {curr.countryName} · {curr.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`font-mono text-xs font-bold ${isCurrent ? "text-white" : "text-zinc-400"}`}>
                        {curr.symbol}
                      </span>
                      {isCurrent && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                          <Check size={14} className="text-white" />
                        </motion.div>
                      )}
                    </div>
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
