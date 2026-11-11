"use client";

import React, { useMemo, useRef, useState } from "react";
import { Check, ImagePlus, Minus, Move, Plus, RotateCcw, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";
import { useStoreData } from "@/context/StoreDataContext";
import {
  STUDIO_COLORS,
  STUDIO_PRODUCTS,
  printTypes,
  resolveStudio,
  studioName,
  studioPrice,
  type ExtraSpot,
  type GroupKey,
  type PrintType,
  type StudioProduct,
  type StudioSide,
} from "@/lib/studio/catalog";
import { PRINT_AREAS, mockupDataUrl, mockupSvg, type Area } from "@/lib/studio/mockups";
import { tr, type Phrase } from "@/components/store/i18n";

type Transform = { posX: number; posY: number; scale: number };
const ZERO: Transform = { posX: 0, posY: 0, scale: 1 };
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const GROUPS: Record<GroupKey, Phrase> = {
  tshirt: { az: "Futbolka", en: "T-shirts", ru: "Футболки", tr: "Tişört" },
  polo: { az: "Polo", en: "Polo", ru: "Поло", tr: "Polo" },
  sweatshirt: { az: "Sviter", en: "Sweatshirts", ru: "Свитшоты", tr: "Sweatshirt" },
  hoodie: { az: "Hudi", en: "Hoodies", ru: "Худи", tr: "Hoodie" },
  jacket: { az: "Gödəkcə", en: "Jackets", ru: "Куртки", tr: "Ceket" },
  halfzip: { az: "Yarımzamok", en: "Half-zip", ru: "Полузамок", tr: "Yarım fermuar" },
  track: { az: "Balonka", en: "Track jacket", ru: "Олимпийка", tr: "Eşofman üstü" },
  pants: { az: "Şalvar", en: "Pants", ru: "Брюки", tr: "Pantolon" },
  shorts: { az: "Şortik", en: "Shorts", ru: "Шорты", tr: "Şort" },
  cap: { az: "Kepka", en: "Caps", ru: "Кепки", tr: "Şapka" },
};
const COLOR_LABEL: Record<string, Phrase> = {
  white: { az: "Ağ", en: "White", ru: "Белый", tr: "Beyaz" },
  black: { az: "Qara", en: "Black", ru: "Чёрный", tr: "Siyah" },
  grey: { az: "Boz", en: "Grey", ru: "Серый", tr: "Gri" },
  sand: { az: "Qum beji", en: "Sand", ru: "Песочный", tr: "Kum" },
  beige: { az: "Bej", en: "Beige", ru: "Бежевый", tr: "Bej" },
  skyblue: { az: "Açıq mavi", en: "Sky blue", ru: "Голубой", tr: "Açık mavi" },
  navy: { az: "Tünd göy", en: "Navy", ru: "Тёмно-синий", tr: "Lacivert" },
  olive: { az: "Zeytun", en: "Olive", ru: "Оливковый", tr: "Zeytin" },
  red: { az: "Qırmızı", en: "Red", ru: "Красный", tr: "Kırmızı" },
  gold: { az: "Qızılı", en: "Gold", ru: "Золотой", tr: "Altın" },
};
const TYPE_LABEL: Record<PrintType, { title: Phrase; hint: Phrase }> = {
  small: { title: { az: "Kiçik loqo", en: "Small logo", ru: "Маленький логотип", tr: "Küçük logo" }, hint: { az: "10 sm-ə qədər", en: "up to 10 cm", ru: "до 10 см", tr: "10 cm'e kadar" } },
  one: { title: { az: "Bir tərəf", en: "One side", ru: "Одна сторона", tr: "Tek taraf" }, hint: { az: "Ön və ya arxa, böyük", en: "Front or back, large", ru: "Перед или спина, крупно", tr: "Ön veya arka, büyük" } },
  two: { title: { az: "İki tərəf", en: "Both sides", ru: "Две стороны", tr: "İki taraf" }, hint: { az: "Ön və arxa", en: "Front and back", ru: "Перед и спина", tr: "Ön ve arka" } },
};
const EXTRA_LABEL: Record<ExtraSpot, Phrase> = {
  sleeveLeft: { az: "Sol qol", en: "Left sleeve", ru: "Левый рукав", tr: "Sol kol" },
  sleeveRight: { az: "Sağ qol", en: "Right sleeve", ru: "Правый рукав", tr: "Sağ kol" },
  neck: { az: "Boyun arxası", en: "Back of neck", ru: "Под воротником", tr: "Ense" },
  side: { az: "Yan tərəf", en: "Side", ru: "Сбоку", tr: "Yan" },
  leg: { az: "Ayaq (aşağı)", en: "Lower leg", ru: "Штанина внизу", tr: "Paça" },
  pocket: { az: "Cib", en: "Pocket", ru: "Карман", tr: "Cep" },
};
const SIDE_LABEL: Record<StudioSide, Phrase> = {
  front: { az: "Ön", en: "Front", ru: "Перед", tr: "Ön" },
  back: { az: "Arxa", en: "Back", ru: "Спина", tr: "Arka" },
};
const AZ_LABEL = { small: "Kiçik loqo", one: "Bir tərəf", two: "İki tərəf" } as const;
const AZ_EXTRA: Record<ExtraSpot, string> = { sleeveLeft: "Sol qol", sleeveRight: "Sağ qol", neck: "Boyun arxası", side: "Yan tərəf", leg: "Ayaq", pocket: "Cib" };

const pct = (a: Area): React.CSSProperties => ({ left: `${a.cx / 4}%`, top: `${a.cy / 4}%`, width: `${a.w / 4}%`, height: `${a.h / 4}%` });

function Step({ n, title, aside, children }: { n: number; title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border-t border-white/10 py-7">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-[13px] font-extrabold uppercase tracking-[0.16em]">
          <span className="mr-2 text-bone-faint">{String(n).padStart(2, "0")}</span>
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export default function StudioPage() {
  const { addItem, openCart } = useCart();
  const { formatProductPrice } = useCurrency();
  // studio prices are in manat; foreign buyers see the foreign price (lib/pricing.ts)
  const formatPrice = (azn: number) => formatProductPrice({ price: azn });
  const { language } = useLanguage();
  const L = (p: Phrase) => tr(language, p);
  const { settings } = useStoreData();
  // prices and the product list come from Admin → Studio qiymətləri (defaults from the price list)
  const studio = useMemo(() => resolveStudio((settings as any)?.studioPrices), [settings]);

  const stageRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadSide = useRef<StudioSide>("front");

  const [pickedId, setPickedId] = useState<string>(studio.products[0]?.id || STUDIO_PRODUCTS[0].id);
  const product: StudioProduct = studio.products.find((p) => p.id === pickedId) || studio.products[0] || STUDIO_PRODUCTS[0];
  const [colorKey, setColorKey] = useState(product.colors[0]);
  const [size, setSize] = useState("L");
  const [type, setType] = useState<PrintType>("one");
  const [printSide, setPrintSide] = useState<StudioSide>("front");
  const [view, setView] = useState<StudioSide>("front");
  const [extras, setExtras] = useState<ExtraSpot[]>([]);
  const [images, setImages] = useState<Partial<Record<StudioSide, { src: string; name: string }>>>({});
  const [transforms, setTransforms] = useState<Record<StudioSide, Transform>>({ front: ZERO, back: ZERO });
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const hex = STUDIO_COLORS[colorKey] || "#F4F3EF";
  const types = printTypes(product);
  const areas = PRINT_AREAS[product.shape];
  const price = studioPrice(product, types.includes(type) ? type : types[0], extras, studio) ?? 0;
  const sidesUsed: StudioSide[] = type === "two" ? ["front", "back"] : [printSide];
  const svg = useMemo(() => mockupSvg(product.shape, hex, view, "stage"), [product.shape, hex, view]);
  const groups = useMemo(() => {
    const map = new Map<GroupKey, StudioProduct[]>();
    for (const p of studio.products) map.set(p.group, [...(map.get(p.group) || []), p]);
    return Array.from(map.entries());
  }, [studio]);

  // the design shown on a side: its own upload, or the front design for the back of a two-sided print
  const imageFor = (s: StudioSide) => images[s]?.src || (type === "two" && s === "back" ? images.front?.src : undefined);
  const mainArea = (s: StudioSide): Area | undefined => (type === "small" ? areas[s].small || areas[s].large : areas[s].large || areas[s].small);
  const viewHasMain = sidesUsed.includes(view);
  const t = transforms[view];
  const setT = (patch: Partial<Transform>) => setTransforms((all) => ({ ...all, [view]: { ...all[view], ...patch } }));

  const chooseProduct = (p: StudioProduct) => {
    setPickedId(p.id);
    if (!p.colors.includes(colorKey)) setColorKey(p.colors[0]);
    if (!p.sizes.includes(size)) setSize(p.sizes.includes("L") ? "L" : p.sizes[0]);
    const pt = printTypes(p);
    if (!pt.includes(type)) setType(pt.includes("one") ? "one" : pt[0]);
    if (!p.hasBack) {
      setPrintSide("front");
      setView("front");
    }
    setExtras((list) => list.filter((e) => p.extras.includes(e)));
  };
  const chooseType = (tp: PrintType) => {
    setType(tp);
    if (tp !== "two") setView(printSide);
  };
  const chooseSide = (s: StudioSide) => {
    setPrintSide(s);
    setView(s);
  };
  const toggleExtra = (e: ExtraSpot) => {
    setExtras((list) => (list.includes(e) ? list.filter((x) => x !== e) : [...list, e]));
    const spot = areas.extras[e];
    if (spot) setView(spot.side);
  };

  const pickFile = (s: StudioSide) => {
    uploadSide.current = s;
    fileRef.current?.click();
  };
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    if (file.size > 30 * 1024 * 1024) {
      setError(L({ az: "Fayl 30 MB-dan böyük olmamalıdır.", en: "The file must be smaller than 30 MB.", ru: "Файл должен быть меньше 30 МБ.", tr: "Dosya 30 MB'den küçük olmalı." }));
      return;
    }
    const s = uploadSide.current;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImages((all) => ({ ...all, [s]: { src: reader.result as string, name: file.name } }));
        setView(s);
      }
    };
    reader.readAsDataURL(file);
  };

  // drag to move, corner handle to resize, wheel to zoom
  const drag = useRef<{ x: number; y: number; posX: number; posY: number; scale: number; mode: "move" | "resize" } | null>(null);
  const startDrag = (mode: "move" | "resize") => (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, posX: t.posX, posY: t.posY, scale: t.scale, mode };
  };
  const moveDrag = (e: React.PointerEvent) => {
    const d = drag.current;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!d || !rect) return;
    if (d.mode === "move") {
      setT({
        posX: clamp(Math.round(d.posX + ((e.clientX - d.x) / rect.width) * 100), -25, 25),
        posY: clamp(Math.round(d.posY + ((e.clientY - d.y) / rect.height) * 100), -25, 25),
      });
    } else {
      setT({ scale: clamp(Number((d.scale + (e.clientX - d.x + (e.clientY - d.y)) / (rect.width * 0.4)).toFixed(2)), 0.3, 1.6) });
    }
  };
  const endDrag = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    drag.current = null;
  };

  const placementLabel = [type === "two" ? AZ_LABEL.two : `${AZ_LABEL[type]} (${printSide === "front" ? "ön" : "arxa"})`, ...extras.map((e) => AZ_EXTRA[e])].join(" + ");

  const addToBag = () => {
    const missing = sidesUsed.filter((s) => !imageFor(s));
    if (missing.length) {
      setError(L({ az: "Əvvəlcə dizayn faylını yükləyin.", en: "Upload your design file first.", ru: "Сначала загрузите файл дизайна.", tr: "Önce tasarım dosyanızı yükleyin." }));
      document.getElementById("studio-upload")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const front = imageFor("front");
    const back = imageFor("back");
    const mainSide = sidesUsed[0];
    addItem({
      id: `pod_${Date.now()}_${product.id}_${size}`,
      productId: product.id,
      name: `${L({ az: "Öz dizayn", en: "Custom design", ru: "Свой дизайн", tr: "Kendi tasarımın" })}: ${studioName(product, language)}`,
      price,
      size,
      color: COLOR_LABEL[colorKey]?.az || colorKey,
      image: mockupDataUrl(product.shape, hex, mainSide),
      type: "custom",
      customDesignPreview: imageFor(mainSide),
      customData: {
        garmentType: product.name,
        garmentColor: COLOR_LABEL[colorKey]?.az || colorKey,
        size,
        printType: type,
        printSide: type === "two" ? "both" : printSide,
        extras,
        placement: placementLabel,
        placementKey: type,
        customerNote: note.trim(),
        transform: transforms[mainSide],
        uploadedImage: imageFor(mainSide),
        frontDesign: sidesUsed.includes("front") ? { image: front, transform: transforms.front } : {},
        backDesign: sidesUsed.includes("back") ? { image: back, transform: transforms.back } : {},
        previewImage: mockupDataUrl(product.shape, hex, mainSide),
        price,
      },
      stockQuantity: 99,
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      openCart();
    }, 400);
  };

  const viewImage = viewHasMain ? imageFor(view) : undefined;
  const area = viewHasMain ? mainArea(view) : undefined;
  const iconBtn = "flex h-9 w-9 items-center justify-center border border-white/15 text-bone transition hover:border-bone";
  const chip = (on: boolean) => `border px-3.5 py-3 text-left transition ${on ? "border-bone bg-bone text-ink" : "border-white/15 hover:border-white/40"}`;

  const uploadSlot = (s: StudioSide, label?: string) => {
    const img = images[s];
    return (
      <div key={s}>
        {label && <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-bone-dim">{label}</p>}
        {img ? (
          <div className="flex items-center gap-3 border border-white/15 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.src} alt="" className="h-14 w-14 shrink-0 bg-tile object-contain p-1" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold">{img.name}</p>
              <button type="button" onClick={() => pickFile(s)} className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-bone-dim hover:text-bone">
                {L({ az: "Dəyiş", en: "Replace", ru: "Заменить", tr: "Değiştir" })}
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setImages((all) => ({ ...all, [s]: undefined }));
                setTransforms((all) => ({ ...all, [s]: ZERO }));
              }}
              className="p-2 text-bone-faint hover:text-bone"
              aria-label={L({ az: "Sil", en: "Remove", ru: "Удалить", tr: "Kaldır" })}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => pickFile(s)}
            className="flex w-full flex-col items-center justify-center gap-2 border border-dashed border-white/25 px-4 py-8 text-center transition hover:border-bone"
          >
            <ImagePlus size={22} strokeWidth={1.6} />
            <span className="text-[13px] font-semibold">{L({ az: "Faylı seç", en: "Choose a file", ru: "Выбрать файл", tr: "Dosya seç" })}</span>
            <span className="text-[12px] text-bone-faint">PNG, JPG, WEBP, SVG · max 30 MB</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-ink font-grotesk text-bone">
      <div className="mx-auto max-w-[1600px] px-4 pb-32 pt-8 sm:px-6 lg:px-10 lg:pb-24">
        <h1 className="text-[12vw] font-black uppercase leading-[0.88] tracking-[-0.02em] [font-stretch:115%] sm:text-7xl">
          {L({ az: "Öz dizaynını yarat", en: "Create your own", ru: "Создай свой дизайн", tr: "Kendi tasarımını yap" })}
        </h1>
        <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-bone-dim">
          {L({
            az: "Məhsulu seç, şəklini və ya loqonu yüklə, yerini göstər. Hazırlamadan əvvəl rəngi və ölçünü sənin üçün yoxlayırıq.",
            en: "Pick a product, upload your image or logo and place it. We check colour and size for you before production.",
            ru: "Выбери изделие, загрузи изображение или логотип и размести его. Перед производством мы проверим цвет и размер.",
            tr: "Ürünü seç, görselini veya logonu yükle ve yerleştir. Üretimden önce renk ve boyutu senin için kontrol ederiz.",
          })}
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          {/* preview */}
          <div className="lg:col-span-7">
            <div className="lg:sticky lg:top-24">
              {product.hasBack && (
                <div className="mb-3 flex gap-2">
                  {(["front", "back"] as StudioSide[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setView(s)}
                      className={`border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition ${view === s ? "border-bone bg-bone text-ink" : "border-white/20 hover:border-bone"}`}
                    >
                      {L(SIDE_LABEL[s])}
                    </button>
                  ))}
                </div>
              )}

              <div
                ref={stageRef}
                onWheel={(e) => viewImage && setT({ scale: clamp(Number((t.scale + (e.deltaY < 0 ? 0.05 : -0.05)).toFixed(2)), 0.3, 1.6) })}
                className="relative aspect-square w-full select-none overflow-hidden bg-tile"
              >
                <div className="pointer-events-none absolute inset-[4%]" dangerouslySetInnerHTML={{ __html: svg }} />
                <div className="absolute inset-[4%]">
                  {area && (
                    <div
                      className={`absolute flex items-center justify-center ${viewImage ? "" : "border border-dashed border-ink/40"}`}
                      style={{ ...pct(area), transform: "translate(-50%, -50%)" }}
                    >
                      {viewImage ? (
                        <div
                          onPointerDown={startDrag("move")}
                          onPointerMove={moveDrag}
                          onPointerUp={endDrag}
                          className="relative flex h-full w-full cursor-grab items-center justify-center active:cursor-grabbing"
                          style={{ transform: `translate(${t.posX}%, ${t.posY}%) scale(${t.scale})`, touchAction: "none" }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={viewImage} alt="" draggable={false} className="pointer-events-none max-h-full max-w-full object-contain" />
                          <span className="pointer-events-none absolute inset-0 border border-dashed border-ink/50" />
                          <div
                            onPointerDown={startDrag("resize")}
                            onPointerMove={moveDrag}
                            onPointerUp={endDrag}
                            className="absolute -bottom-3 -right-3 flex h-6 w-6 cursor-nwse-resize items-center justify-center rounded-full bg-ink text-bone"
                            title={L({ az: "Dartıb ölçünü dəyiş", en: "Drag to resize", ru: "Потяни, чтобы изменить размер", tr: "Boyutlandırmak için sürükle" })}
                          >
                            <Plus size={12} />
                          </div>
                        </div>
                      ) : (
                        <span className="bg-ink px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-bone">
                          {L({ az: "Dizayn yeri", en: "Design area", ru: "Зона дизайна", tr: "Tasarım alanı" })}
                        </span>
                      )}
                    </div>
                  )}
                  {extras.map((e) => {
                    const spot = areas.extras[e];
                    if (!spot || spot.side !== view) return null;
                    const src = imageFor("front") || imageFor("back");
                    return (
                      <div key={e} className="absolute flex items-center justify-center border border-dashed border-ink/40" style={{ ...pct(spot.area), transform: "translate(-50%, -50%)" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {src ? <img src={src} alt="" className="max-h-full max-w-full object-contain" /> : <span className="text-[8px] font-bold text-ink/60">+</span>}
                      </div>
                    );
                  })}
                </div>
                <span className="absolute bottom-3 left-3 bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-bone">
                  {L(COLOR_LABEL[colorKey] || { az: colorKey, en: colorKey, ru: colorKey, tr: colorKey })} · {size}
                </span>
              </div>

              {viewImage && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="mr-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-bone-dim">
                    <Move size={13} /> {L({ az: "Ölçü", en: "Size", ru: "Размер", tr: "Boyut" })}
                  </span>
                  <button type="button" className={iconBtn} onClick={() => setT({ scale: clamp(Number((t.scale - 0.1).toFixed(2)), 0.3, 1.6) })} aria-label="−">
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center text-[12px] font-bold tabular-nums">{Math.round(t.scale * 100)}%</span>
                  <button type="button" className={iconBtn} onClick={() => setT({ scale: clamp(Number((t.scale + 0.1).toFixed(2)), 0.3, 1.6) })} aria-label="+">
                    <Plus size={14} />
                  </button>
                  <span className="mx-1 h-5 w-px bg-white/15" />
                  {[
                    { k: "←", p: { posX: clamp(t.posX - 4, -25, 25) } },
                    { k: "↑", p: { posY: clamp(t.posY - 4, -25, 25) } },
                    { k: "↓", p: { posY: clamp(t.posY + 4, -25, 25) } },
                    { k: "→", p: { posX: clamp(t.posX + 4, -25, 25) } },
                  ].map((b) => (
                    <button key={b.k} type="button" className={`${iconBtn} text-sm`} onClick={() => setT(b.p)} aria-label={b.k}>
                      {b.k}
                    </button>
                  ))}
                  <button type="button" onClick={() => setT(ZERO)} className="ml-auto flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-bone-dim hover:text-bone">
                    <RotateCcw size={13} /> {L({ az: "Sıfırla", en: "Reset", ru: "Сбросить", tr: "Sıfırla" })}
                  </button>
                </div>
              )}
              {!viewHasMain && product.hasBack && (
                <p className="mt-3 text-[12px] text-bone-dim">
                  {L({ az: "Bu tərəfdə əsas dizayn yoxdur.", en: "No main design on this side.", ru: "На этой стороне нет основного дизайна.", tr: "Bu tarafta ana tasarım yok." })}
                </p>
              )}
              <p className="mt-3 text-[12px] text-bone-faint">
                {L({
                  az: "Şəkli məhsulun üzərində sürüşdürə, küncündən dartıb ölçüsünü dəyişə bilərsiniz. Önbaxış təxminidir.",
                  en: "Drag the design and pull its corner to resize. The preview is approximate.",
                  ru: "Перетаскивайте дизайн и тяните за угол, чтобы изменить размер. Превью приблизительное.",
                  tr: "Tasarımı sürükleyin, köşesinden çekerek boyutlandırın. Önizleme yaklaşıktır.",
                })}
              </p>
            </div>
          </div>

          {/* configurator */}
          <div className="lg:col-span-5">
            <Step n={1} title={L({ az: "Məhsul", en: "Product", ru: "Изделие", tr: "Ürün" })} aside={<span className="text-right text-[12px] text-bone-dim">{studioName(product, language)}</span>}>
              <div className="space-y-5">
                {groups.map(([g, list]) => (
                  <div key={g}>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-bone-faint">{L(GROUPS[g])}</p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {list.map((p) => {
                        const on = p.id === product.id;
                        const from = studioPrice(p, printTypes(p)[0], [], studio) ?? 0;
                        return (
                          <button key={p.id} type="button" onClick={() => chooseProduct(p)} className={`${chip(on)} flex items-center justify-between gap-3`}>
                            <span className="text-[13px] font-semibold leading-snug">{studioName(p, language)}</span>
                            <span className={`shrink-0 text-[12px] font-bold tabular-nums ${on ? "text-ink/70" : "text-bone-dim"}`}>
                              {L({ az: "", en: "from ", ru: "от ", tr: "" })}
                              {formatPrice(from)}
                              {language === "az" ? "-dan" : language === "tr" ? "'den" : ""}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Step>

            <Step n={2} title={L({ az: "Rəng və ölçü", en: "Colour & size", ru: "Цвет и размер", tr: "Renk ve beden" })} aside={<span className="text-[12px] text-bone-dim">{L(COLOR_LABEL[colorKey] || { az: colorKey, en: colorKey, ru: colorKey, tr: colorKey })}</span>}>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColorKey(c)}
                    title={L(COLOR_LABEL[c])}
                    aria-label={L(COLOR_LABEL[c])}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${c === colorKey ? "border-bone" : "border-transparent hover:border-white/40"}`}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20" style={{ backgroundColor: STUDIO_COLORS[c] }}>
                      {c === colorKey && <Check size={13} className={["white", "sand", "beige", "skyblue", "gold", "grey"].includes(c) ? "text-ink" : "text-white"} />}
                    </span>
                  </button>
                ))}
              </div>
              {product.sizes.length > 1 ? (
                <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {product.sizes.map((s) => (
                    <button key={s} type="button" onClick={() => setSize(s)} className={`h-11 border text-[12px] font-bold transition ${s === size ? "border-bone bg-bone text-ink" : "border-white/20 hover:border-bone"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-[12px] text-bone-dim">
                  {L({ az: "Ölçü", en: "Size", ru: "Размер", tr: "Beden" })}: {product.sizes[0]}
                </p>
              )}
            </Step>

            <Step n={3} title={L({ az: "Çap", en: "Print", ru: "Печать", tr: "Baskı" })}>
              <div className={`grid gap-2 ${types.length === 3 ? "grid-cols-3" : types.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
                {types.map((tp) => {
                  const on = tp === type;
                  return (
                    <button key={tp} type="button" onClick={() => chooseType(tp)} className={chip(on)}>
                      <span className="block text-[13px] font-bold">{L(TYPE_LABEL[tp].title)}</span>
                      <span className={`block text-[11px] ${on ? "text-ink/70" : "text-bone-faint"}`}>{L(TYPE_LABEL[tp].hint)}</span>
                      <span className="mt-1.5 block text-[13px] font-bold tabular-nums">{formatPrice(studioPrice(product, tp, [], studio) ?? 0)}</span>
                    </button>
                  );
                })}
              </div>

              {type !== "two" && product.hasBack && (
                <div className="mt-4 flex gap-2">
                  {(["front", "back"] as StudioSide[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => chooseSide(s)}
                      className={`flex-1 border py-2.5 text-[12px] font-bold uppercase tracking-[0.14em] transition ${printSide === s ? "border-bone bg-bone text-ink" : "border-white/20 hover:border-bone"}`}
                    >
                      {L(SIDE_LABEL[s])}
                    </button>
                  ))}
                </div>
              )}

              {product.extras.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-bone-faint">
                    {L({ az: "Əlavə yer", en: "Extra spot", ru: "Дополнительно", tr: "Ek alan" })} · +{formatPrice(studio.extra)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.extras.map((e) => {
                      const on = extras.includes(e);
                      return (
                        <button
                          key={e}
                          type="button"
                          onClick={() => toggleExtra(e)}
                          className={`flex items-center gap-2 border px-3.5 py-2.5 text-[12px] font-bold transition ${on ? "border-bone bg-bone text-ink" : "border-white/20 hover:border-bone"}`}
                        >
                          <span className={`flex h-4 w-4 items-center justify-center border ${on ? "border-ink" : "border-white/40"}`}>{on && <Check size={11} />}</span>
                          {L(EXTRA_LABEL[e])}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </Step>

            <Step n={4} title={L({ az: "Dizayn faylı", en: "Design file", ru: "Файл дизайна", tr: "Tasarım dosyası" })}>
              <div id="studio-upload" className="space-y-4">
                {type === "two" ? (
                  <>
                    {uploadSlot("front", L({ az: "Ön tərəf", en: "Front", ru: "Перед", tr: "Ön" }))}
                    {uploadSlot("back", L({ az: "Arxa tərəf (boş qalsa ön dizayn işlənir)", en: "Back (uses the front design if empty)", ru: "Спина (если пусто — как спереди)", tr: "Arka (boşsa ön tasarım kullanılır)" }))}
                  </>
                ) : (
                  uploadSlot(printSide)
                )}
                <input ref={fileRef} type="file" accept="image/*,.svg" className="hidden" onChange={onFile} />
                {error && <p className="text-[13px] font-semibold text-sale">{error}</p>}
              </div>
            </Step>

            <Step n={5} title={L({ az: "Qeyd", en: "Note", ru: "Комментарий", tr: "Not" })} aside={<span className="text-[12px] text-bone-faint">{L({ az: "istəyə görə", en: "optional", ru: "необязательно", tr: "isteğe bağlı" })}</span>}>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={L({
                  az: "Məs: yaxadan 5 sm aşağı, eni təxminən 25 sm",
                  en: "E.g. 5 cm below the collar, about 25 cm wide",
                  ru: "Напр.: на 5 см ниже воротника, ширина около 25 см",
                  tr: "Örn: yakadan 5 cm aşağı, yaklaşık 25 cm genişlik",
                })}
                className="w-full resize-none border border-white/15 bg-transparent p-3.5 text-[14px] text-bone placeholder:text-bone-faint focus:border-bone focus:outline-none"
              />
            </Step>

            <div className="hidden border-t border-white/10 pt-7 lg:block">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-bone-faint">
                {studioName(product, language)} · {L(TYPE_LABEL[type].title)}
                {extras.length ? ` + ${extras.length}` : ""}
              </p>
              <p className="mt-1 text-3xl font-black tabular-nums">{formatPrice(price)}</p>
              <button
                type="button"
                onClick={addToBag}
                className={`mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full text-[12px] font-extrabold uppercase tracking-[0.16em] transition ${added ? "bg-emerald-500 text-ink" : "bg-bone text-ink hover:bg-white"}`}
              >
                {added && <Check size={16} />}
                {added ? L({ az: "Səbətə əlavə olundu", en: "Added to bag", ru: "Добавлено", tr: "Sepete eklendi" }) : L({ az: "Səbətə at", en: "Add to bag", ru: "В корзину", tr: "Sepete ekle" })}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="hw-buybar fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-[1600px] items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] text-bone-dim">
              {studioName(product, language)} · {L(TYPE_LABEL[type].title)}
            </p>
            <p className="text-lg font-black tabular-nums">{formatPrice(price)}</p>
          </div>
          <button type="button" onClick={addToBag} className={`h-12 shrink-0 rounded-full px-6 text-[12px] font-extrabold uppercase tracking-[0.14em] ${added ? "bg-emerald-500 text-ink" : "bg-bone text-ink"}`}>
            {added ? L({ az: "Əlavə olundu", en: "Added", ru: "Добавлено", tr: "Eklendi" }) : L({ az: "Səbətə at", en: "Add to bag", ru: "В корзину", tr: "Sepete ekle" })}
          </button>
        </div>
      </div>
    </div>
  );
}
