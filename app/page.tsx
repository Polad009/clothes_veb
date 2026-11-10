"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Palette, ShieldCheck, Truck, RotateCcw, Award, CheckCircle2 } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ProductCard } from "@/components/ProductCard";
import { Hero } from "@/components/Hero";
import { FAQSection } from "@/components/FAQSection";

const UnwovenLoom = dynamic(
  () => import("@/components/UnwovenLoom").then((mod) => mod.UnwovenLoom),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-80 flex items-center justify-center bg-[#FAF7F2]">
        <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-stone-800 animate-spin" />
      </div>
    ),
  }
);
import { useLanguage } from "@/context/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useCategories, useStoreData } from "@/context/StoreDataContext";
import { categoryTitle } from "@/lib/categories";

export default function Home() {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const categories = useCategories();
  const { products, content } = useStoreData();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const hero = content?.hero || {};
  const podBanner = content?.podBanner || {};
  const promoBanner = content?.promoBanner;
  const campaignSecondary = content?.campaignSecondary;
  const [badgeIndex, setBadgeIndex] = useState(0);

  const [introRevealed, setIntroRevealed] = useState(true);

  const { language } = useLanguage();
  // Banner texts: Azerbaijani comes from the admin; other languages use the admin's
  // translation when one is saved, otherwise the built-in text.
  const i18n = ((content as any)?.i18n || {}) as Record<string, any>;
  const bt = (section: string, field: string, builtIn: Record<string, string>, az: string) =>
    language === "az" ? az : (i18n?.[language]?.[section]?.[field] || builtIn[language] || az);
  const badgeMessages = [
    (language !== "az" && i18n?.[language]?.hero?.tag) || hero.tag || "HORVVALLE · 2026 KOLLEKSİYA · BAKI",
    language === "en" ? "100% PURE COMBED COTTON (220-380 GSM)" : language === "ru" ? "100% ЧИСТЫЙ ГРЕБЕННОЙ ХЛОПОК (220-380 GSM)" : language === "tr" ? "%100 SAF TARANMIŞ PAMUK (220-380 GSM)" : "100% XALİS DARANMIŞ PAMBIQ (220-380 GSM)",
    language === "en" ? "PREMIUM APPAREL & 3D DESIGN STUDIO — BAKU" : language === "ru" ? "ПРЕМИУМ ОДЕЖДА И 3D СТУДИЯ ДИЗАЙНА — БАКУ" : language === "tr" ? "PREMİUM GİYİM & 3D TASARIM STÜDYOSU — BAKÜ" : "PREMİUM GEYİM & 3D DİZAYN STUDİYASI — BAKI",
    language === "en" ? "FREE DELIVERY TO BAKU & SUMGAYIT" : language === "ru" ? "БЕСПЛАТНАЯ ДОСТАВКА В БАКУ И СУМГАИТ" : language === "tr" ? "BAKÜ VE SUMGAYIT'A ÜCRETSİZ TESLİMAT" : "BAKI VƏ SUMQAYIT ƏRAZİSİNƏ PULSUZ ÇATDIRILMA",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBadgeIndex((prev) => (prev + 1) % badgeMessages.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [badgeMessages.length]);

  const filteredProducts = (
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory)
  ).slice(0, 12);




  return (
    <div className="w-full flex flex-col text-[#1A1517] overflow-x-clip bg-[#FAF7F2]">
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
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-stone-600">
            {t.home.atelierShowcase || "CANLI VİTRİN"}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-stone-900 font-editorial mt-0.5">
            {t.home.selectedShowcase || "HORVVALLE SEÇİLMİŞ MODELLƏR"}
          </h2>
        </div>

        <UnwovenLoom />
      </section>

      {/* Remaining sections wrapped with spacing and light luxury background */}
      <div className="bg-[#FAF7F2] space-y-14 sm:space-y-20 pt-10 sm:pt-14 pb-20 sm:pb-28">
      {/* 3. TRENDING PRODUCT GRID WITH CATEGORY TABS */}
      <section data-cms-section="products" data-cms-title="Seçilmiş Məhsullar Bölməsi" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Section Header & Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-stone-200/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200/80 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-600 mb-2">
              <span>HORVVALLE</span>
              <span className="w-1 h-1 rounded-full bg-stone-400" />
              <span>COUTURE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal uppercase tracking-tight text-stone-900 font-serif-luxury">
              {t.home.selectedModels || "SEÇİLMİŞ MODELLƏR"}
            </h2>
          </div>

          {/* Animated Filter Pills with Smooth Sliding Indicator */}
          <div className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-full bg-stone-100/90 border border-stone-200/80 shadow-2xs overflow-x-auto max-w-full">
            {[
              { id: "all", label: t.home.allModels || "Bütün Modellər" },
              // only categories that have something to show
              ...categories
                .filter((c) => products.some((p) => p.category === c.id))
                .map((c) => ({ id: c.id, label: categoryTitle(c, language) })),
            ].map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
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
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <ProductCard product={product} variant="light" priority={idx < 4} />
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
            <span>{language === "en" ? `View Full Collection (${products.length} Items)` : language === "ru" ? `Посмотреть всю коллекцию (${products.length} Тов.)` : language === "tr" ? `Tüm Koleksiyonu Gör (${products.length} Ürün)` : `Bütün Kolleksiyanı Gör (${products.length} Məhsul)`}</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* 4. PRINT ON DEMAND (POD) SPOTLIGHT BANNER */}
      <section data-cms-section="podBanner" data-cms-title="Dizayn Studiyası Banneri" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative rounded-3xl overflow-hidden border border-stone-200/80 bg-gradient-to-br from-white via-[#FAF7F2] to-[#F5EFE6] p-8 sm:p-12 lg:p-16 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.06)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-800 text-xs font-medium uppercase tracking-wider">
                <Palette size={14} className="text-stone-700" />
                <span>{bt("podBanner", "tag", { en: "3D CUSTOM DESIGN STUDIO", ru: "3D СТУДИЯ ДИЗАЙНА", tr: "3D TASARIM STÜDYOSU" }, podBanner.tag || "3D DİZAYN STUDİYASI")}</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-normal uppercase tracking-tight text-stone-900 font-serif-luxury leading-[1.05]">
                {bt("podBanner", "title", { en: "CREATE YOUR OWN DESIGN WITH HORVVALLE QUALITY", ru: "СОЗДАЙТЕ СВОЙ ДИЗАЙН В КАЧЕСТВЕ HORVVALLE", tr: "KENDİ TASARIMINI HORVVALLE KALİTESİYLE YARAT" }, podBanner?.title || "ÖZ DİZAYNINI HORVVALLE KEYFİYYƏTİ İLƏ YARAT")}
              </h2>

              <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-xl">
                {bt("podBanner", "description", { en: "Send your favorite image, logo, or artwork — Horvvalle puts it on a 100% premium cotton garment and delivers it to your doorstep.", ru: "Отправьте любимое изображение или логотип — Horvvalle перенесёт его на одежду из 100% премиум-хлопка и доставит вам.", tr: "Favori görselinizi, logonuzu veya özel çiziminizi gönderin — Horvvalle onu %100 birinci sınıf pamuklu giysiye aktarıp adresinize teslim etsin." }, podBanner?.description || "Sevdiyiniz şəkli, loqonu və ya eksklüziv rəsmi göndərin — Horvvalle onu 100% yüksək keyfiyyətli premium pambıq geyimə köçürüb ünvanınıza çatdırsın.")}
              </p>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
                  <div className="text-xs font-bold text-stone-900 uppercase">{language === "en" ? "100% Cotton" : language === "ru" ? "100% Хлопок" : language === "tr" ? "%100 Pamuk" : "100% Pambıq"}</div>
                  <div className="text-[11px] text-stone-600 mt-0.5">{language === "en" ? "220 GSM Dense Weave" : language === "ru" ? "220 GSM Плотное плетение" : language === "tr" ? "220 GSM Sıkı Doku" : "220 GSM sıx toxunuş"}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
                  <div className="text-xs font-bold text-stone-900 uppercase">{language === "en" ? "Ultra HD Quality" : language === "ru" ? "Ultra HD Качество" : language === "tr" ? "Ultra HD Kalite" : "Ultra HD Keyfiyyət"}</div>
                  <div className="text-[11px] text-stone-600 mt-0.5">{language === "en" ? "Durable & Vibrant" : language === "ru" ? "Стойкая и яркая" : language === "tr" ? "Dayanıklı ve parlak" : "Davamlı və parlaq"}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
                  <div className="text-xs font-bold text-stone-900 uppercase">{language === "en" ? "1-2 Business Days" : language === "ru" ? "1-2 Рабочих дня" : language === "tr" ? "1-2 İş Günü" : "1-2 İş Günü"}</div>
                  <div className="text-[11px] text-stone-600 mt-0.5">{language === "en" ? "Express delivery" : language === "ru" ? "Быстрая доставка" : language === "tr" ? "Hızlı teslimat" : "Sürətli çatdırılma"}</div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={podBanner.ctaLink || "/studio"}
                  prefetch={true}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-stone-900 hover:bg-black text-white font-medium text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
                >
                  <Palette size={16} className="text-stone-300" />
                  <span>{bt("podBanner", "ctaText", { en: "Go to Design Studio", ru: "В студию дизайна", tr: "Tasarım Stüdyosuna Geç" }, podBanner?.ctaText || "Dizayn Studiyasına Keç")}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Right Visual Demo Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-square max-w-md mx-auto rounded-3xl overflow-hidden border border-stone-200/80 bg-white shadow-apple p-6 flex items-center justify-center">
                <Image
                  src={podBanner.image || "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"}
                  alt="Custom Design Cotton Tee"
                  fill
                  sizes="(max-width: 1024px) 100vw, 450px"
                  className="object-contain p-6"
                  loading="lazy"
                />

                {/* Simulated Custom Print Overlay */}
                <div className="absolute inset-x-16 top-24 bottom-24 border-2 border-dashed border-stone-400 rounded-2xl flex flex-col items-center justify-center p-4 bg-stone-100/70 backdrop-blur-[1px]">
                  <span className="text-2xl font-serif-luxury font-normal text-stone-900 tracking-wider">
                    {language === "en" ? "YOUR DESIGN" : language === "ru" ? "ВАШ ДИЗАЙН" : language === "tr" ? "SENİN TASARIMIN" : "SƏNİN DİZAYNIN"}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-stone-600 font-bold mt-1">
                    {language === "en" ? "[ DESIGN AREA ]" : language === "ru" ? "[ ОБЛАСТЬ ДИЗАЙНА ]" : language === "tr" ? "[ TASARIM ALANI ]" : "[ DİZAYN SAHƏSİ ]"}
                  </span>
                </div>

                <div className="absolute bottom-4 inset-x-4 p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200 flex items-center justify-between text-xs text-stone-900 shadow-sm">
                  <span className="font-semibold text-stone-900">{language === "en" ? "100% Cotton Base T-Shirt" : language === "ru" ? "Базовая футболка 100% хлопок" : language === "tr" ? "%100 Pamuklu Temel T-Shirt" : "100% Pambıq Baza T-Shirt"}</span>
                  <span className="text-stone-900 font-bold font-serif-luxury text-sm">45.00 ₼</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DUAL CAMPAIGN BANNERS (Şalvarlar & Hudilər) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Banner 1: Chino & Cins Şalvarlar (User Trio Trousers Studio Design) */}
          <div data-cms-section="promoBanner" data-cms-title="Şalvar Kolleksiyası Banneri" className="relative aspect-[4/5] sm:aspect-[16/11] rounded-3xl overflow-hidden border border-stone-200/80 group bg-[#161415] shadow-2xs">
            <Image
              src="/images/categories/pants_collection_banner.webp"
              alt="HORVVALLE Kəsimləri — Şalvar Kolleksiyası"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-right sm:object-center transition-transform duration-700 group-hover:scale-103"
              priority={false}
              loading="lazy"
            />
            {/* Subtle Gradient Veil for Perfect Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white z-10 pointer-events-none" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 text-white z-20">
              <span className="text-xs font-semibold text-[#E6C280] uppercase tracking-wider">
                {bt("promoBanner", "tag", { en: "HORVVALLE CUTS", ru: "КРОЙ HORVVALLE", tr: "HORVVALLE KESİMLERİ" }, promoBanner?.tag || "HORVVALLE KƏSİMLƏRİ")}
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif-luxury font-normal uppercase mt-1 leading-tight drop-shadow-sm">
                {bt("promoBanner", "title", { en: "PERFECT PANTS FOR EVERY DAY", ru: "ИДЕАЛЬНЫЕ БРЮКИ НА КАЖДЫЙ ДЕНЬ", tr: "HER GÜN İÇİN İDEAL PANTOLONLAR" }, promoBanner?.title || "HƏR GÜN ÜÇÜN İDEAL ŞALVARLAR")}
              </h3>
              <p className="text-xs sm:text-sm text-stone-200 mt-1.5 max-w-sm line-clamp-2 leading-relaxed drop-shadow-xs">
                {bt("promoBanner", "subtitle", { en: "Classic chinos, comfortable linen, and straight-fit denim. Perfect for office or city strolls.", ru: "Классические чиносы, удобный лен и прямой деним. Идеально для офиса и прогулок.", tr: "Klasik chino, rahat keten ve düz kesim denim pantolonlar. Ofis veya şehir yürüyüşleri için ideal." }, promoBanner?.subtitle || "Klassik chino, rahat kətan və düz kəsim denim şalvarlar. İstər ofis, istərsə də şəhər gəzintisi üçün.")}
              </p>
              <div className="pt-4">
                <Link
                  href={promoBanner?.ctaLink || "/collections?category=salvar"}
                  prefetch={true}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-stone-900 font-semibold text-xs uppercase tracking-wider hover:bg-stone-100 transition shadow-sm active:scale-95 cursor-pointer"
                >
                  <span>{bt("promoBanner", "ctaText", { en: "ALL PANTS", ru: "ВСЕ БРЮКИ", tr: "TÜM PANTOLONLAR" }, promoBanner?.ctaText || "BÜTÜN ŞALVARLAR")}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* Banner 2: Premium 3iplik Hudi Kolleksiyası */}
          <div data-cms-section="campaignSecondary" data-cms-title="Hudi Kolleksiyası Banneri" className="relative aspect-[4/5] sm:aspect-[16/11] rounded-3xl overflow-hidden border border-stone-200/80 group bg-stone-900 shadow-2xs">
            <Image
              src="/images/products/heavyweight-hoodie-black/mockup.jpg"
              alt="Hudi Kolleksiyası"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-103 opacity-90"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white z-10 pointer-events-none" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 text-white z-20">
              <span className="text-xs font-semibold text-[#E6C280] uppercase tracking-wider">
                {bt("campaignSecondary", "tag", { en: "HORVVALLE COUTURE", ru: "HORVVALLE COUTURE", tr: "HORVVALLE COUTURE" }, campaignSecondary?.tag || "HORVVALLE COUTURE")}
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif-luxury font-normal uppercase mt-1 leading-tight">
                {bt("campaignSecondary", "title", { en: "WARM & COMFORTABLE OVERSIZED HOODIE COLLECTION", ru: "ТЕПЛАЯ И УДОБНАЯ КОЛЛЕКЦИЯ ОВЕРСАЙЗ ХУДИ", tr: "SICAK VE RAHAT OVERSIZED HUDİ KOLEKSİYONU" }, campaignSecondary?.title || "İSTİ VƏ RAHAT OVERSIZED HUDİ KOLLEKSİYASI")}
              </h3>
              <p className="text-xs sm:text-sm text-stone-200 mt-1.5 max-w-sm line-clamp-2 leading-relaxed">
                {bt("campaignSecondary", "subtitle", { en: "Thick 380 GSM cotton feel, warm lining, and a vivid, long-lasting design. Ideal for streetwear style.", ru: "Плотный хлопок 380 GSM, теплая подкладка и яркий стойкий дизайн. Идеально для уличного стиля.", tr: "Kalın 380 GSM pamuk dokusu, sıcak astar ve canlı, uzun ömürlü tasarım. Şehir stili için ideal." }, campaignSecondary?.subtitle || "Qalın 380 GSM pambıq toxunuşu, isti astar və canlı, uzunömürlü dizayn. Şəhər stili üçün ideal.")}
              </p>
              <div className="pt-4">
                <Link
                  href={campaignSecondary?.ctaLink || "/collections?category=hudi"}
                  prefetch={true}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-stone-900 font-semibold text-xs uppercase tracking-wider hover:bg-stone-100 transition shadow-sm active:scale-95"
                >
                  <span>{bt("campaignSecondary", "ctaText", { en: "VIEW HOODIES", ru: "СМОТРЕТЬ ХУДИ", tr: "HUDİLERE BAK" }, campaignSecondary?.ctaText || "HUDİLƏRƏ BAX")}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section with FAQPage Schema */}
      <FAQSection />
      </div>
    </div>
  );
}
