"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/data/products";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";
import { translateBadge } from "@/lib/translations";
import { availableQty } from "@/lib/stock";
import { T, tr } from "@/components/store/i18n";
import { isPerfume, perfumeLine } from "@/lib/perfume";

/** Photos of people wearing the product fill the frame; cut-outs sit on the tile with a margin. */
export const isPhoto = (src?: string) => Boolean(src && src.includes("/products/photo/"));
const fitClass = (src?: string) => (isPhoto(src) ? "object-cover object-top" : "object-contain p-[8%] mix-blend-multiply");

function isSoldOut(p: Product): boolean {
  if (p.inStock === false) return true;
  if (!p.trackStock) return false;
  return p.colors.every((c) => p.sizes.every((s) => availableQty(p, c.name, s) === 0));
}

/** Product card for dark pages: cut-out image on a graphite panel, second image on hover. */
export function ProductTile({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { formatProductPrice, formatCompareAt } = useCurrency();
  const { language } = useLanguage();
  const color = product.colors[0];
  const front = color?.image || product.image || "/images/hero/black-tee.jpg";
  const back = color?.hoverImage || color?.gallery?.find((g) => g && g !== front);
  const soldOut = isSoldOut(product);
  const onSale = Boolean(product.compareAtPrice && product.compareAtPrice > product.price);
  const badge = product.campaign
    ? `−${product.campaign.percent}%`
    : product.badge
    ? translateBadge(product.badge, language as any)
    : undefined;

  return (
    <Link href={`/products/${product.slug}`} className="group block text-bone">
      <div className="relative aspect-[4/5] overflow-hidden bg-tile">
        <Image
          src={front}
          alt={product.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`${fitClass(front)} transition duration-500 ease-out ${back ? "group-hover:opacity-0" : "group-hover:scale-[1.04]"}`}
        />
        {back && (
          <Image
            src={back}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`${fitClass(back)} opacity-0 transition duration-500 ease-out group-hover:opacity-100`}
          />
        )}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {soldOut ? (
            <span className="bg-ink px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-bone">{tr(language, T.soldOut)}</span>
          ) : (
            badge && (
              <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${onSale || product.campaign ? "bg-sale text-ink" : "bg-ink text-bone"}`}>
                {badge}
              </span>
            )
          )}
        </div>
        {product.colors.length > 1 && (
          <div className="absolute bottom-3 left-3 flex gap-1">
            {product.colors.slice(0, 5).map((c) => (
              <span key={c.name} className="h-2.5 w-2.5 rounded-full border border-black/20" style={{ backgroundColor: c.hex }} />
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 pt-3 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-[13px] font-medium leading-snug text-bone">{product.name}</h3>
          {isPerfume(product) && perfumeLine(product) && (
            <p className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-bone-faint">{perfumeLine(product)}</p>
          )}
        </div>
        <div className="shrink-0 text-[13px] font-semibold tabular-nums sm:text-right">
          <span className={onSale ? "text-sale" : "text-bone"}>{formatProductPrice(product)}</span>
          {onSale && <span className="ml-2 text-[11px] font-normal text-bone-faint line-through sm:ml-0 sm:block">{formatCompareAt(product)}</span>}
        </div>
      </div>
    </Link>
  );
}
