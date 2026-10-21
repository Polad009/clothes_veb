"use client";

import React, { useState, useRef, useEffect } from "react";
import { RotateCw, Compass } from "lucide-react";

interface StudioViewer3DProps {
  productType?: "tshirt" | "hoodie" | "shirt" | "longsleeve";
  productColor?: string;
  previewTextureUrl?: string;
  productImage?: string;
  modelImage?: string;
  gallery?: string[];
  onClose?: () => void;
}

export default function StudioViewer3D({
  productType = "tshirt",
  productColor = "Qara",
  previewTextureUrl,
  productImage,
  modelImage,
  gallery = [],
  onClose,
}: StudioViewer3DProps) {
  // Color state: White / Black
  const [activeColor, setActiveColor] = useState<"white" | "black">(
    productColor.toLowerCase().includes("süd") ||
    productColor.toLowerCase().includes("ağ") ||
    productColor.toLowerCase().includes("white")
      ? "white"
      : "black"
  );

  // Rotation angle in degrees (0 to 360)
  const [angle, setAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startAngleRef = useRef(0);

  // Clean White and Black 360 Multi-angle Clothing Frames (Front, 45° Angle, Side, Back)
  const whiteTshirtFrames = {
    front: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=1000&auto=format&fit=crop",
    angleRight: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop",
    back: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop",
    angleLeft: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1000&auto=format&fit=crop",
  };

  const blackTshirtFrames = {
    front: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop",
    angleRight: "https://images.unsplash.com/photo-1618354691229-88d47f285158?q=80&w=1000&auto=format&fit=crop",
    back: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop",
    angleLeft: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop",
  };

  const frames = activeColor === "white" ? whiteTshirtFrames : blackTshirtFrames;

  // Compute active frame based on 360 angle
  const normalizedAngle = ((angle % 360) + 360) % 360;

  const getActiveFrame = () => {
    if (normalizedAngle >= 315 || normalizedAngle < 45) {
      return { src: frames.front, label: "Ön Görünüş (0°)", decalOpacity: 1, decalX: (normalizedAngle > 180 ? normalizedAngle - 360 : normalizedAngle) * 1.5 };
    }
    if (normalizedAngle >= 45 && normalizedAngle < 135) {
      return { src: frames.angleRight, label: "Sağ Bucaq (90°)", decalOpacity: 0.3, decalX: 40 };
    }
    if (normalizedAngle >= 135 && normalizedAngle < 225) {
      return { src: frames.back, label: "Arxa Görünüş (180°)", decalOpacity: 0, decalX: 0 };
    }
    return { src: frames.angleLeft, label: "Sol Bucaq (270°)", decalOpacity: 0.3, decalX: -40 };
  };

  const activeFrameData = getActiveFrame();

  // Mouse & Touch Drag Handlers for 360° rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    startAngleRef.current = angle;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      setIsDragging(true);
      startXRef.current = e.touches[0].clientX;
      startAngleRef.current = angle;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startXRef.current;
    setAngle(startAngleRef.current + deltaX * 0.9);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !e.touches[0]) return;
    const deltaX = e.touches[0].clientX - startXRef.current;
    setAngle(startAngleRef.current + deltaX * 0.9);
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="w-full flex flex-col items-center gap-4 select-none"
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchEnd={handleEnd}
    >
      {/* Top Bar: Clean Color Switcher (Ağ / Qara) & 360 Indicator */}
      <div className="w-full flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5 p-1 rounded-pill bg-white/10 backdrop-blur-md border border-white/10">
          <button
            type="button"
            onClick={() => setActiveColor("white")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-medium transition-all cursor-pointer ${
              activeColor === "white"
                ? "bg-white text-black font-semibold shadow-xs"
                : "text-white/70 hover:text-white"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#f5f5f0] border border-black/20" />
            <span>Sadə Ağ Köynək</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveColor("black")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-medium transition-all cursor-pointer ${
              activeColor === "black"
                ? "bg-white text-black font-semibold shadow-xs"
                : "text-white/70 hover:text-white"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#18181a] border border-white/30" />
            <span>Sadə Qara Köynək</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-white/10 backdrop-blur-md text-[11px] font-mono text-emerald-400 border border-white/10">
          <Compass size={13} className="animate-spin" />
          <span>{Math.round(normalizedAngle)}° 360 BAXIŞ</span>
        </div>
      </div>

      {/* 360° Interactive Canvas */}
      <div
        className="relative w-full aspect-[3/4] max-w-[440px] rounded-card-lg overflow-hidden bg-[#161618] border border-white/15 shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {/* Seamless 360° Rotating Model Frame */}
        <img
          src={activeFrameData.src}
          alt={`360 Degree Clothing - ${activeColor}`}
          className="w-full h-full object-cover object-top filter contrast-[1.02] pointer-events-none transition-opacity duration-150"
          draggable={false}
        />

        {/* Custom Print Decal on Front with perspective rotation */}
        {previewTextureUrl && activeFrameData.decalOpacity > 0 && (
          <div
            className="absolute inset-0 pointer-events-none flex items-center justify-center transition-all duration-100"
            style={{
              opacity: activeFrameData.decalOpacity,
              transform: `translateX(${activeFrameData.decalX}px) perspective(600px) rotateY(${activeFrameData.decalX * 0.4}deg)`,
            }}
          >
            <div className="w-[36%] h-[32%] translate-y-[-2%] flex items-center justify-center overflow-hidden">
              <img
                src={previewTextureUrl}
                alt="Custom Print Decal"
                className={`w-full h-full object-contain ${
                  activeColor === "white"
                    ? "mix-blend-multiply opacity-90"
                    : "mix-blend-screen opacity-95"
                } drop-shadow-sm`}
              />
            </div>
          </div>
        )}

        {/* Interactive 360 Bottom Controller Overlay */}
        <div className="absolute bottom-4 inset-x-4 z-10 flex items-center justify-between pointer-events-none">
          <div className="px-3 py-1.5 rounded-pill bg-black/80 backdrop-blur-md border border-white/15 text-[11px] font-medium text-white flex items-center gap-1.5 shadow-md">
            <RotateCw size={13} className="text-emerald-400" />
            <span>{activeFrameData.label}</span>
          </div>

          <div className="px-3 py-1.5 rounded-pill bg-white/95 backdrop-blur-md text-[11px] font-medium text-black shadow-md">
            100% Pambıq
          </div>
        </div>

        {/* Drag Helper Guide */}
        <div className="absolute top-4 inset-x-0 flex justify-center pointer-events-none">
          <div className="px-3.5 py-1 rounded-pill bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-white/80 font-medium">
            👈 Siçanla tutub sağa-sola fırladın 👉
          </div>
        </div>
      </div>
    </div>
  );
}
