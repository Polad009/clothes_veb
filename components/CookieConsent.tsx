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
        aria-label="Çərəz Bildirişi"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 pointer-events-auto"
      >
        <div className="bg-[#141212]/95 backdrop-blur-xl border border-[#E6C280]/30 rounded-2xl p-5 shadow-2xl shadow-black/80 text-stone-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6C280]/15 text-[#E6C280] flex items-center justify-center shrink-0 border border-[#E6C280]/20">
              <Cookie size={20} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-serif font-bold text-white flex items-center gap-1.5">
                  <span>{language === "en" ? "Cookie Preferences" : language === "ru" ? "Использование файлов cookie" : language === "tr" ? "Çerez Tercihleri" : "Çərəz Bildirişi"}</span>
                  <ShieldCheck size={14} className="text-[#E6C280]" />
                </h2>
                <button
                  type="button"
                  onClick={() => handleAccept("essential")}
                  className="text-stone-400 hover:text-white p-1 rounded-lg transition"
                  aria-label="Bağla"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed mb-4">
                {language === "en"
                  ? "We use cookies to personalize your atelier experience, save your cart, and analyze site performance."
                  : language === "ru"
                  ? "Мы используем файлы cookie для персонализации вашего опыта, сохранения корзины и анализа работы сайта."
                  : language === "tr"
                  ? "Atölye deneyiminizi kişiselleştirmek, sepetinizi kaydetmek ve site performansını analiz etmek için çerezler kullanıyoruz."
                  : "Saytımızda sizə ən yaxşı atelye təcrübəsini təqdim etmək, səbətinizi qorumaq və analitika üçün çərəzlərdən istifadə edirik."}
                {" "}
                <Link href="/privacy" className="text-[#E6C280] hover:underline">
                  {language === "en" ? "Privacy Policy" : language === "ru" ? "Подробнее" : language === "tr" ? "Detaylar" : "Ətraflı məlumat"}
                </Link>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAccept("all")}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#E6C280] text-black font-bold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-md active:scale-95 text-center"
                >
                  {language === "en" ? "Accept All" : language === "ru" ? "Принять все" : language === "tr" ? "Hepsini Kabul Et" : "Qəbul Et"}
                </button>
                <button
                  type="button"
                  onClick={() => handleAccept("essential")}
                  className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-stone-300 hover:text-white hover:bg-white/10 font-medium text-xs tracking-wider transition-all active:scale-95 text-center"
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

