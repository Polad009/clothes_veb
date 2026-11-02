"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, ShieldCheck, Truck, RotateCcw, Award } from "lucide-react";
import { PaymentLogosRow } from "@/components/PaymentLogos";
import Logo from "@/components/Logo";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail("");
        setSubscribed(false);
      }, 4000);
    }
  };

  return (
    <footer className="bg-stone-950 border-t border-stone-800 text-stone-300 relative z-20">
      {/* 4 Feature Badges Bar */}
      <div className="border-b border-stone-800 bg-stone-900/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 text-[#E6C280] shrink-0 shadow-sm">
              <Truck size={19} className="text-[#E6C280]" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                {t.footer.fastDelivery}
              </p>
              <p className="text-[11px] text-stone-300">{t.footer.fastDeliverySub}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 text-[#E6C280] shrink-0 shadow-sm">
              <RotateCcw size={19} className="text-[#E6C280]" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                {t.footer.return14Days}
              </p>
              <p className="text-[11px] text-stone-300">{t.footer.return14DaysSub}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 text-[#E6C280] shrink-0 shadow-sm">
              <ShieldCheck size={19} className="text-[#E6C280]" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                {t.footer.securePayment}
              </p>
              <p className="text-[11px] text-stone-300">{t.footer.securePaymentSub}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 text-[#E6C280] shrink-0 shadow-sm">
              <Award size={19} className="text-[#E6C280]" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                {t.footer.naturalMaterials}
              </p>
              <p className="text-[11px] text-stone-300">{t.footer.naturalMaterialsSub}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand info & Newsletter */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center">
              <Logo theme="dark" />
            </div>
            <p className="text-xs text-white/70 max-w-sm leading-relaxed">
              {t.footer.brandDesc}
            </p>

            {/* Newsletter form */}
            <div className="pt-2">
              <span className="text-xs font-bold text-[#E6C280] uppercase tracking-wider block mb-2">
                {t.footer.newsletterTitle}
              </span>
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  placeholder={t.footer.newsletterPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-black/40 border border-white/20 rounded-full px-4 py-2.5 text-xs text-white placeholder-white/40 flex-1 focus:outline-none focus:border-[#E6C280]"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-white text-black font-semibold text-xs uppercase hover:bg-white/90 transition shrink-0 flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                >
                  {subscribed ? <Check size={14} className="text-black" /> : <span>{t.footer.joinBtn}</span>}
                </button>
              </form>
              {subscribed && (
                <span className="text-[11px] text-[#E6C280] font-semibold mt-1.5 block">
                  ✓ {language === "az" ? "Abunəliyiniz təsdiqləndi! Xoş gəldiniz kuponunuz göndərildi." : language === "ru" ? "Подписка подтверждена! Купон отправлен." : language === "tr" ? "Aboneliğiniz onaylandı! Hoş geldiniz kuponunuz gönderildi." : "Subscription confirmed! Welcome coupon sent."}
                </span>
              )}
            </div>

            {/* Direct Support & WhatsApp */}
            <div className="pt-2">
              <a
                href="https://wa.me/994557669050"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-emerald-950/40 border border-white/10 hover:border-emerald-500/40 text-stone-300 hover:text-white transition group"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[11px]">
                  WhatsApp VIP: <strong className="text-emerald-400 font-mono tracking-wider">+994 55-766-90-50</strong>
                </span>
              </a>
            </div>
          </div>

          {/* Column 1: Köynəklər */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-[#E6C280] uppercase tracking-wider">
              {t.home.shirtsCategory}
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/collections?category=koynek" className="text-stone-300 hover:text-white transition">
                  Vintage Heavyweight T-Shirt
                </Link>
              </li>
              <li>
                <Link href="/collections?category=koynek" className="text-stone-300 hover:text-white transition">
                  Klassik Oxford Köynək
                </Link>
              </li>
              <li>
                <Link href="/collections?category=koynek" className="text-stone-300 hover:text-white transition">
                  Təbii Kətan Yay Köynəyi
                </Link>
              </li>
              <li>
                <Link href="/collections?category=koynek" className="text-stone-300 hover:text-white transition">
                  Təməl Pambıq T-Shirt
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Şalvarlar */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-[#E6C280] uppercase tracking-wider">
              {t.home.pantsCategory}
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/collections?category=salvar" className="text-stone-300 hover:text-white transition">
                  Slim Chino Şalvarlar
                </Link>
              </li>
              <li>
                <Link href="/collections?category=salvar" className="text-stone-300 hover:text-white transition">
                  Düz Kəsim Cins Şalvarlar
                </Link>
              </li>
              <li>
                <Link href="/collections?category=salvar" className="text-stone-300 hover:text-white transition">
                  Klassik Ofis Şalvarları
                </Link>
              </li>
              <li>
                <Link href="/collections?category=salvar" className="text-stone-300 hover:text-white transition">
                  Gündəlik Kargo Şalvar
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Hudi, Aksesuar & Studio */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-[#E6C280] uppercase tracking-wider">
              {t.home.hoodiesCategory} & {t.home.accessoriesCategory}
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/collections?category=hudi" className="text-stone-300 hover:text-white transition">
                  {language === "en" ? "Heavyweight Hoodie (3-Thread)" : language === "ru" ? "Плотное худи (3-нитка)" : language === "tr" ? "Kalın Hudi (3 İplik)" : "Hody qalın (3iplik)"}
                </Link>
              </li>
              <li>
                <Link href="/collections?category=aksesuar" className="text-stone-300 hover:text-white transition">
                  {language === "en" ? "Heavyweight Snapback Cap" : language === "ru" ? "Плотная кепка" : language === "tr" ? "Kalın Şapka" : "Kepka - qalın"}
                </Link>
              </li>
              <li>
                <Link href="/collections?category=aksesuar" className="text-stone-300 hover:text-white transition">
                  {language === "en" ? "Canvas Eco Tote Bag" : language === "ru" ? "Хлопковый эко-шоппер" : language === "tr" ? "Keten Eko Çanta" : "Kətan Eko Çanta"}
                </Link>
              </li>
              <li>
                <Link href="/studio" className="text-[#E6C280] font-bold hover:text-white transition flex items-center gap-1">
                  <span>{t.nav.studio}</span>
                </Link>
              </li>
              <li className="pt-1">
                <Link href="/track" className="text-white hover:text-[#E6C280] font-bold transition flex items-center gap-1.5">
                  <span className="text-[#E6C280]">📦</span>
                  <span>{t.nav.track}</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row: Payment methods & Copyright */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1">
            <span>© {new Date().getFullYear()} HORVVALLE ATELIER. {t.footer.rights}</span>
            <span className="hidden sm:inline text-white/20">•</span>
            <Link href="/privacy" className="hover:text-[#E6C280] transition underline-offset-4 hover:underline">
              {language === "en" ? "Privacy Policy" : language === "ru" ? "Политика конфиденциальности" : language === "tr" ? "Gizlilik Politikası" : "Məxfilik Siyasəti"}
            </Link>
            <span className="hidden sm:inline text-white/20">•</span>
            <Link href="/terms" className="hover:text-[#E6C280] transition underline-offset-4 hover:underline">
              {language === "en" ? "Terms & Conditions" : language === "ru" ? "Условия использования" : language === "tr" ? "Kullanım Şartları" : "İstifadə Şərtləri"}
            </Link>
          </div>

          {/* Official Payment Icons */}
          <div className="flex items-center gap-2">
            <PaymentLogosRow size="sm" />
          </div>
        </div>
      </div>
    </footer>
  );
}
