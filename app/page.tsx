"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Palette, ShieldCheck, Truck, RotateCcw, Award, CheckCircle2 } from "lucide-react";
import { MOCK_PRODUCTS } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { Hero } from "@/components/Hero";
import { UnwovenLoom } from "@/components/UnwovenLoom";
import storeData from "@/data/storeData.json";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";

export default function Home() {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [activeCategory, setActiveCategory] = useState<"all" | "koynek" | "hudi" | "salvar" | "aksesuar">("all");
  const hero = storeData.content?.hero || {};
  const podBanner = (storeData.content as any)?.podBanner || {};
  const promoBanner = storeData.content?.promoBanner;
  const campaignSecondary = storeData.content?.campaignSecondary;
  const [badgeIndex, setBadgeIndex] = useState(0);

  const [introRevealed, setIntroRevealed] = useState(true);

  const badgeMessages = [
    hero.tag || "HORVVALLE ATELIER · 2026 COUTURE · BAKI",
    "100% XALİS DARANMIŞ PAMBIQ (220-380 GSM)",
    "CANLI 3D DTG ÇAP STUDİYASI — BAKI",
    "60 ₼ VƏ ÜZƏRİ PULSUZ ÇATDIRILMA",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBadgeIndex((prev) => (prev + 1) % badgeMessages.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [badgeMessages.length]);

  const filteredProducts = activeCategory === "all"
    ? MOCK_PRODUCTS
    : MOCK_PRODUCTS.filter(p => p.category === activeCategory);

  const categoryHighlights = [
    {
      id: "koynek",
      num: "01",
      title: "T-Shirt & Köynək",
      desc: "Streetwear & Oxford",
      fabric: "100% Xalis Pambıq · 220-240 GSM",
      image: "/images/products/vintage-king-of-pop-tee/mockup.jpg",
      link: "/collections?category=koynek",
      count: "6 Model",
      tag: "240 GSM COUTURE",
    },
    {
      id: "hudi",
      num: "02",
      title: "Hudi & Sviter",
      desc: "3iplik Qalın & İsti",
      fabric: "Ağır 3iplik Fleece · 380 GSM",
      image: "/images/products/heavyweight-hoodie-black/mockup.jpg",
      link: "/collections?category=hudi",
      count: "4 Model",
      tag: "380 GSM FLEECE",
    },
    {
      id: "salvar",
      num: "03",
      title: "Şalvar & Şortik",
      desc: "Chino & Denim & Kargo",
      fabric: "Pambıq Twill & 12.5 oz İndiqo",
      image: "/images/products/classic-straight-indigo-jeans/mockup.jpg",
      link: "/collections?category=salvar",
      count: "5 Model",
      tag: "DƏQİQ ATELYE KƏSİMİ",
    },
    {
      id: "aksesuar",
      num: "04",
      title: "Aksesuarlar",
      desc: "Kepkalar & Eko Çantalar",
      fabric: "Qalın Twill & Təbii Kətan",
      image: "/images/products/snapback-cap-heavy/mockup.jpg",
      link: "/collections?category=aksesuar",
      count: "2 Model",
      tag: "3D ÇAP STUDİYASI",
    },
  ];


  return (
    <div className="w-full flex flex-col text-[#1A1517] overflow-x-clip -mt-[112px] sm:-mt-[120px] bg-[#FAF7F2]">
      {/* =========================================================================
          1. FULL-VIEWPORT HALLY REFERENCE HERO WITH INTEGRATED NAVBAR & SLIDER
          ========================================================================= */}
      <Hero />

      {/* =========================================================================
          2. HORVVALLE KINETIC RUNWAY (Flowing Curated Visuals)
          ========================================================================= */}
      <section className="relative w-full py-8 sm:py-12 overflow-hidden bg-[#FAF7F2] border-b border-stone-200/80">
        {/* Edge Gradient Fades for Infinite Horizon Look */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-44 bg-gradient-to-r from-[#FAF7F2] via-[#FAF7F2]/85 to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-44 bg-gradient-to-l from-[#FAF7F2] via-[#FAF7F2]/85 to-transparent z-20" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-stone-500">
            CANLI ATELYE VİTRİNİ
          </span>
          <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-stone-900 font-editorial mt-0.5">
            HORVVALLE SEÇİLMİŞ MODELLƏR
          </h2>
        </div>

        <UnwovenLoom />
      </section>

      {/* Remaining sections wrapped with spacing and light luxury background */}
      <div className="bg-[#FAF7F2] space-y-14 sm:space-y-20 pt-10 sm:pt-14 pb-20 sm:pb-28">
        {/* 2. REFINED ATELIER DEPARTMENTS / 4 ƏSAS İSTİQAMƏT */}
        <section data-cms-section="categories" data-cms-title="4 Əsas Kolleksiya Bölməsi" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-5 border-b border-stone-200/80">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200/80 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-600 mb-2">
                <span>HORVVALLE ATELIER</span>
                <span className="w-1 h-1 rounded-full bg-stone-400" />
                <span>KOLLEKSİYA STRUKTURU</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal uppercase tracking-tight text-stone-900 font-serif-luxury">
                DÖRD ƏSAS DƏRZİLİK İSTİQAMƏTİ
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md leading-relaxed">
              Xalis daranmış sıx pambıq, isti 3iplik fleece və dəqiq kəsimli şalvarlar. İstənilən bölməni seçərək modelləri kəşf edin.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {categoryHighlights.map((cat) => (
              <div
                key={cat.id}
                className="group relative flex flex-col justify-between bg-white border border-stone-200/90 hover:border-stone-900/80 rounded-3xl p-5 transition-all duration-400 hover:shadow-[0_20px_45px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-1.5"
              >
                {/* Top Header inside Card */}
                <div>
                  <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-stone-100 text-xs">
                    <span className="font-mono font-semibold text-stone-400 tracking-wider">
                      {cat.num}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-stone-200/70 text-[10px] font-bold uppercase tracking-wider text-stone-700">
                      {cat.tag}
                    </span>
                  </div>

                  {/* Clean Framed Visual with Model */}
                  <Link
                    href={cat.link}
                    prefetch={true}
                    className="block relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 my-4 cursor-pointer"
                  >
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-108"
                    />
                    <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors" />
                    <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-stone-200/80 text-[10px] font-semibold text-stone-800 shadow-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Bax</span>
                      <ArrowRight size={11} />
                    </div>
                  </Link>

                  {/* Typography & Details */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 block">
                      {cat.desc}
                    </span>
                    <h3 className="text-xl font-normal uppercase tracking-tight text-stone-900 font-serif-luxury group-hover:text-amber-900 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-1 pt-0.5">
                      {cat.fabric}
                    </p>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-400 font-medium">
                    {cat.count}
                  </span>
                  <Link
                    href={cat.link}
                    prefetch={true}
                    className="inline-flex items-center gap-1.5 font-semibold text-stone-900 group-hover:text-amber-800 transition-colors uppercase tracking-wider text-[11px]"
                  >
                    <span>Kolleksiyaya Keç</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

      {/* 3. TRENDING PRODUCT GRID WITH CATEGORY TABS */}
      <section data-cms-section="products" data-cms-title="Seçilmiş Məhsullar Bölməsi" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Section Header & Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-stone-200/80">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500 block mb-1">
              SEÇİLMİŞ MODELLƏR
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal uppercase tracking-tight text-stone-900 font-serif-luxury">
              QARDEROBUNUZUN TƏMƏLİ
            </h2>
          </div>

          {/* Animated Filter Pills with Smooth Sliding Indicator */}
          <div className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-full bg-stone-100/90 border border-stone-200/80 shadow-2xs overflow-x-auto max-w-full">
            {[
              { id: "all", label: "Bütün Modellər" },
              { id: "koynek", label: "T-Shirt & Köynək" },
              { id: "hudi", label: "Hudi & Sviter" },
              { id: "salvar", label: "Şalvar & Şortik" },
              { id: "aksesuar", label: "Aksesuarlar" },
            ].map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id as any)}
                  className={`relative px-4 sm:px-5 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-colors shrink-0 cursor-pointer select-none active:scale-95 ${
                    isActive
                      ? "text-white font-semibold"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeHomeCategoryPill"
                      className="absolute inset-0 bg-stone-900 rounded-full shadow-sm z-0"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid with Smooth Staggered Animation */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <ProductCard product={product} variant="light" />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <div className="mt-12 text-center">
          <Link
            href="/collections"
            prefetch={true}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-stone-900 hover:bg-black text-white font-medium text-xs uppercase tracking-wider transition-all shadow-md group"
          >
            <span>Bütün Kolleksiyanı Gör ({MOCK_PRODUCTS.length} Məhsul)</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* 4. PRINT ON DEMAND (POD) SPOTLIGHT BANNER */}
      <section data-cms-section="podBanner" data-cms-title="3D Fərdi Çap Banneri" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative rounded-3xl overflow-hidden border border-stone-200/80 bg-gradient-to-br from-white via-[#FAF7F2] to-[#F5EFE6] p-8 sm:p-12 lg:p-16 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.06)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-800 text-xs font-medium uppercase tracking-wider">
                <Palette size={14} className="text-stone-700" />
                <span>{podBanner.tag || "3D CANLI DİZAYN ATELYESİ"}</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-normal uppercase tracking-tight text-stone-900 font-serif-luxury leading-[1.05]">
                {podBanner.title || "ÖZ ŞƏKLİNİ VƏ YA DİZAYNINI KÖYNƏYƏ ÇAP ET"}
              </h2>

              <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-xl">
                {podBanner.description || "Sevdiyiniz şəkli, loqonu və ya mətni göndərin — biz 100% yüksək keyfiyyətli pambıq köynək üzərində canlı DTG texnologiyası ilə çap edib ünvanınıza çatdıraq. Yuyulduqda çatlamır, rəngini itirmir."}
              </p>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
                  <div className="text-xs font-bold text-stone-900 uppercase">100% Pambıq</div>
                  <div className="text-[11px] text-stone-500 mt-0.5">220 GSM sıx toxunuş</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
                  <div className="text-xs font-bold text-stone-900 uppercase">Ultra HD Çap</div>
                  <div className="text-[11px] text-stone-500 mt-0.5">Davamlı və parlaq</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
                  <div className="text-xs font-bold text-stone-900 uppercase">1-2 İş Günü</div>
                  <div className="text-[11px] text-stone-500 mt-0.5">Sürətli çatdırılma</div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={podBanner.ctaLink || "/studio"}
                  prefetch={true}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-stone-900 hover:bg-black text-white font-medium text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
                >
                  <Palette size={16} className="text-stone-300" />
                  <span>{podBanner.ctaText || "Dizayn Studiyasına Keç"}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Right Visual Demo Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-square max-w-md mx-auto rounded-3xl overflow-hidden border border-stone-200/80 bg-white shadow-apple p-6 flex items-center justify-center">
                <img
                  src={podBanner.image || "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"}
                  alt="Custom Print Cotton Tee"
                  className="w-full h-full object-contain"
                />

                {/* Simulated Custom Print Overlay */}
                <div className="absolute inset-x-16 top-24 bottom-24 border-2 border-dashed border-stone-400 rounded-2xl flex flex-col items-center justify-center p-4 bg-stone-100/70 backdrop-blur-[1px]">
                  <span className="text-2xl font-serif-luxury font-normal text-stone-900 tracking-wider">
                    SƏNİN DİZAYNIN
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-stone-600 font-bold mt-1">
                    [ ÇAP SAHƏSİ ]
                  </span>
                </div>

                <div className="absolute bottom-4 inset-x-4 p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200 flex items-center justify-between text-xs text-stone-900 shadow-sm">
                  <span className="font-semibold text-stone-900">100% Pambıq Baza T-Shirt</span>
                  <span className="text-stone-900 font-bold font-serif-luxury text-sm">45.00 ₼</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DUAL CAMPAIGN BANNERS (Şalvarlar & Corablar) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Banner 1: Chino & Cins Şalvarlar */}
          <div data-cms-section="promoBanner" data-cms-title="Şalvar Kolleksiyası Banneri" className="relative aspect-[4/5] sm:aspect-[16/11] rounded-3xl overflow-hidden border border-stone-200/80 group bg-white shadow-2xs">
            <img
              src={promoBanner?.image || "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1200&auto=format&fit=crop"}
              alt="Şalvar Kolleksiyası"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white">
              <span className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                {promoBanner?.tag || "PREMIUM KƏSİMLƏR"}
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif-luxury font-normal uppercase mt-1">
                {promoBanner?.title || "HƏR GÜN ÜÇÜN İDEAL ŞALVARLAR"}
              </h3>
              <p className="text-xs text-stone-200 mt-1.5 max-w-sm line-clamp-2">
                {promoBanner?.subtitle}
              </p>
              <div className="pt-4">
                <Link
                  href={promoBanner?.ctaLink || "/collections?category=salvar"}
                  prefetch={true}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-stone-900 font-medium text-xs uppercase tracking-wider hover:bg-stone-100 transition shadow-sm"
                >
                  <span>{promoBanner?.ctaText || "Şalvarlara Bax"}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* Banner 2: Premium 3iplik Hudi Kolleksiyası */}
          <div data-cms-section="campaignSecondary" data-cms-title="Hudi Kolleksiyası Banneri" className="relative aspect-[4/5] sm:aspect-[16/11] rounded-3xl overflow-hidden border border-stone-200/80 group bg-white shadow-2xs">
            <img
              src={campaignSecondary?.image || "/images/products/heavyweight-hoodie-black/mockup.jpg"}
              alt="Hudi Kolleksiyası"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white">
              <span className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                {campaignSecondary?.tag || "PREMIUM 3İPLİK"}
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif-luxury font-normal uppercase mt-1">
                {campaignSecondary?.title || "İSTİ VƏ RAHAT OVERSIZED HUDİ"}
              </h3>
              <p className="text-xs text-stone-200 mt-1.5 max-w-sm line-clamp-2">
                {campaignSecondary?.subtitle || "Qalın 380 GSM pambıq toxunuşu, isti astar və canlı DTF çap keyfiyyəti."}
              </p>
              <div className="pt-4">
                <Link
                  href={campaignSecondary?.ctaLink || "/collections?category=hudi"}
                  prefetch={true}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-stone-900 font-medium text-xs uppercase tracking-wider hover:bg-stone-100 transition shadow-sm"
                >
                  <span>{campaignSecondary?.ctaText || "Hudilərə Bax"}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}
