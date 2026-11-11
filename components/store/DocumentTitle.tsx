"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useStoreData } from "@/context/StoreDataContext";
import { tr, type Phrase } from "@/components/store/i18n";

// Search engines read the Azerbaijani titles from the server; visitors see the tab title
// in the language they chose.
const TITLES: Array<[RegExp, Phrase]> = [
  [/^\/$/, { az: "Premium Geyim Mağazası", en: "Premium Clothing Store", ru: "Магазин премиальной одежды", tr: "Premium Giyim Mağazası" }],
  [/^\/collections/, { az: "Kolleksiyalar", en: "Collections", ru: "Коллекции", tr: "Koleksiyonlar" }],
  [/^\/studio/, { az: "3D Dizayn Studiyası", en: "3D Design Studio", ru: "3D дизайн-студия", tr: "3D Tasarım Stüdyosu" }],
  [/^\/checkout\/success/, { az: "Sifariş qəbul olundu", en: "Order placed", ru: "Заказ оформлен", tr: "Sipariş alındı" }],
  [/^\/checkout\/failed/, { az: "Ödəniş alınmadı", en: "Payment failed", ru: "Оплата не прошла", tr: "Ödeme başarısız" }],
  [/^\/checkout/, { az: "Sifarişi rəsmiləşdir", en: "Checkout", ru: "Оформление заказа", tr: "Ödeme" }],
  [/^\/track/, { az: "Sifarişi izlə", en: "Track order", ru: "Отследить заказ", tr: "Sipariş takibi" }],
  [/^\/account/, { az: "Hesabım", en: "My account", ru: "Мой аккаунт", tr: "Hesabım" }],
  [/^\/terms/, { az: "İstifadə şərtləri", en: "Terms of Sale", ru: "Условия продажи", tr: "Satış koşulları" }],
  [/^\/privacy/, { az: "Məxfilik siyasəti", en: "Privacy Policy", ru: "Политика конфиденциальности", tr: "Gizlilik politikası" }],
];

export function DocumentTitle() {
  const pathname = usePathname() || "/";
  const { language } = useLanguage();
  const { products } = useStoreData();

  useEffect(() => {
    let title: string | null = null;
    const product = /^\/products\/([^/]+)/.exec(pathname);
    if (product) {
      let slug = product[1];
      try {
        slug = decodeURIComponent(slug);
      } catch {}
      const p = products.find((x: any) => x.slug === slug || x.id === slug);
      if (p) title = p.name;
    } else {
      const hit = TITLES.find(([re]) => re.test(pathname));
      if (hit) title = tr(language, hit[1]);
    }
    if (!title) return;
    const full = pathname === "/" ? `Horwalle — ${title}` : `${title} | Horwalle`;
    // Next sets the server title after navigation; set ours right after it
    const apply = () => {
      if (document.title !== full) document.title = full;
    };
    apply();
    const timers = [setTimeout(apply, 50), setTimeout(apply, 400)];
    return () => timers.forEach(clearTimeout);
  }, [pathname, language, products]);

  return null;
}
