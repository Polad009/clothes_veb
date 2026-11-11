"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";
import { translateColor } from "@/lib/translations";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { T, tr } from "@/components/store/i18n";

/** Slide-in bag on the right, dark. */
export function CartPanel() {
  const router = useRouter();
  const { language } = useLanguage();
  const { currency, getProductPrice } = useCurrency();
  const { items, isOpen, closeCart, updateQuantity, removeItem, totalCount } = useCart();
  useBodyScrollLock(isOpen);

  const money = (v: number) => (currency === "USD" ? `$${v.toFixed(2)}` : `${v.toFixed(2)} ₼`);
  const subtotal = items.reduce((sum, item) => sum + getProductPrice(item) * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div data-lenis-prevent className="fixed inset-0 z-[70] font-grotesk text-bone">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70"
            onClick={closeCart}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-y-0 right-0 flex h-[100dvh] w-full max-w-md flex-col border-l border-white/10 bg-ink"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
              <h2 className="text-sm font-extrabold uppercase tracking-[0.16em] [font-stretch:110%]">
                {tr(language, T.cart)} ({totalCount})
              </h2>
              <button type="button" onClick={closeCart} className="-mr-2 p-2 hover:opacity-70" aria-label={tr(language, T.close)}>
                <X size={20} strokeWidth={1.6} />
              </button>
            </div>

            <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                  <p className="text-2xl font-black uppercase tracking-tight [font-stretch:115%]">
                    {tr(language, { az: "Səbət boşdur", en: "Your bag is empty", ru: "Корзина пуста", tr: "Sepetiniz boş" })}
                  </p>
                  <Link
                    href="/collections"
                    onClick={closeCart}
                    className="mt-6 rounded-full bg-bone px-7 py-3 text-[12px] font-extrabold uppercase tracking-[0.14em] text-ink transition hover:bg-white"
                  >
                    {tr(language, T.shopAll)}
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-white/10">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-4 px-5 py-5">
                      <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-tile">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.customDesignPreview || item.image} alt={item.name} className="h-full w-full object-contain p-2 mix-blend-multiply" />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-[13px] font-semibold leading-snug">{item.name}</p>
                          <button type="button" onClick={() => removeItem(item.id)} className="shrink-0 text-bone-faint hover:text-bone" aria-label={tr(language, { az: "Sil", en: "Remove", ru: "Удалить", tr: "Kaldır" })}>
                            <X size={15} />
                          </button>
                        </div>
                        <p className="mt-1 text-[12px] text-bone-dim">
                          {[item.size, item.color && translateColor(item.color, language as any)].filter(Boolean).join(" · ")}
                          {item.type === "custom" && ` · ${tr(language, { az: "Öz dizayn", en: "Custom design", ru: "Свой дизайн", tr: "Özel tasarım" })}`}
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <div className="flex items-center border border-white/20">
                            <button type="button" onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-white/10" aria-label={tr(language, { az: "Azalt", en: "Decrease", ru: "Меньше", tr: "Azalt" })}>
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-[12px] font-bold tabular-nums">{item.quantity}</span>
                            <button type="button" onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-white/10" aria-label={tr(language, { az: "Artır", en: "Increase", ru: "Больше", tr: "Artır" })}>
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="text-[13px] font-semibold tabular-nums">{money(getProductPrice(item) * item.quantity)}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="shrink-0 space-y-4 border-t border-white/10 px-5 py-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-bone-dim">
                    {tr(language, { az: "Ara cəm", en: "Subtotal", ru: "Подытог", tr: "Ara toplam" })}
                  </span>
                  <span className="text-lg font-bold tabular-nums">{money(subtotal)}</span>
                </div>
                <p className="text-[12px] text-bone-faint">
                  {tr(language, {
                    az: "Çatdırılma və endirim kodu növbəti addımda hesablanır.",
                    en: "Delivery and discount codes are applied at checkout.",
                    ru: "Доставка и промокод рассчитываются при оформлении.",
                    tr: "Kargo ve indirim kodu ödeme adımında hesaplanır.",
                  })}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    closeCart();
                    router.push("/checkout");
                  }}
                  className="w-full rounded-full bg-bone py-4 text-[12px] font-extrabold uppercase tracking-[0.16em] text-ink transition hover:bg-white"
                >
                  {tr(language, { az: "Sifarişi rəsmiləşdir", en: "Checkout", ru: "Оформить заказ", tr: "Ödemeye geç" })}
                </button>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
