"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, Plus, Check } from "lucide-react";
import { Product } from "@/data/products";
import { useCurrency } from "@/context/CurrencyContext";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
  variant?: "light" | "dark";
}

export function ProductCard({ product, variant = "light" }: ProductCardProps) {
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [addedSize, setAddedSize] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const activeColor = product.colors[selectedColorIndex] || product.colors[0];
  const displayImage =
    isHovered && activeColor?.hoverImage
      ? activeColor.hoverImage
      : activeColor?.image;

  const handleQuickAdd = (size: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      id: `${product.id}_${activeColor.name}_${size}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      size: size,
      color: activeColor.name,
      image: activeColor.image,
      type: "ready",
      stockQuantity: 99,
    });

    setAddedSize(size);
    setTimeout(() => {
      setAddedSize(null);
      setShowQuickAdd(false);
    }, 1200);
  };

  const isDark = variant === "dark";

  return (
    <div
      className={
        isDark
          ? "group relative flex flex-col bg-black/30 hover:bg-black/45 backdrop-blur-md border border-white/10 hover:border-white/25 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_20px_45px_rgba(0,0,0,0.6)] select-none"
          : "group relative flex flex-col bg-white border border-stone-200/80 rounded-2xl overflow-hidden hover:border-stone-400/80 hover:shadow-[0_20px_45px_-12px_rgba(0,0,0,0.08)] transition-all duration-300 select-none"
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowQuickAdd(false);
      }}
    >
      {/* Product Image Frame */}
      <div
        className={
          isDark
            ? "relative aspect-[3/4] w-full flex flex-col items-center justify-center p-3 sm:p-5 overflow-hidden bg-transparent"
            : "relative aspect-[3/4] w-full bg-[#F7F6F3] overflow-hidden"
        }
      >
        <Link
          href={`/products/${product.slug}`}
          prefetch={true}
          className={
            isDark
              ? "relative flex flex-col items-center justify-center w-full h-full cursor-pointer"
              : "block w-full h-full cursor-pointer"
          }
        >
          {isDark ? (
            <>
              {/* Floating Transparent Cutout Garment */}
              <img
                src={displayImage}
                alt={product.name}
                className="max-h-[82%] max-w-[88%] w-auto object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.55)] transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-105 pointer-events-none select-none"
                loading="lazy"
              />

              {/* Oval Soft Blurred Shadow Directly Beneath the Garment */}
              <div
                className="w-28 sm:w-36 h-3 bg-black/55 rounded-[50%] blur-md mt-1 pointer-events-none select-none transition-all duration-500 group-hover:scale-90 group-hover:opacity-75"
                aria-hidden="true"
              />
            </>
          ) : (
            <img
              src={displayImage}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />
          )}
        </Link>

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            <span
              className={
                isDark
                  ? "px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-[#E6C280] border border-[#E6C280]/40 rounded-full shadow-sm"
                  : "px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider bg-white/95 backdrop-blur-md text-stone-800 border border-stone-200/90 rounded-full shadow-2xs"
              }
            >
              {product.badge}
            </span>
          </div>
        )}

        {/* Wishlist action */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
            }}
            className={
              isDark
                ? "p-2 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/15 text-white/80 hover:text-white shadow-sm transition-all active:scale-90 cursor-pointer"
                : "p-2 rounded-full bg-white/90 hover:bg-white text-stone-600 hover:text-rose-600 shadow-2xs border border-stone-200/70 backdrop-blur-md transition-all active:scale-90 cursor-pointer"
            }
            aria-label="Sevimlilərə əlavə et"
          >
            <Heart
              size={15}
              className={
                isWishlisted
                  ? isDark
                    ? "fill-[#E6C280] text-[#E6C280]"
                    : "fill-rose-500 text-rose-500"
                  : ""
              }
            />
          </button>
        </div>

        {/* "Sürətli səbətə at" CTA */}
        <div className="absolute bottom-3 inset-x-3 z-20">
          {!showQuickAdd ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowQuickAdd(true);
              }}
              className={
                isDark
                  ? "w-full py-2 sm:py-2.5 px-4 rounded-full bg-white text-black hover:bg-white/90 font-semibold text-xs tracking-wider transition-all shadow-lg flex items-center justify-center gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-2 sm:group-hover:translate-y-0 active:scale-95 cursor-pointer"
                  : "w-full py-2.5 px-4 rounded-full bg-stone-900 hover:bg-black text-white font-medium text-xs tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 opacity-95 group-hover:opacity-100 cursor-pointer active:scale-98"
              }
            >
              <Plus size={14} className={isDark ? "text-black" : "text-stone-300"} />
              <span>{isDark ? "Sürətli səbətə at" : "Sürətli Səbətə At"}</span>
            </button>
          ) : (
            <div
              className={
                isDark
                  ? "bg-black/90 backdrop-blur-xl border border-white/20 p-2.5 rounded-2xl shadow-2xl animate-fadeIn text-white"
                  : "bg-white/98 backdrop-blur-md border border-stone-200 p-2.5 rounded-2xl shadow-xl animate-fadeIn text-stone-900"
              }
            >
              <div
                className={
                  isDark
                    ? "text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1.5 text-center"
                    : "text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 text-center"
                }
              >
                {isDark ? "Ölçünü seçin:" : "Ölçü Seçin:"}
              </div>
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                {product.sizes.map((size) => {
                  const isAdded = addedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={(e) => handleQuickAdd(size, e)}
                      className={
                        isDark
                          ? `px-2.5 py-1 text-xs font-bold rounded-full transition-all border cursor-pointer ${
                              isAdded
                                ? "bg-white text-black border-white scale-105"
                                : "bg-white/10 hover:bg-white hover:text-black text-white border-white/15"
                            }`
                          : `px-2.5 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                              isAdded
                                ? "bg-stone-900 text-white scale-105"
                                : "bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-800 border border-stone-200/80"
                            }`
                      }
                    >
                      {isAdded ? (
                        <Check size={12} className={isDark ? "text-black" : "text-white"} />
                      ) : (
                        size
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Details Area */}
      <div
        className={
          isDark
            ? "p-3.5 sm:p-4 flex flex-col flex-1 justify-between bg-black/20 border-t border-white/10 text-white"
            : "p-4 flex flex-col flex-1 justify-between bg-white"
        }
      >
        <div>
          {/* Color Swatch Dots */}
          <div className="flex items-center gap-1.5 mb-2">
            {product.colors.map((c, idx) => (
              <button
                key={c.name}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedColorIndex(idx);
                }}
                className={
                  isDark
                    ? `w-3.5 h-3.5 rounded-full border transition-all cursor-pointer ${
                        selectedColorIndex === idx
                          ? "ring-2 ring-white scale-110 border-black"
                          : "border-white/30 opacity-75 hover:opacity-100"
                      }`
                    : `w-3.5 h-3.5 rounded-full border transition-all cursor-pointer ${
                        selectedColorIndex === idx
                          ? "ring-2 ring-stone-900 scale-110 border-white"
                          : "border-stone-300 opacity-80 hover:opacity-100"
                      }`
                }
                style={{ backgroundColor: c.hex }}
                title={c.name}
                aria-label={c.name}
              />
            ))}
            <span
              className={
                isDark
                  ? "text-[10.5px] text-white/50 ml-1.5"
                  : "text-[11px] text-stone-400 ml-1.5"
              }
            >
              {product.colors.length} rəng
            </span>
          </div>

          {/* Product Name */}
          <Link
            href={`/products/${product.slug}`}
            prefetch={true}
            className={
              isDark
                ? "block text-sm sm:text-[15px] font-serif-luxury font-normal text-white group-hover:text-[#E6C280] transition-colors line-clamp-1 cursor-pointer"
                : "block text-[15px] font-serif-luxury font-normal text-stone-900 group-hover:text-stone-600 transition-colors line-clamp-1 cursor-pointer"
            }
          >
            {product.name}
          </Link>

          {/* Fit description */}
          <p
            className={
              isDark
                ? "text-[11px] sm:text-xs text-white/60 mt-0.5"
                : "text-xs text-stone-500 mt-0.5"
            }
          >
            {product.fit}
          </p>
        </div>

        {/* Pricing & Rating */}
        <div
          className={
            isDark
              ? "mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between"
              : "mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between"
          }
        >
          <div className="flex items-center gap-2">
            <span
              className={
                isDark
                  ? "text-sm sm:text-base font-bold text-white tracking-tight"
                  : "text-sm font-bold text-stone-900"
              }
            >
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span
                className={
                  isDark
                    ? "text-xs text-white/45 line-through"
                    : "text-xs text-stone-400 line-through"
                }
              >
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
          <span
            className={
              isDark
                ? "text-[11px] text-[#E6C280] font-semibold"
                : "text-[11px] text-amber-600 font-semibold"
            }
          >
            ★ {product.rating}{" "}
            <span
              className={
                isDark
                  ? "text-white/40 font-normal"
                  : "text-stone-400 font-normal"
              }
            >
              ({product.reviewCount})
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
