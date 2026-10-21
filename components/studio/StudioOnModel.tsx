"use client";

import React, { useState } from "react";
import { User, Check } from "lucide-react";

interface StudioOnModelProps {
  productType: "tshirt" | "hoodie";
  productColor: string;
  previewUrl?: string;
}

type ModelView = "male" | "female" | "street";

interface ModelConfig {
  id: ModelView;
  label: string;
  sublabel: string;
  getImage: (productType: string, productColor: string) => string;
  decalPosition: {
    tshirt: { top: string; left: string; width: string; height: string; transform?: string };
    hoodie: { top: string; left: string; width: string; height: string; transform?: string };
  };
}

const MODELS: ModelConfig[] = [
  {
    id: "male",
    label: "Kişi Modeli",
    sublabel: "Boy: 186 sm · Ölçü: L (Boxy Fit)",
    getImage: (type, color) => {
      const col = color.toLowerCase();
      if (type === "tshirt") {
        if (col.includes("süd") || col.includes("ağ") || col.includes("white")) {
          return "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=1200&auto=format&fit=crop";
        }
        if (col.includes("qum") || col.includes("sand") || col.includes("bej")) {
          return "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1200&auto=format&fit=crop";
        }
        return "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1200&auto=format&fit=crop";
      } else {
        // Hoodie
        if (col.includes("boz") || col.includes("grey")) {
          return "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1200&auto=format&fit=crop";
        }
        if (col.includes("antrasit") || col.includes("bej")) {
          return "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1200&auto=format&fit=crop";
        }
        return "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1200&auto=format&fit=crop";
      }
    },
    decalPosition: {
      tshirt: { top: "34%", left: "50%", width: "36%", height: "30%", transform: "translate(-50%, -50%)" },
      hoodie: { top: "42%", left: "50%", width: "34%", height: "26%", transform: "translate(-50%, -50%)" },
    },
  },
  {
    id: "female",
    label: "Qadın Modeli",
    sublabel: "Boy: 175 sm · Ölçü: S (Relaxed Fit)",
    getImage: (type, color) => {
      const col = color.toLowerCase();
      if (type === "tshirt") {
        if (col.includes("süd") || col.includes("ağ") || col.includes("white")) {
          return "https://images.unsplash.com/photo-1503342394128-c104d54dba01?q=80&w=1200&auto=format&fit=crop";
        }
        if (col.includes("qum") || col.includes("sand") || col.includes("bej")) {
          return "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop";
        }
        return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop";
      } else {
        if (col.includes("boz") || col.includes("grey")) {
          return "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1200&auto=format&fit=crop";
        }
        return "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1200&auto=format&fit=crop";
      }
    },
    decalPosition: {
      tshirt: { top: "35%", left: "50%", width: "34%", height: "28%", transform: "translate(-50%, -50%)" },
      hoodie: { top: "40%", left: "50%", width: "32%", height: "25%", transform: "translate(-50%, -50%)" },
    },
  },
  {
    id: "street",
    label: "Lookbook Küçə",
    sublabel: "Urban Streetwear Editorial",
    getImage: (type, color) => {
      const col = color.toLowerCase();
      if (type === "tshirt") {
        if (col.includes("süd") || col.includes("ağ") || col.includes("white")) {
          return "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200&auto=format&fit=crop";
        }
        return "https://images.unsplash.com/photo-1618354691229-88d47f285158?q=80&w=1200&auto=format&fit=crop";
      } else {
        return "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop";
      }
    },
    decalPosition: {
      tshirt: { top: "36%", left: "50%", width: "35%", height: "28%", transform: "translate(-50%, -50%)" },
      hoodie: { top: "42%", left: "50%", width: "32%", height: "25%", transform: "translate(-50%, -50%)" },
    },
  },
];

export default function StudioOnModel({
  productType,
  productColor,
  previewUrl,
}: StudioOnModelProps) {
  const [activeModelId, setActiveModelId] = useState<ModelView>("male");

  const currentModel = MODELS.find((m) => m.id === activeModelId) || MODELS[0];
  const modelImg = currentModel.getImage(productType, productColor);

  const isLightGarment =
    productColor.toLowerCase().includes("süd") ||
    productColor.toLowerCase().includes("ağ") ||
    productColor.toLowerCase().includes("qum") ||
    productColor.toLowerCase().includes("sand") ||
    productColor.toLowerCase().includes("white") ||
    productColor.toLowerCase().includes("bej");

  const pos =
    productType === "hoodie"
      ? currentModel.decalPosition.hoodie
      : currentModel.decalPosition.tshirt;

  return (
    <div className="w-full flex flex-col items-center gap-4 animate-fadeIn select-none">
      {/* Model Perspective Switcher */}
      <div className="flex items-center justify-center gap-1.5 p-1 rounded-pill bg-white border border-atelier-line shadow-xs">
        {MODELS.map((m) => {
          const isActive = m.id === activeModelId;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveModelId(m.id)}
              className={`px-3 py-1.5 rounded-pill text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                isActive
                  ? "bg-atelier-text text-white shadow-xs"
                  : "text-atelier-muted hover:text-atelier-text hover:bg-black/5"
              }`}
            >
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Editorial Lookbook Photography Card */}
      <div className="relative w-full aspect-[3/4] max-w-[440px] rounded-card overflow-hidden bg-atelier-card border border-atelier-line shadow-sm flex items-center justify-center">
        {/* Real Model Photo */}
        <img
          src={modelImg}
          alt={`Model - ${productType} ${productColor}`}
          className="w-full h-full object-cover object-top filter contrast-[1.03]"
        />

        {/* User Custom Print Overlay with realistic blending */}
        {previewUrl && (
          <div
            className="absolute pointer-events-none flex items-center justify-center"
            style={{
              top: pos.top,
              left: pos.left,
              width: pos.width,
              height: pos.height,
              transform: pos.transform || "translate(-50%, -50%)",
            }}
          >
            <img
              src={previewUrl}
              alt="Custom Print Decal"
              className={`w-full h-full object-contain ${
                isLightGarment
                  ? "mix-blend-multiply opacity-90"
                  : "mix-blend-screen opacity-95"
              } transition-all duration-300 drop-shadow-sm`}
            />
          </div>
        )}

        {/* Editorial Lookbook Bottom Badge (Clean Atelier Branding, no Pullbear) */}
        <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
          <div className="px-3 py-1.5 rounded-pill bg-white/95 backdrop-blur-md border border-atelier-line text-[11px] font-medium text-atelier-text shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-black" />
            <span>ATELIER LOOKBOOK · {currentModel.sublabel}</span>
          </div>

          <div className="px-2.5 py-1.5 rounded-pill bg-black/80 backdrop-blur-md text-[10px] font-mono text-white/90 uppercase tracking-wider">
            100% Cotton
          </div>
        </div>
      </div>
    </div>
  );
}
