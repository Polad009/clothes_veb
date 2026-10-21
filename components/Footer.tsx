"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, ShieldCheck, Truck, RotateCcw, Award } from "lucide-react";
import { PaymentLogosRow } from "@/components/PaymentLogos";
import Logo from "@/components/Logo";

export function Footer() {
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
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Sürətli Çatdırılma
              </h4>
              <p className="text-[11px] text-white/60">60 ₼-dən yuxarı pulsuz</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 text-[#E6C280] shrink-0 shadow-sm">
              <RotateCcw size={19} className="text-[#E6C280]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                14 Günlük Qaytarılma
              </h4>
              <p className="text-[11px] text-white/60">Asan və zəmanətli dəyişmə</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 text-[#E6C280] shrink-0 shadow-sm">
              <ShieldCheck size={19} className="text-[#E6C280]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Təhlükəsiz Ödəniş
              </h4>
              <p className="text-[11px] text-white/60">Apple Pay, Google Pay, Kart</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 text-[#E6C280] shrink-0 shadow-sm">
              <Award size={19} className="text-[#E6C280]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Təbii Materiallar
              </h4>
              <p className="text-[11px] text-white/60">100% kətan, pambıq və bambuk</p>
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
              Lüks geyim və fərdi sənət evi. Yüksək keyfiyyətli premium köynəklər, 3iplik isti hudilər, zərif kəsimli şalvarlar və qabaqcıl 3D fərdi dizayn atelyesi.
            </p>

            {/* Newsletter form */}
            <div className="pt-2">
              <span className="text-xs font-bold text-[#E6C280] uppercase tracking-wider block mb-2">
                YENİ ENDİRİMLƏRƏ İLK SƏN QOŞUL
              </span>
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  placeholder="E-poçt ünvanınızı daxil edin"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-black/40 border border-white/20 rounded-full px-4 py-2.5 text-xs text-white placeholder-white/40 flex-1 focus:outline-none focus:border-[#E6C280]"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-white text-black font-semibold text-xs uppercase hover:bg-white/90 transition shrink-0 flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                >
                  {subscribed ? <Check size={14} className="text-black" /> : <span>Qoşul</span>}
                </button>
              </form>
              {subscribed && (
                <span className="text-[11px] text-[#E6C280] font-semibold mt-1.5 block">
                  ✓ Abunəliyiniz təsdiqləndi! Xoş gəldiniz kuponunuz göndərildi.
                </span>
              )}
            </div>
          </div>

          {/* Column 1: Köynəklər */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-[#E6C280] uppercase tracking-wider">
              T-SHİRT & KÖYNƏK
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/collections?category=koynek" className="text-white/70 hover:text-white transition">
                  Vintage Heavyweight T-Shirt
                </Link>
              </li>
              <li>
                <Link href="/collections?category=koynek" className="text-white/70 hover:text-white transition">
                  Klassik Oxford Köynək
                </Link>
              </li>
              <li>
                <Link href="/collections?category=koynek" className="text-white/70 hover:text-white transition">
                  Təbii Kətan Yay Köynəyi
                </Link>
              </li>
              <li>
                <Link href="/collections?category=koynek" className="text-white/70 hover:text-white transition">
                  Təməl Pambıq T-Shirt
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Şalvarlar */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-[#E6C280] uppercase tracking-wider">
              ŞALVAR & ŞORTİK
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/collections?category=salvar" className="text-white/70 hover:text-white transition">
                  Slim Chino Şalvarlar
                </Link>
              </li>
              <li>
                <Link href="/collections?category=salvar" className="text-white/70 hover:text-white transition">
                  Düz Kəsim Cins Şalvarlar
                </Link>
              </li>
              <li>
                <Link href="/collections?category=salvar" className="text-white/70 hover:text-white transition">
                  Klassik Ofis Şalvarları
                </Link>
              </li>
              <li>
                <Link href="/collections?category=salvar" className="text-white/70 hover:text-white transition">
                  Gündəlik Kargo Şalvar
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Hudi, Aksesuar & Studio */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-[#E6C280] uppercase tracking-wider">
              HUDİ, AKSESUAR & ÇAP
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/collections?category=hudi" className="text-white/70 hover:text-white transition">
                  Heavyweight 3iplik Hudi
                </Link>
              </li>
              <li>
                <Link href="/collections?category=aksesuar" className="text-white/70 hover:text-white transition">
                  Snapback Qalın Kepka
                </Link>
              </li>
              <li>
                <Link href="/collections?category=aksesuar" className="text-white/70 hover:text-white transition">
                  Kətan Eko Çanta
                </Link>
              </li>
              <li>
                <Link href="/studio" className="text-[#E6C280] font-bold hover:text-white transition flex items-center gap-1">
                  <span>3D Fərdi Çap Atelyesi</span>
                </Link>
              </li>
              <li className="pt-1">
                <Link href="/track" className="text-white hover:text-[#E6C280] font-bold transition flex items-center gap-1.5">
                  <span className="text-[#E6C280]">📦</span>
                  <span>Sifarişini İzlə (Canlı)</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row: Payment methods & Copyright */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <div>
            © {new Date().getFullYear()} HORVVALLE ATELIER. Bütün hüquqlar qorunur.
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
