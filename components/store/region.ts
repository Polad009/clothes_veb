"use client";

import { useMemo } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";
import { useStoreData } from "@/context/StoreDataContext";
import { resolveShippingRates } from "@/lib/shipping";
import { tr } from "@/components/store/i18n";

/**
 * Delivery wording for the visitor's region. Visitors outside Azerbaijan see worldwide
 * shipping (prices from Admin → Tənzimləmələr → Çatdırılma) instead of Baku courier copy.
 */
export function useRegionCopy() {
  const { isAzerbaijan, currency } = useCurrency();
  const { language } = useLanguage();
  const { settings } = useStoreData();

  return useMemo(() => {
    const rates = resolveShippingRates((settings as any)?.shipping);
    const usd = currency === "USD";
    const intl = usd ? `$${rates.intlStandardUSD}` : `${rates.intlStandardAZN} ₼`;
    const abroad = !isAzerbaijan;

    const strip = abroad
      ? tr(language, {
          az: `Bütün dünyaya çatdırılma · ${intl}-dan`,
          en: `Worldwide shipping from ${intl}`,
          ru: `Доставка по всему миру от ${intl}`,
          tr: `Dünyanın her yerine kargo · ${intl}'dan`,
        })
      : tr(language, {
          az: "Bakı və Sumqayıta çatdırılma pulsuzdur",
          en: "Free delivery in Baku & Sumgayit",
          ru: "Бесплатная доставка по Баку и Сумгаиту",
          tr: "Bakü ve Sumgayıt'a ücretsiz teslimat",
        });

    const heroText = abroad
      ? tr(language, {
          az: "Qalın pambıq, dəqiq kəsim, gündəlik geyim. Bakıdan bütün dünyaya göndəririk.",
          en: "Heavy cotton, precise cuts, everyday wear. Shipped from Baku to anywhere in the world.",
          ru: "Плотный хлопок, точный крой, на каждый день. Отправляем из Баку по всему миру.",
          tr: "Kalın pamuk, net kesim, günlük giyim. Bakü'den dünyanın her yerine gönderiyoruz.",
        })
      : tr(language, {
          az: "Qalın pambıq, dəqiq kəsim, gündəlik geyim. Bakı və Sumqayıtda 1–2 günə çatdırılma.",
          en: "Heavy cotton, precise cuts, everyday wear. 1–2 day delivery in Baku and Sumgayit.",
          ru: "Плотный хлопок, точный крой, на каждый день. Доставка по Баку и Сумгаиту за 1–2 дня.",
          tr: "Kalın pamuk, net kesim, günlük giyim. Bakü ve Sumgayıt'a 1–2 günde teslimat.",
        });

    const delivery = abroad
      ? tr(language, {
          az: `Beynəlxalq çatdırılma: standart 7–14 iş günü (${intl}), ekspress 2–5 iş günü. Sifariş izləmə nömrəsi ilə göndərilir.`,
          en: `International shipping: standard 7–14 business days (${intl}), express 2–5 business days. Every parcel is tracked.`,
          ru: `Международная доставка: стандартная 7–14 рабочих дней (${intl}), экспресс 2–5 дней. Каждая посылка с трек-номером.`,
          tr: `Uluslararası kargo: standart 7–14 iş günü (${intl}), ekspres 2–5 iş günü. Her paket takip numaralıdır.`,
        })
      : tr(language, {
          az: "Bakı və Sumqayıtda 1–2 iş günü, rayonlara 2–4 iş günü.",
          en: "1–2 business days in Baku and Sumgayit, 2–4 days to the regions.",
          ru: "1–2 рабочих дня по Баку и Сумгаиту, 2–4 дня в регионы.",
          tr: "Bakü ve Sumgayıt'ta 1–2 iş günü, bölgelere 2–4 gün.",
        });

    return { abroad, strip, heroText, delivery };
  }, [isAzerbaijan, currency, language, settings]);
}
