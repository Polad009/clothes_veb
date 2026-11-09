export type LanguageCode = "az" | "en" | "ru" | "tr";

export interface Translations {
  // Navigation
  nav: {
    home: string;
    collections: string;
    men: string;
    women: string;
    unisex: string;
    shirts: string;
    hoodies: string;
    pants: string;
    socks: string;
    accessories: string;
    collection: string;
    track: string;
    studio: string;
    login: string;
    account: string;
    searchPlaceholder: string;
    searchBtn: string;
    search: string;
    cart: string;
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
    designBtn: string;
    collectionBtn: string;
    selectSize: string;
    featureCotton: string;
    featureDtg: string;
    featureShipping: string;
    featureReturn: string;
  };
  // Track Page
  track: {
    title: string;
    subtitle: string;
    byCode: string;
    byPhone: string;
    byEmail: string;
    codePlaceholder: string;
    phonePlaceholder: string;
    emailPlaceholder: string;
    trackBtn: string;
    trackingBtn: string;
    orderSummary: string;
    orderItems: string;
    deliveryAddress: string;
    paymentInfo: string;
    total: string;
    subtotal: string;
    shipping: string;
    free: string;
    allOrders: string;
    recentOrders: string;
    notFound: string;
    statusNew: string;
    statusConfirmed: string;
    statusTailoring: string;
    statusCourier: string;
    statusDelivered: string;
    statusCancelled: string;
  };
  // Home Page
  home: {
    allModels: string;
    shirtsCategory: string;
    hoodiesCategory: string;
    pantsCategory: string;
    accessoriesCategory: string;
    viewCollection: string;
    view: string;
    selectedModels: string;
    wardrobeFoundation?: string;
    atelierShowcase: string;
    selectedShowcase: string;
    fourDirections: string;
    fourDirectionsTitle: string;
    fourDirectionsDesc: string;
  };
  // Collections
  collections: {
    allModels: string;
    shirts: string;
    hoodies: string;
    pants: string;
    accessories: string;
    sortBestselling: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    sortRating: string;
    filters: string;
    resetFilters: string;
    noProductsFound: string;
    all: string;
    fit: string;
    size: string;
    filterByFit: string;
    filterBySize: string;
    men: string;
    women: string;
    unisex: string;
    gender: string;
    filterByGender: string;
    menCollection: string;
    womenCollection: string;
    unisexCollection: string;
  };
  // Checkout
  checkout: {
    title: string;
    contactInfo: string;
    fullName: string;
    phone: string;
    email: string;
    city: string;
    address: string;
    paymentMethod: string;
    creditCard: string;
    confirmOrder: string;
    loginRequired: string;
    loginPrompt: string;
    orderSummary: string;
    itemsTotal: string;
    delivery: string;
    free: string;
    grandTotal: string;
    secureCheckout: string;
  };
  // Account
  account: {
    title: string;
    logout: string;
    myOrders: string;
    noOrders: string;
    trackOrder: string;
    status: string;
    amount: string;
    date: string;
  };
  // Auth
  auth: {
    signIn: string;
    signUp: string;
    signInWithGoogle: string;
    fullName: string;
    email: string;
    password: string;
    dontHaveAccount: string;
    alreadyHaveAccount: string;
    registrationSuccess: string;
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
  footer: {
    fastDelivery: string;
    fastDeliverySub: string;
    return14Days: string;
    return14DaysSub: string;
    securePayment: string;
    securePaymentSub: string;
    naturalMaterials: string;
    naturalMaterialsSub: string;
    brandDesc: string;
    newsletterTitle: string;
    newsletterPlaceholder: string;
    joinBtn: string;
    rights: string;
  };
}

export const TRANSLATIONS: Record<LanguageCode, Translations> = {
  az: {
    nav: {
      home: "Ana Səhifə",
      collections: "Kolleksiya",
      men: "Kişi",
      women: "Qadın",
      unisex: "Unisex",
      shirts: "Köynək",
      hoodies: "Hudi",
      pants: "Şalvar",
      socks: "Corab",
      accessories: "Aksesuar",
      collection: "Kolleksiya",
      track: "Sifarişi İzlə",
      studio: "3D Fərdi Studiya",
      login: "Daxil Ol / Qeydiyyat",
      account: "Müştəri Hesabı",
      searchPlaceholder: "Məhsul və ya model axtar...",
      searchBtn: "Axtar",
      search: "Axtarış",
      cart: "Səbət",
      menuTitle: "Geyim & Çap Studiyası",
      categories: "Kolleksiyalar",
      securePayment: "Təhlükəsiz Ödəniş",
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
      designBtn: "3D Studiyada dizayn et",
      collectionBtn: "Kolleksiyaya bax",
      selectSize: "Ölçünü seç",
      featureCotton: "100% Xalis Pambıq",
      featureDtg: "Ultra HD DTG Çap",
      featureShipping: "Bakı və Sumqayıtda Pulsuz Çatdırılma",
      featureReturn: "14 Günlük Qaytarılma",
    },
    track: {
      title: "Sifarişi İzləyin",
      subtitle: "Sifarişinizin canlı statusunu, atelye hazırlığını və kuryer məlumatlarını öyrənin",
      byCode: "Sifariş Kodu İlə",
      byPhone: "Telefon Nömrəsi İlə",
      byEmail: "E-poçt (Gmail) İlə",
      codePlaceholder: "məsələn: #VTX-ORD-2026 və ya 8841",
      phonePlaceholder: "məsələn: +994 50 123 45 67",
      emailPlaceholder: "məsələn: adiniz@gmail.com",
      trackBtn: "İzlə",
      trackingBtn: "Axtarılır...",
      orderSummary: "Sifariş Məlumatları",
      orderItems: "Sifariş Edilən Məhsullar",
      deliveryAddress: "Çatdırılma Ünvanı",
      paymentInfo: "Ödəniş Metodu",
      total: "Yekun Məbləğ",
      subtotal: "Məhsullar Cəmi",
      shipping: "Çatdırılma",
      free: "Pulsuz",
      allOrders: "Bütün Tapılan Sifarişləriniz",
      recentOrders: "Son Axtarılan Sifarişlər",
      notFound: "Heç bir aktiv sifariş tapılmadı.",
      statusNew: "Yeni Sifariş (Qəbul edildi)",
      statusConfirmed: "Təsdiqləndi",
      statusTailoring: "Çapda / Dərzidə",
      statusCourier: "Kuryerdədir (Yoldadır)",
      statusDelivered: "Çatdırıldı",
      statusCancelled: "Ləğv edildi",
    },
    home: {
      allModels: "Bütün Modellər",
      shirtsCategory: "T-Shirt & Köynək",
      hoodiesCategory: "Hudi & Sviter",
      pantsCategory: "Şalvar & Şortik",
      accessoriesCategory: "Aksesuarlar",
      viewCollection: "Kolleksiyaya Keç",
      view: "Bax",
      selectedModels: "SEÇİLMİŞ MODELLƏR",
      wardrobeFoundation: "QARDEROBUNUZUN TƏMƏLİ",
      atelierShowcase: "CANLI ATELYE VİTRİNİ",
      selectedShowcase: "HORVVALLE SEÇİLMİŞ MODELLƏR",
      fourDirections: "KOLLEKSİYA STRUKTURU",
      fourDirectionsTitle: "DÖRD ƏSAS DƏRZİLİK İSTİQAMƏTİ",
      fourDirectionsDesc: "Xalis daranmış sıx pambıq, isti 3iplik fleece və dəqiq kəsimli şalvarlar. İstənilən bölməni seçərək modelləri kəşf edin.",
    },
    
    "collections": {
        "allModels": "Bütün modellər",
        "shirts": "T-Shirt & köynək",
        "hoodies": "Hudi & sviter",
        "pants": "Şalvar & şortik",
        "accessories": "Aksesuarlar",
        "sortBestselling": "Ən çox satılanlar",
        "sortPriceAsc": "Qiymət: Ucuzdan Bahaya",
        "sortPriceDesc": "Qiymət: Bahadan Ucuza",
        "sortRating": "Ən yüksək reytinq",
        "filters": "Filtrlər",
        "resetFilters": "Filtrləri sıfırla",
        "noProductsFound": "Seçilmiş parametrlərə uyğun məhsul tapılmadı.",
        "all": "Hamısı",
        "fit": "Kəsim / Model",
        "size": "Ölçü",
        "filterByFit": "Kəsimə görə filtr",
        "filterBySize": "Ölçüyə görə filtr",
        "men": "Kişi",
        "women": "Qadın",
        "unisex": "Unisex",
        "gender": "Cins",
        "filterByGender": "Cinsə görə filtr",
        "menCollection": "Kişi Kolleksiyası",
        "womenCollection": "Qadın Kolleksiyası",
        "unisexCollection": "Unisex Kolleksiyası"
    },
    "checkout": {
        "title": "Sifarişin Rəsmiləşdirilməsi",
        "contactInfo": "Əlaqə və Çatdırılma Məlumatları",
        "fullName": "Ad və Soyad",
        "phone": "Əlaqə Nömrəsi",
        "email": "E-poçt Ünvanı",
        "city": "Şəhər",
        "address": "Çatdırılma Ünvanı",
        "paymentMethod": "Ödəniş Metodu",
        "creditCard": "Bank Kartı",
        "confirmOrder": "Sifarişi Təsdiqlə",
        "loginRequired": "Sifariş üçün daxil olun",
        "loginPrompt": "Zəhmət olmasa sifariş verməzdən əvvəl hesabınıza daxil olun və ya qeydiyyatdan keçin.",
        "orderSummary": "Sifarişin İcmalı",
        "itemsTotal": "Məhsulların Cəmi",
        "delivery": "Çatdırılma",
        "free": "PULSUZ (Bakı & Sumqayıt)",
        "grandTotal": "Yekun Məbləğ",
        "secureCheckout": "256-Bit SSL Təhlükəsiz Ödəniş və 14 Gün Zəmanət"
    },
    "account": {
        "title": "Müştəri Hesabı",
        "logout": "Çıxış",
        "myOrders": "Son Sifarişlərim",
        "noOrders": "Hələ heç bir sifarişiniz yoxdur.",
        "trackOrder": "Sifarişi İzlə",
        "status": "Status",
        "amount": "Məbləğ",
        "date": "Tarix"
    },
    "auth": {
        "signIn": "Daxil Ol",
        "signUp": "Qeydiyyat",
        "signInWithGoogle": "Google ilə Daxil Ol",
        "fullName": "Ad və Soyad",
        "email": "E-poçt Ünvanı",
        "password": "Şifrə",
        "dontHaveAccount": "Hesabınız yoxdur? Qeydiyyatdan keçin",
        "alreadyHaveAccount": "Artıq hesabınız var? Daxil olun",
        "registrationSuccess": "Qeydiyyatınız uğurla tamamlandı! İndi daxil olun."
    }
,
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
    footer: {
      fastDelivery: "Sürətli Çatdırılma",
      fastDeliverySub: "Bakı və Sumqayıtda pulsuz",
      return14Days: "14 Günlük Qaytarılma",
      return14DaysSub: "Asan və zəmanətli dəyişmə",
      securePayment: "Təhlükəsiz Ödəniş",
      securePaymentSub: "Apple Pay, Google Pay, Kart",
      naturalMaterials: "Təbii Materiallar",
      naturalMaterialsSub: "100% kətan, pambıq və bambuk",
      brandDesc: "Lüks geyim və fərdi sənət evi. Yüksək keyfiyyətli premium köynəklər, 3iplik isti hudilər, zərif kəsimli şalvarlar və qabaqcıl 3D fərdi dizayn atelyesi.",
      newsletterTitle: "YENİ ENDİRİMLƏRƏ İLK SƏN QOŞUL",
      newsletterPlaceholder: "E-poçt ünvanınızı daxil edin",
      joinBtn: "Qoşul",
      rights: "Bütün hüquqlar qorunur.",
    },
  },

  en: {
    nav: {
      home: "Home",
      collections: "Collections",
      men: "Men",
      women: "Women",
      unisex: "Unisex",
      shirts: "Shirts",
      hoodies: "Hoodies",
      pants: "Pants",
      socks: "Socks",
      accessories: "Accessories",
      collection: "Collection",
      track: "Track Order",
      studio: "3D Custom Lab",
      login: "Sign In / Register",
      account: "Customer Account",
      searchPlaceholder: "Search products or styles...",
      searchBtn: "Search",
      search: "Search",
      cart: "Cart",
      menuTitle: "Apparel & Print Atelier",
      categories: "Categories",
      securePayment: "Secure Checkout",
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
      designBtn: "Design in 3D Studio",
      collectionBtn: "View Collection",
      selectSize: "Select Size",
      featureCotton: "100% Combed Cotton",
      featureDtg: "Ultra HD DTG Print",
      featureShipping: "Free Shipping Available",
      featureReturn: "14-Day Hassle-Free Returns",
    },
    track: {
      title: "Track Your Order",
      subtitle: "Check live order progress, atelier tailoring status, and courier tracking",
      byCode: "By Order Code",
      byPhone: "By Phone Number",
      byEmail: "By Email (Gmail)",
      codePlaceholder: "e.g. #VTX-ORD-2026 or 8841",
      phonePlaceholder: "e.g. +994 50 123 45 67",
      emailPlaceholder: "e.g. yourname@gmail.com",
      trackBtn: "Track",
      trackingBtn: "Searching...",
      orderSummary: "Order Details",
      orderItems: "Ordered Garments",
      deliveryAddress: "Delivery Address",
      paymentInfo: "Payment Method",
      total: "Grand Total",
      subtotal: "Subtotal",
      shipping: "Delivery",
      free: "Free",
      allOrders: "All Matching Orders",
      recentOrders: "Recently Tracked Orders",
      notFound: "No active order found matching your query.",
      statusNew: "New Order (Received)",
      statusConfirmed: "Confirmed",
      statusTailoring: "Printing / Tailoring",
      statusCourier: "With Courier (Out for Delivery)",
      statusDelivered: "Delivered",
      statusCancelled: "Cancelled",
    },
    home: {
      allModels: "All Garments",
      shirtsCategory: "T-Shirts & Shirts",
      hoodiesCategory: "Hoodies & Sweaters",
      pantsCategory: "Pants & Shorts",
      accessoriesCategory: "Accessories",
      viewCollection: "Explore Collection",
      view: "View",
      selectedModels: "CURATED ATELIER PIECES",
      wardrobeFoundation: "FOUNDATION OF YOUR WARDROBE",
      atelierShowcase: "LIVE ATELIER SHOWCASE",
      selectedShowcase: "HORVVALLE SIGNATURE MODELS",
      fourDirections: "COLLECTION STRUCTURE",
      fourDirectionsTitle: "FOUR CORE TAILORING PILLARS",
      fourDirectionsDesc: "Heavyweight combed cotton, plush 3-thread fleece, and precision-tailored trousers. Explore each atelier category.",
    },
    
    "collections": {
        "allModels": "All Garments",
        "shirts": "T-Shirts & Shirts",
        "hoodies": "Hoodies & Sweaters",
        "pants": "Pants & Chinos",
        "accessories": "Accessories",
        "sortBestselling": "Bestselling",
        "sortPriceAsc": "Price: Low to High",
        "sortPriceDesc": "Price: High to Low",
        "sortRating": "Highest Rated",
        "filters": "Filters",
        "resetFilters": "Reset Filters",
        "noProductsFound": "No products found matching your filters.",
        "all": "All",
        "fit": "Fit / Silhouette",
        "size": "Size",
        "filterByFit": "Filter by Fit",
        "filterBySize": "Filter by Size",
        "men": "Men",
        "women": "Women",
        "unisex": "Unisex",
        "gender": "Gender",
        "filterByGender": "Filter by Gender",
        "menCollection": "Men's Collection",
        "womenCollection": "Women's Collection",
        "unisexCollection": "Unisex Collection"
    },
    "checkout": {
        "title": "Checkout & Delivery",
        "contactInfo": "Contact & Shipping Information",
        "fullName": "Full Name",
        "phone": "Phone Number",
        "email": "Email Address",
        "city": "City",
        "address": "Shipping Address",
        "paymentMethod": "Payment Method",
        "creditCard": "Credit / Debit Card",
        "confirmOrder": "Complete Order",
        "loginRequired": "Account Required",
        "loginPrompt": "Please sign in or create an account to proceed with your order.",
        "orderSummary": "Order Summary",
        "itemsTotal": "Subtotal",
        "delivery": "Shipping",
        "free": "FREE EXPRESS",
        "grandTotal": "Grand Total",
        "secureCheckout": "256-Bit SSL Encrypted Checkout & 14-Day Guarantee"
    },
    "account": {
        "title": "Customer Account",
        "logout": "Sign Out",
        "myOrders": "Recent Orders",
        "noOrders": "You have no orders yet.",
        "trackOrder": "Track Order",
        "status": "Status",
        "amount": "Amount",
        "date": "Date"
    },
    "auth": {
        "signIn": "Sign In",
        "signUp": "Create Account",
        "signInWithGoogle": "Continue with Google",
        "fullName": "Full Name",
        "email": "Email Address",
        "password": "Password",
        "dontHaveAccount": "Don't have an account? Sign up",
        "alreadyHaveAccount": "Already have an account? Sign in",
        "registrationSuccess": "Registration successful! Please sign in."
    }
,
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
    footer: {
      fastDelivery: "Fast Delivery",
      fastDeliverySub: "Free in Baku & Sumgait",
      return14Days: "14-Day Returns",
      return14DaysSub: "Easy & guaranteed exchange",
      securePayment: "Secure Payment",
      securePaymentSub: "Apple Pay, Google Pay, Cards",
      naturalMaterials: "Natural Materials",
      naturalMaterialsSub: "100% linen, combed cotton & bamboo",
      brandDesc: "Luxury apparel & bespoke studio. Premium tees, 3-thread heavyweight fleece hoodies, tailored trousers and 3D custom print atelier.",
      newsletterTitle: "BE THE FIRST TO ACCESS NEW DROPS",
      newsletterPlaceholder: "Enter your email address",
      joinBtn: "Join",
      rights: "All rights reserved.",
    },
  },

  ru: {
    nav: {
      home: "Главная",
      collections: "Коллекция",
      men: "Мужское",
      women: "Женское",
      unisex: "Унисекс",
      shirts: "Рубашки",
      hoodies: "Худи",
      pants: "Брюки",
      socks: "Носки",
      accessories: "Аксессуары",
      collection: "Коллекция",
      track: "Отследить заказ",
      studio: "3D Студия",
      login: "Войти / Регистрация",
      account: "Личный Кабинет",
      searchPlaceholder: "Поиск товаров и моделей...",
      searchBtn: "Поиск",
      search: "Поиск",
      cart: "Корзина",
      menuTitle: "Одежда и Студия Печати",
      categories: "Коллекции",
      securePayment: "Безопасная Оплата",
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
      designBtn: "Дизайн в 3D Студии",
      collectionBtn: "Смотреть коллекцию",
      selectSize: "Выберите размер",
      featureCotton: "100% Гребенной Хлопок",
      featureDtg: "Печать Ultra HD DTG",
      featureShipping: "Бесплатная Доставка",
      featureReturn: "14 Дней Гарантия Возврата",
    },
    track: {
      title: "Отследить Заказ",
      subtitle: "Узнайте статус готовности, пошив в ателье и курьерскую доставку",
      byCode: "По Коду Заказа",
      byPhone: "По Номеру Телефона",
      byEmail: "По Почте (Gmail)",
      codePlaceholder: "напр: #VTX-ORD-2026 или 8841",
      phonePlaceholder: "напр: +994 50 123 45 67",
      emailPlaceholder: "напр: vash.email@gmail.com",
      trackBtn: "Отследить",
      trackingBtn: "Поиск...",
      orderSummary: "Детали Заказа",
      orderItems: "Заказанные Товары",
      deliveryAddress: "Адрес Доставки",
      paymentInfo: "Способ Оплаты",
      total: "Общий Итог",
      subtotal: "Товары",
      shipping: "Доставка",
      free: "Бесплатно",
      allOrders: "Все Найденные Заказы",
      recentOrders: "Недавние Заказы",
      notFound: "Активных заказов не найдено.",
      statusNew: "Новый Заказ (Принят)",
      statusConfirmed: "Подтвержден",
      statusTailoring: "В Печати / Пошиве",
      statusCourier: "У Курьера (В Пути)",
      statusDelivered: "Доставлен",
      statusCancelled: "Отменен",
    },
    home: {
      allModels: "Все Модели",
      shirtsCategory: "Футболки и Рубашки",
      hoodiesCategory: "Худи и Свитшоты",
      pantsCategory: "Брюки и Шорты",
      accessoriesCategory: "Аксессуары",
      viewCollection: "В Коллекцию",
      view: "Смотреть",
      selectedModels: "ИЗБРАННЫЕ МОДЕЛИ",
      wardrobeFoundation: "ОСНОВА ВАШЕГО ГАРДЕРОБА",
      atelierShowcase: "ВИТРИНА АТЕЛЬЕ",
      selectedShowcase: "ИЗБРАННЫЕ МОДЕЛИ HORVVALLE",
      fourDirections: "СТРУКТУРА КОЛЛЕКЦИИ",
      fourDirectionsTitle: "ЧЕТЫРЕ ГЛАВНЫХ НАПРАВЛЕНИЯ",
      fourDirectionsDesc: "Плотный гребенной хлопок, теплый 3-х ниточный флис и точный крой брюк.",
    },
    
    "collections": {
        "allModels": "Все модели",
        "shirts": "Футболки и рубашки",
        "hoodies": "Худи и свитшоты",
        "pants": "Брюки и шорты",
        "accessories": "Аксессуары",
        "sortBestselling": "Хиты продаж",
        "sortPriceAsc": "Цена: от низкой к высокой",
        "sortPriceDesc": "Цена: от высокой к низкой",
        "sortRating": "По рейтингу",
        "filters": "Фильтры",
        "resetFilters": "Сбросить фильтры",
        "noProductsFound": "Товаров по выбранным фильтрам не найдено.",
        "all": "Все",
        "fit": "Покрой / Силуэт",
        "size": "Размер",
        "filterByFit": "Фильтр по крою",
        "filterBySize": "Фильтр по размеру",
        "men": "Мужское",
        "women": "Женское",
        "unisex": "Унисекс",
        "gender": "Пол",
        "filterByGender": "Фильтр по полу",
        "menCollection": "Мужская коллекция",
        "womenCollection": "Женская коллекция",
        "unisexCollection": "Унисекс коллекция"
    },
    "checkout": {
        "title": "Оформление Заказа",
        "contactInfo": "Контактные данные и адрес",
        "fullName": "Имя и Фамилия",
        "phone": "Номер телефона",
        "email": "Email адрес",
        "city": "Город",
        "address": "Адрес доставки",
        "paymentMethod": "Способ оплаты",
        "creditCard": "Банковская карта",
        "confirmOrder": "Подтвердить заказ",
        "loginRequired": "Требуется авторизация",
        "loginPrompt": "Пожалуйста, войдите в аккаунт или зарегистрируйтесь для оформления заказа.",
        "orderSummary": "Детали заказа",
        "itemsTotal": "Стоимость товаров",
        "delivery": "Доставка",
        "free": "БЕСПЛАТНО",
        "grandTotal": "Итого к оплате",
        "secureCheckout": "256-Bit SSL Защита платежей и 14 дней гарантия"
    },
    "account": {
        "title": "Личный Кабинет",
        "logout": "Выйти",
        "myOrders": "Мои Заказы",
        "noOrders": "У вас пока нет заказов.",
        "trackOrder": "Отследить",
        "status": "Статус",
        "amount": "Сумма",
        "date": "Дата"
    },
    "auth": {
        "signIn": "Войти",
        "signUp": "Регистрация",
        "signInWithGoogle": "Войти через Google",
        "fullName": "Имя и Фамилия",
        "email": "Электронная почта",
        "password": "Пароль",
        "dontHaveAccount": "Нет аккаунта? Зарегистрируйтесь",
        "alreadyHaveAccount": "Уже есть аккаунт? Войдите",
        "registrationSuccess": "Регистрация прошла успешно! Теперь войдите в аккаунт."
    }
,
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
    footer: {
      fastDelivery: "Быстрая Доставка",
      fastDeliverySub: "Бесплатно в Баку и Сумгаите",
      return14Days: "Возврат 14 Дней",
      return14DaysSub: "Легкий обмен с гарантией",
      securePayment: "Безопасная Оплата",
      securePaymentSub: "Apple Pay, Google Pay, Карты",
      naturalMaterials: "Натуральные Ткани",
      naturalMaterialsSub: "100% лен, гребенной хлопок и бамбук",
      brandDesc: "Дом люксовой одежды и индивидуального пошива. Премиальные футболки, теплые худи из 3-нитки и передовое 3D ателье.",
      newsletterTitle: "УЗНАВАЙТЕ О НОВЫХ РЕЛИЗАХ ПЕРВЫМИ",
      newsletterPlaceholder: "Введите адрес эл. почты",
      joinBtn: "Подписаться",
      rights: "Все права защищены.",
    },
  },

  tr: {
    nav: {
      home: "Ana Sayfa",
      collections: "Koleksiyon",
      men: "Erkek",
      women: "Kadın",
      unisex: "Uniseks",
      shirts: "Gömlek",
      hoodies: "Hudi",
      pants: "Pantolon",
      socks: "Çorap",
      accessories: "Aksesuar",
      collection: "Koleksiyon",
      track: "Sipariş Takibi",
      studio: "3D Özel Stüdyo",
      login: "Giriş Yap / Kaydol",
      account: "Müşteri Hesabı",
      searchPlaceholder: "Ürün veya model ara...",
      searchBtn: "Ara",
      search: "Arama",
      cart: "Sepet",
      menuTitle: "Giyim & Baskı Atölyesi",
      categories: "Koleksiyonlar",
      securePayment: "Güvenli Ödeme",
      currency: "Para Birimi",
      language: "Dil",
    },
    announcements: {
      freeShipping: "BAKÜ VE SUMGAYIT BÖLGESİNE KARGO ÜCRETSİZDİR",
      customStudio: "ÖZEL BASKI STÜDYOSU — KENDİ TASARIMINI GİY",
      cottonLinen: "%100 PREMİUM PENYE PAMUK VE DOĞAL KETEN KOLEKSİYONU",
      guaranteedReturns: "14 GÜN KOLAY VE GARANTİLİ İADE",
      expressDelivery: "HIZLI KURYE VE GÜVENLİ TESLİMAT",
    },
    hero: {
      tag: "HORVVALLE ATELIER · 2026 COUTURE",
      brand: "HORVVALLE",
      subtitle: "LÜKS GİYİM VE ÖZEL DİKİM ATÖLYESİ",
      shirtsBtn: "Gömlekler",
      pantsBtn: "Pantolonlar",
      socksBtn: "Çoraplar",
      studioBtn: "Kendi Tasarımını Yap",
      designBtn: "3D Stüdyoda Tasarla",
      collectionBtn: "Koleksiyonu Gör",
      selectSize: "Beden seç",
      featureCotton: "%100 Saf Penye Pamuk",
      featureDtg: "Ultra HD DTG Baskı",
      featureShipping: "Ücretsiz Kargo İmkanı",
      featureReturn: "14 Gün Kolay İade",
    },
    track: {
      title: "Siparişinizi Takip Edin",
      subtitle: "Siparişinizin durumunu, atölye hazırlığını ve kurye teslimatını anlık izleyin",
      byCode: "Sipariş Kodu İle",
      byPhone: "Telefon Numarası İle",
      byEmail: "E-posta (Gmail) İle",
      codePlaceholder: "örnek: #VTX-ORD-2026 veya 8841",
      phonePlaceholder: "örnek: +994 50 123 45 67",
      emailPlaceholder: "örnek: adiniz@gmail.com",
      trackBtn: "Takip Et",
      trackingBtn: "Aranıyor...",
      orderSummary: "Sipariş Detayları",
      orderItems: "Sipariş Edilen Ürünler",
      deliveryAddress: "Teslimat Adresi",
      paymentInfo: "Ödeme Yöntemi",
      total: "Genel Toplam",
      subtotal: "Ara Toplam",
      shipping: "Kargo",
      free: "Ücretsiz",
      allOrders: "Bulunan Tüm Siparişleriniz",
      recentOrders: "Son Takip Edilenler",
      notFound: "Aramanıza uygun sipariş bulunamadı.",
      statusNew: "Yeni Sipariş (Alındı)",
      statusConfirmed: "Onaylandı",
      statusTailoring: "Baskıda / Terzide",
      statusCourier: "Kuryede (Yolda)",
      statusDelivered: "Teslim Edildi",
      statusCancelled: "İptal Edildi",
    },
    home: {
      allModels: "Tüm Modeller",
      shirtsCategory: "T-Shirt & Gömlek",
      hoodiesCategory: "Hudi & Sweatshirt",
      pantsCategory: "Pantolon & Şort",
      accessoriesCategory: "Aksesuarlar",
      viewCollection: "Koleksiyona Git",
      view: "İncele",
      selectedModels: "SEÇKİN MODELLER",
      wardrobeFoundation: "GARDROBUNUZUN TEMELİ",
      atelierShowcase: "CANLI ATÖLYE VİTRİNİ",
      selectedShowcase: "HORVVALLE İMZA MODELLERİ",
      fourDirections: "KOLEKSİYON YAPISI",
      fourDirectionsTitle: "DÖRT TEMEL TERZİ ALANI",
      fourDirectionsDesc: "Yoğun penye pamuk, sıcak 3iplik polar ve kusursuz kesimli pantolonlar.",
    },
    
    "collections": {
        "allModels": "Tüm modeller",
        "shirts": "T-Shirt & gömlek",
        "hoodies": "Hudi & sweatshirt",
        "pants": "Pantolon & şort",
        "accessories": "Aksesuarlar",
        "sortBestselling": "Çok Satanlar",
        "sortPriceAsc": "Fiyat: Düşükten Yükseğe",
        "sortPriceDesc": "Fiyat: Yüksekten Düşüğe",
        "sortRating": "En Yüksek Puan",
        "filters": "Filtreler",
        "resetFilters": "Filtreleri Sıfırla",
        "noProductsFound": "Seçilen filtrelere uygun ürün bulunamadı.",
        "all": "Tümü",
        "fit": "Kalıp / Kesim",
        "size": "Beden",
        "filterByFit": "Kalıba göre filtrele",
        "filterBySize": "Bedene göre filtrele",
        "men": "Erkek",
        "women": "Kadın",
        "unisex": "Uniseks",
        "gender": "Cinsiyet",
        "filterByGender": "Cinsiyete göre filtrele",
        "menCollection": "Erkek Koleksiyonu",
        "womenCollection": "Kadın Koleksiyonu",
        "unisexCollection": "Uniseks Koleksiyonu"
    },
    "checkout": {
        "title": "Siparişi Tamamla",
        "contactInfo": "İletişim ve Teslimat Bilgileri",
        "fullName": "Ad Soyad",
        "phone": "Telefon Numarası",
        "email": "E-posta Adresi",
        "city": "Şehir",
        "address": "Teslimat Adresi",
        "paymentMethod": "Ödeme Yöntemi",
        "creditCard": "Kredi / Banka Kartı",
        "confirmOrder": "Siparişi Onayla",
        "loginRequired": "Giriş Yapılması Gerekir",
        "loginPrompt": "Siparişinizi tamamlamak için lütfen giriş yapın veya kayıt olun.",
        "orderSummary": "Sipariş Özeti",
        "itemsTotal": "Ara Toplam",
        "delivery": "Kargo",
        "free": "ÜCRETSİZ",
        "grandTotal": "Toplam Tutar",
        "secureCheckout": "256-Bit SSL Güvenli Ödeme ve 14 Gün İade Garantisi"
    },
    "account": {
        "title": "Müşteri Hesabı",
        "logout": "Çıkış Yap",
        "myOrders": "Son Siparişlerim",
        "noOrders": "Henüz bir siparişiniz bulunmuyor.",
        "trackOrder": "Siparişi Takip Et",
        "status": "Durum",
        "amount": "Tutar",
        "date": "Tarih"
    },
    "auth": {
        "signIn": "Giriş Yap",
        "signUp": "Kayıt Ol",
        "signInWithGoogle": "Google ile Devam Et",
        "fullName": "Ad Soyad",
        "email": "E-posta Adresi",
        "password": "Şifre",
        "dontHaveAccount": "Hesabınız yok mu? Kaydolun",
        "alreadyHaveAccount": "Zaten hesabınız var mı? Giriş yapın",
        "registrationSuccess": "Kaydınız başarıyla tamamlandı! Giriş yapabilirsiniz."
    }
,
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
    footer: {
      fastDelivery: "Hızlı Teslimat",
      fastDeliverySub: "Bakü ve Sumgayıt'ta ücretsiz",
      return14Days: "14 Gün İade",
      return14DaysSub: "Kolay ve garantili değişim",
      securePayment: "Güvenli Ödeme",
      securePaymentSub: "Apple Pay, Google Pay, Kartlar",
      naturalMaterials: "Doğal Malzemeler",
      naturalMaterialsSub: "%100 keten, penye pamuk ve bambu",
      brandDesc: "Lüks giyim ve kişiye özel tasarım evi. Premium tişörtler, 3 iplik sıcak hoodieler ve ileri 3D özel baskı atölyesi.",
      newsletterTitle: "YENİ İNDİRİMLERDEN İLK SEN HABERDAR OL",
      newsletterPlaceholder: "E-posta adresinizi girin",
      joinBtn: "Katıl",
      rights: "Tüm hakları saklıdır.",
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
