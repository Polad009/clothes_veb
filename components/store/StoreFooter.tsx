"use client";

import React from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { PaymentLogosRow } from "@/components/PaymentLogos";
import { StoreLocale } from "@/components/store/StoreLocale";
import { useCategories, useSupport } from "@/context/StoreDataContext";
import { useLanguage } from "@/context/LanguageContext";
import { categoryTitle } from "@/lib/categories";
import { T, tr } from "@/components/store/i18n";

const INSTAGRAM = "https://www.instagram.com/horwalle";
const TIKTOK = "https://www.tiktok.com/@horwalle";

export function StoreFooter() {
  const { language } = useLanguage();
  const categories = useCategories();
  const support = useSupport();

  const heading = "mb-4 text-[11px] font-extrabold uppercase tracking-[0.18em] text-bone [font-stretch:110%]";
  const link = "block py-1 text-[13px] text-bone-dim transition hover:text-bone";

  return (
    <footer className="mt-auto border-t border-white/10 bg-ink font-grotesk text-bone">
      <div className="mx-auto grid max-w-[1600px] grid-cols-2 gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-10">
        <div className="col-span-2 md:col-span-1">
          <Logo theme="dark" size="sm" />
          <p className="mt-5 max-w-xs text-[13px] leading-relaxed text-bone-dim">
            {tr(language, {
              az: "Bakıdan premium geyim. Qalın pambıq, dəqiq kəsim və istəsən öz dizaynın.",
              en: "Premium apparel from Baku. Heavy cotton, precise cuts and, if you like, your own design.",
              ru: "Премиальная одежда из Баку. Плотный хлопок, точный крой и, по желанию, ваш дизайн.",
              tr: "Bakü'den premium giyim. Kalın pamuk, net kesim ve dilersen kendi tasarımın.",
            })}
          </p>
          <div className="mt-6 flex gap-4 text-[12px] font-bold uppercase tracking-[0.14em]">
            <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="text-bone-dim hover:text-bone">Instagram</a>
            <a href={TIKTOK} target="_blank" rel="noopener noreferrer" className="text-bone-dim hover:text-bone">TikTok</a>
            <a href={support.link()} target="_blank" rel="noopener noreferrer" className="text-bone-dim hover:text-bone">WhatsApp</a>
          </div>
        </div>

        <div>
          <h4 className={heading}>{tr(language, { az: "Mağaza", en: "Shop", ru: "Магазин", tr: "Mağaza" })}</h4>
          <Link href="/collections" className={link}>{tr(language, T.allProducts)}</Link>
          {categories.map((c) => (
            <Link key={c.id} href={`/collections?category=${encodeURIComponent(c.id)}`} className={link}>
              {categoryTitle(c, language)}
            </Link>
          ))}
          <Link href="/studio" className={link}>{tr(language, T.studio)}</Link>
        </div>

        <div>
          <h4 className={heading}>{tr(language, { az: "Kömək", en: "Help", ru: "Помощь", tr: "Yardım" })}</h4>
          <Link href="/track" className={link}>{tr(language, T.trackOrder)}</Link>
          <a href={support.link()} target="_blank" rel="noopener noreferrer" className={link}>
            {tr(language, { az: "Bizimlə əlaqə", en: "Contact us", ru: "Связаться с нами", tr: "Bize ulaşın" })}
          </a>
          <Link href="/terms" className={link}>{tr(language, { az: "Qaytarılma və çatdırılma", en: "Returns & delivery", ru: "Возврат и доставка", tr: "İade ve teslimat" })}</Link>
          <Link href="/account" className={link}>{tr(language, T.account)}</Link>
        </div>

        <div>
          <h4 className={heading}>{tr(language, { az: "Hüquqi", en: "Legal", ru: "Правовое", tr: "Yasal" })}</h4>
          <Link href="/privacy" className={link}>{tr(language, { az: "Məxfilik siyasəti", en: "Privacy policy", ru: "Политика конфиденциальности", tr: "Gizlilik politikası" })}</Link>
          <Link href="/terms" className={link}>{tr(language, { az: "İstifadə şərtləri", en: "Terms of service", ru: "Условия использования", tr: "Kullanım şartları" })}</Link>
          <Link href="/third-party-notices" className={link}>{tr(language, { az: "Lisenziyalar", en: "Licenses", ru: "Лицензии", tr: "Lisanslar" })}</Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-10">
          <div className="flex items-center gap-4">
            <StoreLocale direction="up" align="left" />
            <span className="text-[11px] uppercase tracking-[0.14em] text-bone-faint">© {new Date().getFullYear()} HORWALLE</span>
          </div>
          <PaymentLogosRow size="sm" />
        </div>
      </div>
    </footer>
  );
}
