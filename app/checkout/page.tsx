"use client";

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
  AlertCircle,
  X,
} from "lucide-react";
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
    guaranteeTitle: "HORVVALLE Atelye Zəmanəti",
    guaranteeDesc: "Ölçü uyğun gəlmədikdə 14 gün ərzində asan dəyişmə və ya ödənişin tam geri qaytarılması təmin edilir.",
    helpTitle: "Sifarişdə kömək lazımdır?",
    helpLive: "Canlı Dəstək",
    helpDesc: "Ölçü seçimi, çatdırılma və ya suallarınız üçün birbaşa WhatsApp dəstək xəttimizə yaza bilərsiniz:",
    itemsLabel: "Məhsullar",
    shippingLabel: "Çatdırılma",
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
    guaranteeTitle: "HORVVALLE Atelier Guarantee",
    guaranteeDesc: "Easy exchange or full refund within 14 days if the fit is not suitable.",
    helpTitle: "Need help with your order?",
    helpLive: "Live Support",
    helpDesc: "For sizing assistance, delivery, or general questions, message our direct WhatsApp support:",
    itemsLabel: "Items",
    shippingLabel: "Delivery",
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
    guaranteeTitle: "Гарантия ателье HORVVALLE",
    guaranteeDesc: "Легкий обмен или полный возврат средств в течение 14 дней, если размер не подошел.",
    helpTitle: "Нужна помощь с заказом?",
    helpLive: "Живая поддержка",
    helpDesc: "По вопросам подбора размера, доставки или оформления пишите напрямую в нашу поддержку WhatsApp:",
    itemsLabel: "Товары",
    shippingLabel: "Доставка",
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
    guaranteeTitle: "HORVVALLE Atölye Garantisi",
    guaranteeDesc: "Beden uymadığında 14 gün içinde kolay değişim veya tam iade sağlanır.",
    helpTitle: "Siparişte yardıma mı ihtiyacınız var?",
    helpLive: "Canlı Destek",
    helpDesc: "Beden seçimi, teslimat veya sorularınız için doğrudan WhatsApp destek hattımıza yazabilirsiniz:",
    itemsLabel: "Ürünler",
    shippingLabel: "Teslimat",
  },
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const { formatPrice, currency } = useCurrency();
  const { t, language } = useLanguage();
  const langKey = (language as "az" | "en" | "ru" | "tr") || "az";
  const cT = CHECKOUT_I18N[langKey] || CHECKOUT_I18N.az;
  const { user, profile, isLoading: isAuthLoading, openAuthModal } = useAuth();

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+994 ");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Bakı");
  const [address, setAddress] = useState("");

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

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<"apple_pay" | "google_pay" | "card">("apple_pay");
  const isTestMode = process.env.NEXT_PUBLIC_PAYMENT_MODE === "test";
  const enableCod = process.env.NEXT_PUBLIC_ENABLE_COD !== "false";
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

  // Free delivery for Baku & Sumqayit regardless of cart amount
  const isFreeZone = /^(bak[ıi]|sumqay[ıi]t)/i.test(city.trim());
  const shippingCost = isFreeZone ? 0 : (totalPrice >= 60 ? 0 : 5);
  const discountAmount = promoDiscountAmount > 0 ? promoDiscountAmount : (totalPrice * discountPercent) / 100;
  const finalTotal = Math.max(0, totalPrice - discountAmount + shippingCost);
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

    if (!user) {
      openAuthModal();
      errors.auth = cT.authRequiredOrder;
    }

    if (!fullName.trim()) {
      errors.fullName = cT.enterFullName;
    } else if (fullName.trim().length < 3) {
      errors.fullName = cT.fullNameMin;
    }

    const digits = phone.replace(/\D/g, "");
    if (!phone.trim()) {
      errors.phone = cT.enterPhone;
    } else if (digits.length < 9) {
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

    return errors;
  };

  const validateAll = () => {
    if (!user) {
      openAuthModal();
      setErrorMsg(cT.loginToBuy);
      return false;
    }

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
      const res = await fetch("/api/store/data");
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
        setPromoError("Yanlış promokod.");
        return;
      }

      const minAmount = Number(found.minAmount) || 0;
      if (minAmount > 0 && totalPrice < minAmount) {
        setPromoApplied(false);
        setDiscountPercent(0);
        setPromoDiscountAmount(0);
        setAppliedPromoCode(null);
        setPromoError(`Minimum sifariş məbləği ${minAmount} ₼ olmalıdır.`);
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
      const customerEmail = user.email || email;

      const res = await fetch("/api/store/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: clientOrderId,
          userId: user.id,
          customer: {
            fullName,
            phone,
            email: customerEmail,
            address,
            city,
            country: "Azərbaycan",
          },
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            size: i.size,
            color: i.color,
            price: i.price,
            quantity: i.quantity,
            isCustom: i.type === "custom",
            customData: i.customData || null,
          })),
          paymentMethod:
            chosenMethod === "apple_pay"
              ? "Apple Pay"
              : chosenMethod === "google_pay"
              ? "Google Pay"
              : chosenMethod === "cod"
              ? "Çatdırılmada Ödəniş (COD)"
              : "Bank Kartı (Visa/Mastercard)",
          subtotal: totalPrice,
          shipping: shippingCost,
          discount: discountAmount,
          promoCode: appliedPromoCode || null,
          currency: currency || "AZN",
          orderStatus: chosenMethod === "cod" ? "Təsdiqləndi (COD)" : "Yeni Sifariş",
          total: finalTotal,
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
            paymentMethod: data.order.paymentMethod || chosenMethod,
            paymentStatus: data.order.paymentStatus || (chosenMethod === "cod" ? "confirmed_cod" : isTestMode ? "test_paid" : "Ödənilib"),
            orderStatus: data.order.orderStatus || (chosenMethod === "cod" ? "Təsdiqləndi (COD)" : "Yeni Sifariş"),
            isTest: Boolean(data.order.isTest || isTestMode),
            customer: {
              fullName: fullName || "Müştəri",
              phone: phone || "",
              email: customerEmail,
              address: address || "",
              city: city || "Bakı",
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
    setWalletDebugMsg(null);
    if (!user) {
      openAuthModal();
      setErrorMsg(
        language === "az"
          ? "Məhsul almaq və izləmə kodunuzu əldə etmək üçün zəhmət olmasa daxil olun."
          : "Please sign in to complete your purchase and secure your tracking code."
      );
      return;
    }

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
          countryCode: "AZ",
          currencyCode: currency || "AZN",
          supportedNetworks: ["visa", "masterCard"],
          merchantCapabilities: ["supports3DS"],
          total: {
            label: "HORVVALLE Atelier",
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
              merchantName: "HORVVALLE Atelier",
            },
            transactionInfo: {
              totalPriceStatus: "FINAL",
              totalPriceLabel: "Total",
              totalPrice: finalTotal.toFixed(2),
              currencyCode: currency || "AZN",
              countryCode: "AZ",
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
                    merchantName: "HORVVALLE Atelier",
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
                label: "HORVVALLE Atelier",
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
    if (!validateAll()) {
      return;
    }
    processOrder(paymentMethod);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] text-[#111827] pt-8 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Checkout & Payment Form */}
          <div className="lg:col-span-7 space-y-6">
            {/* Test Mode Banner */}
            {isTestMode && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 text-xs flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                  <span className="font-bold uppercase tracking-wider text-[10px] text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                    TEST MODE
                  </span>
                  <span className="text-[11px] text-amber-800 font-medium">
                    Real ödəniş çəkilmir. Test rejimində təhlükəsiz sınaq sifarişi edə bilərsiniz.
                  </span>
                </div>
              </div>
            )}

            {/* Express 1-Click Payment Row */}
            <div className="bg-white border border-stone-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-600 block text-center">
                {t.checkout.paymentMethod}
              </span>

              <div className="grid grid-cols-2 gap-3">
                {/* Official Native Apple Pay Button */}
                <button
                  type="button"
                  onClick={() => handleNativePayment("apple_pay")}
                  className="py-3 px-4 rounded-full bg-stone-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs active:scale-98 cursor-pointer"
                >
                  <ApplePayLogo className="h-5 w-auto" variant="dark" />
                </button>

                {/* Official Native Google Pay Button */}
                <button
                  type="button"
                  onClick={() => handleNativePayment("google_pay")}
                  className="py-3 px-4 rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-900 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-98 shadow-xs cursor-pointer"
                >
                  <GooglePayLogo className="h-5 w-auto" />
                </button>
              </div>

              {/* Wallet Debug Notification Container */}
              {walletDebugMsg && (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 text-[11px] space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-semibold text-stone-900">
                      <AlertCircle size={14} className="text-amber-600 shrink-0" />
                      <span>{walletDebugMsg.text}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWalletDebugMsg(null)}
                      className="text-stone-400 hover:text-stone-700 p-0.5"
                    >
                      <X size={13} />
                    </button>
                  </div>
                  {isTestMode && (
                    <div className="pt-1.5 flex items-center justify-between border-t border-amber-200/60">
                      <span className="text-stone-600 text-[10.5px]">{cT.testFlowPrompt}</span>
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => processOrder(walletDebugMsg.method || "apple_pay")}
                        className="py-1 px-3.5 rounded-xl bg-stone-900 hover:bg-black text-white text-[10.5px] font-bold uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                      >
                        {isProcessing ? "..." : cT.confirmTestOrder}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <div className="h-px bg-stone-200 flex-1" />
                <span className="text-[11px] font-medium text-stone-400 uppercase tracking-widest">
                  VƏ YA KARTLA ÖDƏ
                </span>
                <div className="h-px bg-stone-200 flex-1" />
              </div>
            </div>

            {/* Animated Luxury Error Alert */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                      <AlertCircle size={16} className="text-rose-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-rose-950">{cT.checkInfo}</div>
                      <div className="text-rose-700 text-[11px] mt-0.5">{errorMsg}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setErrorMsg(null)}
                    className="text-rose-400 hover:text-rose-700 p-1 rounded-lg transition"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Customer Authentication Gate */}
            {!user ? (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs text-stone-900">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                    <Lock size={20} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-eb-garamond text-xl font-normal text-stone-900">
                      {t.checkout.loginRequired}
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {t.checkout.loginPrompt}
                    </p>
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={openAuthModal}
                    className="w-full sm:w-auto py-3 px-6 rounded-full bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer"
                  >
                    {t.auth.signIn} / {t.auth.signUp}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    {(profile?.full_name || user.email || 'H')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                      <span>{profile?.full_name || user.email}</span>
                      <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                        VIP
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500 font-mono">{user.email}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Information Form - noValidate to avoid ugly browser tooltips */}
            <form noValidate onSubmit={handleCardSubmit} className="space-y-6">
              <div className="bg-white border border-stone-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
                <h3 className="font-eb-garamond text-xl font-normal text-stone-900 flex items-center gap-2">
                  <Truck size={18} className="text-stone-700" />
                  <span>1. {t.checkout.contactInfo}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div
                    animate={shakingField === "fullName" ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
                    transition={{ duration: 0.45, ease: "easeInOut" }}
                    className="space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-stone-700 uppercase">{t.checkout.fullName} *</label>
                      {fieldErrors.fullName && (
                        <span className="text-[10px] text-rose-500 font-medium">{cT.reqField}</span>
                      )}
                    </div>
                    <input
                      id="field-fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => handleFieldChange("fullName", e.target.value, setFullName)}
                      className={`w-full rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 transition-all duration-200 focus:outline-none ${
                        fieldErrors.fullName
                          ? "bg-rose-50/40 border border-rose-400 ring-2 ring-rose-200/60 focus:border-rose-500 focus:ring-rose-300"
                          : "bg-stone-50 border border-stone-200 focus:border-stone-900 focus:bg-white focus:ring-1 focus:ring-stone-900"
                      }`}
                    />
                    <AnimatePresence>
                      {fieldErrors.fullName && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.96 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center gap-1.5 text-[11px] font-medium text-rose-600 bg-rose-50/90 border border-rose-200 rounded-lg px-2.5 py-1.5 shadow-xs"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                          <AlertCircle size={13} className="shrink-0 text-rose-600" />
                          <span>{fieldErrors.fullName}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div
                    animate={shakingField === "phone" ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
                    transition={{ duration: 0.45, ease: "easeInOut" }}
                    className="space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-stone-700 uppercase">{t.checkout.phone} *</label>
                      {fieldErrors.phone && (
                        <span className="text-[10px] text-rose-500 font-medium">{cT.reqField}</span>
                      )}
                    </div>
                    <input
                      id="field-phone"
                      type="tel"
                      placeholder="+994 50 123 45 67"
                      value={phone}
                      onChange={(e) => handleFieldChange("phone", e.target.value, setPhone)}
                      className={`w-full rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 transition-all duration-200 focus:outline-none ${
                        fieldErrors.phone
                          ? "bg-rose-50/40 border border-rose-400 ring-2 ring-rose-200/60 focus:border-rose-500 focus:ring-rose-300"
                          : "bg-stone-50 border border-stone-200 focus:border-stone-900 focus:bg-white focus:ring-1 focus:ring-stone-900"
                      }`}
                    />
                    <AnimatePresence>
                      {fieldErrors.phone && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.96 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center gap-1.5 text-[11px] font-medium text-rose-600 bg-rose-50/90 border border-rose-200 rounded-lg px-2.5 py-1.5 shadow-xs"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                          <AlertCircle size={13} className="shrink-0 text-rose-600" />
                          <span>{fieldErrors.phone}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div
                    animate={shakingField === "email" ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
                    transition={{ duration: 0.45, ease: "easeInOut" }}
                    className="space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-stone-700 uppercase">{t.checkout.email} *</label>
                      {user?.email && (
                        <span className="text-[10px] text-emerald-700 font-bold">VIP</span>
                      )}
                    </div>
                    <input
                      id="field-email"
                      type="email"
                      placeholder="ad@example.com"
                      value={user?.email || email}
                      readOnly={Boolean(user?.email)}
                      onChange={(e) => handleFieldChange("email", e.target.value, setEmail)}
                      className={`w-full rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 transition-all duration-200 focus:outline-none ${
                        user?.email
                          ? "bg-stone-100 border border-stone-200 cursor-not-allowed text-stone-600 font-mono"
                          : fieldErrors.email
                          ? "bg-rose-50/40 border border-rose-400 ring-2 ring-rose-200/60 focus:border-rose-500 focus:ring-rose-300"
                          : "bg-stone-50 border border-stone-200 focus:border-stone-900 focus:bg-white focus:ring-1 focus:ring-stone-900"
                      }`}
                    />
                    <AnimatePresence>
                      {fieldErrors.email && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.96 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center gap-1.5 text-[11px] font-medium text-rose-600 bg-rose-50/90 border border-rose-200 rounded-lg px-2.5 py-1.5 shadow-xs"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                          <AlertCircle size={13} className="shrink-0 text-rose-600" />
                          <span>{fieldErrors.email}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-stone-700 uppercase">{t.checkout.city} *</label>
                      <span className="text-[10px] font-semibold text-emerald-700">
                        {isFreeZone ? `✓ ${t.checkout.free}` : cT.regions5}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCity("Bakı");
                          clearFieldError("city");
                        }}
                        className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer text-center ${
                          city === "Bakı"
                            ? "bg-stone-900 text-white border-stone-900 shadow-xs"
                            : "bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400"
                        }`}
                      >
                        Bakı <span className="block text-[9.5px] opacity-80 font-normal">{t.checkout.free}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCity("Sumqayıt");
                          clearFieldError("city");
                        }}
                        className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer text-center ${
                          city === "Sumqayıt"
                            ? "bg-stone-900 text-white border-stone-900 shadow-xs"
                            : "bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400"
                        }`}
                      >
                        Sumqayıt <span className="block text-[9.5px] opacity-80 font-normal">{t.checkout.free}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (city === "Bakı" || city === "Sumqayıt") setCity("");
                        }}
                        className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer text-center ${
                          city !== "Bakı" && city !== "Sumqayıt"
                            ? "bg-stone-900 text-white border-stone-900 shadow-xs"
                            : "bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400"
                        }`}
                      >
                        {t.collections.all} <span className="block text-[9.5px] opacity-80 font-normal">{cT.regionsLabel}</span>
                      </button>
                    </div>

                    {city !== "Bakı" && city !== "Sumqayıt" && (
                      <input
                        id="field-city"
                        type="text"
                        placeholder={cT.regionsPlaceholder}
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full mt-2 bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white focus:ring-1 focus:ring-stone-900 transition"
                      />
                    )}
                  </div>
                </div>

                <motion.div
                  animate={shakingField === "address" ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-700 uppercase">{t.checkout.address} *</label>
                    {fieldErrors.address && (
                      <span className="text-[10px] text-rose-500 font-medium">{cT.reqField}</span>
                    )}
                  </div>
                  <input
                    id="field-address"
                    type="text"
                    placeholder={cT.addressPlaceholder}
                    value={address}
                    onChange={(e) => handleFieldChange("address", e.target.value, setAddress)}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 transition-all duration-200 focus:outline-none ${
                      fieldErrors.address
                        ? "bg-rose-50/40 border border-rose-400 ring-2 ring-rose-200/60 focus:border-rose-500 focus:ring-rose-300"
                        : "bg-stone-50 border border-stone-200 focus:border-stone-900 focus:bg-white focus:ring-1 focus:ring-stone-900"
                    }`}
                  />
                  <AnimatePresence>
                    {fieldErrors.address && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-1.5 text-[11px] font-medium text-rose-600 bg-rose-50/90 border border-rose-200 rounded-lg px-2.5 py-1.5 shadow-xs"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                        <AlertCircle size={13} className="shrink-0 text-rose-600" />
                        <span>{fieldErrors.address}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Payment Method Selector */}
              <div className="bg-white border border-stone-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
                <h3 className="font-eb-garamond text-xl font-normal text-stone-900 flex items-center gap-2">
                  <Lock size={18} className="text-stone-700" />
                  <span>2. {t.checkout.paymentMethod}</span>
                </h3>

                <div className="space-y-2">
                  <label
                    onClick={() => setPaymentMethod("card")}
                    className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === "card"
                        ? "border-stone-900 bg-stone-50 text-stone-900 ring-1 ring-stone-900/10 shadow-xs"
                        : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:text-stone-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard size={20} className={paymentMethod === "card" ? "text-stone-900" : "text-stone-400"} />
                      <div>
                        <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                          <span>{t.checkout.creditCard}</span>
                          <VisaLogo className="h-3 w-auto" />
                          <MastercardLogo className="h-3 w-auto" />
                        </div>
                        <div className="text-[11px] text-stone-500">{t.checkout.secureCheckout}</div>
                      </div>
                    </div>
                    <span className="w-4 h-4 rounded-full border-2 border-stone-300 flex items-center justify-center">
                      {paymentMethod === "card" && <span className="w-2 h-2 rounded-full bg-stone-900" />}
                    </span>
                  </label>

                  {/* Card Form when selected */}
                  {paymentMethod === "card" && (
                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 animate-fadeIn">
                      {isTestMode && (
                        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] flex items-center gap-2">
                          <AlertCircle size={15} className="text-blue-600 shrink-0" />
                          <span>{cT.cardTestNotice}</span>
                        </div>
                      )}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-stone-700 uppercase">{cT.cardName}</label>
                        <input
                          type="text"
                          placeholder="ELSHAN MAMMADOV"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value.toUpperCase())}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 font-mono"
                        />
                      </div>

                      <motion.div
                        animate={shakingField === "cardNumber" ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
                        transition={{ duration: 0.45, ease: "easeInOut" }}
                        className="space-y-1"
                      >
                        <label className="text-[11px] font-semibold text-stone-700 uppercase">{cT.cardNumber}</label>
                        <input
                          id="field-cardNumber"
                          type="text"
                          maxLength={19}
                          placeholder="4127 •••• •••• 9821"
                          value={cardNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").replace(/(\d{4})/g, "$1 ").trim();
                            handleFieldChange("cardNumber", val, setCardNumber);
                          }}
                          className={`w-full rounded-xl px-3 py-2 text-xs text-stone-900 placeholder-stone-400 font-mono transition-all duration-200 focus:outline-none ${
                            fieldErrors.cardNumber
                              ? "bg-rose-50/40 border border-rose-400 ring-2 ring-rose-200/60 focus:border-rose-500"
                              : "bg-white border border-stone-200 focus:border-stone-900"
                          }`}
                        />
                        <AnimatePresence>
                          {fieldErrors.cardNumber && (
                            <motion.div
                              initial={{ opacity: 0, y: -4, scale: 0.96 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -4, scale: 0.96 }}
                              transition={{ duration: 0.2 }}
                              className="flex items-center gap-1.5 text-[11px] font-medium text-rose-600 bg-rose-50/90 border border-rose-200 rounded-lg px-2.5 py-1.5 shadow-xs"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                              <AlertCircle size={13} className="shrink-0 text-rose-600" />
                              <span>{fieldErrors.cardNumber}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      <div className="grid grid-cols-2 gap-3">
                        <motion.div
                          animate={shakingField === "cardExpiry" ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
                          transition={{ duration: 0.45, ease: "easeInOut" }}
                          className="space-y-1"
                        >
                          <label className="text-[11px] font-semibold text-stone-700 uppercase">{cT.cardExpiry}</label>
                          <input
                            id="field-cardExpiry"
                            type="text"
                            maxLength={5}
                            placeholder="12/28"
                            value={cardExpiry}
                            onChange={(e) => handleFieldChange("cardExpiry", e.target.value, setCardExpiry)}
                            className={`w-full rounded-xl px-3 py-2 text-xs text-stone-900 placeholder-stone-400 font-mono transition-all duration-200 focus:outline-none ${
                              fieldErrors.cardExpiry
                                ? "bg-rose-50/40 border border-rose-400 ring-2 ring-rose-200/60 focus:border-rose-500"
                                : "bg-white border border-stone-200 focus:border-stone-900"
                            }`}
                          />
                          <AnimatePresence>
                            {fieldErrors.cardExpiry && (
                              <motion.div
                                initial={{ opacity: 0, y: -4, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-1 text-[10px] font-medium text-rose-600 bg-rose-50/90 border border-rose-200 rounded-lg px-2 py-1 shadow-xs"
                              >
                                <AlertCircle size={12} className="shrink-0 text-rose-600" />
                                <span>{fieldErrors.cardExpiry}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>

                        <motion.div
                          animate={shakingField === "cardCvc" ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
                          transition={{ duration: 0.45, ease: "easeInOut" }}
                          className="space-y-1"
                        >
                          <label className="text-[11px] font-semibold text-stone-700 uppercase">{cT.cardCvc}</label>
                          <input
                            id="field-cardCvc"
                            type="password"
                            maxLength={4}
                            placeholder="•••"
                            value={cardCvc}
                            onChange={(e) => handleFieldChange("cardCvc", e.target.value, setCardCvc)}
                            className={`w-full rounded-xl px-3 py-2 text-xs text-stone-900 placeholder-stone-400 font-mono transition-all duration-200 focus:outline-none ${
                              fieldErrors.cardCvc
                                ? "bg-rose-50/40 border border-rose-400 ring-2 ring-rose-200/60 focus:border-rose-500"
                                : "bg-white border border-stone-200 focus:border-stone-900"
                            }`}
                          />
                          <AnimatePresence>
                            {fieldErrors.cardCvc && (
                              <motion.div
                                initial={{ opacity: 0, y: -4, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-1 text-[10px] font-medium text-rose-600 bg-rose-50/90 border border-rose-200 rounded-lg px-2 py-1 shadow-xs"
                              >
                                <AlertCircle size={12} className="shrink-0 text-rose-600" />
                                <span>{fieldErrors.cardCvc}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 rounded-full bg-stone-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <span>...</span>
                ) : (
                  <>
                    <Lock size={15} />
                    <span>{t.checkout.confirmOrder} — {formatPrice(finalTotal)}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Order Summary & Promo Code */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-stone-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
              <h3 className="font-eb-garamond text-xl font-normal text-stone-900 pb-3 border-b border-stone-100">
                {t.checkout.orderSummary} ({items.length})
              </h3>

              {/* Cart Items list */}
              <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="w-14 h-16 rounded-xl bg-stone-50 border border-stone-200 p-1 flex items-center justify-center shrink-0">
                      <img
                        src={item.customDesignPreview || item.image}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-stone-900 truncate">{item.name}</div>
                      <div className="text-[11px] text-stone-500">
                        {item.size} • {item.color} • {item.quantity} {language === "az" ? "ədəd" : language === "ru" ? "шт." : language === "tr" ? "adet" : "pcs"}
                      </div>
                      {item.type === "custom" && (
                        <span className="text-[9px] font-bold uppercase text-stone-800">
                          {t.nav.studio}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-stone-900">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Form */}
              <div className="pt-3 border-t border-stone-100">
                <form onSubmit={applyPromo} className="flex gap-2">
                  <input
                    type="text"
                    placeholder={language === "az" ? "Promokod daxil edin" : language === "ru" ? "Введите промокод" : language === "tr" ? "Promosyon kodu" : "Enter promo code"}
                    value={promoCode}
                    disabled={promoApplied || isCheckingPromo}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      if (promoError) setPromoError(null);
                    }}
                    className={`bg-stone-50 border rounded-xl px-3 py-2 text-xs text-stone-900 placeholder-stone-400 uppercase flex-1 focus:outline-none transition ${
                      promoError
                        ? "border-rose-400 focus:border-rose-500 bg-rose-50/40"
                        : promoApplied
                        ? "border-emerald-300 bg-emerald-50/30 font-bold"
                        : "border-stone-200 focus:border-stone-900"
                    }`}
                  />
                  {promoApplied ? (
                    <button
                      type="button"
                      onClick={removePromo}
                      className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition cursor-pointer"
                    >
                      {language === "az" ? "Ləğv et" : language === "ru" ? "Отмена" : language === "tr" ? "İptal" : "Cancel"}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isCheckingPromo}
                      className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white font-semibold text-xs uppercase transition disabled:opacity-50 cursor-pointer"
                    >
                      {isCheckingPromo ? "..." : (language === "az" ? "Tətbiq Et" : language === "ru" ? "Применить" : language === "tr" ? "Uygula" : "Apply")}
                    </button>
                  )}
                </form>

                {/* Inline Error Message directly below input */}
                {promoError && (
                  <span className="text-[11px] text-rose-600 font-medium mt-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span>{promoError}</span>
                  </span>
                )}

                {/* Inline Success Message directly below input */}
                {promoApplied && promoSuccessMsg && (
                  <span className="text-[11px] text-emerald-700 font-bold mt-1.5 flex items-center gap-1.5">
                    <span>{promoSuccessMsg}</span>
                  </span>
                )}
              </div>

              {/* Calculations */}
              <div className="pt-3 border-t border-stone-100 text-xs text-stone-600 space-y-2">
                <div className="flex justify-between">
                  <span>{t.checkout.itemsTotal}:</span>
                  <span className="font-bold text-stone-900">{formatPrice(totalPrice)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>
                      {language === "az" ? "Endirim" : language === "ru" ? "Скидка" : language === "tr" ? "İndirim" : "Discount"} {appliedPromoCode ? `(${appliedPromoCode})` : ""}:
                    </span>
                    <span className="font-bold">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{t.checkout.delivery}:</span>
                  <span className="font-bold text-stone-900">
                    {shippingCost === 0 ? (
                      <span className="text-emerald-700">
                        {t.checkout.free} {isFreeZone ? "(Bakı & Sumqayıt)" : ""}
                      </span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-normal text-stone-900 pt-2 border-t border-stone-100">
                  <span>{t.checkout.grandTotal}:</span>
                  <span className="font-eb-garamond text-2xl font-normal text-stone-900">{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>

            {/* Delivery & Guarantee Box */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200/80 text-xs text-stone-600 space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2 text-stone-900 font-semibold">
                <Truck size={17} className="text-emerald-700" />
                <span>{cT.freeDeliveryTitle}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-stone-500">
                {cT.freeDeliveryDesc}
              </p>
              <div className="pt-2 border-t border-stone-100 flex items-center gap-2 text-stone-900 font-semibold">
                <ShieldCheck size={16} className="text-stone-800" />
                <span>{cT.guaranteeTitle}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-stone-500">
                {cT.guaranteeDesc}
              </p>
            </div>

            {/* WhatsApp Assistance card */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 text-xs text-emerald-950 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {cT.helpTitle}
                </span>
                <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">{cT.helpLive}</span>
              </div>
              <p className="text-[11px] text-emerald-800/90 leading-relaxed">
                {cT.helpDesc}
              </p>
              <a
                href="https://wa.me/994557669050?text=Salam!%20Sifarişi%20rəsmiləşdirməkdə%20kömək%20edə%20bilərsiniz?"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-2xs"
              >
                <span>💬 WhatsApp: +994 55-766-90-50</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
