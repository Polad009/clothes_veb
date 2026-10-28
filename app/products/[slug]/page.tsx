"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, notFound } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_PRODUCTS, Product } from "@/data/products";
import { useStoreData, normalizeProduct } from "@/context/StoreDataContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";
import { translateColor, translateBadge } from "@/lib/translations";
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
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { ApplePayLogo, PaymentLogosRow } from "@/components/PaymentLogos";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { formatPrice } = useCurrency();
  const { language, t } = useLanguage();

  // Məhsula klikləyəndə səhifənin ən yuxarıdan açılmasını təmin et
  useEffect(() => {
    const resetScroll = () => {
      if (typeof window !== "undefined") {
        if ((window as any).__lenis) {
          (window as any).__lenis.scrollTo(0, { immediate: true });
        }
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    };

    resetScroll();
    const t = setTimeout(resetScroll, 50);
    return () => clearTimeout(t);
  }, [slug]);

  const { products } = useStoreData();
  const [directProduct, setDirectProduct] = useState<Product | null>(null);
  const [hasCheckedDirect, setHasCheckedDirect] = useState(false);

  const product =
    products.find((p) => p.slug === slug || p.id === slug) ||
    directProduct ||
    MOCK_PRODUCTS.find((p) => p.slug === slug || p.id === slug);

  useEffect(() => {
    if (!product && !hasCheckedDirect) {
      fetch(`/api/store/products?q=${encodeURIComponent(slug)}`, { cache: 'no-store' })
        .then(res => res.json())
        .then(items => {
          if (Array.isArray(items)) {
            const found = items.find((p: any) => p.slug === slug || p.id === slug);
            if (found) {
              setDirectProduct(normalizeProduct(found));
            }
          }
        })
        .catch(() => {})
        .finally(() => setHasCheckedDirect(true));
    }
  }, [slug, product, hasCheckedDirect]);

  if (!product) {
    if (!hasCheckedDirect) {
      return (
        <div className="w-full min-h-screen bg-[#FAF7F2] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-stone-800 animate-spin" />
        </div>
      );
    }
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
  const hasDistinctHover = Boolean(
    activeColor?.hoverImage &&
    typeof activeColor.hoverImage === "string" &&
    activeColor.hoverImage.trim() !== "" &&
    activeColor.hoverImage !== activeColor.image
  );

  const rawGallery = (activeColor.gallery && activeColor.gallery.length > 0
    ? activeColor.gallery
    : hasDistinctHover
    ? [activeColor.image, activeColor.hoverImage!]
    : [activeColor.image]
  );
  // Ensure unique, non-empty images only
  const gallery = rawGallery.filter((img, idx, arr) => img && typeof img === "string" && img.trim() !== "" && arr.indexOf(img) === idx);
  const activeImage = gallery[selectedImageIndex] || gallery[0] || activeColor.image;

  // Touch & Mouse Swipe Gesture Handlers for Main Gallery Image
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const minSwipeDistance = 40;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance && gallery.length > 1) {
      setSelectedImageIndex((prev) => (prev + 1) % gallery.length);
    } else if (distance < -minSwipeDistance && gallery.length > 1) {
      setSelectedImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsMouseDown(true);
    setTouchEnd(null);
    setTouchStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown) return;
    setTouchEnd(e.clientX);
  };

  const handleMouseUp = () => {
    if (isMouseDown) {
      handleTouchEnd();
      setIsMouseDown(false);
    }
  };

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

  const recommended = (products.length > 0 ? products : MOCK_PRODUCTS).filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] text-[#111827] pt-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Image Gallery (Clean, sized to photo with no excess white padding) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-4 items-start justify-center sm:justify-start"
          >
            {/* Thumbnails (Only displayed if more than 1 image exists) */}
            {gallery.length > 1 && (
              <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-visible shrink-0 pb-2 sm:pb-0">
                {gallery.map((img, idx) => {
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-16 h-20 sm:w-20 sm:h-26 rounded-xl overflow-hidden transition-all group cursor-pointer ${
                        selectedImageIndex === idx
                          ? "bg-white border-2 border-stone-900 shadow-sm ring-1 ring-stone-900/10 scale-102"
                          : "bg-white border border-stone-200/80 opacity-70 hover:opacity-100 hover:border-stone-400"
                      }`}
                    >
                      <div className="relative w-full h-full overflow-hidden rounded-lg bg-[#F5EFE6]">
                        <Image
                          src={img}
                          alt={product.name}
                          fill
                          sizes="80px"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Main Featured Image / Full area cover */}
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="relative w-full max-w-[440px] sm:max-w-[460px] mx-auto sm:mx-0 rounded-2xl overflow-hidden bg-[#F5EFE6] border border-stone-200/80 shadow-xs group select-none cursor-grab active:cursor-grabbing aspect-[3/4]"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0.6, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.6, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={activeImage}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width: 640px) 100vw, 460px"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 pointer-events-none select-none"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Swipe Navigation Arrows & Pagination Dots (Shown only if multiple images exist) */}
              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-stone-800 shadow-md flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 active:scale-95 cursor-pointer border border-stone-200"
                    aria-label="Əvvəlki şəkil"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedImageIndex((prev) => (prev + 1) % gallery.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-stone-800 shadow-md flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 active:scale-95 cursor-pointer border border-stone-200"
                    aria-label="Növbəti şəkil"
                  >
                    <ChevronRight size={18} />
                  </button>

                  {/* Clean Dot Indicators */}
                  <div className="absolute bottom-3 inset-x-0 z-10 flex items-center justify-center gap-1.5 pointer-events-none">
                    {gallery.map((_, dotIdx) => (
                      <span
                        key={dotIdx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          selectedImageIndex === dotIdx ? "w-6 bg-stone-900" : "w-1.5 bg-stone-300"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {product.badge && (
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-stone-900 border border-stone-200/90 font-semibold text-[11px] uppercase tracking-wider shadow-2xs">
                    {translateBadge(product.badge, language)}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Column: Purchasing Panel */}
          <div className="lg:col-span-6 flex flex-col justify-start space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <span className="uppercase tracking-widest font-mono font-semibold text-stone-700">
                  {product.refCode || "HORVVALLE-ORIGINAL"}
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
                    {language === "az" ? "Qənaət: " : language === "ru" ? "Экономия: " : language === "tr" ? "Kazanç: " : "Save: "}
                    {formatPrice(product.compareAtPrice - product.price)}
                  </span>
                )}
              </div>
            </motion.div>

            {/* Color Selector */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-2.5 pt-4 border-t border-stone-200"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600">
                  {t.product.color}: <strong className="text-stone-900">{translateColor(activeColor.name, language)}</strong>
                </span>
                <span className="text-stone-400 text-[11px]">
                  {product.colors.length} {t.product.choices}
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
                    title={translateColor(c.name, language)}
                  >
                    {selectedColorIndex === idx && (
                      <Check size={14} className={c.hex === "#FFFFFF" || c.hex === "#F5F5F0" ? "text-black" : "text-white"} />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Size Selector & Size Guide */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-2.5 pt-4 border-t border-stone-200"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600">
                  {t.product.size}: <strong className="text-stone-900">{selectedSize}</strong>
                </span>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="flex items-center gap-1.5 text-stone-700 hover:text-stone-900 font-medium underline cursor-pointer"
                >
                  <Ruler size={13} />
                  <span>{t.product.sizeGuide}</span>
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
            </motion.div>

            {/* Action Buttons: Add to Bag & Apple Pay */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3 pt-3"
            >
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
                    <span>{t.product.addedToBag}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    <span>{t.product.addToBag}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDirectBuy}
                className="w-full py-3.5 rounded-full bg-white hover:bg-stone-50 text-stone-900 border border-stone-200 font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-98 shadow-2xs cursor-pointer"
              >
                <ApplePayLogo className="h-4 w-auto" variant="light" />
                <span>{language === "az" ? "ilə İndi Al" : language === "ru" ? "Купить сейчас с" : language === "tr" ? "ile Hemen Al" : "Buy now with"}</span>
              </button>

              {/* WhatsApp Direct Order / Consultation Button */}
              <a
                href={`https://wa.me/994557669050?text=${encodeURIComponent(
                  `Salam! HORWALLE-də "${product.name}" (${selectedSize}, ${activeColor?.name || ""}) haqqında məlumat almaq və ya sifariş etmək istəyirəm.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-full bg-emerald-50 hover:bg-emerald-100/90 text-emerald-800 border border-emerald-300/80 font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-98 shadow-2xs cursor-pointer"
              >
                <MessageCircle size={15} className="text-emerald-600 fill-emerald-600" />
                <span>WhatsApp Dəstək (+994 55-766-90-50)</span>
              </a>
            </motion.div>

            {/* Trust Badges & Supported Payments */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.40, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3 pt-4 border-t border-stone-200"
            >
              <div className="grid grid-cols-2 gap-3 text-[11px] text-stone-600">
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-stone-700 shrink-0" />
                  <span>{t.product.freeShipping}</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw size={16} className="text-stone-700 shrink-0" />
                  <span>{t.product.easyReturn}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">
                  {t.product.securePayment}:
                </span>
                <PaymentLogosRow size="sm" />
              </div>
            </motion.div>

            {/* Accordions */}
            <div className="pt-4 border-t border-stone-200 space-y-3">
              {/* 1. Description */}
              <div className="border border-stone-200/90 rounded-2xl overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setActiveAccordion(activeAccordion === "details" ? null : "details")}
                  className="w-full p-4 text-left font-semibold text-xs uppercase tracking-wider flex items-center justify-between text-stone-900 cursor-pointer"
                >
                  <span>{language === "az" ? "Məhsulun Təsviri & Kəsim" : language === "ru" ? "Описание и покрой" : language === "tr" ? "Ürün Açıklaması & Kalıp" : "Product Description & Fit"}</span>
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
                          <strong className="text-stone-900 block mb-1">
                            {language === "az" ? "Xüsusiyyətlər:" : language === "ru" ? "Особенности:" : language === "tr" ? "Özellikler:" : "Features:"}
                          </strong>
                          <ul className="list-disc pl-4 space-y-1 text-stone-600">
                            <li>{language === "az" ? "Siluet: " : language === "ru" ? "Силуэт: " : language === "tr" ? "Kalıp: " : "Fit: "}{product.fit}</li>
                            <li>{language === "az" ? "Davamlı möhkəm tikişlər" : language === "ru" ? "Прочные усиленные швы" : language === "tr" ? "Dayanıklı dikişler" : "Durable reinforced seams"}</li>
                            <li>{language === "az" ? "Mövsümün ən çox tələb olunan modeli" : language === "ru" ? "Хит сезона" : language === "tr" ? "Sezonun en popüler modeli" : "Season favourite silhouette"}</li>
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
                  <span>{language === "az" ? "Material & Qulluq Təlimatı" : language === "ru" ? "Материал и уход" : language === "tr" ? "Materyal & Bakım Talimatı" : "Composition & Care"}</span>
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
                        <p><strong className="text-stone-900">{language === "az" ? "Tərkib:" : language === "ru" ? "Состав:" : language === "tr" ? "İçerik:" : "Composition:"}</strong> {product.composition}</p>
                        <p><strong className="text-stone-900">{language === "az" ? "Qulluq:" : language === "ru" ? "Уход:" : language === "tr" ? "Bakım:" : "Care:"}</strong> {product.care}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Complete the look recommendation grid */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.48, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 pt-10 border-t border-stone-200"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-eb-garamond text-2xl sm:text-3xl lg:text-4xl font-normal text-stone-900">
              {language === "az" ? (
                <>Bu görünüşü <span className="italic text-stone-700">tamamla</span></>
              ) : language === "ru" ? (
                <>Дополните <span className="italic text-stone-700">образ</span></>
              ) : language === "tr" ? (
                <>Görünümü <span className="italic text-stone-700">tamamla</span></>
              ) : (
                <>Complete the <span className="italic text-stone-700">look</span></>
              )}
            </h2>
            <Link href="/collections" className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 group">
              <span>{language === "az" ? "Hamısına Bax" : language === "ru" ? "Смотреть все" : language === "tr" ? "Tümünü Gör" : "View All"}</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-stone-900" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommended.map((p) => (
              <ProductCard key={p.id} product={p} variant="light" />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl text-stone-900">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-lg font-bold uppercase text-stone-900 flex items-center gap-2">
                <Ruler size={18} className="text-stone-700" />
                <span>{language === "az" ? "Ölçü Cədvəli (CM)" : language === "ru" ? "Таблица размеров (СМ)" : language === "tr" ? "Beden Tablosu (CM)" : "Size Guide (CM)"}</span>
              </h3>
              <button onClick={() => setSizeGuideOpen(false)} className="text-stone-400 hover:text-stone-900 text-lg cursor-pointer">
                ✕
              </button>
            </div>
            <p className="text-xs text-stone-500">
              {language === "az" ? "Dəqiq oturuş üçün ölçülərinizi yoxlayın." : language === "ru" ? "Проверьте свои параметры для идеальной посадки." : language === "tr" ? "Mükemmel kalıp için ölçülerinizi kontrol edin." : "Check your measurements for an optimal fit."}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-stone-700">
                <thead className="bg-stone-50 text-stone-900 uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">{t.product.size}</th>
                    <th className="p-2.5">{language === "az" ? "Sinə / Bel (cm)" : language === "ru" ? "Грудь / Талия (см)" : language === "tr" ? "Göğüs / Bel (cm)" : "Chest / Waist (cm)"}</th>
                    <th className="p-2.5">{language === "az" ? "Uzunluq (cm)" : language === "ru" ? "Длина (см)" : language === "tr" ? "Uzunluk (cm)" : "Length (cm)"}</th>
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
              {language === "az" ? "Bağla" : language === "ru" ? "Закрыть" : language === "tr" ? "Kapat" : "Close"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
