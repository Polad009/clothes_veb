"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Truck,
  ShieldCheck,
  Palette,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { ApplePayLogo, PaymentLogosRow } from "@/components/PaymentLogos";

export function CartDrawer() {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    totalPrice,
    totalCount,
  } = useCart();

  const FREE_SHIPPING_THRESHOLD = 60;
  const progressPercent = Math.min(
    100,
    Math.round((totalPrice / FREE_SHIPPING_THRESHOLD) * 100)
  );
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice);

  // Smooth scroll lock without layout jump
  useEffect(() => {
    if (isOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Silky Smooth Dark Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={closeCart}
          />

          {/* Slide-over Drawer Panel in Light Luxury Palette */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 pointer-events-none">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
              className="w-screen max-w-full sm:max-w-md bg-[#FAF7F2] border-l border-[#E8E2D8] flex flex-col shadow-2xl text-[#1A1517] pointer-events-auto h-[100dvh]"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-[#E8E2D8] flex items-center justify-between bg-white/90 backdrop-blur-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#1A1517] flex items-center justify-center text-white shadow-2xs">
                    <ShoppingBag size={15} />
                  </div>
                  <h2 className="text-base font-normal tracking-tight text-[#1A1517] font-eb-garamond text-xl">
                    Səbətiniz ({totalCount})
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeCart}
                  className="p-2 rounded-full bg-[#EFEAE1] text-[#1A1517] hover:bg-[#E5DFD5] transition cursor-pointer"
                  aria-label="Bağla"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Free Shipping Banner */}
              <div className="bg-[#F5EFE6] px-5 py-2.5 border-b border-[#E8E2D8]">
                <div className="flex items-center justify-center text-xs font-medium">
                  <span className="flex items-center gap-1.5 text-[#5C5247]">
                    <Truck size={14} className="text-[#B08D57] shrink-0" />
                    <span>Bakı və Sumqayıt daxili çatdırılma <strong>PULSUZ</strong></span>
                  </span>
                </div>
              </div>

              {/* Cart Items List */}
              <div data-lenis-prevent className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 overscroll-contain">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                    <div className="w-16 h-16 rounded-full bg-[#EFEAE1] border border-[#E5DFD5] flex items-center justify-center text-[#9A7B4F]">
                      <ShoppingBag size={26} />
                    </div>
                    <div>
                      <h3 className="font-eb-garamond text-2xl text-[#1A1517]">
                        Səbətiniz boşdur
                      </h3>
                      <p className="text-xs text-[#786E63] mt-1 max-w-xs">
                        Köynək, hudi, şalvar və aksesuarlarımıza və ya 3D fərdi dizayn studiyasına nəzər salın.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2.5 w-full max-w-xs pt-2">
                      <Link
                        href="/collections"
                        onClick={closeCart}
                        className="w-full py-3 rounded-full bg-[#1A1517] text-white font-semibold text-xs uppercase tracking-wider hover:bg-black transition text-center shadow-sm cursor-pointer active:scale-98"
                      >
                        Kolleksiyaya Keç
                      </Link>
                      <Link
                        href="/studio"
                        onClick={closeCart}
                        className="w-full py-3 rounded-full bg-white border border-[#E5DFD5] text-[#1A1517] font-semibold text-xs uppercase tracking-wider hover:border-[#B08D57] hover:bg-stone-50 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-98"
                      >
                        <Palette size={14} className="text-[#B08D57]" />
                        <span>Fərdi Dizayn Studiyası</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-3.5 p-3.5 rounded-2xl bg-white border border-[#E8E2D8] text-[#1A1517] transition-all hover:border-[#D5CEBF] shadow-xs"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-20 h-24 rounded-xl bg-[#FAF7F2] overflow-hidden shrink-0 border border-[#E8E2D8] flex items-center justify-center p-1.5">
                        <img
                          src={item.customDesignPreview || item.image}
                          alt={item.name}
                          className="w-full h-full object-contain drop-shadow-sm pointer-events-none select-none"
                        />
                        {item.type === "custom" && (
                          <span className="absolute bottom-1 right-1 bg-[#1A1517] text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full text-[#E6C280] border border-[#E6C280]/40 shadow-xs">
                            FƏRDİ
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-serif-luxury font-semibold text-[#1A1517] truncate">
                              {item.name}
                            </h4>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-[#9E9488] hover:text-rose-600 p-1 transition rounded-lg hover:bg-rose-50 cursor-pointer"
                              aria-label="Sil"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-[#786E63] mt-1">
                            <span>Ölçü: <strong className="text-[#1A1517]">{item.size}</strong></span>
                            <span>•</span>
                            <span>Rəng: <strong className="text-[#1A1517]">{item.color}</strong></span>
                          </div>

                          {item.type === "custom" && (
                            <div className="text-[10px] text-[#B08D57] font-semibold mt-1 flex items-center gap-1">
                              <Palette size={11} className="text-[#B08D57]" />
                              <span>Fərdi Çap Sifarişi</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-[#E5DFD5] rounded-full bg-[#FAF7F2] shadow-2xs">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1.5 text-[#5C5247] hover:text-[#1A1517] transition cursor-pointer"
                              aria-label="Azalt"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-2 text-xs font-bold text-[#1A1517]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-1.5 text-[#5C5247] hover:text-[#1A1517] transition cursor-pointer"
                              aria-label="Artır"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <span className="text-sm font-bold text-[#1A1517]">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer Checkout Summary */}
              {items.length > 0 && (
                <div className="p-4 sm:p-5 border-t border-[#E8E2D8] bg-white space-y-3.5 shadow-lg">
                  <div className="space-y-1.5 text-xs text-[#5C5247]">
                    <div className="flex justify-between">
                      <span>Məhsulların cəmi:</span>
                      <span className="font-bold text-[#1A1517]">{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Çatdırılma:</span>
                      <span className="font-bold text-[#047857]">
                        PULSUZ (Bakı & Sumqayıt)
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-normal text-[#1A1517] font-eb-garamond pt-2 border-t border-[#E8E2D8]">
                      <span>Yekun Məbləğ:</span>
                      <span className="font-bold text-xl text-[#B08D57]">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>

                  {/* Express Checkout Options */}
                  <div className="space-y-2 pt-1">
                    {/* 1-Click Apple Pay Button */}
                    <button
                      type="button"
                      onClick={handleCheckout}
                      className="w-full py-3.5 px-4 rounded-full bg-black hover:bg-zinc-900 border border-black text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98 cursor-pointer"
                    >
                      <ApplePayLogo className="h-4 w-auto" variant="dark" />
                      <span>ilə Sürətli Al</span>
                    </button>

                    {/* Main Checkout Button: Black Luxury Pill CTA */}
                    <button
                      type="button"
                      onClick={handleCheckout}
                      className="w-full py-3.5 px-4 rounded-full bg-[#1A1517] hover:bg-black text-white font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md active:scale-98 cursor-pointer"
                    >
                      <span>Sifarişi Rəsmiləşdir</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>

                  {/* Security & Official Payment Badges */}
                  <div className="pt-2 flex flex-col items-center gap-2">
                    <PaymentLogosRow size="sm" />
                    <div className="flex items-center justify-center gap-2 text-[10.5px] text-[#8C8276]">
                      <ShieldCheck size={14} className="text-[#B08D57]" />
                      <span>256-Bit SSL Təhlükəsiz Ödəniş və 14 Gün Zəmanət</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
