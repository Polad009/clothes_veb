// Small helpers for the storefront's built-in texts (admin-managed texts come from content/i18n).

export type Lang = "az" | "en" | "ru" | "tr";

export type Phrase = { az: string; en: string; ru: string; tr: string };

/** Picks the phrase for the visitor's language, falling back to Azerbaijani. */
export function tr(lang: string, phrase: Phrase): string {
  return (phrase as Record<string, string>)[lang] || phrase.az;
}

/** Admin text for a home section: Azerbaijani from the content itself, other languages from content.i18n. */
export function contentText(content: any, lang: string, section: string, field: string, fallback: Phrase): string {
  const az = content?.[section]?.[field];
  if (lang === "az") return (typeof az === "string" && az.trim()) || fallback.az;
  const translated = content?.i18n?.[lang]?.[section]?.[field];
  return (typeof translated === "string" && translated.trim()) || tr(lang, fallback);
}

export const T = {
  shopNow: { az: "İndi al", en: "Shop now", ru: "Купить", tr: "Hemen al" },
  shopAll: { az: "Hamısına bax", en: "Shop all", ru: "Смотреть всё", tr: "Tümünü gör" },
  allProducts: { az: "Bütün məhsullar", en: "All products", ru: "Все товары", tr: "Tüm ürünler" },
  newArrivals: { az: "Yeni gələnlər", en: "New arrivals", ru: "Новинки", tr: "Yeni gelenler" },
  collection: { az: "Kolleksiya", en: "Collection", ru: "Коллекция", tr: "Koleksiyon" },
  studio: { az: "3D Studio", en: "3D Studio", ru: "3D Студия", tr: "3D Stüdyo" },
  search: { az: "Axtar", en: "Search", ru: "Поиск", tr: "Ara" },
  account: { az: "Hesab", en: "Account", ru: "Аккаунт", tr: "Hesap" },
  cart: { az: "Səbət", en: "Bag", ru: "Корзина", tr: "Sepet" },
  menu: { az: "Menyu", en: "Menu", ru: "Меню", tr: "Menü" },
  close: { az: "Bağla", en: "Close", ru: "Закрыть", tr: "Kapat" },
  soldOut: { az: "Bitib", en: "Sold out", ru: "Нет в наличии", tr: "Tükendi" },
  sale: { az: "Endirim", en: "Sale", ru: "Скидка", tr: "İndirim" },
  products: { az: "məhsul", en: "products", ru: "товаров", tr: "ürün" },
  trackOrder: { az: "Sifarişi izlə", en: "Track order", ru: "Отследить заказ", tr: "Sipariş takibi" },
  freeShipping: {
    az: "Bakı və Sumqayıta çatdırılma pulsuzdur",
    en: "Free delivery in Baku & Sumgayit",
    ru: "Бесплатная доставка по Баку и Сумгаиту",
    tr: "Bakü ve Sumgayıt'a ücretsiz teslimat",
  },
} satisfies Record<string, Phrase>;
