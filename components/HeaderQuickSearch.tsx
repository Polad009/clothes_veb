"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Palette, ArrowRight } from "lucide-react";
import { Product } from "@/data/products";
import { useCategories, useStoreData } from "@/context/StoreDataContext";
import { categoryTitle } from "@/lib/categories";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";

interface HeaderQuickSearchProps {
  isLightMode: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface QuickSuggestion {
  label: string;
  query: string;
  isStudio?: boolean;
}

export function HeaderQuickSearch({ isLightMode, onOpenChange }: HeaderQuickSearchProps) {
  const router = useRouter();
  const { products } = useStoreData();
  const { formatPrice, formatProductPrice } = useCurrency();
  const { t, language } = useLanguage();
  const categories = useCategories();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync open state with parent Header to smoothly coordinate z-index and nav links
  const handleSetOpen = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
    if (!open) {
      setQuery("");
      setSelectedIndex(-1);
    }
  };

  // Localized quick search suggestions without tech/AI buzzwords
  const quickSuggestions: QuickSuggestion[] = useMemo(() => {
    if (language === "en") {
      return [
        { label: "Linen Shirt", query: "Linen" },
        { label: "Oversized Hoodie", query: "Hoodie" },
        { label: "Chino Pants", query: "Chino" },
        { label: "Pure Cotton Tee", query: "Cotton" },
        { label: "Design Studio", query: "studio", isStudio: true },
      ];
    }
    if (language === "ru") {
      return [
        { label: "Льняная рубашка", query: "Лен" },
        { label: "Оверсайз худи", query: "Худи" },
        { label: "Брюки чинос", query: "Чинос" },
        { label: "Базовая футболка", query: "Футболка" },
        { label: "Студия дизайна", query: "studio", isStudio: true },
      ];
    }
    if (language === "tr") {
      return [
        { label: "Keten Gömlek", query: "Keten" },
        { label: "Oversized Hudi", query: "Hudi" },
        { label: "Chino Pantolon", query: "Chino" },
        { label: "Beyaz Tişört", query: "Beyaz" },
        { label: "Tasarım Stüdyosu", query: "studio", isStudio: true },
      ];
    }
    return [
      { label: "Kətan Köynək", query: "Kətan" },
      { label: "3iplik Qalın Hudi", query: "Hudi" },
      { label: "Chino Şalvar", query: "Chino" },
      { label: "Xalis Pambıq T-Shirt", query: "Pambıq" },
      { label: "Fərdi Studiya", query: "studio", isStudio: true },
    ];
  }, [language]);

  // Keyboard shortcut: Cmd+K / Ctrl+K opens quick search; Escape closes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        handleSetOpen(true);
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        handleSetOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Click outside modal listener to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        handleSetOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 70);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Lock body scroll when search modal is open
  useEffect(() => {
    if (isOpen) {
      const origOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = origOverflow;
      };
    }
  }, [isOpen]);

  // Filter products in real time
  const trimmed = query.trim().toLowerCase();
  const matchingProducts: Product[] = useMemo(() => {
    if (!trimmed) return [];
    const source = products;
    return source.filter(
      (p) =>
        p.name.toLowerCase().includes(trimmed) ||
        p.category.toLowerCase().includes(trimmed) ||
        p.fit.toLowerCase().includes(trimmed) ||
        (p.badge && p.badge.toLowerCase().includes(trimmed)) ||
        (p.description && p.description.toLowerCase().includes(trimmed))
    ).slice(0, 6);
  }, [trimmed, products]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  const handleSelectProduct = (slug: string) => {
    handleSetOpen(false);
    router.push(`/products/${slug}`);
  };

  const handleSelectSuggestion = (sug: QuickSuggestion) => {
    if (sug.isStudio) {
      handleSetOpen(false);
      router.push("/studio");
    } else {
      setQuery(sug.query);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && matchingProducts[selectedIndex]) {
      handleSelectProduct(matchingProducts[selectedIndex].slug);
      return;
    }
    if (trimmed) {
      handleSetOpen(false);
      router.push(`/collections?search=${encodeURIComponent(trimmed)}`);
    }
  };

  // Keyboard navigation through search results (ArrowDown, ArrowUp, Enter)
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (matchingProducts.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % matchingProducts.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + matchingProducts.length) % matchingProducts.length);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Search Trigger Button */}
      <div className="flex items-center">
        {/* Desktop Trigger */}
        <button
          type="button"
          onClick={() => handleSetOpen(true)}
          className={`hidden sm:flex h-9 sm:h-10 xl:h-11 items-center gap-2 px-3.5 xl:px-4 rounded-full border text-xs font-medium transition-all cursor-pointer shadow-2xs active:scale-95 ${
            isLightMode
              ? "bg-stone-100 hover:bg-stone-200/80 border-stone-200/80 text-stone-700"
              : "bg-white/15 hover:bg-white/25 border-white/25 text-white"
          }`}
          aria-label={t.nav.search || "Axtarış"}
        >
          <Search size={14} className={isLightMode ? "text-stone-600" : "text-[#E6C280]"} />
          <span>{t.nav.search || "Axtarış"}</span>
          <kbd className={`hidden xl:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono rounded ${
            isLightMode ? "bg-stone-200/70 text-stone-600" : "bg-white/15 text-white/80"
          }`}>
            ⌘K
          </kbd>
        </button>

        {/* Mobile Trigger */}
        <button
          type="button"
          onClick={() => handleSetOpen(true)}
          className={`sm:hidden h-9 w-9 rounded-full border transition-all active:scale-95 cursor-pointer flex items-center justify-center shrink-0 ${
            isLightMode
              ? "bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-200"
              : "bg-white/15 hover:bg-white/25 text-white border-white/20"
          }`}
          aria-label={t.nav.search || "Axtarış"}
        >
          <Search size={15} className={isLightMode ? "text-stone-600" : "text-[#E6C280]"} />
        </button>
      </div>

      {/* Modern Luxury Command-Palette Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[120] flex items-start justify-center p-4 sm:p-6 md:p-10">
            {/* Frosted Glass Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => handleSetOpen(false)}
              className="fixed inset-0 bg-black/65 backdrop-blur-md"
              aria-hidden="true"
            />

            {/* Centered Luxury Modal Dialog */}
            <motion.div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-label={t.nav.search || "Axtarış"}
              initial={{ opacity: 0, scale: 0.96, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -16 }}
              transition={{
                type: "spring",
                damping: 26,
                stiffness: 360,
                mass: 0.7,
              }}
              className="relative w-full max-w-2xl mt-[6vh] sm:mt-[10vh] bg-[#FAF7F2] rounded-3xl border border-stone-300/80 shadow-[0_30px_90px_rgba(0,0,0,0.45)] overflow-hidden flex flex-col max-h-[80vh] text-[#1A1517]"
            >
              {/* Top Search Input Bar */}
              <form
                onSubmit={handleSubmit}
                className="relative flex items-center gap-3 px-5 py-4 sm:py-5 border-b border-stone-200/90 bg-white"
              >
                <Search size={20} className="text-[#B08D57] shrink-0" />

                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder={
                    language === "en"
                      ? "Search atelier garments, fits, fabrics..."
                      : language === "ru"
                      ? "Поиск по каталогу, фасонам, тканям..."
                      : language === "tr"
                      ? "Atölye modelleri, kumaşlar ve kesimler ara..."
                      : "Atelye geyimləri, kəsimlər və parçaları axtarın..."
                  }
                  className="w-full bg-transparent font-serif-luxury text-base sm:text-lg text-stone-900 placeholder-stone-400 focus:outline-none"
                />

                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      inputRef.current?.focus();
                    }}
                    className="p-1 rounded-full text-stone-400 hover:text-stone-700 transition cursor-pointer"
                    aria-label="Təmizlə"
                  >
                    <X size={15} />
                  </button>
                )}

                <div className="flex items-center gap-1.5 shrink-0 pl-1">
                  <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-medium text-stone-500 bg-stone-100 rounded border border-stone-200/90">
                    ESC
                  </kbd>
                  <button
                    type="button"
                    onClick={() => handleSetOpen(false)}
                    className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition cursor-pointer"
                    aria-label="Bağla"
                  >
                    <X size={17} />
                  </button>
                </div>
              </form>

              {/* Modal Body Area */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                {/* When query is empty: Suggestions and Quick Categories */}
                {!trimmed ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-stone-200/70">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
                          {language === "en" ? "Curated Suggestions" : language === "ru" ? "Рекомендации ателье" : language === "tr" ? "Öne Çıkan Aramalar" : "Tövsiyə Edilən Axtarışlar"}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {language === "en" ? "Quick Select" : "Sürətli Seçim"}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-3">
                        {quickSuggestions.map((sug) => (
                          <button
                            key={sug.label}
                            type="button"
                            onClick={() => handleSelectSuggestion(sug)}
                            className="px-3.5 py-2 rounded-full text-xs font-medium transition-all border border-stone-200/90 bg-white hover:bg-stone-900 hover:text-white hover:border-stone-900 text-stone-700 shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            {sug.isStudio ? <Palette size={13} className="text-[#B08D57]" /> : null}
                            <span>{sug.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Category Jump Links */}
                    <div className="pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 block mb-2.5">
                        {language === "en" ? "Browse Departments" : language === "ru" ? "Разделы каталога" : language === "tr" ? "Kategoriler" : "Kolleksiya Bölmələri"}
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {categories.map((c) => ({ id: c.id, name: categoryTitle(c, language), href: `/collections?category=${encodeURIComponent(c.id)}` })).map((cat) => (
                          <Link
                            key={cat.id}
                            href={cat.href}
                            onClick={() => handleSetOpen(false)}
                            className="p-3 rounded-2xl bg-white border border-stone-200/80 hover:border-stone-900 hover:shadow-2xs transition-all text-center group cursor-pointer"
                          >
                            <span className="text-xs font-semibold uppercase tracking-wider text-stone-800 group-hover:text-stone-900">
                              {cat.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* When query has text: Rich Product Result Cards */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-200/70">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
                        {language === "en"
                          ? `Atelier Results (${matchingProducts.length})`
                          : language === "ru"
                          ? `Найдено моделей (${matchingProducts.length})`
                          : language === "tr"
                          ? `Sonuçlar (${matchingProducts.length})`
                          : `Tapılan Modellər (${matchingProducts.length})`}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          handleSetOpen(false);
                          router.push(`/collections?search=${encodeURIComponent(trimmed)}`);
                        }}
                        className="text-[11px] font-semibold text-[#B08D57] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{language === "en" ? "View all in catalog" : "Bütün kataloqda bax"}</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>

                    {matchingProducts.length > 0 ? (
                      <div className="space-y-2">
                        {matchingProducts.map((p, idx) => {
                          const image = p.colors?.[0]?.image || "/shirts/keten-koynek.png";
                          const isHighlighted = idx === selectedIndex;
                          return (
                            <div
                              key={p.id}
                              onClick={() => handleSelectProduct(p.slug)}
                              onMouseEnter={() => setSelectedIndex(idx)}
                              className={`flex items-center gap-3.5 p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer group ${
                                isHighlighted
                                  ? "bg-white border-stone-900 shadow-sm"
                                  : "bg-white/80 hover:bg-white border-stone-200/80 hover:border-stone-300"
                              }`}
                            >
                              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-stone-100 border border-stone-200/60 shrink-0">
                                <Image
                                  src={image}
                                  alt={p.name}
                                  fill
                                  sizes="64px"
                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="px-2 py-0.5 rounded-full bg-stone-100 text-[9px] font-bold uppercase tracking-wider text-stone-600">
                                    {p.category}
                                  </span>
                                  {p.fit && (
                                    <span className="text-[10px] text-stone-400 uppercase font-medium">
                                      {p.fit}
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-xs sm:text-sm font-serif-luxury font-normal text-stone-900 truncate group-hover:text-[#B08D57] transition-colors">
                                  {p.name}
                                </h4>
                              </div>

                              <div className="text-right shrink-0 pl-2">
                                <span className="text-sm font-bold font-serif-luxury text-stone-900 block">
                                  {formatProductPrice(p)}
                                </span>
                                {p.compareAtPrice && (
                                  <span className="text-[11px] text-stone-400 line-through block">
                                    {formatPrice(p.compareAtPrice)}
                                  </span>
                                )}
                              </div>

                              <div className="shrink-0 text-stone-400 group-hover:text-stone-900 group-hover:translate-x-0.5 transition-all">
                                <ArrowRight size={15} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-8 text-center space-y-2">
                        <p className="text-sm text-stone-600 font-serif-luxury">
                          {language === "en"
                            ? `No atelier pieces found for "${query}"`
                            : language === "ru"
                            ? `По запросу "${query}" ничего не найдено`
                            : language === "tr"
                            ? `"${query}" araması için parça bulunamadı`
                            : `"${query}" üçün heç bir model tapılmadı`}
                        </p>
                        <p className="text-xs text-stone-400">
                          {language === "en"
                            ? "Try searching for categories like 'hudi', 'koynek', or 'salvar'"
                            : "Kateqoriyalar üzrə axtarın: hudi, köynək, şalvar və ya parça növü"}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            handleSetOpen(false);
                            router.push("/collections");
                          }}
                          className="mt-3 inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-stone-900 text-white text-xs font-semibold uppercase tracking-wider hover:bg-black transition cursor-pointer"
                        >
                          <span>{language === "en" ? "Explore Full Catalog" : "Bütün Kataloqa Bax"}</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer with Keyboard Navigation Shortcuts */}
              <div className="px-5 py-3 border-t border-stone-200/80 bg-stone-100/60 flex items-center justify-between text-[11px] text-stone-500">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white border border-stone-200 text-[10px] font-mono">↑</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-white border border-stone-200 text-[10px] font-mono">↓</kbd>
                    <span>{language === "en" ? "Navigate" : "Naviqasiya"}</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white border border-stone-200 text-[10px] font-mono">↵</kbd>
                    <span>{language === "en" ? "Select" : "Seç"}</span>
                  </span>
                </div>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-stone-200 text-[10px] font-mono">ESC</kbd>
                  <span>{language === "en" ? "Close" : "Bağla"}</span>
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
