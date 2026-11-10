"use client";

import React, { useMemo, useRef, useState } from "react";
import { Check, ImagePlus, Minus, Move, Plus, RotateCcw, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";
import { GARMENTS, PLACEMENTS, type GarmentOption, type PlacementOption } from "@/lib/studio/catalog";
import { tr, type Phrase } from "@/components/store/i18n";

type Side = "front" | "back" | "left" | "right";
type Transform = { posX: number; posY: number; scale: number; rotation: number };

const COLORS: Array<{ key: string; name: string; label: Phrase; hex: string }> = [
  { key: "white", name: "Ağ", label: { az: "Ağ", en: "White", ru: "Белый", tr: "Beyaz" }, hex: "#FFFFFF" },
  { key: "black", name: "Qara", label: { az: "Qara", en: "Black", ru: "Чёрный", tr: "Siyah" }, hex: "#18181B" },
  { key: "sand", name: "Qum Beji", label: { az: "Qum beji", en: "Sand", ru: "Песочный", tr: "Kum bej" }, hex: "#D7CEC7" },
  { key: "sky-blue", name: "Açıq Mavi", label: { az: "Açıq mavi", en: "Sky blue", ru: "Голубой", tr: "Açık mavi" }, hex: "#93C5FD" },
  { key: "darkblue", name: "Tünd Göy", label: { az: "Tünd göy", en: "Navy", ru: "Тёмно-синий", tr: "Lacivert" }, hex: "#1E293B" },
  { key: "green", name: "Zeytun Yaşılı", label: { az: "Zeytun yaşılı", en: "Olive", ru: "Оливковый", tr: "Zeytin yeşili" }, hex: "#3F4F38" },
  { key: "red", name: "Qırmızı", label: { az: "Qırmızı", en: "Red", ru: "Красный", tr: "Kırmızı" }, hex: "#A32C2C" },
];
const SIZES = ["S", "M", "L", "XL", "2XL", "3XL"];

const SIDE_LABEL: Record<Side, Phrase> = {
  front: { az: "Ön", en: "Front", ru: "Перед", tr: "Ön" },
  back: { az: "Arxa", en: "Back", ru: "Спина", tr: "Arka" },
  left: { az: "Sol qol", en: "Left sleeve", ru: "Левый рукав", tr: "Sol kol" },
  right: { az: "Sağ qol", en: "Right sleeve", ru: "Правый рукав", tr: "Sağ kol" },
};

const PLACEMENT_LABEL: Record<string, Phrase> = {
  "front-center": { az: "Sinə — böyük", en: "Chest — large", ru: "Грудь — крупно", tr: "Göğüs — büyük" },
  "front-left": { az: "Sol sinə — kiçik loqo", en: "Left chest — small logo", ru: "Левая грудь — логотип", tr: "Sol göğüs — küçük logo" },
  "back-center": { az: "Kürək — böyük", en: "Back — large", ru: "Спина — крупно", tr: "Sırt — büyük" },
  "back-neck": { az: "Boyun altı — kiçik", en: "Below the collar — small", ru: "Под воротником — мелко", tr: "Yaka altı — küçük" },
  "sleeve-left": { az: "Sol qol", en: "Left sleeve", ru: "Левый рукав", tr: "Sol kol" },
  "sleeve-right": { az: "Sağ qol", en: "Right sleeve", ru: "Правый рукав", tr: "Sağ kol" },
  "both-sides": { az: "Ön və arxa", en: "Front and back", ru: "Перед и спина", tr: "Ön ve arka" },
};

const GROUP_LABEL: Record<string, Phrase> = {
  tshirt: { az: "Futbolka", en: "T-shirt", ru: "Футболка", tr: "Tişört" },
  oversize: { az: "Oversize futbolka", en: "Oversized tee", ru: "Оверсайз", tr: "Oversize tişört" },
  polo: { az: "Polo", en: "Polo", ru: "Поло", tr: "Polo" },
  "polo-long": { az: "Polo", en: "Polo", ru: "Поло", tr: "Polo" },
  sweatshirt: { az: "Sviter", en: "Sweatshirt", ru: "Свитшот", tr: "Sweatshirt" },
  hoodie: { az: "Hudi", en: "Hoodie", ru: "Худи", tr: "Hoodie" },
  yarimzamok: { az: "Yarımzamok", en: "Half-zip", ru: "Полузамок", tr: "Yarım fermuar" },
  balonka: { az: "Balonka", en: "Track jacket", ru: "Олимпийка", tr: "Eşofman üstü" },
  salvar: { az: "Şalvar", en: "Pants", ru: "Брюки", tr: "Pantolon" },
  kepka: { az: "Kepka", en: "Cap", ru: "Кепка", tr: "Şapka" },
};

/** Garment mockup on disk. Only t-shirts have sleeve views. */
function mockupUrl(category: string, colorKey: string, side: Side): string {
  let cat = category;
  if (cat === "polo-long") cat = "polo";
  if (cat === "balonka") cat = "hoodie";
  if (side === "left" || side === "right") return `/images/studio/tshirt/${colorKey}-${side}-shirt.png`;
  const noun = cat === "tshirt" ? "shirt" : cat;
  return `/images/studio/${cat}/${colorKey}-${side}-${noun}.png`;
}

/** Where the design sits on the garment before the customer moves it (percent of the stage). */
function baseBox(side: Side, placementId: string) {
  if (side === "left") return { top: 48, left: 54, width: 25, maxHeight: 30 };
  if (side === "right") return { top: 48, left: 46, width: 25, maxHeight: 30 };
  if (side === "back") return placementId === "back-neck" ? { top: 25, left: 50, width: 20, maxHeight: 16 } : { top: 48, left: 50, width: 40, maxHeight: 44 };
  if (placementId === "front-left") return { top: 36, left: 60, width: 18, maxHeight: 18 };
  return { top: 48, left: 50, width: 38, maxHeight: 44 };
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const ZERO: Transform = { posX: 0, posY: 0, scale: 1, rotation: 0 };

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
  const { formatPrice } = useCurrency();
  const { language } = useLanguage();
  const L = (p: Phrase) => tr(language, p);

  const fileRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const [garment, setGarment] = useState<GarmentOption>(GARMENTS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState("L");
  const [placement, setPlacement] = useState<PlacementOption>(PLACEMENTS[0]);
  const [side, setSide] = useState<Side>("front");
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [transforms, setTransforms] = useState<Record<Side, Transform>>({ front: ZERO, back: ZERO, left: ZERO, right: ZERO });
  const t = transforms[side];
  const setT = (patch: Partial<Transform>) => setTransforms((all) => ({ ...all, [side]: { ...all[side], ...patch } }));

  const hasSleeves = garment.category === "tshirt";
  const sides: Side[] = hasSleeves ? ["front", "back", "left", "right"] : ["front", "back"];
  const placements = useMemo(
    () => PLACEMENTS.filter((p) => hasSleeves || (p.side !== "left" && p.side !== "right")),
    [hasSleeves]
  );
  const groups = useMemo(() => {
    const map = new Map<string, GarmentOption[]>();
    for (const g of GARMENTS) {
      const key = g.category === "polo-long" ? "polo" : g.category;
      map.set(key, [...(map.get(key) || []), g]);
    }
    return Array.from(map.entries());
  }, []);

  const price = garment.basePrice + placement.extraPrice;
  const mockup = mockupUrl(garment.category, color.key, side);

  const chooseGarment = (g: GarmentOption) => {
    setGarment(g);
    if (g.category !== "tshirt") {
      if (side === "left" || side === "right") setSide("front");
      if (placement.side === "left" || placement.side === "right") setPlacement(PLACEMENTS[0]);
    }
  };
  const choosePlacement = (p: PlacementOption) => {
    setPlacement(p);
    setSide(p.side);
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
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImage(reader.result);
        setFileName(file.name);
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
        posX: clamp(Math.round(d.posX + ((e.clientX - d.x) / rect.width) * 100), -35, 35),
        posY: clamp(Math.round(d.posY + ((e.clientY - d.y) / rect.height) * 100), -35, 35),
      });
    } else {
      const delta = (e.clientX - d.x + (e.clientY - d.y)) / (rect.width * 0.45);
      setT({ scale: clamp(Number((d.scale + delta).toFixed(2)), 0.4, 1.8) });
    }
  };
  const endDrag = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    drag.current = null;
  };

  const box = baseBox(side, placement.id);
  const overlay: React.CSSProperties = {
    top: `${box.top + t.posY}%`,
    left: `${box.left + t.posX}%`,
    width: `${box.width}%`,
    maxHeight: `${box.maxHeight}%`,
    transform: `translate(-50%, -50%) scale(${t.scale}) rotate(${t.rotation}deg)`,
    touchAction: "none",
  };

  const addToBag = () => {
    if (!image) {
      setError(L({ az: "Əvvəlcə dizayn faylını yükləyin.", en: "Upload your design file first.", ru: "Сначала загрузите файл дизайна.", tr: "Önce tasarım dosyanızı yükleyin." }));
      document.getElementById("studio-upload")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    addItem({
      id: `pod_${Date.now()}_${garment.id}_${size}`,
      productId: garment.id,
      name: `Öz dizayn: ${garment.name}`,
      price,
      size,
      color: color.name,
      image: mockup,
      type: "custom",
      customDesignPreview: image,
      customData: {
        garmentType: garment.name,
        garmentColor: color.name,
        size,
        placement: placement.label,
        placementKey: placement.id,
        customerNote: note.trim(),
        transform: t,
        uploadedImage: image,
        previewImage: mockup,
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

  const iconBtn = "flex h-9 w-9 items-center justify-center border border-white/15 text-bone transition hover:border-bone";

  return (
    <div className="min-h-screen w-full bg-ink font-grotesk text-bone">
      <div className="mx-auto max-w-[1600px] px-4 pb-32 pt-8 sm:px-6 lg:px-10 lg:pb-24">
        <h1 className="text-[12vw] font-black uppercase leading-[0.88] tracking-[-0.02em] [font-stretch:115%] sm:text-7xl">
          {L({ az: "Öz dizaynını yarat", en: "Create your own", ru: "Создай свой дизайн", tr: "Kendi tasarımını yap" })}
        </h1>
        <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-bone-dim">
          {L({
            az: "Geyimi seç, şəklini və ya loqonu yüklə, yerini göstər. Hazırlamadan əvvəl rəngi və ölçünü sənin üçün yoxlayırıq.",
            en: "Pick a garment, upload your image or logo and place it. We check colour and size for you before production.",
            ru: "Выбери вещь, загрузи изображение или логотип и размести его. Перед производством мы проверим цвет и размер.",
            tr: "Giysiyi seç, görselini veya logonu yükle ve yerleştir. Üretimden önce renk ve boyutu senin için kontrol ederiz.",
          })}
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          {/* preview */}
          <div className="lg:col-span-7">
            <div className="lg:sticky lg:top-24">
              <div className="mb-3 flex flex-wrap gap-2">
                {sides.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSide(s)}
                    className={`border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition ${
                      side === s ? "border-bone bg-bone text-ink" : "border-white/20 hover:border-bone"
                    }`}
                  >
                    {L(SIDE_LABEL[s])}
                  </button>
                ))}
              </div>

              <div
                ref={stageRef}
                onWheel={(e) => image && setT({ scale: clamp(Number((t.scale + (e.deltaY < 0 ? 0.05 : -0.05)).toFixed(2)), 0.4, 1.8) })}
                className="relative aspect-square w-full select-none overflow-hidden bg-tile"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mockup}
                  alt={garment.name}
                  className="pointer-events-none h-full w-full object-contain p-[6%] mix-blend-multiply"
                  onError={(e) => {
                    e.currentTarget.src = `/images/studio/tshirt/${color.key}-front-shirt.png`;
                  }}
                />
                {image ? (
                  <div
                    onPointerDown={startDrag("move")}
                    onPointerMove={moveDrag}
                    onPointerUp={endDrag}
                    style={overlay}
                    className="absolute z-10 flex cursor-grab items-center justify-center active:cursor-grabbing"
                  >
                    <div className="relative flex h-full w-full items-center justify-center border border-dashed border-ink/50 p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image} alt="" draggable={false} className="pointer-events-none max-h-full max-w-full object-contain" />
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
                  </div>
                ) : (
                  <div style={overlay} className="pointer-events-none absolute flex items-center justify-center border border-dashed border-ink/40">
                    <span className="bg-ink px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-bone">
                      {L({ az: "Dizayn yeri", en: "Design area", ru: "Зона дизайна", tr: "Tasarım alanı" })}
                    </span>
                  </div>
                )}
                <span className="absolute bottom-3 left-3 bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-bone">
                  {L(color.label)} · {size}
                </span>
              </div>

              {image && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="mr-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-bone-dim">
                    <Move size={13} /> {L({ az: "Ölçü", en: "Size", ru: "Размер", tr: "Boyut" })}
                  </span>
                  <button type="button" className={iconBtn} onClick={() => setT({ scale: clamp(Number((t.scale - 0.1).toFixed(2)), 0.4, 1.8) })} aria-label="−">
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center text-[12px] font-bold tabular-nums">{Math.round(t.scale * 100)}%</span>
                  <button type="button" className={iconBtn} onClick={() => setT({ scale: clamp(Number((t.scale + 0.1).toFixed(2)), 0.4, 1.8) })} aria-label="+">
                    <Plus size={14} />
                  </button>
                  <span className="mx-1 h-5 w-px bg-white/15" />
                  {[
                    { k: "←", p: { posX: clamp(t.posX - 4, -35, 35) } },
                    { k: "↑", p: { posY: clamp(t.posY - 4, -35, 35) } },
                    { k: "↓", p: { posY: clamp(t.posY + 4, -35, 35) } },
                    { k: "→", p: { posX: clamp(t.posX + 4, -35, 35) } },
                  ].map((b) => (
                    <button key={b.k} type="button" className={`${iconBtn} text-sm`} onClick={() => setT(b.p)} aria-label={b.k}>
                      {b.k}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setT(ZERO)}
                    className="ml-auto flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-bone-dim hover:text-bone"
                  >
                    <RotateCcw size={13} /> {L({ az: "Sıfırla", en: "Reset", ru: "Сбросить", tr: "Sıfırla" })}
                  </button>
                </div>
              )}
              <p className="mt-3 text-[12px] text-bone-faint">
                {L({
                  az: "Şəkli geyimin üzərində sürüşdürə, küncündən dartıb ölçüsünü dəyişə bilərsiniz. Önbaxış təxminidir.",
                  en: "Drag the design on the garment and pull its corner to resize. The preview is approximate.",
                  ru: "Перетаскивайте дизайн и тяните за угол, чтобы изменить размер. Превью приблизительное.",
                  tr: "Tasarımı giysi üzerinde sürükleyin, köşesinden çekerek boyutlandırın. Önizleme yaklaşıktır.",
                })}
              </p>
            </div>
          </div>

          {/* configurator */}
          <div className="lg:col-span-5">
            <Step n={1} title={L({ az: "Geyim", en: "Garment", ru: "Изделие", tr: "Giysi" })} aside={<span className="text-[12px] text-bone-dim">{garment.name}</span>}>
              <div className="space-y-5">
                {groups.map(([cat, list]) => (
                  <div key={cat}>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-bone-faint">{L(GROUP_LABEL[cat] || { az: cat, en: cat, ru: cat, tr: cat })}</p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {list.map((g) => {
                        const on = g.id === garment.id;
                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => chooseGarment(g)}
                            className={`flex items-center justify-between gap-3 border px-3.5 py-3 text-left transition ${
                              on ? "border-bone bg-bone text-ink" : "border-white/15 hover:border-white/40"
                            }`}
                          >
                            <span className="text-[13px] font-semibold leading-snug">{g.name}</span>
                            <span className={`shrink-0 text-[13px] font-bold tabular-nums ${on ? "text-ink" : "text-bone-dim"}`}>{formatPrice(g.basePrice)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Step>

            <Step n={2} title={L({ az: "Rəng və ölçü", en: "Colour & size", ru: "Цвет и размер", tr: "Renk ve beden" })} aside={<span className="text-[12px] text-bone-dim">{L(color.label)}</span>}>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setColor(c)}
                    title={L(c.label)}
                    aria-label={L(c.label)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${c.key === color.key ? "border-bone" : "border-transparent hover:border-white/40"}`}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20" style={{ backgroundColor: c.hex }}>
                      {c.key === color.key && <Check size={13} className={c.key === "white" || c.key === "sand" || c.key === "sky-blue" ? "text-ink" : "text-white"} />}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-6 gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`h-11 border text-[12px] font-bold transition ${s === size ? "border-bone bg-bone text-ink" : "border-white/20 hover:border-bone"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Step>

            <Step n={3} title={L({ az: "Dizayn faylı", en: "Design file", ru: "Файл дизайна", tr: "Tasarım dosyası" })}>
              <div id="studio-upload">
                {image ? (
                  <div className="flex items-center gap-3 border border-white/15 p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt="" className="h-14 w-14 shrink-0 bg-tile object-contain p-1" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold">{fileName}</p>
                      <button type="button" onClick={() => fileRef.current?.click()} className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-bone-dim hover:text-bone">
                        {L({ az: "Dəyiş", en: "Replace", ru: "Заменить", tr: "Değiştir" })}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setFileName(null);
                        setTransforms({ front: ZERO, back: ZERO, left: ZERO, right: ZERO });
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
                    onClick={() => fileRef.current?.click()}
                    className="flex w-full flex-col items-center justify-center gap-2 border border-dashed border-white/25 px-4 py-10 text-center transition hover:border-bone"
                  >
                    <ImagePlus size={22} strokeWidth={1.6} />
                    <span className="text-[13px] font-semibold">{L({ az: "Faylı seç", en: "Choose a file", ru: "Выбрать файл", tr: "Dosya seç" })}</span>
                    <span className="text-[12px] text-bone-faint">PNG, JPG, WEBP, SVG, PDF · max 30 MB</span>
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*,.pdf,.svg,.ai" className="hidden" onChange={onFile} />
                {error && <p className="mt-3 text-[13px] font-semibold text-sale">{error}</p>}
              </div>
            </Step>

            <Step n={4} title={L({ az: "Yeri", en: "Placement", ru: "Расположение", tr: "Yerleşim" })}>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {placements.map((p) => {
                  const on = p.id === placement.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => choosePlacement(p)}
                      className={`flex items-center justify-between gap-3 border px-3.5 py-3 text-left transition ${
                        on ? "border-bone bg-bone text-ink" : "border-white/15 hover:border-white/40"
                      }`}
                    >
                      <span className="text-[13px] font-semibold leading-snug">{L(PLACEMENT_LABEL[p.id] || { az: p.label, en: p.label, ru: p.label, tr: p.label })}</span>
                      {p.extraPrice > 0 && <span className="shrink-0 text-[12px] font-bold">+{formatPrice(p.extraPrice)}</span>}
                    </button>
                  );
                })}
              </div>
            </Step>

            <Step n={5} title={L({ az: "Qeyd", en: "Note", ru: "Комментарий", tr: "Not" })} aside={<span className="text-[12px] text-bone-faint">{L({ az: "istəyə görə", en: "optional", ru: "необязательно", tr: "isteğe bağlı" })}</span>}>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={L({
                  az: "Məs: sinədən 5 sm aşağı, eni təxminən 25 sm",
                  en: "E.g. 5 cm below the collar, about 25 cm wide",
                  ru: "Напр.: на 5 см ниже воротника, ширина около 25 см",
                  tr: "Örn: yakadan 5 cm aşağı, yaklaşık 25 cm genişlik",
                })}
                className="w-full resize-none border border-white/15 bg-transparent p-3.5 text-[14px] text-bone placeholder:text-bone-faint focus:border-bone focus:outline-none"
              />
            </Step>

            {/* summary (desktop) */}
            <div className="hidden border-t border-white/10 pt-7 lg:block">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-bone-faint">
                    {garment.name} · {L(color.label)} · {size}
                  </p>
                  <p className="mt-1 text-3xl font-black tabular-nums">{formatPrice(price)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addToBag}
                className={`mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full text-[12px] font-extrabold uppercase tracking-[0.16em] transition ${
                  added ? "bg-emerald-500 text-ink" : "bg-bone text-ink hover:bg-white"
                }`}
              >
                {added ? <Check size={16} /> : null}
                {added ? L({ az: "Səbətə əlavə olundu", en: "Added to bag", ru: "Добавлено", tr: "Sepete eklendi" }) : L({ az: "Səbətə at", en: "Add to bag", ru: "В корзину", tr: "Sepete ekle" })}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* sticky buy bar (phones and tablets) */}
      <div className="hw-buybar fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-[1600px] items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] text-bone-dim">{garment.name}</p>
            <p className="text-lg font-black tabular-nums">{formatPrice(price)}</p>
          </div>
          <button
            type="button"
            onClick={addToBag}
            className={`h-12 shrink-0 rounded-full px-6 text-[12px] font-extrabold uppercase tracking-[0.14em] ${added ? "bg-emerald-500 text-ink" : "bg-bone text-ink"}`}
          >
            {added ? L({ az: "Əlavə olundu", en: "Added", ru: "Добавлено", tr: "Eklendi" }) : L({ az: "Səbətə at", en: "Add to bag", ru: "В корзину", tr: "Sepete ekle" })}
          </button>
        </div>
      </div>
    </div>
  );
}
