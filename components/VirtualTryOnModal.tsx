"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  X,
  Minus,
  Maximize2,
  Minimize2,
  Camera,
  Upload,
  User,
  Share2,
  ShoppingBag,
  RotateCcw,
  Sparkles,
  Check,
  SwitchCamera,
  Download,
  ExternalLink,
  Sliders,
  Layers,
} from "lucide-react";
import { useTryOn } from "@/context/TryOnContext";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";
import { translateColor } from "@/lib/translations";

export function VirtualTryOnModal() {
  const {
    isOpen,
    isMinimized,
    product,
    colorIndex,
    size,
    closeTryOn,
    toggleMinimize,
    setColorIndex,
  } = useTryOn();

  const { addItem } = useCart();
  const { formatProductPrice } = useCurrency();
  const { language } = useLanguage();

  // Try-on View Modes: "anywear" (default AI) | "camera" | "upload" | "model"
  const [viewMode, setViewMode] = useState<"anywear" | "camera" | "upload" | "model">("anywear");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Camera State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  // Captured snapshot
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);

  // Uploaded photo state
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Dynamic Cutout URL (automatically stripped of grey/white backdrops)
  const [transparentCutoutUrl, setTransparentCutoutUrl] = useState<string | null>(null);

  // Overlay Fitting Adjustments
  const [garmentScale, setGarmentScale] = useState(105); // 70 to 140
  const [garmentOffsetY, setGarmentOffsetY] = useState(10); // -100 to 100 px
  const [garmentOffsetX, setGarmentOffsetX] = useState(0); // -100 to 100 px
  const [garmentOpacity, setGarmentOpacity] = useState(100);
  const [blendMode, setBlendMode] = useState<"normal" | "multiply">("normal");
  const [showAdjustments, setShowAdjustments] = useState(false);

  // Feedback states
  const [addedToast, setAddedToast] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Active color & image
  const activeColor = product?.colors?.[colorIndex] || product?.colors?.[0] || {
    name: "Standart",
    hex: "#111111",
    image: product?.image || "/images/hero/black-tee.jpg",
  };

  const rawGarmentImage = activeColor.image || product?.image || "/images/hero/black-tee.jpg";

  // Automatically remove solid background from garment image in browser canvas
  useEffect(() => {
    if (!rawGarmentImage) return;

    // If it's already an explicit PNG cutout, use it directly
    if (rawGarmentImage.toLowerCase().endsWith(".png") && !rawGarmentImage.includes("_hd.jpg")) {
      setTransparentCutoutUrl(rawGarmentImage);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          setTransparentCutoutUrl(rawGarmentImage);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;

        // Sample top-left corner pixel as background baseline
        const bgR = d[0];
        const bgG = d[1];
        const bgB = d[2];

        // Is the background neutral grey/white?
        const isNeutral = Math.abs(bgR - bgG) < 18 && Math.abs(bgG - bgB) < 18;

        if (isNeutral && (bgR > 180 || bgR > 120)) {
          // Remove uniform backdrop with smooth edge falloff
          for (let i = 0; i < d.length; i += 4) {
            const r = d[i];
            const g = d[i + 1];
            const b = d[i + 2];
            const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
            if (dist < 28) {
              d[i + 3] = 0; // 100% transparent
            } else if (dist < 42) {
              d[i + 3] = Math.round(((dist - 28) / 14) * 255); // Soft antialiased edge
            }
          }
          ctx.putImageData(imgData, 0, 0);
          setTransparentCutoutUrl(canvas.toDataURL("image/png"));
        } else {
          setTransparentCutoutUrl(rawGarmentImage);
        }
      } catch (err) {
        setTransparentCutoutUrl(rawGarmentImage);
      }
    };
    img.onerror = () => {
      setTransparentCutoutUrl(rawGarmentImage);
    };
    img.src = rawGarmentImage;
  }, [rawGarmentImage]);

  const displayGarmentImage = transparentCutoutUrl || rawGarmentImage;

  // Launch official Decart Anywear Widget directly
  const handleLaunchDecartWidget = useCallback(() => {
    if (typeof window !== "undefined" && (window as any).DecartWidget) {
      try {
        (window as any).DecartWidget.open({
          image: rawGarmentImage,
          name: product?.name || "Horwalle Garment",
        });
        closeTryOn();
        return;
      } catch (e) {
        console.warn("DecartWidget.open error:", e);
      }
    }

    // Direct deep-link in specialized fitting window
    const targetUrl = `https://anywear.decart.ai/?product=${encodeURIComponent(
      product?.name || ""
    )}&image=${encodeURIComponent(rawGarmentImage)}`;
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  }, [rawGarmentImage, product, closeTryOn]);

  // Start Camera
  const startCamera = useCallback(async (mode: "user" | "environment" = facingMode) => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          language === "az"
            ? "Cihazınızda kamera dəstəklənmir və ya brauzer icazəsi verilməyib."
            : "Camera is not supported or permission denied."
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn("Camera start error:", err);
      setCameraActive(false);
      setCameraError(
        err.message ||
          (language === "az"
            ? "Kamera icazəsi verilmədi. Zəhmət olmasa brauzer sazlamalarında kameraya icazə verin."
            : "Camera access was denied. Please allow camera permissions in browser settings.")
      );
    }
  }, [facingMode, language]);

  // Stop Camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Manage camera lifecycle
  useEffect(() => {
    if (isOpen && !isMinimized && viewMode === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, isMinimized, viewMode, startCamera, stopCamera]);

  // Switch camera front/back
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedPhotoUrl(url);
      setViewMode("upload");
    }
  };

  // Take Snapshot from video canvas
  const handleTakeSnapshot = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (facingMode === "user") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const baseW = canvas.width * 0.60 * (garmentScale / 100);
        const baseH = (baseW * img.height) / img.width;
        const posX = (canvas.width - baseW) / 2 + garmentOffsetX;
        const posY = canvas.height * 0.26 + garmentOffsetY;

        ctx.globalAlpha = garmentOpacity / 100;
        ctx.drawImage(img, posX, posY, baseW, baseH);
        ctx.globalAlpha = 1.0;

        ctx.fillStyle = "rgba(0,0,0,0.65)";
        ctx.fillRect(16, canvas.height - 40, 240, 28);
        ctx.fillStyle = "#E6C280";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText("HORVVALLE · ANYWEAR TRY-ON", 26, canvas.height - 22);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
        setSnapshotUrl(dataUrl);
      };
      img.src = displayGarmentImage;
    } catch (e) {
      console.warn("Snapshot capture error:", e);
    }
  };

  // Add to cart directly from Try-On modal
  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: `${product.id}_${activeColor.name}_${size || "L"}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      internationalPrice: product.internationalPrice,
      size: size || "L",
      color: activeColor.name,
      image: activeColor.image || rawGarmentImage,
      type: "ready",
      stockQuantity: 99,
    });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2200);
  };

  // Share with a friend
  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "https://www.horwalle.com";
    const shareText = `${product?.name || "Horwalle Atelier"} Virtual Try-On · Əynimdə necə qaldığına bax: ${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Horwalle Virtual Try-On",
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (e) {}
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    } catch (e) {}
  };

  if (!isOpen || !product) return null;

  // Render Minimized Floating Dock
  if (isMinimized) {
    return (
      <div
        onClick={toggleMinimize}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-stone-900/95 text-white border border-stone-700/80 rounded-2xl p-2.5 pr-4 shadow-[0_20px_45px_rgba(0,0,0,0.5)] cursor-pointer hover:border-[#E6C280] transition-all hover:scale-105 backdrop-blur-xl group"
      >
        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black/60 border border-white/10 shrink-0">
          <Image
            src={displayGarmentImage}
            alt={product.name}
            fill
            className="object-contain p-1"
          />
          <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E6C280] animate-spin" style={{ animationDuration: "6s" }} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#E6C280]">
              Virtual Try-On
            </span>
          </div>
          <span className="text-xs font-semibold truncate max-w-[140px] text-white">
            {product.name}
          </span>
          <span className="text-[11px] text-stone-400 font-mono">
            {formatProductPrice(product)}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            closeTryOn();
          }}
          className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 ml-1"
          title="Bağla"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative flex flex-col bg-[#121012] text-white border border-stone-700/70 rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? "w-full h-full max-w-none rounded-none"
            : "w-full max-w-4xl h-[92vh] max-h-[820px]"
        }`}
      >
        {/* ========================================================
            HEADER BAR (Exact Anywear Style: Brand, Title, Min/Max/Close)
        ======================================================== */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-[#171517] backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#E6C280] to-[#F3DEB3] flex items-center justify-center shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-stone-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold tracking-tight text-white font-['Plus_Jakarta_Sans',sans-serif]">
                  Try-On ✦ Anywear
                </span>
                <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Real-Time AI</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={handleLaunchDecartWidget}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#E6C280] to-[#d4ab5d] text-stone-950 font-bold text-[11px] hover:brightness-105 transition-all shadow-sm mr-2"
              title="Decart Anywear AI pəncərəsini birbaşa aç"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Anywear AI Pəncərəsi</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={toggleMinimize}
              className="p-1.5 sm:p-2 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Miniatürləşdir"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="p-1.5 sm:p-2 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors hidden sm:inline-flex"
              title={isFullscreen ? "Kiçilt" : "Tam Ekran"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={closeTryOn}
              className="p-1.5 sm:p-2 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
              title="Bağla"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================
            SUB-HEADER: "YOUR TRY-ON" (Size buttons S/M/L/XL completely removed as requested)
        ======================================================== */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-2.5 bg-black/50 border-b border-white/5 shrink-0 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold tracking-widest uppercase text-stone-400">
              YOUR TRY-ON:
            </span>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="font-semibold text-white truncate max-w-[220px] sm:max-w-md">
                {product.name}
              </span>
              <span className="text-[#E6C280] font-mono font-bold">
                {formatProductPrice(product)}
              </span>
            </div>
          </div>

          {/* Color Swatches if product has multiple variants */}
          {product.colors && product.colors.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-stone-400 hidden sm:inline">
                Rəng:
              </span>
              <div className="flex items-center gap-1.5">
                {product.colors.map((c, idx) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setColorIndex(idx)}
                    title={translateColor(c.name, language)}
                    className={`w-6 h-6 rounded-full border transition-all ${
                      colorIndex === idx
                        ? "border-[#E6C280] scale-110 shadow-[0_0_10px_rgba(230,194,128,0.7)]"
                        : "border-white/20 opacity-70 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: c.hex || "#000" }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================
            MAIN VIEWPORT: REAL-TIME AI & SEAMLESS FITTING
        ======================================================== */}
        <div className="relative flex-grow flex flex-col md:flex-row overflow-hidden">
          {/* LEFT: Live Interactive Screen */}
          <div className="relative flex-grow bg-black flex items-center justify-center overflow-hidden min-h-[320px]">
            {/* View Mode 1: ANYWEAR AI LIVE NEURAL FITTING (Primary Recommended) */}
            {viewMode === "anywear" && (
              <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-radial from-stone-900 via-[#100e10] to-black">
                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#E6C280] to-[#FAF7F2] text-stone-950 flex items-center justify-center mb-5 shadow-[0_15px_35px_rgba(230,194,128,0.35)] animate-pulse" style={{ animationDuration: "3s" }}>
                  <Sparkles className="w-10 h-10" />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 font-['Plus_Jakarta_Sans',sans-serif]">
                  Anywear AI · Real-Time Neural Fitting
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 max-w-lg mb-7 leading-relaxed">
                  Decart AI Anywear texnologiyası kameranız qarşısında hərəkətlərinizi real vaxtda izləyərək köynəyi bədəninizə, qollarınıza və yaxanıza tam təbii şəkildə geyindirir.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full max-w-md">
                  <button
                    type="button"
                    onClick={handleLaunchDecartWidget}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#E6C280] via-[#eed49c] to-[#E6C280] text-stone-950 font-extrabold text-xs uppercase tracking-wider shadow-[0_10px_25px_rgba(230,194,128,0.4)] hover:scale-102 active:scale-98 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Anywear Canlı Sınağı Başlat</span>
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode("camera")}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Brauzer Kamerası</span>
                  </button>
                </div>

                <div className="mt-8 flex items-center gap-2 text-[11px] text-stone-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Kamera icazəsi tam aktivdir (Permissions-Policy: camera=*)</span>
                </div>
              </div>
            )}

            {/* View Mode 2: BROWSER CAMERA WITH SEAMLESS CUTOUT */}
            {viewMode === "camera" && !snapshotUrl && (
              <div className="relative w-full h-full flex items-center justify-center">
                {cameraError ? (
                  <div className="flex flex-col items-center justify-center text-center p-6 max-w-md">
                    <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
                      <Camera className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-stone-300 mb-4">{cameraError}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startCamera()}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-white/10 hover:bg-white/20 text-white"
                      >
                        Yenidən Cəhd Et
                      </button>
                      <button
                        onClick={handleLaunchDecartWidget}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-[#E6C280] text-stone-950"
                      >
                        Anywear AI ilə Aç
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      autoPlay
                      className={`w-full h-full object-cover ${
                        facingMode === "user" ? "-scale-x-100" : ""
                      }`}
                    />

                    {/* Seamless Isolated Garment (No grey background box!) */}
                    <div
                      className="absolute pointer-events-none select-none transition-all duration-75 flex items-center justify-center"
                      style={{
                        top: `calc(24% + ${garmentOffsetY}px)`,
                        left: `calc(50% + ${garmentOffsetX}px)`,
                        transform: `translate(-50%, -15%) scale(${garmentScale / 100})`,
                        opacity: garmentOpacity / 100,
                        width: "66%",
                        maxWidth: "500px",
                        mixBlendMode: blendMode,
                      }}
                    >
                      <div className="relative w-full aspect-[3/4] filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={displayGarmentImage}
                          alt={product.name}
                          className="w-full h-full object-contain pointer-events-none"
                        />
                      </div>
                    </div>

                    {/* Body Guide Outline */}
                    <div className="absolute inset-0 pointer-events-none border border-dashed border-white/20 rounded-3xl m-5 sm:m-8 flex flex-col items-center justify-between p-4">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-[#E6C280] border border-[#E6C280]/30 shadow-md">
                          Bədəninizi mərkəz çərçivəyə uyğunlaşdırın
                        </span>
                      </div>
                      <span className="text-[10px] text-white/50 bg-black/50 px-2.5 py-0.5 rounded backdrop-blur-md">
                        Try-On ✦ Anywear in Real Time
                      </span>
                    </div>

                    {/* Camera Control Overlays */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleToggleFacingMode}
                        className="p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md transition-all"
                        title="Kameranı dəyiş"
                      >
                        <SwitchCamera className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAdjustments((prev) => !prev)}
                        className={`p-2.5 rounded-full border backdrop-blur-md transition-all ${
                          showAdjustments
                            ? "bg-[#E6C280] text-stone-950 border-[#E6C280]"
                            : "bg-black/60 text-white border-white/20 hover:bg-black/90"
                        }`}
                        title="Ölçü və Mövqe Sazlamaları"
                      >
                        <Sliders className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Bottom Action: Take Snapshot Button */}
                    <div className="absolute bottom-5 inset-x-0 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleTakeSnapshot}
                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-stone-100 text-stone-950 font-extrabold text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all"
                      >
                        <Camera className="w-4 h-4 text-stone-900" />
                        <span>Foto Çək & Əynində Gör</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* View Mode 2: Snapshot Preview */}
            {viewMode === "camera" && snapshotUrl && (
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={snapshotUrl}
                  alt="Snapshot"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-4 left-4 bg-emerald-500/90 text-white text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                  <Check className="w-3.5 h-3.5" />
                  <span>Şəkil çəkildi</span>
                </div>
                <div className="absolute bottom-5 inset-x-0 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSnapshotUrl(null)}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-black/75 hover:bg-black text-white text-xs font-bold border border-white/20"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Yenidən Çək</span>
                  </button>
                  <a
                    href={snapshotUrl}
                    download={`horwalle-tryon-${product.slug}.jpg`}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#E6C280] hover:bg-[#eed49c] text-stone-950 text-xs font-bold shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Şəkli Saxla</span>
                  </a>
                </div>
              </div>
            )}

            {/* View Mode 3: Upload Photo */}
            {viewMode === "upload" && (
              <div className="relative w-full h-full flex items-center justify-center bg-stone-950">
                {uploadedPhotoUrl ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={uploadedPhotoUrl}
                      alt="Uploaded"
                      className="w-full h-full object-contain"
                    />

                    {/* Garment Overlay on user photo */}
                    <div
                      className="absolute pointer-events-none select-none flex items-center justify-center"
                      style={{
                        top: `calc(30% + ${garmentOffsetY}px)`,
                        left: `calc(50% + ${garmentOffsetX}px)`,
                        transform: `translate(-50%, -15%) scale(${garmentScale / 100})`,
                        opacity: garmentOpacity / 100,
                        width: "60%",
                        maxWidth: "460px",
                        mixBlendMode: blendMode,
                      }}
                    >
                      <div className="relative w-full aspect-[3/4] drop-shadow-[0_25px_45px_rgba(0,0,0,0.85)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={displayGarmentImage}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>

                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-full bg-black/75 hover:bg-black text-white text-xs font-bold border border-white/20 backdrop-blur-md"
                      >
                        Digər Foto Seç
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAdjustments((prev) => !prev)}
                        className={`p-2 rounded-full border backdrop-blur-md transition-all ${
                          showAdjustments
                            ? "bg-[#E6C280] text-stone-950 border-[#E6C280]"
                            : "bg-black/60 text-white border-white/20 hover:bg-black/90"
                        }`}
                        title="Uyğunlaşdırma"
                      >
                        <Sliders className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center max-w-sm">
                    <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-[#E6C280]">
                      <Upload className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">
                      Öz Şəklini Yüklə
                    </h3>
                    <p className="text-xs text-stone-400 mb-5 leading-relaxed">
                      Boydan və ya yarıboy şəklini seç, atelye geyiminin səndə necə qalacağını dərhal canlı gör.
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 rounded-xl bg-white hover:bg-stone-100 text-stone-950 text-xs font-extrabold uppercase tracking-wider shadow-lg transition-all"
                    >
                      Qalereyadan Şəkil Seç
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* View Mode 4: Atelier Studio Model (Unisex Model) */}
            {viewMode === "model" && (
              <div className="relative w-full h-full flex items-center justify-center bg-radial from-stone-900 via-stone-950 to-black p-4">
                <div className="relative w-full max-w-md h-full flex items-center justify-center">
                  <div className="relative w-full h-[85%] aspect-[3/4]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={displayGarmentImage}
                      alt={product.name}
                      className="w-full h-full object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)]"
                    />
                  </div>

                  <div className="absolute bottom-6 px-4 py-2 rounded-full bg-black/70 border border-white/10 backdrop-blur-md text-[11px] text-stone-300 flex items-center gap-2 shadow-lg">
                    <User className="w-3.5 h-3.5 text-[#E6C280]" />
                    <span>Unisex Atelier Fit · 182 sm / 74 kq</span>
                  </div>
                </div>
              </div>
            )}

            {/* Floating Adjustment Controls Drawer */}
            {showAdjustments && (
              <div className="absolute bottom-16 left-4 right-4 sm:left-auto sm:right-4 sm:w-72 bg-stone-900/95 border border-white/15 rounded-2xl p-4 shadow-2xl backdrop-blur-xl z-20 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Ölçü & Mövqe Tənzimləməsi
                  </span>
                  <button
                    onClick={() => setShowAdjustments(false)}
                    className="text-stone-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-stone-300">
                    <span>Miqyas (Geyim Eni):</span>
                    <span className="font-mono text-[#E6C280]">{garmentScale}%</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="140"
                    value={garmentScale}
                    onChange={(e) => setGarmentScale(Number(e.target.value))}
                    className="w-full accent-[#E6C280] h-1.5 bg-white/20 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-stone-300">
                    <span>Çiyin & Bədən Hündürlüyü:</span>
                    <span className="font-mono text-[#E6C280]">{garmentOffsetY}px</span>
                  </div>
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    value={garmentOffsetY}
                    onChange={(e) => setGarmentOffsetY(Number(e.target.value))}
                    className="w-full accent-[#E6C280] h-1.5 bg-white/20 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-stone-300">Qarışdırma Effekti:</span>
                  <button
                    type="button"
                    onClick={() => setBlendMode(blendMode === "normal" ? "multiply" : "normal")}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                      blendMode === "multiply"
                        ? "bg-[#E6C280] text-stone-950"
                        : "bg-white/10 text-stone-300"
                    }`}
                  >
                    {blendMode === "multiply" ? "Multiply" : "Normal"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setGarmentScale(105);
                    setGarmentOffsetY(10);
                    setGarmentOffsetX(0);
                    setGarmentOpacity(100);
                    setBlendMode("normal");
                  }}
                  className="w-full py-1.5 text-[10px] uppercase font-bold text-stone-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Sıfırla (Default)
                </button>
              </div>
            )}
          </div>

          {/* RIGHT / BOTTOM: Mode Switcher Sidebar */}
          <div className="w-full md:w-60 bg-[#171517] border-t md:border-t-0 md:border-l border-white/10 p-3 sm:p-4 flex flex-row md:flex-col justify-between shrink-0 gap-3">
            <div className="space-y-2 w-full">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 hidden md:block">
                Sınaq Rejimi:
              </span>

              <div className="grid grid-cols-4 md:grid-cols-1 gap-1.5">
                <button
                  type="button"
                  onClick={() => setViewMode("anywear")}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                    viewMode === "anywear"
                      ? "bg-gradient-to-r from-[#E6C280] to-[#f0d49f] text-stone-950 font-extrabold shadow-md"
                      : "bg-[#E6C280]/10 text-[#E6C280] hover:bg-[#E6C280]/20 border border-[#E6C280]/30"
                  }`}
                >
                  <Sparkles className="w-4 h-4 shrink-0 text-stone-950 md:text-inherit" />
                  <span className="hidden sm:inline">Anywear AI</span>
                  <span className="sm:hidden">Anywear</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("camera")}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                    viewMode === "camera"
                      ? "bg-white text-stone-950 shadow-md font-extrabold"
                      : "bg-white/5 text-stone-300 hover:bg-white/10 hover:text-white border border-white/5"
                  }`}
                >
                  <Camera className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">Kamera Rejimi</span>
                  <span className="sm:hidden">Kamera</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("upload")}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                    viewMode === "upload"
                      ? "bg-white text-stone-950 shadow-md font-extrabold"
                      : "bg-white/5 text-stone-300 hover:bg-white/10 hover:text-white border border-white/5"
                  }`}
                >
                  <Upload className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">Foto Yüklə</span>
                  <span className="sm:hidden">Foto</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("model")}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                    viewMode === "model"
                      ? "bg-white text-stone-950 shadow-md font-extrabold"
                      : "bg-white/5 text-stone-300 hover:bg-white/10 hover:text-white border border-white/5"
                  }`}
                >
                  <User className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">Atelier Model</span>
                  <span className="sm:hidden">Model</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>

            {/* At-a-glance Specs */}
            <div className="hidden md:block bg-black/40 border border-white/5 rounded-xl p-3 text-[11px] text-stone-400 space-y-1.5">
              <div className="flex justify-between">
                <span>Model Kəsimi:</span>
                <span className="text-white font-medium">{product.fit || "Universal Fit"}</span>
              </div>
              <div className="flex justify-between">
                <span>Rəng:</span>
                <span className="text-white font-medium">
                  {translateColor(activeColor.name, language)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tərkib:</span>
                <span className="text-white font-medium truncate max-w-[100px]">
                  {product.composition || "100% Pambıq"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            FOOTER ACTIONS (CLOSE | SHARE | ADD TO CART)
        ======================================================== */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-[#181618] border-t border-white/10 shrink-0">
          <button
            type="button"
            onClick={closeTryOn}
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-stone-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-stone-200 bg-white/10 hover:bg-white/15 border border-white/15 transition-all active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5 text-[#E6C280]" />
              <span>{copiedShare ? "Link Kopyalandı!" : "Share With a Friend"}</span>
            </button>

            <button
              type="button"
              onClick={handleAddToCart}
              className="flex items-center gap-2 px-5 sm:px-7 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider bg-[#E6C280] hover:bg-[#ebce96] text-stone-950 shadow-lg transition-all active:scale-95"
            >
              {addedToast ? (
                <>
                  <Check className="w-4 h-4 text-emerald-800" />
                  <span>Səbətə Əlavə Olundu!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Səbətə Əlavə Et</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
