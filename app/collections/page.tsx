
"use client";

function getLocalizedFit(f: string, lang: string) {
  if (f === "all") return "";
  const map: Record<string, { en: string; ru: string; tr: string }> = {
    "Regular Fit": { en: "Regular Fit", ru: "Классический крой (Regular Fit)", tr: "Klasik Kesim (Regular Fit)" },
    "Oversize Fit": { en: "Oversized Fit", ru: "Оверсайз крой (Oversize)", tr: "Oversize Kesim" },
    "Slim Fit": { en: "Slim Fit", ru: "Приталенный крой (Slim Fit)", tr: "Dar Kesim (Slim Fit)" },
    "Relaxed Fit": { en: "Relaxed Fit", ru: "Свободный крой (Relaxed)", tr: "Rahat Kesim" },
    "T-shirt Regular (Süprəm)": { en: "Regular T-Shirt (Supreme Cotton)", ru: "Классическая футболка (Супрем)", tr: "Klasik T-Shirt (Süprem)" },
    "T-shirt Regular (2iplik / TS Parça)": { en: "Regular T-Shirt (2-Thread)", ru: "Классическая футболка (2-нитка)", tr: "Klasik T-Shirt (2 İplik)" },
    "Oversize T-shirt (Süprəm / 2iplik)": { en: "Oversized T-Shirt (2-Thread)", ru: "Оверсайз футболка (2-нитка)", tr: "Oversize T-Shirt (2 İplik)" },
    "Polo - qısaqol": { en: "Short-sleeve Polo", ru: "Поло с коротким рукавом", tr: "Kısa Kollu Polo" },
    "Polo - uzunqol": { en: "Long-sleeve Polo", ru: "Поло с длинным рукавом", tr: "Uzun Kollu Polo" },
    "Sviter - nazik (2iplik)": { en: "Lightweight Sweater (2-Thread)", ru: "Тонкий свитер (2-нитка)", tr: "İnce Kazak (2 İplik)" },
    "Sviter - qalın (3iplik)": { en: "Heavyweight Sweater (3-Thread)", ru: "Плотный свитер (3-нитка)", tr: "Kalın Kazak (3 İplik)" },
    "Hody nazik (2iplik)": { en: "Lightweight Hoodie (2-Thread)", ru: "Тонкое худи (2-нитка)", tr: "İnce Hudi (2 İplik)" },
    "Hody qalın (3iplik)": { en: "Heavyweight Hoodie (3-Thread)", ru: "Плотное худи (3-нитка)", tr: "Kalın Hudi (3 İplik)" },
    "Yarımzamok nazik (2iplik)": { en: "Half-Zip Pullover (2-Thread)", ru: "Пуловер на молнии (2-нитка)", tr: "Yarım Fermuarlı Kazak (2 İplik)" },
    "Yarımzamok qalın (3iplik)": { en: "Heavy Half-Zip (3-Thread)", ru: "Плотный пуловер на молнии (3-нитка)", tr: "Kalın Yarım Fermuarlı (3 İplik)" },
    "Balonka": { en: "Windbreaker / Puffer Vest", ru: "Ветровка / Жилетка", tr: "Rüzgarlık / Yelek" },
    "Şalvar nazik (2iplik)": { en: "Lightweight Pants (2-Thread)", ru: "Тонкие брюки (2-нитка)", tr: "İnce Pantolon (2 İplik)" },
    "Şalvar qalın (3iplik / TS Parça)": { en: "Heavyweight Pants (3-Thread)", ru: "Плотные брюки (3-нитка)", tr: "Kalın Pantolon (3 İplik)" },
    "Kepka - nazik": { en: "Lightweight Cap", ru: "Легкая кепка", tr: "İnce Şapka" },
    "Kepka - qalın": { en: "Heavyweight Snapback Cap", ru: "Плотная кепка", tr: "Kalın Şapka" },
  };

  const item = map[f];
  if (!item) return f;
  if (lang === "en") return item.en;
  if (lang === "ru") return item.ru;
  if (lang === "tr") return item.tr;
  return f;
}

import React, { Suspense, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useStoreData } from "@/context/StoreDataContext";
import { useLanguage } from "@/context/LanguageContext";
import { ProductCard } from "@/components/ProductCard";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { SlidersHorizontal, Filter, X, Check } from "lucide-react";
import CollectionsLoading from "./loading";

function CollectionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products } = useStoreData();
  const { t, language } = useLanguage();
  const rawGender = searchParams.get("gender") || "all";
  const selectedGender = rawGender.toLowerCase().trim() || "all";
  const selectedCategory = searchParams.get("category") || "all";

  const [selectedFit, setSelectedFit] = useState<string>("all");
  const [selectedSize, setSelectedSize] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("bestselling");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const handleCategoryChange = (catId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (catId === "all") {
      params.delete("category");
    } else {
      params.set("category", catId);
    }
    const qs = params.toString();
    router.replace(`/collections${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const handleGenderChange = (genId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (genId === "all") {
      params.delete("gender");
    } else {
      params.set("gender", genId);
    }
    const qs = params.toString();
    router.replace(`/collections${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const getCategoryHref = (catId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (catId === "all") {
      params.delete("category");
    } else {
      params.set("category", catId);
    }
    const qs = params.toString();
    return `/collections${qs ? `?${qs}` : ""}`;
  };

  const getGenderHref = (genId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (genId === "all") {
      params.delete("gender");
    } else {
      params.set("gender", genId);
    }
    const qs = params.toString();
    return `/collections${qs ? `?${qs}` : ""}`;
  };

  // Lock body scroll when mobile filter sidebar is open
  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileFilterOpen]);

  const genderTabs = [
    { id: "all", label: t.collections?.all || (language === "az" ? "Hamısı" : language === "ru" ? "Все" : language === "tr" ? "Tümü" : "All") },
    { id: "men", label: t.collections?.men || (language === "az" ? "Kişi" : language === "ru" ? "Мужское" : language === "tr" ? "Erkek" : "Men") },
    { id: "women", label: t.collections?.women || (language === "az" ? "Qadın" : language === "ru" ? "Женское" : language === "tr" ? "Kadın" : "Women") },
    { id: "unisex", label: t.collections?.unisex || (language === "az" ? "Unisex" : language === "ru" ? "Унисекс" : language === "tr" ? "Uniseks" : "Unisex") },
  ];

  const categories = [
    { id: "all", label: t.collections?.allModels || "Bütün modellər" },
    { id: "koynek", label: t.collections?.shirts || "T-Shirt & köynək" },
    { id: "hudi", label: t.collections?.hoodies || "Hudi & sviter" },
    { id: "salvar", label: t.collections?.pants || "Şalvar & şortik" },
    { id: "aksesuar", label: t.collections?.accessories || "Aksesuarlar" },
  ];

  const sortOptions = [
    { id: "bestselling", label: t.collections?.sortBestselling || "Ən çox satılanlar" },
    { id: "price_asc", label: t.collections?.sortPriceAsc || "Qiymət: Ucuzdan Bahaya" },
    { id: "price_desc", label: t.collections?.sortPriceDesc || "Qiymət: Bahadan Ucuza" },
    { id: "rating", label: t.collections?.sortRating || "Ən yüksək reytinq" },
  ];

  // Dynamic stock-derived fits (aligning Siluet & Kəsim with active in-stock products, purging 0-product dead options)
  const fits = useMemo(() => {
    let scoped = products.filter((p) => p.inStock !== false);
    if (selectedCategory !== "all") {
      scoped = scoped.filter((p) => p.category === selectedCategory);
    }
    if (selectedGender !== "all") {
      if (selectedGender === "men") {
        scoped = scoped.filter((p) => p.gender === "men" || p.gender === "unisex");
      } else if (selectedGender === "women") {
        scoped = scoped.filter((p) => p.gender === "women" || p.gender === "unisex");
      } else if (selectedGender === "unisex") {
        scoped = scoped.filter((p) => p.gender === "unisex");
      }
    }

    const fitSet = new Set<string>();
    scoped.forEach((p) => {
      const f = (p.fit || "").trim();
      if (f && f.toLowerCase() !== "all") {
        fitSet.add(f);
      }
    });

    return ["all", ...Array.from(fitSet)];
  }, [products, selectedCategory, selectedGender]);

  // Reset selectedFit if it is no longer available in the active category/gender
  useEffect(() => {
    if (selectedFit !== "all" && !fits.includes(selectedFit)) {
      setSelectedFit("all");
    }
  }, [fits, selectedFit]);

  const sizes = ["all", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "30", "32", "34", "36"];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Gender filtering
      if (selectedGender !== "all") {
        if (selectedGender === "men") {
          if (product.gender !== "men" && product.gender !== "unisex") return false;
        } else if (selectedGender === "women") {
          if (product.gender !== "women" && product.gender !== "unisex") return false;
        } else if (selectedGender === "unisex") {
          if (product.gender !== "unisex") return false;
        } else if (product.gender !== selectedGender) {
          return false;
        }
      }

      if (selectedCategory !== "all" && product.category !== selectedCategory) {
        return false;
      }
      if (selectedFit !== "all") {
        const pFit = (product.fit || "").toLowerCase().trim();
        const sFit = selectedFit.toLowerCase().trim();
        // Substring comparison resilience: pFit.includes(sFit) || sFit.includes(pFit)
        if (!pFit || (pFit !== sFit && !pFit.includes(sFit) && !sFit.includes(pFit))) {
          return false;
        }
      }
      if (selectedSize !== "all" && !product.sizes.includes(selectedSize)) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return b.reviewCount - a.reviewCount;
    });
  }, [products, selectedGender, selectedCategory, selectedFit, selectedSize, sortBy]);

  const clearFilters = () => {
    setSelectedFit("all");
    setSelectedSize("all");
    setSortBy("bestselling");
    router.replace("/collections", { scroll: false });
  };

  // Staggered animation variants for smooth cascading entrance
  const staggerContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.035,
        delayChildren: 0.02,
      },
    },
  };

  const cardItemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 420,
        damping: 28,
      },
    },
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] text-[#111827] pt-4 sm:pt-6 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* =========================================================================
            HEADER TITLE & CONTROLS (EB Garamond serif, clean light aesthetic)
            ========================================================================= */}
        <div className="py-6 sm:py-8 border-b border-stone-200/80 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            key={`${selectedCategory}_${selectedGender}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Eyebrow Badge */}
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-stone-500 block mb-1.5">
              {language === "az" ? "KOLLEKSİYA 2026" : language === "ru" ? "КОЛЛЕКЦИЯ 2026" : language === "tr" ? "KOLEKSİYON 2026" : "COLLECTION 2026"}
            </span>

            {/* Serif Title */}
            <h1 className="font-eb-garamond text-3xl sm:text-5xl lg:text-[3.2rem] font-normal leading-[1.1] tracking-tight text-stone-900 mt-1">
              {selectedGender !== "all" && selectedCategory === "all" ? (
                selectedGender === "men" ? (
                  language === "az" ? (
                    <>Kişi <span className="italic text-stone-800">kolleksiyası</span></>
                  ) : language === "ru" ? (
                    <>Мужская <span className="italic text-stone-800">коллекция</span></>
                  ) : language === "tr" ? (
                    <>Erkek <span className="italic text-stone-800">koleksiyonu</span></>
                  ) : (
                    <>Men's <span className="italic text-stone-800">Collection</span></>
                  )
                ) : selectedGender === "women" ? (
                  language === "az" ? (
                    <>Qadın <span className="italic text-stone-800">kolleksiyası</span></>
                  ) : language === "ru" ? (
                    <>Женская <span className="italic text-stone-800">коллекция</span></>
                  ) : language === "tr" ? (
                    <>Kadın <span className="italic text-stone-800">koleksiyonu</span></>
                  ) : (
                    <>Women's <span className="italic text-stone-800">Collection</span></>
                  )
                ) : (
                  language === "az" ? (
                    <>Unisex <span className="italic text-stone-800">kolleksiyası</span></>
                  ) : language === "ru" ? (
                    <>Унисекс <span className="italic text-stone-800">коллекция</span></>
                  ) : language === "tr" ? (
                    <>Uniseks <span className="italic text-stone-800">koleksiyonu</span></>
                  ) : (
                    <>Unisex <span className="italic text-stone-800">Collection</span></>
                  )
                )
              ) : selectedCategory === "hudi" ? (
                language === "az" ? (
                  <>Hudi və <span className="italic text-stone-800">sviterlər</span></>
                ) : language === "ru" ? (
                  <>Худи и <span className="italic text-stone-800">свитшоты</span></>
                ) : language === "tr" ? (
                  <>Hudi ve <span className="italic text-stone-800">sweatshirt</span></>
                ) : (
                  <>Hoodies & <span className="italic text-stone-800">Sweaters</span></>
                )
              ) : selectedCategory === "koynek" ? (
                language === "az" ? (
                  <>T-Shirt və <span className="italic text-stone-800">köynəklər</span></>
                ) : language === "ru" ? (
                  <>Футболки и <span className="italic text-stone-800">рубашки</span></>
                ) : language === "tr" ? (
                  <>T-Shirt ve <span className="italic text-stone-800">gömlekler</span></>
                ) : (
                  <>T-Shirts & <span className="italic text-stone-800">Shirts</span></>
                )
              ) : selectedCategory === "salvar" ? (
                language === "az" ? (
                  <>Şalvar və <span className="italic text-stone-800">şortiklər</span></>
                ) : language === "ru" ? (
                  <>Брюки и <span className="italic text-stone-800">шорты</span></>
                ) : language === "tr" ? (
                  <>Pantolon ve <span className="italic text-stone-800">şortlar</span></>
                ) : (
                  <>Pants & <span className="italic text-stone-800">Shorts</span></>
                )
              ) : selectedCategory === "aksesuar" ? (
                language === "az" ? (
                  <>Zərif <span className="italic text-stone-800">aksesuarlar</span></>
                ) : language === "ru" ? (
                  <>Изысканные <span className="italic text-stone-800">аксессуары</span></>
                ) : language === "tr" ? (
                  <>Zarif <span className="italic text-stone-800">aksesuarlar</span></>
                ) : (
                  <>Refined <span className="italic text-stone-800">Accessories</span></>
                )
              ) : (
                language === "az" ? (
                  <>Bütün <span className="italic text-stone-800">modellər</span></>
                ) : language === "ru" ? (
                  <>Все <span className="italic text-stone-800">модели</span></>
                ) : language === "tr" ? (
                  <>Tüm <span className="italic text-stone-800">modeller</span></>
                ) : (
                  <>All <span className="italic text-stone-800">Garments</span></>
                )
              )}
            </h1>

            {/* Editorial Subtitle */}
            <p className="text-stone-600 text-sm sm:text-[14.5px] leading-relaxed max-w-xl font-sans mt-2">
              {selectedGender === "men" && selectedCategory === "all"
                ? (language === "az" ? "Kişilər üçün hazırlanmış premium kəsimli köynəklər, hudilər və şalvarlar." : language === "ru" ? "Мужская коллекция: футболки, плотные худи и брюки из гребенного хлопка." : language === "tr" ? "Erkekler için özenle tasarlanmış premium t-shirtler, polar hudiler ve pantolonlar." : "Curated men's collection featuring bespoke tees, fleece hoodies, and tailored trousers.")
                : selectedGender === "women" && selectedCategory === "all"
                ? (language === "az" ? "Qadınlar üçün zərif və rahat atelye kəsimli modellər." : language === "ru" ? "Женская коллекция базовых и утонченных моделей с безупречной посадкой." : language === "tr" ? "Kadınlar için zarif ve konforlu atölye kesimli modeller." : "Refined women's wardrobe essentials with atelier tailoring.")
                : selectedGender === "unisex" && selectedCategory === "all"
                ? (language === "az" ? "Həm kişi, həm də qadınlar üçün universal oversize və rahat siluetlər." : language === "ru" ? "Универсальные оверсайз силуэты, подходящие каждому." : language === "tr" ? "Hem kadın hem erkek için konforlu uniseks silüetler." : "Universal oversize silhouettes designed for all genders.")
                : selectedCategory === "hudi"
                ? (language === "az" ? "3iplik qalın və isti hudilər, daranmış xalis pambıq və fərdi atelye kəsimi." : language === "ru" ? "Теплые и плотные худи 3-х нитка, гребенной хлопок и индивидуальный крой." : language === "tr" ? "Kalın ve sıcak tutan 3iplik polarlar, penye pamuk ve özel terzi kesimi." : "Heavyweight 3-thread fleece, combed pure cotton and bespoke atelier tailoring.")
                : selectedCategory === "koynek"
                ? (language === "az" ? "Oversize və regular t-shirt-lər, klassik Oxford köynəklər, 100% daranmış premium pambıq." : language === "ru" ? "Оверсайз и классические футболки, рубашки Оксфорд из 100% гребенного хлопка." : language === "tr" ? "Oversize ve regular t-shirtler, klasik Oxford gömlekler, %100 penye pamuk." : "Oversize and regular t-shirts, classic Oxford shirts in 100% premium combed cotton.")
                : selectedCategory === "salvar"
                ? (language === "az" ? "Dəqiq atelye kəsimi ilə chino, denim və taktiki kargo şalvarlar." : language === "ru" ? "Брюки чинос, деним и карго с безупречной посадкой по фигуре." : language === "tr" ? "Kusursuz kalıplı chino, denim ve kargo pantolonlar." : "Precision-tailored chino, denim, and cargo trousers.")
                : selectedCategory === "aksesuar"
                ? (language === "az" ? "Qalın kətan kepkalar, eko çantalar və fərdi aksesuarlar." : language === "ru" ? "Плотные кепки, эко-сумки и стильные аксессуары." : language === "tr" ? "Kalın keten kasketler, eko çantalar ve özel aksesuarlar." : "Heavy canvas caps, eco tote bags and bespoke accessories.")
                : (language === "az" ? "Premium köynəklər, 3iplik hudilər, şalvarlar və fərdi atelye kolleksiyası." : language === "ru" ? "Премиальные рубашки, плотные худи, брюки и коллекция ателье." : language === "tr" ? "Premium gömlekler, 3iplik polarlar, pantolonlar ve özel atölye koleksiyonu." : "Premium shirts, heavyweight hoodies, tailored trousers, and bespoke couture.")}
            </p>
          </motion.div>

          {/* Sort Dropdown & Mobile Filter Button */}
          <div className="flex items-center gap-3">
            <div className="w-52">
              <CustomDropdown
                options={sortOptions}
                value={sortBy}
                onChange={setSortBy}
                variant="light"
                className="w-full"
              />
            </div>

            {/* Mobile Filter Toggle */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="md:hidden flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 font-medium text-xs cursor-pointer active:scale-95 transition shadow-2xs"
            >
              <SlidersHorizontal size={14} className="text-stone-600" />
              <span>{t.collections?.filters || "Filtrlər"}</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            GENDER & CATEGORY FILTER TABS (Interactive Pills)
            ========================================================================= */}
        <div className="py-4 border-b border-stone-200/80 space-y-3">
          {/* Gender Filter Tabs (Hamısı / Kişi / Qadın / Unisex) */}
          <div className="flex items-center gap-2 overflow-x-auto select-none">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mr-1 shrink-0">
              {t.collections?.gender || "Cins"}:
            </span>
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-stone-100/90 border border-stone-200/80 shadow-2xs shrink-0">
              {genderTabs.map((g) => {
                const isActive = selectedGender === g.id;
                return (
                  <Link
                    key={g.id}
                    href={getGenderHref(g.id)}
                    scroll={false}
                    prefetch={true}
                    className={`relative px-4 sm:px-5 py-1.5 rounded-full text-xs font-semibold transition-colors shrink-0 cursor-pointer select-none active:scale-95 ${
                      isActive ? "text-white font-bold" : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeCollectionsGenderPill"
                        className="absolute inset-0 bg-stone-900 rounded-full shadow-sm z-0"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10">{g.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Category Tabs (Desktop & Tablet) */}
          <div className="hidden md:flex items-center gap-2 overflow-x-auto select-none pt-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mr-1 shrink-0">
              {t.nav.categories || "Bölmə"}:
            </span>
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-stone-100/90 border border-stone-200/80 shadow-2xs">
              {categories.map((c) => {
                const isActive = selectedCategory === c.id;
                return (
                  <Link
                    key={c.id}
                    href={getCategoryHref(c.id)}
                    scroll={false}
                    prefetch={true}
                    className={`relative px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors shrink-0 cursor-pointer select-none active:scale-95 ${
                      isActive
                        ? "text-white font-semibold"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeCollectionsCategoryPill"
                        className="absolute inset-0 bg-stone-800 rounded-full shadow-sm z-0"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10">{c.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* =========================================================================
            MAIN GRID & FILTERS LAYOUT
            ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 pt-8">
          
          {/* =====================================================================
              DESKTOP FILTER SIDEBAR (Clean White Card, Circular Size Buttons)
              ===================================================================== */}
          <aside className="hidden md:block md:col-span-3 space-y-6">
            <div className="bg-white border border-stone-200/80 rounded-2xl p-5 space-y-6 shadow-xs text-stone-900">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                  <Filter size={14} className="text-stone-600" /> Filtrlər
                </span>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[11px] text-stone-500 hover:text-stone-900 underline cursor-pointer transition-colors"
                >
                  Sıfırla
                </button>
              </div>

              {/* Gender Filter inside Sidebar */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
                  {t.collections?.gender || "Cins"}
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {genderTabs.map((g) => {
                    const isActive = selectedGender === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handleGenderChange(g.id)}
                        className={`py-2 px-3 rounded-full text-xs font-medium transition text-center cursor-pointer ${
                          isActive
                            ? "bg-stone-900 text-white font-medium shadow-sm"
                            : "bg-stone-50 text-stone-700 hover:bg-stone-100 hover:text-stone-900 border border-stone-200/60"
                        }`}
                      >
                        {g.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Pills inside Sidebar */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
                  {t.nav.categories || "Kateqoriya"}
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {categories.map((cat) => {
                    const isActive = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`py-2 px-3.5 rounded-full text-xs font-medium transition text-left cursor-pointer ${
                          isActive
                            ? "bg-stone-900 text-white font-medium shadow-sm"
                            : "bg-stone-50 text-stone-700 hover:bg-stone-100 hover:text-stone-900 border border-stone-200/60"
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sizes: Circular Chips */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
                  Ölçü
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {sizes.map((s) => {
                    const isActive = selectedSize === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full text-xs font-semibold transition-all flex items-center justify-center cursor-pointer active:scale-95 ${
                          isActive
                            ? "bg-stone-900 text-white font-bold shadow-sm"
                            : "bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200/80"
                        }`}
                      >
                        {s === "all" ? "Hamı" : s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Siluet & Kəsim (Fits) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
                    Siluet & Kəsim
                  </label>
                  {selectedFit !== "all" && (
                    <button
                      type="button"
                      onClick={() => setSelectedFit("all")}
                      className="text-[10px] text-amber-700 hover:underline font-semibold"
                    >
                      Sıfırla
                    </button>
                  )}
                </div>
                <div data-lenis-prevent className="space-y-1 max-h-64 overflow-y-auto pr-1 scrollbar-thin overscroll-contain">
                  {fits.map((f) => {
                    const isActive = selectedFit === f;
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setSelectedFit(f)}
                        className={`w-full py-1.5 px-3 rounded-xl text-xs transition cursor-pointer text-left truncate ${
                          isActive
                            ? "bg-stone-900 text-white font-semibold shadow-xs"
                            : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/70"
                        }`}
                        title={f === "all" ? (t.collections?.all || "Bütün modellər") : getLocalizedFit(f, language)}
                      >
                        {f === "all" ? (t.collections?.all || "Bütün modellər") : getLocalizedFit(f, language)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* =====================================================================
              PRODUCT GRID AREA (Mobile: 2 Columns, Desktop: 3 Columns)
              ===================================================================== */}
          <main className="md:col-span-9">
            <div className="flex items-center justify-between mb-5 text-xs text-stone-500 font-medium uppercase tracking-wider">
              <span>{language === "az" ? "Məhsul sayı: " : language === "ru" ? "Количество: " : language === "tr" ? "Ürün sayısı: " : "Products: "}{filteredProducts.length}</span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center bg-white border border-stone-200/80 rounded-2xl p-8 space-y-4 text-stone-900 shadow-xs">
                <h3 className="text-lg font-bold text-stone-900">
                  {t.collections?.noProductsFound || "Bu filtrlərə uyğun heç bir məhsul tapılmadı"}
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  {language === "az" ? "Daha çox seçim üçün filtrləri sıfırlayın və ya 3D fərdi studiyada öz unikal dizaynınızı yaradın." : language === "ru" ? "Сбросьте фильтры для большего выбора или создайте свой дизайн в 3D студии." : language === "tr" ? "Daha fazla seçenek için filtreleri sıfırlayın veya 3D stüdyoda kendi tasarımınızı yapın." : "Reset filters to see all pieces or create your bespoke design in the 3D lab."}
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-6 py-2.5 rounded-full bg-stone-900 text-white font-medium text-xs uppercase hover:bg-black transition shadow-sm cursor-pointer"
                >
                  {t.collections?.resetFilters || "Filtrləri təmizlə"}
                </button>
              </div>
            ) : (
              <motion.div
                key={`${selectedCategory}_${selectedGender}_${selectedFit}_${selectedSize}_${sortBy}`}
                variants={staggerContainerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6"
              >
                {filteredProducts.map((product, idx) => (
                  <motion.div key={product.id} variants={cardItemVariants}>
                    <ProductCard product={product} variant="light" priority={idx < 4} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </main>
        </div>
      </div>

      {/* =========================================================================
          RESPONSIVE MOBILE FILTER DRAWER
          ========================================================================= */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Slide-In Filter Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%", transition: { duration: 0.18, ease: "easeIn" } }}
              transition={{ type: "spring", damping: 30, stiffness: 360 }}
              className="relative w-[88%] max-w-sm bg-white text-stone-900 h-full z-10 flex flex-col justify-between shadow-2xl border-l border-stone-200 overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-stone-700" />
                  <span className="text-base font-bold uppercase tracking-tight text-stone-900">
                    FİLTERLƏR
                  </span>
                  <span className="text-xs bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full font-bold text-stone-700">
                    {filteredProducts.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-2 rounded-full bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200 transition cursor-pointer"
                  aria-label="Bağla"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Body Filters */}
              <div className="p-5 space-y-6 flex-1 overflow-y-auto">
                {/* Gender Selection */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
                    {t.collections?.gender || "Cins"}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {genderTabs.map((g) => {
                      const isActive = selectedGender === g.id;
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => handleGenderChange(g.id)}
                          className={`py-2 px-3 rounded-full text-xs font-medium transition text-center cursor-pointer ${
                            isActive
                              ? "bg-stone-900 text-white font-semibold shadow-sm"
                              : "bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200"
                          }`}
                        >
                          {g.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
                    {t.nav.categories || "Kateqoriya"}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((c) => {
                      const isActive = selectedCategory === c.id;
                      const catHref = getCategoryHref(c.id);
                      return (
                        <Link
                          key={c.id}
                          href={catHref}
                          scroll={false}
                          prefetch={true}
                          onClick={() => setMobileFilterOpen(false)}
                          className={`py-2 px-3 rounded-full text-xs font-medium transition text-center cursor-pointer ${
                            isActive
                              ? "bg-stone-900 text-white font-semibold shadow-sm"
                              : "bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200"
                          }`}
                        >
                          {c.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Size Selection */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
                    Ölçü
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {sizes.map((s) => {
                      const isActive = selectedSize === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          className={`w-9 h-9 rounded-full text-xs font-bold transition-all flex items-center justify-center cursor-pointer active:scale-95 ${
                            isActive
                              ? "bg-stone-900 text-white font-extrabold shadow-sm"
                              : "bg-stone-50 text-stone-700 border border-stone-200"
                          }`}
                        >
                          {s === "all" ? "Hamı" : s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Fit Selection */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
                    Kəsim & Siluet
                  </span>
                  <div className="space-y-1.5">
                    {fits.map((f) => {
                      const isActive = selectedFit === f;
                      return (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setSelectedFit(f)}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-medium text-left transition flex items-center justify-between cursor-pointer ${
                            isActive
                              ? "bg-stone-100 text-stone-900 font-semibold border border-stone-200"
                              : "text-stone-600 hover:bg-stone-50"
                          }`}
                        >
                          <span>{f === "all" ? "Bütün kəsimlər" : getLocalizedFit(f, language)}</span>
                          {isActive && <Check size={14} className="text-stone-900" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sort Order with Animated Dropdown */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
                    Sıralama
                  </span>
                  <CustomDropdown
                    options={sortOptions}
                    value={sortBy}
                    onChange={setSortBy}
                    variant="light"
                    direction="up"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="p-5 border-t border-stone-100 bg-stone-50 flex gap-3">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex-1 py-3 px-4 rounded-full border border-stone-300 text-stone-700 font-semibold text-xs uppercase hover:bg-stone-100 transition text-center cursor-pointer"
                >
                  Sıfırla
                </button>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-2 py-3 px-4 rounded-full bg-stone-900 text-white font-semibold text-xs uppercase hover:bg-black transition text-center shadow-sm cursor-pointer active:scale-95"
                >
                  Tətbiq Et ({filteredProducts.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <Suspense fallback={<CollectionsLoading />}>
      <CollectionsContent />
    </Suspense>
  );
}
