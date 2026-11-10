"use client";

import { useStoreData, useSupport } from "@/context/StoreDataContext";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import {
  ShieldCheck,
  CreditCard,
  Truck,
  Lock,
  User,
  AlertCircle,
  X,
  Globe,
  Plane,
  ChevronDown,
} from "lucide-react";
import {
  getAllCountries,
  getCountryByCode,
  formatPhoneWithDialCode,
  isValidCountry,
  CountryInfo,
} from "@/lib/countries";
import {
  calculateShippingOptions,
  getShippingOptionById,
  isDomesticDestination,
  ShippingOption,
} from "@/lib/shipping";
import { motion, AnimatePresence } from "framer-motion";
import {
  ApplePayLogo,
  GooglePayLogo,
  VisaLogo,
  MastercardLogo,
  PaymentLogosRow,
} from "@/components/PaymentLogos";
import { playPurchaseSuccessSound } from "@/lib/soundEffects";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { CountrySelect } from "@/components/store/CountrySelect";

const CHECKOUT_I18N = {
  az: {
    testBanner: "Real ödəniş çəkilmir. Test rejimində təhlükəsiz sınaq sifarişi edə bilərsiniz.",
    orPayWithCard: "{cT.orPayWithCard}",
    testFlowPrompt: "Test rejimində axını tam yoxlamaq üçün:",
    confirmTestOrder: "Sınaq Sifarişini Təsdiq Et",
    applePayRequiresSafari: "Apple Pay yalnız iOS Safari və ya macOS Safari brauzerində aktivdir (və HTTPS bağlantısı tələb olunur).",
    applePayNoCards: "canMakePayments() false qaytardı. Səbəb: Apple Wallet-də aktiv bank kartı quraşdırılmayıb və ya domen HTTPS deyil.",
    applePayError: "Apple Pay xətası: Ödəniş pəncərəsi başladıla bilmədi.",
    googlePayNotice: "Google Pay xəbərdarlığı: Brauzerinizdə Google Pay aktiv deyil və ya kart tapılmadı.",
    googlePayNotInstalled: "Google Pay xəbərdarlığı: Cihazınızda Google Pay quraşdırılmayıb.",
    googlePayError: "Google Pay xətası: Google Pay API xətası.",
    checkInfo: "Məlumatları yoxlayın",
    checkErrorsBelow: "Zəhmət olmasa qırmızı xəbərdarlıqlı xanaları düzgün doldurun.",
    fillDeliveryFirst: "Zəhmət olmasa əvvəlcə çatdırılma məlumatlarını qeyd edin.",
    loginToBuy: "Məhsul almaq və izləmə kodunuzu əldə etmək üçün zəhmət olmasa daxil olun.",
    authRequiredOrder: "Sifariş üçün giriş və ya qeydiyyat tələb olunur",
    cartEmpty: "Səbətiniz boşdur.",
    reqField: "Mütləq sahə",
    enterFullName: "Ad və soyadınızı daxil edin",
    fullNameMin: "Ad və soyad ən azı 3 hərfdən ibarət olmalıdır",
    enterPhone: "Əlaqə nömrənizi daxil edin",
    validPhone: "Düzgün əlaqə nömrəsi daxil edin (məs: +994 50 123 45 67)",
    enterEmail: "E-poçt ünvanınızı daxil edin",
    validEmail: "Düzgün e-poçt ünvanı daxil edin (məs: ad@example.com)",
    enterAddress: "Çatdırılma ünvanınızı qeyd edin",
    addressMin: "Daha ətraflı ünvan daxil edin (küçə, bina, mənzil)",
    addressPlaceholder: "Məs: Nizami küçəsi 14, mənzil 28",
    bakuSumqayitFree: "Bakı və Sumqayıt: Pulsuz",
    regions5: "Bölgə: 5 ₼",
    regionsLabel: "Rayonlar",
    regionsPlaceholder: "Rayon və ya şəhər (Gəncə, Şəki)",
    cardName: "Kart Üzerindəki Ad",
    cardNumber: "Kart Nömrəsi",
    cardExpiry: "Bitmə Tarixi (AA/İL)",
    cardCvc: "CVC / CVV",
    cardNumReq: "16 rəqəmli kart nömrəsini daxil edin",
    cardNumMin: "Kart nömrəsi 16 rəqəmdən ibarət olmalıdır",
    cardExpReq: "Bitmə tarixini qeyd edin",
    cardExpFormat: "Format düzgün deyil (məs: 12/28)",
    cardCvcReq: "CVC kodunu daxil edin",
    cardCvcMin: "3 və ya 4 rəqəmli CVC daxil edin",
    cardTestNotice: "Test rejimi: Real kart provayderi (Stripe/PashaBank/Payriff) qoşulana qədər kart məlumatları saxlanılmır və sifariş 'test_paid' statusu ilə test olunur.",
    codTitle: "Çatdırılmada Ödəniş (Nağd / Kuryer POS)",
    codSubtitle: "{cT.codSubtitle}",
    codNoCustom: "Fərdi sifarişlərə şamil olunmur",
    freeDeliveryTitle: "Bakı və Sumqayıt Ərazisinə Pulsuz Çatdırılma",
    freeDeliveryDesc: "Bakı və Sumqayıt daxili bütün sifarişlər heç bir məbləğ məhdudiyyəti olmadan kuryerlə tam pulsuz çatdırılır.",
    guaranteeTitle: "Qaytarma və dəyişmə",
    guaranteeDesc: "Ölçü uyğun gəlmədikdə 14 gün ərzində asan dəyişmə və ya ödənişin tam geri qaytarılması təmin edilir.",
    helpTitle: "Sifarişdə kömək lazımdır?",
    helpLive: "Canlı Dəstək",
    helpDesc: "Ölçü seçimi, çatdırılma və ya suallarınız üçün birbaşa WhatsApp dəstək xəttimizə yaza bilərsiniz:",
    itemsLabel: "Məhsullar",
    shippingLabel: "Çatdırılma",
    countryLabel: "Ölkə",
    selectCountry: "Çatdırılma ölkəsini seçin",
    addressLine1: "Ünvan (Küçə, bina, ev)",
    addressLine2: "Mənzil, blok, mərtəbə (istəyə bağlı)",
    stateOrRegion: "Bölgə / Vilayət / Ştat",
    enterState: "Ştat və ya vilayəti daxil edin",
    postalCode: "Poçt indeksi / ZIP",
    enterPostalCode: "Poçt indeksini daxil edin",
    shippingMethodsTitle: "Çatdırılma Xidməti",
    codAzOnly: "Nağd ödəniş (COD) ləğv edilmişdir. Yalnız təhlükəsiz onlayn ödənişlər qəbul edilir.",
    dduNotice: "Beynəlxalq sifarişlər DDU (Delivered Duty Unpaid) şərtilə göndərilir. Yerli gömrük rüsumları müştəri tərəfindən ödənilir.",
    enterCity: "Zəhmət olmasa şəhər və ya rayonu qeyd edin",
    validCity: "Düzgün şəhər adı daxil edin",
    promoExpired: "Bu promokodun istifadə müddəti bitmişdir.",
    promoMaxUses: "Bu promokodun maksimal istifadə sayı bitmişdir.",
    secureOnlineOnly: "Ödəniş onlayn, kart və ya cüzdanla qəbul edilir.",
  },
  en: {
    testBanner: "No real payment is charged. You can safely complete a test order in test mode.",
    orPayWithCard: "OR PAY WITH CARD",
    testFlowPrompt: "To test the full flow in test mode:",
    confirmTestOrder: "Confirm Test Order",
    applePayRequiresSafari: "Apple Pay is only available in iOS Safari or macOS Safari (and requires an HTTPS connection).",
    applePayNoCards: "canMakePayments() returned false. Reason: No active card configured in Apple Wallet or the domain is not HTTPS.",
    applePayError: "Apple Pay error: Could not launch payment sheet.",
    googlePayNotice: "Google Pay notice: Google Pay is not active in your browser or no card was found.",
    googlePayNotInstalled: "Google Pay notice: Google Pay is not configured on your device.",
    googlePayError: "Google Pay error: Google Pay API error.",
    checkInfo: "Please review your information",
    checkErrorsBelow: "Please correct the highlighted fields before proceeding.",
    fillDeliveryFirst: "Please complete delivery information first.",
    loginToBuy: "Please sign in to complete your purchase and secure your tracking code.",
    authRequiredOrder: "Sign in or registration required to order",
    cartEmpty: "Your cart is empty.",
    reqField: "Required",
    enterFullName: "Please enter your full name",
    fullNameMin: "Full name must be at least 3 letters",
    enterPhone: "Please enter your phone number",
    validPhone: "Please enter a valid phone number (e.g. +994 50 123 45 67)",
    enterEmail: "Please enter your email address",
    validEmail: "Please enter a valid email address (e.g. name@example.com)",
    enterAddress: "Please enter your delivery address",
    addressMin: "Please enter a detailed address (street, building, apt)",
    addressPlaceholder: "e.g. 14 Nizami Street, Apt 28",
    bakuSumqayitFree: "Baku & Sumgayit: Free",
    regions5: "Regions: 5 ₼",
    regionsLabel: "Regions",
    regionsPlaceholder: "Region or city (e.g. Ganja, Shaki)",
    cardName: "Name on Card",
    cardNumber: "Card Number",
    cardExpiry: "Expiry Date (MM/YY)",
    cardCvc: "CVC / CVV",
    cardNumReq: "Please enter a 16-digit card number",
    cardNumMin: "Card number must contain 16 digits",
    cardExpReq: "Please enter expiration date",
    cardExpFormat: "Invalid format (e.g. 12/28)",
    cardCvcReq: "Please enter CVC code",
    cardCvcMin: "Enter a 3 or 4-digit CVC",
    cardTestNotice: "Test Mode: Card details are not stored. The order will be registered with 'test_paid' status until a live provider is configured.",
    codTitle: "Cash on Delivery (Cash / Courier POS)",
    codSubtitle: "Pay with cash or card upon receiving your order from the courier",
    codNoCustom: "Not eligible for custom designs",
    freeDeliveryTitle: "Free Delivery to Baku & Sumgayit",
    freeDeliveryDesc: "All orders within Baku and Sumgayit are delivered completely free of charge by courier, with no minimum spend.",
    guaranteeTitle: "Returns & exchanges",
    guaranteeDesc: "Easy exchange or full refund within 14 days if the fit is not suitable.",
    helpTitle: "Need help with your order?",
    helpLive: "Live Support",
    helpDesc: "For sizing assistance, delivery, or general questions, message our direct WhatsApp support:",
    itemsLabel: "Items",
    shippingLabel: "Delivery",
    countryLabel: "Country",
    selectCountry: "Select destination country",
    addressLine1: "Street address, building, apt",
    addressLine2: "Apartment, suite, unit (optional)",
    stateOrRegion: "State / Province / Region",
    enterState: "Please enter state or province",
    postalCode: "Postal / ZIP Code",
    enterPostalCode: "Please enter postal/ZIP code",
    shippingMethodsTitle: "Shipping Method",
    codAzOnly: "Cash on delivery has been disabled. All orders are securely pre-paid online.",
    dduNotice: "International shipments are delivered DDU (Delivered Duty Unpaid). Applicable local customs fees are handled by customer.",
    enterCity: "Please enter your city or district",
    validCity: "Please enter a valid city name",
    promoExpired: "This promo code has expired.",
    promoMaxUses: "This promo code has reached its maximum usage limit.",
    secureOnlineOnly: "Payment is taken online by card or wallet.",
  },
  ru: {
    testBanner: "Списание средств не производится. В тестовом режиме вы можете безопасно оформить заказ.",
    orPayWithCard: "ИЛИ ОПЛАТИТЕ КАРТОЙ",
    testFlowPrompt: "Для проверки процесса в тестовом режиме:",
    confirmTestOrder: "Подтвердить тестовый заказ",
    applePayRequiresSafari: "Apple Pay доступен только в браузерах Safari на iOS или macOS (и требует подключения HTTPS).",
    applePayNoCards: "canMakePayments() вернул false. Причина: в Apple Wallet не добавлена активная карта или домен не использует HTTPS.",
    applePayError: "Ошибка Apple Pay: Не удалось запустить платежное окно.",
    googlePayNotice: "Предупреждение Google Pay: Google Pay не активен в вашем браузере или карта не найдена.",
    googlePayNotInstalled: "Предупреждение Google Pay: Google Pay не настроен на вашем устройстве.",
    googlePayError: "Ошибка Google Pay: Ошибка API Google Pay.",
    checkInfo: "Проверьте данные",
    checkErrorsBelow: "Пожалуйста, корректно заполните выделенные поля.",
    fillDeliveryFirst: "Пожалуйста, сначала заполните данные доставки.",
    loginToBuy: "Пожалуйста, войдите в аккаунт для оформления заказа и получения трек-кода.",
    authRequiredOrder: "Для оформления заказа требуется вход или регистрация",
    cartEmpty: "Ваша корзина пуста.",
    reqField: "Обязательно",
    enterFullName: "Введите имя и фамилию",
    fullNameMin: "Имя должно содержать не менее 3 букв",
    enterPhone: "Введите контактный номер",
    validPhone: "Введите корректный номер (напр.: +994 50 123 45 67)",
    enterEmail: "Введите адрес эл. почты",
    validEmail: "Введите корректный адрес эл. почты (напр.: name@example.com)",
    enterAddress: "Укажите адрес доставки",
    addressMin: "Укажите подробный адрес (улица, дом, кв.)",
    addressPlaceholder: "Напр.: ул. Низами 14, кв. 28",
    bakuSumqayitFree: "Баку и Сумгаит: Бесплатно",
    regions5: "Регионы: 5 ₼",
    regionsLabel: "Регионы",
    regionsPlaceholder: "Район или город (Гянджа, Шеки)",
    cardName: "Имя на карте",
    cardNumber: "Номер карты",
    cardExpiry: "Срок действия (ММ/ГГ)",
    cardCvc: "CVC / CVV",
    cardNumReq: "Введите 16-значный номер карты",
    cardNumMin: "Номер карты должен состоять из 16 цифр",
    cardExpReq: "Укажите срок действия",
    cardExpFormat: "Неверный формат (напр.: 12/28)",
    cardCvcReq: "Введите код CVC",
    cardCvcMin: "Введите 3- или 4-значный CVC",
    cardTestNotice: "Тестовый режим: Данные карты не сохраняются. Заказ оформляется со статусом 'test_paid' до подключения реального провайдера.",
    codTitle: "Оплата при доставке (Наличные / Терминал)",
    codSubtitle: "Оплатите наличными или картой при получении заказа у курьера",
    codNoCustom: "Недоступно для индивидуальных заказов",
    freeDeliveryTitle: "Бесплатная доставка по Баку и Сумгаиту",
    freeDeliveryDesc: "Все заказы по Баку и Сумгаиту доставляются курьером абсолютно бесплатно, без ограничений по сумме.",
    guaranteeTitle: "Возврат и обмен",
    guaranteeDesc: "Легкий обмен или полный возврат средств в течение 14 дней, если размер не подошел.",
    helpTitle: "Нужна помощь с заказом?",
    helpLive: "Живая поддержка",
    helpDesc: "По вопросам подбора размера, доставки или оформления пишите напрямую в нашу поддержку WhatsApp:",
    itemsLabel: "Товары",
    shippingLabel: "Доставка",
    countryLabel: "Страна",
    selectCountry: "Выберите страну доставки",
    addressLine1: "Адрес (улица, дом, кв.)",
    addressLine2: "Квартира, подъезд, этаж (необязательно)",
    stateOrRegion: "Регион / Область / Штат",
    enterState: "Введите регион или штат",
    postalCode: "Почтовый индекс / ZIP",
    enterPostalCode: "Введите почтовый индекс",
    shippingMethodsTitle: "Способ доставки",
    codAzOnly: "Оплата при получении (COD) отключена. Все заказы оплачиваются онлайн.",
    dduNotice: "Международная доставка осуществляется на условиях DDU.",
    enterCity: "Пожалуйста, укажите город или район",
    validCity: "Введите корректное название города",
    promoExpired: "Срок действия этого промокода истек.",
    promoMaxUses: "Этот промокод исчерпал максимальный лимит использований.",
    secureOnlineOnly: "Оплата принимается онлайн картой или кошельком.",
  },
  tr: {
    testBanner: "Gerçek ödeme alınmaz. Test modunda güvenle deneme siparişi verebilirsiniz.",
    orPayWithCard: "VEYA KARTLA ÖDEYİN",
    testFlowPrompt: "Test modunda tüm akışı denemek için:",
    confirmTestOrder: "Test Siparişini Onayla",
    applePayRequiresSafari: "Apple Pay yalnızca iOS Safari veya macOS Safari tarayıcısında etkindir (ve HTTPS bağlantısı gerektirir).",
    applePayNoCards: "canMakePayments() false döndürdü. Sebep: Apple Wallet'ta etkin bir kart tanımlı değil veya alan adı HTTPS değil.",
    applePayError: "Apple Pay hatası: Ödeme penceresi başlatılamadı.",
    googlePayNotice: "Google Pay uyarısı: Tarayıcınızda Google Pay etkin değil veya kayıtlı kart bulunamadı.",
    googlePayNotInstalled: "Google Pay uyarısı: Cihazınızda Google Pay kurulu değil.",
    googlePayError: "Google Pay hatası: Google Pay API hatası.",
    checkInfo: "Bilgileri kontrol edin",
    checkErrorsBelow: "Lütfen işaretli alanları doğru şekilde doldurun.",
    fillDeliveryFirst: "Lütfen önce teslimat bilgilerini girin.",
    loginToBuy: "Sipariş vermek ve takip kodunuzu almak için lütfen giriş yapın.",
    authRequiredOrder: "Sipariş için giriş veya kayıt gereklidir",
    cartEmpty: "Sepetiniz boş.",
    reqField: "Zorunlu alan",
    enterFullName: "Adınızı ve soyadınızı girin",
    fullNameMin: "Ad ve soyad en az 3 harften oluşmalıdır",
    enterPhone: "İletişim numaranızı girin",
    validPhone: "Geçerli bir telefon numarası girin (örn: +994 50 123 45 67)",
    enterEmail: "E-posta adresinizi girin",
    validEmail: "Geçerli bir e-posta adresi girin (örn: ad@example.com)",
    enterAddress: "Teslimat adresinizi girin",
    addressMin: "Daha ayrıntılı adres girin (sokak, bina, daire)",
    addressPlaceholder: "Örn: Nizami Caddesi 14, Daire 28",
    bakuSumqayitFree: "Bakü ve Sumgayıt: Ücretsiz",
    regions5: "Bölgeler: 5 ₼",
    regionsLabel: "Bölgeler",
    regionsPlaceholder: "Bölge veya şehir (Gence, Şeki)",
    cardName: "Kart Üzerindeki İsim",
    cardNumber: "Kart Numarası",
    cardExpiry: "Son Kullanma Tarihi (AA/YY)",
    cardCvc: "CVC / CVV",
    cardNumReq: "16 haneli kart numarasını girin",
    cardNumMin: "Kart numarası 16 haneden oluşmalıdır",
    cardExpReq: "Son kullanma tarihini girin",
    cardExpFormat: "Geçersiz format (örn: 12/28)",
    cardCvcReq: "CVC kodunu girin",
    cardCvcMin: "3 veya 4 haneli CVC girin",
    cardTestNotice: "Test Modu: Kart bilgileri kaydedilmez. Gerçek ödeme sağlayıcısı bağlanana kadar sipariş 'test_paid' olarak test edilir.",
    codTitle: "Kapıda Ödeme (Nakit / Kurye POS)",
    codSubtitle: "Siparişi kuryeden teslim alırken nakit veya kartla ödeyin",
    codNoCustom: "Özel tasarım ürünler için geçerli değildir",
    freeDeliveryTitle: "Bakü ve Sumgayıt'a Ücretsiz Teslimat",
    freeDeliveryDesc: "Bakü ve Sumgayıt içindeki tüm siparişler herhangi bir tutar sınırı olmaksızın kurye ile tamamen ücretsiz teslim edilir.",
    guaranteeTitle: "İade ve değişim",
    guaranteeDesc: "Beden uymadığında 14 gün içinde kolay değişim veya tam iade sağlanır.",
    helpTitle: "Siparişte yardıma mı ihtiyacınız var?",
    helpLive: "Canlı Destek",
    helpDesc: "Beden seçimi, teslimat veya sorularınız için doğrudan WhatsApp destek hattımıza yazabilirsiniz:",
    itemsLabel: "Ürünler",
    shippingLabel: "Teslimat",
    countryLabel: "Ülke",
    selectCountry: "Teslimat ülkesini seçin",
    addressLine1: "Adres (Sokak, bina, daire)",
    addressLine2: "Daire, kat, blok (isteğe bağlı)",
    stateOrRegion: "Eyalet / İl / Bölge",
    enterState: "Eyalet veya ili girin",
    postalCode: "Posta Kodu / ZIP",
    enterPostalCode: "Posta kodunu girin",
    shippingMethodsTitle: "Teslimat Yöntemi",
    codAzOnly: "Kapıda ödeme (COD) kaldırılmıştır. Tüm siparişler güvenli çevrimiçi ödeme ile alınır.",
    dduNotice: "Uluslararası siparişler DDU (gümrük vergileri alıcıya ait) olarak gönderilir.",
    enterCity: "Lütfen şehir veya ilçeyi giriniz",
    validCity: "Geçerli bir şehir adı giriniz",
    promoExpired: "Bu promosyon kodunun kullanım süresi dolmuştur.",
    promoMaxUses: "Bu promosyon kodunun kullanım limiti dolmuştur.",
    secureOnlineOnly: "Ödeme çevrimiçi, kart veya cüzdanla alınır.",
  },
};

export default function CheckoutPage() {
  const support = useSupport();
  const { settings: storeSettings } = useStoreData();
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const { formatPrice, getProductPrice, currency, isAzerbaijan, detectedCountry } = useCurrency();
  const { t, language } = useLanguage();
  const langKey = (language as "az" | "en" | "ru" | "tr") || "az";
  const cT = CHECKOUT_I18N[langKey] || CHECKOUT_I18N.az;
  const { user, profile, isLoading: isAuthLoading, openAuthModal } = useAuth();

  // Country & Destination State
  const initialCountryCode = detectedCountry && isValidCountry(detectedCountry) ? detectedCountry.toUpperCase() : "AZ";
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(initialCountryCode);
  const [userSelectedCountry, setUserSelectedCountry] = useState(false);
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<string>("domestic_baku_sumgayit");

  const currentCountry: CountryInfo = getCountryByCode(selectedCountryCode) || getCountryByCode("AZ")!;
  const isDomestic = isDomesticDestination(selectedCountryCode);

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+994 ");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Bakı");
  const [address, setAddress] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [stateOrRegion, setStateOrRegion] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Sync detectedCountry from CurrencyContext when geo-detection arrives (if user hasn't manually chosen)
  useEffect(() => {
    if (!userSelectedCountry && detectedCountry && isValidCountry(detectedCountry)) {
      const code = detectedCountry.toUpperCase();
      setSelectedCountryCode(code);
      const c = getCountryByCode(code);
      if (c && code !== "AZ") {
        setPhone(`${c.dialCode} `);
        setCity("");
        setSelectedShippingMethodId("intl_standard");
      }
    }
  }, [detectedCountry, userSelectedCountry]);

  // Auto-fill from authenticated Supabase profile
  useEffect(() => {
    if (user) {
      if (user.email && !email) setEmail(user.email);
      if (profile?.full_name && !fullName) setFullName(profile.full_name);
      else if (user.user_metadata?.full_name && !fullName) setFullName(user.user_metadata.full_name);
      if (profile?.phone && (!phone || phone === "+994 ")) setPhone(profile.phone);
      if (profile?.city && city === "Bakı") setCity(profile.city);
      if (profile?.address && !address) setAddress(profile.address);
    }
  }, [user, profile]);

  const handleCountryChange = (newCode: string) => {
    setUserSelectedCountry(true);
    setSelectedCountryCode(newCode);
    const c = getCountryByCode(newCode);
    if (c) {
      if (newCode === "AZ") {
        const cleanDigits = phone.replace(/\D/g, "");
        if (cleanDigits.length <= 4) {
          setPhone("+994 ");
        } else {
          setPhone(formatPhoneWithDialCode(phone, "AZ"));
        }
        if (!city || city === "Bakı" || city === "Sumqayıt") {
          setCity("Bakı");
        }
        setSelectedShippingMethodId("domestic_baku_sumgayit");
      } else {
        const cleanDigits = phone.replace(/\D/g, "");
        if (cleanDigits.length <= 4) {
          setPhone(`${c.dialCode} `);
        } else {
          setPhone(formatPhoneWithDialCode(phone, newCode));
        }
        if (city === "Bakı" || city === "Sumqayıt") {
          setCity("");
        }
        setSelectedShippingMethodId("intl_standard");
      }
    }
    clearFieldError("country");
    clearFieldError("city");
    clearFieldError("postalCode");
    clearFieldError("stateOrRegion");
  };

  // Payment Selection - default to card so bank fields are ready and strictly validated
  const [paymentMethod, setPaymentMethod] = useState<"apple_pay" | "google_pay" | "card">("card");
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const isTestMode = process.env.NEXT_PUBLIC_PAYMENT_MODE === "test";
  const [walletDebugMsg, setWalletDebugMsg] = useState<{ text: string; method?: string } | null>(null);

  // Load Google Pay SDK in background
  useEffect(() => {
    if (typeof window !== "undefined") {
      const existing = document.getElementById("google-pay-sdk");
      if (!existing) {
        const script = document.createElement("script");
        script.id = "google-pay-sdk";
        script.src = "https://pay.google.com/gp/p/js/pay.js";
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, []);

  // Card Form State
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");

  // Promo code
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoDiscountAmount, setPromoDiscountAmount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccessMsg, setPromoSuccessMsg] = useState<string | null>(null);
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);

  // Status & Validation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [shakingField, setShakingField] = useState<string | null>(null);

  // Effective cart total calculated according to user's region (AZN vs International USD)
  const effectiveSubtotal = items.reduce(
    (sum, item) => sum + getProductPrice(item) * item.quantity,
    0
  );

  // Dynamic Shipping Options Engine
  const shippingOptions: ShippingOption[] = calculateShippingOptions(
    selectedCountryCode,
    effectiveSubtotal,
    currency || "AZN",
    storeSettings?.shipping
  );

  const activeShippingOption: ShippingOption =
    shippingOptions.find((o) => o.id === selectedShippingMethodId) || shippingOptions[0];
  const shippingCost = activeShippingOption ? activeShippingOption.price : 0;
  const isFreeZone = isDomestic && /^(bak[ıi]|sumqay[ıi]t)/i.test(city.trim());

  const discountAmount = promoDiscountAmount > 0 ? promoDiscountAmount : (effectiveSubtotal * discountPercent) / 100;
  const finalTotal = Math.max(0, effectiveSubtotal - discountAmount + shippingCost);
  const hasCustomItems = items.some((i) => i.type === "custom");

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleFieldChange = (field: string, value: string, setter: (val: string) => void) => {
    setter(value);
    clearFieldError(field);
  };

  const validateShipping = () => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) {
      errors.fullName = cT.enterFullName;
    } else if (fullName.trim().length < 3) {
      errors.fullName = cT.fullNameMin;
    }

    const digits = phone.replace(/\D/g, "");
    if (!phone.trim()) {
      errors.phone = cT.enterPhone;
    } else if (isDomestic && digits.length < 9) {
      errors.phone = cT.validPhone;
    } else if (!isDomestic && digits.length < 7) {
      errors.phone = cT.validPhone;
    }

    const customerEmail = user?.email || email;
    if (!customerEmail.trim()) {
      errors.email = cT.enterEmail;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail.trim())) {
        errors.email = cT.validEmail;
      }
    }

    if (!address.trim()) {
      errors.address = cT.enterAddress;
    } else if (address.trim().length < 4) {
      errors.address = cT.addressMin;
    }

    if (isDomestic) {
      if (!city.trim()) {
        errors.city = cT.enterCity || "Zəhmət olmasa şəhər və ya rayonu qeyd edin";
      }
    } else {
      if (!city.trim()) {
        errors.city = cT.enterCity || "Zəhmət olmasa şəhəri qeyd edin";
      } else if (city.trim().length < 2) {
        errors.city = cT.validCity || "Düzgün şəhər adı daxil edin";
      }

      if (currentCountry?.requiresState && !stateOrRegion.trim()) {
        errors.stateOrRegion = cT.enterState || "Zəhmət olmasa ştat və ya vilayəti daxil edin";
      }

      if ((currentCountry?.requiresPostalCode || !isDomestic) && !postalCode.trim()) {
        errors.postalCode = cT.enterPostalCode || "Zəhmət olmasa poçt indeksini daxil edin";
      }
    }

    return errors;
  };

  const validateAll = () => {
    const errors = validateShipping();

    if (paymentMethod === "card") {
      const cleanCard = cardNumber.replace(/\s/g, "");
      if (!cleanCard) {
        errors.cardNumber = cT.cardNumReq;
      } else if (cleanCard.length < 16) {
        errors.cardNumber = cT.cardNumMin;
      }

      if (!cardExpiry.trim()) {
        errors.cardExpiry = cT.cardExpReq;
      } else if (!/^\d{2}\/\d{2}$/.test(cardExpiry.trim())) {
        errors.cardExpiry = cT.cardExpFormat;
      }

      if (!cardCvc.trim()) {
        errors.cardCvc = cT.cardCvcReq;
      } else if (cardCvc.trim().length < 3) {
        errors.cardCvc = cT.cardCvcMin;
      }
    }

    setFieldErrors(errors);

    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const firstField = errorKeys[0];
      setShakingField(firstField);
      setTimeout(() => setShakingField(null), 600);

      const el = document.getElementById(`field-${firstField}`);
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setErrorMsg(cT.checkErrorsBelow);
      return false;
    }

    setErrorMsg(null);
    return true;
  };

  const applyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    setPromoSuccessMsg(null);
    const clean = promoCode.trim().toUpperCase();

    if (!clean) {
      setPromoError("Zəhmət olmasa promokod daxil edin.");
      return;
    }

    setIsCheckingPromo(true);
    try {
      const res = await fetch(`/api/store/promo?code=${encodeURIComponent(clean)}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      const promos: any[] = data.promoCodes || [];

      const found = promos.find(
        (p) => (p.code || "").trim().toUpperCase() === clean
      );

      if (!found || found.active === false) {
        setPromoApplied(false);
        setDiscountPercent(0);
        setPromoDiscountAmount(0);
        setAppliedPromoCode(null);
        setPromoError(langKey === "en" ? "Invalid promo code." : langKey === "ru" ? "Неверный промокод." : langKey === "tr" ? "Geçersiz promosyon kodu." : "Yanlış promokod.");
        return;
      }

      // Check Expiration (Item 22)
      if (found.expiresAt) {
        const expTime = new Date(found.expiresAt).getTime();
        if (!isNaN(expTime) && Date.now() > expTime) {
          setPromoApplied(false);
          setDiscountPercent(0);
          setPromoDiscountAmount(0);
          setAppliedPromoCode(null);
          setPromoError(cT.promoExpired || "Bu promokodun istifadə müddəti bitmişdir.");
          return;
        }
      }

      // Check Maximum Usage Limit (Item 22)
      if (typeof found.maxUses === "number" && found.maxUses > 0) {
        const currentUses = Number(found.uses) || 0;
        if (currentUses >= found.maxUses) {
          setPromoApplied(false);
          setDiscountPercent(0);
          setPromoDiscountAmount(0);
          setAppliedPromoCode(null);
          setPromoError(cT.promoMaxUses || "Bu promokodun maksimal istifadə sayı bitmişdir.");
          return;
        }
      }

      const minAmount = Number(found.minAmount) || 0;
      if (minAmount > 0 && totalPrice < minAmount) {
        setPromoApplied(false);
        setDiscountPercent(0);
        setPromoDiscountAmount(0);
        setAppliedPromoCode(null);
        setPromoError(
          langKey === "en"
            ? `Minimum order amount must be ${minAmount}`
            : langKey === "ru"
            ? `Минимальная сумма заказа должна быть ${minAmount} ₼`
            : langKey === "tr"
            ? `Minimum sipariş tutarı ${minAmount} ₼ olmalıdır`
            : `Minimum sifariş məbləği ${minAmount} ₼ olmalıdır.`
        );
        return;
      }

      if (found.type === "fixed") {
        const val = Number(found.value) || 0;
        setDiscountPercent(0);
        setPromoDiscountAmount(val);
        setPromoApplied(true);
        setAppliedPromoCode(found.code);
        setPromoSuccessMsg(`✓ ${found.code} promokodu tətbiq edildi (-${val} ₼)`);
      } else {
        const pct = Number(found.value) || 0;
        setDiscountPercent(pct);
        setPromoDiscountAmount((totalPrice * pct) / 100);
        setPromoApplied(true);
        setAppliedPromoCode(found.code);
        setPromoSuccessMsg(`✓ ${found.code} promokodu tətbiq edildi (-${pct}%)`);
      }
    } catch (err) {
      setPromoError("Yanlış promokod.");
    } finally {
      setIsCheckingPromo(false);
    }
  };

  const removePromo = () => {
    setPromoCode("");
    setDiscountPercent(0);
    setPromoDiscountAmount(0);
    setPromoApplied(false);
    setAppliedPromoCode(null);
    setPromoError(null);
    setPromoSuccessMsg(null);
  };

  const isSubmittingRef = useRef(false);

  const processOrder = async (chosenMethod: string) => {
    setErrorMsg(null);

    if (!user) {
      setErrorMsg(cT.loginToBuy || "Sifariş üçün giriş və ya qeydiyyat tələb olunur");
      openAuthModal();
      return;
    }

    if (items.length === 0) {
      setErrorMsg("Səbətiniz boşdur.");
      return;
    }

    if (isSubmittingRef.current || isProcessing) {
      return;
    }
    isSubmittingRef.current = true;
    setIsProcessing(true);

    try {
      const clientOrderId = `VTX-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      const customerEmail = user?.email || email;

      const res = await fetch("/api/store/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: clientOrderId,
          userId: user?.id || null,
          customer: {
            fullName,
            phone,
            email: customerEmail,
            address,
            addressLine2: addressLine2.trim() || undefined,
            city: city.trim(),
            stateOrRegion: stateOrRegion.trim() || undefined,
            postalCode: postalCode.trim() || undefined,
            country: currentCountry.name || "Azərbaycan",
            countryCode: selectedCountryCode,
          },
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            size: i.size,
            color: i.color,
            price: getProductPrice(i),
            quantity: i.quantity,
            isCustom: i.type === "custom",
            customData: i.customData || null,
          })),
          paymentMethod:
            chosenMethod === "apple_pay"
              ? "Apple Pay"
              : chosenMethod === "google_pay"
              ? "Google Pay"
              : "Bank Kartı (Visa/Mastercard)",
          shippingMethod: activeShippingOption.id,
          shippingMethodLabel: activeShippingOption.name,
          shipping: shippingCost,
          estimatedDelivery: activeShippingOption.estimatedDays,
          subtotal: effectiveSubtotal,
          discount: discountAmount,
          promoCode: appliedPromoCode || null,
          currency: currency || "AZN",
          orderStatus: "Yeni Sifariş",
          total: finalTotal,
          turnstileToken: turnstileToken || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Sifariş zamanı xəta baş verdi.");
      }

      if (typeof window !== "undefined" && data?.order?.id) {
        try {
          const raw = localStorage.getItem("horvvalle_saved_orders");
          const list = raw ? JSON.parse(raw) : [];
          const filtered = list.filter((item: any) => item.id !== data.order.id);
          
          const fullOrderRecord = {
            id: data.order.id,
            trackingCode: data.order.trackingCode || `AZ-EXP-${data.order.id.replace(/[^0-9]/g, "") || "8841"}`,
            date: data.order.date || new Date().toISOString(),
            total: finalTotal,
            subtotal: totalPrice,
            shipping: shippingCost,
            discount: discountAmount,
            paymentMethod: data.order.paymentMethod || (chosenMethod === "apple_pay" ? "Apple Pay" : chosenMethod === "google_pay" ? "Google Pay" : "Bank Kartı"),
            paymentStatus: data.order.paymentStatus || (isTestMode ? "test_paid" : "Ödənilib"),
            orderStatus: data.order.orderStatus || "Yeni Sifariş",
            isTest: Boolean(data.order.isTest || isTestMode),
            customer: {
              fullName: fullName || "Müştəri",
              phone: phone || "",
              email: customerEmail,
              address: address || "",
              addressLine2: addressLine2.trim() || undefined,
              city: city.trim() || (isDomestic ? "Bakı" : ""),
              stateOrRegion: stateOrRegion.trim() || undefined,
              postalCode: postalCode.trim() || undefined,
              country: currentCountry.name || (isDomestic ? "Azərbaycan" : selectedCountryCode),
              countryCode: selectedCountryCode,
            },
            items: items.map((i) => ({
              productId: i.productId,
              name: i.name,
              size: i.size,
              color: i.color,
              price: i.price,
              quantity: i.quantity,
              image: i.image,
              isCustom: i.type === "custom",
              customData: i.customData || null,
            })),
          };

          filtered.unshift(fullOrderRecord);
          localStorage.setItem("horvvalle_saved_orders", JSON.stringify(filtered.slice(0, 10)));
          localStorage.setItem("horvvalle_last_order", JSON.stringify(fullOrderRecord));
        } catch (e) {}
      }

      clearCart();
      router.push(`/checkout/success?orderId=${data.order.id}&method=${chosenMethod}&total=${finalTotal}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Xəta baş verdi");
      setIsProcessing(false);
      isSubmittingRef.current = false;
    }
  };

  const handleNativePayment = async (method: "apple_pay" | "google_pay") => {
    if (!user) {
      setErrorMsg(cT.loginToBuy || "Sifariş üçün giriş və ya qeydiyyat tələb olunur");
      openAuthModal();
      return;
    }

    setWalletDebugMsg(null);
    setPaymentMethod(method);
    const errors = validateShipping();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      const firstField = Object.keys(errors)[0];
      setShakingField(firstField);
      setTimeout(() => setShakingField(null), 600);
      const el = document.getElementById(`field-${firstField}`);
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setErrorMsg(
        language === "az"
          ? "Zəhmət olmasa əvvəlcə çatdırılma məlumatlarını qeyd edin."
          : "Please complete delivery information first."
      );
      return;
    }

    // 1. Native Apple Pay via Safari Webkit ApplePaySession (iPhone / iPad / Mac)
    if (method === "apple_pay") {
      const hasApplePay = typeof window !== "undefined" && Boolean((window as any).ApplePaySession);
      if (!hasApplePay) {
        const debugReason = cT.applePayRequiresSafari;
        console.warn("[Apple Pay Debug]:", debugReason);
        setWalletDebugMsg({
          method: "apple_pay",
          text: `⚠️ ${debugReason}`,
        });
        return;
      }

      const ApplePaySession = (window as any).ApplePaySession;
      try {
        const canPay = ApplePaySession.canMakePayments();
        if (!canPay) {
          const debugReason = cT.applePayNoCards;
          console.warn("[Apple Pay Debug]:", debugReason);
          setWalletDebugMsg({
            method: "apple_pay",
            text: `⚠️ ${cT.applePayError}: ${debugReason}`,
          });
          return;
        }

        const paymentRequest = {
          countryCode: selectedCountryCode || "AZ",
          currencyCode: currency || "AZN",
          supportedNetworks: ["visa", "masterCard"],
          merchantCapabilities: ["supports3DS"],
          total: {
            label: "HORVVALLE",
            amount: finalTotal.toFixed(2),
            type: "final",
          },
          lineItems: [
            {
              label: cT.itemsLabel,
              amount: totalPrice.toFixed(2),
            },
            {
              label: cT.shippingLabel,
              amount: shippingCost.toFixed(2),
            },
          ],
        };

        const session = new ApplePaySession(3, paymentRequest);

        session.onvalidatemerchant = async (event: any) => {
          try {
            const res = await fetch("/api/payments/apple/validate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ validationURL: event.validationURL }),
            });
            const data = await res.json();
            if (data?.session) {
              session.completeMerchantValidation(data.session);
            } else {
              session.completeMerchantValidation({});
            }
          } catch {
            session.completeMerchantValidation({});
          }
        };

        session.onpaymentauthorized = () => {
          session.completePayment(ApplePaySession.STATUS_SUCCESS);
          processOrder("apple_pay");
        };

        session.oncancel = () => {
          // Native payment sheet was closed/cancelled by user: silent return
          console.info("[Apple Pay]: İstifadəçi ödənişi ləğv etdi.");
        };

        session.begin();
        return;
      } catch (err: any) {
        console.warn("[Apple Pay Error]:", err);
        setWalletDebugMsg({
          method: "apple_pay",
          text: `${cT.applePayError}: ${err?.message || ""}`,
        });
        return;
      }
    }

    // 2. Official Google Pay Integration (TEST Mode)
    if (method === "google_pay") {
      const win = typeof window !== "undefined" ? (window as any) : {};
      if (win.google?.payments?.api?.PaymentsClient) {
        try {
          const paymentsClient = new win.google.payments.api.PaymentsClient({
            environment: "TEST",
          });

          const paymentDataRequest = {
            apiVersion: 2,
            apiVersionMinor: 0,
            allowedPaymentMethods: [
              {
                type: "CARD",
                parameters: {
                  allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                  allowedCardNetworks: ["VISA", "MASTERCARD"],
                },
                tokenizationSpecification: {
                  type: "PAYMENT_GATEWAY",
                  parameters: {
                    gateway: "example",
                    gatewayMerchantId: "exampleGatewayMerchantId",
                  },
                },
              },
            ],
            merchantInfo: {
              merchantId: "12345678901234567890",
              merchantName: "HORVVALLE",
            },
            transactionInfo: {
              totalPriceStatus: "FINAL",
              totalPriceLabel: "Total",
              totalPrice: finalTotal.toFixed(2),
              currencyCode: currency || "AZN",
              countryCode: selectedCountryCode || "AZ",
            },
          };

          const isReady = await paymentsClient.isReadyToPay({
            apiVersion: 2,
            apiVersionMinor: 0,
            allowedPaymentMethods: paymentDataRequest.allowedPaymentMethods,
          });

          if (isReady.result) {
            try {
              const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
              if (paymentData) {
                await processOrder("google_pay");
                return;
              }
            } catch (payErr: any) {
              if (payErr?.statusCode === "CANCELED") {
                console.info("[Google Pay]: İstifadəçi Google Pay pəncərəsini bağladı.");
                return;
              }
              console.warn("Google pay load error:", payErr);
            }
          } else {
            setWalletDebugMsg({
              method: "google_pay",
              text: cT.googlePayNotice,
            });
            return;
          }
        } catch (gErr: any) {
          console.warn("[Google Pay API error]:", gErr);
          setWalletDebugMsg({
            method: "google_pay",
            text: `${cT.googlePayError}: ${gErr?.message || ""}`,
          });
          return;
        }
      } else {
        // Fallback using W3C PaymentRequest API
        if (typeof window !== "undefined" && (window as any).PaymentRequest) {
          try {
            const supportedInstruments = [
              {
                supportedMethods: "https://google.com/pay",
                data: {
                  environment: "TEST",
                  apiVersion: 2,
                  apiVersionMinor: 0,
                  merchantInfo: {
                    merchantName: "HORVVALLE",
                  },
                  allowedPaymentMethods: [
                    {
                      type: "CARD",
                      parameters: {
                        allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                        allowedCardNetworks: ["VISA", "MASTERCARD"],
                      },
                      tokenizationSpecification: {
                        type: "PAYMENT_GATEWAY",
                        parameters: {
                          gateway: "example",
                          gatewayMerchantId: "exampleGatewayMerchantId",
                        },
                      },
                    },
                  ],
                },
              },
            ];

            const details = {
              total: {
                label: "HORVVALLE",
                amount: { currency: currency || "AZN", value: finalTotal.toFixed(2) },
              },
            };

            const pr = new (window as any).PaymentRequest(supportedInstruments, details);
            const canMake = await pr.canMakePayment().catch(() => false);

            if (canMake) {
              const response = await pr.show();
              await response.complete("success");
              await processOrder("google_pay");
              return;
            }
          } catch (err: any) {
            if (err?.name === "AbortError") {
              return;
            }
          }
        }

        setWalletDebugMsg({
          method: "google_pay",
          text: cT.googlePayNotInstalled,
        });
      }
    }
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setErrorMsg(cT.loginToBuy || "Sifariş üçün giriş və ya qeydiyyat tələb olunur");
      openAuthModal();
      return;
    }

    if (paymentMethod === "apple_pay") {
      handleNativePayment("apple_pay");
      return;
    }

    if (paymentMethod === "google_pay") {
      handleNativePayment("google_pay");
      return;
    }

    if (!validateAll()) {
      return;
    }

    processOrder("card");
  };

  // ── view ───────────────────────────────────────────────────────────────────
  const L = (p: { az: string; en: string; ru: string; tr: string }) => (p as Record<string, string>)[langKey] || p.az;
  const money = (v: number) => (currency === "USD" ? `$${v.toFixed(2)}` : `${v.toFixed(2)} ₼`);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [cartSettled, setCartSettled] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setCartSettled(true), 400);
    return () => clearTimeout(id);
  }, []);

  const inputCls = (field?: string) =>
    `w-full border bg-transparent px-3.5 py-3 text-[14px] text-bone placeholder:text-bone-faint transition focus:outline-none ${
      field && fieldErrors[field] ? "border-sale focus:border-sale" : "border-white/20 focus:border-bone"
    }`;
  const labelCls = "mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-bone-dim";
  const FieldError = ({ field }: { field: string }) =>
    fieldErrors[field] ? <p className="mt-1.5 text-[12px] font-semibold text-sale">{fieldErrors[field]}</p> : null;
  const sectionTitle = (n: number, text: string) => (
    <h2 className="mb-5 text-[13px] font-extrabold uppercase tracking-[0.16em]">
      <span className="mr-2 text-bone-faint">{String(n).padStart(2, "0")}</span>
      {text}
    </h2>
  );
  const choice = (on: boolean) =>
    `flex w-full items-center gap-3 border px-4 py-3.5 text-left transition ${on ? "border-bone bg-white/[0.04]" : "border-white/15 hover:border-white/40"}`;
  const radio = (on: boolean) => (
    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${on ? "border-bone" : "border-white/30"}`}>
      {on && <span className="h-2 w-2 rounded-full bg-bone" />}
    </span>
  );

  if (cartSettled && items.length === 0 && !isProcessing) {
    return (
      <div className="flex min-h-[70vh] w-full flex-col items-center justify-center bg-ink px-4 text-center font-grotesk text-bone">
        <h1 className="text-4xl font-black uppercase tracking-tight [font-stretch:112%] sm:text-6xl">
          {L({ az: "Səbət boşdur", en: "Your bag is empty", ru: "Корзина пуста", tr: "Sepetiniz boş" })}
        </h1>
        <Link href="/collections" className="mt-8 rounded-full bg-bone px-7 py-3.5 text-[12px] font-extrabold uppercase tracking-[0.16em] text-ink hover:bg-white">
          {L({ az: "Məhsullara bax", en: "Browse products", ru: "Смотреть товары", tr: "Ürünlere göz at" })}
        </Link>
      </div>
    );
  }

  const summary = (
    <div className="space-y-5">
      <ul className="max-h-[340px] space-y-4 overflow-y-auto pr-1">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            <div className="relative h-20 w-16 shrink-0 bg-tile">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.customDesignPreview || item.image} alt={item.name} className="h-full w-full object-contain p-1.5 mix-blend-multiply" />
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-bone px-1 text-[10px] font-bold text-ink">{item.quantity}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-[13px] font-semibold leading-snug">{item.name}</p>
              <p className="mt-0.5 text-[12px] text-bone-dim">{[item.size, item.color].filter(Boolean).join(" · ")}</p>
            </div>
            <span className="shrink-0 text-[13px] font-semibold tabular-nums">{money(getProductPrice(item) * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <form noValidate onSubmit={applyPromo} className="flex gap-2 border-t border-white/10 pt-5">
        <input
          type="text"
          value={promoCode}
          disabled={promoApplied || isCheckingPromo}
          onChange={(e) => {
            setPromoCode(e.target.value);
            if (promoError) setPromoError(null);
          }}
          placeholder={L({ az: "Promokod", en: "Promo code", ru: "Промокод", tr: "Promosyon kodu" })}
          className={`min-w-0 flex-1 border bg-transparent px-3.5 py-3 text-[13px] uppercase text-bone placeholder:normal-case placeholder:text-bone-faint focus:outline-none ${
            promoError ? "border-sale" : promoApplied ? "border-emerald-400/60" : "border-white/20 focus:border-bone"
          }`}
        />
        {promoApplied ? (
          <button type="button" onClick={removePromo} className="border border-white/20 px-4 text-[11px] font-bold uppercase tracking-[0.14em] hover:border-bone">
            {L({ az: "Sil", en: "Remove", ru: "Убрать", tr: "Kaldır" })}
          </button>
        ) : (
          <button type="submit" disabled={isCheckingPromo} className="bg-bone px-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink disabled:opacity-50">
            {isCheckingPromo ? "…" : L({ az: "Tətbiq et", en: "Apply", ru: "Применить", tr: "Uygula" })}
          </button>
        )}
      </form>
      {promoError && <p className="-mt-3 text-[12px] font-semibold text-sale">{promoError}</p>}
      {promoApplied && promoSuccessMsg && <p className="-mt-3 text-[12px] font-semibold text-emerald-400">{promoSuccessMsg}</p>}

      <dl className="space-y-2.5 border-t border-white/10 pt-5 text-[14px]">
        <div className="flex justify-between">
          <dt className="text-bone-dim">{L({ az: "Ara cəm", en: "Subtotal", ru: "Подытог", tr: "Ara toplam" })}</dt>
          <dd className="tabular-nums">{money(effectiveSubtotal)}</dd>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-400">
            <dt>
              {L({ az: "Endirim", en: "Discount", ru: "Скидка", tr: "İndirim" })}
              {appliedPromoCode ? ` (${appliedPromoCode})` : ""}
            </dt>
            <dd className="tabular-nums">−{money(discountAmount)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt className="text-bone-dim">
            {L({ az: "Çatdırılma", en: "Shipping", ru: "Доставка", tr: "Kargo" })}
            <span className="block text-[12px] text-bone-faint">{activeShippingOption?.name}</span>
          </dt>
          <dd className="text-right tabular-nums">{shippingCost === 0 ? L({ az: "Pulsuz", en: "Free", ru: "Бесплатно", tr: "Ücretsiz" }) : money(shippingCost)}</dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-white/10 pt-4">
          <dt className="text-[12px] font-extrabold uppercase tracking-[0.16em]">{L({ az: "Yekun", en: "Total", ru: "Итого", tr: "Toplam" })}</dt>
          <dd className="text-2xl font-black tabular-nums">{money(finalTotal)}</dd>
        </div>
      </dl>

      <a
        href={support.link("Salam! Sifarişi rəsmiləşdirməkdə kömək edə bilərsiniz?")}
        target="_blank"
        rel="noopener noreferrer"
        className="block border-t border-white/10 pt-5 text-[13px] text-bone-dim hover:text-bone"
      >
        {L({ az: "Sualınız var? WhatsApp-da yazın →", en: "Questions? Message us on WhatsApp →", ru: "Есть вопросы? Напишите в WhatsApp →", tr: "Sorunuz mu var? WhatsApp'tan yazın →" })}
      </a>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-ink font-grotesk text-bone">
      {/* phones: order summary as a collapsible bar */}
      <div className="border-b border-white/10 lg:hidden">
        <button type="button" onClick={() => setSummaryOpen(!summaryOpen)} className="flex w-full items-center justify-between px-4 py-4">
          <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em]">
            {summaryOpen ? L({ az: "Xülasəni gizlət", en: "Hide summary", ru: "Скрыть", tr: "Özeti gizle" }) : L({ az: "Sifariş xülasəsi", en: "Order summary", ru: "Сводка заказа", tr: "Sipariş özeti" })}
            <ChevronDown size={15} className={`transition ${summaryOpen ? "rotate-180" : ""}`} />
          </span>
          <span className="text-lg font-black tabular-nums">{money(finalTotal)}</span>
        </button>
        {summaryOpen && <div className="px-4 pb-6">{summary}</div>}
      </div>

      <div className="mx-auto grid max-w-[1240px] gap-12 px-4 pb-24 pt-8 sm:px-6 lg:grid-cols-12 lg:px-10">
        <form noValidate onSubmit={handleCardSubmit} className="lg:col-span-7">
          <h1 className="text-[11vw] font-black uppercase leading-[0.9] tracking-[-0.02em] [font-stretch:112%] sm:text-6xl">
            {L({ az: "Sifariş", en: "Checkout", ru: "Оформление", tr: "Ödeme" })}
          </h1>

          {isTestMode && (
            <p className="mt-5 border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-[13px] text-amber-200">
              {cT.testBanner}
            </p>
          )}

          {errorMsg && (
            <div className="mt-5 flex items-start justify-between gap-3 border border-sale/50 bg-sale/10 px-4 py-3 text-[13px]">
              <div>
                <p className="font-bold text-sale">{cT.checkInfo}</p>
                <p className="mt-0.5 text-bone-dim">{errorMsg}</p>
              </div>
              <button type="button" onClick={() => setErrorMsg(null)} className="text-bone-faint hover:text-bone" aria-label="×">
                <X size={15} />
              </button>
            </div>
          )}

          {/* account */}
          <div className="mt-8 flex flex-col gap-3 border border-white/15 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            {user ? (
              <p className="text-[13px] text-bone-dim">
                {L({ az: "Hesab:", en: "Signed in as", ru: "Вы вошли как", tr: "Giriş yapan:" })} <span className="font-semibold text-bone">{user.email}</span>
              </p>
            ) : (
              <>
                <p className="text-[13px] leading-relaxed text-bone-dim">
                  {L({
                    az: "Sifarişi və izləmə kodunu itirməmək üçün əvvəlcə hesaba daxil olun və ya qeydiyyatdan keçin.",
                    en: "Sign in or create an account first, so your order and tracking code are saved.",
                    ru: "Сначала войдите или зарегистрируйтесь, чтобы заказ и трек-код сохранились.",
                    tr: "Siparişiniz ve takip kodunuz kaybolmasın diye önce giriş yapın veya kayıt olun.",
                  })}
                </p>
                <button type="button" onClick={openAuthModal} className="shrink-0 rounded-full bg-bone px-5 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink hover:bg-white">
                  {t.auth.signIn}
                </button>
              </>
            )}
          </div>

          {/* 1. address */}
          <section className="mt-10">
            {sectionTitle(1, L({ az: "Çatdırılma ünvanı", en: "Shipping address", ru: "Адрес доставки", tr: "Teslimat adresi" }))}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="field-country" className={labelCls}>{cT.countryLabel}</label>
                <CountrySelect id="field-country" value={selectedCountryCode} onChange={handleCountryChange} placeholder={cT.countryLabel} />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="field-fullName" className={labelCls}>{t.checkout.fullName} *</label>
                <input id="field-fullName" autoComplete="name" value={fullName} onChange={(e) => handleFieldChange("fullName", e.target.value, setFullName)} className={inputCls("fullName")} />
                <FieldError field="fullName" />
              </div>
              <div>
                <label htmlFor="field-phone" className={labelCls}>{t.checkout.phone} *</label>
                <input id="field-phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => handleFieldChange("phone", e.target.value, setPhone)} className={inputCls("phone")} />
                <FieldError field="phone" />
              </div>
              <div>
                <label htmlFor="field-email" className={labelCls}>{t.checkout.email} *</label>
                <input
                  id="field-email"
                  type="email"
                  autoComplete="email"
                  value={user?.email || email}
                  disabled={Boolean(user?.email)}
                  onChange={(e) => handleFieldChange("email", e.target.value, setEmail)}
                  className={`${inputCls("email")} disabled:text-bone-dim`}
                />
                <FieldError field="email" />
              </div>

              {isDomestic ? (
                <div className="sm:col-span-2">
                  <span className={labelCls}>{t.checkout.city} *</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: "Bakı", label: "Bakı", sub: t.checkout.free, id: "domestic_baku_sumgayit" },
                      { key: "Sumqayıt", label: "Sumqayıt", sub: t.checkout.free, id: "domestic_baku_sumgayit" },
                      { key: "", label: cT.regionsLabel, sub: "", id: "domestic_region" },
                    ].map((o) => {
                      const on = o.key ? city === o.key : city !== "Bakı" && city !== "Sumqayıt";
                      return (
                        <button
                          key={o.label}
                          type="button"
                          onClick={() => {
                            if (o.key) setCity(o.key);
                            else if (city === "Bakı" || city === "Sumqayıt") setCity("");
                            setSelectedShippingMethodId(o.id);
                            clearFieldError("city");
                          }}
                          className={`border px-2 py-2.5 text-center text-[13px] font-semibold transition ${on ? "border-bone bg-bone text-ink" : "border-white/20 hover:border-bone"}`}
                        >
                          {o.label}
                          {o.sub && <span className={`block text-[11px] font-normal ${on ? "text-ink/70" : "text-bone-faint"}`}>{o.sub}</span>}
                        </button>
                      );
                    })}
                  </div>
                  {city !== "Bakı" && city !== "Sumqayıt" && (
                    <>
                      <input id="field-city" value={city} placeholder={cT.regionsPlaceholder} onChange={(e) => handleFieldChange("city", e.target.value, setCity)} className={`${inputCls("city")} mt-2`} />
                      <FieldError field="city" />
                    </>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="field-city" className={labelCls}>{t.checkout.city} *</label>
                    <input id="field-city" autoComplete="address-level2" value={city} onChange={(e) => handleFieldChange("city", e.target.value, setCity)} className={inputCls("city")} />
                    <FieldError field="city" />
                  </div>
                  <div>
                    <label htmlFor="field-postalCode" className={labelCls}>{cT.postalCode} *</label>
                    <input id="field-postalCode" autoComplete="postal-code" value={postalCode} onChange={(e) => handleFieldChange("postalCode", e.target.value, setPostalCode)} className={inputCls("postalCode")} />
                    <FieldError field="postalCode" />
                  </div>
                  {currentCountry?.requiresState && (
                    <div className="sm:col-span-2">
                      <label htmlFor="field-stateOrRegion" className={labelCls}>{cT.stateOrRegion} *</label>
                      <input id="field-stateOrRegion" autoComplete="address-level1" value={stateOrRegion} onChange={(e) => handleFieldChange("stateOrRegion", e.target.value, setStateOrRegion)} className={inputCls("stateOrRegion")} />
                      <FieldError field="stateOrRegion" />
                    </div>
                  )}
                </>
              )}

              <div className="sm:col-span-2">
                <label htmlFor="field-address" className={labelCls}>{cT.addressLine1 || t.checkout.address} *</label>
                <input id="field-address" autoComplete="address-line1" value={address} placeholder={cT.addressPlaceholder} onChange={(e) => handleFieldChange("address", e.target.value, setAddress)} className={inputCls("address")} />
                <FieldError field="address" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="field-addressLine2" className={labelCls}>{cT.addressLine2}</label>
                <input id="field-addressLine2" autoComplete="address-line2" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} className={inputCls()} />
              </div>
            </div>
            {!isDomestic && <p className="mt-4 text-[12px] leading-relaxed text-bone-faint">{cT.dduNotice}</p>}
          </section>

          {/* 2. shipping */}
          <section className="mt-12">
            {sectionTitle(2, L({ az: "Çatdırılma üsulu", en: "Shipping method", ru: "Способ доставки", tr: "Kargo yöntemi" }))}
            <div className="space-y-2">
              {shippingOptions.map((opt) => {
                const on = activeShippingOption?.id === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSelectedShippingMethodId(opt.id);
                      if (isDomestic) {
                        if (opt.id === "domestic_baku_sumgayit" && city !== "Bakı" && city !== "Sumqayıt") setCity("Bakı");
                        else if (opt.id === "domestic_region" && (city === "Bakı" || city === "Sumqayıt")) setCity("");
                      }
                    }}
                    className={choice(on)}
                  >
                    {radio(on)}
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-semibold">{opt.name}</span>
                      <span className="block text-[12px] text-bone-dim">{[opt.carrier, opt.estimatedDays].filter(Boolean).join(" · ")}</span>
                    </span>
                    <span className="shrink-0 text-[14px] font-semibold tabular-nums">{opt.price === 0 ? t.checkout.free : money(opt.price)}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 3. payment */}
          <section className="mt-12">
            {sectionTitle(3, L({ az: "Ödəniş", en: "Payment", ru: "Оплата", tr: "Ödeme" }))}
            <div className="space-y-2">
              <button type="button" onClick={() => setPaymentMethod("card")} className={choice(paymentMethod === "card")}>
                {radio(paymentMethod === "card")}
                <span className="flex-1 text-[14px] font-semibold">{L({ az: "Bank kartı", en: "Card", ru: "Банковская карта", tr: "Banka kartı" })}</span>
                <span className="flex items-center gap-1.5">
                  <VisaLogo className="h-4 w-auto" />
                  <MastercardLogo className="h-4 w-auto" />
                </span>
              </button>
              {paymentMethod === "card" && (
                <div className="grid gap-4 border border-t-0 border-white/15 px-4 pb-5 pt-4 sm:grid-cols-2">
                  {isTestMode && <p className="text-[12px] leading-relaxed text-sky-300 sm:col-span-2">{cT.cardTestNotice}</p>}
                  <div className="sm:col-span-2">
                    <label htmlFor="field-cardName" className={labelCls}>{cT.cardName}</label>
                    <input id="field-cardName" autoComplete="cc-name" value={cardName} onChange={(e) => setCardName(e.target.value.toUpperCase())} className={inputCls()} />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="field-cardNumber" className={labelCls}>{cT.cardNumber}</label>
                    <input
                      id="field-cardNumber"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      maxLength={19}
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={(e) => handleFieldChange("cardNumber", e.target.value.replace(/\D/g, "").replace(/(\d{4})/g, "$1 ").trim(), setCardNumber)}
                      className={`${inputCls("cardNumber")} font-mono tracking-wider`}
                    />
                    <FieldError field="cardNumber" />
                  </div>
                  <div>
                    <label htmlFor="field-cardExpiry" className={labelCls}>{cT.cardExpiry}</label>
                    <input
                      id="field-cardExpiry"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      maxLength={5}
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => {
                        const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                        handleFieldChange("cardExpiry", d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d, setCardExpiry);
                      }}
                      className={`${inputCls("cardExpiry")} font-mono`}
                    />
                    <FieldError field="cardExpiry" />
                  </div>
                  <div>
                    <label htmlFor="field-cardCvc" className={labelCls}>{cT.cardCvc}</label>
                    <input
                      id="field-cardCvc"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      maxLength={4}
                      placeholder="•••"
                      value={cardCvc}
                      onChange={(e) => handleFieldChange("cardCvc", e.target.value.replace(/\D/g, ""), setCardCvc)}
                      className={`${inputCls("cardCvc")} font-mono`}
                    />
                    <FieldError field="cardCvc" />
                  </div>
                  <p className="text-[12px] text-bone-faint sm:col-span-2">
                    {L({ az: "Kart məlumatlarınız saytda saxlanılmır.", en: "Card details are not stored on this site.", ru: "Данные карты не хранятся на сайте.", tr: "Kart bilgileri sitede saklanmaz." })}
                  </p>
                </div>
              )}

              <button type="button" onClick={() => setPaymentMethod("apple_pay")} className={choice(paymentMethod === "apple_pay")}>
                {radio(paymentMethod === "apple_pay")}
                <span className="flex-1 text-[14px] font-semibold">Apple Pay</span>
                <span className="rounded bg-bone px-1.5 py-0.5"><ApplePayLogo className="h-4 w-auto" variant="light" /></span>
              </button>
              <button type="button" onClick={() => setPaymentMethod("google_pay")} className={choice(paymentMethod === "google_pay")}>
                {radio(paymentMethod === "google_pay")}
                <span className="flex-1 text-[14px] font-semibold">Google Pay</span>
                <span className="rounded bg-bone px-1.5 py-0.5"><GooglePayLogo className="h-4 w-auto" /></span>
              </button>
            </div>

            {walletDebugMsg && (
              <div className="mt-3 border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-[13px]">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-amber-200">{walletDebugMsg.text}</p>
                  <button type="button" onClick={() => setWalletDebugMsg(null)} className="text-bone-faint hover:text-bone" aria-label="×">
                    <X size={14} />
                  </button>
                </div>
                {isTestMode && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-amber-400/20 pt-3">
                    <span className="text-[12px] text-bone-dim">{cT.testFlowPrompt}</span>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => processOrder(walletDebugMsg.method || "apple_pay")}
                      className="rounded-full bg-bone px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink disabled:opacity-50"
                    >
                      {isProcessing ? "…" : cT.confirmTestOrder}
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>

          <button
            type="submit"
            disabled={isProcessing}
            className="mt-10 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-bone text-[12px] font-extrabold uppercase tracking-[0.16em] text-ink transition hover:bg-white disabled:opacity-60"
          >
            {isProcessing ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
            ) : paymentMethod === "apple_pay" ? (
              <>
                <ApplePayLogo className="h-5 w-auto" variant="light" /> · {money(finalTotal)}
              </>
            ) : paymentMethod === "google_pay" ? (
              <>
                <GooglePayLogo className="h-5 w-auto" /> · {money(finalTotal)}
              </>
            ) : (
              <>
                {L({ az: "Sifarişi təsdiqlə", en: "Place order", ru: "Оформить заказ", tr: "Siparişi onayla" })} · {money(finalTotal)}
              </>
            )}
          </button>
          <p className="mt-4 text-center text-[12px] text-bone-faint">
            {L({ az: "Sifariş verməklə ", en: "By placing the order you accept the ", ru: "Оформляя заказ, вы принимаете ", tr: "Sipariş vererek " })}
            <Link href="/terms" className="underline underline-offset-4 hover:text-bone">
              {L({ az: "istifadə şərtlərini", en: "terms of service", ru: "условия", tr: "kullanım şartlarını" })}
            </Link>
            {L({ az: " qəbul edirsiniz.", en: ".", ru: ".", tr: " kabul edersiniz." })}
          </p>
        </form>

        {/* summary (desktop) */}
        <aside className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-24 border border-white/10 bg-ink-850 p-6">
            <h2 className="mb-5 text-[13px] font-extrabold uppercase tracking-[0.16em]">
              {L({ az: "Sifariş xülasəsi", en: "Order summary", ru: "Сводка заказа", tr: "Sipariş özeti" })} ({items.length})
            </h2>
            {summary}
          </div>
        </aside>
      </div>
    </div>
  );
}
