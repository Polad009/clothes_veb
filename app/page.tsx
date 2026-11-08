"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Palette, ShieldCheck, Truck, RotateCcw, Award, CheckCircle2 } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { MOCK_PRODUCTS } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { Hero } from "@/components/Hero";
import { FAQSection } from "@/components/FAQSection";
import storeData from "@/data/storeData.json";

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
import { useStoreData } from "@/context/StoreDataContext";

export default function Home() {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const { products, content } = useStoreData();
  const [activeCategory, setActiveCategory] = useState<"all" | "koynek" | "hudi" | "salvar" | "aksesuar">("all");
  const hero = content?.hero || storeData.content?.hero || {};
  const podBanner = content?.podBanner || (storeData.content as any)?.podBanner || {};
  const promoBanner = content?.promoBanner || storeData.content?.promoBanner;
  const campaignSecondary = content?.campaignSecondary || storeData.content?.campaignSecondary;
  const [badgeIndex, setBadgeIndex] = useState(0);

  const [introRevealed, setIntroRevealed] = useState(true);

  const { language } = useLanguage();
  const badgeMessages = [
    hero.tag || "HORVVALLE ATELIER · 2026 COUTURE · BAKI",
    language === "en" ? "100% PURE COMBED COTTON (220-380 GSM)" : language === "ru" ? "100% ЧИСТЫЙ ГРЕБЕННОЙ ХЛОПОК (220-380 GSM)" : language === "tr" ? "%100 SAF TARANMIŞ PAMUK (220-380 GSM)" : "100% XALİS DARANMIŞ PAMBIQ (220-380 GSM)",
    language === "en" ? "LIVE ATELIER DTG PRINT STUDIO — BAKU" : language === "ru" ? "ЖИВАЯ АТЕЛЬЕ DTG СТУДИЯ ПЕЧАТИ — БАКУ" : language === "tr" ? "CANLI ATÖLYE DTG BASKI STÜDYOSU — BAKÜ" : "CANLI ATELYE DTG ÇAP STUDİYASI — BAKI",
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

  const categoryHighlights = [
    {
      id: "koynek",
      num: "01",
      title: t.home.shirtsCategory || "T-Shirt & Köynək",
      desc: language === "en" ? "McLaren 750S & Vintage Polo" : language === "ru" ? "McLaren 750S и поло" : language === "tr" ? "McLaren 750S & Polo" : "McLaren 750S & Vintage Polo",
      fabric: language === "en" ? "100% Pure Cotton · 220-240 GSM" : language === "ru" ? "100% Чистый Хлопок · 220-240 GSM" : language === "tr" ? "%100 Saf Pamuk · 220-240 GSM" : "100% Xalis Pambıq · 220-240 GSM",
      image: "/images/uploads/mclaren_presentation_board.png",
      link: "/collections?category=koynek",
      count: language === "en" ? "6 Models" : language === "ru" ? "6 Моделей" : language === "tr" ? "6 Model" : "6 Model",
      tag: "240 GSM COUTURE",
    },
    {
      id: "hudi",
      num: "02",
      title: t.home.hoodiesCategory || "Hudi & Sviter",
      desc: language === "en" ? "BMW M Motorsport & Angel Dust" : language === "ru" ? "BMW M Motorsport и Angel Dust" : language === "tr" ? "BMW M Motorsport & Hudi" : "BMW M Motorsport & Angel Dust",
      fabric: language === "en" ? "Heavy 3-Thread Fleece · 380 GSM" : language === "ru" ? "Плотный флис 3-нитка · 380 GSM" : language === "tr" ? "Ağır 3 İplik Polar · 380 GSM" : "Ağır 3iplik Fleece · 380 GSM",
      image: "/images/uploads/bmw_hoodie_presentation.png",
      link: "/collections?category=hudi",
      count: language === "en" ? "4 Models" : language === "ru" ? "4 Модели" : language === "tr" ? "4 Model" : "4 Model",
      tag: "380 GSM FLEECE",
    },
    {
      id: "salvar",
      num: "03",
      title: t.home.pantsCategory || "Şalvar & Şortik",
      desc: language === "en" ? "Chino, Denim & Cargo" : language === "ru" ? "Чинос, деним и карго" : language === "tr" ? "Chino, Denim & Kargo" : "Chino & Denim & Kargo",
      fabric: language === "en" ? "Cotton Twill & 12.5 oz Indigo" : language === "ru" ? "Хлопковый твил и 12.5 унций индиго" : language === "tr" ? "Pamuklu Dimi & 12.5 oz İndigo" : "Pambıq Twill & 12.5 oz İndiqo",
      image: "/images/categories/salvar-and-shortik-showcase.webp",
      link: "/collections?category=salvar",
      count: language === "en" ? "5 Models" : language === "ru" ? "5 Моделей" : language === "tr" ? "5 Model" : "5 Model",
      tag: language === "en" ? "PRECISION ATELIER CUT" : language === "ru" ? "ТОЧНЫЙ КРОЙ АТЕЛЬЕ" : language === "tr" ? "HASSAS ATÖLYE KESİMİ" : "DƏQİQ ATELYE KƏSİMİ",
    },
    {
      id: "aksesuar",
      num: "04",
      title: t.home.accessoriesCategory || "Aksesuarlar",
      desc: language === "en" ? "Caps & Eco Tote Bags" : language === "ru" ? "Кепки и эко-сумки" : language === "tr" ? "Şapkalar & Eko Çantalar" : "Kepkalar & Eko Çantalar",
      fabric: language === "en" ? "Heavy Twill & Natural Canvas" : language === "ru" ? "Плотный твил и натуральный холст" : language === "tr" ? "Kalın Dimi & Doğal Keten" : "Qalın Twill & Təbii Kətan",
      image: "/images/products/bmw-m-motorsport-cap/black_front.webp",
      link: "/collections?category=aksesuar",
      count: language === "en" ? "1 Model" : language === "ru" ? "1 Модель" : language === "tr" ? "1 Model" : "1 Model",
      tag: language === "en" ? "ATELIER PRINT STUDIO" : language === "ru" ? "АТЕЛЬЕ СТУДИЯ ПЕЧАТИ" : language === "tr" ? "ATÖLYE BASKI STÜDYOSU" : "ATELYE ÇAP STUDİYASI",
    },
  ];


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
            {t.home.atelierShowcase || "CANLI ATELYE VİTRİNİ"}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-stone-900 font-editorial mt-0.5">
            {t.home.selectedShowcase || "HORVVALLE SEÇİLMİŞ MODELLƏR"}
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
                <span>{t.home.fourDirections || "KOLLEKSİYA STRUKTURU"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal uppercase tracking-tight text-stone-900 font-serif-luxury">
                {t.home.fourDirectionsTitle || "DÖRD ƏSAS DƏRZİLİK İSTİQAMƏTİ"}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md leading-relaxed">
              {t.home.fourDirectionsDesc || "Xalis daranmış sıx pambıq, isti 3iplik fleece və dəqiq kəsimli şalvarlar. İstənilən bölməni seçərək modelləri kəşf edin."}
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
                    <span className="font-mono font-semibold text-stone-600 tracking-wider">
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
                    className="block relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#FAF7F2] my-4 cursor-pointer"
                  >
                    <Image
                      src={cat.image}
                      alt={cat.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors" />
                    <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-stone-200/80 text-[10px] font-semibold text-stone-800 shadow-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>{t.home.view || "Bax"}</span>
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
                    <p className="text-xs text-stone-600 line-clamp-1 pt-0.5">
                      {cat.fabric}
                    </p>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-600 font-medium">
                    {cat.count}
                  </span>
                  <Link
                    href={cat.link}
                    prefetch={true}
                    className="inline-flex items-center gap-1.5 font-semibold text-stone-900 group-hover:text-amber-800 transition-colors uppercase tracking-wider text-[11px]"
                  >
                    <span>{t.home.viewCollection || "Kolleksiyaya Keç"}</span>
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
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-600 block mb-1">
              {t.home.selectedModels || "SEÇİLMİŞ MODELLƏR"}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal uppercase tracking-tight text-stone-900 font-serif-luxury">
              {t.home.wardrobeFoundation || "QARDEROBUNUZUN TƏMƏLİ"}
            </h2>
          </div>

          {/* Animated Filter Pills with Smooth Sliding Indicator */}
          <div className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-full bg-stone-100/90 border border-stone-200/80 shadow-2xs overflow-x-auto max-w-full">
            {[
              { id: "all", label: t.home.allModels || "Bütün Modellər" },
              { id: "koynek", label: t.home.shirtsCategory || "T-Shirt & Köynək" },
              { id: "hudi", label: t.home.hoodiesCategory || "Hudi & Sviter" },
              { id: "salvar", label: t.home.pantsCategory || "Şalvar & Şortik" },
              { id: "aksesuar", label: t.home.accessoriesCategory || "Aksesuarlar" },
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
      <section data-cms-section="podBanner" data-cms-title="Fərdi Çap Banneri" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative rounded-3xl overflow-hidden border border-stone-200/80 bg-gradient-to-br from-white via-[#FAF7F2] to-[#F5EFE6] p-8 sm:p-12 lg:p-16 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.06)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-800 text-xs font-medium uppercase tracking-wider">
                <Palette size={14} className="text-stone-700" />
                <span>{language === "en" ? "BESPOKE ATELIER PRINT STUDIO" : language === "ru" ? "ИНДИВИДУАЛЬНОЕ АТЕЛЬЕ ПЕЧАТИ" : language === "tr" ? "ÖZEL ATÖLYE BASKI STÜDYOSU" : (podBanner.tag && !podBanner.tag.includes("3D") ? podBanner.tag : "FƏRDİ ATELYE ÇAP STUDİYASI")}</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-normal uppercase tracking-tight text-stone-900 font-serif-luxury leading-[1.05]">
                {language === "en" ? "CREATE YOUR OWN DESIGN WITH HORVVALLE QUALITY" : language === "ru" ? "СОЗДАЙТЕ СВОЙ ДИЗАЙН В КАЧЕСТВЕ HORVVALLE" : language === "tr" ? "KENDİ TASARIMINI HORVVALLE KALİTESİYLE YARAT" : (podBanner.title || "ÖZ DİZAYNINI HORVVALLE KEYFİYYƏTİ İLƏ YARAT")}
              </h2>

              <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-xl">
                {language === "en" ? "Send your favorite image, logo, or artwork — the Horvvalle atelier prints it on 100% premium cotton with vivid DTG technology and delivers to your doorstep." : language === "ru" ? "Отправьте любимое изображение или логотип — ателье Horvvalle напечатает его на 100% премиум-хлопке с помощью технологии DTG и доставит вам." : language === "tr" ? "Favori görselinizi, logonuzu veya özel çiziminizi gönderin — Horvvalle atölyesi %100 birinci sınıf pamuk üzerine canlı DTG teknolojisiyle basıp adresinize teslim etsin." : (podBanner.description || "Sevdiyiniz şəkli, loqonu və ya eksklüziv rəsmi göndərin — Horvvalle atelyesi 100% yüksək keyfiyyətli premium pambıq üzərində canlı DTG texnologiyası ilə çap edib ünvanınıza çatdırsın.")}
              </p>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
                  <div className="text-xs font-bold text-stone-900 uppercase">{language === "en" ? "100% Cotton" : language === "ru" ? "100% Хлопок" : language === "tr" ? "%100 Pamuk" : "100% Pambıq"}</div>
                  <div className="text-[11px] text-stone-600 mt-0.5">{language === "en" ? "220 GSM Dense Weave" : language === "ru" ? "220 GSM Плотное плетение" : language === "tr" ? "220 GSM Sıkı Doku" : "220 GSM sıx toxunuş"}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
                  <div className="text-xs font-bold text-stone-900 uppercase">{language === "en" ? "Ultra HD Print" : language === "ru" ? "Ultra HD Печать" : language === "tr" ? "Ultra HD Baskı" : "Ultra HD Çap"}</div>
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
                  <span>{language === "en" ? "Go to Design Studio" : language === "ru" ? "В студию дизайна" : language === "tr" ? "Tasarım Stüdyosuna Geç" : (podBanner.ctaText || "Dizayn Studiyasına Keç")}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Right Visual Demo Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-square max-w-md mx-auto rounded-3xl overflow-hidden border border-stone-200/80 bg-white shadow-apple p-6 flex items-center justify-center">
                <Image
                  src={podBanner.image || "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop"}
                  alt="Custom Print Cotton Tee"
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
                    {language === "en" ? "[ PRINT AREA ]" : language === "ru" ? "[ ОБЛАСТЬ ПЕЧАТИ ]" : language === "tr" ? "[ BASKI ALANI ]" : "[ ÇAP SAHƏSİ ]"}
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

      {/* 5. DUAL CAMPAIGN BANNERS (Şalvarlar & Corablar) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Banner 1: Chino & Cins Şalvarlar */}
          <div data-cms-section="promoBanner" data-cms-title="Şalvar Kolleksiyası Banneri" className="relative aspect-[4/5] sm:aspect-[16/11] rounded-3xl overflow-hidden border border-stone-200/80 group bg-white shadow-2xs">
            <Image
              src={
                promoBanner?.image && !promoBanner.image.includes("beige-slim-chino-pants/mockup")
                  ? promoBanner.image
                  : "/images/categories/pants_collection_banner.jpg"
              }
              alt="Şalvar Kolleksiyası"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-103"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white z-10">
              <span className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                {language === "en" ? "HORVVALLE TAILORING" : language === "ru" ? "КРОЙ HORVVALLE" : language === "tr" ? "HORVVALLE KESİMLERİ" : (promoBanner?.tag || "HORVVALLE KƏSİMLƏRİ")}
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif-luxury font-normal uppercase mt-1">
                {language === "en" ? "PERFECT PANTS FOR EVERY DAY" : language === "ru" ? "ИДЕАЛЬНЫЕ БРЮКИ НА КАЖДЫЙ ДЕНЬ" : language === "tr" ? "HER GÜN İÇİN İDEAL PANTOLONLAR" : (promoBanner?.title || "HƏR GÜN ÜÇÜN İDEAL ŞALVARLAR")}
              </h3>
              <p className="text-xs text-stone-200 mt-1.5 max-w-sm line-clamp-2">
                {language === "en" ? "Classic chinos, comfortable linen, and straight-fit denim. Perfect for office or city strolls." : language === "ru" ? "Классические чиносы, удобный лен и прямой деним. Идеально для офиса и прогулок." : language === "tr" ? "Klasik chino, rahat keten ve düz kesim denim pantolonlar. Ofis veya şehir yürüyüşleri için ideal." : (promoBanner?.subtitle || "Klassik chino, rahat kətan və düz kəsim denim şalvarlar. İstər ofis, istərsə də şəhər gəzintisi üçün.")}
              </p>
              <div className="pt-4">
                <Link
                  href={promoBanner?.ctaLink || "/collections?category=salvar"}
                  prefetch={true}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-stone-900 font-medium text-xs uppercase tracking-wider hover:bg-stone-100 transition shadow-sm"
                >
                  <span>{language === "en" ? "ALL PANTS" : language === "ru" ? "ВСЕ БРЮКИ" : language === "tr" ? "TÜM PANTOLONLAR" : (promoBanner?.ctaText || "BÜTÜN ŞALVARLAR")}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* Banner 2: Premium 3iplik Hudi Kolleksiyası */}
          <div data-cms-section="campaignSecondary" data-cms-title="Hudi Kolleksiyası Banneri" className="relative aspect-[4/5] sm:aspect-[16/11] rounded-3xl overflow-hidden border border-stone-200/80 group bg-white shadow-2xs">
            <Image
              src={campaignSecondary?.image || "/images/products/heavyweight-hoodie-black/mockup.jpg"}
              alt="Hudi Kolleksiyası"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-103"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white z-10">
              <span className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                {language === "en" ? "HORVVALLE COUTURE" : language === "ru" ? "HORVVALLE COUTURE" : language === "tr" ? "HORVVALLE COUTURE" : (campaignSecondary?.tag || "HORVVALLE COUTURE")}
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif-luxury font-normal uppercase mt-1">
                {language === "en" ? "WARM & COMFORTABLE OVERSIZED HOODIE COLLECTION" : language === "ru" ? "ТЕПЛАЯ И УДОБНАЯ КОЛЛЕКЦИЯ ОВЕРСАЙЗ ХУДИ" : language === "tr" ? "SICAK VE RAHAT OVERSIZED HUDİ KOLEKSİYONU" : (campaignSecondary?.title || "İSTİ VƏ RAHAT OVERSIZED HUDİ KOLLEKSİYASI")}
              </h3>
              <p className="text-xs text-stone-200 mt-1.5 max-w-sm line-clamp-2">
                {language === "en" ? "Thick 380 GSM cotton feel, warm lining, and vibrant DTF print quality. Ideal for streetwear style." : language === "ru" ? "Плотный хлопок 380 GSM, теплая подкладка и яркая печать DTF. Идеально для уличного стиля." : language === "tr" ? "Kalın 380 GSM pamuk dokusu, sıcak astar ve canlı DTF baskı kalitesi. Şehir stili için ideal." : (campaignSecondary?.subtitle || "Qalın 380 GSM pambıq toxunuşu, isti astar və canlı DTF çap keyfiyyəti. Şəhər stili üçün ideal.")}
              </p>
              <div className="pt-4">
                <Link
                  href={campaignSecondary?.ctaLink || "/collections?category=hudi"}
                  prefetch={true}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-stone-900 font-medium text-xs uppercase tracking-wider hover:bg-stone-100 transition shadow-sm"
                >
                  <span>{language === "en" ? "VIEW HOODIES" : language === "ru" ? "СМОТРЕТЬ ХУДИ" : language === "tr" ? "HUDİLERE BAK" : (campaignSecondary?.ctaText || "HUDİLƏRƏ BAX")}</span>
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
