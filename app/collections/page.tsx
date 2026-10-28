"use client";

import React, { Suspense, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_PRODUCTS } from "@/data/products";
import { useStoreData } from "@/context/StoreDataContext";
import { ProductCard } from "@/components/ProductCard";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { SlidersHorizontal, Filter, X, Check } from "lucide-react";
import CollectionsLoading from "./loading";

function CollectionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products } = useStoreData();
  const selectedCategory = searchParams.get("category") || "all";

  const [selectedFit, setSelectedFit] = useState<string>("all");
  const [selectedSize, setSelectedSize] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("bestselling");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const handleCategoryChange = (catId: string) => {
    const url = catId === "all" ? "/collections" : `/collections?category=${catId}`;
    router.replace(url, { scroll: false });
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

  const categories = [
    { id: "all", label: "Bütün modellər" },
    { id: "koynek", label: "T-Shirt & köynək" },
    { id: "hudi", label: "Hudi & sviter" },
    { id: "salvar", label: "Şalvar & şortik" },
    { id: "aksesuar", label: "Aksesuarlar" },
  ];

  const sortOptions = [
    { id: "bestselling", label: "Ən çox satılanlar" },
    { id: "price_asc", label: "Qiymət: Ucuzdan Bahaya" },
    { id: "price_desc", label: "Qiymət: Bahadan Ucuza" },
    { id: "rating", label: "Ən yüksək reytinq" },
  ];

  const fits = [
    "all",
    "T-shirt Regular (Süprəm)",
    "T-shirt Regular (2iplik / TS Parça)",
    "Oversize T-shirt (Süprəm / 2iplik)",
    "Polo - qısaqol",
    "Polo - uzunqol",
    "Sviter - nazik (2iplik)",
    "Sviter - qalın (3iplik)",
    "Hody nazik (2iplik)",
    "Hody qalın (3iplik)",
    "Yarımzamok nazik (2iplik)",
    "Yarımzamok qalın (3iplik)",
    "Balonka",
    "Şalvar nazik (2iplik)",
    "Şalvar qalın (3iplik / TS Parça)",
    "Kepka - nazik",
    "Kepka - qalın",
  ];

  const sizes = ["all", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "30", "32", "34", "36"];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedCategory !== "all" && product.category !== selectedCategory) {
        return false;
      }
      if (selectedFit !== "all") {
        const pFit = (product.fit || "").toLowerCase();
        const sFit = selectedFit.toLowerCase();
        if (pFit !== sFit && !pFit.includes(sFit) && !sFit.includes(pFit)) {
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
  }, [products, selectedCategory, selectedFit, selectedSize, sortBy]);

  const clearFilters = () => {
    handleCategoryChange("all");
    setSelectedFit("all");
    setSelectedSize("all");
    setSortBy("bestselling");
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
            key={selectedCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Eyebrow Badge */}
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-stone-500 block mb-1.5">
              KOLLEKSİYA 2026
            </span>

            {/* Serif Title */}
            <h1 className="font-eb-garamond text-3xl sm:text-5xl lg:text-[3.2rem] font-normal leading-[1.1] tracking-tight text-stone-900 mt-1">
              {selectedCategory === "hudi" ? (
                <>
                  Hudi və <span className="italic text-stone-800">sviterlər</span>
                </>
              ) : selectedCategory === "koynek" ? (
                <>
                  T-Shirt və <span className="italic text-stone-800">köynəklər</span>
                </>
              ) : selectedCategory === "salvar" ? (
                <>
                  Şalvar və <span className="italic text-stone-800">şortiklər</span>
                </>
              ) : selectedCategory === "aksesuar" ? (
                <>
                  Zərif <span className="italic text-stone-800">aksesuarlar</span>
                </>
              ) : (
                <>
                  Bütün <span className="italic text-stone-800">modellər</span>
                </>
              )}
            </h1>

            {/* Editorial Subtitle */}
            <p className="text-stone-600 text-sm sm:text-[14.5px] leading-relaxed max-w-xl font-sans mt-2">
              {selectedCategory === "hudi"
                ? "3iplik qalın və isti hudilər, daranmış xalis pambıq və fərdi atelye kəsimi."
                : selectedCategory === "koynek"
                ? "Oversize və regular t-shirt-lər, klassik Oxford köynəklər, 100% daranmış premium pambıq."
                : selectedCategory === "salvar"
                ? "Dəqiq atelye kəsimi ilə chino, denim və taktiki kargo şalvarlar."
                : selectedCategory === "aksesuar"
                ? "Qalın kətan kepkalar, eko çantalar və fərdi aksesuarlar."
                : "Premium köynəklər, 3iplik hudilər, şalvarlar və fərdi atelye kolleksiyası."}
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
              <span>Filtrlər</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            CATEGORY TABS (Pills: Active Dark Charcoal Pill with Sliding Indicator)
            ========================================================================= */}
        <div className="hidden md:flex items-center gap-2 py-5 border-b border-stone-200/80 overflow-x-auto select-none">
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-stone-100/90 border border-stone-200/80 shadow-2xs">
            {categories.map((c) => {
              const isActive = selectedCategory === c.id;
              const catHref = c.id === "all" ? "/collections" : `/collections?category=${c.id}`;
              return (
                <Link
                  key={c.id}
                  href={catHref}
                  scroll={false}
                  prefetch={true}
                  className={`relative px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors shrink-0 cursor-pointer select-none active:scale-95 ${
                    isActive
                      ? "text-white font-semibold"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeCollectionsCategoryPill"
                      className="absolute inset-0 bg-stone-900 rounded-full shadow-sm z-0"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{c.label}</span>
                </Link>
              );
            })}
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

              {/* Category Pills inside Sidebar */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
                  Kateqoriya
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
                        title={f === "all" ? "Bütün modellər" : f}
                      >
                        {f === "all" ? "Bütün modellər" : f}
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
              <span>Məhsul sayı: {filteredProducts.length}</span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center bg-white border border-stone-200/80 rounded-2xl p-8 space-y-4 text-stone-900 shadow-xs">
                <h3 className="text-lg font-bold text-stone-900">
                  Bu filtrlərə uyğun heç bir məhsul tapılmadı
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Daha çox seçim üçün filtrləri sıfırlayın və ya 3D fərdi studiyada öz unikal dizaynınızı yaradın.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-6 py-2.5 rounded-full bg-stone-900 text-white font-medium text-xs uppercase hover:bg-black transition shadow-sm cursor-pointer"
                >
                  Filtrləri təmizlə
                </button>
              </div>
            ) : (
              <motion.div
                key={`${selectedCategory}_${selectedFit}_${selectedSize}_${sortBy}`}
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
                {/* Category Selection */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
                    Kateqoriya
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((c) => {
                      const isActive = selectedCategory === c.id;
                      const catHref = c.id === "all" ? "/collections" : `/collections?category=${c.id}`;
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
                          <span>{f === "all" ? "Bütün kəsimlər" : f}</span>
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
