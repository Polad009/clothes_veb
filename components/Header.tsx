"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  Box,
  ChevronRight,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { HeaderQuickSearch } from "@/components/HeaderQuickSearch";
import { UnifiedLocaleDropdown } from "@/components/UnifiedLocaleDropdown";
import { useLanguage } from "@/context/LanguageContext";
import Logo from "@/components/Logo";

interface HeaderProps {
  className?: string;
}

export function Header({ className = "" }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams?.get("category") || null;

  const { totalCount, openCart } = useCart();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOverHero, setIsOverHero] = useState(true);
  const [heroHeaderBg, setHeroHeaderBg] = useState<string>("#542E13");
  const [heroTopGradient, setHeroTopGradient] = useState<string>("linear-gradient(180deg, #3A1B07 0%, #542E13 100%)");

  // Listen to active hero slide color changes
  useEffect(() => {
    const handleColorChange = (e: any) => {
      if (e.detail?.headerBg) setHeroHeaderBg(e.detail.headerBg);
      if (e.detail?.topGradient) setHeroTopGradient(e.detail.topGradient);
    };
    window.addEventListener("hv-hero-color-change", handleColorChange);
    return () => window.removeEventListener("hv-hero-color-change", handleColorChange);
  }, []);

  // IntersectionObserver: Detect whether user is currently over the #hero-section
  useEffect(() => {
    if (pathname !== "/") {
      setIsOverHero(false);
      return;
    }

    const heroEl = document.getElementById("hero-section");
    if (!heroEl) {
      setIsOverHero(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsOverHero(entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "-70px 0px 0px 0px",
      }
    );

    observer.observe(heroEl);
    return () => observer.disconnect();
  }, [pathname]);

  const isLightMode = pathname !== "/" || !isOverHero;


  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, currentCategory]);

  // Lock body scroll smoothly when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: "Köynək", href: "/collections?category=koynek", categoryId: "koynek" },
    { label: "Hudi", href: "/collections?category=hudi", categoryId: "hudi" },
    { label: "Şalvar", href: "/collections?category=salvar", categoryId: "salvar" },
    { label: "Aksesuar", href: "/collections?category=aksesuar", categoryId: "aksesuar" },
    { label: "Kolleksiya", href: "/collections", categoryId: "all" },
    { label: "Sifarişi İzlə", href: "/track", categoryId: "track" },
  ];

  const isLinkActive = (categoryId: string, href: string) => {
    if (categoryId !== "all") {
      if (pathname === "/collections" && currentCategory === categoryId) {
        return true;
      }
      if (pathname === "/" && categoryId === "koynek") {
        return true;
      }
      return false;
    }
    if (categoryId === "all") {
      return pathname === "/collections" && (!currentCategory || currentCategory === "all");
    }
    return false;
  };

  const isStudioActive = pathname === "/studio";

  return (
    <>
      <div
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isLightMode
            ? "bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs"
            : "bg-transparent border-none"
        }`}
      >
        <header
          className={`w-full max-w-[1536px] mx-auto px-2.5 sm:px-6 lg:px-4 xl:px-8 py-2.5 sm:py-3 flex items-center justify-between select-none transition-colors duration-300 ${
            isLightMode ? "text-[#111827]" : "text-white"
          } ${className}`}
          aria-label="Əsas Menyu"
        >
          {/* Left: Mobile Hamburger & HORVVALLE Logo */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className={`lg:hidden h-9 w-9 sm:h-10 sm:w-10 rounded-full border transition-all active:scale-95 cursor-pointer flex items-center justify-center shrink-0 ${
                isLightMode
                  ? "bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-200"
                  : "bg-white/15 hover:bg-white/25 text-white border-white/20"
              }`}
              aria-label="Menyu"
            >
              <Menu size={18} />
            </button>

            <Logo className="shrink-0 origin-left" theme={isLightMode ? "light" : "dark"} />
          </div>

          {/* Center: Glass Pill Navigation */}
          <nav
            className={`hidden lg:flex items-center gap-0.5 xl:gap-1 p-1 xl:p-1.5 rounded-full border transition-colors duration-300 ${
              isLightMode
                ? "bg-stone-100/90 border-stone-200/80 text-stone-700 shadow-2xs backdrop-blur-md"
                : "bg-black/20 border-white/15 text-white shadow-sm backdrop-blur-md"
            }`}
          >
            {navLinks.map((link) => {
              const active = isLinkActive(link.categoryId, link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  prefetch={true}
                  className={`h-9 xl:h-10 px-2.5 xl:px-4 rounded-full flex items-center justify-center transition-all whitespace-nowrap text-xs xl:text-sm cursor-pointer ${
                    active
                      ? isLightMode
                        ? "bg-stone-900 text-white font-semibold shadow-sm active:scale-95"
                        : "bg-white text-black font-semibold shadow-sm active:scale-95"
                      : isLightMode
                      ? "text-stone-700 hover:text-black hover:bg-stone-200/60 font-medium"
                      : "text-white/85 hover:text-white hover:bg-white/10 font-medium"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* 3D Studiya Button */}
            <Link
              href="/studio"
              prefetch={true}
              className={`h-9 xl:h-10 px-3 xl:px-4 rounded-full inline-flex items-center justify-center gap-1.5 text-xs xl:text-sm font-medium cursor-pointer whitespace-nowrap transition-all active:scale-95 ${
                isStudioActive
                  ? isLightMode
                    ? "bg-stone-900 text-white font-semibold shadow-sm border border-stone-900"
                    : "bg-white text-black font-semibold shadow-sm border border-[#E6C280]"
                  : isLightMode
                  ? "bg-white hover:bg-stone-200/60 text-stone-900 border border-stone-200/90 shadow-2xs"
                  : "bg-[#E6C280]/10 hover:bg-[#E6C280]/20 text-white border border-[#E6C280]/40"
              }`}
            >
              <Box
                size={14}
                className={
                  isStudioActive
                    ? isLightMode ? "text-white" : "text-black"
                    : isLightMode ? "text-stone-700" : "text-[#E6C280]"
                }
              />
              <span>3D Studiya</span>
            </Link>
          </nav>

          {/* Right: Search, Language/Currency, Cart */}
          <div className="flex items-center gap-1.5 sm:gap-2 xl:gap-2.5 shrink-0">
            {/* Smooth Animated Inline Header Quick Search */}
            <HeaderQuickSearch isLightMode={isLightMode} />

            {/* AZ / AZN Selector */}
            <div className="hidden sm:block">
              <UnifiedLocaleDropdown
                direction="down"
                align="right"
                variant={isLightMode ? "light" : "dark"}
                buttonClassName="h-9 sm:h-10 xl:h-11 px-2.5 sm:px-3 xl:px-3.5 text-xs xl:text-sm"
              />
            </div>

            {/* Cart Button */}
            <button
              type="button"
              onClick={openCart}
              className={`relative h-9 sm:h-10 xl:h-11 px-2.5 sm:px-3.5 xl:px-4 rounded-full border transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer shadow-sm active:scale-95 shrink-0 ${
                isLightMode
                  ? "bg-stone-900 text-white hover:bg-black border-stone-900"
                  : "bg-white text-black hover:bg-white/90 border-white"
              }`}
              aria-label={`Səbət (${totalCount})`}
            >
              <ShoppingBag size={15} className={isLightMode ? "text-white" : "text-[#2E1A22]"} />
              <span className="hidden sm:inline text-xs font-semibold">Səbət</span>
              {totalCount > 0 && (
                <span
                  className={`min-w-[17px] h-[17px] px-1 rounded-full text-white text-[9.5px] font-bold flex items-center justify-center ${
                    isLightMode ? "bg-[#B08D57]" : "bg-[#B08D57]"
                  }`}
                >
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </header>
      </div>

      {/* Responsive Mobile Drawer in Light Luxury Aesthetic with Staggered Cascading Animation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Sidebar Drawer - Light Luxury Atelier Theme */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              className="fixed inset-y-0 left-0 w-[84%] max-w-sm bg-[#FAF7F2] text-[#1A1517] h-[100dvh] z-10 flex flex-col justify-between shadow-2xl border-r border-[#E8E2D8]"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-[#E8E2D8] flex items-center justify-between bg-white/80 backdrop-blur-sm">
                <div onClick={() => setMobileMenuOpen(false)}>
                  <Logo theme="light" />
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full bg-[#EFEAE1] text-[#1A1517] hover:bg-[#E5DFD5] transition cursor-pointer"
                  aria-label="Bağla"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Links with Staggered Cascading Entrance */}
              <div className="flex-1 p-4 sm:p-5 space-y-4 overflow-y-auto">
                {/* Search trigger inside mobile menu */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/collections");
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-full bg-white border border-[#E5DFD5] text-[#5C5247] text-xs font-medium hover:border-[#B08D57] transition cursor-pointer shadow-2xs"
                >
                  <span className="flex items-center gap-2">
                    <Search size={14} className="text-[#B08D57]" />
                    <span>Axtarış...</span>
                  </span>
                  <span className="text-[10px] bg-[#F3EFE8] border border-[#E5DFD5] px-2 py-0.5 rounded font-mono text-[#5C5247]">
                    ⌘K
                  </span>
                </button>

                <div className="pt-2">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#9A7B4F] px-1 pb-2">
                    Kolleksiyalar
                  </div>

                  {/* Staggered cascading container */}
                  <motion.div
                    className="space-y-1.5"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: 0.08,
                        },
                      },
                    }}
                    initial="hidden"
                    animate="visible"
                  >
                    {navLinks.map((link) => {
                      const active = isLinkActive(link.categoryId, link.href);
                      return (
                        <motion.div
                          key={link.label}
                          variants={{
                            hidden: { opacity: 0, x: -18 },
                            visible: {
                              opacity: 1,
                              x: 0,
                              transition: { type: "spring", stiffness: 300, damping: 25 },
                            },
                          }}
                        >
                          <Link
                            href={link.href}
                            prefetch={true}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center justify-between px-4 py-3 rounded-full text-sm font-medium transition ${
                              active
                                ? "bg-[#1A1517] text-white font-semibold shadow-md"
                                : "text-[#4A4036] hover:bg-[#EFEAE1] hover:text-[#1A1517]"
                            }`}
                          >
                            <span>{link.label}</span>
                            {active ? (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#E6C280]" />
                            ) : (
                              <ChevronRight size={14} className="opacity-40" />
                            )}
                          </Link>
                        </motion.div>
                      );
                    })}

                    {/* 3D Studio in mobile with cascading animation */}
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, x: -18 },
                        visible: {
                          opacity: 1,
                          x: 0,
                          transition: { type: "spring", stiffness: 300, damping: 25 },
                        },
                      }}
                    >
                      <Link
                        href="/studio"
                        prefetch={true}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-4 py-3 rounded-full text-sm font-medium transition mt-2 ${
                          isStudioActive
                            ? "bg-[#1A1517] text-white font-semibold shadow-md"
                            : "bg-white text-[#1A1517] border border-[#E5DFD5] hover:border-[#B08D57] shadow-2xs"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Box size={16} className={isStudioActive ? "text-[#E6C280]" : "text-[#B08D57]"} />
                          <span>3D Fərdi Studiya</span>
                        </span>
                        <ChevronRight size={14} className="opacity-40" />
                      </Link>
                    </motion.div>
                  </motion.div>
                </div>
              </div>

              {/* Bottom: Locale Dropdown */}
              <div className="p-4 sm:p-5 border-t border-[#E8E2D8] bg-[#F5EFE6]">
                <div className="flex items-center justify-between text-xs font-medium text-[#5C5247]">
                  <span>Dil və Valyuta:</span>
                  <UnifiedLocaleDropdown direction="up" align="right" variant="light" />
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
