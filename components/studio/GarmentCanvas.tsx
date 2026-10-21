"use client";

import React, { useRef, useState } from "react";
import { Move, RotateCw, Trash2, Check, Sparkles, ZoomIn, ZoomOut, Maximize2, Sun, Moon } from "lucide-react";

export type StudioSurface = "front" | "back" | "leftSleeve" | "rightSleeve";

export interface SurfacePrintArea {
  left: number;   // 0 to 1 ratio
  top: number;    // 0 to 1 ratio
  width: number;  // 0 to 1 ratio
  height: number; // 0 to 1 ratio
}

export const PRINT_AREAS: Record<string, Partial<Record<StudioSurface, SurfacePrintArea>>> = {
  tshirt: {
    front: { left: 0.28, top: 0.31, width: 0.44, height: 0.45 },
    back: { left: 0.27, top: 0.28, width: 0.46, height: 0.46 },
    leftSleeve: { left: 0.42, top: 0.38, width: 0.27, height: 0.24 },
    rightSleeve: { left: 0.30, top: 0.38, width: 0.27, height: 0.24 },
  },
  oversize: {
    front: { left: 0.28, top: 0.32, width: 0.44, height: 0.46 },
    back: { left: 0.27, top: 0.28, width: 0.46, height: 0.46 },
    leftSleeve: { left: 0.42, top: 0.38, width: 0.27, height: 0.24 },
    rightSleeve: { left: 0.30, top: 0.38, width: 0.27, height: 0.24 },
  },
  hoodie: {
    front: { left: 0.29, top: 0.40, width: 0.42, height: 0.20 },
    back: { left: 0.29, top: 0.36, width: 0.42, height: 0.34 },
  },
  yarimzamok: {
    front: { left: 0.28, top: 0.42, width: 0.44, height: 0.34 },
    back: { left: 0.28, top: 0.26, width: 0.44, height: 0.42 },
  },
  polo: {
    front: { left: 0.33, top: 0.35, width: 0.34, height: 0.42 },
    back: { left: 0.30, top: 0.28, width: 0.40, height: 0.45 },
  },
  "polo-long": {
    front: { left: 0.33, top: 0.35, width: 0.34, height: 0.42 },
    back: { left: 0.30, top: 0.28, width: 0.40, height: 0.45 },
  },
  sweatshirt: {
    front: { left: 0.28, top: 0.32, width: 0.44, height: 0.40 },
    back: { left: 0.27, top: 0.28, width: 0.44, height: 0.39 },
  },
  salvar: {
    front: { left: 0.28, top: 0.18, width: 0.44, height: 0.48 },
    back: { left: 0.28, top: 0.18, width: 0.44, height: 0.48 },
  },
  kepka: {
    front: { left: 0.28, top: 0.22, width: 0.44, height: 0.32 },
    back: { left: 0.28, top: 0.22, width: 0.44, height: 0.28 },
  },
};

export function getStudioGarmentCategory(garmentId: string): string {
  const gid = garmentId.toLowerCase();
  if (gid.includes("oversize")) return "oversize";
  if (gid.includes("yarimzamok") || gid.includes("halfzip")) return "yarimzamok";
  if (gid.includes("polo-long") || gid.includes("uzunqol")) return "polo-long";
  if (gid.includes("polo")) return "polo";
  if (gid.includes("hoodie") || gid.includes("hody") || gid.includes("balonka")) return "hoodie";
  if (gid.includes("sviter") || gid.includes("sweatshirt")) return "sweatshirt";
  if (gid.includes("salvar") || gid.includes("pants")) return "salvar";
  if (gid.includes("kepka") || gid.includes("cap")) return "kepka";
  return "tshirt";
}

export function getStudioGarmentImage(
  garmentId: string,
  colorKey: string,
  side: StudioSurface
): string {
  const type = getStudioGarmentCategory(garmentId);

  let actualSide = side;
  const isTshirtOrOversize = type === "tshirt" || type === "oversize";
  if (!isTshirtOrOversize && (side === "leftSleeve" || side === "rightSleeve")) {
    actualSide = "front";
  }

  let sideSuffix = "front";
  if (actualSide === "back") sideSuffix = "back";
  else if (actualSide === "leftSleeve") sideSuffix = "left";
  else if (actualSide === "rightSleeve") sideSuffix = "right";

  let noun = type;
  if (type === "tshirt") noun = "shirt";

  let color = (colorKey || "white").toLowerCase();
  if (color === "sand" || color.includes("bej") || color.includes("qum")) color = "sand";
  else if (color === "sky-blue" || color.includes("mavi")) color = "sky-blue";
  else if (color === "darkblue" || color.includes("tünd")) color = "darkblue";
  else if (color === "green" || color.includes("yaşıl") || color.includes("zeytun")) color = "green";
  else if (color === "red" || color.includes("qırmızı")) color = "red";
  else if (color === "black" || color.includes("qara")) color = "black";
  else color = "white";

  return `/images/studio/${type}/${color}-${sideSuffix}-${noun}.png`;
}

interface GarmentCanvasProps {
  garmentId: string;
  side: StudioSurface;
  colorKey: string;
  colorHex: string;
  uploadedImage: string | null;
  customText: string;
  textColor: string;
  fontFamily: string;
  fontSize?: number;
  scale?: number;
  posX: number;
  posY: number;
  rotation?: number;
  textScale?: number;
  textPosX?: number;
  textPosY?: number;
  textRotation?: number;
  onChangeTransform: (newTransform: {
    scale?: number;
    posX?: number;
    posY?: number;
    rotation?: number;
    textScale?: number;
    textPosX?: number;
    textPosY?: number;
    textRotation?: number;
  }) => void;
  onClearImage?: () => void;
  onClearText?: () => void;
  onRequestUpload?: () => void;
}

export function GarmentCanvas({
  garmentId,
  side,
  colorKey,
  colorHex,
  uploadedImage,
  customText,
  textColor,
  fontFamily,
  fontSize = 22,
  scale = 1.0,
  posX,
  posY,
  rotation = 0,
  textScale = 1.0,
  textPosX = 0,
  textPosY = 75,
  textRotation = 0,
  onChangeTransform,
  onClearImage,
  onClearText,
  onRequestUpload,
}: GarmentCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [selectedItem, setSelectedItem] = useState<"image" | "text" | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [dragTarget, setDragTarget] = useState<"image" | "text" | null>(null);
  const [backdropMode, setBackdropMode] = useState<"auto" | "light" | "dark">("auto");
  const isDarkGarment = colorKey === "black" || colorKey === "darkblue" || colorKey === "green";
  const isLightStage = backdropMode === "light" || (backdropMode === "auto" && isDarkGarment);
  
  const [dragStart, setDragStart] = useState<{
    x: number;
    y: number;
    initialPosX: number;
    initialPosY: number;
    target: "image" | "text";
  }>({
    x: 0,
    y: 0,
    initialPosX: 0,
    initialPosY: 0,
    target: "image",
  });

  const [resizeStart, setResizeStart] = useState<{
    y: number;
    initialScale: number;
    target: "image" | "text";
  }>({ y: 0, initialScale: 1, target: "image" });

  // Resolve garment image
  const garmentImgSrc = getStudioGarmentImage(garmentId, colorKey, side);

  // Resolve print area
  const categoryKey = getStudioGarmentCategory(garmentId);
  const areas = PRINT_AREAS[categoryKey] || PRINT_AREAS.tshirt;
  const currentArea = areas[side] || areas.front || { left: 0.28, top: 0.31, width: 0.44, height: 0.45 };

  // Dragging logic for image or text
  const handleStartDrag = (e: React.MouseEvent | React.TouchEvent, target: "image" | "text") => {
    e.stopPropagation();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setIsDragging(true);
    setSelectedItem(target);
    setDragTarget(target);
    setDragStart({
      x: clientX,
      y: clientY,
      initialPosX: target === "image" ? posX : textPosX,
      initialPosY: target === "image" ? posY : textPosY,
      target,
    });
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isDragging && dragTarget) {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const dx = clientX - dragStart.x;
      const dy = clientY - dragStart.y;
      
      const nextX = Math.max(-130, Math.min(130, dragStart.initialPosX + dx));
      const nextY = Math.max(-150, Math.min(150, dragStart.initialPosY + dy));
      if (dragTarget === "image") {
        onChangeTransform({ posX: Math.round(nextX), posY: Math.round(nextY) });
      } else {
        onChangeTransform({ textPosX: Math.round(nextX), textPosY: Math.round(nextY) });
      }
    } else if (isTransforming) {
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const dy = resizeStart.y - clientY;
      if (resizeStart.target === "image") {
        const newScale = Math.max(0.3, Math.min(2.4, resizeStart.initialScale + dy * 0.008));
        onChangeTransform({ scale: parseFloat(newScale.toFixed(2)) });
      } else {
        const newScale = Math.max(0.4, Math.min(2.5, resizeStart.initialScale + dy * 0.008));
        onChangeTransform({ textScale: parseFloat(newScale.toFixed(2)) });
      }
    }
  };

  const handleStopInteraction = () => {
    setIsDragging(false);
    setIsTransforming(false);
    setDragTarget(null);
  };

  const handleStartResize = (e: React.MouseEvent | React.TouchEvent, target: "image" | "text") => {
    e.stopPropagation();
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setIsTransforming(true);
    setSelectedItem(target);
    setResizeStart({
      y: clientY,
      initialScale: target === "image" ? scale : textScale,
      target,
    });
  };

  const hasImage = Boolean(uploadedImage);
  const hasText = Boolean(customText.trim());
  const hasContent = hasImage || hasText;

  return (
    <div
      ref={containerRef}
      onClick={() => setSelectedItem(null)}
      onMouseMove={handlePointerMove}
      onTouchMove={handlePointerMove}
      onMouseUp={handleStopInteraction}
      onTouchEnd={handleStopInteraction}
      className={`relative w-full aspect-square max-w-[500px] mx-auto rounded-3xl transition-all duration-300 shadow-2xl p-4 sm:p-6 flex items-center justify-center overflow-hidden select-none ${
        isLightStage
          ? "bg-gradient-to-b from-[#F3F0EB] via-[#E8E5DC] to-[#DDD9CF] border border-stone-300/90"
          : "bg-neutral-900 border border-neutral-800"
      }`}
    >
      {/* Studio Stage Lighting & Ambient Floor Glow */}
      {isLightStage ? (
        <>
          <div className="absolute inset-0 bg-radial from-white/80 via-transparent to-stone-400/25 pointer-events-none" />
          <div className="absolute bottom-5 w-3/4 h-12 bg-stone-900/20 blur-2xl rounded-full pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-radial from-neutral-800/60 via-neutral-900/90 to-neutral-950 pointer-events-none" />
          <div className="absolute bottom-5 w-3/4 h-10 bg-black/80 blur-2xl rounded-full pointer-events-none" />
        </>
      )}

      {/* Studio Lighting Ambient Toggle Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setBackdropMode(isLightStage ? "dark" : "light");
        }}
        className={`absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md transition-all shadow-md active:scale-95 ${
          isLightStage
            ? "bg-white/90 hover:bg-white text-stone-800 border border-stone-300"
            : "bg-neutral-900/85 hover:bg-neutral-800 text-neutral-300 border border-neutral-700"
        }`}
        title="Studiya fonunun işıqlanmasını dəyiş (Açıq / Qaranlıq)"
      >
        {isLightStage ? <Sun size={12} className="text-amber-500" /> : <Moon size={12} className="text-sky-300" />}
        <span>{isLightStage ? "Açıq Studiya" : "Qaranlıq Studiya"}</span>
      </button>

      {/* Realistic Photorealistic Garment Image */}
      <img
        key={garmentImgSrc}
        src={garmentImgSrc}
        alt={`Mockup ${side}`}
        onError={(e) => {
          const target = e.currentTarget;
          if (!target.src.includes("white-front-shirt.png")) {
            target.src = "/images/studio/tshirt/white-front-shirt.png";
          }
        }}
        className={`absolute inset-0 w-full h-full object-contain pointer-events-none select-none transition-all duration-300 ${
          isLightStage
            ? "drop-shadow-[0_18px_32px_rgba(0,0,0,0.35)]"
            : "drop-shadow-[0_16px_30px_rgba(0,0,0,0.85)]"
        }`}
        loading="eager"
      />

      {/* Print Area: Clean dashed boundary rectangle */}
      <div
        ref={printAreaRef}
        style={{
          left: `${currentArea.left * 100}%`,
          top: `${currentArea.top * 100}%`,
          width: `${currentArea.width * 100}%`,
          height: `${currentArea.height * 100}%`,
        }}
        className={`absolute border-2 border-dashed rounded-xl pointer-events-none flex items-center justify-center transition-all duration-200 ${
          isLightStage ? "border-sky-500/90" : "border-sky-400/80"
        }`}
      >
        {/* Printable Area Prompt (if completely empty) */}
        {!hasContent && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onRequestUpload?.();
            }}
            className="pointer-events-auto cursor-pointer p-3 text-center flex flex-col items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-xs border ${
              isLightStage
                ? "bg-sky-500 text-white border-sky-400"
                : "bg-sky-500/20 text-sky-300 border-sky-400/30"
            }`}>
              +
            </div>
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md shadow-2xs backdrop-blur-xs ${
              isLightStage
                ? "text-stone-800 bg-white/95 border border-stone-200"
                : "text-sky-200 bg-black/60"
            }`}>
              Çap Sahəsi (Dizayn əlavə et)
            </span>
          </div>
        )}
      </div>

      {/* Interactive Separate Layers Container (Image + Text are independent!) */}
      {hasContent && (
        <div
          style={{
            left: `${currentArea.left * 100}%`,
            top: `${currentArea.top * 100}%`,
            width: `${currentArea.width * 100}%`,
            height: `${currentArea.height * 100}%`,
          }}
          className="absolute pointer-events-none flex items-center justify-center overflow-visible"
        >
          {/* ======================================================== */}
          {/* LAYER 1: UPLOADED ARTWORK / LOGO (Independently Movable) */}
          {/* ======================================================== */}
          {hasImage && uploadedImage && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSelectedItem("image");
              }}
              onMouseDown={(e) => handleStartDrag(e, "image")}
              onTouchStart={(e) => handleStartDrag(e, "image")}
              style={{
                transform: `translate(${posX}px, ${posY}px) rotate(${rotation}deg) scale(${scale})`,
                cursor: isDragging && dragTarget === "image" ? "grabbing" : "grab",
                zIndex: selectedItem === "image" ? 25 : 10,
              }}
              className={`pointer-events-auto absolute transition-shadow duration-150 ${
                selectedItem === "image"
                  ? "ring-2 ring-sky-400 ring-offset-2 ring-offset-neutral-900 rounded-lg shadow-lg"
                  : "hover:ring-1 hover:ring-sky-400/60 rounded-lg"
              }`}
            >
              <img
                src={uploadedImage}
                alt="Custom Print Artwork"
                className="max-w-[200px] max-h-[200px] object-contain drop-shadow-md select-none pointer-events-none"
                draggable={false}
              />

              {/* Selection Transform Controls for Image */}
              {selectedItem === "image" && (
                <>
                  {/* 4 Corner Resize Handles */}
                  <div
                    onMouseDown={(e) => handleStartResize(e, "image")}
                    onTouchStart={(e) => handleStartResize(e, "image")}
                    className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-white border-2 border-sky-500 shadow-md cursor-nwse-resize z-20"
                  />
                  <div
                    onMouseDown={(e) => handleStartResize(e, "image")}
                    onTouchStart={(e) => handleStartResize(e, "image")}
                    className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-white border-2 border-sky-500 shadow-md cursor-nesw-resize z-20"
                  />
                  <div
                    onMouseDown={(e) => handleStartResize(e, "image")}
                    onTouchStart={(e) => handleStartResize(e, "image")}
                    className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-white border-2 border-sky-500 shadow-md cursor-nesw-resize z-20"
                  />
                  <div
                    onMouseDown={(e) => handleStartResize(e, "image")}
                    onTouchStart={(e) => handleStartResize(e, "image")}
                    className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-white border-2 border-sky-500 shadow-md cursor-nwse-resize z-20"
                  />

                  {/* Quick Floating Toolbar for Image */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-neutral-900/95 backdrop-blur-md px-2 py-1 rounded-full shadow-xl border border-neutral-700 z-30 text-white whitespace-nowrap">
                    <span className="text-[9px] font-bold text-sky-400 px-1 uppercase tracking-wider">Şəkil</span>
                    <button
                      type="button"
                      title="Böyüt"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChangeTransform({ scale: Math.min(2.4, scale + 0.1) });
                      }}
                      className="p-1 rounded-full hover:bg-neutral-800 text-neutral-300"
                    >
                      <ZoomIn size={12} />
                    </button>
                    <button
                      type="button"
                      title="Kiçilt"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChangeTransform({ scale: Math.max(0.3, scale - 0.1) });
                      }}
                      className="p-1 rounded-full hover:bg-neutral-800 text-neutral-300"
                    >
                      <ZoomOut size={12} />
                    </button>
                    <button
                      type="button"
                      title="Döndər"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChangeTransform({ rotation: (rotation + 45) % 360 });
                      }}
                      className="p-1 rounded-full hover:bg-neutral-800 text-neutral-300"
                    >
                      <RotateCw size={12} />
                    </button>
                    <button
                      type="button"
                      title="Mərkəzə qoy"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChangeTransform({ posX: 0, posY: 0 });
                      }}
                      className="p-1 rounded-full hover:bg-neutral-800 text-neutral-300 text-[10px] font-bold px-1"
                    >
                      M
                    </button>
                    {onClearImage && (
                      <button
                        type="button"
                        title="Şəkli sil"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClearImage();
                          setSelectedItem(null);
                        }}
                        className="p-1 rounded-full hover:bg-red-950 text-red-400"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* LAYER 2: CUSTOM TYPOGRAPHY TEXT (Independently Movable)  */}
          {/* ======================================================== */}
          {hasText && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSelectedItem("text");
              }}
              onMouseDown={(e) => handleStartDrag(e, "text")}
              onTouchStart={(e) => handleStartDrag(e, "text")}
              style={{
                transform: `translate(${textPosX}px, ${textPosY}px) rotate(${textRotation}deg) scale(${textScale})`,
                cursor: isDragging && dragTarget === "text" ? "grabbing" : "grab",
                zIndex: selectedItem === "text" ? 25 : 12,
              }}
              className={`pointer-events-auto absolute transition-shadow duration-150 px-2.5 py-1 ${
                selectedItem === "text"
                  ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-neutral-900 rounded-lg shadow-lg"
                  : "hover:ring-1 hover:ring-amber-400/60 rounded-lg"
              }`}
            >
              <div
                style={{
                  color: textColor,
                  fontFamily: fontFamily,
                  fontSize: `${fontSize}px`,
                  lineHeight: 1.15,
                  textShadow:
                    textColor.toLowerCase() === "#ffffff"
                      ? "0 1px 3px rgba(0,0,0,0.7), 0 0 8px rgba(0,0,0,0.4)"
                      : "0 1px 2px rgba(255,255,255,0.4)",
                }}
                className="font-bold text-center tracking-wide select-none whitespace-nowrap uppercase"
              >
                {customText}
              </div>

              {/* Selection Transform Controls for Text */}
              {selectedItem === "text" && (
                <>
                  {/* 4 Corner Resize Handles */}
                  <div
                    onMouseDown={(e) => handleStartResize(e, "text")}
                    onTouchStart={(e) => handleStartResize(e, "text")}
                    className="absolute -top-2 -left-2 w-3.5 h-3.5 rounded-full bg-white border-2 border-amber-500 shadow-md cursor-nwse-resize z-20"
                  />
                  <div
                    onMouseDown={(e) => handleStartResize(e, "text")}
                    onTouchStart={(e) => handleStartResize(e, "text")}
                    className="absolute -top-2 -right-2 w-3.5 h-3.5 rounded-full bg-white border-2 border-amber-500 shadow-md cursor-nesw-resize z-20"
                  />
                  <div
                    onMouseDown={(e) => handleStartResize(e, "text")}
                    onTouchStart={(e) => handleStartResize(e, "text")}
                    className="absolute -bottom-2 -left-2 w-3.5 h-3.5 rounded-full bg-white border-2 border-amber-500 shadow-md cursor-nesw-resize z-20"
                  />
                  <div
                    onMouseDown={(e) => handleStartResize(e, "text")}
                    onTouchStart={(e) => handleStartResize(e, "text")}
                    className="absolute -bottom-2 -right-2 w-3.5 h-3.5 rounded-full bg-white border-2 border-amber-500 shadow-md cursor-nwse-resize z-20"
                  />

                  {/* Quick Floating Toolbar for Text */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-neutral-900/95 backdrop-blur-md px-2 py-1 rounded-full shadow-xl border border-neutral-700 z-30 text-white whitespace-nowrap">
                    <span className="text-[9px] font-bold text-amber-400 px-1 uppercase tracking-wider">Mətn</span>
                    <button
                      type="button"
                      title="Yazını böyüt"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChangeTransform({ textScale: Math.min(2.5, textScale + 0.1) });
                      }}
                      className="p-1 rounded-full hover:bg-neutral-800 text-neutral-300"
                    >
                      <ZoomIn size={12} />
                    </button>
                    <button
                      type="button"
                      title="Yazını kiçilt"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChangeTransform({ textScale: Math.max(0.4, textScale - 0.1) });
                      }}
                      className="p-1 rounded-full hover:bg-neutral-800 text-neutral-300"
                    >
                      <ZoomOut size={12} />
                    </button>
                    <button
                      type="button"
                      title="Döndər"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChangeTransform({ textRotation: (textRotation + 45) % 360 });
                      }}
                      className="p-1 rounded-full hover:bg-neutral-800 text-neutral-300"
                    >
                      <RotateCw size={12} />
                    </button>
                    <button
                      type="button"
                      title="Mərkəzə qoy"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChangeTransform({ textPosX: 0, textPosY: hasImage ? 60 : 0 });
                      }}
                      className="p-1 rounded-full hover:bg-neutral-800 text-neutral-300 text-[10px] font-bold px-1"
                    >
                      M
                    </button>
                    {onClearText && (
                      <button
                        type="button"
                        title="Mətni sil"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClearText();
                          setSelectedItem(null);
                        }}
                        className="p-1 rounded-full hover:bg-red-950 text-red-400"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <div
        className={`absolute bottom-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-xs shadow-md border pointer-events-none flex items-center gap-1.5 transition-colors duration-200 ${
          isLightStage
            ? "bg-white/95 text-stone-900 border-stone-300 shadow-sm"
            : "bg-neutral-900/80 text-neutral-300 border-neutral-700/80"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>
          {side === "front"
            ? "Ön tərəf"
            : side === "back"
            ? "Arxa tərəf"
            : side === "leftSleeve"
            ? "Sol qol"
            : "Sağ qol"}
        </span>
      </div>
    </div>
  );
}

