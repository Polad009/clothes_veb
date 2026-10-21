"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import {
  RotateCw,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sun,
  Moon,
  Undo2,
  Redo2,
  Crosshair,
  AlertTriangle,
} from "lucide-react";

export type StudioSurface = "front" | "back" | "leftSleeve" | "rightSleeve";

export interface SurfacePrintArea {
  left: number;   // 0 to 1 ratio
  top: number;    // 0 to 1 ratio
  width: number;  // 0 to 1 ratio
  height: number; // 0 to 1 ratio
}

export const PRINT_AREAS: Record<string, Partial<Record<StudioSurface, SurfacePrintArea>>> = {
  tshirt: {
    front: { left: 0.28, top: 0.30, width: 0.44, height: 0.46 },
    back: { left: 0.27, top: 0.28, width: 0.46, height: 0.46 },
    leftSleeve: { left: 0.42, top: 0.38, width: 0.26, height: 0.24 },
    rightSleeve: { left: 0.32, top: 0.38, width: 0.26, height: 0.24 },
  },
  oversize: {
    front: { left: 0.28, top: 0.31, width: 0.44, height: 0.47 },
    back: { left: 0.27, top: 0.28, width: 0.46, height: 0.47 },
    leftSleeve: { left: 0.42, top: 0.38, width: 0.26, height: 0.24 },
    rightSleeve: { left: 0.32, top: 0.38, width: 0.26, height: 0.24 },
  },
  hoodie: {
    front: { left: 0.29, top: 0.40, width: 0.42, height: 0.22 },
    back: { left: 0.29, top: 0.35, width: 0.42, height: 0.35 },
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
    back: { left: 0.27, top: 0.28, width: 0.44, height: 0.40 },
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
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
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
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: GarmentCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);
  const garmentImgRef = useRef<HTMLImageElement>(null);

  const [selectedItem, setSelectedItem] = useState<"image" | "text" | null>(null);
  const [backdropMode, setBackdropMode] = useState<"auto" | "light" | "dark">("auto");
  const [stageZoom, setStageZoom] = useState<number>(1.0); // 1.0 to 3.0

  // Guidelines snapping states
  const [snapX, setSnapX] = useState<boolean>(false);
  const [snapY, setSnapY] = useState<boolean>(false);

  // Quality warnings
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
  const [isLowDpi, setIsLowDpi] = useState<boolean>(false);
  const [naturalImageSize, setNaturalImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Luminance map data URL for fabric texture overlay
  const [luminanceMapUrl, setLuminanceMapUrl] = useState<string | null>(null);

  const isDarkGarment = colorKey === "black" || colorKey === "darkblue" || colorKey === "green";
  const isLightStage = backdropMode === "light" || (backdropMode === "auto" && isDarkGarment);

  const garmentImgSrc = getStudioGarmentImage(garmentId, colorKey, side);
  const categoryKey = getStudioGarmentCategory(garmentId);
  const areas = PRINT_AREAS[categoryKey] || PRINT_AREAS.tshirt;
  const currentArea = areas[side] || areas.front || { left: 0.28, top: 0.30, width: 0.44, height: 0.46 };

  // Ref tracking for smooth 60fps gesture / drag loops
  const interactionRef = useRef<{
    mode: "idle" | "drag" | "resize" | "rotate" | "touchPinch";
    target: "image" | "text";
    startX: number;
    startY: number;
    initialPosX: number;
    initialPosY: number;
    initialScale: number;
    initialRotation: number;
    centerScreenX: number;
    centerScreenY: number;
    corner?: "nw" | "ne" | "sw" | "se";
    initialDist?: number;
    initialAngle?: number;
    rafId?: number;
  }>({
    mode: "idle",
    target: "image",
    startX: 0,
    startY: 0,
    initialPosX: 0,
    initialPosY: 0,
    initialScale: 1,
    initialRotation: 0,
    centerScreenX: 0,
    centerScreenY: 0,
  });

  // Calculate Image Natural Dimensions for DPI inspection
  useEffect(() => {
    if (!uploadedImage) {
      setNaturalImageSize({ width: 0, height: 0 });
      setIsLowDpi(false);
      return;
    }
    const img = new Image();
    img.src = uploadedImage;
    img.onload = () => {
      setNaturalImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      // Standard chest print is approx 28-30cm wide (~11 inches).
      // If scale makes the pixel density less than 150 DPI across physical print dimensions:
      const renderedInches = (200 * scale) / 96; // base 200px CSS ~ 2.08 inches on screen, DTG print ~ 8-10 inches
      const effectiveDpi = img.naturalWidth / Math.max(1, renderedInches * 3.5);
      setIsLowDpi(effectiveDpi < 150 && img.naturalWidth < 800);
    };
  }, [uploadedImage, scale]);

  // Extract fabric luminance once per garment/color/side change (Offscreen Canvas)
  useEffect(() => {
    let isCancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = garmentImgSrc;
    img.onload = () => {
      if (isCancelled) return;
      try {
        const offCanvas = document.createElement("canvas");
        const ctx = offCanvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        const w = img.naturalWidth || 600;
        const h = img.naturalHeight || 600;

        // Crop to print area coordinates
        const cropX = Math.round(currentArea.left * w);
        const cropY = Math.round(currentArea.top * h);
        const cropW = Math.round(currentArea.width * w);
        const cropH = Math.round(currentArea.height * h);

        offCanvas.width = cropW;
        offCanvas.height = cropH;

        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
        const imgData = ctx.getImageData(0, 0, cropW, cropH);
        const data = imgData.data;

        // Compute average lightness to center contrast
        let totalLum = 0;
        let count = 0;
        for (let i = 0; i < data.length; i += 16) {
          if (data[i + 3] > 30) {
            totalLum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            count++;
          }
        }
        const avgLum = count > 0 ? totalLum / count : 128;

        // Create luminance contrast map (folds and shadows)
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] > 20) {
            const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            // Normalize contrast around 128
            const contrast = 128 + (lum - avgLum) * 1.8;
            const clamped = Math.max(0, Math.min(255, contrast));
            data[i] = clamped;
            data[i + 1] = clamped;
            data[i + 2] = clamped;
            data[i + 3] = isDarkGarment ? Math.min(180, (clamped / 255) * 140) : Math.min(200, ((255 - clamped) / 255) * 160);
          } else {
            data[i + 3] = 0;
          }
        }

        ctx.putImageData(imgData, 0, 0);
        setLuminanceMapUrl(offCanvas.toDataURL("image/png"));
      } catch {
        // Fallback gracefully if CORS or canvas read occurs
        setLuminanceMapUrl(null);
      }
    };
    return () => {
      isCancelled = true;
    };
  }, [garmentImgSrc, currentArea.left, currentArea.top, currentArea.width, currentArea.height, isDarkGarment]);

  // Check Boundary Overflow
  useEffect(() => {
    if (!printAreaRef.current) return;
    const printRect = printAreaRef.current.getBoundingClientRect();
    const halfW = (printRect.width / 2) || 100;
    const halfH = (printRect.height / 2) || 100;

    let overflow = false;
    if (uploadedImage) {
      const artHalfW = (100 * scale);
      const artHalfH = (100 * scale);
      if (
        Math.abs(posX) + artHalfW > halfW + 10 ||
        Math.abs(posY) + artHalfH > halfH + 10
      ) {
        overflow = true;
      }
    }
    if (customText.trim()) {
      const textHalfW = Math.min(120, (customText.length * 7 * textScale));
      const textHalfH = 20 * textScale;
      if (
        Math.abs(textPosX) + textHalfW > halfW + 10 ||
        Math.abs(textPosY) + textHalfH > halfH + 10
      ) {
        overflow = true;
      }
    }
    setIsOverflowing(overflow);
  }, [uploadedImage, customText, posX, posY, scale, textPosX, textPosY, textScale]);

  // Keyboard navigation: 1px arrow moves (Shift=10px), Delete/Backspace, and Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const activeTag = (document.activeElement?.tagName || "").toLowerCase();
      if (activeTag === "input" || activeTag === "textarea") return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          onRedo?.();
        } else {
          onUndo?.();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        onRedo?.();
        return;
      }

      if (!selectedItem) return;

      const step = e.shiftKey ? 10 : 1;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (selectedItem === "image") {
          onChangeTransform({ posX: posX - step });
        } else {
          onChangeTransform({ textPosX: textPosX - step });
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (selectedItem === "image") {
          onChangeTransform({ posX: posX + step });
        } else {
          onChangeTransform({ textPosX: textPosX + step });
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (selectedItem === "image") {
          onChangeTransform({ posY: posY - step });
        } else {
          onChangeTransform({ textPosY: textPosY - step });
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (selectedItem === "image") {
          onChangeTransform({ posY: posY + step });
        } else {
          onChangeTransform({ textPosY: textPosY + step });
        }
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        if (selectedItem === "image") {
          onClearImage?.();
          setSelectedItem(null);
        } else {
          onClearText?.();
          setSelectedItem(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItem, posX, posY, textPosX, textPosY, onChangeTransform, onClearImage, onClearText, onUndo, onRedo]);

  // Start Item Drag
  const handleStartDrag = (e: React.MouseEvent | React.TouchEvent, target: "image" | "text") => {
    e.stopPropagation();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    setSelectedItem(target);
    interactionRef.current = {
      mode: "drag",
      target,
      startX: clientX,
      startY: clientY,
      initialPosX: target === "image" ? posX : textPosX,
      initialPosY: target === "image" ? posY : textPosY,
      initialScale: target === "image" ? scale : textScale,
      initialRotation: target === "image" ? rotation : textRotation,
      centerScreenX: 0,
      centerScreenY: 0,
    };
  };

  // Start Corner Aspect-Locked Resize
  const handleStartCornerResize = (
    e: React.MouseEvent | React.TouchEvent,
    target: "image" | "text",
    corner: "nw" | "ne" | "sw" | "se"
  ) => {
    e.stopPropagation();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const el = e.currentTarget.parentElement;
    const rect = el?.getBoundingClientRect();
    const centerX = rect ? rect.left + rect.width / 2 : clientX;
    const centerY = rect ? rect.top + rect.height / 2 : clientY;

    setSelectedItem(target);
    interactionRef.current = {
      mode: "resize",
      target,
      startX: clientX,
      startY: clientY,
      initialPosX: target === "image" ? posX : textPosX,
      initialPosY: target === "image" ? posY : textPosY,
      initialScale: target === "image" ? scale : textScale,
      initialRotation: target === "image" ? rotation : textRotation,
      centerScreenX: centerX,
      centerScreenY: centerY,
      corner,
      initialDist: Math.hypot(clientX - centerX, clientY - centerY) || 1,
    };
  };

  // Start Dedicated Top Stalk Rotation Handle
  const handleStartRotate = (e: React.MouseEvent | React.TouchEvent, target: "image" | "text") => {
    e.stopPropagation();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const el = e.currentTarget.parentElement;
    const rect = el?.getBoundingClientRect();
    const centerX = rect ? rect.left + rect.width / 2 : clientX;
    const centerY = rect ? rect.top + rect.height / 2 : clientY;

    setSelectedItem(target);
    const initialAngleRad = Math.atan2(clientY - centerY, clientX - centerX);
    const initialAngleDeg = (initialAngleRad * 180) / Math.PI;

    interactionRef.current = {
      mode: "rotate",
      target,
      startX: clientX,
      startY: clientY,
      initialPosX: target === "image" ? posX : textPosX,
      initialPosY: target === "image" ? posY : textPosY,
      initialScale: target === "image" ? scale : textScale,
      initialRotation: target === "image" ? rotation : textRotation,
      centerScreenX: centerX,
      centerScreenY: centerY,
      initialAngle: initialAngleDeg,
    };
  };

  // Unified Pointer Move with 60fps requestAnimationFrame
  const handlePointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const inter = interactionRef.current;
    if (inter.mode === "idle") return;

    // Multi-touch gestures (Pinch-to-Scale and 2-finger Rotate)
    if ("touches" in e && e.touches.length >= 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const angle = (Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * 180) / Math.PI;

      if (inter.mode !== "touchPinch") {
        inter.mode = "touchPinch";
        inter.initialDist = dist;
        inter.initialAngle = angle;
        inter.initialScale = inter.target === "image" ? scale : textScale;
        inter.initialRotation = inter.target === "image" ? rotation : textRotation;
        return;
      }

      if (inter.initialDist && inter.initialAngle !== undefined) {
        const scaleFactor = dist / inter.initialDist;
        const newScale = Math.max(0.3, Math.min(2.5, inter.initialScale * scaleFactor));
        const rotDelta = angle - inter.initialAngle;
        let newRot = Math.round(inter.initialRotation + rotDelta) % 360;
        if (newRot < 0) newRot += 360;

        if (inter.target === "image") {
          onChangeTransform({
            scale: parseFloat(newScale.toFixed(2)),
            rotation: newRot,
          });
        } else {
          onChangeTransform({
            textScale: parseFloat(newScale.toFixed(2)),
            textRotation: newRot,
          });
        }
      }
      return;
    }

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    if (inter.rafId) cancelAnimationFrame(inter.rafId);

    inter.rafId = requestAnimationFrame(() => {
      if (inter.mode === "drag") {
        // Adjust for stage zoom
        const dx = (clientX - inter.startX) / stageZoom;
        const dy = (clientY - inter.startY) / stageZoom;

        let rawX = inter.initialPosX + dx;
        let rawY = inter.initialPosY + dy;

        // Snapping within +/- 4px to Center X and Center Y
        let isSnappedX = false;
        let isSnappedY = false;

        if (Math.abs(rawX) <= 4) {
          rawX = 0;
          isSnappedX = true;
        }
        if (Math.abs(rawY) <= 4) {
          rawY = 0;
          isSnappedY = true;
        }

        setSnapX(isSnappedX);
        setSnapY(isSnappedY);

        // Clamping to bounding limits
        const nextX = Math.max(-180, Math.min(180, rawX));
        const nextY = Math.max(-180, Math.min(180, rawY));

        if (inter.target === "image") {
          onChangeTransform({ posX: Math.round(nextX), posY: Math.round(nextY) });
        } else {
          onChangeTransform({ textPosX: Math.round(nextX), textPosY: Math.round(nextY) });
        }
      } else if (inter.mode === "resize" && inter.initialDist) {
        const currDist = Math.hypot(clientX - inter.centerScreenX, clientY - inter.centerScreenY);
        const ratio = currDist / inter.initialDist;
        const newScale = Math.max(0.3, Math.min(2.5, inter.initialScale * ratio));

        if (inter.target === "image") {
          onChangeTransform({ scale: parseFloat(newScale.toFixed(2)) });
        } else {
          onChangeTransform({ textScale: parseFloat(newScale.toFixed(2)) });
        }
      } else if (inter.mode === "rotate" && inter.initialAngle !== undefined) {
        const currentAngleRad = Math.atan2(clientY - inter.centerScreenY, clientX - inter.centerScreenX);
        const currentAngleDeg = (currentAngleRad * 180) / Math.PI;
        const delta = currentAngleDeg - inter.initialAngle;
        let newRot = Math.round(inter.initialRotation + delta) % 360;
        if (newRot < 0) newRot += 360;

        // Angle snapping to 0, 45, 90, 180, 270 if close
        const snapAngles = [0, 45, 90, 135, 180, 225, 270, 315, 360];
        for (const s of snapAngles) {
          if (Math.abs(newRot - s) <= 3) {
            newRot = s === 360 ? 0 : s;
            break;
          }
        }

        if (inter.target === "image") {
          onChangeTransform({ rotation: newRot });
        } else {
          onChangeTransform({ textRotation: newRot });
        }
      }
    });
  }, [stageZoom, scale, textScale, rotation, textRotation, onChangeTransform]);

  const handleStopInteraction = () => {
    if (interactionRef.current.rafId) {
      cancelAnimationFrame(interactionRef.current.rafId);
    }
    interactionRef.current.mode = "idle";
    setSnapX(false);
    setSnapY(false);
  };

  const hasImage = Boolean(uploadedImage);
  const hasText = Boolean(customText.trim());
  const hasContent = hasImage || hasText;

  // Center active element
  const handleCenterElement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedItem === "image") {
      onChangeTransform({ posX: 0, posY: 0 });
    } else if (selectedItem === "text") {
      onChangeTransform({ textPosX: 0, textPosY: hasImage ? 60 : 0 });
    } else {
      onChangeTransform({ posX: 0, posY: 0, textPosX: 0, textPosY: 60 });
    }
  };

  return (
    <div className="relative w-full max-w-[500px] mx-auto select-none flex flex-col items-center">
      {/* SVG Definitions for Fabric Grain and 0.3px Edge Softening Filter */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="fabric-ink-filter" x="-20%" y="-20%" width="140%" height="140%">
            {/* 0.3px Gaussian Blur for realistic ink fiber bleed */}
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.3" result="softEdges" />
            {/* Fine procedural cloth grain */}
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="clothGrain" />
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.08 0" in="clothGrain" result="subtleGrain" />
            <feComposite in="softEdges" in2="subtleGrain" operator="over" />
          </filter>
        </defs>
      </svg>

      {/* Top Floating Action Strip: Zoom, Undo, Redo, Backdrop Lighting, Center */}
      <div className="w-full flex items-center justify-between gap-1.5 mb-2 px-1 text-xs z-30">
        <div className="flex items-center gap-1">
          {/* Backdrop Lighting Toggle */}
          <button
            type="button"
            onClick={() => setBackdropMode(isLightStage ? "dark" : "light")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md transition-all shadow-xs active:scale-95 border ${
              isLightStage
                ? "bg-white/90 hover:bg-white text-stone-800 border-stone-300"
                : "bg-neutral-900/85 hover:bg-neutral-800 text-neutral-300 border-neutral-700"
            }`}
            title="Studiya fonunun işıqlanmasını dəyiş (Açıq / Qaranlıq)"
          >
            {isLightStage ? <Sun size={12} className="text-amber-500" /> : <Moon size={12} className="text-sky-300" />}
            <span className="hidden sm:inline">{isLightStage ? "Açıq" : "Qaranlıq"}</span>
          </button>

          {/* Undo / Redo */}
          {onUndo && (
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded-full border transition active:scale-95 shadow-xs ${
                canUndo
                  ? "bg-white hover:bg-stone-100 text-stone-800 border-stone-300"
                  : "bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed"
              }`}
              title="Geri al (Ctrl+Z)"
            >
              <Undo2 size={13} />
            </button>
          )}
          {onRedo && (
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-1.5 rounded-full border transition active:scale-95 shadow-xs ${
                canRedo
                  ? "bg-white hover:bg-stone-100 text-stone-800 border-stone-300"
                  : "bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed"
              }`}
              title="İrəli qaytar (Ctrl+Y)"
            >
              <Redo2 size={13} />
            </button>
          )}
        </div>

        {/* Center Element & Canvas Zoom Controls */}
        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-full border border-stone-300/80 shadow-xs">
          <button
            type="button"
            onClick={handleCenterElement}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full hover:bg-stone-100 text-stone-700 text-[10px] font-semibold transition"
            title="Mərkəzə gətir"
          >
            <Crosshair size={12} className="text-sky-600" />
            <span>Mərkəzə</span>
          </button>

          <span className="w-px h-3 bg-stone-200" />

          <button
            type="button"
            onClick={() => setStageZoom((prev) => Math.max(1.0, parseFloat((prev - 0.25).toFixed(2))))}
            disabled={stageZoom <= 1.0}
            className="p-1 rounded-full hover:bg-stone-100 text-stone-600 disabled:opacity-40 transition"
            title="Kiçilt"
          >
            <ZoomOut size={12} />
          </button>

          <span className="text-[10px] font-bold text-stone-700 w-8 text-center">
            {Math.round(stageZoom * 100)}%
          </span>

          <button
            type="button"
            onClick={() => setStageZoom((prev) => Math.min(3.0, parseFloat((prev + 0.25).toFixed(2))))}
            disabled={stageZoom >= 3.0}
            className="p-1 rounded-full hover:bg-stone-100 text-stone-600 disabled:opacity-40 transition"
            title="Böyüt (300%-ə qədər)"
          >
            <ZoomIn size={12} />
          </button>

          {stageZoom > 1.0 && (
            <button
              type="button"
              onClick={() => setStageZoom(1.0)}
              className="p-1 rounded-full hover:bg-stone-100 text-stone-600"
              title="100% Sıfırla"
            >
              <Maximize2 size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Stage Box */}
      <div
        ref={containerRef}
        onClick={() => setSelectedItem(null)}
        onMouseMove={handlePointerMove}
        onTouchMove={handlePointerMove}
        onMouseUp={handleStopInteraction}
        onTouchEnd={handleStopInteraction}
        className={`relative w-full aspect-square rounded-3xl transition-all duration-300 shadow-2xl p-4 sm:p-6 flex items-center justify-center overflow-hidden ${
          isLightStage
            ? "bg-gradient-to-b from-[#F3F0EB] via-[#E8E5DC] to-[#DDD9CF] border border-stone-300/90"
            : "bg-neutral-900 border border-neutral-800"
        }`}
      >
        {/* Stage Lighting & Ambient Floor Glow */}
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

        {/* Zoomable Container */}
        <div
          style={{
            transform: `scale(${stageZoom})`,
            transformOrigin: "center center",
            transition: interactionRef.current.mode === "idle" ? "transform 0.15s ease-out" : "none",
          }}
          className="relative w-full h-full flex items-center justify-center"
        >
          {/* Photorealistic Garment Image */}
          <img
            ref={garmentImgRef}
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

          {/* Print Area Boundary with Overflow-Clipping Mask */}
          <div
            ref={printAreaRef}
            style={{
              left: `${currentArea.left * 100}%`,
              top: `${currentArea.top * 100}%`,
              width: `${currentArea.width * 100}%`,
              height: `${currentArea.height * 100}%`,
            }}
            className={`absolute border-2 border-dashed rounded-xl pointer-events-none flex items-center justify-center transition-all duration-200 z-10 overflow-hidden ${
              isLightStage ? "border-sky-500/90" : "border-sky-400/80"
            }`}
          >
            {/* Visual Center Snapping Guide Lines (Crosshairs) */}
            {snapX && (
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 border-l-2 border-dashed border-amber-400 z-40 pointer-events-none" />
            )}
            {snapY && (
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 border-t-2 border-dashed border-amber-400 z-40 pointer-events-none" />
            )}

            {/* Prompt when empty */}
            {!hasContent && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestUpload?.();
                }}
                className="pointer-events-auto cursor-pointer p-3 text-center flex flex-col items-center gap-1.5 opacity-75 hover:opacity-100 transition-opacity"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-xs border ${
                    isLightStage
                      ? "bg-sky-500 text-white border-sky-400"
                      : "bg-sky-500/20 text-sky-300 border-sky-400/30"
                  }`}
                >
                  +
                </div>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md shadow-2xs backdrop-blur-xs ${
                    isLightStage
                      ? "text-stone-800 bg-white/95 border border-stone-200"
                      : "text-sky-200 bg-black/60"
                  }`}
                >
                  Çap Sahəsi (Dizayn əlavə et)
                </span>
              </div>
            )}

            {/* Artwork & Typography Layers Inside Clipped Printable Boundary */}
            {hasContent && (
              <div className="relative w-full h-full flex items-center justify-center pointer-events-none overflow-visible">
                {/* ======================================================== */}
                {/* LAYER 1: UPLOADED ARTWORK / LOGO                        */}
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
                      cursor: interactionRef.current.mode === "drag" ? "grabbing" : "grab",
                      zIndex: selectedItem === "image" ? 25 : 10,
                      filter: "url(#fabric-ink-filter)",
                      mixBlendMode: isDarkGarment ? "normal" : "multiply",
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
                      className="max-w-[200px] max-h-[200px] object-contain drop-shadow-xs select-none pointer-events-none"
                      draggable={false}
                    />

                    {/* Controls Toolbar & Transformation Handles */}
                    {selectedItem === "image" && (
                      <>
                        {/* Top Stalk Rotation Handle */}
                        <div
                          onMouseDown={(e) => handleStartRotate(e, "image")}
                          onTouchStart={(e) => handleStartRotate(e, "image")}
                          className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-grab active:cursor-grabbing z-30 group"
                          title="Fırlatmaq üçün tutub çevirin"
                        >
                          <div className="w-5 h-5 rounded-full bg-white border-2 border-sky-500 shadow-md flex items-center justify-center text-sky-600 group-hover:scale-110 transition-transform">
                            <RotateCw size={10} />
                          </div>
                          <div className="w-0.5 h-2 bg-sky-500" />
                        </div>

                        {/* 4 Corner Aspect-Ratio-Preserving Resize Handles */}
                        <div
                          onMouseDown={(e) => handleStartCornerResize(e, "image", "nw")}
                          onTouchStart={(e) => handleStartCornerResize(e, "image", "nw")}
                          className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-white border-2 border-sky-500 shadow-md cursor-nwse-resize z-20 hover:scale-110 transition-transform"
                          title="Ölçünü dəyiş"
                        />
                        <div
                          onMouseDown={(e) => handleStartCornerResize(e, "image", "ne")}
                          onTouchStart={(e) => handleStartCornerResize(e, "image", "ne")}
                          className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-white border-2 border-sky-500 shadow-md cursor-nesw-resize z-20 hover:scale-110 transition-transform"
                          title="Ölçünü dəyiş"
                        />
                        <div
                          onMouseDown={(e) => handleStartCornerResize(e, "image", "sw")}
                          onTouchStart={(e) => handleStartCornerResize(e, "image", "sw")}
                          className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-white border-2 border-sky-500 shadow-md cursor-nesw-resize z-20 hover:scale-110 transition-transform"
                          title="Ölçünü dəyiş"
                        />
                        <div
                          onMouseDown={(e) => handleStartCornerResize(e, "image", "se")}
                          onTouchStart={(e) => handleStartCornerResize(e, "image", "se")}
                          className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-white border-2 border-sky-500 shadow-md cursor-nwse-resize z-20 hover:scale-110 transition-transform"
                          title="Ölçünü dəyiş"
                        />

                        {/* Quick Action Floating Bar */}
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-neutral-900/95 backdrop-blur-md px-2 py-1 rounded-full shadow-xl border border-neutral-700 z-40 text-white whitespace-nowrap">
                          <span className="text-[9px] font-bold text-sky-400 px-1 uppercase tracking-wider">Şəkil</span>
                          <button
                            type="button"
                            title="Böyüt (+10%)"
                            onClick={(e) => {
                              e.stopPropagation();
                              onChangeTransform({ scale: Math.min(2.5, scale + 0.1) });
                            }}
                            className="p-1 rounded-full hover:bg-neutral-800 text-neutral-300"
                          >
                            <ZoomIn size={12} />
                          </button>
                          <button
                            type="button"
                            title="Kiçilt (-10%)"
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
                            title="45° Döndər"
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
                            className="p-1 rounded-full hover:bg-neutral-800 text-neutral-300 text-[10px] font-bold px-1.5"
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
                {/* LAYER 2: CUSTOM TYPOGRAPHY TEXT                         */}
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
                      cursor: interactionRef.current.mode === "drag" ? "grabbing" : "grab",
                      zIndex: selectedItem === "text" ? 25 : 12,
                      filter: "url(#fabric-ink-filter)",
                      mixBlendMode: isDarkGarment ? "normal" : "multiply",
                    }}
                    className={`pointer-events-auto absolute transition-shadow duration-150 px-2 py-1 ${
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
                            ? "0 1px 3px rgba(0,0,0,0.6)"
                            : "0 1px 1px rgba(255,255,255,0.3)",
                      }}
                      className="font-bold text-center tracking-wide select-none whitespace-nowrap uppercase"
                    >
                      {customText}
                    </div>

                    {/* Selection Controls for Text */}
                    {selectedItem === "text" && (
                      <>
                        {/* Top Stalk Rotation Handle */}
                        <div
                          onMouseDown={(e) => handleStartRotate(e, "text")}
                          onTouchStart={(e) => handleStartRotate(e, "text")}
                          className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-grab active:cursor-grabbing z-30 group"
                          title="Fırlatmaq üçün tutub çevirin"
                        >
                          <div className="w-5 h-5 rounded-full bg-white border-2 border-amber-500 shadow-md flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                            <RotateCw size={10} />
                          </div>
                          <div className="w-0.5 h-2 bg-amber-500" />
                        </div>

                        {/* 4 Corner Aspect-Ratio-Preserving Resize Handles */}
                        <div
                          onMouseDown={(e) => handleStartCornerResize(e, "text", "nw")}
                          onTouchStart={(e) => handleStartCornerResize(e, "text", "nw")}
                          className="absolute -top-2 -left-2 w-3.5 h-3.5 rounded-full bg-white border-2 border-amber-500 shadow-md cursor-nwse-resize z-20 hover:scale-110 transition-transform"
                          title="Ölçünü dəyiş"
                        />
                        <div
                          onMouseDown={(e) => handleStartCornerResize(e, "text", "ne")}
                          onTouchStart={(e) => handleStartCornerResize(e, "text", "ne")}
                          className="absolute -top-2 -right-2 w-3.5 h-3.5 rounded-full bg-white border-2 border-amber-500 shadow-md cursor-nesw-resize z-20 hover:scale-110 transition-transform"
                          title="Ölçünü dəyiş"
                        />
                        <div
                          onMouseDown={(e) => handleStartCornerResize(e, "text", "sw")}
                          onTouchStart={(e) => handleStartCornerResize(e, "text", "sw")}
                          className="absolute -bottom-2 -left-2 w-3.5 h-3.5 rounded-full bg-white border-2 border-amber-500 shadow-md cursor-nesw-resize z-20 hover:scale-110 transition-transform"
                          title="Ölçünü dəyiş"
                        />
                        <div
                          onMouseDown={(e) => handleStartCornerResize(e, "text", "se")}
                          onTouchStart={(e) => handleStartCornerResize(e, "text", "se")}
                          className="absolute -bottom-2 -right-2 w-3.5 h-3.5 rounded-full bg-white border-2 border-amber-500 shadow-md cursor-nwse-resize z-20 hover:scale-110 transition-transform"
                          title="Ölçünü dəyiş"
                        />

                        {/* Floating Quick Bar for Text */}
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-neutral-900/95 backdrop-blur-md px-2 py-1 rounded-full shadow-xl border border-neutral-700 z-40 text-white whitespace-nowrap">
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
                            title="45° Döndər"
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
                            className="p-1 rounded-full hover:bg-neutral-800 text-neutral-300 text-[10px] font-bold px-1.5"
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

                {/* Fabric Luminance Overlay: Folds and creases pass realistically over the printed design */}
                {luminanceMapUrl && (
                  <img
                    src={luminanceMapUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-20"
                    style={{
                      mixBlendMode: isDarkGarment ? "screen" : "multiply",
                      opacity: isDarkGarment ? 0.35 : 0.65,
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Quality Warning Badges */}
        <div className="absolute top-3 right-3 z-30 flex flex-col items-end gap-1.5 pointer-events-none">
          {/* Boundary Overflow Warning Badge */}
          {isOverflowing && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/95 text-stone-950 font-bold text-[10px] shadow-lg backdrop-blur-md animate-pulse">
              <AlertTriangle size={12} />
              <span>Dizayn çap sahəsindən kənara çıxır və kəsiləcək</span>
            </div>
          )}

          {/* DPI Resolution Warning Badge */}
          {isLowDpi && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-600/90 text-white font-bold text-[10px] shadow-lg backdrop-blur-md">
              <AlertTriangle size={12} />
              <span>Şəkil bu ölçüdə bulanıq çıxa bilər (DPI &lt; 150)</span>
            </div>
          )}
        </div>

        {/* Current Active Surface Badge */}
        <div
          className={`absolute bottom-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-xs shadow-md border pointer-events-none flex items-center gap-1.5 transition-colors duration-200 z-30 ${
            isLightStage
              ? "bg-white/95 text-stone-900 border-stone-300 shadow-xs"
              : "bg-neutral-900/80 text-neutral-300 border-neutral-700/80"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            {side === "front"
              ? "Ön"
              : side === "back"
              ? "Arxa"
              : side === "leftSleeve"
              ? "Sol qol"
              : "Sağ qol"}
          </span>
        </div>
      </div>
    </div>
  );
}
