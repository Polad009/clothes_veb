"use client";

import { useSupport } from "@/context/StoreDataContext";
import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, RefreshCw, MessageCircle } from "lucide-react";

function CheckoutFailedContent() {
  const support = useSupport();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order") || searchParams.get("orderId");
  const reason = searchParams.get("reason") || "Ödəniş provayderi tərəfindən əməliyyat təsdiqlənmədi.";

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center space-y-6 text-stone-900">
      <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto shadow-sm">
        <AlertTriangle size={36} />
      </div>

      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-[10px] font-bold uppercase tracking-wider border border-rose-200">
          Ödəniş Uğursuz Oldu
        </span>
        <h1 className="font-eb-garamond text-3xl sm:text-4xl font-normal text-stone-900">
          Ödəniş Tamamlanmadı
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
          {reason}
        </p>
      </div>

      {orderId && (
        <div className="p-4 rounded-2xl bg-white border border-stone-200 text-xs text-stone-600 max-w-sm mx-auto shadow-xs">
          <span>Sifariş Referansı: </span>
          <strong className="font-mono text-stone-900">#{orderId}</strong>
        </div>
      )}

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/checkout"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-stone-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-black transition shadow-sm active:scale-98"
        >
          <RefreshCw size={14} />
          <span>Yenidən Cəhd Et</span>
        </Link>
        <a
          href={support.link("Salam! Sifarişin ödənişində problem baş verdi")}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white border border-stone-300 text-stone-800 font-semibold text-xs uppercase tracking-wider hover:bg-stone-50 transition active:scale-98"
        >
          <MessageCircle size={15} className="text-emerald-600" />
          <span>WhatsApp Dəstək</span>
        </a>
      </div>
    </div>
  );
}

export default function CheckoutFailedPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center">Yüklənir...</div>}>
      <CheckoutFailedContent />
    </Suspense>
  );
}

