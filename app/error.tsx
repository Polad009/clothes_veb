"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { tr } from "@/components/store/i18n";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { language } = useLanguage();
  useEffect(() => {
    console.error("Horwalle store error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center bg-ink px-4 text-center font-grotesk text-bone">
      <h1 className="text-4xl font-black uppercase tracking-tight [font-stretch:112%] sm:text-6xl">{tr(language, { az: "Xəta baş verdi", en: "Something went wrong", ru: "Произошла ошибка", tr: "Bir hata oluştu" })}</h1>
      <p className="mt-4 max-w-md text-[14px] text-bone-dim">
        {tr(language, { az: "Səhifə yüklənmədi. Yenidən cəhd edin, problem qalsa bizə WhatsApp-da yazın.", en: "The page did not load. Try again; if it keeps happening, message us on WhatsApp.", ru: "Страница не загрузилась. Попробуйте ещё раз; если не поможет, напишите нам в WhatsApp.", tr: "Sayfa yüklenemedi. Tekrar deneyin; sorun sürerse bize WhatsApp'tan yazın." })}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-bone px-7 py-3.5 text-[12px] font-extrabold uppercase tracking-[0.16em] text-ink hover:bg-white"
        >
          {tr(language, { az: "Yenidən cəhd et", en: "Try again", ru: "Повторить", tr: "Tekrar dene" })}
        </button>
        <Link href="/" className="rounded-full border border-white/25 px-7 py-3.5 text-[12px] font-extrabold uppercase tracking-[0.16em] hover:border-bone">
          {tr(language, { az: "Ana səhifə", en: "Home", ru: "Главная", tr: "Ana sayfa" })}
        </Link>
      </div>
    </div>
  );
}
