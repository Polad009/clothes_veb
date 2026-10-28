"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Package,
  CheckCircle2,
  Clock,
  Printer,
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
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || searchParams.get("orderId") || "";

  const [query, setQuery] = useState(initialQuery);
  const [searchMode, setSearchMode] = useState<"code" | "recovery">("code");
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

  // Search function
  const handleSearch = async (searchVal: string) => {
    const val = searchVal.trim();
    if (!val) return;

    setLoading(true);
    setError(null);
    setAllMatches(null);

    try {
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(val)}`);
      const data = await res.json();

      if (data.success && data.order) {
        setOrder(data.order);
        if (data.allMatches && data.allMatches.length > 1) {
          setAllMatches(data.allMatches);
        }
      } else {
        setOrder(null);
        setError(data.error || "Sifariş tapılmadı.");
      }
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

  const steps = [
    { num: 1, label: "Qəbul edildi", icon: CheckCircle2, desc: "Sifariş qeydə alındı" },
    { num: 2, label: "Təsdiqləndi", icon: ShieldCheck, desc: "Menecer təsdiqlədi" },
    { num: 3, label: "Çapda / Dərzidə", icon: Printer, desc: "DTF çap və atelye" },
    { num: 4, label: "Kuryerdədir", icon: Truck, desc: "Ünvana çatdırılır" },
    { num: 5, label: "Çatdırıldı", icon: Package, desc: "Təhvil verildi" },
  ];

  const currentStep = order?.statusMeta?.step || 1;
  const isCancelled = order?.statusMeta?.isCancelled || false;

  const whatsappHelpUrl = `https://wa.me/994557669050?text=${encodeURIComponent(
    "Salam! HORWALLE-dən sifariş vermişdim amma izləmə kodunu xatırlamıram. Adım və telefon nömrəmlə sifarişimin statusunu öyrənməyə kömək edə bilərsiniz?"
  )}`;

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
            Sifarişinizi <span className="italic font-normal">izləyin</span>
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
            Sifariş nömrənizi və ya <strong>yalnız telefon nömrənizi / e-poçtunuzu</strong> daxil edərək cari çatdırılma mərhələsini canlı izləyin.
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
              <span className="text-[10px] text-amber-700 font-medium">Avtomatik yaddaş</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {recentSavedOrders.map((rec) => (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => {
                    setQuery(rec.id);
                    handleSearch(rec.id);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100/60 border border-amber-200 text-stone-900 font-semibold text-xs flex items-center gap-2 transition shadow-2xs active:scale-95"
                >
                  <span className="font-mono font-bold text-stone-900">#{rec.id}</span>
                  {rec.total ? <span className="text-stone-500">· {rec.total} ₼</span> : null}
                  <ArrowRight size={12} className="text-amber-700" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Card with Two Modes */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-md max-w-2xl mx-auto space-y-4">
          {/* Mode Switch Tabs */}
          <div className="flex p-1 bg-stone-100 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => {
                setSearchMode("code");
                setQuery("");
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                searchMode === "code"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <Package size={14} />
              <span>Sifariş Kodu İlə</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchMode("recovery");
                setQuery("");
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                searchMode === "recovery"
                  ? "bg-stone-900 text-white shadow-xs"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <Smartphone size={14} />
              <span>Telefon və ya E-poçt ilə</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400 text-stone-950 font-black">YENİ</span>
            </button>
          </div>

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
              ) : (
                <Phone className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
              )}
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  searchMode === "code"
                    ? "Sifariş № (məs: VTX-ORD-5374)..."
                    : "Əlaqə nömrəniz (+994 50 ...) və ya e-poçt..."
                }
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm font-semibold text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-2xl bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition active:scale-95 disabled:opacity-50 shrink-0 shadow-sm flex items-center gap-1.5"
            >
              {loading ? (
                <span>Axtarılır...</span>
              ) : (
                <>
                  <span>{searchMode === "code" ? "İzlə" : "Tap"}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Forgotten Code Reassurance Helper */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-stone-100 text-[11px] text-stone-500">
            {searchMode === "code" ? (
              <button
                type="button"
                onClick={() => {
                  setSearchMode("recovery");
                  setError(null);
                }}
                className="text-stone-700 hover:text-black font-semibold flex items-center gap-1.5 transition text-left"
              >
                <HelpCircle size={13} className="text-amber-600 shrink-0" />
                <span>İzləmə kodunuzu unutmusunuz? <strong>Telefon və ya e-poçtla tapın →</strong></span>
              </button>
            ) : (
              <div className="text-emerald-700 flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                <span>Kodu bilməsəniz belə, sifariş zamanı yazdığınız nömrə və ya e-poçtla dərhal tapılacaq.</span>
              </div>
            )}

            <div className="flex items-center gap-1 text-stone-400">
              <span>Nümunə:</span>
              <button
                type="button"
                onClick={() => {
                  setQuery("VTX-ORD-5374");
                  handleSearch("VTX-ORD-5374");
                }}
                className="underline hover:text-stone-700 font-mono"
              >
                #VTX-ORD-5374
              </button>
            </div>
          </div>
        </div>

        {/* Multiple Orders Selection (If searching by phone/email returned multiple orders) */}
        {allMatches && allMatches.length > 1 && (
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm max-w-2xl mx-auto space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-900">
                Nömrənizə aid {allMatches.length} sifariş aşkar edildi:
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
                    className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                      isSelected
                        ? "bg-stone-900 text-white border-stone-900 shadow-sm"
                        : "bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200"
                    }`}
                  >
                    <div>
                      <div className="font-mono font-bold text-xs">{m.id}</div>
                      <div className={`text-[10px] mt-0.5 ${isSelected ? "text-stone-300" : "text-stone-500"}`}>
                        {m.date ? new Date(m.date).toLocaleDateString("az-AZ") : "Sifariş"} · {m.total} ₼
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
                  setSearchMode("recovery");
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

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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
                  Ətraflı məlumat almaq və ya ödənişin geri qaytarılması üçün atelyemizin dəstək xidməti ilə əlaqə saxlaya bilərsiniz.
                </div>
              </div>
            )}

            {/* Order Items & Summary */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                Sifariş Edilmiş Məhsullar:
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
                        {Number(item.price || order.total).toFixed(2)} ₼
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
                  <span>Çatdırılma Ünvanı</span>
                </div>
                <div className="font-bold text-stone-900 text-sm">{order.customer.fullName}</div>
                <div className="text-stone-600">{order.customer.phone}</div>
                <div className="text-stone-600">{order.customer.city}, {order.customer.address}</div>
              </div>

              <div className="space-y-2 bg-stone-50 p-4 rounded-2xl border border-stone-200/80 flex flex-col justify-between">
                <div className="font-bold text-stone-900 flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-stone-500">
                  <CreditCard size={12} />
                  <span>Ödəniş Məlumatı</span>
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
                    <span>Cəmi Ödənilən:</span>
                    <span className="font-black">{Number(order.total).toFixed(2)} ₼</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Need Help? Quick Contact Box */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
              <div>Sifarişinizlə bağlı hər hansı sualınız var? Bizimlə dərhal əlaqə saxlayın.</div>
              <a
                href="https://wa.me/994557669050"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-2xs"
              >
                <Phone size={13} />
                <span>WhatsApp Dəstək (+994 55-766-90-50)</span>
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
