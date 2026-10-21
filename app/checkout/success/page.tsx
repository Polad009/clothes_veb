"use client";

import React, { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, Check } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { playPurchaseSuccessSound } from "@/lib/soundEffects";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || `NV-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const method = searchParams.get("method") || "card";
  const total = Number(searchParams.get("total")) || 0;
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    try {
      playPurchaseSuccessSound();
    } catch (e) {}

    // Automatically persist recent order to localStorage for instant 1-click recovery
    if (typeof window !== "undefined" && orderId) {
      try {
        const raw = localStorage.getItem("horvvalle_saved_orders") || localStorage.getItem("novaco_saved_orders");
        const list = raw ? JSON.parse(raw) : [];
        const filtered = list.filter((item: any) => item.id !== orderId);
        filtered.unshift({
          id: orderId,
          date: new Date().toISOString(),
          total,
          method,
        });
        localStorage.setItem("horvvalle_saved_orders", JSON.stringify(filtered.slice(0, 5)));
      } catch (e) {}
    }
  }, [orderId, total, method]);

  const handleCopyCode = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const getMethodTitle = (m: string) => {
    switch (m) {
      case "apple_pay":
        return " Apple Pay ilə uğurla ödənildi";
      case "google_pay":
        return "Google Pay ilə uğurla ödənildi";
      default:
        return "Bank Kartı ilə uğurla ödənildi";
    }
  };

  const whatsappMessage = encodeURIComponent(
    `HORVVALLE Sifariş İzləmə Məlumatım:\nSifariş Nömrəsi: ${orderId}\nMəbləğ: ${total ? `${total} ₼` : "Ödənilib"}\nİzləmə linki: https://horvvalle.com/track?orderId=${orderId}`
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center space-y-8 text-stone-900">
      {/* Animated Success Badge */}
      <div className="w-20 h-20 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-900 mx-auto shadow-sm">
        <CheckCircle2 size={40} />
      </div>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-semibold uppercase tracking-wider border border-stone-200">
          <Check size={14} />
          <span>Sifarişiniz Təsdiqləndi</span>
        </div>
        <h1 className="font-eb-garamond text-3xl sm:text-5xl font-normal text-stone-900 tracking-wide">
          Təşəkkür <span className="italic font-normal">edirik!</span>
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
          Ödəniş uğurla qəbul edildi. Sifarişiniz atelyedə qablaşdırılmaya göndərildi və kuryerimiz 1-2 iş günü ərzində sizinlə əlaqə saxlayacaq.
        </p>
      </div>

      {/* Order Tracking Progress Bar & Code Card */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 text-left space-y-4 max-w-lg mx-auto shadow-sm">
        <div className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
          SİFARİŞ STATUSU:
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold uppercase">
          <div className="space-y-1.5">
            <div className="w-full h-1.5 bg-stone-900 rounded-full" />
            <span className="text-stone-900 font-bold">1. Qəbul Edildi</span>
          </div>
          <div className="space-y-1.5">
            <div className="w-full h-1.5 bg-stone-200 rounded-full" />
            <span className="text-stone-400">2. Qablaşdırma</span>
          </div>
          <div className="space-y-1.5">
            <div className="w-full h-1.5 bg-stone-200 rounded-full" />
            <span className="text-stone-400">3. Kuryerdə</span>
          </div>
        </div>

        <div className="pt-3 border-t border-stone-100 space-y-2.5 text-xs">
          <div className="flex justify-between items-center py-1 bg-stone-50/80 px-3 rounded-xl border border-stone-100">
            <div>
              <span className="text-stone-500 block text-[10px] uppercase font-semibold">Sifariş Nömrəsi (İzləmə Kodu):</span>
              <span className="font-mono font-bold text-sm text-stone-900">{orderId}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-stone-800 border border-stone-200 hover:bg-stone-100"
              }`}
            >
              {copied ? (
                <>
                  <Check size={13} />
                  <span>Kopyalandı!</span>
                </>
              ) : (
                <span>Kodu Kopyala</span>
              )}
            </button>
          </div>

          <div className="flex justify-between">
            <span className="text-stone-500">Ödəniş Metodu:</span>
            <span className="font-semibold text-stone-800">{getMethodTitle(method)}</span>
          </div>
          {total > 0 && (
            <div className="flex justify-between">
              <span className="text-stone-500">Ödənilən Məbləğ:</span>
              <span className="font-bold text-stone-900">{formatPrice(total)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-stone-500">Təxmini Çatdırılma:</span>
            <span className="font-semibold text-stone-900">1 - 2 iş günü ərzində</span>
          </div>
        </div>

        {/* WhatsApp Bookmark Option */}
        <div className="pt-2">
          <a
            href={`https://wa.me/?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <span>💬 Kodu WhatsApp ilə özünüzə göndərin</span>
          </a>
        </div>
      </div>

      {/* Safety Reassurance for Lost Tracking Code */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-left max-w-lg mx-auto text-xs space-y-1 text-amber-900">
        <div className="font-bold flex items-center gap-1.5 text-amber-950">
          <span>🛡️ İzləmə kodunu qeyd etmək yaddan çıxsa nə etməli?</span>
        </div>
        <p className="text-amber-800/90 leading-relaxed text-[11px]">
          Narahat olmayın! İzləmə kodunu itirsəniz belə, <strong>«Sifarişi İzlə»</strong> səhifəsində sadəcə sifariş zamanı daxil etdiyiniz <strong>telefon nömrənizi</strong> və ya <strong>e-poçt ünvanınızı</strong> yazaraq sifarişinizi istənilən vaxt dərhal bərpa edib canlı izləyə bilərsiniz.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          href={`/track?orderId=${encodeURIComponent(orderId)}`}
          className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98"
        >
          <span>📦 Sifarişinizi Canlı İzləyin</span>
          <ArrowRight size={14} />
        </Link>
        <Link
          href="/collections"
          className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-stone-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-black transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98"
        >
          <span>Alış-verişə Davam Et</span>
        </Link>
        <Link
          href="/"
          className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white border border-stone-200 text-stone-700 font-bold text-xs uppercase tracking-wider hover:border-stone-400 hover:text-stone-900 transition-all text-center"
        >
          Ana Səhifəyə Qayıt
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-stone-400 text-sm">Yüklənir...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
