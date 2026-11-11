"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Copy } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { tr, type Phrase } from "@/components/store/i18n";
import { useRegionCopy } from "@/components/store/region";
import { playPurchaseSuccessSound } from "@/lib/soundEffects";

const METHOD: Record<string, Phrase> = {
  apple_pay: { az: "Apple Pay", en: "Apple Pay", ru: "Apple Pay", tr: "Apple Pay" },
  google_pay: { az: "Google Pay", en: "Google Pay", ru: "Google Pay", tr: "Google Pay" },
  cod: { az: "Çatdırılmada ödəniş", en: "Pay on delivery", ru: "Оплата при получении", tr: "Kapıda ödeme" },
  cash_on_delivery: { az: "Çatdırılmada ödəniş", en: "Pay on delivery", ru: "Оплата при получении", tr: "Kapıda ödeme" },
  card: { az: "Bank kartı", en: "Bank card", ru: "Банковская карта", tr: "Banka kartı" },
};

function SuccessContent() {
  const params = useSearchParams();
  const { language } = useLanguage();
  const region = useRegionCopy();
  const L = (p: Phrase) => tr(language, p);
  const orderId = params.get("orderId") || params.get("order") || "";
  const method = params.get("method") || "card";
  const total = Number(params.get("total")) || 0;
  const currency = params.get("currency") === "USD" ? "USD" : "AZN";
  const isTest = params.get("test") === "true";
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      playPurchaseSuccessSound();
    } catch {}
    if (!orderId) return;
    try {
      const list = JSON.parse(localStorage.getItem("horvvalle_saved_orders") || "[]");
      if (!list.some((o: any) => o.id === orderId)) {
        list.unshift({ id: orderId, date: new Date().toISOString(), total, method, isTest });
        localStorage.setItem("horvvalle_saved_orders", JSON.stringify(list.slice(0, 10)));
      }
    } catch {}
  }, [orderId, total, method, isTest]);

  const copy = () => {
    navigator.clipboard?.writeText(orderId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const amount = total ? (currency === "USD" ? `$${total.toFixed(2)}` : `${total.toFixed(2)} ₼`) : "";
  const cod = method === "cod" || method === "cash_on_delivery";

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-24 pt-14 font-grotesk text-bone sm:pt-20">
      {isTest && (
        <p className="mb-6 rounded-xl border border-white/15 bg-ink-850 px-4 py-3 text-center text-[12px] font-bold uppercase tracking-[0.14em] text-bone-dim">
          {L({ az: "Sınaq rejimi: real ödəniş çəkilməyib", en: "Test mode: no real payment was taken", ru: "Тестовый режим: оплата не списана", tr: "Test modu: gerçek ödeme alınmadı" })}
        </p>
      )}

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-bone text-ink">
        <Check size={30} strokeWidth={3} />
      </div>
      <h1 className="mt-6 text-center text-4xl font-black uppercase tracking-tight [font-stretch:112%] sm:text-5xl">
        {L({ az: "Təşəkkür edirik!", en: "Thank you!", ru: "Спасибо!", tr: "Teşekkürler!" })}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-center text-[14px] leading-relaxed text-bone-dim">
        {cod
          ? L({
              az: "Sifarişiniz qəbul olundu. Ödənişi məhsulu alanda kuryerə edə bilərsiniz.",
              en: "Your order is placed. You can pay the courier when it arrives.",
              ru: "Заказ оформлен. Оплатить можно курьеру при получении.",
              tr: "Siparişiniz alındı. Ödemeyi teslimatta kuryeye yapabilirsiniz.",
            })
          : L({
              az: "Ödəniş qəbul olundu və sifarişiniz hazırlanır. Göndəriləndə sizə xəbər verəcəyik.",
              en: "Payment received and your order is being prepared. We will let you know when it ships.",
              ru: "Оплата получена, заказ готовится. Мы сообщим, когда он будет отправлен.",
              tr: "Ödeme alındı, siparişiniz hazırlanıyor. Kargoya verildiğinde size haber vereceğiz.",
            })}
      </p>

      {orderId && (
        <div className="mt-8 rounded-2xl border border-white/10 bg-ink-850 p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-bone-faint">
            {L({ az: "Sifariş nömrəsi", en: "Order number", ru: "Номер заказа", tr: "Sipariş numarası" })}
          </p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="font-mono text-xl font-bold">{orderId}</span>
            <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] hover:border-bone">
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? L({ az: "Kopyalandı", en: "Copied", ru: "Скопировано", tr: "Kopyalandı" }) : L({ az: "Kopyala", en: "Copy", ru: "Копировать", tr: "Kopyala" })}
            </button>
          </div>
          <dl className="mt-5 space-y-2 border-t border-white/10 pt-4 text-[13px]">
            <div className="flex justify-between gap-3">
              <dt className="text-bone-dim">{L({ az: "Ödəniş üsulu", en: "Payment method", ru: "Способ оплаты", tr: "Ödeme yöntemi" })}</dt>
              <dd className="font-semibold">{L(METHOD[method] || METHOD.card)}</dd>
            </div>
            {amount && (
              <div className="flex justify-between gap-3">
                <dt className="text-bone-dim">{L({ az: "Məbləğ", en: "Total", ru: "Сумма", tr: "Tutar" })}</dt>
                <dd className="font-semibold tabular-nums">{amount}</dd>
              </div>
            )}
            <div className="flex justify-between gap-3">
              <dt className="shrink-0 text-bone-dim">{L({ az: "Çatdırılma", en: "Delivery", ru: "Доставка", tr: "Teslimat" })}</dt>
              <dd className="text-right font-semibold">{region.delivery}</dd>
            </div>
          </dl>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {orderId && (
          <Link href={`/track?orderId=${encodeURIComponent(orderId)}`} className="flex-1 rounded-full bg-bone px-6 py-4 text-center text-[12px] font-extrabold uppercase tracking-[0.16em] text-ink hover:bg-white">
            {L({ az: "Sifarişi izlə", en: "Track order", ru: "Отследить заказ", tr: "Siparişi takip et" })}
          </Link>
        )}
        <Link href="/collections" className="flex-1 rounded-full border border-white/25 px-6 py-4 text-center text-[12px] font-extrabold uppercase tracking-[0.16em] hover:border-bone">
          {L({ az: "Alış-verişə davam et", en: "Continue shopping", ru: "Продолжить покупки", tr: "Alışverişe devam et" })}
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh]" />}>
      <SuccessContent />
    </Suspense>
  );
}
