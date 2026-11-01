"use client";

import React, { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, Check, AlertCircle } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { playPurchaseSuccessSound } from "@/lib/soundEffects";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order") || searchParams.get("orderId") || `VTX-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const method = searchParams.get("method") || "card";
  const total = Number(searchParams.get("total")) || 0;
  const isTest = searchParams.get("test") === "true";
  const { formatPrice } = useCurrency();
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    try {
      playPurchaseSuccessSound();
    } catch (e) {}

    if (typeof window !== "undefined" && orderId) {
      try {
        const raw = localStorage.getItem("horvvalle_saved_orders");
        const list = raw ? JSON.parse(raw) : [];
        const existingIdx = list.findIndex((item: any) => item.id === orderId);
        if (existingIdx === -1) {
          list.unshift({
            id: orderId,
            date: new Date().toISOString(),
            total,
            method,
            isTest,
          });
          localStorage.setItem("horvvalle_saved_orders", JSON.stringify(list.slice(0, 10)));
        }
      } catch (e) {}
    }
  }, [orderId, total, method, isTest]);

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
        return " Apple Pay";
      case "google_pay":
        return "Google Pay";
      case "cash_on_delivery":
      case "cod":
        return "Çatdırılmada Ödəniş (Qapıda Nağd/Kart)";
      default:
        return "Bank Kartı (Visa/Mastercard)";
    }
  };

  const whatsappMessage = encodeURIComponent(
    `HORVVALLE Sifariş İzləmə Məlumatım:\nSifariş Nömrəsi: ${orderId}\nMəbləğ: ${total ? formatPrice(total) : "Ödənilib"}\nİzləmə linki: https://horvvalle.com/track?orderId=${orderId}`
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center space-y-8 text-stone-900">
      {/* Animated Success Badge */}
      <div className="w-20 h-20 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-900 mx-auto shadow-sm">
        <CheckCircle2 size={40} />
      </div>

      <div className="space-y-3">
        {isTest ? (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold uppercase tracking-wider border border-amber-200">
            <AlertCircle size={14} className="text-amber-700" />
            <span>TEST REJİMİ — Real Ödəniş Çəkilməyib</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-semibold uppercase tracking-wider border border-stone-200">
            <Check size={14} />
            <span>Sifarişiniz Təsdiqləndi</span>
          </div>
        )}
        <h1 className="font-eb-garamond text-3xl sm:text-5xl font-normal text-stone-900 tracking-wide">
          Təşəkkür <span className="italic font-normal">edirik!</span>
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
          {method === "cash_on_delivery" || method === "cod"
            ? "Sifarişiniz qeydə alındı. Məhsul çatdırılan zaman kuryerə nağd və ya kartla ödəniş edə bilərsiniz."
            : "Ödəniş uğurla qəbul edildi. Sifarişiniz atelyedə qablaşdırılmaya göndərildi və kuryerimiz 1-2 iş günü ərzində sizinlə əlaqə saxlayacaq."}
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
              <span className="text-stone-500">Məbləğ:</span>
              <span className="font-bold text-stone-900">{formatPrice(total)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-stone-500">Təxmini Çatdırılma:</span>
            <span className="font-semibold text-stone-900">1 - 2 iş günü ərzində</span>
          </div>
        </div>

        {/* WhatsApp Bookmark Option */}
        <div className="pt-2 flex flex-col gap-2">
          <a
            href={`https://wa.me/?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-100 transition shadow-2xs"
          >
            <span>WhatsApp-da Saxla</span>
          </a>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          href={`/track?orderId=${orderId}`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-stone-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-black transition shadow-sm active:scale-98"
        >
          <span>Sifarişimi Canlı İzlə</span>
          <ArrowRight size={14} />
        </Link>
        <Link
          href="/collections"
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-white border border-stone-200 text-stone-800 font-semibold text-xs uppercase tracking-wider hover:bg-stone-50 transition active:scale-98"
        >
          <span>Alış-verişə Davam Et</span>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center">Yüklənir...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
