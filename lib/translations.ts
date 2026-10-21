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
      freeShipping: "60 ₼ VƏ ÜZƏRİ BÜTÜN SİFARİŞLƏRƏ PULSUZ ÇATDIRILMA",
      customStudio: "FƏRDİ ÇAP STUDİYASI — ÖZ DİZAYNINI KÖYNƏYƏ ÇAP ET",
      cottonLinen: "100% PREMİUM DARANMIŞ PAMBIQ VƏ TƏBİİ KƏTAN KOLLEKSİYASI",
      guaranteedReturns: "14 GÜN ƏRZİNDƏ ASAN VƏ ZƏMANƏTLİ QAYTARILMA",
      expressDelivery: "BAKI VƏ BÜTÜN AZƏRBAYCANA SÜRƏTLİ KURYER ÇATDIRILMASI",
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
      featureShipping: "60 ₼-dən Pulsuz Çatdırılma",
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
      freeShipping: "FREE EXPRESS DELIVERY ON ALL ORDERS OVER $35 / 60 ₼",
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
      freeShipping: "БЕСПЛАТНАЯ ДОСТАВКА ДЛЯ ВСЕХ ЗАКАЗОВ ОТ 60 ₼",
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
      freeShipping: "60 ₼ VE ÜZERİ TÜM SİPARİŞLERDE ÜCRETSİZ HIZLI KARGO",
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
  },
};
