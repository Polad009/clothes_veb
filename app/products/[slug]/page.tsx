"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_PRODUCTS } from "@/data/products";
import { useCurrency } from "@/context/CurrencyContext";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Ruler,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { ApplePayLogo, PaymentLogosRow } from "@/components/PaymentLogos";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { formatPrice } = useCurrency();

  const product = MOCK_PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    return notFound();
  }

  const { addItem, openCart } = useCart();

  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "L");
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>("details");

  const activeColor = product.colors[selectedColorIndex] || product.colors[0];
  const gallery = activeColor.gallery || [activeColor.image, activeColor.hoverImage || activeColor.image];
  const activeImage = gallery[selectedImageIndex] || activeColor.image;

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}_${activeColor.name}_${selectedSize}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: activeColor.name,
      image: activeColor.image,
      type: "ready",
      stockQuantity: 99,
    }, quantity);

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handleDirectBuy = () => {
    handleAddToCart();
    openCart();
  };

  const recommended = MOCK_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] text-[#111827] pt-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-8">
          <Link href="/" className="hover:text-stone-900 transition">Ana Səhifə</Link>
          <span className="text-stone-300">/</span>
          <Link href={`/collections?category=${product.category}`} className="hover:text-stone-900 transition uppercase font-medium">
            {product.category === "koynek" ? "T-Shirt & Köynək" : product.category === "hudi" ? "Hudi & Sviter" : product.category === "salvar" ? "Şalvar & Şortik" : "Aksesuar"}
          </Link>
          <span className="text-stone-300">/</span>
          <span className="text-stone-900 font-medium truncate">{product.name}</span>
        </div>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left Column: Image Gallery (Clean light pedestal) */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible shrink-0 pb-2 sm:pb-0">
              {gallery.map((img, idx) => {
                const label = idx === 0 ? "ÖN" : idx === 1 ? "ARXA" : "MOCKUP";
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-24 sm:w-22 sm:h-28 rounded-2xl overflow-hidden transition-all flex flex-col items-center justify-between p-1.5 group cursor-pointer ${
                      selectedImageIndex === idx
                        ? "bg-white border-2 border-stone-900 shadow-md ring-2 ring-stone-900/10"
                        : "bg-white border border-stone-200/80 opacity-70 hover:opacity-100 hover:border-stone-400"
                    }`}
                  >
                    <div className="relative w-full h-full overflow-hidden rounded-xl flex items-center justify-center p-1 bg-[#FAF7F2]">
                      <img
                        src={img}
                        alt={`${product.name} - ${label}`}
                        className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-md mt-1 transition-colors ${
                        selectedImageIndex === idx
                          ? "bg-stone-900 text-white"
                          : "bg-stone-100 text-stone-600 group-hover:text-stone-900"
                      }`}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Main Featured Big Image / Light Luxury Pedestal */}
            <div className="relative flex-1 min-h-[460px] sm:min-h-[560px] rounded-3xl bg-white border border-stone-200/80 p-6 sm:p-10 flex flex-col items-center justify-center overflow-hidden shadow-xs group">
              {/* Floating Garment Image */}
              <div className="relative z-10 w-full max-w-[420px] aspect-[4/5] flex items-center justify-center">
                <img
                  src={activeImage}
                  alt={`${product.name} - ${selectedImageIndex === 0 ? "Ön Görünüş" : selectedImageIndex === 1 ? "Arxa Görünüş" : "Tam Mockup"}`}
                  className="max-h-full max-w-full object-contain filter drop-shadow-xl transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>

              {/* Soft Oval Shadow beneath garment */}
              <div className="w-56 h-5 bg-black/15 rounded-full blur-md pointer-events-none -mt-4 relative z-0" />

              {/* View Perspective Badge */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5">
                <span className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-stone-800 text-[10px] font-semibold uppercase tracking-widest border border-stone-200 shadow-2xs flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-900 animate-pulse" />
                  {selectedImageIndex === 0
                    ? "Ön Görünüş"
                    : selectedImageIndex === 1
                    ? "Arxa Görünüş"
                    : "Tam Mockup"}
                </span>
              </div>

              {/* Quick Flip Controls (Ön / Arxa / Mockup) */}
              {gallery.length >= 2 && (
                <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedImageIndex(0)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md transition-all active:scale-95 cursor-pointer ${
                      selectedImageIndex === 0
                        ? "bg-stone-900 text-white shadow-sm"
                        : "bg-white/90 text-stone-700 border border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    Ön
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedImageIndex(1)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md transition-all active:scale-95 cursor-pointer ${
                      selectedImageIndex === 1
                        ? "bg-stone-900 text-white shadow-sm"
                        : "bg-white/90 text-stone-700 border border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    Arxa
                  </button>
                  {gallery.length >= 3 && (
                    <button
                      type="button"
                      onClick={() => setSelectedImageIndex(2)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md transition-all active:scale-95 cursor-pointer ${
                        selectedImageIndex === 2
                          ? "bg-stone-900 text-white shadow-sm"
                          : "bg-white/90 text-stone-700 border border-stone-200 hover:border-stone-400"
                      }`}
                    >
                      Mockup
                    </button>
                  )}
                </div>
              )}

              {product.badge && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-800 border border-stone-200 font-semibold text-xs uppercase tracking-wider shadow-2xs">
                    {product.badge}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Purchasing Panel */}
          <div className="lg:col-span-5 flex flex-col justify-start space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <span className="uppercase tracking-widest font-mono font-semibold text-stone-700">
                  {product.refCode || "HORVVALLE-ORIGINAL"}
                </span>
                <span className="flex items-center gap-1 text-stone-700 font-medium">
                  ★ {product.rating} ({product.reviewCount} rəy)
                </span>
              </div>

              <h1 className="font-eb-garamond text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-900 tracking-wide">
                {product.name}
              </h1>

              <p className="text-xs text-stone-500 font-medium uppercase tracking-wider mt-2">
                {product.fit}
              </p>

              {/* Price */}
              <div className="flex items-center gap-3 mt-4">
                <span className="text-3xl sm:text-4xl font-light text-stone-900 tracking-tight">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-lg text-stone-400 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
                {product.compareAtPrice && (
                  <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 border border-stone-200 text-xs font-semibold">
                    Qənaət: {formatPrice(product.compareAtPrice - product.price)}
                  </span>
                )}
              </div>
            </div>

            {/* Color Selector */}
            <div className="space-y-2.5 pt-4 border-t border-stone-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600">
                  Rəng: <strong className="text-stone-900">{activeColor.name}</strong>
                </span>
                <span className="text-stone-400 text-[11px]">
                  {product.colors.length} seçim
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                {product.colors.map((c, idx) => (
                  <button
                    key={c.name}
                    onClick={() => {
                      setSelectedColorIndex(idx);
                      setSelectedImageIndex(0);
                    }}
                    className={`w-9 h-9 rounded-xl border-2 transition-all flex items-center justify-center cursor-pointer ${
                      selectedColorIndex === idx
                        ? "border-stone-900 ring-2 ring-stone-900/20 scale-105"
                        : "border-stone-300 opacity-80 hover:opacity-100 hover:border-stone-500"
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {selectedColorIndex === idx && (
                      <Check size={14} className={c.hex === "#FFFFFF" || c.hex === "#F5F5F0" ? "text-black" : "text-white"} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector & Size Guide */}
            <div className="space-y-2.5 pt-4 border-t border-stone-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600">
                  Ölçü: <strong className="text-stone-900">{selectedSize}</strong>
                </span>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="flex items-center gap-1.5 text-stone-700 hover:text-stone-900 font-medium underline cursor-pointer"
                >
                  <Ruler size={13} />
                  <span>Ölçü Cədvəli</span>
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2.5 px-4 rounded-xl text-xs font-semibold uppercase transition-all cursor-pointer ${
                      selectedSize === size
                        ? "bg-stone-900 text-white shadow-sm scale-105"
                        : "bg-white border border-stone-200 text-stone-700 hover:border-stone-400 hover:text-stone-900"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons: Add to Bag & Apple Pay */}
            <div className="space-y-3 pt-3">
              <button
                onClick={handleAddToCart}
                className={`w-full py-4 rounded-full font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-98 cursor-pointer ${
                  isAdded
                    ? "bg-emerald-600 text-white"
                    : "bg-stone-900 hover:bg-black text-white"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check size={16} />
                    <span>Səbətə Əlavə Olundu!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    <span>Səbətə Əlavə Et</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDirectBuy}
                className="w-full py-3.5 rounded-full bg-white hover:bg-stone-50 text-stone-900 border border-stone-200 font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-98 shadow-2xs cursor-pointer"
              >
                <ApplePayLogo className="h-4 w-auto" variant="light" />
                <span>ilə İndi Al</span>
              </button>
            </div>

            {/* Trust Badges & Supported Payments */}
            <div className="space-y-3 pt-4 border-t border-stone-200">
              <div className="grid grid-cols-2 gap-3 text-[11px] text-stone-600">
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-stone-700 shrink-0" />
                  <span>60 ₼-dən yuxarı pulsuz çatdırılma</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw size={16} className="text-stone-700 shrink-0" />
                  <span>14 günlük asan qaytarılma</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">
                  Təhlükəsiz Ödəniş:
                </span>
                <PaymentLogosRow size="sm" />
              </div>
            </div>

            {/* Accordions */}
            <div className="pt-4 border-t border-stone-200 space-y-3">
              {/* 1. Description */}
              <div className="border border-stone-200/90 rounded-2xl overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === "details" ? null : "details")}
                  className="w-full p-4 text-left font-semibold text-xs uppercase tracking-wider flex items-center justify-between text-stone-900 cursor-pointer"
                >
                  <span>Məhsulun Təsviri & Kəsim</span>
                  <motion.span
                    animate={{ rotate: activeAccordion === "details" ? 180 : 0 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                  >
                    <ChevronDown size={16} className="text-stone-600" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {activeAccordion === "details" && (
                    <motion.div
                      key="details-content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 text-xs text-stone-600 leading-relaxed space-y-2 border-t border-stone-100">
                        <p>{product.description}</p>
                        <div className="pt-2">
                          <strong className="text-stone-900 block mb-1">Xüsusiyyətlər:</strong>
                          <ul className="list-disc pl-4 space-y-1 text-stone-600">
                            <li>Siluet: {product.fit}</li>
                            <li>Davamlı möhkəm tikişlər</li>
                            <li>Mövsümün ən çox tələb olunan modeli</li>
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 2. Composition & Care */}
              <div className="border border-stone-200/90 rounded-2xl overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === "care" ? null : "care")}
                  className="w-full p-4 text-left font-semibold text-xs uppercase tracking-wider flex items-center justify-between text-stone-900 cursor-pointer"
                >
                  <span>Material & Qulluq Təlimatı</span>
                  <motion.span
                    animate={{ rotate: activeAccordion === "care" ? 180 : 0 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                  >
                    <ChevronDown size={16} className="text-stone-600" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {activeAccordion === "care" && (
                    <motion.div
                      key="care-content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 text-xs text-stone-600 leading-relaxed space-y-2 border-t border-stone-100">
                        <p><strong className="text-stone-900">Tərkib:</strong> {product.composition}</p>
                        <p><strong className="text-stone-900">Qulluq:</strong> {product.care}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Complete the look recommendation grid */}
        <div className="mt-20 pt-10 border-t border-stone-200">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-eb-garamond text-2xl sm:text-3xl lg:text-4xl font-normal text-stone-900">
              Bu görünüşü <span className="italic text-stone-700">tamamla</span>
            </h2>
            <Link href="/collections" className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 group">
              <span>Hamısına Bax</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-stone-900" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommended.map((p) => (
              <ProductCard key={p.id} product={p} variant="light" />
            ))}
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl text-stone-900">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-lg font-bold uppercase text-stone-900 flex items-center gap-2">
                <Ruler size={18} className="text-stone-700" />
                <span>Ölçü Cədvəli (CM)</span>
              </h3>
              <button onClick={() => setSizeGuideOpen(false)} className="text-stone-400 hover:text-stone-900 text-lg cursor-pointer">
                ✕
              </button>
            </div>
            <p className="text-xs text-stone-500">
              Dəqiq oturuş üçün ölçülərinizi yoxlayın.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-stone-700">
                <thead className="bg-stone-50 text-stone-900 uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Ölçü</th>
                    <th className="p-2.5">Sinə / Bel (cm)</th>
                    <th className="p-2.5">Uzunluq (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  <tr>
                    <td className="p-2.5 font-bold text-stone-900">S / 30</td>
                    <td className="p-2.5">92 - 98</td>
                    <td className="p-2.5">72 / 100</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-stone-900">M / 32</td>
                    <td className="p-2.5">98 - 104</td>
                    <td className="p-2.5">74 / 102</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-stone-900">L / 34</td>
                    <td className="p-2.5">104 - 110</td>
                    <td className="p-2.5">76 / 104</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-stone-900">XL / 36</td>
                    <td className="p-2.5">110 - 118</td>
                    <td className="p-2.5">78 / 106</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button
              onClick={() => setSizeGuideOpen(false)}
              className="w-full py-3 rounded-full bg-stone-900 text-white font-semibold text-xs uppercase hover:bg-black transition-all cursor-pointer"
            >
              Bağla
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
