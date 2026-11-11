"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";

const LANGS: Array<{ code: "az" | "en" | "ru" | "tr"; name: string }> = [
  { code: "az", name: "Azərbaycanca" },
  { code: "en", name: "English" },
  { code: "ru", name: "Русский" },
  { code: "tr", name: "Türkçe" },
];
const CURRENCIES: Array<{ code: "AZN" | "USD"; name: string }> = [
  { code: "AZN", name: "₼ AZN" },
  { code: "USD", name: "$ USD" },
];

/** Language and currency picker in the dark store style. */
export function StoreLocale({ direction = "down", align = "right" }: { direction?: "up" | "down"; align?: "left" | "right" }) {
  const { language, setLanguage } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const row = (active: boolean) =>
    `flex w-full items-center justify-between px-3 py-2 text-left text-[13px] transition ${active ? "text-bone" : "text-bone-dim hover:bg-white/5 hover:text-bone"}`;

  return (
    <div ref={ref} className="relative font-grotesk">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={`${language} / ${currency} — dil və valyuta`}
        className="flex h-9 items-center gap-1.5 rounded-full border border-white/20 px-3.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-bone transition hover:border-bone"
      >
        <span>{language}</span>
        <span className="text-bone-faint">/</span>
        <span>{currency}</span>
        <ChevronDown size={13} className={`text-bone-dim transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className={`absolute z-[80] w-52 overflow-hidden border border-white/15 bg-ink-800 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.6)] ${
            direction === "up" ? "bottom-full mb-2" : "top-full mt-2"
          } ${align === "right" ? "right-0" : "left-0"}`}
        >
          <p className="px-3 pb-1 pt-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-bone-faint">Dil · Language</p>
          {LANGS.map((l) => (
            <button key={l.code} type="button" className={row(language === l.code)} onClick={() => { setLanguage(l.code); setOpen(false); }}>
              {l.name}
              {language === l.code && <Check size={14} />}
            </button>
          ))}
          <div className="my-2 border-t border-white/10" />
          <p className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-bone-faint">Valyuta · Currency</p>
          {CURRENCIES.map((c) => (
            <button key={c.code} type="button" className={row(currency === c.code)} onClick={() => { setCurrency(c.code); setOpen(false); }}>
              {c.name}
              {currency === c.code && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
