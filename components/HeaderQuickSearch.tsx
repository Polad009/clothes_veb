"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Sparkles, Box, ChevronRight } from "lucide-react";
import { MOCK_PRODUCTS, Product } from "@/data/products";
import { useCurrency } from "@/context/CurrencyContext";

interface HeaderQuickSearchProps {
  isLightMode: boolean;
}

const QUICK_SUGGESTIONS = [
  { label: "Kətan Köynək", query: "Kətan" },
  { label: "3iplik Qalın Hudi", query: "Hudi" },
  { label: "Xaki Kargo", query: "Kargo" },
  { label: "Ağ T-Shirt", query: "Ağ" },
  { label: "3D Studiya", query: "3D", isStudio: true },
];

export function HeaderQuickSearch({ isLightMode }: HeaderQuickSearchProps) {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Cmd+K / Ctrl+K opens quick search; Escape closes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
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
        setIsOpen(false);
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
    ? MOCK_PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(trimmed) ||
          p.category.toLowerCase().includes(trimmed) ||
          p.fit.toLowerCase().includes(trimmed) ||
          (p.badge && p.badge.toLowerCase().includes(trimmed))
      ).slice(0, 5)
    : [];

  const handleSelectProduct = (slug: string) => {
    setIsOpen(false);
    router.push(`/products/${slug}`);
  };

  const handleSelectSuggestion = (sug: typeof QUICK_SUGGESTIONS[0]) => {
    if (sug.isStudio) {
      setIsOpen(false);
      router.push("/studio");
    } else {
      setQuery(sug.query);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trimmed) {
      setIsOpen(false);
      router.push(`/collections?search=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* 
        Inline Expanding Capsule Trigger:
        Smoothly morphs from a compact pill button into an active search input
      */}
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="search-trigger"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center"
          >
            {/* Desktop Search Button */}
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className={`hidden sm:flex h-9 sm:h-10 xl:h-11 items-center gap-1.5 xl:gap-2 px-3 xl:px-4 rounded-full border text-xs font-medium transition-all cursor-pointer shadow-sm active:scale-95 ${
                isLightMode
                  ? "bg-stone-100 hover:bg-stone-200/80 border-stone-200/80 text-stone-700"
                  : "bg-white/15 hover:bg-white/25 border-white/25 text-white"
              }`}
              aria-label="Axtarış"
            >
              <Search size={14} className={isLightMode ? "text-stone-600" : "text-[#E6C280]"} />
              <span className="hidden xl:inline">Axtarış</span>
              <kbd
                className={`hidden xl:inline-flex px-1.5 py-0.5 rounded text-[9px] font-mono border ${
                  isLightMode
                    ? "bg-white border-stone-200 text-stone-600"
                    : "bg-black/40 border-white/20 text-white/80"
                }`}
              >
                ⌘K
              </kbd>
            </button>

            {/* Mobile Search Icon Button */}
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className={`sm:hidden h-9 w-9 rounded-full border transition-all active:scale-95 cursor-pointer flex items-center justify-center shrink-0 ${
                isLightMode
                  ? "bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-200"
                  : "bg-white/15 hover:bg-white/25 text-white border-white/20"
              }`}
              aria-label="Axtarış"
            >
              <Search size={15} className={isLightMode ? "text-stone-600" : "text-[#E6C280]"} />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="search-form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed sm:static inset-x-2.5 top-2.5 sm:top-auto sm:inset-auto z-[120] sm:z-auto"
          >
            <form
              onSubmit={handleSubmit}
              style={{
                backgroundColor: isLightMode ? "#FAF7F2" : "#140B05",
              }}
              className={`flex items-center gap-2 h-10 sm:h-10 xl:h-11 px-3.5 rounded-full border shadow-xl sm:shadow-md transition-all ${
                isLightMode
                  ? "border-stone-300 text-stone-900 shadow-stone-200/60"
                  : "border-white/30 text-white shadow-black/50"
              } w-full sm:w-[280px] xl:w-[320px]`}
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
                onClick={() => setIsOpen(false)}
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Animated Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{
              backgroundColor: isLightMode ? "#FAF7F2" : "#140B05",
            }}
            className={`fixed sm:absolute z-[120] top-14 sm:top-full mt-1.5 sm:mt-2 right-2.5 sm:right-0 left-2.5 sm:left-auto w-auto sm:w-[340px] max-w-[calc(100vw-1.25rem)] rounded-2xl p-3 shadow-2xl border ${
              isLightMode
                ? "border-[#E8E2D8] text-[#1A1517] shadow-[0_25px_70px_rgba(0,0,0,0.18)]"
                : "border-white/20 text-white shadow-[0_25px_70px_rgba(0,0,0,0.7)]"
            }`}
          >
            {/* If query is empty, show Quick Suggestion chips */}
            {!trimmed ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1 pb-1 border-b border-stone-200/70">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                    <Sparkles size={11} className={isLightMode ? "text-[#B08D57]" : "text-[#E6C280]"} />
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
                      setIsOpen(false);
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
                          <img
                            src={image}
                            alt={p.name}
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
                        setIsOpen(false);
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
