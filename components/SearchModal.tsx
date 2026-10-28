"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, Box, ArrowUpRight } from "lucide-react";
import { MOCK_PRODUCTS } from "@/data/products";
import { useStoreData } from "@/context/StoreDataContext";
import { useCurrency } from "@/context/CurrencyContext";
import gsap from "gsap";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const { products } = useStoreData();
  const [query, setQuery] = useState("");
  const modalBoxRef = useRef<HTMLDivElement>(null);

  const popularTags = [
    { label: "Klassik Qəhvəyi Kətan", query: "Kətan" },
    { label: "3iplik Qalın Qara Hudi", query: "Hudi" },
    { label: "Xaki Kargo Şalvar", query: "Kargo" },
    { label: "Ağ Pambıq T-Shirt", query: "Ağ" },
    { label: "3D Çap Studiyası", query: "3D", isStudio: true },
  ];

  // GSAP Smooth Modal Entrance
  useEffect(() => {
    if (isOpen && modalBoxRef.current) {
      gsap.fromTo(
        modalBoxRef.current,
        { scale: 0.94, opacity: 0, y: -20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }
      );
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? (products.length > 0 ? products : MOCK_PRODUCTS).filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.fit.toLowerCase().includes(query.toLowerCase()) ||
          (p.badge && p.badge.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 px-4 select-none">
      <div
        ref={modalBoxRef}
        className="bg-[#180B04] border border-white/20 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.8)] text-white"
      >
        {/* Top Gold Accent Line */}
        <div className="h-1 bg-gradient-to-r from-transparent via-[#E6C280] to-transparent opacity-80" />

        {/* Search Input Bar in Dark Atelier Glass */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center gap-3.5 bg-[#140702]">
          <div className="p-2 rounded-full bg-white/10 border border-white/15 text-[#E6C280]">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Horvvalle kolleksiyasında axtarın (məs: hudi, kətan, kargo)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-white placeholder-white/40 text-sm sm:text-base font-medium focus:outline-none"
          />
          {query.trim() && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="px-2 py-1 text-xs text-white/50 hover:text-white transition cursor-pointer"
            >
              Təmizlə
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition active:scale-95 cursor-pointer"
            aria-label="Bağla"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Popular Suggestions Strip */}
        <div className="px-5 sm:px-6 py-3 bg-black/35 border-b border-white/10 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#E6C280] font-bold mr-1">
            Tövsiyələr:
          </span>
          {popularTags.map((tag) => (
            <button
              key={tag.label}
              type="button"
              onClick={() => {
                if (tag.isStudio) {
                  onClose();
                  router.push("/studio");
                } else {
                  setQuery(tag.query);
                }
              }}
              className="text-xs px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white text-white hover:text-black border border-white/15 transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              {tag.isStudio && <Box size={12} className="text-[#E6C280]" />}
              <span>{tag.label}</span>
            </button>
          ))}
        </div>

        {/* Results Area */}
        <div data-lenis-prevent className="p-4 sm:p-6 max-h-[55vh] overflow-y-auto overscroll-contain">
          {query.trim() === "" ? (
            <div className="py-10 text-center space-y-2">
              <span className="text-xs sm:text-sm text-white/60 block">
                Məhsul adı, növü və ya xüsusiyyəti üzrə axtarın.
              </span>
              <span className="text-[11px] text-[#E6C280] font-semibold block">
                Məsələn: "3iplik Qara Hudi", "Kətan Köynək", "Kargo" və ya "Magenta"
              </span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <p className="text-sm text-white/70">
                "<span className="font-semibold text-white">{query}</span>" üzrə heç bir nəticə tapılmadı.
              </p>
              <Link
                href="/studio"
                onClick={onClose}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-xs font-semibold tracking-wider uppercase transition shadow-md hover:bg-white/90"
              >
                <span>3D Studiyada Fərdi Dizayn Et</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[10px] font-bold text-[#E6C280] uppercase tracking-[0.2em]">
                  Nəticələr ({filtered.length})
                </span>
                <span className="text-[10px] text-white/50">
                  Daxil olmaq üçün klikləyin
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {filtered.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3.5 p-3 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/10 hover:border-white/25 shadow-sm transition-all group active:scale-[0.98]"
                  >
                    <img
                      src={product.colors[0]?.image}
                      alt={product.name}
                      className="w-14 h-16 object-contain rounded-xl bg-black/30 border border-white/10 p-1 shrink-0 pointer-events-none select-none"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[9.5px] uppercase font-bold tracking-wider text-[#E6C280] block truncate">
                        {product.badge || product.category}
                      </span>
                      <div className="text-xs font-medium text-white truncate group-hover:text-[#E6C280] transition-colors mt-0.5">
                        {product.name}
                      </div>
                      <div className="text-xs font-bold text-white mt-1">
                        {formatPrice(product.price)}
                      </div>
                    </div>
                    <ArrowUpRight size={15} className="text-white/40 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Key Indicator */}
        <div className="px-6 py-2.5 bg-[#140702] border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
          <span>HORVVALLE ATELIER KATALOQU</span>
          <span>Bağlamaq üçün <kbd className="font-mono text-[9px] bg-white/10 px-1.5 py-0.5 rounded border border-white/20 text-white/70">ESC</kbd> basın</span>
        </div>
      </div>
    </div>
  );
}
