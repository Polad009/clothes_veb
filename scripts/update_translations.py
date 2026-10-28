with open('lib/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

interface_patch = '''  // Actions
  action: {
    addToCart: string;
    addingToCart: string;
    addedToCart: string;
    view: string;
    explore: string;
    size: string;
    color: string;
    quantity: string;
    price: string;
    subtotal: string;
    checkout: string;
    cartEmpty: string;
    cartTitle: string;
    continueShopping: string;
  };
  // Product Detail & Card
  product: {
    color: string;
    size: string;
    selectSize: string;
    sizeGuide: string;
    addToBag: string;
    addedToBag: string;
    buyNow: string;
    choices: string;
    colorsWord: string;
    inStock: string;
    freeShipping: string;
    securePayment: string;
    easyReturn: string;
  };'''

content = content.replace('''  // Actions
  action: {
    addToCart: string;
    addingToCart: string;
    addedToCart: string;
    view: string;
    explore: string;
    size: string;
    color: string;
    quantity: string;
    price: string;
    subtotal: string;
    checkout: string;
    cartEmpty: string;
    cartTitle: string;
    continueShopping: string;
  };''', interface_patch)

az_patch = '''      cartTitle: "Səbətiniz",
      continueShopping: "Alış-verişə Davam Et",
    },
    product: {
      color: "Rəng",
      size: "Ölçü",
      selectSize: "Ölçü Seçin",
      sizeGuide: "Ölçü Cədvəli",
      addToBag: "Səbətə Əlavə Et",
      addedToBag: "Səbətə Əlavə Olundu!",
      buyNow: "Birbaşa Sifariş Et",
      choices: "seçim",
      colorsWord: "rəng",
      inStock: "Mövcuddur",
      freeShipping: "Bakı və Sumqayıt Pulsuz Çatdırılma",
      securePayment: "100% Zəmanətli Təhlükəsiz Ödəniş",
      easyReturn: "14 Günlük Asan Qaytarılma",
    },'''

en_patch = '''      cartTitle: "Shopping Bag",
      continueShopping: "Continue Shopping",
    },
    product: {
      color: "Color",
      size: "Size",
      selectSize: "Select Size",
      sizeGuide: "Size Guide",
      addToBag: "Add to Bag",
      addedToBag: "Added to Bag!",
      buyNow: "Buy Now",
      choices: "choices",
      colorsWord: "colors",
      inStock: "In Stock",
      freeShipping: "Free Delivery in Baku and Sumgayit",
      securePayment: "100% Guaranteed Secure Checkout",
      easyReturn: "14-Day Free and Easy Returns",
    },'''

ru_patch = '''      cartTitle: "Корзина",
      continueShopping: "Продолжить покупки",
    },
    product: {
      color: "Цвет",
      size: "Размер",
      selectSize: "Выберите размер",
      sizeGuide: "Таблица размеров",
      addToBag: "В корзину",
      addedToBag: "Добавлено в корзину!",
      buyNow: "Купить сейчас",
      choices: "варианта",
      colorsWord: "цветов",
      inStock: "В наличии",
      freeShipping: "Бесплатная доставка по Баку и Сумгаиту",
      securePayment: "100% Безопасная оплата",
      easyReturn: "14 дней на легкий возврат",
    },'''

tr_patch = '''      cartTitle: "Sepetiniz",
      continueShopping: "Alışverişe Devam Et",
    },
    product: {
      color: "Renk",
      size: "Beden",
      selectSize: "Beden Seçin",
      sizeGuide: "Beden Tablosu",
      addToBag: "Sepete Ekle",
      addedToBag: "Sepete Eklendi!",
      buyNow: "Hemen Satın Al",
      choices: "seçenek",
      colorsWord: "renk",
      inStock: "Stokta Var",
      freeShipping: "Bakü ve Sumgayıt Ücretsiz Teslimat",
      securePayment: "100% Güvenli Ödeme",
      easyReturn: "14 Gün Kolay İade",
    },'''

content = content.replace('''      cartTitle: "Səbətiniz",
      continueShopping: "Alış-verişə Davam Et",
    },''', az_patch)

content = content.replace('''      cartTitle: "Shopping Bag",
      continueShopping: "Continue Shopping",
    },''', en_patch)

content = content.replace('''      cartTitle: "Корзина",
      continueShopping: "Продолжить покупки",
    },''', ru_patch)

content = content.replace('''      cartTitle: "Sepetiniz",
      continueShopping: "Alışverişe Devam Et",
    },''', tr_patch)

helpers = '''
export function translateColor(colorName: string, lang: LanguageCode): string {
  if (!colorName) return colorName;
  const lower = colorName.trim().toLowerCase();

  const map: Record<string, Record<LanguageCode, string>> = {
    "sand beige": { az: "Qum Beji", en: "Sand Beige", ru: "Песочно-бежевый", tr: "Kum Beji" },
    "sand": { az: "Qum Beji", en: "Sand", ru: "Песочный", tr: "Kum Beji" },
    "qum beji": { az: "Qum Beji", en: "Sand Beige", ru: "Песочно-бежевый", tr: "Kum Beji" },
    "clean white": { az: "Xalis Ağ", en: "Clean White", ru: "Белый", tr: "Temiz Beyaz" },
    "ağ": { az: "Ağ", en: "White", ru: "Белый", tr: "Beyaz" },
    "white": { az: "Ağ", en: "White", ru: "Белый", tr: "Beyaz" },
    "washed black": { az: "Yuyulmuş Qara", en: "Washed Black", ru: "Выстиранный черный", tr: "Yıkanmış Siyah" },
    "qara": { az: "Qara", en: "Black", ru: "Черный", tr: "Siyah" },
    "black": { az: "Qara", en: "Black", ru: "Черный", tr: "Siyah" },
    "heather grey": { az: "Melanj Boz", en: "Heather Grey", ru: "Меланж Серый", tr: "Melanj Gri" },
    "boz": { az: "Boz", en: "Grey", ru: "Серый", tr: "Gri" },
    "grey": { az: "Boz", en: "Grey", ru: "Серый", tr: "Gri" },
    "off-white": { az: "Süd Ağ", en: "Off-White", ru: "Молочный", tr: "Kırık Beyaz" },
    "standart": { az: "Standart", en: "Standard", ru: "Стандарт", tr: "Standart" },
  };

  if (map[lower]) {
    return map[lower][lang] || map[lower].en;
  }
  return colorName;
}

export function translateBadge(badge: string | undefined, lang: LanguageCode): string | undefined {
  if (!badge) return badge;
  const lower = badge.trim().toLowerCase();

  const map: Record<string, Record<LanguageCode, string>> = {
    "limited motorsport edition": {
      az: "MƏHDUD MOTORSPORT NƏŞRİ",
      en: "LIMITED MOTORSPORT EDITION",
      ru: "ЛИМИТИРОВАННАЯ MOTORSPORT СЕРИЯ",
      tr: "SINIRLI MOTORSPORT EDİSYONU",
    },
    "yeni sezon · 2026": {
      az: "YENİ SEZON · 2026",
      en: "NEW SEASON · 2026",
      ru: "НОВЫЙ СЕЗОН · 2026",
      tr: "YENİ SEZON · 2026"
    },
    "limited edition": {
      az: "MƏHDUD BURAXILIŞ",
      en: "LIMITED EDITION",
      ru: "ЛИМИТИРОВАННАЯ СЕРИЯ",
      tr: "SINIRLI SAYIDA",
    },
  };

  if (map[lower]) {
    return map[lower][lang] || map[lower].en;
  }
  return badge;
}
'''

content = content + helpers

with open('lib/translations.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated lib/translations.ts successfully!')
