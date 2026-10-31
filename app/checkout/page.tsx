"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import {
  ShieldCheck,
  CreditCard,
  Truck,
  Lock,
  ChevronRight,
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

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const { formatPrice, currency } = useCurrency();

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+994 ");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Bakı");
  const [address, setAddress] = useState("");

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<"apple_pay" | "google_pay" | "card">("apple_pay");

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

  // Modals for Apple Pay & Google Pay simulation
  const [showApplePayModal, setShowApplePayModal] = useState(false);
  const [showGooglePayModal, setShowGooglePayModal] = useState(false);

  // Free delivery for Baku & Sumqayit regardless of cart amount
  const isFreeZone = /^(bak[ıi]|sumqay[ıi]t)/i.test(city.trim());
  const shippingCost = isFreeZone ? 0 : (totalPrice >= 60 ? 0 : 5);
  const discountAmount = promoDiscountAmount > 0 ? promoDiscountAmount : (totalPrice * discountPercent) / 100;
  const finalTotal = Math.max(0, totalPrice - discountAmount + shippingCost);

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
      errors.fullName = "Ad və soyadınızı daxil edin";
    } else if (fullName.trim().length < 3) {
      errors.fullName = "Ad və soyad ən azı 3 hərfdən ibarət olmalıdır";
    }

    const digits = phone.replace(/\D/g, "");
    if (!phone.trim()) {
      errors.phone = "Əlaqə nömrənizi daxil edin";
    } else if (digits.length < 9) {
      errors.phone = "Düzgün əlaqə nömrəsi daxil edin (məs: +994 50 123 45 67)";
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = "Düzgün e-poçt ünvanı daxil edin (məs: ad@example.com)";
      }
    }

    if (!address.trim()) {
      errors.address = "Çatdırılma ünvanınızı qeyd edin";
    } else if (address.trim().length < 4) {
      errors.address = "Daha ətraflı ünvan daxil edin (küçə, bina, mənzil)";
    }

    return errors;
  };

  const validateAll = () => {
    const errors = validateShipping();

    if (paymentMethod === "card") {
      const cleanCard = cardNumber.replace(/\s/g, "");
      if (!cleanCard) {
        errors.cardNumber = "16 rəqəmli kart nömrəsini daxil edin";
      } else if (cleanCard.length < 16) {
        errors.cardNumber = "Kart nömrəsi 16 rəqəmdən ibarət olmalıdır";
      }

      if (!cardExpiry.trim()) {
        errors.cardExpiry = "Bitmə tarixini qeyd edin";
      } else if (!/^\d{2}\/\d{2}$/.test(cardExpiry.trim())) {
        errors.cardExpiry = "Format düzgün deyil (məs: 12/28)";
      }

      if (!cardCvc.trim()) {
        errors.cardCvc = "CVC kodunu daxil edin";
      } else if (cardCvc.trim().length < 3) {
        errors.cardCvc = "3 və ya 4 rəqəmli CVC daxil edin";
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
      setErrorMsg("Zəhmət olmasa qırmızı xəbərdarlıqlı xanaları düzgün doldurun.");
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

  const processOrder = async (chosenMethod: string) => {
    setErrorMsg(null);

    if (items.length === 0) {
      setErrorMsg("Səbətiniz boşdur.");
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch("/api/store/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            fullName,
            phone,
            email: email || "musteri@horvvalle.com",
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
              : "Bank Kartı (Visa/Mastercard)",
          subtotal: totalPrice,
          shipping: shippingCost,
          discount: discountAmount,
          promoCode: appliedPromoCode || null,
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
            paymentStatus: data.order.paymentStatus || "Ödənilib",
            orderStatus: data.order.orderStatus || "Yeni Sifariş",
            customer: {
              fullName: fullName || "Müştəri",
              phone: phone || "",
              email: email || "musteri@horvvalle.com",
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
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-8">
          <Link href="/" className="hover:text-stone-900 transition">Ana Səhifə</Link>
          <ChevronRight size={14} className="text-stone-400" />
          <Link href="/collections" className="hover:text-stone-900 transition">Kolleksiya</Link>
          <ChevronRight size={14} className="text-stone-400" />
          <span className="text-stone-900 font-medium">Təhlükəsiz Ödəniş</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Checkout & Payment Form */}
          <div className="lg:col-span-7 space-y-6">
            {/* Express 1-Click Payment Row */}
            <div className="bg-white border border-stone-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-600 block text-center">
                SÜRƏTLİ BİR-KLİKLƏ ÖDƏNİŞ
              </span>

              <div className="grid grid-cols-2 gap-3">
                {/* Official Apple Pay Button */}
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("apple_pay");
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
                      setErrorMsg("Zəhmət olmasa əvvəlcə çatdırılma məlumatlarını qeyd edin.");
                      return;
                    }
                    setShowApplePayModal(true);
                  }}
                  className="py-3 px-4 rounded-full bg-stone-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs active:scale-98"
                >
                  <ApplePayLogo className="h-5 w-auto" variant="dark" />
                </button>

                {/* Official Google Pay Button */}
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("google_pay");
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
                      setErrorMsg("Zəhmət olmasa əvvəlcə çatdırılma məlumatlarını qeyd edin.");
                      return;
                    }
                    setShowGooglePayModal(true);
                  }}
                  className="py-3 px-4 rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-900 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-98 shadow-xs"
                >
                  <GooglePayLogo className="h-5 w-auto" />
                </button>
              </div>

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
                      <div className="font-semibold text-rose-950">Məlumatları yoxlayın</div>
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

            {/* Customer Information Form - noValidate to avoid ugly browser tooltips */}
            <form noValidate onSubmit={handleCardSubmit} className="space-y-6">
              <div className="bg-white border border-stone-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
                <h3 className="font-eb-garamond text-xl font-normal text-stone-900 flex items-center gap-2">
                  <Truck size={18} className="text-stone-700" />
                  <span>1. Çatdırılma Məlumatları</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div
                    animate={shakingField === "fullName" ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
                    transition={{ duration: 0.45, ease: "easeInOut" }}
                    className="space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-stone-700 uppercase">Ad və Soyad *</label>
                      {fieldErrors.fullName && (
                        <span className="text-[10px] text-rose-500 font-medium">Mütləq sahə</span>
                      )}
                    </div>
                    <input
                      id="field-fullName"
                      type="text"
                      placeholder="Məs: Rəşad Əliyev"
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
                      <label className="text-xs font-semibold text-stone-700 uppercase">Əlaqə Nömrəsi *</label>
                      {fieldErrors.phone && (
                        <span className="text-[10px] text-rose-500 font-medium">Mütləq sahə</span>
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
                      <label className="text-xs font-semibold text-stone-700 uppercase">E-poçt (Qəbz üçün)</label>
                      <span className="text-[10px] text-stone-400">İstəyə bağlı</span>
                    </div>
                    <input
                      id="field-email"
                      type="email"
                      placeholder="ad@example.com"
                      value={email}
                      onChange={(e) => handleFieldChange("email", e.target.value, setEmail)}
                      className={`w-full rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 transition-all duration-200 focus:outline-none ${
                        fieldErrors.email
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
                      <label className="text-xs font-semibold text-stone-700 uppercase">Şəhər / Ərazi *</label>
                      <span className="text-[10px] font-semibold text-emerald-700">
                        {isFreeZone ? "✓ Pulsuz Çatdırılma" : "Bölgə: 5 ₼"}
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
                        Bakı <span className="block text-[9.5px] opacity-80 font-normal">Pulsuz</span>
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
                        Sumqayıt <span className="block text-[9.5px] opacity-80 font-normal">Pulsuz</span>
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
                        Bölgələr <span className="block text-[9.5px] opacity-80 font-normal">Rayonlar</span>
                      </button>
                    </div>

                    {city !== "Bakı" && city !== "Sumqayıt" && (
                      <input
                        id="field-city"
                        type="text"
                        placeholder="Rayon və ya şəhər qeyd edin (Məs: Gəncə, Şəki)"
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
                    <label className="text-xs font-semibold text-stone-700 uppercase">Dəqiq Ünvan (Küçə, Bina, Mənzil) *</label>
                    {fieldErrors.address && (
                      <span className="text-[10px] text-rose-500 font-medium">Mütləq sahə</span>
                    )}
                  </div>
                  <input
                    id="field-address"
                    type="text"
                    placeholder="Məs: Nizami küçəsi 14, mənzil 28"
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
                  <span>2. Ödəniş Üsulu</span>
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
                          <span>Bank Kartı</span>
                          <VisaLogo className="h-3 w-auto" />
                          <MastercardLogo className="h-3 w-auto" />
                        </div>
                        <div className="text-[11px] text-stone-500">256-Bit SSL təhlükəsiz şifrələmə</div>
                      </div>
                    </div>
                    <span className="w-4 h-4 rounded-full border-2 border-stone-300 flex items-center justify-center">
                      {paymentMethod === "card" && <span className="w-2 h-2 rounded-full bg-stone-900" />}
                    </span>
                  </label>

                  {/* Card Form when selected */}
                  {paymentMethod === "card" && (
                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 animate-fadeIn">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-stone-700 uppercase">Kart Üzərindəki Ad</label>
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
                        <label className="text-[11px] font-semibold text-stone-700 uppercase">Kart Nömrəsi</label>
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
                          <label className="text-[11px] font-semibold text-stone-700 uppercase">Bitmə Tarixi (AA/İL)</label>
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
                          <label className="text-[11px] font-semibold text-stone-700 uppercase">CVC / CVV</label>
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
                className="w-full py-4 rounded-full bg-stone-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md active:scale-98 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Ödəniş Təsdiqlənir...</span>
                ) : (
                  <>
                    <Lock size={15} />
                    <span>Ödənişi Tamamla — {formatPrice(finalTotal)}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Order Summary & Promo Code */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-stone-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
              <h3 className="font-eb-garamond text-xl font-normal text-stone-900 pb-3 border-b border-stone-100">
                Sifarişin Xülasəsi ({items.length})
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
                        {item.size} • {item.color} • {item.quantity} ədəd
                      </div>
                      {item.type === "custom" && (
                        <span className="text-[9px] font-bold uppercase text-stone-800">
                          Fərdi Çap
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
                    placeholder="Promokod daxil edin"
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
                      className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition"
                    >
                      Ləğv et
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isCheckingPromo}
                      className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white font-semibold text-xs uppercase transition disabled:opacity-50 cursor-pointer"
                    >
                      {isCheckingPromo ? "Yoxlanır..." : "Tətbiq Et"}
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
                  <span>Məhsulların cəmi:</span>
                  <span className="font-bold text-stone-900">{formatPrice(totalPrice)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>
                      Endirim {appliedPromoCode ? `(${appliedPromoCode})` : ""}:
                    </span>
                    <span className="font-bold">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Çatdırılma:</span>
                  <span className="font-bold text-stone-900">
                    {shippingCost === 0 ? (
                      <span className="text-emerald-700">
                        PULSUZ {isFreeZone ? "(Bakı & Sumqayıt)" : ""}
                      </span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-normal text-stone-900 pt-2 border-t border-stone-100">
                  <span>Yekun Məbləğ:</span>
                  <span className="font-eb-garamond text-2xl font-normal text-stone-900">{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>

            {/* Delivery & Guarantee Box */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200/80 text-xs text-stone-600 space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2 text-stone-900 font-semibold">
                <Truck size={17} className="text-emerald-700" />
                <span>Bakı və Sumqayıt Ərazisinə Pulsuz Çatdırılma</span>
              </div>
              <p className="text-[11px] leading-relaxed text-stone-500">
                Bakı və Sumqayıt daxili bütün sifarişlər heç bir məbləğ məhdudiyyəti olmadan kuryerlə tam pulsuz çatdırılır.
              </p>
              <div className="pt-2 border-t border-stone-100 flex items-center gap-2 text-stone-900 font-semibold">
                <ShieldCheck size={16} className="text-stone-800" />
                <span>HORVVALLE Atelye Zəmanəti</span>
              </div>
              <p className="text-[11px] leading-relaxed text-stone-500">
                Ölçü uyğun gəlmədikdə 14 gün ərzində asan dəyişmə və ya ödənişin tam geri qaytarılması təmin edilir.
              </p>
            </div>

            {/* WhatsApp Assistance card */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 text-xs text-emerald-950 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Sifarişdə kömək lazımdır?
                </span>
                <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Canlı Dəstək</span>
              </div>
              <p className="text-[11px] text-emerald-800/90 leading-relaxed">
                Ölçü seçimi, çatdırılma və ya suallarınız üçün birbaşa WhatsApp dəstək xəttimizə yaza bilərsiniz:
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

      {/* Simulated Apple Pay Sheet Modal */}
      {showApplePayModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl text-center text-stone-900">
            <div className="flex items-center justify-center mx-auto">
              <ApplePayLogo className="h-7 w-auto" variant="light" />
            </div>
            <div>
              <h4 className="font-eb-garamond text-xl font-normal text-stone-900">Apple Pay ilə Təsdiq</h4>
              <p className="text-xs text-stone-500 mt-1">Ödəniləcək məbləğ: <strong className="text-stone-900">{formatPrice(finalTotal)}</strong></p>
            </div>
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 flex items-center justify-between">
              <span>Kart: <strong>•••• 4920 (Apple Wallet)</strong></span>
              <span className="text-emerald-700 font-bold">Hazırdır</span>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowApplePayModal(false);
                  processOrder("apple_pay");
                }}
                className="w-full py-3.5 rounded-full bg-stone-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-black transition"
              >
                Face ID / Təsdiq Et
              </button>
              <button
                onClick={() => setShowApplePayModal(false)}
                className="w-full py-2.5 text-xs text-stone-500 hover:text-stone-900"
              >
                İmtina Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Google Pay Modal */}
      {showGooglePayModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl text-center text-stone-900">
            <div className="flex items-center justify-center mx-auto">
              <GooglePayLogo className="h-7 w-auto" />
            </div>
            <div>
              <h4 className="font-eb-garamond text-xl font-normal text-stone-900">Google Pay ilə Təsdiq</h4>
              <p className="text-xs text-stone-500 mt-1">Ödəniləcək: <strong className="text-stone-900">{formatPrice(finalTotal)}</strong></p>
            </div>
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 flex items-center justify-between">
              <span>Google Wallet: <strong>Visa •••• 3192</strong></span>
              <span className="text-emerald-700 font-bold">Hazırdır</span>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowGooglePayModal(false);
                  processOrder("google_pay");
                }}
                className="w-full py-3.5 rounded-full bg-stone-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-black transition"
              >
                Google Pay ilə Ödə
              </button>
              <button
                onClick={() => setShowGooglePayModal(false)}
                className="w-full py-2.5 text-xs text-stone-500 hover:text-stone-900"
              >
                İmtina Et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
