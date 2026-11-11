"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Minus, Plus, X } from "lucide-react";
import type { Product } from "@/data/products";
import { availableQty, LOW_STOCK } from "@/lib/stock";
import { CampaignCountdown } from "@/components/CampaignCountdown";
import { normalizeProduct, useCategories, useStoreData, useSupport } from "@/context/StoreDataContext";
import { categoryTitle } from "@/lib/categories";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { translateColor } from "@/lib/translations";
import { BackInStock } from "@/components/store/BackInStock";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { ProductTile } from "@/components/store/ProductTile";
import { T, tr } from "@/components/store/i18n";
import { useRegionCopy } from "@/components/store/region";

const SIZE_ROWS = [
  ["S / 30", "92 – 98", "72 / 100"],
  ["M / 32", "98 – 104", "74 / 102"],
  ["L / 34", "104 – 110", "76 / 104"],
  ["XL / 36", "110 – 118", "78 / 106"],
];

function Accordion({ title, children, open = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  const [isOpen, setOpen] = useState(open);
  return (
    <div className="border-b border-white/10">
      <button type="button" onClick={() => setOpen(!isOpen)} className="flex w-full items-center justify-between py-4 text-left">
        <span className="text-[12px] font-extrabold uppercase tracking-[0.16em]">{title}</span>
        {isOpen ? <Minus size={15} /> : <Plus size={15} />}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-[14px] leading-relaxed text-bone-dim">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductView({ product, related }: { product: Product; related: Product[] }) {
  const { language } = useLanguage();
  const { formatProductPrice, formatCompareAt } = useCurrency();
  const { addItem } = useCart();
  const support = useSupport();
  const region = useRegionCopy();
  const categories = useCategories();
  const cat = categories.find((c) => c.id === product.category);

  const [colorIndex, setColorIndex] = useState(0);
  const color = product.colors[colorIndex] || product.colors[0];
  const [size, setSize] = useState(product.sizes[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);
  useBodyScrollLock(guideOpen);

  const left = (s: string) => availableQty(product, color?.name || "", s);
  const selectedLeft = left(size);
  const soldOut = product.inStock === false || selectedLeft === 0;
  const onSale = Boolean(product.compareAtPrice && product.compareAtPrice > product.price);

  // links in back-in-stock e-mails carry ?color=&size=
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const c = q.get("color");
      const s = q.get("size");
      if (c) {
        const i = product.colors.findIndex((x) => x.name === c);
        if (i >= 0) setColorIndex(i);
      }
      if (s && product.sizes.includes(s)) setSize(s);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  // move off a size that is gone in this colour
  useEffect(() => {
    if (left(size) !== 0) return;
    const next = product.sizes.find((s) => left(s) !== 0);
    if (next) setSize(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id, color?.name, product.stock]);

  const gallery = useMemo(() => {
    const list = [color?.image, color?.hoverImage, ...(color?.gallery || [])];
    return list.filter((img, i, arr): img is string => Boolean(img && typeof img === "string" && img.trim()) && arr.indexOf(img) === i);
  }, [color]);

  useEffect(() => {
    setSlide(0);
    railRef.current?.scrollTo({ left: 0 });
  }, [colorIndex]);

  const add = () => {
    if (soldOut) return;
    addItem(
      {
        id: `${product.id}_${color.name}_${size}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        internationalPrice: product.internationalPrice,
        size,
        color: color.name,
        image: color.image,
        type: "ready",
        stockQuantity: selectedLeft === null ? 99 : Math.min(99, selectedLeft),
      },
      selectedLeft === null ? quantity : Math.min(quantity, selectedLeft)
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const share = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen bg-ink font-grotesk text-bone">
      <div className="mx-auto max-w-[1600px] lg:grid lg:grid-cols-12 lg:gap-10 lg:px-10 lg:pt-8">
        {/* gallery: swipe rail on phones, two-column stack on desktop */}
        <div className="lg:col-span-7">
          <div
            ref={railRef}
            onScroll={(e) => {
              const el = e.currentTarget;
              setSlide(Math.round(el.scrollLeft / el.clientWidth));
            }}
            className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] lg:grid lg:grid-cols-2 lg:gap-2 lg:overflow-visible [&::-webkit-scrollbar]:hidden"
          >
            {gallery.map((src, i) => (
              <div
                key={src}
                className={`relative aspect-[4/5] w-full shrink-0 snap-center bg-tile ${i === 0 && gallery.length % 2 === 1 ? "lg:col-span-2 lg:aspect-[5/4]" : ""}`}
              >
                <Image src={src} alt={`${product.name} ${i + 1}`} fill priority={i === 0} sizes="(max-width: 1024px) 100vw, 40vw" className="object-contain p-[7%] mix-blend-multiply" />
              </div>
            ))}
          </div>
          {gallery.length > 1 && (
            <div className="flex justify-center gap-1.5 py-3 lg:hidden">
              {gallery.map((_, i) => (
                <span key={i} className={`h-1 transition-all ${slide === i ? "w-6 bg-bone" : "w-2 bg-white/25"}`} />
              ))}
            </div>
          )}
        </div>

        {/* buy panel */}
        <div className="px-4 pb-16 pt-6 sm:px-6 lg:col-span-5 lg:px-0 lg:pt-0">
          <div className="lg:sticky lg:top-24">
            <nav className="text-[11px] font-bold uppercase tracking-[0.16em] text-bone-faint">
              <Link href="/collections" className="hover:text-bone">{tr(language, T.allProducts)}</Link>
              <span className="mx-2">/</span>
              <Link href={`/collections?category=${product.category}`} className="hover:text-bone">{cat ? categoryTitle(cat, language) : product.category}</Link>
            </nav>

            <h1 lang="en" className="mt-4 text-4xl font-black uppercase leading-[0.92] tracking-[-0.015em] [font-stretch:112%] sm:text-5xl">{product.name}</h1>

            <div className="mt-4 flex items-baseline gap-3">
              <span className={`text-2xl font-bold tabular-nums ${onSale ? "text-sale" : ""}`}>{formatProductPrice(product)}</span>
              {onSale && <span className="text-base text-bone-faint line-through">{formatCompareAt(product)}</span>}
            </div>
            {product.campaign?.showCountdown && product.campaign.endsAt && (
              <div className="mt-3">
                <CampaignCountdown endsAt={product.campaign.endsAt} percent={product.campaign.percent} language={language} />
              </div>
            )}

            {/* colour */}
            {product.colors.length > 0 && (
              <div className="mt-8">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-bone-dim">
                  {tr(language, { az: "Rəng", en: "Colour", ru: "Цвет", tr: "Renk" })}: <span className="text-bone">{translateColor(color.name, language as any)}</span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.colors.map((c, i) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setColorIndex(i)}
                      title={translateColor(c.name, language as any)}
                      className={`relative h-14 w-12 overflow-hidden border-2 bg-tile transition ${i === colorIndex ? "border-bone" : "border-transparent opacity-70 hover:opacity-100"}`}
                    >
                      <Image src={c.image} alt="" fill sizes="48px" className="object-contain p-1 mix-blend-multiply" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* size */}
            {product.sizes.length > 0 && (
              <div className="mt-7">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-bone-dim">
                    {tr(language, { az: "Ölçü", en: "Size", ru: "Размер", tr: "Beden" })}: <span className="text-bone">{size}</span>
                  </p>
                  <button type="button" onClick={() => setGuideOpen(true)} className="text-[11px] font-bold uppercase tracking-[0.14em] text-bone-dim underline underline-offset-4 hover:text-bone">
                    {tr(language, { az: "Ölçü cədvəli", en: "Size guide", ru: "Таблица размеров", tr: "Beden tablosu" })}
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {product.sizes.map((s) => {
                    const gone = left(s) === 0;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        aria-label={gone ? `${s} — ${tr(language, T.soldOut)}` : s}
                        className={`h-11 border text-[12px] font-bold uppercase transition ${
                          gone
                            ? size === s
                              ? "border-bone text-bone-dim line-through"
                              : "border-dashed border-white/15 text-bone-faint line-through hover:border-white/40"
                            : size === s
                            ? "border-bone bg-bone text-ink"
                            : "border-white/20 hover:border-bone"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
                {selectedLeft !== null && selectedLeft > 0 && selectedLeft <= LOW_STOCK && (
                  <p className="mt-3 text-[12px] font-semibold text-amber-400">
                    {tr(language, { az: `Bu ölçüdən son ${selectedLeft} ədəd`, en: `Only ${selectedLeft} left in this size`, ru: `Осталось ${selectedLeft} шт.`, tr: `Bu bedenden son ${selectedLeft} adet` })}
                  </p>
                )}
              </div>
            )}

            {/* add — or, when this colour/size is sold out, ask for a back-in-stock e-mail */}
            {soldOut ? (
              <BackInStock productId={product.id} color={color?.name || ""} size={size} />
            ) : (
            <div className="mt-8 flex gap-2">
              <div className="flex items-center border border-white/20">
                <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="h-14 px-3 hover:bg-white/10" aria-label={tr(language, { az: "Azalt", en: "Decrease", ru: "Меньше", tr: "Azalt" })}>
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-sm font-bold tabular-nums">{quantity}</span>
                <button type="button" onClick={() => setQuantity((q) => Math.min(selectedLeft ?? 99, q + 1))} className="h-14 px-3 hover:bg-white/10" aria-label={tr(language, { az: "Artır", en: "Increase", ru: "Больше", tr: "Artır" })}>
                  <Plus size={14} />
                </button>
              </div>
              <button
                type="button"
                onClick={add}
                disabled={soldOut}
                className={`flex h-14 flex-1 items-center justify-center gap-2 rounded-full text-[12px] font-extrabold uppercase tracking-[0.16em] transition [font-stretch:108%] ${
                  soldOut ? "cursor-not-allowed bg-white/10 text-bone-faint" : added ? "bg-emerald-500 text-ink" : "bg-bone text-ink hover:bg-white"
                }`}
              >
                {soldOut ? tr(language, T.soldOut) : added ? <><Check size={16} /> {tr(language, { az: "Səbətə əlavə olundu", en: "Added to bag", ru: "Добавлено", tr: "Sepete eklendi" })}</> : tr(language, { az: "Səbətə at", en: "Add to bag", ru: "В корзину", tr: "Sepete ekle" })}
              </button>
            </div>
            )}
            <a
              href={support.link(`Salam! "${product.name}" (${size}, ${color?.name || ""}) haqqında soruşmaq istəyirəm.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex h-12 items-center justify-center rounded-full border border-white/20 text-[12px] font-extrabold uppercase tracking-[0.16em] transition hover:border-bone"
            >
              {tr(language, { az: "WhatsApp ilə soruş", en: "Ask on WhatsApp", ru: "Спросить в WhatsApp", tr: "WhatsApp'tan sor" })}
            </a>

            <ul className="mt-6 space-y-1.5 text-[13px] text-bone-dim">
              <li>— {region.strip}</li>
              <li>— {tr(language, { az: "14 gün ərzində qaytarılma", en: "14-day returns", ru: "Возврат в течение 14 дней", tr: "14 gün içinde iade" })}</li>
            </ul>

            <div className="mt-8 border-t border-white/10">
              {product.description && (
                <Accordion open title={tr(language, { az: "Təsvir", en: "Description", ru: "Описание", tr: "Açıklama" })}>
                  <p className="whitespace-pre-line">{product.description}</p>
                </Accordion>
              )}
              <Accordion title={tr(language, { az: "Material və qulluq", en: "Material & care", ru: "Материал и уход", tr: "Materyal ve bakım" })}>
                <p><strong className="text-bone">{tr(language, { az: "Tərkib", en: "Composition", ru: "Состав", tr: "İçerik" })}:</strong> {product.composition}</p>
                <p className="mt-1"><strong className="text-bone">{tr(language, { az: "Kəsim", en: "Fit", ru: "Крой", tr: "Kalıp" })}:</strong> {product.fit}</p>
                <p className="mt-1"><strong className="text-bone">{tr(language, { az: "Qulluq", en: "Care", ru: "Уход", tr: "Bakım" })}:</strong> {product.care}</p>
              </Accordion>
              <Accordion title={tr(language, { az: "Çatdırılma və qaytarılma", en: "Delivery & returns", ru: "Доставка и возврат", tr: "Teslimat ve iade" })}>
                <p>
                  {region.delivery}{" "}
                  {tr(language, { az: "Məhsulu 14 gün ərzində qaytara və ya dəyişə bilərsiniz.", en: "Return or exchange within 14 days.", ru: "Возврат или обмен в течение 14 дней.", tr: "14 gün içinde iade veya değişim." })}{" "}
                  <Link href="/terms" className="text-bone underline underline-offset-4">{tr(language, { az: "Ətraflı", en: "Details", ru: "Подробнее", tr: "Detaylar" })}</Link>
                </p>
              </Accordion>
            </div>

            <div className="mt-6 flex gap-4 text-[11px] font-bold uppercase tracking-[0.14em] text-bone-faint">
              <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${product.name} — ${share}`)}`} target="_blank" rel="noopener noreferrer" className="hover:text-bone">WhatsApp</a>
              <a href={`https://t.me/share/url?url=${encodeURIComponent(share)}&text=${encodeURIComponent(product.name)}`} target="_blank" rel="noopener noreferrer" className="hover:text-bone">Telegram</a>
              <button type="button" onClick={() => navigator.clipboard?.writeText(share)} className="uppercase hover:text-bone">
                {tr(language, { az: "Linki kopyala", en: "Copy link", ru: "Копировать", tr: "Linki kopyala" })}
              </button>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mx-auto max-w-[1600px] border-t border-white/10 px-4 py-16 sm:px-6 lg:px-10">
          <h2 className="mb-8 text-3xl font-black uppercase leading-none tracking-[-0.02em] [font-stretch:118%] sm:text-5xl">
            {tr(language, { az: "Bunlar da xoşuna gələr", en: "You may also like", ru: "Вам может понравиться", tr: "Bunları da beğenebilirsin" })}
          </h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
            {related.map((p) => (
              <ProductTile key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <AnimatePresence>
        {guideOpen && (
          <div data-lenis-prevent className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/75" onClick={() => setGuideOpen(false)} />
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="relative w-full max-w-lg border border-white/10 bg-ink p-6 font-grotesk text-bone">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black uppercase [font-stretch:112%]">{tr(language, { az: "Ölçü cədvəli (sm)", en: "Size guide (cm)", ru: "Таблица размеров (см)", tr: "Beden tablosu (cm)" })}</h3>
                <button type="button" onClick={() => setGuideOpen(false)} aria-label={tr(language, T.close)}><X size={20} /></button>
              </div>
              <table className="mt-5 w-full text-left text-[13px]">
                <thead className="text-[11px] uppercase tracking-[0.14em] text-bone-faint">
                  <tr>
                    <th className="py-2">{tr(language, { az: "Ölçü", en: "Size", ru: "Размер", tr: "Beden" })}</th>
                    <th className="py-2">{tr(language, { az: "Sinə / bel", en: "Chest / waist", ru: "Грудь / талия", tr: "Göğüs / bel" })}</th>
                    <th className="py-2">{tr(language, { az: "Uzunluq", en: "Length", ru: "Длина", tr: "Uzunluk" })}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {SIZE_ROWS.map((r) => (
                    <tr key={r[0]}>
                      <td className="py-2.5 font-bold">{r[0]}</td>
                      <td className="py-2.5 text-bone-dim">{r[1]}</td>
                      <td className="py-2.5 text-bone-dim">{r[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { products } = useStoreData();
  const [direct, setDirect] = useState<Product | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    let cancelled = false;
    fetch(`/api/store/products?q=${encodeURIComponent(slug)}&_t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((items) => {
        const found = Array.isArray(items) ? items.find((p: any) => p.slug === slug || p.id === slug) : null;
        if (!cancelled && found) setDirect(normalizeProduct(found));
      })
      .catch(() => {})
      .finally(() => !cancelled && setChecked(true));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const fromStore = products.find((p) => p.slug === slug || p.id === slug);
  // the store copy carries the visitor's language; the direct fetch only fills in when the store does not have it
  const product = fromStore || direct;
  const related = useMemo(() => {
    if (!product) return [];
    const same = products.filter((p) => p.id !== product.id && p.category === product.category);
    const rest = products.filter((p) => p.id !== product.id && p.category !== product.category);
    return [...same, ...rest].slice(0, 4);
  }, [products, product]);

  if (!product) {
    if (!checked) return <div className="min-h-screen bg-ink" />;
    return notFound();
  }
  return <ProductView key={product.id} product={product} related={related} />;
}
