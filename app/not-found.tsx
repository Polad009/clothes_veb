import React from "react";
import Link from "next/link";
import { ArrowLeft, Compass, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#090707] text-white flex items-center justify-center px-4 sm:px-6 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#E6C280]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-xl w-full text-center relative z-10 py-16">
        {/* Luxury Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-widest text-[#E6C280] uppercase mb-6">
          <Sparkles size={14} />
          Horvvalle Atelier
        </div>

        {/* 404 Display */}
        <h1 className="text-8xl sm:text-9xl font-serif font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-stone-200 to-white/10 select-none">
          404
        </h1>

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-4 mb-3">
          Səhifə Tapılmadı
        </h2>

        <p className="text-stone-400 text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-10">
          Axtardığınız səhifə silinmiş, ünvanı dəyişdirilmiş və ya hazırda mövcud deyil. Aşağıdakı keçidlərdən istifadə edərək eksklüziv kolleksiyamıza nəzər yetirə bilərsiniz.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/collections"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#E6C280] text-black font-bold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-lg active:scale-95 inline-flex items-center justify-center gap-2"
          >
            <Compass size={16} />
            Kolleksiyaya Keç
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/5 border border-white/10 text-stone-200 hover:text-white hover:bg-white/10 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Ana Səhifə
          </Link>
        </div>

        {/* Support hint */}
        <div className="mt-12 text-xs text-stone-300">
          Kömək lazımdır?{" "}
          <a
            href="https://wa.me/994557669050"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#E6C280] underline underline-offset-4 hover:text-white transition"
          >
            Atelye Dəstək Xidməti (WhatsApp)
          </a>
        </div>
      </div>
    </div>
  );
}

