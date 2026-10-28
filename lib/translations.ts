export type LanguageCode = "az" | "en" | "ru" | "tr";

export interface Translations {
  // Navigation
  nav: {
    shirts: string;
    pants: string;
    socks: string;
    collection: string;
    studio: string;
    searchPlaceholder: string;
    searchBtn: string;
    menuTitle: string;
    categories: string;
    securePayment: string;
    currency: string;
    language: string;
  };
  // Announcements
  announcements: {
    freeShipping: string;
    customStudio: string;
    cottonLinen: string;
    guaranteedReturns: string;
    expressDelivery: string;
  };
  // Hero
  hero: {
    tag: string;
    brand: string;
    subtitle: string;
    shirtsBtn: string;
    pantsBtn: string;
    socksBtn: string;
    studioBtn: string;
    featureCotton: string;
    featureDtg: string;
    featureShipping: string;
    featureReturn: string;
  };
  // Products & Studio
  studio: {
    liveModelPreview: string;
    frontView: string;
    backView: string;
    maleModel: string;
    femaleModel: string;
    smartCorrection: string;
    optimizedApplied: string;
    deviationFixed: string;
    optimalMatch: string;
    manualMode: string;
    manualDesc: string;
    applyToStudio: string;
    appliedSuccess: string;
    noDesignOnSide: string;
    noDesignDesc: string;
    addDesignToSide: string;
    backToEditor: string;
    dtgSimulation: string;
    modeLabel: string;
    optimalStandard: string;
    customPlacement: string;
  };
  // Actions
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
  };
}

export const TRANSLATIONS: Record<LanguageCode, Translations> = {
  az: {
    nav: {
      shirts: "KÖYNƏKLƏR",
      pants: "ŞALVARLAR",
      socks: "CORABLAR",
      collection: "KOLLEKSİYA",
      studio: "FƏRDİ ÇAP",
      searchPlaceholder: "Məhsul və ya model axtar...",
      searchBtn: "Axtar",
      menuTitle: "Geyim & Çap Studiyası",
      categories: "KATEQORİYALAR",
      securePayment: "TƏHLÜKƏSİZ ÖDƏNİŞ",
      currency: "Valyuta",
      language: "Dil",
    },
    announcements: {
      freeShipping: "BAKI VƏ SUMQAYIT ƏRAZİSİNƏ ÇATDIRILMA PULSUZDUR",
      customStudio: "FƏRDİ ÇAP STUDİYASI — ÖZ DİZAYNINI KÖYNƏYƏ ÇAP ET",
      cottonLinen: "100% PREMİUM DARANMIŞ PAMBIQ VƏ TƏBİİ KƏTAN KOLLEKSİYASI",
      guaranteedReturns: "14 GÜN ƏRZİNDƏ ASAN VƏ ZƏMANƏTLİ QAYTARILMA",
      expressDelivery: "BAKI, SUMQAYIT VƏ BÜTÜN AZƏRBAYCANA SÜRƏTLİ ÇATDIRILMA",
    },
    hero: {
      tag: "HORVVALLE ATELIER · 2026 COUTURE",
      brand: "HORVVALLE",
      subtitle: "LÜKS GEYİM VƏ FƏRDİ DƏRZİLİK ATELYESİ",
      shirtsBtn: "Köynəklər",
      pantsBtn: "Şalvarlar",
      socksBtn: "Corablar",
      studioBtn: "Öz Dizaynını Yarat",
      featureCotton: "100% Xalis Pambıq",
      featureDtg: "Ultra HD DTG Çap",
      featureShipping: "Bakı və Sumqayıtda Pulsuz Çatdırılma",
      featureReturn: "14 Günlük Qaytarılma",
    },
    studio: {
      liveModelPreview: "Model Üzərində Canlı Baxış",
      frontView: "Ön Görünüş",
      backView: "Arxa Görünüş",
      maleModel: "Kişi Model",
      femaleModel: "Qadın Model",
      smartCorrection: "Ağıllı Çap Düzəlişi",
      optimizedApplied: "Ağıllı Optimizasiya Tətbiq Olundu",
      deviationFixed: "Dizayn standart sinə çap zonasına mərkəzləşdirildi.",
      optimalMatch: "Dizayn optimal zonaya tam uyğundur.",
      manualMode: "Fərdi Yerləşdirmə Rejimi",
      manualDesc: "Dizayn studiyada təyin etdiyiniz koordinatlarda göstərilir.",
      applyToStudio: "Optimizasiyanı Studiyada Yadda Saxla",
      appliedSuccess: "✓ Optimal koordinatlar studiyaya tətbiq olundu!",
      noDesignOnSide: "Bu Tərəfdə Dizayn Yoxdur",
      noDesignDesc: "Köynəyin bu hissəsinə studiyada heç bir şəkil və ya yazı əlavə edilməyib.",
      addDesignToSide: "Bu Tərəfə Dizayn Əlavə Et",
      backToEditor: "Tənzimləməyə Qayıt",
      dtgSimulation: "Canlı DTG Çap Simulyasiyası",
      modeLabel: "Rejim",
      optimalStandard: "Optimal Sinə Standartı",
      customPlacement: "Fərdi Studiya Yerləşməsi",
    },
    action: {
      addToCart: "Səbətə At",
      addingToCart: "Səbətə Əlavə Edilir...",
      addedToCart: "Səbətə Əlavə Olundu!",
      view: "Bax",
      explore: "Kəşf Et",
      size: "Ölçü",
      color: "Rəng",
      quantity: "Say",
      price: "Qiymət",
      subtotal: "Cəmi",
      checkout: "Sifarişi Rəsmiləşdir",
      cartEmpty: "Səbətiniz hələ boşdur",
      cartTitle: "Səbətiniz",
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
    },
  },

  en: {
    nav: {
      shirts: "SHIRTS",
      pants: "PANTS",
      socks: "SOCKS",
      collection: "COLLECTION",
      studio: "CUSTOM LAB",
      searchPlaceholder: "Search products or styles...",
      searchBtn: "Search",
      menuTitle: "Apparel & Print Atelier",
      categories: "CATEGORIES",
      securePayment: "SECURE CHECKOUT",
      currency: "Currency",
      language: "Language",
    },
    announcements: {
      freeShipping: "FREE EXPRESS DELIVERY IN BAKU & SUMGAYIT",
      customStudio: "CUSTOM PRINT ATELIER — PRINT YOUR OWN GRAPHIC ON TEES",
      cottonLinen: "100% PREMIUM COMBED COTTON & NATURAL LINEN COLLECTION",
      guaranteedReturns: "14 DAYS EASY & GUARANTEED RETURNS",
      expressDelivery: "FAST WORLDWIDE & LOCAL COURIER DELIVERY",
    },
    hero: {
      tag: "HORVVALLE ATELIER · 2026 COUTURE",
      brand: "HORVVALLE",
      subtitle: "HAUTE COUTURE & BESPOKE TAILORING ATELIER",
      shirtsBtn: "Shirts",
      pantsBtn: "Pants & Chinos",
      socksBtn: "Socks",
      studioBtn: "Create Your Design",
      featureCotton: "100% Combed Cotton",
      featureDtg: "Ultra HD DTG Print",
      featureShipping: "Free Shipping Available",
      featureReturn: "14-Day Hassle-Free Returns",
    },
    studio: {
      liveModelPreview: "Live Model Simulation",
      frontView: "Front View",
      backView: "Back View",
      maleModel: "Male Model",
      femaleModel: "Female Model",
      smartCorrection: "Smart Print Alignment",
      optimizedApplied: "Smart Golden Zone Applied",
      deviationFixed: "Graphic was auto-aligned to the chest standard.",
      optimalMatch: "Design fits the golden printable zone perfectly.",
      manualMode: "Manual Studio Coordinates",
      manualDesc: "Displaying exact custom coordinates set in the studio.",
      applyToStudio: "Save Optimization to Studio",
      appliedSuccess: "✓ Optimal coordinates synced to studio!",
      noDesignOnSide: "No Design on this Side",
      noDesignDesc: "No graphic or text has been placed on this side yet.",
      addDesignToSide: "Add Artwork to this Side",
      backToEditor: "Return to Studio",
      dtgSimulation: "Live DTG Print Simulation",
      modeLabel: "Mode",
      optimalStandard: "Optimal Chest Standard",
      customPlacement: "Custom Placement",
    },
    action: {
      addToCart: "Add to Bag",
      addingToCart: "Adding to Bag...",
      addedToCart: "Added to Bag!",
      view: "View",
      explore: "Explore",
      size: "Size",
      color: "Color",
      quantity: "Qty",
      price: "Price",
      subtotal: "Subtotal",
      checkout: "Proceed to Checkout",
      cartEmpty: "Your bag is currently empty",
      cartTitle: "Shopping Bag",
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
    },
  },

  ru: {
    nav: {
      shirts: "РУБАШКИ",
      pants: "БРЮКИ",
      socks: "НОСКИ",
      collection: "КОЛЛЕКЦИЯ",
      studio: "СВОЙ ПРИНТ",
      searchPlaceholder: "Поиск товаров и моделей...",
      searchBtn: "Поиск",
      menuTitle: "Одежда и Студия Печати",
      categories: "КАТЕГОРИИ",
      securePayment: "БЕЗОПАСНАЯ ОПЛАТА",
      currency: "Валюта",
      language: "Язык",
    },
    announcements: {
      freeShipping: "БЕСПЛАТНАЯ ДОСТАВКА ПО БАКУ И СУМГАИТУ",
      customStudio: "СТУДИЯ ПЕЧАТИ — СОЗДАЙ СВОЙ ДИЗАЙН НА ФУТБОЛКЕ",
      cottonLinen: "КОЛЛЕКЦИЯ ИЗ 100% ПРЕМИАЛЬНОГО ХЛОПКА И НАТУРАЛЬНОГО ЛЬНА",
      guaranteedReturns: "14 ДНЕЙ ЛЕГКИЙ И ГАРАНТИРОВАННЫЙ ВОЗВРАТ",
      expressDelivery: "БЫСТРАЯ КУРЬЕРСКАЯ ДОСТАВКА ПО ВСЕМ НАПРАВЛЕНИЯМ",
    },
    hero: {
      tag: "HORVVALLE ATELIER · КОЛЛЕКЦИЯ 2026",
      brand: "HORVVALLE",
      subtitle: "ЛЮКСОВАЯ ОДЕЖДА И ИНДИВИДУАЛЬНОЕ АТЕЛЬЕ",
      shirtsBtn: "Рубашки",
      pantsBtn: "Брюки и Чиносы",
      socksBtn: "Носки",
      studioBtn: "Создать Свой Дизайн",
      featureCotton: "100% Гребенной Хлопок",
      featureDtg: "Печать Ultra HD DTG",
      featureShipping: "Бесплатная Доставка",
      featureReturn: "14 Дней Гарантия Возврата",
    },
    studio: {
      liveModelPreview: "Живая Примерка на Модели",
      frontView: "Вид Спереди",
      backView: "Вид Сзади",
      maleModel: "Мужская Модель",
      femaleModel: "Женская Модель",
      smartCorrection: "Умное Выравнивание Печати",
      optimizedApplied: "Умная Оптимизация Применена",
      deviationFixed: "Дизайн отцентрирован по стандарту грудной зоны.",
      optimalMatch: "Дизайн идеально соответствует зоне печати.",
      manualMode: "Ручной Режим",
      manualDesc: "Отображаются точные координаты из студии.",
      applyToStudio: "Сохранить Оптимизацию в Студию",
      appliedSuccess: "✓ Оптимальные координаты применены!",
      noDesignOnSide: "На этой стороне нет дизайна",
      noDesignDesc: "На эту сторону еще не добавлен принт или текст.",
      addDesignToSide: "Добавить Дизайн",
      backToEditor: "Вернуться к Настройке",
      dtgSimulation: "DTG Симуляция Печати",
      modeLabel: "Режим",
      optimalStandard: "Стандарт Зоны Груди",
      customPlacement: "Пользовательское Положение",
    },
    action: {
      addToCart: "В Корзину",
      addingToCart: "Добавляем...",
      addedToCart: "Добавлено!",
      view: "Смотреть",
      explore: "Смотреть Все",
      size: "Размер",
      color: "Цвет",
      quantity: "Кол-во",
      price: "Цена",
      subtotal: "Итого",
      checkout: "Оформить Заказ",
      cartEmpty: "Ваша корзина пуста",
      cartTitle: "Корзина",
      continueShopping: "Продолжить Покупки",
    },
    product: {
      color: "Цвет",
      size: "Размер",
      selectSize: "Выберите размер",
      sizeGuide: "Таблица размеров",
      addToBag: "В Корзину",
      addedToBag: "Добавлено в корзину!",
      buyNow: "Купить Сейчас",
      choices: "варианта",
      colorsWord: "цветов",
      inStock: "В наличии",
      freeShipping: "Бесплатная доставка по Баку и Сумгаиту",
      securePayment: "100% Безопасная Оплата",
      easyReturn: "Легкий возврат в течение 14 дней",
    },
  },

  tr: {
    nav: {
      shirts: "GÖMLEKLER",
      pants: "PANTOLONLAR",
      socks: "ÇORAPLAR",
      collection: "KOLEKSİYON",
      studio: "ÖZEL BASKI",
      searchPlaceholder: "Ürün veya model ara...",
      searchBtn: "Ara",
      menuTitle: "Giyim & Baskı Atölyesi",
      categories: "KATEGORİLER",
      securePayment: "GÜVENLİ ÖDEME",
      currency: "Para Birimi",
      language: "Dil",
    },
    announcements: {
      freeShipping: "BAKÜ VE SUMGAYIT İÇİN ÜCRETSİZ HIZLI KARGO",
      customStudio: "ÖZEL BASKI ATÖLYESİ — KENDİ TASARIMINI TİŞÖRTE BAS",
      cottonLinen: "%100 BİRİNCİ SINIF PENYE PAMUK VE DOĞAL KETEN KOLEKSİYONU",
      guaranteedReturns: "14 GÜN İÇİNDE KOLAY VE GARANTİLİ İADE",
      expressDelivery: "HIZLI KURYE VE GÜVENLİ TESLİMAT",
    },
    hero: {
      tag: "HORVVALLE ATELIER · 2026 KOLEKSİYONU",
      brand: "HORVVALLE",
      subtitle: "LÜKS GİYİM VE ÖZEL DİKİM ATÖLYESİ",
      shirtsBtn: "Gömlekler",
      pantsBtn: "Pantolonlar",
      socksBtn: "Çoraplar",
      studioBtn: "Kendi Tasarımını Yap",
      featureCotton: "%100 Saf Penye Pamuk",
      featureDtg: "Ultra HD DTG Baskı",
      featureShipping: "Ücretsiz Kargo İmkanı",
      featureReturn: "14 Gün Kolay İade",
    },
    studio: {
      liveModelPreview: "Model Üzerinde Canlı Önizleme",
      frontView: "Ön Görünüm",
      backView: "Arka Görünüm",
      maleModel: "Erkek Model",
      femaleModel: "Kadın Model",
      smartCorrection: "Akıllı Baskı Hizalama",
      optimizedApplied: "Akıllı Optimizasyon Uygulandı",
      deviationFixed: "Tasarım göğüs merkezine otomatik hizalandı.",
      optimalMatch: "Tasarım ideal baskı alanına tam uygundur.",
      manualMode: "Özel Konumlandırma",
      manualDesc: "Stüdyoda belirlediğiniz özel koordinatlar gösteriliyor.",
      applyToStudio: "Optimizasyonu Stüdyoya Kaydet",
      appliedSuccess: "✓ İdeal koordinatlar stüdyoya aktarıldı!",
      noDesignOnSide: "Bu Tarafta Tasarım Yok",
      noDesignDesc: "Giyimin bu kısmına henüz görsel veya metin eklenmedi.",
      addDesignToSide: "Bu Tarafa Tasarım Ekle",
      backToEditor: "Düzenlemeye Geri Dön",
      dtgSimulation: "Canlı DTG Baskı Simülasyonu",
      modeLabel: "Mod",
      optimalStandard: "İdeal Göğüs Standardı",
      customPlacement: "Özel Konumlandırma",
    },
    action: {
      addToCart: "Sepete Ekle",
      addingToCart: "Ekleniyor...",
      addedToCart: "Sepete Eklendi!",
      view: "İncele",
      explore: "Keşfet",
      size: "Beden",
      color: "Renk",
      quantity: "Adet",
      price: "Fiyat",
      subtotal: "Ara Toplam",
      checkout: "Siparişi Tamamla",
      cartEmpty: "Sepetiniz henüz boş",
      cartTitle: "Sepetiniz",
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
    },
  },
};

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
