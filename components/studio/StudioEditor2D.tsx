"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Transformer } from "react-konva";

export interface CanvasElement {
  id: string;
  type: "text" | "image";
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  imageSrc?: string;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
}

interface StudioEditor2DProps {
  productType: "tshirt" | "hoodie";
  productColor: string;
  elements: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChangeElements: (elements: CanvasElement[]) => void;
  stageRef: React.RefObject<any>;
  designLayerRef?: React.RefObject<any>;
}

// Convert color name to hex
function getColorHex(name: string): string {
  const c = name.toLowerCase();
  if (c.includes("süd") || c.includes("ağ") || c.includes("white")) return "#f5f5f0";
  if (c.includes("qum") || c.includes("sand") || c.includes("bej")) return "#d7cec7";
  if (c.includes("boz") || c.includes("grey")) return "#b0b0b0";
  if (c.includes("antrasit")) return "#2c2d30";
  if (c.includes("göy") || c.includes("navy")) return "#1e293b";
  if (c.includes("yaşıl") || c.includes("olive")) return "#4a5340";
  return "#18181a"; // deep matte black
}

// Generate an ultra-clean isolated flat apparel mockup SVG (No face/body parts!)
function generateGarmentSvg(type: "tshirt" | "hoodie", colorName: string): string {
  const hex = getColorHex(colorName);
  const isLight =
    colorName.toLowerCase().includes("süd") ||
    colorName.toLowerCase().includes("ağ") ||
    colorName.toLowerCase().includes("qum") ||
    colorName.toLowerCase().includes("sand") ||
    colorName.toLowerCase().includes("white") ||
    colorName.toLowerCase().includes("bej");

  const strokeColor = isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.1)";
  const shadowColor = isLight ? "rgba(0,0,0,0.06)" : "rgba(0,0,0,0.3)";

  if (type === "tshirt") {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480" width="480" height="480">
      <defs>
        <radialGradient id="bgGlow" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stop-color="#f8f8fa" />
          <stop offset="100%" stop-color="#ebebee" />
        </radialGradient>
        <linearGradient id="fabricShade" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${hex}" />
          <stop offset="50%" stop-color="${hex}" />
          <stop offset="100%" stop-color="${hex}" stop-opacity="0.92" />
        </linearGradient>
        <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="rgba(0,0,0,0.12)" />
        </filter>
      </defs>

      <!-- Background Canvas -->
      <rect width="480" height="480" fill="url(#bgGlow)" />

      <!-- Garment Silhouette (T-Shirt) -->
      <g filter="url(#softShadow)">
        <!-- Main Body & Sleeves -->
        <path d="M 180 50 
                 C 195 72 285 72 300 50 
                 L 385 85 
                 C 405 95 425 110 410 160 
                 L 360 175 
                 L 355 145 
                 L 350 420 
                 C 350 430 330 432 240 432 
                 C 150 432 130 430 130 420 
                 L 125 145 
                 L 120 175 
                 L 70 160 
                 C 55 110 75 95 95 85 
                 Z" 
              fill="url(#fabricShade)" 
              stroke="${strokeColor}" 
              stroke-width="1.5" />

        <!-- Crewneck Ribbed Collar -->
        <path d="M 180 50 C 200 80 280 80 300 50 C 285 64 195 64 180 50 Z" 
              fill="${isLight ? "#e5e5dc" : "#111112"}" 
              stroke="${strokeColor}" 
              stroke-width="1.2" />

        <!-- Realistic Sleeve Hem Seams -->
        <line x1="72" y1="158" x2="118" y2="173" stroke="${strokeColor}" stroke-width="1.5" stroke-dasharray="3,2" />
        <line x1="408" y1="158" x2="362" y2="173" stroke="${strokeColor}" stroke-width="1.5" stroke-dasharray="3,2" />

        <!-- Bottom Hem Seam -->
        <line x1="135" y1="418" x2="345" y2="418" stroke="${strokeColor}" stroke-width="1.5" stroke-dasharray="3,2" />

        <!-- Subtle Fold Shadow -->
        <path d="M 140 160 Q 240 180 340 160" fill="none" stroke="${shadowColor}" stroke-width="2" />
      </g>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  } else {
    // Hoodie
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480" width="480" height="480">
      <defs>
        <radialGradient id="bgGlow" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stop-color="#f8f8fa" />
          <stop offset="100%" stop-color="#ebebee" />
        </radialGradient>
        <linearGradient id="fabricShade" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${hex}" />
          <stop offset="100%" stop-color="${hex}" stop-opacity="0.95" />
        </linearGradient>
        <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="rgba(0,0,0,0.12)" />
        </filter>
      </defs>

      <!-- Background Canvas -->
      <rect width="480" height="480" fill="url(#bgGlow)" />

      <!-- Garment Silhouette (Hoodie) -->
      <g filter="url(#softShadow)">
        <!-- Main Torso & Dropped Sleeves -->
        <path d="M 175 60 
                 L 305 60 
                 L 415 105 
                 C 435 115 440 145 425 255 
                 L 375 250 
                 L 365 170 
                 L 355 425 
                 C 355 435 335 436 240 436 
                 C 145 436 125 435 125 425 
                 L 115 170 
                 L 105 250 
                 L 55 255 
                 C 40 145 45 115 65 105 
                 Z" 
              fill="url(#fabricShade)" 
              stroke="${strokeColor}" 
              stroke-width="1.5" />

        <!-- Double Layered Hood -->
        <path d="M 175 60 C 190 20 290 20 305 60 C 275 80 205 80 175 60 Z" 
              fill="${isLight ? "#e5e5dc" : "#111112"}" 
              stroke="${strokeColor}" 
              stroke-width="1.5" />
        <path d="M 215 75 C 240 85 240 85 265 75" fill="none" stroke="${strokeColor}" stroke-width="2" />

        <!-- Kangaroo Pocket -->
        <path d="M 160 305 L 320 305 L 340 380 L 140 380 Z" 
              fill="${isLight ? "#ecece4" : "#202022"}" 
              stroke="${strokeColor}" 
              stroke-width="1.5" />

        <!-- Ribbed Bottom Hem & Sleeve Cuffs -->
        <line x1="130" y1="422" x2="350" y2="422" stroke="${strokeColor}" stroke-width="2" stroke-dasharray="3,2" />
        <line x1="58" y1="248" x2="102" y2="244" stroke="${strokeColor}" stroke-width="1.5" stroke-dasharray="3,2" />
        <line x1="422" y1="248" x2="378" y2="244" stroke="${strokeColor}" stroke-width="1.5" stroke-dasharray="3,2" />
      </g>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
}

// Native hook to load images safely
function useCustomImage(url: string) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!url) {
      setImage(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => {
      setImage(img);
    };
  }, [url]);

  return [image];
}

// Konva single image item
function URLImage({
  element,
  isSelected,
  onSelect,
  onChange,
}: {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: any) => void;
}) {
  const [img] = useCustomImage(element.imageSrc || "");
  const shapeRef = useRef<any>(null);

  return (
    <KonvaImage
      ref={shapeRef}
      image={img || undefined}
      x={element.x}
      y={element.y}
      width={element.width || 120}
      height={element.height || 120}
      rotation={element.rotation || 0}
      scaleX={element.scaleX || 1}
      scaleY={element.scaleY || 1}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onChange({
          ...element,
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      onTransformEnd={() => {
        const node = shapeRef.current;
        if (!node) return;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        onChange({
          ...element,
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
          scaleX,
          scaleY,
        });
      }}
    />
  );
}

// Konva single text item
function EditableText({
  element,
  isSelected,
  onSelect,
  onChange,
}: {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: any) => void;
}) {
  const shapeRef = useRef<any>(null);

  return (
    <KonvaText
      ref={shapeRef}
      text={element.text || "ATELIER"}
      x={element.x}
      y={element.y}
      fontSize={element.fontSize || 24}
      fontFamily={element.fontFamily || "Helvetica, Arial, sans-serif"}
      fill={element.fill || "#ffffff"}
      rotation={element.rotation || 0}
      scaleX={element.scaleX || 1}
      scaleY={element.scaleY || 1}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onChange({
          ...element,
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      onTransformEnd={() => {
        const node = shapeRef.current;
        if (!node) return;
        onChange({
          ...element,
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY(),
        });
      }}
    />
  );
}

export default function StudioEditor2D({
  productType,
  productColor,
  elements,
  selectedId,
  onSelect,
  onChangeElements,
  stageRef,
  designLayerRef,
}: StudioEditor2DProps) {
  const trRef = useRef<any>(null);

  // Generate isolated vector garment mockup without human faces
  const svgUrl = useMemo(
    () => generateGarmentSvg(productType, productColor),
    [productType, productColor]
  );
  const [mockupImg] = useCustomImage(svgUrl);

  useEffect(() => {
    if (!trRef.current || !stageRef.current) return;
    const stage = stageRef.current;
    if (selectedId) {
      const selectedNode = stage.findOne((node: any) => {
        return (
          (node.className === "Image" || node.className === "Text") &&
          node.index === elements.findIndex((el) => el.id === selectedId) + 1
        );
      });

      if (selectedNode) {
        trRef.current.nodes([selectedNode]);
        trRef.current.getLayer().batchDraw();
      } else {
        trRef.current.nodes([]);
      }
    } else {
      trRef.current.nodes([]);
    }
  }, [selectedId, elements]);

  const handleUpdateElement = (updated: CanvasElement) => {
    const next = elements.map((el) => (el.id === updated.id ? updated : el));
    onChangeElements(next);
  };

  return (
    <div className="relative w-full aspect-square max-w-[480px] mx-auto rounded-card-lg overflow-hidden bg-atelier-card border border-atelier-line shadow-inner flex items-center justify-center select-none">
      {/* Printable Area Boundary Guideline */}
      <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
        <div
          className={`w-[48%] ${
            productType === "hoodie" ? "h-[36%] translate-y-[-10%]" : "h-[45%] translate-y-[-4%]"
          } border border-dashed border-black/25 rounded-md flex flex-col justify-between p-2`}
        >
          <div className="flex justify-between text-[9px] font-mono text-black/40 tracking-tight uppercase">
            <span>ÇAP SAHƏSİ (A3)</span>
            <span>ATELIER</span>
          </div>
          <div className="text-[9px] font-mono text-black/40 text-right">
            300 DPI HD
          </div>
        </div>
      </div>

      <Stage
        width={480}
        height={480}
        ref={stageRef}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage() || e.target.name() === "background") {
            onSelect(null);
          }
        }}
        onTouchStart={(e) => {
          if (e.target === e.target.getStage() || e.target.name() === "background") {
            onSelect(null);
          }
        }}
      >
        {/* Layer 1: Product Mockup Background (Clean isolated garment) */}
        <Layer>
          {mockupImg && (
            <KonvaImage
              name="background"
              image={mockupImg}
              width={480}
              height={480}
              listening={false}
            />
          )}
        </Layer>

        {/* Layer 2: User Design Elements (Transparent Export Layer) */}
        <Layer ref={designLayerRef}>
          {elements.map((el) => {
            if (el.type === "image") {
              return (
                <URLImage
                  key={el.id}
                  element={el}
                  isSelected={el.id === selectedId}
                  onSelect={() => onSelect(el.id)}
                  onChange={handleUpdateElement}
                />
              );
            }
            if (el.type === "text") {
              return (
                <EditableText
                  key={el.id}
                  element={el}
                  isSelected={el.id === selectedId}
                  onSelect={() => onSelect(el.id)}
                  onChange={handleUpdateElement}
                />
              );
            }
            return null;
          })}

          <Transformer
            ref={trRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (Math.abs(newBox.width) < 15 || Math.abs(newBox.height) < 15) {
                return oldBox;
              }
              return newBox;
            }}
            anchorCornerRadius={4}
            anchorSize={8}
            rotateAnchorOffset={20}
            borderStroke="#1d1d1f"
            borderDash={[3, 3]}
            anchorStroke="#1d1d1f"
            anchorFill="#ffffff"
          />
        </Layer>
      </Stage>
    </div>
  );
}
