"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Box, ChevronRight } from "lucide-react";
import { MOCK_PRODUCTS, Product } from "@/data/products";
import { useStoreData } from "@/context/StoreDataContext";
import { useCurrency } from "@/context/CurrencyContext";

interface HeaderQuickSearchProps {
  isLightMode: boolean;
  onOpenChange?: (open: boolean) => void;
}

const QUICK_SUGGESTIONS = [
  { label: "Kətan Köynək", query: "Kətan" },
  { label: "3iplik Qalın Hudi", query: "Hudi" },
  { label: "Xaki Kargo", query: "Kargo" },
  { label: "Ağ T-Shirt", query: "Ağ" },
  { label: "3D Studiya", query: "3D", isStudio: true },
];

export function HeaderQuickSearch({ isLightMode, onOpenChange }: HeaderQuickSearchProps) {
  const router = useRouter();
  const { products } = useStoreData();
  const { formatPrice } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync open state with parent Header to smoothly hide center nav links and prevent overlaps
  const handleSetOpen = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  // Keyboard shortcut: Cmd+K / Ctrl+K opens quick search; Escape closes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        handleSetOpen(true);
      } else if (e.key === "Escape" && isOpen) {
        handleSetOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Click outside listener to smoothly collapse
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleSetOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Auto focus input when opened smoothly
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Filter products in real time
  const trimmed = query.trim().toLowerCase();
  const matchingProducts: Product[] = trimmed
    ? (products.length > 0 ? products : MOCK_PRODUCTS).filter(
        (p) =>
          p.name.toLowerCase().includes(trimmed) ||
          p.category.toLowerCase().includes(trimmed) ||
          p.fit.toLowerCase().includes(trimmed) ||
          (p.badge && p.badge.toLowerCase().includes(trimmed))
      ).slice(0, 5)
    : [];

  const handleSelectProduct = (slug: string) => {
    handleSetOpen(false);
    router.push(`/products/${slug}`);
  };

  const handleSelectSuggestion = (sug: typeof QUICK_SUGGESTIONS[0]) => {
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
    if (trimmed) {
      handleSetOpen(false);
      router.push(`/collections?search=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Dimming Backdrop that shields the page and collapses search when clicked */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={() => handleSetOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-[1.5px] z-[110]"
          />
        )}
      </AnimatePresence>

      {/* 
        Inline Expanding Capsule Trigger:
        Smoothly morphs from a compact pill button into an active search input
      */}
      <div className="flex items-center">
        {/* Desktop Search Button (Acts as fixed layout anchor in header flexbox) */}
        <button
          type="button"
          onClick={() => handleSetOpen(true)}
          className={`hidden sm:flex h-9 sm:h-10 xl:h-11 items-center gap-1.5 xl:gap-2 px-3 xl:px-4 rounded-full border text-xs font-medium transition-all cursor-pointer shadow-sm active:scale-95 ${
            isLightMode
              ? "bg-stone-100 hover:bg-stone-200/80 border-stone-200/80 text-stone-700"
              : "bg-white/15 hover:bg-white/25 border-white/25 text-white"
          } ${isOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          aria-label="Axtarış"
        >
          <Search size={14} className={isLightMode ? "text-stone-600" : "text-[#E6C280]"} />
          <span>Axtarış</span>
        </button>

        {/* Mobile Search Icon Button */}
        <button
          type="button"
          onClick={() => handleSetOpen(true)}
          className={`sm:hidden h-9 w-9 rounded-full border transition-all active:scale-95 cursor-pointer flex items-center justify-center shrink-0 ${
            isLightMode
              ? "bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-200"
              : "bg-white/15 hover:bg-white/25 text-white border-white/20"
          } ${isOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          aria-label="Axtarış"
        >
          <Search size={15} className={isLightMode ? "text-stone-600" : "text-[#E6C280]"} />
        </button>
      </div>

      {/* Unified Floating Search Popover (Input + Dropdown in a single flex container to completely prevent any overlap) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="search-popover"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="fixed sm:absolute inset-x-2.5 top-2.5 sm:top-0 sm:right-0 sm:left-auto z-[120] w-[calc(100vw-1.25rem)] sm:w-[340px] xl:w-[380px] flex flex-col gap-2"
          >
            {/* 1. Active Search Input Box */}
            <form
              onSubmit={handleSubmit}
              style={{
                backgroundColor: isLightMode ? "#FAF7F2" : "#140B05",
              }}
              className={`flex items-center gap-2 h-10 xl:h-11 px-3.5 rounded-full border shadow-2xl sm:shadow-lg transition-all ${
                isLightMode
                  ? "border-stone-300 text-stone-900 shadow-stone-200/80"
                  : "border-white/30 text-white shadow-black/70"
              } w-full shrink-0`}
            >
              <Search
                size={15}
                className={`shrink-0 ${isLightMode ? "text-stone-500" : "text-[#E6C280]"}`}
              />

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Axtarın..."
                className="w-full bg-transparent text-xs sm:text-sm font-medium focus:outline-none placeholder-stone-400"
              />

              {query.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="p-1 text-stone-400 hover:text-stone-600 transition cursor-pointer"
                  aria-label="Təmizlə"
                >
                  <X size={13} />
                </button>
              )}

              <button
                type="button"
                onClick={() => handleSetOpen(false)}
                className={`p-1 rounded-full transition cursor-pointer ${
                  isLightMode
                    ? "hover:bg-stone-200/70 text-stone-500 hover:text-stone-800"
                    : "hover:bg-white/15 text-white/60 hover:text-white"
                }`}
                aria-label="Bağla"
                title="Bağla (Esc)"
              >
                <X size={15} />
              </button>
            </form>

            {/* 2. Results / Suggestions Dropdown Box */}
            <div
              style={{
                backgroundColor: isLightMode ? "#FAF7F2" : "#140B05",
              }}
              className={`w-full rounded-2xl p-3 shadow-2xl border ${
                isLightMode
                  ? "border-[#E8E2D8] text-[#1A1517] shadow-[0_25px_70px_rgba(0,0,0,0.18)]"
                  : "border-white/20 text-white shadow-[0_25px_70px_rgba(0,0,0,0.7)]"
              }`}
            >
              {/* If query is empty, show Quick Suggestion chips */}
              {!trimmed ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1 pb-1 border-b border-stone-200/70">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Tövsiyə Olunanlar
                    </span>
                    <span className="text-[10px] font-mono text-stone-400">Esc ilə bağla</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {QUICK_SUGGESTIONS.map((sug) => (
                      <button
                        key={sug.label}
                        type="button"
                        onClick={() => handleSelectSuggestion(sug)}
                        className={`px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all border cursor-pointer flex items-center gap-1 active:scale-95 ${
                          isLightMode
                            ? "bg-white hover:bg-stone-100 text-stone-700 border-stone-200/90 shadow-2xs"
                            : "bg-white/10 hover:bg-white/20 text-white border-white/15"
                        }`}
                      >
                        {sug.isStudio ? <Box size={11} className="text-[#E6C280]" /> : null}
                        <span>{sug.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* If query has text, show real-time live matching products */
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1 pb-1 border-b border-stone-200/70">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Nəticələr ({matchingProducts.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        handleSetOpen(false);
                        router.push(`/collections?search=${encodeURIComponent(trimmed)}`);
                      }}
                      className={`text-[10px] font-semibold underline cursor-pointer ${
                        isLightMode ? "text-stone-700 hover:text-black" : "text-white/80 hover:text-white"
                      }`}
                    >
                      Hamısına bax
                    </button>
                  </div>

                  {matchingProducts.length > 0 ? (
                    <div className="space-y-1 max-h-72 overflow-y-auto pr-0.5">
                      {matchingProducts.map((p) => {
                        const image = p.colors[0]?.image || "/shirts/keten-koynek.png";
                        return (
                          <div
                            key={p.id}
                            onClick={() => handleSelectProduct(p.slug)}
                            className={`flex items-center gap-2.5 p-2 rounded-xl transition-all cursor-pointer group ${
                              isLightMode
                                ? "hover:bg-white hover:shadow-2xs text-stone-800"
                                : "hover:bg-white/10 text-white"
                            }`}
                          >
                            <Image
                              src={image}
                              alt={p.name}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-lg object-cover bg-stone-100 border border-stone-200/60 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-semibold truncate group-hover:text-[#B08D57] transition-colors">
                                {p.name}
                              </h4>
                              <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-0.5">
                                <span className="uppercase font-medium">{p.category}</span>
                                <span>·</span>
                                <span>{p.fit}</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-bold text-[#B08D57]">
                                {formatPrice(p.price)}
                              </span>
                              <ChevronRight size={13} className="text-stone-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-5 text-center">
                      <p className="text-xs text-stone-500 font-medium">
                        "{query}" üçün nəticə tapılmadı.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          handleSetOpen(false);
                          router.push("/collections");
                        }}
                        className="mt-2 text-xs font-semibold text-[#B08D57] underline cursor-pointer"
                      >
                        Bütün kolleksiyaya bax
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
