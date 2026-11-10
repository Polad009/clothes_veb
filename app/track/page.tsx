"use client";

import { useSupport } from "@/context/StoreDataContext";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  Phone,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Calendar,
  CreditCard,
  XCircle,
  Mail,
  Smartphone,
  HelpCircle,
  History,
  MessageCircle,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

interface OrderTrackingData {
  id: string;
  date: string;
  customer: {
    fullName: string;
    phone: string;
    city: string;
    address: string;
  };
  items: Array<{
    productId?: string;
    name: string;
    size?: string;
    color?: string;
    quantity?: number;
    price?: number;
    image?: string;
  }>;
  paymentMethod: string;
  paymentStatus: string;
  subtotal?: number;
  shipping?: number;
  total: number;
  orderStatus: string;
  trackingCode: string;
  statusMeta: {
    step: number;
    isCancelled: boolean;
    label: string;
    color: string;
  };
  relatedPod?: {
    garmentType: string;
    garmentColor: string;
    size: string;
    frontArtwork?: string;
    originalImage?: string;
  } | null;
}

function OrderTrackerContent() {
  const support = useSupport();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || searchParams.get("orderId") || "";

  const { formatPrice, currency } = useCurrency();
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [query, setQuery] = useState(initialQuery);
  const [searchMode, setSearchMode] = useState<"code" | "phone" | "email">("code");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderTrackingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allMatches, setAllMatches] = useState<any[] | null>(null);
  const [recentSavedOrders, setRecentSavedOrders] = useState<any[]>([]);

  // Load orders saved on this device (auto-backup)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("horvvalle_saved_orders");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRecentSavedOrders(parsed);
          }
        }
      } catch (e) {}
    }
  }, []);

  // Helper to map textual order status to stepper index
  const getLocalStepIndex = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s.includes("ləğv") || s.includes("legv") || s.includes("cancel")) {
      return { step: 0, isCancelled: true, label: "Ləğv edildi", color: "rose" };
    }
    if (s.includes("çatdırıldı") || s.includes("catdirildi") || s.includes("tamam") || s.includes("delivered")) {
      return { step: 4, isCancelled: false, label: "Çatdırıldı", color: "emerald" };
    }
    if (s.includes("kuryer") || s.includes("yoldadır") || s.includes("yoldadir") || s.includes("courier") || s.includes("shipped")) {
      return { step: 3, isCancelled: false, label: "Kuryerdədir (Yoldadır)", color: "teal" };
    }
    // Older orders may still carry the retired "Çapda / Dərzidə" status: shown as confirmed
    if (s.includes("təsdiq") || s.includes("tesdiq") || s.includes("confirmed") || s.includes("çap") || s.includes("dərzi")) {
      return { step: 2, isCancelled: false, label: "Təsdiqləndi", color: "indigo" };
    }
    return { step: 1, isCancelled: false, label: "Yeni Sifariş (Qəbul edildi)", color: "sky" };
  };

  // Search local orders fallback (Bulletproof client-side recovery)
  const searchLocalOrders = (searchVal: string, isPhoneMode: boolean): OrderTrackingData | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("horvvalle_saved_orders");
      const lastRaw = localStorage.getItem("horvvalle_last_order");
      const list: any[] = [];
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) list.push(...parsed);
        } catch (e) {}
      }
      if (lastRaw) {
        try {
          const parsedLast = JSON.parse(lastRaw);
          if (parsedLast && !list.some((item) => item.id === parsedLast.id)) {
            list.unshift(parsedLast);
          }
        } catch (e) {}
      }

      if (list.length === 0) return null;

      const cleanQ = searchVal.trim().toUpperCase().replace(/^#/, "");
      const qDigits = searchVal.replace(/\D/g, "");

      const matched = list.find((o) => {
        const oId = (o.id || "").toUpperCase().replace(/^#/, "");
        const oTrack = (o.trackingCode || "").toUpperCase();
        const oPhoneDigits = (o.customer?.phone || o.phone || "").replace(/\D/g, "");

        if (isPhoneMode) {
          // STRICT PHONE MATCHING: Do NOT match random order numbers
          if (!oPhoneDigits || qDigits.length < 7) return false;
          if (oPhoneDigits === qDigits) return true;
          if (qDigits.length >= 9 && oPhoneDigits.length >= 9 && oPhoneDigits.slice(-9) === qDigits.slice(-9)) return true;
          if (qDigits.length === 7 && oPhoneDigits.length >= 7 && oPhoneDigits.slice(-7) === qDigits) return true;
          return false;
        }

        // ORDER CODE MATCHING
        if (oId === cleanQ || oTrack === cleanQ) return true;
        if (cleanQ.length >= 4 && (oId.includes(cleanQ) || oTrack.includes(cleanQ))) return true;

        const oIdDigits = oId.replace(/\D/g, "");
        const oTrackDigits = oTrack.replace(/\D/g, "");
        if (qDigits.length >= 4 && qDigits.length <= 6) {
          if (oIdDigits === qDigits || oTrackDigits === qDigits) return true;
        }

        return false;
      });

      if (matched) {
        const statusMeta = getLocalStepIndex(matched.orderStatus || "Qəbul edildi");
        const formatted: OrderTrackingData = {
          id: matched.id,
          date: matched.date || new Date().toISOString(),
          customer: {
            fullName: matched.customer?.fullName || "Müştəri",
            phone: matched.customer?.phone || matched.phone || "-",
            city: matched.customer?.city || "Bakı",
            address: matched.customer?.address || "Ünvan qeyd olunub",
          },
          items: matched.items && matched.items.length > 0 ? matched.items : [
            {
              name: "HORVVALLE Məhsulu",
              quantity: matched.itemsCount || 1,
              price: matched.total,
            }
          ],
          paymentMethod: matched.paymentMethod || "Bank Kartı",
          paymentStatus: matched.paymentStatus || "Ödənilib",
          subtotal: matched.subtotal || matched.total,
          shipping: matched.shipping || 0,
          total: matched.total,
          orderStatus: matched.orderStatus || "Yeni Sifariş",
          trackingCode: matched.trackingCode || `AZ-EXP-${(matched.id || "").replace(/[^0-9]/g, "") || "8841"}`,
          statusMeta,
          relatedPod: null,
        };

        return formatted;
      }
    } catch (e) {}
    return null;
  };

  // Search function
  const handleSearch = async (searchVal: string, forcedMode?: "code" | "phone" | "email") => {
    const val = searchVal.trim();
    if (!val) return;

    const currentMode = forcedMode || searchMode;
    const isEmailSearch = currentMode === "email" || val.includes("@");
    const isPhoneSearch = !isEmailSearch && (currentMode === "phone" || (val.replace(/\D/g, "").length >= 7 && !/[A-Z]/i.test(val)));

    setLoading(true);
    setError(null);
    setAllMatches(null);

    try {
      const typeParam = isEmailSearch ? "email" : isPhoneSearch ? "phone" : "code";
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(val)}&type=${typeParam}`);
      const data = await res.json();

      if (data.success && data.order) {
        setOrder(data.order);
        if (data.allMatches && data.allMatches.length > 1) {
          setAllMatches(data.allMatches);
        }

        // Live sync status into localStorage so device memory never holds stale status
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("horvvalle_saved_orders");
            if (raw) {
              const list = JSON.parse(raw);
              let updated = false;
              const nextList = list.map((item: any) => {
                if (item.id === data.order.id || (data.order.trackingCode && item.trackingCode === data.order.trackingCode)) {
                  updated = true;
                  return {
                    ...item,
                    orderStatus: data.order.orderStatus,
                    statusMeta: data.order.statusMeta,
                  };
                }
                return item;
              });
              if (updated) {
                localStorage.setItem("horvvalle_saved_orders", JSON.stringify(nextList));
                setRecentSavedOrders(nextList);
              }
            }
            const lastRaw = localStorage.getItem("horvvalle_last_order");
            if (lastRaw) {
              const lastObj = JSON.parse(lastRaw);
              if (lastObj.id === data.order.id || (data.order.trackingCode && lastObj.trackingCode === data.order.trackingCode)) {
                lastObj.orderStatus = data.order.orderStatus;
                lastObj.statusMeta = data.order.statusMeta;
                localStorage.setItem("horvvalle_last_order", JSON.stringify(lastObj));
              }
            }
          } catch (e) {}
        }
        return;
      }

      // If server returned 404 / not found:
      // If searched by code and not on server (deleted or old test), clean from device memory
      if (!isPhoneSearch && typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("horvvalle_saved_orders");
          if (raw) {
            const list = JSON.parse(raw);
            const filtered = list.filter((item: any) => {
              const oId = (item.id || "").toUpperCase().replace(/^#/, "");
              const cleanQ = val.toUpperCase().replace(/^#/, "");
              return oId !== cleanQ;
            });
            localStorage.setItem("horvvalle_saved_orders", JSON.stringify(filtered));
            setRecentSavedOrders(filtered);
          }
          const lastRaw = localStorage.getItem("horvvalle_last_order");
          if (lastRaw) {
            const lastObj = JSON.parse(lastRaw);
            if ((lastObj.id || "").toUpperCase().replace(/^#/, "") === val.toUpperCase().replace(/^#/, "")) {
              localStorage.removeItem("horvvalle_last_order");
            }
          }
        } catch (e) {}
      }

      setOrder(null);
      setError(
        data.error ||
          (isEmailSearch
            ? `"${val}" e-poçt (Gmail) ünvanı ilə heç bir aktiv sifariş tapılmadı.`
            : isPhoneSearch
            ? `"${val}" telefon nömrəsi ilə heç bir aktiv sifariş tapılmadı.`
            : `"${val}" kodlu sifariş tapılmadı və ya sistemdən silinib.`)
      );
    } catch (err: any) {
      setOrder(null);
      setError("Şəbəkə xətası baş verdi. Zəhmət olmasa yenidən cəhd edin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  // Real-time synchronization: poll for order status updates every 4 seconds
  useEffect(() => {
    if (!order?.id) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/track?q=${encodeURIComponent(order.id)}&type=code`);
        const data = await res.json();
        if (data.success && data.order) {
          setOrder((prev) => {
            if (!prev) return data.order;
            if (prev.orderStatus !== data.order.orderStatus || prev.statusMeta?.step !== data.order.statusMeta?.step) {
              return { ...prev, ...data.order };
            }
            return prev;
          });

          // Keep localStorage up-to-date with live status updates
          if (typeof window !== "undefined") {
            try {
              const raw = localStorage.getItem("horvvalle_saved_orders");
              if (raw) {
                const list = JSON.parse(raw);
                let changed = false;
                const nextList = list.map((item: any) => {
                  if ((item.id === data.order.id || item.trackingCode === data.order.trackingCode) && item.orderStatus !== data.order.orderStatus) {
                    changed = true;
                    return { ...item, orderStatus: data.order.orderStatus, statusMeta: data.order.statusMeta };
                  }
                  return item;
                });
                if (changed) {
                  localStorage.setItem("horvvalle_saved_orders", JSON.stringify(nextList));
                  setRecentSavedOrders(nextList);
                }
              }
            } catch (e) {}
          }
        }
      } catch (e) {
        // silent fail on network hiccups
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [order?.id]);

  const steps = [
    { num: 1, label: t.track.statusNew || "Qəbul edildi", icon: CheckCircle2, desc: "Sifariş qeydə alındı" },
    { num: 2, label: t.track.statusConfirmed || "Təsdiqləndi", icon: ShieldCheck, desc: "Hazırlanır" },
    { num: 3, label: t.track.statusCourier || "Kuryerdədir", icon: Truck, desc: "Ünvana çatdırılır" },
    { num: 4, label: t.track.statusDelivered || "Çatdırıldı", icon: Package, desc: "Təhvil verildi" },
  ];

  const currentStep = order?.statusMeta?.step || 1;
  const isCancelled = order?.statusMeta?.isCancelled || false;

  const whatsappHelpUrl = support.link(
    "Salam! HORWALLE-dən sifariş vermişdim amma izləmə kodunu xatırlamıram. Adım və telefon nömrəmlə sifarişimin statusunu öyrənməyə kömək edə bilərsiniz?"
  );

  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] text-stone-900 pt-8 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Branding */}
        <div className="text-center space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-stone-200 text-stone-800 text-xs font-semibold uppercase tracking-wider shadow-2xs">
            <Package size={14} className="text-stone-700" />
            <span>Canlı Sifariş İzləmə Xidməti</span>
          </div>

          <h1 className="font-eb-garamond text-3xl sm:text-5xl font-normal text-stone-900 tracking-wide">
            {t.track.title || "Sifarişinizi izləyin"}
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
            {t.track.subtitle || "Sifarişinizin canlı statusunu, hazırlığını və kuryer məlumatlarını öyrənin"}
          </p>
        </div>

        {/* Device Memory Quick Chip (If customer ordered from this device previously) */}
        {recentSavedOrders.length > 0 && !order && (
          <div className="max-w-2xl mx-auto p-4 rounded-3xl bg-amber-50/70 border border-amber-200/90 text-amber-950 text-xs shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-amber-900">
                <History size={14} className="text-amber-700" />
                <span>Bu cihazda aşkar edilən son sifarişləriniz:</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("horvvalle_saved_orders");
                    localStorage.removeItem("horvvalle_last_order");
                    setRecentSavedOrders([]);
                  }
                }}
                className="text-[10px] text-amber-800 hover:text-rose-700 font-bold underline transition cursor-pointer"
              >
                Tarixçəni təmizlə
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {recentSavedOrders.map((rec) => (
                <div
                  key={rec.id}
                  className="inline-flex items-center rounded-xl bg-white border border-amber-200 text-stone-900 font-semibold text-xs shadow-2xs overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setQuery(rec.id);
                      setSearchMode("code");
                      handleSearch(rec.id, "code");
                    }}
                    className="px-3 py-1.5 hover:bg-amber-100/60 flex items-center gap-2 transition cursor-pointer"
                  >
                    <span className="font-mono font-bold text-stone-900">#{rec.id}</span>
                    {rec.total ? <span className="text-stone-500">· {formatPrice(rec.total)}</span> : null}
                    <ArrowRight size={12} className="text-amber-700" />
                  </button>
                  <button
                    type="button"
                    title="Bu sınaq kodunu yaddaşdan sil"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (typeof window !== "undefined") {
                        const next = recentSavedOrders.filter((item) => item.id !== rec.id);
                        setRecentSavedOrders(next);
                        localStorage.setItem("horvvalle_saved_orders", JSON.stringify(next));
                      }
                    }}
                    className="px-2 py-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 border-l border-amber-100 transition cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Card with Two Modes */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-md max-w-2xl mx-auto space-y-4">
          {/* Mode Switch Tabs (Code, Phone, Email) */}
          <div className="grid grid-cols-3 p-1 bg-stone-100 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => {
                setSearchMode("code");
                setQuery("");
                setError(null);
              }}
              className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                searchMode === "code"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <Package size={13} />
              <span className="truncate">{t.track.byCode || "Sifariş Kodu"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchMode("phone");
                setQuery("");
                setError(null);
              }}
              className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                searchMode === "phone"
                  ? "bg-stone-900 text-white shadow-xs"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <Phone size={13} />
              <span className="truncate">{t.track.byPhone || "Telefon İlə"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchMode("email");
                setQuery(user?.email || "");
                setError(null);
              }}
              className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                searchMode === "email"
                  ? "bg-stone-900 text-white shadow-xs"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <Mail size={13} />
              <span className="truncate">{t.track.byEmail || "Gmail İlə"}</span>
            </button>
          </div>

          {/* Logged in User Fast Tracking Prompt */}
          {user?.email && searchMode === "email" && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs">
              <span className="text-amber-900 font-medium truncate">
                Daxil olunmuş hesab: <strong>{user.email}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setQuery(user.email || "");
                  handleSearch(user.email || "", "email");
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-800 hover:bg-amber-900 text-white font-bold text-[11px] transition shrink-0 cursor-pointer"
              >
                Sifarişlərimi göstər
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(query);
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              {searchMode === "code" ? (
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              ) : searchMode === "phone" ? (
                <Phone className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
              ) : (
                <Mail className="w-4 h-4 text-sky-600 absolute left-3.5 top-3.5" />
              )}
              <input
                type={searchMode === "email" ? "email" : searchMode === "phone" ? "tel" : "text"}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  searchMode === "code"
                    ? t.track.codePlaceholder || "Sifariş № (məs: VTX-ORD-5374)..."
                    : searchMode === "phone"
                    ? t.track.phonePlaceholder || "Əlaqə nömrəniz (məs: +994 50 123 45 67)..."
                    : t.track.emailPlaceholder || "məsələn: adiniz@gmail.com"
                }
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm font-semibold text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-2xl bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition active:scale-95 disabled:opacity-50 shrink-0 shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <span>{t.track.trackingBtn || "Axtarılır..."}</span>
              ) : (
                <>
                  <span>{t.track.trackBtn || "İzlə"}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Search Helper Notes */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-stone-100 text-[11px] text-stone-500">
            {searchMode === "code" ? (
              <button
                type="button"
                onClick={() => {
                  setSearchMode("email");
                  setError(null);
                }}
                className="text-stone-700 hover:text-black font-semibold flex items-center gap-1.5 transition text-left cursor-pointer"
              >
                <HelpCircle size={13} className="text-amber-600 shrink-0" />
                <span>İzləmə kodunuzu unutmusunuz? <strong>E-poçt və ya Telefon ilə tapın →</strong></span>
              </button>
            ) : searchMode === "phone" ? (
              <div className="text-emerald-700 flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                <span>Kodu bilməsəniz belə, sifariş zamanı yazdığınız nömrə ilə dərhal tapılacaq.</span>
              </div>
            ) : (
              <div className="text-sky-700 flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={13} className="text-sky-600 shrink-0" />
                <span>Qeydiyyatdan keçdiyiniz Gmail və ya e-poçt ünvanınızı yazaraq bütün sifarişlərinizi izləyin.</span>
              </div>
            )}

            <div className="flex items-center gap-1 text-stone-400">
              <span>Nümunə:</span>
              <button
                type="button"
                onClick={() => {
                  if (searchMode === "email") {
                    setQuery("musteri@horvvalle.com");
                    handleSearch("musteri@horvvalle.com", "email");
                  } else if (searchMode === "phone") {
                    setQuery("+994 50 123 45 67");
                  } else {
                    setQuery("VTX-ORD-5374");
                    handleSearch("VTX-ORD-5374", "code");
                  }
                }}
                className="underline hover:text-stone-700 font-mono cursor-pointer"
              >
                {searchMode === "email" ? "musteri@horvvalle.com" : searchMode === "phone" ? "+994 50 123 45 67" : "#VTX-ORD-5374"}
              </button>
            </div>
          </div>
        </div>

        {/* Multiple Orders Selection (If searching by phone/email returned multiple orders) */}
        {allMatches && allMatches.length > 1 && (
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm max-w-2xl mx-auto space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-900">
                {t.track.allOrders || "Axtarışınıza aid"} ({allMatches.length} sifariş):
              </span>
              <span className="text-stone-500 text-[11px]">Baxmaq istədiyiniz sifarişi seçin</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {allMatches.map((m) => {
                const isSelected = order?.id === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSearch(m.id)}
                    className={`p-3 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-stone-900 text-white border-stone-900 shadow-sm"
                        : "bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200"
                    }`}
                  >
                    <div>
                      <div className="font-mono font-bold text-xs">{m.id}</div>
                      <div className={`text-[10px] mt-0.5 ${isSelected ? "text-stone-300" : "text-stone-500"}`}>
                        {m.date ? new Date(m.date).toLocaleDateString(language === "az" ? "az-AZ" : language === "ru" ? "ru-RU" : language === "tr" ? "tr-TR" : "en-US") : "Sifariş"} · {formatPrice(m.total)}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-stone-200 text-stone-800"
                      }`}
                    >
                      {m.orderStatus}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Error Notification with Help & WhatsApp Button */}
        {error && (
          <div className="max-w-2xl mx-auto p-5 rounded-3xl bg-rose-50/80 border border-rose-200 text-rose-900 text-xs shadow-xs space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-rose-950">Sifariş tapılmadı</div>
                <div className="text-rose-800 leading-relaxed text-[11px]">{error}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-rose-200/60">
              <button
                type="button"
                onClick={() => {
                  setSearchMode("phone");
                  setQuery("");
                  setError(null);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-rose-100/70 border border-rose-200 text-rose-900 font-semibold text-[11px] transition"
              >
                Telefon nömrəsi ilə yenidən axtar
              </button>
              <a
                href={whatsappHelpUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition ml-auto shadow-2xs"
              >
                <Phone size={12} />
                <span>WhatsApp Dəstəklə Kodu Tap</span>
              </a>
            </div>
          </div>
        )}

        {/* Order Details Display Card */}
        {order && (
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-lg p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
            
            {/* Top Status Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Sifariş Nömrəsi:</span>
                  <span className="font-mono text-base font-black text-stone-900">{order.id}</span>
                </div>
                <div className="text-xs text-stone-500 flex items-center gap-2">
                  <Calendar size={13} />
                  <span>Tarix: {order.date ? new Date(order.date).toLocaleDateString("az-AZ") : "Bu gün"}</span>
                  <span>·</span>
                  <span>İzləmə Kodu: <strong className="font-mono text-stone-700">{order.trackingCode}</strong></span>
                </div>
              </div>

              {/* Status Badge with Color */}
              <div className="shrink-0">
                {isCancelled ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-300 shadow-2xs">
                    <XCircle size={14} className="text-rose-600" />
                    <span>Ləğv edildi</span>
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-2xs ${
                      currentStep === 5
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                        : currentStep === 4
                        ? "bg-teal-50 text-teal-700 border border-teal-300"
                        : currentStep === 3
                        ? "bg-amber-50 text-amber-800 border border-amber-300"
                        : "bg-sky-50 text-sky-700 border border-sky-300"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    <span>{order.orderStatus}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Stepper Progress Bar (Only if not cancelled) */}
            {!isCancelled ? (
              <div className="space-y-4">
                <div className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                  Çatdırılma Mərhələləri:
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {steps.map((s) => {
                    const isPassed = currentStep >= s.num;
                    const isCurrent = currentStep === s.num;
                    const Icon = s.icon;

                    return (
                      <div
                        key={s.num}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isCurrent
                            ? "bg-stone-900 text-white border-stone-900 shadow-sm"
                            : isPassed
                            ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                            : "bg-stone-50 border-stone-200 text-stone-400 opacity-70"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Icon
                            size={18}
                            className={
                              isCurrent
                                ? "text-amber-400"
                                : isPassed
                                ? "text-emerald-600"
                                : "text-stone-400"
                            }
                          />
                          <span className="text-[10px] font-bold opacity-75">#{s.num}</span>
                        </div>
                        <div className="font-bold text-xs">{s.label}</div>
                        <div className="text-[10px] opacity-80 mt-0.5">{s.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
                <div className="font-bold">Bu sifariş ləğv edilmişdir.</div>
                <div className="text-[11px] text-rose-600">
                  Ətraflı məlumat almaq və ya ödənişin geri qaytarılması üçün dəstək xidmətimiz ilə əlaqə saxlaya bilərsiniz.
                </div>
              </div>
            )}

            {/* Order Items & Summary */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                {t.track.orderItems || "Sifariş Edilmiş Məhsullar"}:
              </div>

              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      {order.relatedPod?.frontArtwork ? (
                        <div className="w-12 h-14 rounded-xl bg-white border border-stone-200 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                          <img
                            src={order.relatedPod.frontArtwork}
                            alt=""
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-14 rounded-xl bg-stone-200 border border-stone-300 flex items-center justify-center text-stone-500 font-bold shrink-0">
                          <Package size={20} />
                        </div>
                      )}

                      <div>
                        <div className="font-bold text-xs sm:text-sm text-stone-900">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          Ölçü: <strong className="text-stone-800">{item.size || "L"}</strong> · Rəng: <strong className="text-stone-800">{item.color || "Standart"}</strong> · Say: <strong className="text-stone-800">{item.quantity || 1} ədəd</strong>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-sm text-stone-900 block">
                        {formatPrice(item.price || order.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address & Summary Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100 text-xs">
              <div className="space-y-2 bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
                <div className="font-bold text-stone-900 flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-stone-500">
                  <MapPin size={12} />
                  <span>{t.track.deliveryAddress || "Çatdırılma Ünvanı"}</span>
                </div>
                <div className="font-bold text-stone-900 text-sm">{order.customer.fullName}</div>
                <div className="text-stone-600">{order.customer.phone}</div>
                <div className="text-stone-600">{order.customer.city}, {order.customer.address}</div>
              </div>

              <div className="space-y-2 bg-stone-50 p-4 rounded-2xl border border-stone-200/80 flex flex-col justify-between">
                <div className="font-bold text-stone-900 flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-stone-500">
                  <CreditCard size={12} />
                  <span>{t.track.paymentInfo || "Ödəniş Məlumatı"}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-stone-600">
                    <span>Ödəniş Metodu:</span>
                    <strong className="text-stone-900 uppercase">{order.paymentMethod}</strong>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Ödəniş Vəziyyəti:</span>
                    <strong className="text-emerald-700">{order.paymentStatus}</strong>
                  </div>
                  <div className="flex justify-between text-stone-900 font-bold pt-2 border-t border-stone-200 text-sm">
                    <span>{t.track.total || "Cəmi Ödənilən"}:</span>
                    <span className="font-black">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Need Help? Quick Contact Box */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
              <div>Sifarişinizlə bağlı hər hansı sualınız var? Bizimlə dərhal əlaqə saxlayın.</div>
              <a
                href={support.link()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-2xs"
              >
                <Phone size={13} />
                <span>WhatsApp Dəstək ({support.phone})</span>
              </a>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default function OrderTrackerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-stone-400 text-sm">Yüklənir...</div>}>
      <OrderTrackerContent />
    </Suspense>
  );
}
