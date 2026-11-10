"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    setMounted(true);
    try {
      const consent = localStorage.getItem("horvvalle_cookie_consent");
      if (!consent) {
        // Small delay so it doesn't pop up abruptly on initial load
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore localStorage block
    }
  }, []);

  const handleAccept = (type: "all" | "essential") => {
    try {
      localStorage.setItem("horvvalle_cookie_consent", type);
    } catch {
      // ignore
    }
    setIsVisible(false);
  };

  if (!mounted || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.aside
        aria-label="Cookie Bildirişi"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 pointer-events-auto"
      >
        <div className="border border-white/15 bg-ink-850/95 p-5 font-grotesk text-bone shadow-[0_24px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-bone">
              <Cookie size={20} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h2 className="flex items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-[0.16em] text-bone">
                  <span>{language === "en" ? "Cookie Preferences" : language === "ru" ? "Использование файлов cookie" : language === "tr" ? "Cookie Tercihleri" : "Cookie Bildirişi"}</span>
                </h2>
                <button
                  type="button"
                  onClick={() => handleAccept("essential")}
                  className="p-1 text-bone-faint transition hover:text-bone"
                  aria-label="Bağla"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="mb-4 text-[13px] leading-relaxed text-bone-dim">
                {language === "en"
                  ? "We use cookies to personalize your shopping experience, save your cart, and analyze site performance."
                  : language === "ru"
                  ? "Мы используем файлы cookie для персонализации вашего опыта, сохранения корзины и анализа работы сайта."
                  : language === "tr"
                  ? "Alışveriş deneyiminizi kişiselleştirmek, sepetinizi kaydetmek ve site performansını analiz etmek için cookie'ler kullanıyoruz."
                  : "Saytımızda sizə ən yaxşı alış-veriş təcrübəsini təqdim etmək, səbətinizi qorumaq və analitika üçün cookie-lərdən istifadə edirik."}
                {" "}
                <Link href="/privacy" className="text-bone underline underline-offset-4">
                  {language === "en" ? "Privacy Policy" : language === "ru" ? "Подробнее" : language === "tr" ? "Detaylar" : "Ətraflı məlumat"}
                </Link>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAccept("all")}
                  className="flex-1 rounded-full bg-bone px-4 py-2.5 text-center text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink transition hover:bg-white active:scale-95"
                >
                  {language === "en" ? "Accept All" : language === "ru" ? "Принять все" : language === "tr" ? "Hepsini Kabul Et" : "Qəbul Et"}
                </button>
                <button
                  type="button"
                  onClick={() => handleAccept("essential")}
                  className="rounded-full border border-white/25 px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-bone transition hover:border-bone active:scale-95"
                >
                  {language === "en" ? "Essential Only" : language === "ru" ? "Только необходимые" : language === "tr" ? "Sadece Gerekli" : "Yalnız Zəruri"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

