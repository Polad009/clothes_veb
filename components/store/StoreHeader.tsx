"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import Logo from "@/components/Logo";
import { StoreSearch } from "@/components/store/StoreSearch";
import { StoreLocale } from "@/components/store/StoreLocale";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useCategories, useStoreData } from "@/context/StoreDataContext";
import { categoryTitle } from "@/lib/categories";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { T, tr } from "@/components/store/i18n";
import { useRegionCopy } from "@/components/store/region";


/** One admin announcement at a time, centred, swapping every few seconds. */
function AnnouncementBar() {
  const { language } = useLanguage();
  const { content } = useStoreData();
  const region = useRegionCopy();
  const items = useMemo(() => {
    const source = language === "az" ? content?.announcements : content?.i18n?.[language]?.announcements;
    const list = Array.isArray(source) ? source.filter((a: unknown): a is string => typeof a === "string" && a.trim().length > 0) : [];
    // Visitors abroad always see the worldwide-shipping line first
    const base = list.length ? list : [region.strip];
    return region.abroad && list.length ? [region.strip, ...list] : base;
  }, [content, language, region]);
  const [i, setI] = useState(0);
  useEffect(() => {
    if (items.length < 2) return;
    const id = setInterval(() => setI((n) => (n + 1) % items.length), 4500);
    return () => clearInterval(id);
  }, [items.length]);

  return (
    <div className="relative z-50 h-9 overflow-hidden bg-bone text-ink">
      <p
        key={i % items.length}
        className="hw-rise block truncate px-4 text-center font-grotesk text-[10px] font-extrabold uppercase leading-9 tracking-[0.14em] [font-stretch:105%] sm:text-[11px] sm:tracking-[0.16em]"
      >
        {items[i % items.length]}
      </p>
    </div>
  );
}

export function StoreHeader() {
  const pathname = usePathname() || "/";
  const isHome = pathname === "/";
  const { language } = useLanguage();
  const categories = useCategories();
  const { totalCount, openCart } = useCart();
  const { user, openAuthModal } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  useBodyScrollLock(menuOpen);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setMenuOpen(false), [pathname]);
  // keeps uppercase text and screen readers right for the chosen language
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const nav = [
    { href: "/collections", label: tr(language, T.allProducts) },
    ...categories.filter((c) => c.showInMenu !== false).map((c) => ({ href: `/collections?category=${c.id}`, label: categoryTitle(c, language) })),
    { href: "/studio", label: tr(language, T.studio) },
  ];
  const solid = !isHome || scrolled || menuOpen;

  const iconBtn = "flex h-10 w-10 items-center justify-center text-bone transition hover:opacity-70";

  return (
    <>
      <AnnouncementBar />
      <header
        className={`sticky top-0 z-40 w-full font-grotesk text-bone transition-colors duration-300 ${
          solid ? "border-b border-white/10 bg-ink/95 backdrop-blur-md" : "border-b border-transparent bg-transparent"
        } ${isHome ? "-mb-16" : ""}`}
      >
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-10">
          <div className="flex flex-1 items-center xl:flex-none">
            <button type="button" className={`${iconBtn} -ml-2 xl:hidden`} onClick={() => setMenuOpen(true)} aria-label={tr(language, T.menu)}>
              <Menu size={20} strokeWidth={1.6} />
            </button>
            <Logo theme="dark" size="sm" className="hidden xl:inline-flex" />
          </div>

          <div className="flex justify-center xl:flex-1">
            <Logo theme="dark" size="sm" className="xl:hidden" />
            <nav className="hidden items-center gap-7 xl:flex">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  className="whitespace-nowrap text-[12px] font-bold uppercase tracking-[0.14em] text-bone/85 transition hover:text-bone [font-stretch:108%]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-1 items-center justify-end gap-0.5 xl:flex-none">
            <div className="hidden md:block">
              <StoreLocale align="right" />
            </div>
            <button type="button" className={iconBtn} onClick={() => setSearchOpen(true)} aria-label={tr(language, T.search)}>
              <Search size={19} strokeWidth={1.6} />
            </button>
            {user ? (
              <Link href="/account" className={`${iconBtn} hidden sm:flex`} aria-label={tr(language, T.account)}>
                <User size={19} strokeWidth={1.6} />
              </Link>
            ) : (
              <button type="button" className={`${iconBtn} hidden sm:flex`} onClick={openAuthModal} aria-label={tr(language, T.account)}>
                <User size={19} strokeWidth={1.6} />
              </button>
            )}
            <button type="button" className={`${iconBtn} relative -mr-2`} onClick={openCart} aria-label={tr(language, T.cart)}>
              <ShoppingBag size={19} strokeWidth={1.6} />
              {totalCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-bone px-1 text-[10px] font-bold text-ink">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            data-lenis-prevent
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex flex-col bg-ink font-grotesk text-bone"
          >
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
              <Logo theme="dark" size="sm" />
              <button type="button" className={iconBtn} onClick={() => setMenuOpen(false)} aria-label={tr(language, T.close)}>
                <X size={22} strokeWidth={1.6} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-4 py-6">
              {nav.map((item, idx) => (
                <motion.div key={item.href} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.03 * idx }}>
                  <Link
                    href={item.href}
                    className="block border-b border-white/10 py-4 text-3xl font-black uppercase tracking-tight [font-stretch:115%]"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <Link href="/track" className="mt-6 block text-sm font-semibold uppercase tracking-[0.14em] text-bone-dim">
                {tr(language, T.trackOrder)}
              </Link>
              {user ? (
                <Link href="/account" className="mt-3 block text-sm font-semibold uppercase tracking-[0.14em] text-bone-dim">
                  {tr(language, T.account)}
                </Link>
              ) : (
                <button type="button" onClick={() => { setMenuOpen(false); openAuthModal(); }} className="mt-3 block text-sm font-semibold uppercase tracking-[0.14em] text-bone-dim">
                  {tr(language, T.account)}
                </button>
              )}
            </nav>
            <div className="border-t border-white/10 px-4 py-4">
              <StoreLocale direction="up" align="left" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <StoreSearch isOpen={searchOpen} onClose={closeSearch} />
    </>
  );
}
