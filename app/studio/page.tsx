"use client";

import React, { useState, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { playAddToCartSound } from "@/lib/soundEffects";
import {
  Upload,
  RotateCcw,
  ShoppingBag,
  Check,
  Trash2,
  CheckCircle2,
  Info,
  ArrowRight,
  Layers,
  FileText,
  Move,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";

import { GARMENTS, PLACEMENTS, type GarmentOption, type PlacementOption } from "@/lib/studio/catalog";

interface ColorOption {
  key: string;
  name: string;
  hex: string;
}

const COLORS: ColorOption[] = [
  { key: "white", name: "Ağ", hex: "#FFFFFF" },
  { key: "black", name: "Qara", hex: "#18181B" },
  { key: "sand", name: "Qum Beji", hex: "#D7CEC7" },
  { key: "sky-blue", name: "Açıq Mavi", hex: "#93C5FD" },
  { key: "darkblue", name: "Tünd Göy", hex: "#1E293B" },
  { key: "green", name: "Zeytun Yaşılı", hex: "#3F4F38" },
  { key: "red", name: "Qırmızı", hex: "#A32C2C" },
];

const SIZES = ["S", "M", "L", "XL", "2XL", "3XL"];

export type StudioSide = "front" | "back" | "left" | "right";

export interface SideDesignState {
  uploadedImage: string | null;
  originalImage?: string | null;
  customText: string;
  textColor: string;
  fontFamily: string;
  scale: number;
  posX: number;
  posY: number;
  rotation: number;
  textScale?: number;
  textPosX?: number;
  textPosY?: number;
  textRotation?: number;
}

// Helper to get garment mockup image path
function getGarmentMockupUrl(garmentCategory: string, colorKey: string, side: StudioSide): string {
  let cat = garmentCategory;
  if (cat === "polo-long") cat = "polo";
  if (cat === "balonka") cat = "hoodie";

  // Use crisp sleeve view mockups available for all colors
  if (side === "left" || side === "right") {
    return `/images/studio/tshirt/${colorKey}-${side}-shirt.png`;
  }

  let noun = cat;
  if (noun === "tshirt") noun = "shirt";
  if (noun === "oversize") noun = "oversize";
  if (noun === "hoodie") noun = "hoodie";
  if (noun === "polo") noun = "polo";
  if (noun === "sweatshirt") noun = "sweatshirt";
  if (noun === "salvar") noun = "salvar";
  if (noun === "kepka") noun = "kepka";
  if (noun === "yarimzamok") noun = "yarimzamok";

  return `/images/studio/${cat}/${colorKey}-${side}-${noun}.png`;
}

export default function SimpleStudioPage() {
  const { addItem, openCart } = useCart();
  const { formatPrice } = useCurrency();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewBoxRef = useRef<HTMLDivElement>(null);

  // Selections
  const [selectedGarment, setSelectedGarment] = useState<GarmentOption>(GARMENTS[0]);
  const [selectedColor, setSelectedColor] = useState<ColorOption>(COLORS[0]);
  const [selectedSize, setSelectedSize] = useState<string>("L");
  const [selectedPlacement, setSelectedPlacement] = useState<PlacementOption>(PLACEMENTS[0]);
  const [activeSide, setActiveSide] = useState<StudioSide>("front");

  // Uploaded Design State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);

  // Interactive transforms per side (drag, scale, position)
  const [transforms, setTransforms] = useState<Record<StudioSide, { posX: number; posY: number; scale: number; rotation: number }>>({
    front: { posX: 0, posY: 0, scale: 1, rotation: 0 },
    back: { posX: 0, posY: 0, scale: 1, rotation: 0 },
    left: { posX: 0, posY: 0, scale: 1, rotation: 0 },
    right: { posX: 0, posY: 0, scale: 1, rotation: 0 },
  });

  const currentTransform = transforms[activeSide];

  const updateTransform = (updates: Partial<{ posX: number; posY: number; scale: number; rotation: number }>) => {
    setTransforms((prev) => ({
      ...prev,
      [activeSide]: {
        ...prev[activeSide],
        ...updates,
      },
    }));
  };

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ clientX: number; clientY: number; startPosX: number; startPosY: number }>({ clientX: 0, clientY: 0, startPosX: 0, startPosY: 0 });

  // Resizing state
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef<{ clientX: number; clientY: number; startScale: number }>({ clientX: 0, clientY: 0, startScale: 1 });

  // Pointer drag handlers
  const handlePointerDownDrag = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startPosX: currentTransform.posX,
      startPosY: currentTransform.posY,
    };
  };

  const handlePointerMoveDrag = (e: React.PointerEvent) => {
    if (!isDragging || !previewBoxRef.current) return;
    const rect = previewBoxRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStartRef.current.clientX) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStartRef.current.clientY) / rect.height) * 100;
    const newX = Math.max(-35, Math.min(35, Math.round(dragStartRef.current.startPosX + deltaX)));
    const newY = Math.max(-35, Math.min(35, Math.round(dragStartRef.current.startPosY + deltaY)));
    updateTransform({ posX: newX, posY: newY });
  };

  const handlePointerUpDrag = (e: React.PointerEvent) => {
    if (isDragging) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {}
      setIsDragging(false);
    }
  };

  // Pointer resize handlers (Corner handle)
  const handlePointerDownResize = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setIsResizing(true);
    resizeStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startScale: currentTransform.scale,
    };
  };

  const handlePointerMoveResize = (e: React.PointerEvent) => {
    if (!isResizing || !previewBoxRef.current) return;
    const rect = previewBoxRef.current.getBoundingClientRect();
    const delta = ((e.clientX - resizeStartRef.current.clientX) + (e.clientY - resizeStartRef.current.clientY)) / (rect.width * 0.45);
    const newScale = Math.max(0.4, Math.min(1.8, Number((resizeStartRef.current.startScale + delta).toFixed(2))));
    updateTransform({ scale: newScale });
  };

  const handlePointerUpResize = (e: React.PointerEvent) => {
    if (isResizing) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {}
      setIsResizing(false);
    }
  };

  // Wheel zoom
  const handleWheelZoom = (e: React.WheelEvent) => {
    if (!uploadedImage) return;
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    const newScale = Math.max(0.4, Math.min(1.8, Number((currentTransform.scale + delta).toFixed(2))));
    updateTransform({ scale: newScale });
  };

  // Customer Note
  const [customerNote, setCustomerNote] = useState<string>("");

  // UI status
  const [isAdding, setIsAdding] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Handle File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Max 30MB
    if (file.size > 30 * 1024 * 1024) {
      setUploadError("Fayl ölçüsü maksimum 30MB ola bilər.");
      return;
    }

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    setUploadedFileName(file.name);
    setUploadedFileSize(`${sizeInMB} MB`);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setUploadedImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPlacement = (placement: PlacementOption) => {
    setSelectedPlacement(placement);
    setActiveSide(placement.side);
  };

  // Price Calculation
  const totalPrice = selectedGarment.basePrice + selectedPlacement.extraPrice;

  // Add to Bag / Order
  const handleAddToCart = async () => {
    if (!uploadedImage) {
      setUploadError("Zəhmət olmasa dizayn şəklinizi yükləyin.");
      if (fileInputRef.current) {
        fileInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsAdding(true);
    try {
      playAddToCartSound();
    } catch (e) {}

    const mockupUrl = getGarmentMockupUrl(selectedGarment.category, selectedColor.key, activeSide);

    const customData = {
      garmentType: selectedGarment.name,
      garmentColor: selectedColor.name,
      size: selectedSize,
      placement: selectedPlacement.label,
      placementKey: selectedPlacement.id,
      customerNote: customerNote.trim(),
      transform: currentTransform,
      uploadedImage: uploadedImage,
      previewImage: mockupUrl,
      price: totalPrice,
    };

    addItem({
      id: `pod_${Date.now()}_${selectedGarment.id}_${selectedSize}`,
      productId: selectedGarment.id,
      name: `Öz dizayn: ${selectedGarment.name}`,
      price: totalPrice,
      size: selectedSize,
      color: selectedColor.name,
      image: mockupUrl,
      type: "custom",
      customDesignPreview: uploadedImage,
      customData: customData,
      stockQuantity: 99,
    });

    setTimeout(() => {
      setIsAdding(false);
      openCart();
    }, 350);
  };

  // Compute CSS placement for realistic overlay
  // Natural chest position (starting well below collar)
  const getOverlayBase = () => {
    // Left Sleeve view
    if (activeSide === "left") {
      return {
        top: 48,
        left: 54,
        width: 25,
        maxHeight: 30,
      };
    }

    // Right Sleeve view
    if (activeSide === "right") {
      return {
        top: 48,
        left: 46,
        width: 25,
        maxHeight: 30,
      };
    }

    // Back view
    if (activeSide === "back") {
      if (selectedPlacement.id === "back-neck") {
        return {
          top: 25,
          left: 50,
          width: 20,
          maxHeight: 16,
        };
      }
      return {
        top: 48,
        left: 50,
        width: 40,
        maxHeight: 44,
      };
    }

    // Front view
    if (selectedPlacement.id === "front-left") {
      return {
        top: 36,
        left: 60,
        width: 18,
        maxHeight: 18,
      };
    }

    // Front Center (Chest - well below collar)
    return {
      top: 48,
      left: 50,
      width: 38,
      maxHeight: 44,
    };
  };

  const getOverlayStyle = (): React.CSSProperties => {
    const base = getOverlayBase();
    const t = currentTransform;
    return {
      top: `${base.top + t.posY}%`,
      left: `${base.left + t.posX}%`,
      width: `${base.width}%`,
      maxHeight: `${base.maxHeight}%`,
      transform: `translate(-50%, -50%) scale(${t.scale}) rotate(${t.rotation}deg)`,
      transformOrigin: "center center",
      touchAction: "none",
    };
  };

  const garmentMockup = getGarmentMockupUrl(selectedGarment.category, selectedColor.key, activeSide);

  return (
    <div className="w-full min-h-screen bg-ink font-grotesk text-bone pt-6 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-6 border-b border-white/12 mb-8">
          <h1 className="text-5xl font-black uppercase leading-[0.9] tracking-[-0.02em] text-bone [font-stretch:115%] sm:text-7xl">
            Öz dizaynını yarat
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-bone-dim">
            Şəklini, loqonu və ya yazını yüklə, geyimdə yerini seç və sifariş ver. Hazırlamadan əvvəl rəngi və ölçünü sənin üçün yoxlayırıq.
          </p>
        </div>

        {/* 2-Column Main Workspace (Stretches full height so left preview remains sticky during scrolling) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT: Garment & Placement Visual Preview (Stabil / Sticky) */}
          <div className="lg:col-span-5 relative">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div
                ref={previewBoxRef}
                onWheel={handleWheelZoom}
                className="relative w-full aspect-square bg-ink-800 rounded-3xl border border-white/12 p-4 sm:p-6 shadow-sm flex items-center justify-center overflow-hidden select-none"
              >
                {/* Garment Base Mockup */}
                <img
                  src={garmentMockup}
                  alt={selectedGarment.name}
                  className="w-full h-full object-contain pointer-events-none select-none transition-opacity duration-300"
                  onError={(e) => {
                    // Fallback to basic t-shirt if specific mockup file is missing
                    e.currentTarget.src = `/images/studio/tshirt/${selectedColor.key}-${activeSide}-shirt.png`;
                  }}
                />

                {/* Uploaded Design Placement Overlay with Direct Interactive Manipulation */}
                {uploadedImage ? (
                  <div
                    onPointerDown={handlePointerDownDrag}
                    onPointerMove={handlePointerMoveDrag}
                    onPointerUp={handlePointerUpDrag}
                    style={getOverlayStyle()}
                    className={`absolute z-10 flex items-center justify-center transition-shadow group ${
                      isDragging ? "cursor-grabbing" : "cursor-grab"
                    }`}
                  >
                    {/* Active Bounding Box with micro-animations */}
                    <div className="relative w-full h-full flex items-center justify-center border-2 border-dashed border-amber-500/80 rounded-xl p-1 bg-amber-500/5 group-hover:border-amber-600 transition-all">
                      <img
                        src={uploadedImage}
                        alt="Müştəri Dizaynı"
                        draggable={false}
                        className="max-w-full max-h-full object-contain drop-shadow-md pointer-events-none select-none"
                      />

                      {/* Four Corner Indicator Dots */}
                      <span className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-ink-800 border-2 border-amber-600 shadow-2xs pointer-events-none" />
                      <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-ink-800 border-2 border-amber-600 shadow-2xs pointer-events-none" />
                      <span className="absolute -bottom-1.5 -left-1.5 w-3 h-3 rounded-full bg-ink-800 border-2 border-amber-600 shadow-2xs pointer-events-none" />
                      
                      {/* Interactive Bottom-Right Resize Handle */}
                      <div
                        onPointerDown={handlePointerDownResize}
                        onPointerMove={handlePointerMoveResize}
                        onPointerUp={handlePointerUpResize}
                        className="absolute -bottom-2.5 -right-2.5 w-6 h-6 rounded-full bg-amber-600 hover:bg-amber-700 text-white shadow-md flex items-center justify-center cursor-nwse-resize active:scale-110 transition z-20"
                        title="Dartaraq ölçünü böyüdün və ya kiçildin"
                      >
                        <Maximize2 size={11} className="rotate-90 pointer-events-none" />
                      </div>

                      {/* Floating Tooltip Pill */}
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-stone-900/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
                        Toxunub sürüşdürün
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    className="absolute pointer-events-none border-2 border-dashed border-white/25 rounded-xl flex items-center justify-center p-2 transition-all duration-300"
                    style={getOverlayStyle()}
                  >
                    <span className="text-[10px] font-bold text-bone-dim bg-ink-800/90 backdrop-blur-xs px-2 py-1 rounded-md shadow-2xs">
                      Dizayn Sahəsi ({selectedPlacement.label.split(" ")[0]})
                    </span>
                  </div>
                )}

                {/* Side Switcher (Ön / Arxa / Sol qol / Sağ qol) */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-stone-900/85 backdrop-blur-md p-1 rounded-xl shadow-md">
                  <button
                    type="button"
                    onClick={() => setActiveSide("front")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeSide === "front"
                        ? "bg-ink-800 text-bone shadow-xs"
                        : "text-bone-faint hover:text-white"
                    }`}
                  >
                    Ön
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSide("back")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeSide === "back"
                        ? "bg-ink-800 text-bone shadow-xs"
                        : "text-bone-faint hover:text-white"
                    }`}
                  >
                    Arxa
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSide("left")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeSide === "left"
                        ? "bg-ink-800 text-bone shadow-xs"
                        : "text-bone-faint hover:text-white"
                    }`}
                  >
                    Sol qol
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSide("right")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeSide === "right"
                        ? "bg-ink-800 text-bone shadow-xs"
                        : "text-bone-faint hover:text-white"
                    }`}
                  >
                    Sağ qol
                  </button>
                </div>

                {/* Color & Size badge */}
                <div className="absolute bottom-4 right-4 z-10 px-3 py-1 rounded-full bg-ink-800/90 backdrop-blur-md border border-white/12 text-[11px] font-bold text-bone shadow-2xs">
                  {selectedColor.name} · {selectedSize}
                </div>
              </div>

              {/* Interactive Precision Control Bar (Scale, Nudge, Center Reset) */}
              {uploadedImage && (
                <div className="bg-ink-800 rounded-3xl p-4 border border-white/12 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-bold text-xs text-bone flex items-center gap-1.5">
                      <Move size={14} className="text-amber-300" />
                      <span>Dizaynın Ölçü və Mövqeyi</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => updateTransform({ posX: 0, posY: 0, scale: 1, rotation: 0 })}
                      className="text-[11px] font-bold text-bone-dim hover:text-bone flex items-center gap-1 hover:underline transition cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      <span>Mərkəzə Qaytar</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Scale Slider & +/- */}
                    <div className="bg-ink-700 p-2.5 rounded-2xl border border-white/12 flex items-center gap-2">
                      <span className="text-[11px] font-bold text-bone-dim shrink-0">Ölçü:</span>
                      <button
                        type="button"
                        onClick={() => updateTransform({ scale: Math.max(0.4, Number((currentTransform.scale - 0.1).toFixed(2))) })}
                        className="w-7 h-7 rounded-lg bg-ink-800 border border-white/12 text-bone font-bold hover:bg-ink-600 transition active:scale-95 flex items-center justify-center cursor-pointer shadow-2xs"
                        title="Kiçilt"
                      >
                        -
                      </button>
                      <input
                        type="range"
                        min="0.4"
                        max="1.8"
                        step="0.05"
                        value={currentTransform.scale}
                        onChange={(e) => updateTransform({ scale: parseFloat(e.target.value) })}
                        className="flex-1 accent-stone-900 cursor-pointer h-1.5"
                      />
                      <button
                        type="button"
                        onClick={() => updateTransform({ scale: Math.min(1.8, Number((currentTransform.scale + 0.1).toFixed(2))) })}
                        className="w-7 h-7 rounded-lg bg-ink-800 border border-white/12 text-bone font-bold hover:bg-ink-600 transition active:scale-95 flex items-center justify-center cursor-pointer shadow-2xs"
                        title="Böyüt"
                      >
                        +
                      </button>
                      <span className="text-[11px] font-mono font-bold text-bone w-10 text-right">
                        {Math.round(currentTransform.scale * 100)}%
                      </span>
                    </div>

                    {/* Position Nudge Arrows */}
                    <div className="bg-ink-700 p-2.5 rounded-2xl border border-white/12 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-bone-dim shrink-0">Sürüşdür:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateTransform({ posX: Math.max(-35, currentTransform.posX - 4) })}
                          className="w-7 h-7 rounded-lg bg-ink-800 border border-white/12 text-bone font-bold hover:bg-ink-600 transition active:scale-95 flex items-center justify-center cursor-pointer shadow-2xs text-xs"
                          title="Sola"
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          onClick={() => updateTransform({ posY: Math.max(-35, currentTransform.posY - 4) })}
                          className="w-7 h-7 rounded-lg bg-ink-800 border border-white/12 text-bone font-bold hover:bg-ink-600 transition active:scale-95 flex items-center justify-center cursor-pointer shadow-2xs text-xs"
                          title="Yuxarı"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => updateTransform({ posY: Math.min(35, currentTransform.posY + 4) })}
                          className="w-7 h-7 rounded-lg bg-ink-800 border border-white/12 text-bone font-bold hover:bg-ink-600 transition active:scale-95 flex items-center justify-center cursor-pointer shadow-2xs text-xs"
                          title="Aşağı"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => updateTransform({ posX: Math.min(35, currentTransform.posX + 4) })}
                          className="w-7 h-7 rounded-lg bg-ink-800 border border-white/12 text-bone font-bold hover:bg-ink-600 transition active:scale-95 flex items-center justify-center cursor-pointer shadow-2xs text-xs"
                          title="Sağa"
                        >
                          →
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-bone-dim leading-relaxed text-center">
                    💡 <strong>İpucu:</strong> Şəkli həmçinin birbaşa köynəyin üzərində tutub istədiyiniz yerə çəkə və küncündəki düyməni dartaraq ölçüsünü dəyişə bilərsiniz.
                  </p>
                </div>
              )}

              {/* Quick Assurance Notice */}
              <div className="p-3.5 rounded-2xl bg-ink-700 border border-white/12 text-xs text-bone-dim flex items-start gap-2.5">
                <Info size={16} className="text-bone-dim shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed text-bone-dim">
                  Göstərilən şəkil vizual önbaxış üçündür. Hazırlıq zamanı dəqiqlik, rəng balansı və ölçülər mütəxəssislərimiz tərəfindən tənzimlənir.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Simplified Studio Configurator */}
          <div className="lg:col-span-7 space-y-7">
            
            {/* STEP 1: Garment Selection */}
            <div data-lenis-prevent className="bg-ink-800 rounded-3xl p-5 sm:p-6 border border-white/12 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-bone text-ink text-[11px] font-bold flex items-center justify-center">1</span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-bone">Geyim Növü və Rəngi</h3>
                </div>
                <span className="text-xs font-mono font-bold text-bone">{formatPrice(selectedGarment.basePrice)}</span>
              </div>

              {/* Garment Type Dropdown/Buttons */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-bone-dim uppercase">Geyim Modeli ({GARMENTS.length} Çeşid)</label>
                  <span className="text-bone-dim text-[11px]">Seçilmiş: <strong className="text-bone">{selectedGarment.name}</strong></span>
                </div>
                <div
                  data-lenis-prevent
                  onWheel={(e) => e.stopPropagation()}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 sm:max-h-96 overflow-y-auto pr-1 scrollbar-thin overscroll-contain"
                  style={{ overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }}
                >
                  {GARMENTS.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setSelectedGarment(g)}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        selectedGarment.id === g.id
                          ? "bg-bone text-ink border-bone shadow-sm ring-2 ring-bone/25"
                          : "bg-ink-700 text-bone border-white/12 hover:border-white/40 hover:bg-ink-600"
                      }`}
                    >
                      <div className="text-xs font-bold leading-snug">{g.name}</div>
                      <div className="text-[10px] opacity-70 mt-1 line-clamp-1">{g.description}</div>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-current/10">
                        <span className="text-[9.5px] opacity-75 uppercase font-mono">{g.category}</span>
                        <span className="text-xs font-black">{formatPrice(g.basePrice)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-bone-dim uppercase">Rəng: <strong>{selectedColor.name}</strong></span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  {COLORS.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`w-9 h-9 rounded-xl border-2 transition-all flex items-center justify-center cursor-pointer ${
                        selectedColor.key === c.key
                          ? "border-bone ring-2 ring-bone/25 scale-105"
                          : "border-white/12 opacity-80 hover:opacity-100 hover:border-white/40"
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {selectedColor.key === c.key && (
                        <Check size={14} className={c.hex === "#FFFFFF" || c.hex === "#D7CEC7" ? "text-ink" : "text-white"} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-bone-dim uppercase">Ölçü</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`w-11 h-9 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        selectedSize === s
                          ? "bg-bone text-ink border-bone shadow-xs"
                          : "bg-ink-700 text-bone-dim border-white/12 hover:border-white/40"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* STEP 2: File Upload (Müştərinin Dizaynı) */}
            <div className="bg-ink-800 rounded-3xl p-5 sm:p-6 border border-white/12 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-bone text-ink text-[11px] font-bold flex items-center justify-center">2</span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-bone">Dizayn Şəklini Yükləyin *</h3>
                </div>
                <span className="text-[11px] text-bone-dim font-medium">Bütün formatlar dəstəklənir</span>
              </div>

              {uploadedImage ? (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-400/30 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-14 rounded-xl bg-ink-800 border border-emerald-400/30 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                      <img src={uploadedImage} alt="Yüklənmiş Dizayn" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-bone truncate">{uploadedFileName}</div>
                      <div className="text-[11px] text-emerald-300 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 size={13} />
                        <span>Fayl uğurla yükləndi ({uploadedFileSize})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-ink-800 hover:bg-ink-600 border border-white/12 text-bone text-xs font-semibold transition cursor-pointer"
                    >
                      Dəyiş
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedImage(null);
                        setUploadedFileName(null);
                        setUploadedFileSize(null);
                      }}
                      className="p-2 rounded-xl text-bone-faint hover:text-rose-600 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 hover:border-white/50 rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 bg-ink-700 hover:bg-ink-600 flex flex-col items-center justify-center space-y-3 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-ink-800 border border-white/12 flex items-center justify-center text-bone-dim shadow-2xs group-hover:scale-105 transition">
                    <Upload size={24} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-bone group-hover:text-bone">Dizayn faylını seçmək üçün bura klikləyin</span>
                    <p className="text-[11px] text-bone-dim mt-1">PNG, JPG, WEBP, PDF, SVG, AI formatları (Maksimum 30MB)</p>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.svg,.ai"
                onChange={handleFileChange}
                className="hidden"
              />

              {uploadError && (
                <div className="text-[11px] text-rose-400 font-medium flex items-center gap-1.5 bg-rose-50 border border-rose-400/30 rounded-xl px-3 py-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>

            {/* STEP 3: Placement Selection (Dizaynı hansı hissəyə vurmaq istəyirsiniz?) */}
            <div className="bg-ink-800 rounded-3xl p-5 sm:p-6 border border-white/12 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-bone text-ink text-[11px] font-bold flex items-center justify-center">3</span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-bone">Dizaynın Yeri</h3>
                </div>
                <span className="text-[11px] text-bone-dim font-medium">Hissəni seçin</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PLACEMENTS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPlacement(p)}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      selectedPlacement.id === p.id
                        ? "bg-bone text-ink border-bone shadow-sm"
                        : "bg-ink-700 text-bone border-white/12 hover:border-white/40 hover:bg-ink-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{p.label}</span>
                      {selectedPlacement.id === p.id && <Check size={14} className="text-white" />}
                    </div>
                    <span className="text-[10px] opacity-75 mt-1">{p.sublabel}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* STEP 4: Customer Note & Special Instructions */}
            <div className="bg-ink-800 rounded-3xl p-5 sm:p-6 border border-white/12 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-bone text-ink text-[11px] font-bold flex items-center justify-center">4</span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-bone">Əlavə Qeyd və İstəkləriniz</h3>
                </div>
                <span className="text-[10px] text-bone-faint font-semibold uppercase">İstəyə bağlı</span>
              </div>

              <p className="text-[11px] text-bone-dim">
                Dizaynın dəqiq ölçüsü, yerləşməsi və ya xüsusi istəyiniz varsa qeyd edin. Ustalarımız hazırlıqdan öncə bunu mütləq nəzərə alacaq.
              </p>

              <textarea
                rows={3}
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="Məs: Dizayn sinənin bir qədər yuxarısında olsun, ölçüsü təxminən 25 sm olsun, arxada əlavə ad/nömrə yazılsın..."
                className="w-full rounded-2xl p-3.5 text-xs text-bone bg-ink-700 border border-white/12 placeholder-bone-faint focus:outline-none focus:border-bone focus:bg-ink-700 focus:ring-1 focus:ring-bone transition"
              />
            </div>

            {/* SUMMARY & ORDER BUTTON */}
            <div className="bg-ink-850 text-bone border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between text-xs text-bone-faint pb-3 border-b border-white/10">
                <span>Geyim & Dizayn Xülasəsi:</span>
                <span className="font-semibold text-white">
                  {selectedGarment.name} · {selectedColor.name} · {selectedSize}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-bone-faint block">Yekun Qiymət:</span>
                  <span className="text-3xl font-black text-white tracking-tight">
                    {formatPrice(totalPrice)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="px-6 py-3.5 rounded-full bg-bone hover:bg-white text-ink font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  <ShoppingBag size={16} />
                  <span>{isAdding ? "Əlavə edilir..." : "Səbətə Əlavə Et"}</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
