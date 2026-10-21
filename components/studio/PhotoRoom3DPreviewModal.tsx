"use client";

import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import {
  X,
  RotateCcw,
  Play,
  Pause,
  Download,
  Sparkles,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Sun,
  Eye,
  Layers,
  Palette,
  ChevronRight,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SideDesignState } from "@/components/studio/LiveModelPreviewModal";

interface PhotoRoom3DPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  frontDesign: SideDesignState;
  backDesign: SideDesignState;
  colorHex: string;
  garmentName: string;
  garmentCategory?: string;
}

type LightingPreset = "editorial" | "warm" | "daylight" | "cyber";

export function PhotoRoom3DPreviewModal({
  isOpen,
  onClose,
  frontDesign,
  backDesign,
  colorHex,
  garmentName,
  garmentCategory = "tshirt",
}: PhotoRoom3DPreviewModalProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [lighting, setLighting] = useState<LightingPreset>("editorial");
  const [isCapturing, setIsCapturing] = useState(false);
  const [activeSide, setActiveSide] = useState<"front" | "back">("front");
  const [zoomLevel, setZoomLevel] = useState(1);

  // References for 3D state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const garmentMeshRef = useRef<THREE.Group | null>(null);
  const shadowMeshRef = useRef<THREE.Mesh | null>(null);
  const lightsRef = useRef<{
    keyLight: THREE.DirectionalLight;
    fillLight: THREE.DirectionalLight;
    rimLight: THREE.DirectionalLight;
    ambientLight: THREE.AmbientLight;
  } | null>(null);

  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const rotationTargetRef = useRef({ x: 0, y: 0 });
  const rotationCurrentRef = useRef({ x: 0, y: 0 });
  const autoRotateSpeedRef = useRef(0.012);

  // Build high-resolution texture map with color, front/back graphics & fabric bump
  const generateGarmentTexture = (
    side: "front" | "back",
    design: SideDesignState,
    bgColor: string
  ): Promise<THREE.CanvasTexture> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(new THREE.CanvasTexture(canvas));
        return;
      }

      // Base garment color fill
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, 1024, 1024);

      // Fine woven cotton fabric grain simulation
      const imgData = ctx.getImageData(0, 0, 1024, 1024);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        // Subtle micro noise for fabric grain
        const noise = (Math.random() - 0.5) * 10;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
      }
      ctx.putImageData(imgData, 0, 0);

      // Subtle seam & garment shading
      const grad = ctx.createLinearGradient(0, 0, 0, 1024);
      grad.addColorStop(0, "rgba(255, 255, 255, 0.08)");
      grad.addColorStop(0.3, "rgba(0, 0, 0, 0)");
      grad.addColorStop(0.8, "rgba(0, 0, 0, 0.08)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0.22)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 1024);

      // Natural cloth fold shadows (curved bezier lines for realism)
      ctx.strokeStyle = "rgba(0, 0, 0, 0.07)";
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(180, 200);
      ctx.bezierCurveTo(240, 500, 220, 700, 260, 950);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(840, 200);
      ctx.bezierCurveTo(780, 500, 800, 700, 760, 950);
      ctx.stroke();

      // Collar ribbing line
      ctx.strokeStyle = "rgba(0, 0, 0, 0.18)";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(512, 110, 170, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();

      // Check if design has image or text
      const hasImg = Boolean(design?.uploadedImage);
      const hasTxt = Boolean(design?.customText?.trim());

      const finishTexture = () => {
        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 16;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.needsUpdate = true;
        resolve(texture);
      };

      if (!hasImg && !hasTxt) {
        finishTexture();
        return;
      }

      // Draw custom print zone: centered around chest/upper back
      const printCenterX = 512 + (design.posX || 0) * 4.2;
      const printCenterY = 460 + (design.posY || 0) * 4.2;
      const printScale = (design.scale || 1.0) * 2.4;
      const printRot = ((design.rotation || 0) * Math.PI) / 180;

      const drawText = () => {
        if (hasTxt) {
          ctx.save();
          const textX = 512 + (design.textPosX || 0) * 4.2;
          const textY = 460 + (design.textPosY || 30) * 4.2;
          const textScale = design.textScale || 1.0;
          const textRot = ((design.textRotation || 0) * Math.PI) / 180;

          ctx.translate(textX, textY);
          ctx.rotate(textRot);
          ctx.scale(textScale, textScale);

          ctx.font = `900 ${Math.round(48 * textScale)}px ${design.fontFamily || "Inter, sans-serif"}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Natural DTG ink blending onto cloth
          ctx.fillStyle = design.textColor || "#FFFFFF";
          ctx.shadowColor = "rgba(0,0,0,0.35)";
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 2;
          ctx.fillText(design.customText, 0, 0);
          ctx.restore();
        }
        finishTexture();
      };

      if (hasImg && design.uploadedImage) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.save();
          ctx.translate(printCenterX, printCenterY);
          ctx.rotate(printRot);

          // Max print bounds on chest
          const maxDim = 320 * printScale;
          let drawW = maxDim;
          let drawH = maxDim;
          if (img.width > img.height) {
            drawH = (img.height / img.width) * maxDim;
          } else {
            drawW = (img.width / img.height) * maxDim;
          }

          // DTF/DTG ink shadow for authentic 3D printed elevation
          ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
          ctx.shadowBlur = 6;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 3;

          // Draw graphic
          ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
          ctx.restore();

          drawText();
        };
        img.onerror = () => {
          drawText();
        };
        img.src = design.uploadedImage;
      } else {
        drawText();
      }
    });
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 5.2);
    cameraRef.current = camera;

    // 3. Renderer with antialiasing & tone mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Studio Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff6ea, 2.2);
    keyLight.position.set(3, 4, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe8f0ff, 1.2);
    fillLight.position.set(-4, 1, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xd4af37, 2.8);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    lightsRef.current = { keyLight, fillLight, rimLight, ambientLight };

    // 5. Build 3D Garment Mesh Group
    const garmentGroup = new THREE.Group();
    scene.add(garmentGroup);
    garmentMeshRef.current = garmentGroup;

    // Create realistic double-sided curved body mesh
    // We create front torso, back torso, and sleeves with natural curvature
    const bodyGeometry = new THREE.CylinderGeometry(0.96, 1.05, 2.1, 32, 16, true, -Math.PI / 2, Math.PI);
    bodyGeometry.scale(1.08, 1, 0.48); // Flatten to torso cross-section

    const backBodyGeometry = new THREE.CylinderGeometry(0.96, 1.05, 2.1, 32, 16, true, Math.PI / 2, Math.PI);
    backBodyGeometry.scale(1.08, 1, 0.48);

    // Initial placeholder materials
    const frontMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.65,
      metalness: 0.05,
      side: THREE.FrontSide,
    });

    const backMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.65,
      metalness: 0.05,
      side: THREE.FrontSide,
    });

    const frontMesh = new THREE.Mesh(bodyGeometry, frontMat);
    frontMesh.castShadow = true;
    frontMesh.receiveShadow = true;
    garmentGroup.add(frontMesh);

    const backMesh = new THREE.Mesh(backBodyGeometry, backMat);
    backMesh.castShadow = true;
    backMesh.receiveShadow = true;
    garmentGroup.add(backMesh);

    // Shoulders & Left/Right sleeves
    const sleeveGeometry = new THREE.CylinderGeometry(0.38, 0.34, 0.9, 20);
    const sleeveMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.65,
      metalness: 0.05,
    });

    // Left sleeve
    const leftSleeve = new THREE.Mesh(sleeveGeometry, sleeveMat);
    leftSleeve.position.set(-1.18, 0.62, 0);
    leftSleeve.rotation.set(0, 0, Math.PI / 4.8);
    leftSleeve.scale.set(1, 1, 0.6);
    garmentGroup.add(leftSleeve);

    // Right sleeve
    const rightSleeve = new THREE.Mesh(sleeveGeometry, sleeveMat);
    rightSleeve.position.set(1.18, 0.62, 0);
    rightSleeve.rotation.set(0, 0, -Math.PI / 4.8);
    rightSleeve.scale.set(1, 1, 0.6);
    garmentGroup.add(rightSleeve);

    // Collar trim ring
    const collarGeom = new THREE.TorusGeometry(0.42, 0.05, 12, 32);
    collarGeom.scale(1, 0.45, 1);
    const collarMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.5,
      metalness: 0.05,
    });
    const collar = new THREE.Mesh(collarGeom, collarMat);
    collar.position.set(0, 1.05, 0);
    collar.rotation.x = Math.PI / 2;
    garmentGroup.add(collar);

    // 6. Floating Pedestal Cast Shadow underneath
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext("2d");
    if (sCtx) {
      const grad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
      grad.addColorStop(0, "rgba(0, 0, 0, 0.65)");
      grad.addColorStop(0.4, "rgba(0, 0, 0, 0.28)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 256, 256);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(3.6, 2.2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.65;
    scene.add(shadowMesh);
    shadowMeshRef.current = shadowMesh;

    // 7. Load and apply dynamic front and back textures
    generateGarmentTexture("front", frontDesign, colorHex).then((tex) => {
      frontMat.map = tex;
      frontMat.needsUpdate = true;
    });

    generateGarmentTexture("back", backDesign, colorHex).then((tex) => {
      backMat.map = tex;
      backMat.needsUpdate = true;
    });

    // 8. Animation & Render Loop (Smooth orbital levitation)
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Gentle floating levitation effect
      if (garmentGroup) {
        garmentGroup.position.y = Math.sin(elapsed * 1.8) * 0.06;
      }
      if (shadowMesh) {
        // Shadow pulses inversely with levitation height
        const s = 1.0 - Math.sin(elapsed * 1.8) * 0.05;
        shadowMesh.scale.set(s, s, 1);
        shadowMat.opacity = 0.65 - Math.sin(elapsed * 1.8) * 0.08;
      }

      // Auto 360° orbital rotation when not manually dragging
      if (autoRotate && !isDraggingRef.current) {
        rotationTargetRef.current.y += autoRotateSpeedRef.current;
      }

      // Smooth inertia damping for mouse dragging
      rotationCurrentRef.current.x += (rotationTargetRef.current.x - rotationCurrentRef.current.x) * 0.1;
      rotationCurrentRef.current.y += (rotationTargetRef.current.y - rotationCurrentRef.current.y) * 0.1;

      if (garmentGroup) {
        garmentGroup.rotation.x = rotationCurrentRef.current.x;
        garmentGroup.rotation.y = rotationCurrentRef.current.y;

        // Determine which side is facing the camera
        const normAngle = ((garmentGroup.rotation.y % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const facingBack = normAngle > Math.PI / 2 && normAngle < (Math.PI * 3) / 2;
        setActiveSide(facingBack ? "back" : "front");
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      bodyGeometry.dispose();
      backBodyGeometry.dispose();
      sleeveGeometry.dispose();
      collarGeom.dispose();
      shadowGeo.dispose();
    };
  }, [isOpen, colorHex, frontDesign, backDesign]);

  // Update lighting preset
  useEffect(() => {
    if (!lightsRef.current || !rendererRef.current) return;
    const { keyLight, fillLight, rimLight, ambientLight } = lightsRef.current;

    switch (lighting) {
      case "editorial":
        // PhotoRoom Dark Luxury Mode
        ambientLight.intensity = 0.75;
        keyLight.color.setHex(0xfff5ea);
        keyLight.intensity = 2.4;
        fillLight.color.setHex(0xb0c4de);
        fillLight.intensity = 1.0;
        rimLight.color.setHex(0xe8c98a);
        rimLight.intensity = 3.2;
        rendererRef.current.toneMappingExposure = 1.2;
        break;
      case "warm":
        // Golden Atelier Spotlight
        ambientLight.intensity = 0.85;
        keyLight.color.setHex(0xffdfa0);
        keyLight.intensity = 2.6;
        fillLight.color.setHex(0xffc870);
        fillLight.intensity = 1.4;
        rimLight.color.setHex(0xffb84d);
        rimLight.intensity = 3.5;
        rendererRef.current.toneMappingExposure = 1.25;
        break;
      case "daylight":
        // Clean high-key daylight
        ambientLight.intensity = 1.2;
        keyLight.color.setHex(0xffffff);
        keyLight.intensity = 1.8;
        fillLight.color.setHex(0xffffff);
        fillLight.intensity = 1.4;
        rimLight.color.setHex(0xffffff);
        rimLight.intensity = 1.2;
        rendererRef.current.toneMappingExposure = 1.05;
        break;
      case "cyber":
        // Modern street style neon rim
        ambientLight.intensity = 0.6;
        keyLight.color.setHex(0x00f0ff);
        keyLight.intensity = 2.0;
        fillLight.color.setHex(0xff0077);
        fillLight.intensity = 1.8;
        rimLight.color.setHex(0x9d00ff);
        rimLight.intensity = 4.0;
        rendererRef.current.toneMappingExposure = 1.35;
        break;
    }
  }, [lighting]);

  // Pointer Dragging for 360° Interactive Orbit
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    rotationTargetRef.current.y += deltaX * 0.009;
    // Clamped vertical tilt (-35° to +35°)
    rotationTargetRef.current.x = Math.max(
      -0.55,
      Math.min(0.55, rotationTargetRef.current.x + deltaY * 0.006)
    );

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Zoom control
  const handleZoom = (delta: number) => {
    if (!cameraRef.current) return;
    const newPos = Math.max(3.2, Math.min(7.5, cameraRef.current.position.z + delta));
    cameraRef.current.position.z = newPos;
    setZoomLevel(Number(((5.2 / newPos)).toFixed(1)));
  };

  // Quick Snap Angles
  const snapToAngle = (angleRad: number) => {
    rotationTargetRef.current.y = angleRad;
    rotationTargetRef.current.x = 0;
  };

  // Export 3D Snapshot
  const handleDownloadSnapshot = () => {
    if (!rendererRef.current) return;
    setIsCapturing(true);

    try {
      const dataUrl = rendererRef.current.domElement.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `horvvalle-3d-${garmentName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
      a.click();
    } catch (e) {
      console.error("Failed to capture 3D render", e);
    } finally {
      setTimeout(() => setIsCapturing(false), 800);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-5 bg-black/90 backdrop-blur-xl select-none isolate">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-5xl h-[92vh] max-h-[880px] bg-radial from-[#1A1215] via-[#0E0A0C] to-[#050405] border border-white/15 text-white rounded-3xl overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.85)] flex flex-col"
        >
          {/* Top Bar: Title, Active Side Indicator & Actions */}
          <div className="relative z-20 flex items-center justify-between px-4 sm:px-7 py-3.5 border-b border-white/10 bg-black/40 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-900/50 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-xs">
                <Sparkles size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-eb-garamond text-lg sm:text-2xl font-normal text-white tracking-wide">
                    PhotoRoom 3D Canlı Baxış
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono uppercase tracking-wider font-bold">
                    360° Fəza
                  </span>
                </div>
                <p className="text-[11px] text-white/60">
                  {garmentName} · {activeSide === "front" ? "Ön Çap Baxışı" : "Arxa Çap Baxışı"}
                </p>
              </div>
            </div>

            {/* Close CTA */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                className="p-2 sm:p-2.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition active:scale-95 cursor-pointer"
                aria-label="Bağla"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Central 3D Interactive Stage */}
          <div
            ref={mountRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="relative flex-1 w-full h-full cursor-grab active:cursor-grabbing touch-none select-none overflow-hidden"
          >
            {/* Gesture Guide Overlay (Fades out gently) */}
            <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 z-10 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/12 backdrop-blur-md text-[11px] text-white/80 flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Köynəyi barmağınız və ya siçanla istənilən tərəfə fırlada bilərsiniz</span>
            </div>

            {/* Bottom-left: Active Facing Badge */}
            <div className="absolute bottom-5 left-5 z-10 flex items-center gap-2 pointer-events-none">
              <div className="px-3 py-1.5 rounded-2xl bg-black/65 border border-white/15 backdrop-blur-md text-xs font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Cari Görünüş: <strong>{activeSide === "front" ? "ÖN TƏRƏF" : "ARXA TƏRƏF"}</strong></span>
              </div>
            </div>

            {/* Bottom-right: Zoom & Fullscreen Controls */}
            <div className="absolute bottom-5 right-5 z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleZoom(-0.5)}
                className="w-9 h-9 rounded-xl bg-black/60 hover:bg-black/90 border border-white/15 text-white/80 hover:text-white flex items-center justify-center transition active:scale-95 shadow-md cursor-pointer"
                title="Böyüt (Zoom In)"
              >
                <ZoomIn size={16} />
              </button>
              <button
                type="button"
                onClick={() => handleZoom(0.5)}
                className="w-9 h-9 rounded-xl bg-black/60 hover:bg-black/90 border border-white/15 text-white/80 hover:text-white flex items-center justify-center transition active:scale-95 shadow-md cursor-pointer"
                title="Kiçilt (Zoom Out)"
              >
                <ZoomOut size={16} />
              </button>
            </div>
          </div>

          {/* Bottom Control Bar: Angle Snaps, Auto-Orbit, Lighting Presets & HD Snapshot */}
          <div className="relative z-20 px-4 sm:px-6 py-3.5 border-t border-white/10 bg-black/55 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Quick Angle Presets */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[11px] text-white/50 uppercase font-semibold tracking-wider hidden sm:inline">
                Baxış:
              </span>
              <button
                type="button"
                onClick={() => snapToAngle(0)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition active:scale-95 cursor-pointer"
              >
                Ön (0°)
              </button>
              <button
                type="button"
                onClick={() => snapToAngle(Math.PI)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition active:scale-95 cursor-pointer"
              >
                Arxa (180°)
              </button>
              <button
                type="button"
                onClick={() => snapToAngle(Math.PI / 2)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition active:scale-95 cursor-pointer"
              >
                Sağ (90°)
              </button>
              <button
                type="button"
                onClick={() => snapToAngle(-Math.PI / 2)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition active:scale-95 cursor-pointer"
              >
                Sol (-90°)
              </button>

              {/* Auto Orbit Play/Pause */}
              <button
                type="button"
                onClick={() => setAutoRotate(!autoRotate)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition active:scale-95 cursor-pointer ml-1 ${
                  autoRotate
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold"
                    : "bg-white/10 border-white/15 text-white/70"
                }`}
                title="360° dövr etməni dayandır və ya başlat"
              >
                {autoRotate ? <Pause size={13} /> : <Play size={13} />}
                <span>{autoRotate ? "360° Dövr edir" : "Fırlat"}</span>
              </button>
            </div>

            {/* Lighting Studio Presets */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-white/50 uppercase font-semibold tracking-wider hidden md:inline">
                İşıq:
              </span>
              {(
                [
                  { id: "editorial", label: "PhotoRoom" },
                  { id: "warm", label: "Atelye" },
                  { id: "daylight", label: "Gün işığı" },
                  { id: "cyber", label: "Neon" },
                ] as { id: LightingPreset; label: string }[]
              ).map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setLighting(preset.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition active:scale-95 cursor-pointer ${
                    lighting === preset.id
                      ? "bg-amber-500 text-stone-950 font-bold shadow-xs"
                      : "bg-white/8 hover:bg-white/15 text-white/70"
                  }`}
                >
                  {preset.label}
                </button>
              ))}

              {/* HD Render Snapshot Button */}
              <button
                type="button"
                onClick={handleDownloadSnapshot}
                disabled={isCapturing}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-semibold text-xs border border-white/15 transition active:scale-95 cursor-pointer ml-1 shadow-xs"
                title="Fəzadakı hazır 3D görünüşü şəkil kimi yüklə"
              >
                <Download size={13} />
                <span>{isCapturing ? "Hazırlanır..." : "HD Şəkil"}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
