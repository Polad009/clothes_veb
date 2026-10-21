"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { playAddToCartSound } from "@/lib/soundEffects";
import { GarmentCanvas, StudioSurface, getStudioGarmentCategory, getStudioGarmentImage } from "@/components/studio/GarmentCanvas";
import { LiveModelPreviewModal } from "@/components/studio/LiveModelPreviewModal";
import { PhotoRoom3DPreviewModal } from "@/components/studio/PhotoRoom3DPreviewModal";
import {
  autoTrimCanvas,
  removeBackgroundWithISNet,
  applyMaskWithAntiHalo,
  calculateAutoFitScale,
} from "@/lib/studio/image-preprocessor";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import {
  Upload,
  RotateCcw,
  Palette,
  ShoppingBag,
  Check,
  Trash2,
  CheckCircle2,
  Eye,
  Loader2,
  Sparkles,
  X,
  Wand2,
  ChevronUp,
  ChevronDown,
  Paintbrush,
  Eraser,
  Undo2,
  Redo2,
} from "lucide-react";

export interface GarmentOption {
  id: string;
  name: string;
  category: "tshirt" | "oversize" | "polo" | "polo-long" | "sweatshirt" | "hoodie" | "yarimzamok" | "salvar" | "kepka";
  basePrice: number;        // Çapsız
  smallPrintPrice: number;  // Kiçik çap (10cm)
  oneSidePrice: number;     // Tək tərəf
  twoSidePrice: number;     // İki tərəf
  sleevePrice: number;      // Qol / boyun
  description: string;
}

// Focused catalog containing ONLY apparel: T-shirt, Oversize, Polo, Hody, Yarımzamok, Sviter, Şalvar, Kepka
const GARMENTS: GarmentOption[] = [
  {
    id: "tshirt-regular-suprem",
    name: "T-shirt Regular (Süprəm)",
    category: "tshirt",
    basePrice: 8,
    smallPrintPrice: 12,
    oneSidePrice: 14,
    twoSidePrice: 15,
    sleevePrice: 1,
    description: "100% daranmış təbii süprəm pambıq, yüngül və nəfəs alan parça.",
  },
  {
    id: "tshirt-regular-2iplik",
    name: "T-shirt Regular (2iplik / TS Parça)",
    category: "tshirt",
    basePrice: 9,
    smallPrintPrice: 13,
    oneSidePrice: 15,
    twoSidePrice: 16,
    sleevePrice: 1,
    description: "Daha sıx və davamlı 2iplik pambıq toxunuşu.",
  },
  {
    id: "tshirt-oversize",
    name: "Oversize T-shirt (Süprəm / 2iplik)",
    category: "oversize",
    basePrice: 11,
    smallPrintPrice: 15,
    oneSidePrice: 17,
    twoSidePrice: 18,
    sleevePrice: 1,
    description: "Trend enli çiyin kəsimi, premium xalis pambıq.",
  },
  {
    id: "polo-short",
    name: "Polo — Qısaqol Pambıq",
    category: "polo",
    basePrice: 14,
    smallPrintPrice: 15,
    oneSidePrice: 16,
    twoSidePrice: 17,
    sleevePrice: 1,
    description: "Klassik yaxalıqlı, möhkəm pambıq piké parçası.",
  },
  {
    id: "polo-long",
    name: "Polo — Uzunqol Pambıq",
    category: "polo-long",
    basePrice: 18,
    smallPrintPrice: 19,
    oneSidePrice: 20,
    twoSidePrice: 21,
    sleevePrice: 1,
    description: "Payız-qış üçün uzunqollu klassik piké polo köynək.",
  },
  {
    id: "sviter-thin",
    name: "Sviter — Nazik (2iplik)",
    category: "sweatshirt",
    basePrice: 14,
    smallPrintPrice: 18,
    oneSidePrice: 20,
    twoSidePrice: 21,
    sleevePrice: 1,
    description: "Yüngül və elastik 2iplik toxunuş, gündəlik rahat stil.",
  },
  {
    id: "sviter-thick",
    name: "Sviter — Qalın (3iplik)",
    category: "sweatshirt",
    basePrice: 17,
    smallPrintPrice: 21,
    oneSidePrice: 23,
    twoSidePrice: 24,
    sleevePrice: 1,
    description: "İçi isti tüklü premium 3iplik pambıq sviter.",
  },
  {
    id: "hoodie-thin",
    name: "Hody Nazik (2iplik)",
    category: "hoodie",
    basePrice: 18,
    smallPrintPrice: 22,
    oneSidePrice: 24,
    twoSidePrice: 25,
    sleevePrice: 1,
    description: "Kapüşonlu 2iplik yüngül pambıq hudi.",
  },
  {
    id: "hoodie-thick",
    name: "Hody Qalın (3iplik)",
    category: "hoodie",
    basePrice: 19,
    smallPrintPrice: 23,
    oneSidePrice: 25,
    twoSidePrice: 26,
    sleevePrice: 1,
    description: "380 GSM isti və möhkəm kapüşonlu 3iplik heavyweight hudi.",
  },
  {
    id: "yarimzamok-thin",
    name: "Yarımzamok Nazik (2iplik)",
    category: "yarimzamok",
    basePrice: 19,
    smallPrintPrice: 23,
    oneSidePrice: 25,
    twoSidePrice: 26,
    sleevePrice: 1,
    description: "Yaxalıqlı yarımzamok kəsimli yüngül 2iplik sviter.",
  },
  {
    id: "yarimzamok-thick",
    name: "Yarımzamok Qalın (3iplik)",
    category: "yarimzamok",
    basePrice: 20,
    smallPrintPrice: 24,
    oneSidePrice: 26,
    twoSidePrice: 27,
    sleevePrice: 1,
    description: "Qalın 3iplik isti yarımzamoklu üst geyim.",
  },
  {
    id: "balonka",
    name: "Balonka",
    category: "hoodie",
    basePrice: 22,
    smallPrintPrice: 24,
    oneSidePrice: 25,
    twoSidePrice: 26,
    sleevePrice: 1,
    description: "Külək keçirməyən müasir kəsimli balonka gödəkcə.",
  },
  {
    id: "salvar-thin",
    name: "Şalvar Nazik (2iplik)",
    category: "salvar",
    basePrice: 17,
    smallPrintPrice: 21,
    oneSidePrice: 22,
    twoSidePrice: 23,
    sleevePrice: 1,
    description: "Yüngül və rahat gündəlik idman şalvarı.",
  },
  {
    id: "salvar-thick",
    name: "Şalvar Qalın (3iplik / TS Parça)",
    category: "salvar",
    basePrice: 18,
    smallPrintPrice: 22,
    oneSidePrice: 23,
    twoSidePrice: 24,
    sleevePrice: 1,
    description: "İçi tüklü isti qalın qış idman şalvarı.",
  },
  {
    id: "kepka-thin",
    name: "Kepka — Nazik",
    category: "kepka",
    basePrice: 4,
    smallPrintPrice: 6,
    oneSidePrice: 6.5,
    twoSidePrice: 6.5,
    sleevePrice: 1,
    description: "Yüngül yay kepkası, tənzimlənən kəmərli.",
  },
  {
    id: "kepka-thick",
    name: "Kepka — Qalın",
    category: "kepka",
    basePrice: 6,
    smallPrintPrice: 7,
    oneSidePrice: 7.5,
    twoSidePrice: 7.5,
    sleevePrice: 1,
    description: "Qalın panelli snapback kepka.",
  },
];

interface StudioColorDef {
  key: string;
  name: string;
  hex: string;
}

const COLORS: StudioColorDef[] = [
  { key: "white", name: "Ağ", hex: "#FFFFFF" },
  { key: "black", name: "Qara", hex: "#18181B" },
  { key: "sand", name: "Qum Beji", hex: "#D7CEC7" },
  { key: "sky-blue", name: "Açıq Mavi", hex: "#93C5FD" },
  { key: "darkblue", name: "Tünd Göy", hex: "#1E293B" },
  { key: "green", name: "Zeytun Yaşılı", hex: "#3F4F38" },
  { key: "red", name: "Qırmızı", hex: "#A32C2C" },
];

const PRESETS = [
  {
    name: "BMW M4 Streetwear",
    url: "/images/presets/bmw-m4-clean.png?v=3",
    originalUrl: "/images/presets/bmw-m4-original.jpg",
  },
  {
    name: "Qurd Modeli (Wolf)",
    url: "/images/presets/wolf_feathers.png",
    originalUrl: "/images/presets/wolf_feathers.png",
  },
  {
    name: "Alovlu Qurd",
    url: "/images/presets/wolf_flame.png",
    originalUrl: "/images/presets/wolf_flame.png",
  },
  {
    name: "Minimalist Loqo",
    url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=500&auto=format&fit=crop",
    originalUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=500&auto=format&fit=crop",
  },
];

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

export default function StudioPage() {
  const { addItem, openCart } = useCart();
  const { formatPrice } = useCurrency();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Studio Selection
  const [selectedGarment, setSelectedGarment] = useState<GarmentOption>(GARMENTS[0]);
  const [selectedColor, setSelectedColor] = useState<StudioColorDef>(COLORS[0]);
  const [viewSide, setViewSide] = useState<StudioSurface>("front");
  const [selectedSize, setSelectedSize] = useState("L");
  const [isAdding, setIsAdding] = useState(false);
  const [isLiveModelOpen, setIsLiveModelOpen] = useState(false);
  const [isPhotoRoom3DOpen, setIsPhotoRoom3DOpen] = useState(false);
  const [showMobileMiniPreview, setShowMobileMiniPreview] = useState(false);
  const [isMobilePreviewCollapsed, setIsMobilePreviewCollapsed] = useState(false);

  // Monitor scroll for mobile real-time sticky preview
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        setShowMobileMiniPreview(window.scrollY > 280);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Upload Preview Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [previewRawImage, setPreviewRawImage] = useState<string | null>(null);
  const [trimmedBaseImage, setTrimmedBaseImage] = useState<string | null>(null);
  const [previewCleanImage, setPreviewCleanImage] = useState<string | null>(null);
  const [aiCutoutImage, setAiCutoutImage] = useState<string | null>(null);
  const [compareTab, setCompareTab] = useState<"cutout" | "original">("cutout");
  const [imageDims, setImageDims] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isLowDpi, setIsLowDpi] = useState(false);
  const [autoFittedScale, setAutoFittedScale] = useState(1.0);
  const [isCleaningBg, setIsCleaningBg] = useState(false);
  const [bgCleaned, setBgCleaned] = useState(false);
  const [cleaningStatusText, setCleaningStatusText] = useState("Süni intellekt hazırlanır…");
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Manual Brush Refinement State
  const [isBrushMode, setIsBrushMode] = useState(false);
  const [brushTool, setBrushTool] = useState<"restore" | "erase">("restore");
  const [brushSize, setBrushSize] = useState(25);
  const maskBytesRef = useRef<Uint8ClampedArray | null>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const brushHistoryRef = useRef<Uint8ClampedArray[]>([]);
  const brushFutureRef = useRef<Uint8ClampedArray[]>([]);
  const isPaintingRef = useRef(false);
  const brushCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Lock body scroll completely while upload modal is open so it stays locked dead-center
  useEffect(() => {
    if (isUploadModalOpen) {
      const prevOverflow = document.body.style.overflow;
      const prevTouchAction = document.body.style.touchAction;
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.touchAction = prevTouchAction;
      };
    }
  }, [isUploadModalOpen]);

  // Independent Designs for ALL 4 SURFACES
  const [designs, setDesigns] = useState<Record<StudioSurface, SideDesignState>>({
    front: {
      uploadedImage: "/images/presets/bmw-m4-clean.png?v=3",
      originalImage: PRESETS[0].originalUrl,
      customText: "NOVA STUDIO",
      textColor: "#111827",
      fontFamily: "Inter",
      scale: 1.0,
      posX: 0,
      posY: -35,
      rotation: 0,
      textScale: 1.0,
      textPosX: 0,
      textPosY: 55,
      textRotation: 0,
    },
    back: {
      uploadedImage: null,
      originalImage: null,
      customText: "",
      textColor: "#111827",
      fontFamily: "Inter",
      scale: 1.0,
      posX: 0,
      posY: -30,
      rotation: 0,
      textScale: 1.0,
      textPosX: 0,
      textPosY: 55,
      textRotation: 0,
    },
    leftSleeve: {
      uploadedImage: null,
      originalImage: null,
      customText: "",
      textColor: "#111827",
      fontFamily: "Inter",
      scale: 0.8,
      posX: 0,
      posY: -20,
      rotation: 0,
      textScale: 0.8,
      textPosX: 0,
      textPosY: 35,
      textRotation: 0,
    },
    rightSleeve: {
      uploadedImage: null,
      originalImage: null,
      customText: "",
      textColor: "#111827",
      fontFamily: "Inter",
      scale: 0.8,
      posX: 0,
      posY: -20,
      rotation: 0,
      textScale: 0.8,
      textPosX: 0,
      textPosY: 35,
      textRotation: 0,
    },
  });

  const currentDesign = designs[viewSide];

  // Per-tab History Stacks for Undo/Redo (Ctrl+Z / Ctrl+Y)
  const [history, setHistory] = useState<Record<StudioSurface, SideDesignState[]>>({
    front: [],
    back: [],
    leftSleeve: [],
    rightSleeve: [],
  });

  const [future, setFuture] = useState<Record<StudioSurface, SideDesignState[]>>({
    front: [],
    back: [],
    leftSleeve: [],
    rightSleeve: [],
  });

  const updateCurrentDesign = (partial: Partial<SideDesignState>, recordHistory = true) => {
    setDesigns((prev) => {
      const current = prev[viewSide];
      if (recordHistory) {
        setHistory((prevHist) => ({
          ...prevHist,
          [viewSide]: [...prevHist[viewSide].slice(-30), current],
        }));
        setFuture((prevFut) => ({
          ...prevFut,
          [viewSide]: [],
        }));
      }
      return {
        ...prev,
        [viewSide]: { ...current, ...partial },
      };
    });
  };

  const handleUndo = useCallback(() => {
    setHistory((prevHist) => {
      const sideHist = prevHist[viewSide];
      if (!sideHist || sideHist.length === 0) return prevHist;
      const prevItem = sideHist[sideHist.length - 1];
      const newSideHist = sideHist.slice(0, -1);

      setDesigns((prevDesigns) => {
        const current = prevDesigns[viewSide];
        setFuture((prevFut) => ({
          ...prevFut,
          [viewSide]: [current, ...prevFut[viewSide]],
        }));
        return {
          ...prevDesigns,
          [viewSide]: prevItem,
        };
      });

      return {
        ...prevHist,
        [viewSide]: newSideHist,
      };
    });
  }, [viewSide]);

  const handleRedo = useCallback(() => {
    setFuture((prevFut) => {
      const sideFut = prevFut[viewSide];
      if (!sideFut || sideFut.length === 0) return prevFut;
      const nextItem = sideFut[0];
      const newSideFut = sideFut.slice(1);

      setDesigns((prevDesigns) => {
        const current = prevDesigns[viewSide];
        setHistory((prevHist) => ({
          ...prevHist,
          [viewSide]: [...prevHist[viewSide], current],
        }));
        return {
          ...prevDesigns,
          [viewSide]: nextItem,
        };
      });

      return {
        ...prevFut,
        [viewSide]: newSideFut,
      };
    });
  }, [viewSide]);

  // Garment category logic
  const garmentCategory = getStudioGarmentCategory(selectedGarment.id);

  // Downscale large image for 2D canvas preview (max 2048px) while preserving original for orders
  const downscaleForPreview = async (dataUrl: string, maxDim = 2048): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.width <= maxDim && img.height <= maxDim) {
          resolve(dataUrl);
          return;
        }
        const scale = Math.min(maxDim / img.width, maxDim / img.height);
        const targetW = Math.round(img.width * scale);
        const targetH = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, targetW, targetH);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  // File Upload Initiator -> Auto-EXIF, Auto-Trim, DPI Check, Auto-Fit Scale ~75%
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          const rawOriginal = reader.result;
          const img = new Image();
          img.onload = () => {
            // Draw to canvas to respect EXIF orientation and allow pixel manipulation
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (ctx) ctx.drawImage(img, 0, 0);

            // Auto-trim empty / uniform border pixels
            const trimmedCanvas = autoTrimCanvas(canvas);
            const trimmedDataUrl = trimmedCanvas.toDataURL("image/png");

            // DPI / quality check
            const isLow = img.width < 700 || img.height < 700;

            // Auto-scale ~75% of printable chest area
            const autoScale = calculateAutoFitScale(trimmedCanvas.width, trimmedCanvas.height, 200, 200, 0.75);

            setUploadedFileName(fileName);
            setPreviewRawImage(rawOriginal);
            setTrimmedBaseImage(trimmedDataUrl);
            setPreviewCleanImage(trimmedDataUrl);
            setAiCutoutImage(null);
            setCompareTab("cutout");
            setBgCleaned(false);
            setIsBrushMode(false);
            maskBytesRef.current = null;
            originalCanvasRef.current = canvas;
            brushHistoryRef.current = [];
            brushFutureRef.current = [];
            setImageDims({ width: img.width, height: img.height });
            setIsLowDpi(isLow);
            setAutoFittedScale(autoScale);
            setIsCleaningBg(false);
            setIsUploadModalOpen(true);
          };
          img.src = rawOriginal;
        }
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  };

  // Run IS-Net AI Background Removal (100% in-browser, WebWorker + WebGPU/WASM)
  const handleRunISNetBgRemoval = async () => {
    if (!previewRawImage) return;
    setIsCleaningBg(true);
    setCleaningStatusText("Model hazırlanır…");
    setDownloadProgress(0);

    try {
      const result = await removeBackgroundWithISNet(previewRawImage, (pct, status) => {
        setDownloadProgress(pct);
        setCleaningStatusText(status);
      });

      maskBytesRef.current = new Uint8ClampedArray(result.maskBytes);
      originalCanvasRef.current = result.originalCanvas;
      brushHistoryRef.current = [new Uint8ClampedArray(result.maskBytes)];
      brushFutureRef.current = [];

      setAiCutoutImage(result.processedDataUrl);
      setPreviewCleanImage(result.processedDataUrl);
      setBgCleaned(true);
      setCompareTab("cutout");
    } catch (err: any) {
      console.error("IS-Net bg removal error:", err);
      alert("Fon silinmədi. Yenidən cəhd edin və ya fırça ilə əl ilə təmizləyin");
    } finally {
      setIsCleaningBg(false);
    }
  };

  // Reset to original image
  const handleResetBg = () => {
    setPreviewCleanImage(trimmedBaseImage || previewRawImage);
    setAiCutoutImage(null);
    setBgCleaned(false);
    setCompareTab("original");
    setIsBrushMode(false);
    maskBytesRef.current = null;
    brushHistoryRef.current = [];
    brushFutureRef.current = [];
  };

  // Manual Brush Refinement Helpers
  const renderBrushCanvas = useCallback(() => {
    const canvas = brushCanvasRef.current;
    const origCanvas = originalCanvasRef.current;
    const mask = maskBytesRef.current;
    if (!canvas || !origCanvas || !mask) return;

    const w = origCanvas.width;
    const h = origCanvas.height;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const origCtx = origCanvas.getContext("2d");
    if (!origCtx) return;
    const imgData = origCtx.getImageData(0, 0, w, h);
    const data = imgData.data;

    for (let i = 0; i < mask.length; i++) {
      data[i * 4 + 3] = mask[i];
    }

    ctx.putImageData(imgData, 0, 0);
  }, []);

  const applyBrushStrokeAt = (clientX: number, clientY: number) => {
    const canvas = brushCanvasRef.current;
    const mask = maskBytesRef.current;
    if (!canvas || !mask) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const imgX = (clientX - rect.left) * scaleX;
    const imgY = (clientY - rect.top) * scaleY;
    const radius = Math.max(2, brushSize * (canvas.width / 400));
    const r2 = radius * radius;

    const w = canvas.width;
    const h = canvas.height;
    const minX = Math.max(0, Math.floor(imgX - radius));
    const maxX = Math.min(w - 1, Math.ceil(imgX + radius));
    const minY = Math.max(0, Math.floor(imgY - radius));
    const maxY = Math.min(h - 1, Math.ceil(imgY + radius));

    const targetVal = brushTool === "restore" ? 255 : 0;

    for (let py = minY; py <= maxY; py++) {
      for (let px = minX; px <= maxX; px++) {
        const d2 = (px - imgX) * (px - imgX) + (py - imgY) * (py - imgY);
        if (d2 <= r2) {
          mask[py * w + px] = targetVal;
        }
      }
    }

    renderBrushCanvas();
  };

  const handleBrushMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isPaintingRef.current = true;
    if (maskBytesRef.current) {
      brushHistoryRef.current.push(new Uint8ClampedArray(maskBytesRef.current));
      if (brushHistoryRef.current.length > 20) brushHistoryRef.current.shift();
      brushFutureRef.current = [];
    }
    applyBrushStrokeAt(e.clientX, e.clientY);
  };

  const handleBrushMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPaintingRef.current) return;
    applyBrushStrokeAt(e.clientX, e.clientY);
  };

  const handleBrushMouseUp = () => {
    isPaintingRef.current = false;
  };

  const handleBrushTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length !== 1) return;
    isPaintingRef.current = true;
    if (maskBytesRef.current) {
      brushHistoryRef.current.push(new Uint8ClampedArray(maskBytesRef.current));
      if (brushHistoryRef.current.length > 20) brushHistoryRef.current.shift();
      brushFutureRef.current = [];
    }
    const touch = e.touches[0];
    applyBrushStrokeAt(touch.clientX, touch.clientY);
  };

  const handleBrushTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isPaintingRef.current || e.touches.length !== 1) return;
    const touch = e.touches[0];
    applyBrushStrokeAt(touch.clientX, touch.clientY);
  };

  const handleBrushTouchEnd = () => {
    isPaintingRef.current = false;
  };

  const handleOpenBrushMode = () => {
    if (!maskBytesRef.current || !originalCanvasRef.current) return;
    setIsBrushMode(true);
    setTimeout(() => {
      renderBrushCanvas();
    }, 50);
  };

  const handleApplyBrushChanges = () => {
    if (!originalCanvasRef.current || !maskBytesRef.current) {
      setIsBrushMode(false);
      return;
    }
    const finalCanvas = applyMaskWithAntiHalo(originalCanvasRef.current, maskBytesRef.current, true);
    const updatedUrl = finalCanvas.toDataURL("image/png");
    setPreviewCleanImage(updatedUrl);
    setAiCutoutImage(updatedUrl);
    setCompareTab("cutout");
    setIsBrushMode(false);
  };

  const handleUndoBrush = () => {
    if (brushHistoryRef.current.length === 0 || !maskBytesRef.current) return;
    const prev = brushHistoryRef.current.pop()!;
    brushFutureRef.current.push(new Uint8ClampedArray(maskBytesRef.current));
    maskBytesRef.current = prev;
    renderBrushCanvas();
  };

  const handleRedoBrush = () => {
    if (brushFutureRef.current.length === 0 || !maskBytesRef.current) return;
    const next = brushFutureRef.current.pop()!;
    brushHistoryRef.current.push(new Uint8ClampedArray(maskBytesRef.current));
    maskBytesRef.current = next;
    renderBrushCanvas();
  };

  // Confirm image placement from modal onto the garment (Auto-fit ~75% centered at posX: 0, posY: -30)
  const handleConfirmImageUpload = () => {
    const finalImage = previewCleanImage || previewRawImage;
    if (finalImage) {
      updateCurrentDesign({
        uploadedImage: finalImage,
        originalImage: previewRawImage,
        scale: autoFittedScale || 1.0,
        posX: 0,
        posY: -30,
        textScale: 1.0,
        textPosX: 0,
        textPosY: 55,
      });
    }
    setIsUploadModalOpen(false);
  };

  const hasFront = Boolean(designs.front.uploadedImage || designs.front.customText.trim());
  const hasBack = Boolean(designs.back.uploadedImage || designs.back.customText.trim());
  const hasLeftSleeve = Boolean(designs.leftSleeve.uploadedImage || designs.leftSleeve.customText.trim());
  const hasRightSleeve = Boolean(designs.rightSleeve.uploadedImage || designs.rightSleeve.customText.trim());

  let printTypeLabel = "Çapsız (Sadə)";
  let totalPrice = selectedGarment.basePrice;

  if (hasFront && hasBack) {
    printTypeLabel = "İki Tərəf DTF Çap";
    totalPrice = selectedGarment.twoSidePrice;
  } else if (hasFront || hasBack) {
    printTypeLabel = "Tək Tərəf DTF Çap";
    totalPrice = selectedGarment.oneSidePrice;
  }

  // Sleeve extra pricing
  const sleeveUnitCost = selectedGarment.sleevePrice || 1;
  if (hasLeftSleeve) totalPrice += sleeveUnitCost;
  if (hasRightSleeve) totalPrice += sleeveUnitCost;

  const printServiceCost = totalPrice - selectedGarment.basePrice;

  const resetPosition = () => {
    updateCurrentDesign({
      scale: 1.0,
      posX: 0,
      posY: -35,
      rotation: 0,
      textScale: 1.0,
      textPosX: 0,
      textPosY: 55,
      textRotation: 0,
    });
  };

  // Add to Bag
  const handleAddToCart = async () => {
    setIsAdding(true);
    playAddToCartSound();

    const placementData = {
      productId: selectedGarment.id,
      productName: selectedGarment.name,
      category: selectedGarment.category,
      color: selectedColor.name,
      colorHex: selectedColor.hex,
      size: selectedSize,
      price: totalPrice,
      printType: printTypeLabel,
      printArea: { widthCm: 30, heightCm: 40 },
      surfaces: {
        front: hasFront ? {
          view: "front",
          posX: designs.front.posX,
          posY: designs.front.posY,
          scale: designs.front.scale,
          rotation: designs.front.rotation,
          customText: designs.front.customText,
          textColor: designs.front.textColor,
          fontFamily: designs.front.fontFamily,
          hasArtwork: Boolean(designs.front.uploadedImage),
        } : null,
        back: hasBack ? {
          view: "back",
          posX: designs.back.posX,
          posY: designs.back.posY,
          scale: designs.back.scale,
          rotation: designs.back.rotation,
          customText: designs.back.customText,
          textColor: designs.back.textColor,
          fontFamily: designs.back.fontFamily,
          hasArtwork: Boolean(designs.back.uploadedImage),
        } : null,
        leftSleeve: hasLeftSleeve ? {
          view: "leftSleeve",
          posX: designs.leftSleeve.posX,
          posY: designs.leftSleeve.posY,
          scale: designs.leftSleeve.scale,
          rotation: designs.leftSleeve.rotation,
          customText: designs.leftSleeve.customText,
          hasArtwork: Boolean(designs.leftSleeve.uploadedImage),
        } : null,
        rightSleeve: hasRightSleeve ? {
          view: "rightSleeve",
          posX: designs.rightSleeve.posX,
          posY: designs.rightSleeve.posY,
          scale: designs.rightSleeve.scale,
          rotation: designs.rightSleeve.rotation,
          customText: designs.rightSleeve.customText,
          hasArtwork: Boolean(designs.rightSleeve.uploadedImage),
        } : null,
      },
    };

    const originalImg =
      designs.front.originalImage ||
      designs.back.originalImage ||
      designs.leftSleeve.originalImage ||
      designs.rightSleeve.originalImage ||
      "";

    const processedImg =
      designs.front.uploadedImage ||
      designs.back.uploadedImage ||
      designs.leftSleeve.uploadedImage ||
      designs.rightSleeve.uploadedImage ||
      "";

    const previewImage =
      designs.front.uploadedImage ||
      designs.back.uploadedImage ||
      designs.leftSleeve.uploadedImage ||
      designs.rightSleeve.uploadedImage ||
      "/images/studio/tshirt/white-front-shirt.png";

    const customData = {
      garmentType: selectedGarment.name,
      garmentColor: selectedColor.name,
      size: selectedSize,
      price: totalPrice,
      originalImage: originalImg,
      processedImage: processedImg,
      previewImage: previewImage,
      placementData: placementData,
      frontDesign: {
        hasDesign: hasFront,
        ...designs.front,
      },
      backDesign: {
        hasDesign: hasBack,
        ...designs.back,
      },
      leftSleeveDesign: {
        hasDesign: hasLeftSleeve,
        ...designs.leftSleeve,
      },
      rightSleeveDesign: {
        hasDesign: hasRightSleeve,
        ...designs.rightSleeve,
      },
    };

    addItem({
      id: `pod_${Date.now()}_${selectedGarment.id}_${selectedSize}`,
      productId: selectedGarment.id,
      name: `Fərdi Çap: ${selectedGarment.name}`,
      price: totalPrice,
      size: selectedSize,
      color: selectedColor.name,
      image: previewImage,
      type: "custom",
      customDesignPreview: previewImage,
      customData: customData,
      stockQuantity: 99,
    });

    try {
      await fetch("/api/store/pod-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          garmentType: selectedGarment.name,
          garmentColor: selectedColor.name,
          size: selectedSize,
          price: totalPrice,
          originalImage: originalImg,
          processedImage: processedImg,
          placementData: placementData,
          previewImage: previewImage,
          customData,
        }),
      });
    } catch (e) {
      console.warn("POD save notification:", e);
    }

    setTimeout(() => {
      setIsAdding(false);
      openCart();
    }, 400);
  };

  // Surfaces definition
  const surfacesList: { id: StudioSurface; label: string; icon: string }[] = [
    { id: "front", label: "Ön", icon: "/images/studio/thumb-front.png" },
    { id: "back", label: "Arxa", icon: "/images/studio/thumb-back.png" },
    { id: "leftSleeve", label: "Sol qol", icon: "/images/studio/thumb-left.png" },
    { id: "rightSleeve", label: "Sağ qol", icon: "/images/studio/thumb-right.png" },
  ];

  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] text-[#111827] pt-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header (Clean Luxury Store Branding) */}
        <div className="py-6 border-b border-stone-200/80 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-800 text-xs font-semibold uppercase tracking-wider mb-3">
              <Palette size={14} />
              <span>Fərdi Dizayn Studiyası</span>
            </div>
            <h1 className="font-eb-garamond text-3xl sm:text-5xl font-normal text-stone-900 tracking-wide">
              Öz dizaynını <span className="italic font-normal">yarat</span>
            </h1>
            <p className="text-xs text-stone-600 mt-2 max-w-xl">
              İstədiyiniz loqo, qrafika və ya mətni seçin. Xalis pambıq geyimlər üzərinə yüksək dəqiqlikli DTG çap edərək çatdıraq.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={resetPosition}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:border-stone-400 transition active:scale-95 shadow-2xs"
            >
              <RotateCcw size={14} className="text-stone-600" />
              <span>Tənzimləmələri Sıfırla</span>
            </button>
          </div>
        </div>

        {/* Studio Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
          
          {/* Left Canvas Column: Stretches full vertical height so sticky remains pinned during entire scroll */}
          <div id="garment-canvas-section" className="lg:col-span-7 relative">
            <div className="lg:sticky lg:top-24 flex flex-col items-center w-full">
              
              {/* View Switcher: Equal-width single-line tabs + horizontal scroll on mobile */}
              <div className="w-full max-w-[500px] flex items-center justify-between gap-2 mb-3">
                <div className="flex-1 flex items-stretch gap-1 bg-stone-200/80 p-1 rounded-2xl border border-stone-300/80 overflow-x-auto scrollbar-none">
                  {surfacesList.map((s) => {
                    const isSleeve = s.id === "leftSleeve" || s.id === "rightSleeve";
                    const isAvailable = (garmentCategory === "tshirt" || garmentCategory === "oversize") || !isSleeve;
                    if (!isAvailable) return null;

                    const isActive = viewSide === s.id;
                    const hasSurfaceDesign = Boolean(
                      designs[s.id].uploadedImage || designs[s.id].customText.trim()
                    );

                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setViewSide(s.id)}
                        className={`flex-1 min-w-[70px] sm:min-w-0 py-2 px-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-1.5 ${
                          isActive
                            ? "bg-stone-900 text-white shadow-xs font-bold ring-1 ring-stone-900"
                            : "text-stone-700 hover:text-stone-900 hover:bg-white/50"
                        }`}
                      >
                        <img src={s.icon} alt="" className="w-4 h-4 object-contain shrink-0 opacity-90" />
                        <span className="truncate leading-none">{s.label}</span>
                        {hasSurfaceDesign && (
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="shrink-0 flex items-center">
                  <button
                    type="button"
                    onClick={() => setIsPhotoRoom3DOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs active:scale-95 group cursor-pointer"
                    title="3D Canlı Baxış pəncərəsini aç"
                  >
                    <Eye size={15} className="text-[#e8c98a]" />
                    <span className="hidden sm:inline">3D Canlı Baxış</span>
                    <span className="sm:hidden">3D</span>
                  </button>
                </div>
              </div>

              {/* Realistic Interactive Photorealistic Mockup Canvas with Dashed Print Area */}
              <GarmentCanvas
                garmentId={selectedGarment.id}
                side={viewSide}
                colorKey={selectedColor.key}
                colorHex={selectedColor.hex}
                uploadedImage={currentDesign.uploadedImage}
                customText={currentDesign.customText}
                textColor={currentDesign.textColor}
                fontFamily={currentDesign.fontFamily}
                scale={currentDesign.scale}
                posX={currentDesign.posX}
                posY={currentDesign.posY}
                rotation={currentDesign.rotation}
                textScale={currentDesign.textScale ?? 1.0}
                textPosX={currentDesign.textPosX ?? 0}
                textPosY={currentDesign.textPosY ?? 55}
                textRotation={currentDesign.textRotation ?? 0}
                onChangeTransform={(newTransform) => updateCurrentDesign(newTransform)}
                onClearImage={() => updateCurrentDesign({ uploadedImage: null })}
                onClearText={() => updateCurrentDesign({ customText: "" })}
                onRequestUpload={() => fileInputRef.current?.click()}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={(history[viewSide] || []).length > 0}
                canRedo={(future[viewSide] || []).length > 0}
              />

              {/* Helper Hint */}
              <p className="text-[11px] text-stone-500 mt-3 text-center">
                💡 <em>Həm şəkli, həm də mətni köynəyin üzərində birbaşa siçanla istədiyiniz yerə sərbəst sürüşdürə bilərsiniz.</em>
              </p>

              {/* Garment Details & Quality Assurance Note */}
              <div className="w-full max-w-[500px] mt-3 flex items-center justify-between text-xs text-stone-600 px-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-2xs"
                    style={{ backgroundColor: selectedColor.hex }}
                  />
                  <span className="font-semibold text-stone-900">
                    {selectedGarment.name} ({selectedColor.name}) ·{" "}
                    {surfacesList.find((s) => s.id === viewSide)?.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-800 font-semibold">
                  <CheckCircle2 size={15} />
                  <span>Ultra HD DTG Çap</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Controls Panel (SCROLL OLUNAN HİSSƏ) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Base Garment Selector (Only Real Apparel: T-shirt, Oversize, Polo, Hody, Yarımzamok, Sviter, Şalvar, Kepka) */}
            <div className="bg-white border border-stone-200/90 rounded-3xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 block">
                  1. Baza Geyim Modelini Seçin
                </label>
                <span className="text-[10px] text-stone-500 font-medium">{GARMENTS.length} Model</span>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {GARMENTS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setSelectedGarment(g);
                      if (g.category !== "tshirt" && g.category !== "oversize" && (viewSide === "leftSleeve" || viewSide === "rightSleeve")) {
                        setViewSide("front");
                      }
                    }}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      selectedGarment.id === g.id
                        ? "border-stone-900 bg-stone-50 text-stone-900 shadow-xs ring-1 ring-stone-900/10"
                        : "border-stone-200 bg-white text-stone-700 hover:text-stone-900 hover:border-stone-300"
                    }`}
                  >
                    <div className="pr-2">
                      <div className="text-xs font-bold text-stone-900">{g.name}</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">{g.description}</div>
                      <div className="text-[10px] text-stone-600 font-medium mt-1 flex flex-wrap gap-x-2">
                        <span>Çapsız: {formatPrice(g.basePrice)}</span>
                        <span>·</span>
                        <span>Kiçik çap: {formatPrice(g.smallPrintPrice)}</span>
                        <span>·</span>
                        <span>İki tərəf: {formatPrice(g.twoSidePrice)}</span>
                      </div>
                    </div>
                    <div className="text-right pl-2 shrink-0">
                      <span className="text-xs font-extrabold text-stone-900 block">
                        {formatPrice(g.oneSidePrice)}
                      </span>
                      <span className="text-[9px] text-stone-500 block uppercase">1 tərəf çap</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Color Selector (Correct Visual Matching for All Colors) */}
            <div className="bg-white border border-stone-200/90 rounded-3xl p-5 space-y-3 shadow-xs">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 block">
                2. Geyimin Rəngi: <strong className="text-stone-900">{selectedColor.name}</strong>
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      setSelectedColor(c);
                      const isDark = c.key === "black" || c.key === "darkblue" || c.key === "green";
                      if (isDark) {
                        setDesigns((prev) => ({
                          ...prev,
                          [viewSide]: {
                            ...prev[viewSide],
                            textColor: prev[viewSide].textColor === "#111827" ? "#FFFFFF" : prev[viewSide].textColor,
                          },
                        }));
                      }
                    }}
                    className={`w-9 h-9 rounded-xl border-2 transition-all flex items-center justify-center ${
                      selectedColor.name === c.name
                        ? "border-stone-900 ring-2 ring-stone-900/20 scale-105"
                        : "border-stone-300 opacity-80 hover:opacity-100 hover:border-stone-500"
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {selectedColor.name === c.name && (
                      <Check
                        size={14}
                        className={
                          c.hex === "#FFFFFF" || c.hex === "#93C5FD" || c.hex === "#D7CEC7"
                            ? "text-black"
                            : "text-white"
                        }
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Upload Artwork or Select Preset */}
            <div className="bg-white border border-stone-200/90 rounded-3xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                  3. Şəkli və ya Loqonu Yüklə ({surfacesList.find((s) => s.id === viewSide)?.label})
                </label>
                {currentDesign.uploadedImage && (
                  <button
                    type="button"
                    onClick={() => updateCurrentDesign({ uploadedImage: null })}
                    className="text-[11px] text-red-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Trash2 size={12} />
                    <span>Şəkli Sil</span>
                  </button>
                )}
              </div>

              {/* Upload Input Box */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/svg+xml, image/webp"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 hover:border-stone-900 bg-stone-50 hover:bg-stone-100/70 rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group relative overflow-hidden"
              >
                <div className="p-2.5 rounded-full bg-white text-stone-700 group-hover:text-stone-900 border border-stone-200 transition-all">
                  <Upload size={18} />
                </div>
                <div className="text-xs font-bold text-stone-900">
                  Şəkil və ya Loqo faylını bura atın və ya klikləyin
                </div>
                <div className="text-[10px] text-stone-500 flex items-center gap-1">
                  <Sparkles size={11} className="text-stone-700" />
                  <span>Seçdikdən sonra önbaxış və AI fon təmizləmə açılacaq</span>
                </div>
              </div>

              {/* Preset Graphics */}
              <div>
                <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block mb-2">
                  Və ya hazır qrafiklərdən seç:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => updateCurrentDesign({ uploadedImage: p.url, originalImage: p.originalUrl })}
                      className={`p-2 rounded-xl bg-stone-50 hover:bg-stone-100 border transition flex flex-col items-center gap-1.5 ${
                        currentDesign.uploadedImage === p.url
                          ? "border-stone-900 ring-2 ring-stone-900/20"
                          : "border-stone-200"
                      }`}
                    >
                      <img src={p.url} alt={p.name} className="w-12 h-12 object-contain rounded-lg" />
                      <span className="text-[9px] font-semibold text-stone-800 truncate w-full text-center">
                        {p.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Custom Text Generator */}
            <div className="bg-white border border-stone-200/90 rounded-3xl p-5 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 block">
                  4. Xüsusi Mətn Əlavə Et ({surfacesList.find((s) => s.id === viewSide)?.label})
                </label>
                {currentDesign.customText.trim() && (
                  <button
                    type="button"
                    onClick={() => updateCurrentDesign({ customText: "" })}
                    className="text-[10px] text-red-600 hover:text-red-700 font-semibold transition"
                  >
                    Mətni sil
                  </button>
                )}
              </div>
              <input
                type="text"
                value={currentDesign.customText}
                onChange={(e) => updateCurrentDesign({ customText: e.target.value })}
                placeholder="Məs: HORVVALLE ATELIER..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 focus:bg-white font-medium"
              />

              {/* Text Positioning Quick Nudge Toolbar */}
              {currentDesign.customText.trim() && (
                <div className="p-3 bg-stone-50/90 rounded-2xl border border-stone-200/90 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-stone-700">
                    <span>Mətnin Mövqeyi & Ölçüsü:</span>
                    <span className="text-[10px] text-stone-400 font-normal">
                      (və ya köynək üzərində birbaşa sürüşdürün)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() =>
                        updateCurrentDesign({
                          textPosY: (currentDesign.textPosY ?? 55) - 15,
                        })
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-stone-400 text-stone-800 text-[11px] font-semibold transition active:scale-95 shadow-2xs flex items-center gap-1"
                      title="Mətni yuxarıya, şəklə daha yaxın çək"
                    >
                      <span>⬆️ Şəklə yaxınlaşdır</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateCurrentDesign({
                          textPosY: (currentDesign.textPosY ?? 55) + 15,
                        })
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-stone-400 text-stone-800 text-[11px] font-semibold transition active:scale-95 shadow-2xs flex items-center gap-1"
                      title="Mətni aşağıya çək"
                    >
                      <span>⬇️ Aşağı çək</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateCurrentDesign({
                          textPosX: (currentDesign.textPosX ?? 0) - 15,
                        })
                      }
                      className="px-2 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-stone-400 text-stone-800 text-[11px] font-semibold transition active:scale-95 shadow-2xs"
                      title="Sola sürüşdür"
                    >
                      ⬅️
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateCurrentDesign({
                          textPosX: (currentDesign.textPosX ?? 0) + 15,
                        })
                      }
                      className="px-2 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-stone-400 text-stone-800 text-[11px] font-semibold transition active:scale-95 shadow-2xs"
                      title="Sağa sürüşdür"
                    >
                      ➡️
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateCurrentDesign({
                          textPosX: 0,
                          textPosY: currentDesign.uploadedImage ? 55 : 0,
                          textScale: 1.0,
                          textRotation: 0,
                        })
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-stone-400 text-stone-800 text-[11px] font-semibold transition active:scale-95 shadow-2xs"
                      title="Mərkəzə sıfırla"
                    >
                      Mərkəz
                    </button>
                    <div className="ml-auto flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateCurrentDesign({
                            textScale: Math.max(0.4, (currentDesign.textScale ?? 1.0) - 0.1),
                          })
                        }
                        className="w-7 h-7 rounded-lg bg-white border border-stone-200 hover:border-stone-400 text-stone-800 text-xs font-bold transition flex items-center justify-center shadow-2xs"
                        title="Yazını kiçilt"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateCurrentDesign({
                            textScale: Math.min(2.5, (currentDesign.textScale ?? 1.0) + 0.1),
                          })
                        }
                        className="w-7 h-7 rounded-lg bg-white border border-stone-200 hover:border-stone-400 text-stone-800 text-xs font-bold transition flex items-center justify-center shadow-2xs"
                        title="Yazını böyüt"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">Şrift:</span>
                  <CustomDropdown
                    options={[
                      { id: "Inter", label: "Inter (Sadə & Təmiz)" },
                      { id: "Bebas Neue", label: "Bebas Neue (Böyük Hərflər)" },
                      { id: "serif", label: "Serif (Klassik Eleqant)" },
                    ]}
                    value={currentDesign.fontFamily}
                    onChange={(val) => updateCurrentDesign({ fontFamily: val })}
                    className="w-full"
                  />
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">Mətn Rəngi:</span>
                  <div className="flex items-center gap-2 pt-1">
                    {["#FFFFFF", "#E6C280", "#111827", "#2563EB", "#DC2626"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => updateCurrentDesign({ textColor: c })}
                        className={`w-6 h-6 rounded-full border transition-all ${
                          currentDesign.textColor === c ? "ring-2 ring-stone-900 scale-110" : "border-stone-300"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Size Selection & Action */}
            <div className="bg-white border border-stone-200/90 rounded-3xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Ölçü Seçin:
                </label>
                <span className="text-xs text-stone-600">
                  Seçilmiş: <strong className="text-stone-900">{selectedSize}</strong>
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {["S", "M", "L", "XL", "XXL"].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${
                      selectedSize === sz
                        ? "bg-stone-900 text-white shadow-xs scale-105"
                        : "bg-stone-50 border border-stone-200 text-stone-700 hover:border-stone-400 hover:text-stone-900"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="pt-3 border-t border-stone-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Baza Geyim (Çapsız):</span>
                  <span className="font-bold text-stone-900">{formatPrice(selectedGarment.basePrice)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>DTF Çap ({printTypeLabel}):</span>
                  <span className="font-bold text-stone-900">
                    {printServiceCost > 0 ? `+${formatPrice(printServiceCost)}` : "Çapsız (0 ₼)"}
                  </span>
                </div>
                <div className="flex justify-between text-base font-normal text-stone-900 pt-2 border-t border-stone-100">
                  <span>Ümumi Qiymət:</span>
                  <span className="text-lg font-normal text-stone-900">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full py-4 rounded-full bg-stone-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md active:scale-98 disabled:opacity-50"
              >
                {isAdding ? (
                  <span>Səbətə Əlavə Edilir...</span>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    <span>Fərdi Geyimi Səbətə At — {formatPrice(totalPrice)}</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* ŞƏKLİ YOXLA MODAL — HORVVALLE ATELIER LUXURY BESPOKE DESIGN */}
      {/* ========================================================================= */}
      {isUploadModalOpen && (
        <div
          className="fixed inset-0 z-[100] bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => {
            if (!isCleaningBg) setIsUploadModalOpen(false);
          }}
        >
          <div
            className="bg-[#FCFAF7] rounded-3xl max-w-lg w-full p-4 sm:p-5 shadow-2xl border border-stone-200/90 space-y-3 relative overflow-hidden my-auto max-h-[94vh] flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient gold glow */}
            <div className="absolute -top-20 -right-20 w-44 h-44 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="text-center space-y-1 relative pr-6">
              {!isCleaningBg && (
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="absolute -top-1 -right-1 p-1.5 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 transition cursor-pointer"
                  title="Bağla"
                >
                  <X size={16} />
                </button>
              )}

              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                {isBrushMode ? "Əl ilə dəqiqləşdirmə" : "Şəkli yoxla"}
              </h2>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-tight">
                {isBrushMode
                  ? "Fırça ilə silinən hissələri bərpa edin və ya qalan fonu silin"
                  : imageDims.width > 0
                  ? `${imageDims.width}×${imageDims.height}px • ${uploadedFileName || "Dizayn"}`
                  : "Kənarlar avtomatik kəsildi. Çap üçün fonu AI ilə silə bilərsiniz."}
              </p>
            </div>

            {/* BRUSH MODE INTERFACE */}
            {isBrushMode ? (
              <div className="space-y-3">
                {/* Brush Toolbar */}
                <div className="bg-stone-100 p-2.5 rounded-2xl border border-stone-200/90 flex flex-wrap items-center justify-between gap-2">
                  {/* Tool Selection */}
                  <div className="flex items-center gap-1 bg-stone-200/80 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setBrushTool("restore")}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                        brushTool === "restore"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-stone-700 hover:text-stone-900"
                      }`}
                    >
                      <Paintbrush size={14} />
                      <span>Bərpa et</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBrushTool("erase")}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                        brushTool === "erase"
                          ? "bg-rose-600 text-white shadow-xs"
                          : "text-stone-700 hover:text-stone-900"
                      }`}
                    >
                      <Eraser size={14} />
                      <span>Sil</span>
                    </button>
                  </div>

                  {/* Brush Size Slider */}
                  <div className="flex items-center gap-2 flex-1 min-w-[130px] px-2">
                    <span className="text-[11px] text-stone-600 font-medium shrink-0">Ölçü: {brushSize}px</span>
                    <input
                      type="range"
                      min={6}
                      max={70}
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-full accent-stone-900 h-1.5 bg-stone-300 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Undo / Redo */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleUndoBrush}
                      className="p-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 hover:text-stone-900 hover:bg-stone-50 transition cursor-pointer"
                      title="Geri al"
                    >
                      <Undo2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={handleRedoBrush}
                      className="p-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 hover:text-stone-900 hover:bg-stone-50 transition cursor-pointer"
                      title="İrəli al"
                    >
                      <Redo2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Canvas Work Area */}
                <div className="relative w-full h-56 sm:h-64 rounded-2xl border border-stone-200 bg-[linear-gradient(45deg,#f1eee9_25%,transparent_25%),linear-gradient(-45deg,#f1eee9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1eee9_75%),linear-gradient(-45deg,transparent_75%,#f1eee9_75%)] bg-[size:16px_16px] bg-[#faf8f5] p-2 flex items-center justify-center overflow-hidden shadow-inner">
                  <canvas
                    ref={brushCanvasRef}
                    onMouseDown={handleBrushMouseDown}
                    onMouseMove={handleBrushMouseMove}
                    onMouseUp={handleBrushMouseUp}
                    onMouseLeave={handleBrushMouseUp}
                    onTouchStart={handleBrushTouchStart}
                    onTouchMove={handleBrushTouchMove}
                    onTouchEnd={handleBrushTouchEnd}
                    className="max-h-full max-w-full object-contain cursor-crosshair touch-none select-none drop-shadow-md"
                  />
                </div>

                {/* Brush Mode Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleApplyBrushChanges}
                    className="py-2.5 rounded-2xl bg-stone-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check size={14} />
                    <span>Tətbiq et</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsBrushMode(false)}
                    className="py-2.5 rounded-2xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold text-xs transition flex items-center justify-center cursor-pointer"
                  >
                    <span>Ləğv et</span>
                  </button>
                </div>
              </div>
            ) : (
              /* STANDARD PREVIEW & AI CONTROL INTERFACE */
              <div className="space-y-3">
                {/* Before/After Comparison Tabs (Visible once cutout is created) */}
                {bgCleaned && (
                  <div className="flex items-center justify-center gap-2 bg-stone-100 p-1 rounded-2xl border border-stone-200">
                    <button
                      type="button"
                      onClick={() => setCompareTab("cutout")}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        compareTab === "cutout"
                          ? "bg-white text-stone-900 shadow-xs border border-stone-200/80"
                          : "text-stone-500 hover:text-stone-800"
                      }`}
                    >
                      <Sparkles size={13} className="text-amber-600" />
                      <span>Fonsuz (AI)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompareTab("original")}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        compareTab === "original"
                          ? "bg-white text-stone-900 shadow-xs border border-stone-200/80"
                          : "text-stone-500 hover:text-stone-800"
                      }`}
                    >
                      <Eye size={13} />
                      <span>Orijinal</span>
                    </button>
                  </div>
                )}

                {/* Preview Box */}
                <div
                  className={`relative w-full h-44 sm:h-52 rounded-2xl border border-stone-200 p-2 flex items-center justify-center overflow-hidden shadow-inner ${
                    compareTab === "cutout" && bgCleaned
                      ? "bg-[linear-gradient(45deg,#f1eee9_25%,transparent_25%),linear-gradient(-45deg,#f1eee9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1eee9_75%),linear-gradient(-45deg,transparent_75%,#f1eee9_75%)] bg-[size:16px_16px] bg-[#faf8f5]"
                      : "bg-stone-50"
                  }`}
                >
                  {/* Corner Accents */}
                  <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-600/40 pointer-events-none" />
                  <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-600/40 pointer-events-none" />
                  <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-600/40 pointer-events-none" />
                  <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-600/40 pointer-events-none" />

                  {/* Status Badge */}
                  <div className="absolute top-2.5 right-2.5 z-10">
                    {bgCleaned ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-bold tracking-wider uppercase shadow-xs flex items-center gap-1">
                        <Check size={11} /> {compareTab === "cutout" ? "Şəffaf Fon" : "Orijinal"}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-stone-900/80 text-white text-[10px] font-semibold tracking-wider uppercase shadow-xs">
                        Avto-Kəsilmiş
                      </span>
                    )}
                  </div>

                  {/* Display Image */}
                  {(compareTab === "cutout" && previewCleanImage) ? (
                    <img
                      src={previewCleanImage}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain drop-shadow-md select-none transition-all duration-300"
                    />
                  ) : previewRawImage ? (
                    <img
                      src={previewRawImage}
                      alt="Original"
                      className="max-h-full max-w-full object-contain drop-shadow-md select-none transition-all duration-300"
                    />
                  ) : (
                    <div className="text-xs text-stone-400">Şəkil tapılmadı</div>
                  )}

                  {/* Processing Overlay with Progress Bar */}
                  {isCleaningBg && (
                    <div className="absolute inset-0 bg-stone-950/75 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-4 text-center text-white space-y-2.5 animate-in fade-in duration-200">
                      <Loader2 size={32} className="animate-spin text-amber-400" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold tracking-wide">{cleaningStatusText}</p>
                        <p className="text-[10px] text-stone-300">İntellektual IS-Net neyron şəbəkəsi işləyir</p>
                      </div>

                      {/* Progress bar */}
                      <div className="w-48 bg-stone-800 rounded-full h-1.5 overflow-hidden border border-stone-700">
                        <div
                          className="bg-amber-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(5, downloadProgress)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-amber-300">{downloadProgress}%</span>
                    </div>
                  )}
                </div>

                {/* DPI / Image Quality Warning (Does NOT block background removal or confirmation) */}
                {isLowDpi && (
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-900 text-[11px] flex items-center gap-2 font-medium">
                    <span className="text-base shrink-0">⚠️</span>
                    <span>Şəkil ölçüsü kiçikdir ({imageDims.width}×{imageDims.height}px). Çapda dənəvərlik ola bilər (tövsiyə min. 1000px).</span>
                  </div>
                )}

                {/* AI Background Removal Control Box */}
                {!bgCleaned ? (
                  <div className="bg-stone-100/90 p-3 rounded-2xl border border-stone-200 space-y-2">
                    <button
                      type="button"
                      onClick={handleRunISNetBgRemoval}
                      disabled={isCleaningBg}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Wand2 size={15} />
                      <span>Fonu AI ilə sil</span>
                    </button>
                    <p className="text-[10px] text-stone-500 text-center leading-tight">
                      Süni intellekt əsas obyekti tanıyır və fonu avtomatik şəffaf edir (100% cihazınızda işləyir).
                    </p>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200/80 p-2.5 rounded-2xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>Fon uğurla təmizləndi</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleOpenBrushMode}
                        className="px-2.5 py-1.5 rounded-xl bg-white border border-emerald-300 text-stone-800 hover:bg-emerald-100/60 font-bold text-xs transition flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Paintbrush size={13} className="text-stone-700" />
                        <span>Fırça</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleResetBg}
                        className="px-2.5 py-1.5 rounded-xl bg-white border border-stone-300 text-stone-700 hover:text-stone-900 hover:bg-stone-100 font-bold text-xs transition flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <RotateCcw size={13} />
                        <span>Geri qaytar</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Final Action Buttons Stack */}
                <div className="space-y-2 pt-0.5">
                  <button
                    type="button"
                    onClick={handleConfirmImageUpload}
                    disabled={isCleaningBg}
                    className="w-full py-2.5 sm:py-3 rounded-2xl bg-stone-900 hover:bg-black active:scale-98 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <span>Davam et</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    disabled={isCleaningBg}
                    className="w-full py-2 rounded-2xl bg-stone-100 hover:bg-stone-200 active:scale-98 text-stone-700 font-semibold text-xs transition-all flex items-center justify-center cursor-pointer"
                  >
                    <span>Ləğv et</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Realistic Live Model Preview Modal (Torso e-commerce mockup) */}
      <LiveModelPreviewModal
        isOpen={isLiveModelOpen}
        onClose={() => setIsLiveModelOpen(false)}
        frontDesign={designs.front}
        backDesign={designs.back}
        initialSide={viewSide === "back" ? "back" : "front"}
        colorHex={selectedColor.hex}
        garmentName={selectedGarment.name}
        onApplyCorrection={(side, corrected) => {
          setDesigns((prev) => ({
            ...prev,
            [side]: { ...prev[side], ...corrected },
          }));
        }}
        onSwitchStudioSide={(side) => {
          setViewSide(side);
        }}
      />

      {/* 3D Canlı Baxış (360° Fəza) */}
      <PhotoRoom3DPreviewModal
        isOpen={isPhotoRoom3DOpen}
        onClose={() => setIsPhotoRoom3DOpen(false)}
        garmentId={selectedGarment.id}
        garmentName={selectedGarment.name}
        garmentCategory={garmentCategory}
        colorKey={selectedColor.key}
        colorHex={selectedColor.hex}
        designs={designs}
        currentSide={viewSide}
      />

      {/* ========================================================================= */}
      {/* MOBİL REAL-TIME DAİMİ GÖRÜNƏN GEYİM PREVIEW BAR (Mobile Sticky Top Stage) */}
      {/* ========================================================================= */}
      {showMobileMiniPreview && (
        <div className="fixed top-[56px] left-0 right-0 z-30 lg:hidden animate-in fade-in slide-in-from-top-3 duration-300 shadow-xl border-b border-stone-200/90 bg-[#FCFAF7]/95 backdrop-blur-md">
          {!isMobilePreviewCollapsed ? (
            <div className="p-2.5 sm:p-3 flex items-center gap-3">
              {/* Left: High-Clarity Live Garment Preview Stage */}
              <div
                onClick={() => {
                  document.getElementById("garment-canvas-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="relative w-28 h-28 xs:w-32 xs:h-32 sm:w-36 sm:h-36 aspect-square rounded-2xl bg-gradient-to-b from-[#F3F0EB] via-[#E8E5DC] to-[#DDD9CF] border border-stone-300/90 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-inner cursor-pointer active:scale-98 transition-transform group"
                title="Geyim kətanına qayıt"
              >
                {/* Stage ambient glow */}
                <div className="absolute inset-0 bg-radial from-white/70 via-transparent to-stone-400/20 pointer-events-none" />

                {/* Garment Base Mockup */}
                <img
                  src={getStudioGarmentImage(selectedGarment.id, selectedColor.key, viewSide)}
                  alt="Garment Preview"
                  className="w-full h-full object-contain pointer-events-none drop-shadow-md transition-all duration-300"
                />

                {/* Live Overlay Graphic */}
                {currentDesign.uploadedImage && (
                  <img
                    src={currentDesign.uploadedImage}
                    alt="Custom Artwork"
                    className="absolute pointer-events-none object-contain drop-shadow-sm transition-transform duration-200"
                    style={{
                      maxWidth: "48%",
                      maxHeight: "48%",
                      transform: `translate(${currentDesign.posX * 0.28}px, ${(currentDesign.posY - 10) * 0.28}px) scale(${currentDesign.scale}) rotate(${currentDesign.rotation}deg)`,
                    }}
                  />
                )}

                {/* Live Overlay Text */}
                {currentDesign.customText.trim() && (
                  <div
                    className="absolute pointer-events-none text-[8px] xs:text-[9px] font-bold uppercase truncate max-w-[80px] text-center drop-shadow-sm transition-transform duration-200"
                    style={{
                      color: currentDesign.textColor,
                      fontFamily: currentDesign.fontFamily,
                      transform: `translate(${(currentDesign.textPosX ?? 0) * 0.28}px, ${((currentDesign.textPosY ?? 55) - 10) * 0.28}px) scale(${currentDesign.textScale ?? 1.0}) rotate(${currentDesign.textRotation ?? 0}deg)`,
                    }}
                  >
                    {currentDesign.customText}
                  </div>
                )}

                {/* Tap to edit badge */}
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-full bg-stone-900/80 text-[8px] font-semibold text-white tracking-wider uppercase flex items-center gap-0.5 shadow-xs">
                  🔍 Kətan
                </span>
              </div>

              {/* Right: Live Info & Quick Side Switcher */}
              <div className="flex-1 min-w-0 flex flex-col justify-between h-28 xs:h-32 sm:h-36 py-0.5">
                {/* Garment Info & Price */}
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full border border-stone-300 shadow-2xs shrink-0"
                        style={{ backgroundColor: selectedColor.hex }}
                      />
                      <span className="text-xs font-bold text-stone-900 truncate">
                        {selectedGarment.name}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsMobilePreviewCollapsed(true)}
                      className="p-1 text-stone-400 hover:text-stone-700 shrink-0"
                      title="Yığcam rejimə keç"
                    >
                      <ChevronUp size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      {formatPrice(totalPrice)}
                    </span>
                    <span className="text-[10px] text-stone-500 font-medium">
                      {selectedColor.name} · {selectedSize}
                    </span>
                  </div>
                </div>

                {/* Surface Switcher Pills (Ön / Arxa / Sol / Sağ) */}
                <div className="flex items-center gap-1 bg-stone-200/80 p-1 rounded-full border border-stone-300/80 w-fit">
                  {surfacesList.map((s) => {
                    const isSleeve = s.id === "leftSleeve" || s.id === "rightSleeve";
                    const isAvailable = (garmentCategory === "tshirt" || garmentCategory === "oversize") || !isSleeve;
                    if (!isAvailable) return null;

                    const isActive = viewSide === s.id;
                    const hasSurfaceDesign = Boolean(
                      designs[s.id].uploadedImage || designs[s.id].customText.trim()
                    );

                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setViewSide(s.id)}
                        className={`px-2 xs:px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                          isActive
                            ? "bg-stone-900 text-white shadow-xs"
                            : "text-stone-700 hover:text-stone-900"
                        }`}
                      >
                        <span>{s.id === "front" ? "Ön" : s.id === "back" ? "Arxa" : s.id === "leftSleeve" ? "Sol" : "Sağ"}</span>
                        {hasSurfaceDesign && (
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Quick Actions Bar */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById("garment-canvas-section")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-wider transition active:scale-95 text-center shadow-xs"
                  >
                    Kətana Qayıt
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPhotoRoom3DOpen(true)}
                    className="py-1.5 px-2.5 rounded-xl bg-stone-900 hover:bg-black text-[#e8c98a] border border-[#3d3228] text-[10px] font-bold active:scale-95 transition flex items-center gap-1 shadow-xs cursor-pointer"
                    title="3D Canlı Baxış"
                  >
                    <Eye size={12} />
                    <span>3D Baxış</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Collapsed mini-strip mode */
            <div className="px-3 py-2 flex items-center justify-between gap-2">
              <div
                onClick={() => {
                  document.getElementById("garment-canvas-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center gap-2 min-w-0 cursor-pointer"
              >
                <div className="relative w-8 h-8 rounded-lg bg-stone-200 border border-stone-300 p-0.5 overflow-hidden shrink-0">
                  <img
                    src={getStudioGarmentImage(selectedGarment.id, selectedColor.key, viewSide)}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-stone-900 truncate">
                    {selectedGarment.name} · {selectedColor.name}
                  </div>
                  <div className="text-[10px] text-amber-700 font-semibold">
                    {formatPrice(totalPrice)} · {viewSide === "front" ? "Ön tərəf" : "Arxa tərəf"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMobilePreviewCollapsed(false)}
                  className="px-2.5 py-1 rounded-full bg-stone-900 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                >
                  <ChevronDown size={12} />
                  <span>Paltarı Göstər</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
