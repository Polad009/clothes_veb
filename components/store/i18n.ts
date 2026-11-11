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

const ORDER_STATUS_I18N: Record<string, Phrase> = {
  "yeni sifariş": { az: "Yeni sifariş", en: "New order", ru: "Новый заказ", tr: "Yeni sipariş" },
  "qəbul edildi": { az: "Qəbul edildi", en: "Received", ru: "Принят", tr: "Alındı" },
  "təsdiqləndi": { az: "Təsdiqləndi", en: "Confirmed", ru: "Подтверждён", tr: "Onaylandı" },
  "hazırlanır": { az: "Hazırlanır", en: "Being prepared", ru: "Готовится", tr: "Hazırlanıyor" },
  "kuryerdədir": { az: "Kuryerdədir", en: "Out for delivery", ru: "У курьера", tr: "Kuryede" },
  "göndərildi": { az: "Göndərildi", en: "Shipped", ru: "Отправлен", tr: "Gönderildi" },
  "çatdırıldı": { az: "Çatdırıldı", en: "Delivered", ru: "Доставлен", tr: "Teslim edildi" },
  "ləğv edildi": { az: "Ləğv edildi", en: "Cancelled", ru: "Отменён", tr: "İptal edildi" },
};

/** Order statuses are saved in Azerbaijani; this shows them in the visitor's language. */
export function orderStatusText(status: string | undefined, lang: string): string {
  const key = String(status || "Yeni Sifariş").trim().toLocaleLowerCase("az");
  const p = ORDER_STATUS_I18N[key];
  return p ? tr(lang, p) : String(status || "");
}

const PAYMENT_I18N: Record<string, Phrase> = {
  "ödənilib": { az: "Ödənilib", en: "Paid", ru: "Оплачен", tr: "Ödendi" },
  "paid": { az: "Ödənilib", en: "Paid", ru: "Оплачен", tr: "Ödendi" },
  "test_paid": { az: "Sınaq ödənişi", en: "Test payment", ru: "Тестовая оплата", tr: "Test ödemesi" },
  "pending": { az: "Gözləyir", en: "Pending", ru: "Ожидает", tr: "Bekliyor" },
  "gözləyir": { az: "Gözləyir", en: "Pending", ru: "Ожидает", tr: "Bekliyor" },
  "failed": { az: "Alınmadı", en: "Failed", ru: "Не прошла", tr: "Başarısız" },
  "refunded": { az: "Geri qaytarıldı", en: "Refunded", ru: "Возвращён", tr: "İade edildi" },
  "bank kartı": { az: "Bank kartı", en: "Bank card", ru: "Банковская карта", tr: "Banka kartı" },
  "bank kartı (visa/mastercard)": { az: "Bank kartı (Visa/Mastercard)", en: "Bank card (Visa/Mastercard)", ru: "Банковская карта (Visa/Mastercard)", tr: "Banka kartı (Visa/Mastercard)" },
  "card": { az: "Bank kartı", en: "Bank card", ru: "Банковская карта", tr: "Banka kartı" },
  "nağd": { az: "Nağd", en: "Cash", ru: "Наличные", tr: "Nakit" },
};

/** Payment statuses and methods are saved in Azerbaijani or as codes; this shows them in the visitor's language. */
export function paymentStatusText(value: string | undefined, lang: string): string {
  const key = String(value || "").trim().toLocaleLowerCase("az");
  const p = PAYMENT_I18N[key];
  return p ? tr(lang, p) : String(value || "");
}
