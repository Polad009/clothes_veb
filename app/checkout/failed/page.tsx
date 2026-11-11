"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { useSupport } from "@/context/StoreDataContext";
import { useLanguage } from "@/context/LanguageContext";
import { tr, type Phrase } from "@/components/store/i18n";

function FailedContent() {
  const support = useSupport();
  const params = useSearchParams();
  const { language } = useLanguage();
  const L = (p: Phrase) => tr(language, p);
  const orderId = params.get("orderId") || params.get("order");

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-24 pt-14 text-center font-grotesk text-bone sm:pt-20">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-sale text-sale">
        <X size={30} strokeWidth={3} />
      </div>
      <h1 className="mt-6 text-4xl font-black uppercase tracking-tight [font-stretch:112%] sm:text-5xl">
        {L({ az: "Ödəniş alınmadı", en: "Payment failed", ru: "Оплата не прошла", tr: "Ödeme başarısız" })}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-bone-dim">
        {L({
          az: "Kartınızdan pul çıxılmayıb. Yenidən cəhd edin və ya başqa kartla ödəyin.",
          en: "No money was taken from your card. Try again or use another card.",
          ru: "Деньги с карты не списаны. Попробуйте ещё раз или используйте другую карту.",
          tr: "Kartınızdan para çekilmedi. Tekrar deneyin veya başka bir kart kullanın.",
        })}
      </p>
      {orderId && (
        <p className="mt-6 text-[13px] text-bone-dim">
          {L({ az: "Sifariş nömrəsi", en: "Order number", ru: "Номер заказа", tr: "Sipariş numarası" })}: <span className="font-mono font-bold text-bone">{orderId}</span>
        </p>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/checkout" className="flex-1 rounded-full bg-bone px-6 py-4 text-[12px] font-extrabold uppercase tracking-[0.16em] text-ink hover:bg-white">
          {L({ az: "Yenidən cəhd et", en: "Try again", ru: "Повторить", tr: "Tekrar dene" })}
        </Link>
        <a
          href={support.link(L({ az: "Salam! Sifarişin ödənişində problem oldu.", en: "Hi! I had a problem paying for my order.", ru: "Здравствуйте! Возникла проблема с оплатой заказа.", tr: "Merhaba! Siparişimin ödemesinde sorun oldu." }) + (orderId ? ` (${orderId})` : ""))}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-full border border-white/25 px-6 py-4 text-[12px] font-extrabold uppercase tracking-[0.16em] hover:border-bone"
        >
          {L({ az: "WhatsApp-da yaz", en: "Message us on WhatsApp", ru: "Написать в WhatsApp", tr: "WhatsApp'tan yaz" })}
        </a>
      </div>
    </div>
  );
}

export default function CheckoutFailedPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh]" />}>
      <FailedContent />
    </Suspense>
  );
}
