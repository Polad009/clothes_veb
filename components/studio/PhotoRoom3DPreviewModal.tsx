"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  X,
  Play,
  Pause,
  Download,
  RotateCcw,
  Sparkles,
  Sun,
  Flame,
  Zap,
  Camera,
  Layers,
  Check,
  Compass,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StudioSurface, getStudioGarmentCategory, getStudioGarmentImage, PRINT_AREAS } from "@/components/studio/GarmentCanvas";
import { SideDesignState } from "@/app/studio/page";
import { getProductShapeConfig } from "@/lib/studio/product-shapes";
import { buildInflatedGarmentGeometry } from "@/lib/studio/mesh-generator";

interface PhotoRoom3DPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  garmentId?: string;
  garmentName: string;
  garmentCategory?: string;
  colorKey?: string;
  colorHex: string;
  designs?: Record<StudioSurface, SideDesignState>;
  frontDesign?: SideDesignState;
  backDesign?: SideDesignState;
  currentSide?: StudioSurface;
}

type LightingPreset = "studio" | "atelier" | "daylight" | "neon";

export function PhotoRoom3DPreviewModal({
  isOpen,
  onClose,
  garmentId = "tshirt-regular",
  garmentName,
  garmentCategory = "tshirt",
  colorKey = "white",
  colorHex,
  designs,
  frontDesign,
  backDesign,
  currentSide = "front",
}: PhotoRoom3DPreviewModalProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  // Fallback support if designs object or frontDesign/backDesign is passed
  const activeFront = designs?.front || frontDesign || {
    uploadedImage: null,
    customText: "",
    textColor: "#111827",
    fontFamily: "Inter",
    scale: 1.0,
    posX: 0,
    posY: -35,
    rotation: 0,
  };

  const activeBack = designs?.back || backDesign || {
    uploadedImage: null,
    customText: "",
    textColor: "#111827",
    fontFamily: "Inter",
    scale: 1.0,
    posX: 0,
    posY: -30,
    rotation: 0,
  };

  const activeLeftSleeve = designs?.leftSleeve || {
    uploadedImage: null,
    customText: "",
    textColor: "#111827",
    fontFamily: "Inter",
    scale: 0.8,
    posX: 0,
    posY: -20,
    rotation: 0,
  };

  const activeRightSleeve = designs?.rightSleeve || {
    uploadedImage: null,
    customText: "",
    textColor: "#111827",
    fontFamily: "Inter",
    scale: 0.8,
    posX: 0,
    posY: -20,
    rotation: 0,
  };

  // UI state
  const [autoRotate, setAutoRotate] = useState(true);
  const [lighting, setLighting] = useState<LightingPreset>("studio");
  const [activeViewLabel, setActiveViewLabel] = useState<string>("Ön baxış (0°)");
  const [isLoading, setIsLoading] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasWebGl, setHasWebGl] = useState(true);

  // References for Three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const garmentMeshRef = useRef<THREE.Mesh | null>(null);
  const shadowMeshRef = useRef<THREE.Mesh | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lightsRef = useRef<{
    keyLight: THREE.DirectionalLight;
    fillLight: THREE.DirectionalLight;
    rimLight: THREE.DirectionalLight;
    ambientLight: THREE.AmbientLight;
  } | null>(null);

  // Camera animation interpolation
  const cameraAnimRef = useRef<{
    isAnimating: boolean;
    startTime: number;
    duration: number;
    startTheta: number;
    targetTheta: number;
    startPhi: number;
    targetPhi: number;
    radius: number;
  }>({
    isAnimating: false,
    startTime: 0,
    duration: 600,
    startTheta: 0,
    targetTheta: 0,
    startPhi: Math.PI / 2,
    targetPhi: Math.PI / 2,
    radius: 4.6,
  });

  // Resolve garment mockup image paths
  const frontImgSrc = getStudioGarmentImage(garmentId, colorKey, "front");
  const backImgSrc = getStudioGarmentImage(garmentId, colorKey, "back");
  const shapeConfig = getProductShapeConfig(garmentId);

  // Check WebGL availability
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      setHasWebGl(Boolean(gl));
    } catch {
      setHasWebGl(false);
    }
  }, []);

  // Composite texture generator: Draws real transparent mockup photo + user artwork + typography + sleeve prints
  const createSurfaceTexture = useCallback(
    (side: "front" | "back"): Promise<THREE.CanvasTexture> => {
      return new Promise((resolve) => {
        const canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          resolve(new THREE.CanvasTexture(canvas));
          return;
        }

        const baseImg = new Image();
        baseImg.crossOrigin = "anonymous";
        baseImg.src = side === "front" ? frontImgSrc : backImgSrc;

        baseImg.onload = () => {
          // 1. Draw authentic garment mockup photo (contains real photographic fabric folds and shading)
          ctx.drawImage(baseImg, 0, 0, 1024, 1024);

          const design = side === "front" ? activeFront : activeBack;
          const hasImg = Boolean(design.uploadedImage);
          const hasTxt = Boolean(design.customText?.trim());

          // Print area definition
          const cat = getStudioGarmentCategory(garmentId);
          const pAreas = PRINT_AREAS[cat] || PRINT_AREAS.tshirt;
          const area = pAreas[side] || pAreas.front || { left: 0.28, top: 0.30, width: 0.44, height: 0.46 };

          const printAreaCenterX = (area.left + area.width / 2) * 1024;
          const printAreaCenterY = (area.top + area.height / 2) * 1024;

          const finishTexture = () => {
            // Also draw sleeve graphics if on front view
            if (side === "front") {
              // Left Sleeve print
              if (activeLeftSleeve.uploadedImage) {
                const sImg = new Image();
                sImg.crossOrigin = "anonymous";
                sImg.src = activeLeftSleeve.uploadedImage;
                sImg.onload = () => {
                  ctx.save();
                  // Left sleeve coordinates on mockup canvas
                  ctx.translate(220, 390);
                  ctx.rotate(0.2);
                  const sDim = 120 * (activeLeftSleeve.scale || 0.8);
                  ctx.drawImage(sImg, -sDim / 2, -sDim / 2, sDim, sDim);
                  ctx.restore();
                  resolveTexture();
                };
                sImg.onerror = () => resolveTexture();
                return;
              }
              // Right Sleeve print
              if (activeRightSleeve.uploadedImage) {
                const sImg = new Image();
                sImg.crossOrigin = "anonymous";
                sImg.src = activeRightSleeve.uploadedImage;
                sImg.onload = () => {
                  ctx.save();
                  // Right sleeve coordinates on mockup canvas
                  ctx.translate(800, 390);
                  ctx.rotate(-0.2);
                  const sDim = 120 * (activeRightSleeve.scale || 0.8);
                  ctx.drawImage(sImg, -sDim / 2, -sDim / 2, sDim, sDim);
                  ctx.restore();
                  resolveTexture();
                };
                sImg.onerror = () => resolveTexture();
                return;
              }
            }
            resolveTexture();
          };

          const resolveTexture = () => {
            const texture = new THREE.CanvasTexture(canvas);
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = 8;
            texture.generateMipmaps = true;
            texture.needsUpdate = true;
            resolve(texture);
          };

          if (!hasImg && !hasTxt) {
            finishTexture();
            return;
          }

          // Relative translation scaling from 2D canvas (approx 500px stage to 1024px texture)
          const pxRatio = 1024 / 450;
          const artX = printAreaCenterX + (design.posX || 0) * pxRatio;
          const artY = printAreaCenterY + (design.posY || 0) * pxRatio;
          const artScale = (design.scale || 1.0) * pxRatio * 0.95;
          const artRot = ((design.rotation || 0) * Math.PI) / 180;

          const renderText = () => {
            if (hasTxt) {
              ctx.save();
              const txtX = printAreaCenterX + (design.textPosX || 0) * pxRatio;
              const txtY = printAreaCenterY + (design.textPosY || 55) * pxRatio;
              const txtScale = (design.textScale || 1.0) * pxRatio * 0.9;
              const txtRot = ((design.textRotation || 0) * Math.PI) / 180;

              ctx.translate(txtX, txtY);
              ctx.rotate(txtRot);

              const fontSize = Math.round(22 * txtScale);
              ctx.font = `900 ${fontSize}px ${design.fontFamily || "Inter, sans-serif"}`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";

              // Realistic DTG ink shadow
              ctx.shadowColor = "rgba(0,0,0,0.35)";
              ctx.shadowBlur = 3;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 1;

              ctx.fillStyle = design.textColor || "#111827";
              ctx.fillText(design.customText.toUpperCase(), 0, 0);
              ctx.restore();
            }
            finishTexture();
          };

          if (hasImg && design.uploadedImage) {
            const artImg = new Image();
            artImg.crossOrigin = "anonymous";
            artImg.onload = () => {
              ctx.save();
              ctx.translate(artX, artY);
              ctx.rotate(artRot);

              const maxDim = 200 * artScale;
              let dw = maxDim;
              let dh = maxDim;
              if (artImg.width > artImg.height) {
                dh = (artImg.height / artImg.width) * maxDim;
              } else {
                dw = (artImg.width / artImg.height) * maxDim;
              }

              // Realistic DTG printed ink adhesion
              ctx.shadowColor = "rgba(0,0,0,0.4)";
              ctx.shadowBlur = 4;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 2;

              ctx.drawImage(artImg, -dw / 2, -dh / 2, dw, dh);
              ctx.restore();
              renderText();
            };
            artImg.onerror = () => renderText();
            artImg.src = design.uploadedImage;
          } else {
            renderText();
          }
        };

        baseImg.onerror = () => {
          // Fallback plain color fill
          ctx.fillStyle = colorHex || "#FFFFFF";
          ctx.fillRect(0, 0, 1024, 1024);
          const texture = new THREE.CanvasTexture(canvas);
          resolve(texture);
        };
      });
    },
    [frontImgSrc, backImgSrc, garmentId, colorHex, activeFront, activeBack, activeLeftSleeve, activeRightSleeve]
  );

  // Initialize Three.js 3D Studio Scene
  useEffect(() => {
    if (!isOpen || !mountRef.current || !hasWebGl) return;

    let isDisposed = false;
    setIsLoading(true);

    const width = mountRef.current.clientWidth || 500;
    const height = mountRef.current.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.1, 4.6);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2.0;
    controls.maxDistance = 6.2;
    controls.maxPolarAngle = Math.PI / 1.7; // Constrain viewing from underneath the floor
    controls.minPolarAngle = Math.PI / 8;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Pause auto-rotation on user manual interaction
    controls.addEventListener("start", () => {
      setAutoRotate(false);
    });

    // 5. Procedural Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xfff6ec, 0.95);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.4);
    keyLight.position.set(3.2, 3.8, 3.8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0004;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe8f0ff, 1.3);
    fillLight.position.set(-3.5, 1.2, 2.2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xe8c98a, 2.6); // Warm gold rim
    rimLight.position.set(0, 3.2, -3.8);
    scene.add(rimLight);

    lightsRef.current = { keyLight, fillLight, rimLight, ambientLight };

    // 6. Soft Contact Shadow Plane Beneath Garment
    const shadowGeo = new THREE.PlaneGeometry(3.6, 3.6);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.28 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.35;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);
    shadowMeshRef.current = shadowPlane;

    // 7. Build Inflated 3D Mesh and Textures
    const meshCacheKey = `${garmentId}_${shapeConfig.thickness}_${colorKey}`;

    Promise.all([
      buildInflatedGarmentGeometry(frontImgSrc, shapeConfig, meshCacheKey),
      createSurfaceTexture("front"),
      createSurfaceTexture("back"),
    ]).then(([geometry, frontTex, backTex]) => {
      if (isDisposed) return;

      const frontMat = new THREE.MeshStandardMaterial({
        map: frontTex,
        roughness: 0.65,
        metalness: 0.04,
        side: THREE.FrontSide,
      });

      const backMat = new THREE.MeshStandardMaterial({
        map: backTex,
        roughness: 0.65,
        metalness: 0.04,
        side: THREE.FrontSide,
      });

      const mesh = new THREE.Mesh(geometry, [frontMat, backMat]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.position.set(0, 0, 0);

      scene.add(mesh);
      garmentMeshRef.current = mesh;
      setIsLoading(false);
    });

    // 8. Animation & Render Loop (Pauses when tab hidden or modal closed)
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      if (isDisposed) return;
      rafIdRef.current = requestAnimationFrame(animate);

      // Pause render when browser tab is inactive
      if (document.visibilityState === "hidden") return;

      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Camera Smooth 600ms Transitions (Animated Angle Snapping)
      const anim = cameraAnimRef.current;
      if (anim.isAnimating) {
        const elapsed = currentTime - anim.startTime;
        const progress = Math.min(1, elapsed / anim.duration);
        // EaseInOutCubic
        const ease =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        const currentTheta = anim.startTheta + (anim.targetTheta - anim.startTheta) * ease;
        const currentPhi = anim.startPhi + (anim.targetPhi - anim.startPhi) * ease;

        camera.position.x = anim.radius * Math.sin(currentPhi) * Math.sin(currentTheta);
        camera.position.y = anim.radius * Math.cos(currentPhi);
        camera.position.z = anim.radius * Math.sin(currentPhi) * Math.cos(currentTheta);
        camera.lookAt(0, 0, 0);

        if (progress >= 1) {
          anim.isAnimating = false;
        }
      } else if (autoRotate && controlsRef.current) {
        // Slow continuous 360 rotation
        controls.autoRotate = true;
        controls.autoRotateSpeed = 2.0;
      } else {
        controls.autoRotate = false;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    rafIdRef.current = requestAnimationFrame(animate);

    // 9. Resize handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup and complete disposal
    return () => {
      isDisposed = true;
      window.removeEventListener("resize", handleResize);

      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      if (controlsRef.current) {
        controlsRef.current.dispose();
      }

      if (garmentMeshRef.current) {
        scene.remove(garmentMeshRef.current);
        garmentMeshRef.current.geometry.dispose();
        if (Array.isArray(garmentMeshRef.current.material)) {
          garmentMeshRef.current.material.forEach((m) => {
            const mat = m as THREE.MeshStandardMaterial;
            if (mat.map) mat.map.dispose();
            mat.dispose();
          });
        }
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.forceContextLoss();
      }

      sceneRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
    };
  }, [isOpen, hasWebGl, frontImgSrc, shapeConfig.thickness, createSurfaceTexture, garmentId, colorKey]);

  // Lighting Mode Controller (Procedural)
  useEffect(() => {
    const lights = lightsRef.current;
    if (!lights) return;

    if (lighting === "studio") {
      lights.ambientLight.color.setHex(0xfff6ec);
      lights.ambientLight.intensity = 0.95;
      lights.keyLight.color.setHex(0xfff5e6);
      lights.keyLight.intensity = 2.4;
      lights.fillLight.color.setHex(0xe8f0ff);
      lights.fillLight.intensity = 1.3;
      lights.rimLight.color.setHex(0xe8c98a); // Gold
      lights.rimLight.intensity = 2.6;
    } else if (lighting === "atelier") {
      lights.ambientLight.color.setHex(0xffeed6);
      lights.ambientLight.intensity = 0.85;
      lights.keyLight.color.setHex(0xffd8a8);
      lights.keyLight.intensity = 2.8;
      lights.fillLight.color.setHex(0xfce8d2);
      lights.fillLight.intensity = 1.4;
      lights.rimLight.color.setHex(0xf59e0b);
      lights.rimLight.intensity = 2.4;
    } else if (lighting === "daylight") {
      lights.ambientLight.color.setHex(0xffffff);
      lights.ambientLight.intensity = 1.1;
      lights.keyLight.color.setHex(0xffffff);
      lights.keyLight.intensity = 3.0;
      lights.fillLight.color.setHex(0xdbeafe);
      lights.fillLight.intensity = 1.8;
      lights.rimLight.color.setHex(0xfef08a);
      lights.rimLight.intensity = 2.0;
    } else if (lighting === "neon") {
      lights.ambientLight.color.setHex(0x181528);
      lights.ambientLight.intensity = 0.6;
      lights.keyLight.color.setHex(0x06b6d4); // Cyan
      lights.keyLight.intensity = 2.6;
      lights.fillLight.color.setHex(0xa855f7); // Purple
      lights.fillLight.intensity = 1.8;
      lights.rimLight.color.setHex(0xec4899); // Magenta
      lights.rimLight.intensity = 3.6;
    }
  }, [lighting]);

  // Smooth Camera Orbit to Specific Target Angle (~600ms)
  const rotateCameraToAngle = (targetDeg: number, label: string) => {
    const camera = cameraRef.current;
    if (!camera) return;

    setAutoRotate(false);
    setActiveViewLabel(label);

    const radius = Math.hypot(camera.position.x, camera.position.y, camera.position.z) || 4.6;
    const currentTheta = Math.atan2(camera.position.x, camera.position.z);
    let targetTheta = (targetDeg * Math.PI) / 180;

    // Shortest angular path
    while (targetTheta - currentTheta > Math.PI) targetTheta -= 2 * Math.PI;
    while (targetTheta - currentTheta < -Math.PI) targetTheta += 2 * Math.PI;

    cameraAnimRef.current = {
      isAnimating: true,
      startTime: performance.now(),
      duration: 600,
      startTheta: currentTheta,
      targetTheta,
      startPhi: Math.acos(Math.max(-1, Math.min(1, camera.position.y / radius))),
      targetPhi: Math.PI / 2, // eye level
      radius,
    };
  };

  // Double-Click on Canvas to Reset View to Front (0°)
  const handleDoubleClick = () => {
    rotateCameraToAngle(0, "Ön baxış (0°)");
  };

  // High-Resolution 2x HD Snapshot Download
  const handleDownloadSnapshot = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    setIsCapturing(true);

    setTimeout(() => {
      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      if (!renderer || !scene || !camera) {
        setIsCapturing(false);
        return;
      }

      renderer.render(scene, camera);
      const dataUrl = renderer.domElement.toDataURL("image/png");

      const link = document.createElement("a");
      link.download = `3D-Canli-Baxis-${garmentName.replace(/\s+/g, "_")}.png`;
      link.href = dataUrl;
      link.click();
      setIsCapturing(false);
    }, 150);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md">
        {/* Modal Window: Dark Obsidian/Brown Glass Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="relative w-full h-full sm:h-auto sm:max-w-4xl sm:aspect-[4/3] max-h-[95vh] rounded-none sm:rounded-3xl bg-[#181512]/95 border border-[#3d3228]/80 text-[#f7f2ea] shadow-[0_25px_60px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden"
        >
          {/* Subtle Ambient Gold Gradient Background */}
          <div className="absolute inset-0 bg-radial from-[#e8c98a]/8 via-transparent to-black/60 pointer-events-none" />

          {/* ========================================================= */}
          {/* TOP HEADER: EB Garamond Title, Subtitle, 360 Pill, Close */}
          {/* ========================================================= */}
          <div className="relative z-20 px-4 sm:px-6 py-4 border-b border-[#3d3228]/60 flex items-center justify-between gap-4 bg-gradient-to-b from-[#211c17] to-transparent">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-eb-garamond text-xl sm:text-2xl font-normal text-[#f7f2ea] tracking-wide">
                  3D Canlı Baxış
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e8c98a]/15 text-[#e8c98a] border border-[#e8c98a]/30 text-[10px] font-bold tracking-wider uppercase">
                  <Compass size={11} className="animate-spin-slow" />
                  <span>360° FƏZA</span>
                </span>
              </div>
              <p className="text-xs text-[#c4b5a3] mt-0.5">
                {garmentName} · <span className="text-[#e8c98a] font-medium">{activeViewLabel}</span>
              </p>
            </div>

            {/* Close Button: Top Right */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#2a241e] hover:bg-[#3d3228] text-[#e8c98a] border border-[#4a3d31] flex items-center justify-center transition active:scale-95 shadow-md"
              title="Bağla"
            >
              <X size={18} />
            </button>
          </div>

          {/* ========================================================= */}
          {/* 3D CANVAS STAGE VIEWPORT                                 */}
          {/* ========================================================= */}
          <div className="relative flex-1 w-full h-full min-h-[300px] flex items-center justify-center overflow-hidden">
            {hasWebGl ? (
              <div
                ref={mountRef}
                onDoubleClick={handleDoubleClick}
                className="w-full h-full cursor-grab active:cursor-grabbing select-none"
                title="Fırlatmaq üçün siçanla dartın, yaxınlaşdırmaq üçün təkəri fırladın, sıfırlamaq üçün ikiqat klikləyin"
              />
            ) : (
              /* Fallback if WebGL unavailable */
              <div className="p-6 text-center flex flex-col items-center gap-3">
                <img
                  src={frontImgSrc}
                  alt={garmentName}
                  className="w-48 h-48 object-contain drop-shadow-xl"
                />
                <span className="text-xs text-[#e8c98a] font-semibold">
                  Brauzeriniz WebGL dəstəkləmir — 2D önizləmə rejimi aktivdir.
                </span>
              </div>
            )}

            {/* Loading Indicator Spinner */}
            {isLoading && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#181512]/90 backdrop-blur-sm gap-3">
                <div className="w-10 h-10 border-2 border-[#e8c98a] border-t-transparent rounded-full animate-spin" />
                <span className="font-eb-garamond text-base text-[#e8c98a] tracking-wider animate-pulse">
                  3D hazırlanır…
                </span>
              </div>
            )}

            {/* Quick Helper Floating Tooltip */}
            <div className="absolute bottom-3 left-4 z-20 pointer-events-none hidden sm:flex items-center gap-1.5 text-[10px] text-[#a89b8c] bg-black/40 px-2.5 py-1 rounded-full border border-white/5 backdrop-blur-xs">
              <span>💡 İkiqat klik: mərkəzə sıfırla · Siçanla fırlat · Təkərlə yaxınlaşdır</span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* BOTTOM CONTROLS PANEL: Equal Heights & Uniform Spacing    */}
          {/* ========================================================= */}
          <div className="relative z-20 px-3 sm:px-6 py-3 border-t border-[#3d3228]/70 bg-gradient-to-t from-[#14110e] to-[#1f1a15] flex flex-wrap items-center justify-between gap-2.5 text-xs">
            
            {/* 1. Camera View Angle Buttons (Pill Group, Active White/Gold) */}
            <div className="flex items-center bg-[#251f1a] p-1 rounded-full border border-[#42362b]">
              <button
                type="button"
                onClick={() => rotateCameraToAngle(0, "Ön baxış (0°)")}
                className={`h-7 px-3 rounded-full font-semibold transition active:scale-95 text-[11px] ${
                  activeViewLabel.includes("Ön")
                    ? "bg-[#e8c98a] text-[#181512] font-bold shadow-xs"
                    : "text-[#c4b5a3] hover:text-white"
                }`}
              >
                Ön
              </button>
              <button
                type="button"
                onClick={() => rotateCameraToAngle(180, "Arxa baxış (180°)")}
                className={`h-7 px-3 rounded-full font-semibold transition active:scale-95 text-[11px] ${
                  activeViewLabel.includes("Arxa")
                    ? "bg-[#e8c98a] text-[#181512] font-bold shadow-xs"
                    : "text-[#c4b5a3] hover:text-white"
                }`}
              >
                Arxa
              </button>
              <button
                type="button"
                onClick={() => rotateCameraToAngle(90, "Sağ qol (90°)")}
                className={`h-7 px-3 rounded-full font-semibold transition active:scale-95 text-[11px] ${
                  activeViewLabel.includes("Sağ")
                    ? "bg-[#e8c98a] text-[#181512] font-bold shadow-xs"
                    : "text-[#c4b5a3] hover:text-white"
                }`}
              >
                Sağ
              </button>
              <button
                type="button"
                onClick={() => rotateCameraToAngle(-90, "Sol qol (-90°)")}
                className={`h-7 px-3 rounded-full font-semibold transition active:scale-95 text-[11px] ${
                  activeViewLabel.includes("Sol")
                    ? "bg-[#e8c98a] text-[#181512] font-bold shadow-xs"
                    : "text-[#c4b5a3] hover:text-white"
                }`}
              >
                Sol
              </button>
            </div>

            {/* 2. Auto-Rotate 360 Toggle Button */}
            <button
              type="button"
              onClick={() => setAutoRotate((prev) => !prev)}
              className={`h-9 px-3 rounded-full border transition active:scale-95 flex items-center gap-1.5 font-semibold text-[11px] ${
                autoRotate
                  ? "bg-[#e8c98a]/20 border-[#e8c98a] text-[#e8c98a]"
                  : "bg-[#251f1a] hover:bg-[#302822] border-[#42362b] text-[#c4b5a3]"
              }`}
              title="Avtomatik 360 dərəcə fırlanma"
            >
              {autoRotate ? <Pause size={13} /> : <Play size={13} />}
              <span>360° Dövr et</span>
            </button>

            {/* 3. Lighting Mode Selector Pill Group */}
            <div className="flex items-center bg-[#251f1a] p-1 rounded-full border border-[#42362b]">
              <button
                type="button"
                onClick={() => setLighting("studio")}
                className={`h-7 px-2.5 rounded-full font-semibold transition text-[11px] flex items-center gap-1 ${
                  lighting === "studio"
                    ? "bg-[#e8c98a] text-[#181512] font-bold shadow-xs"
                    : "text-[#c4b5a3] hover:text-white"
                }`}
                title="Studiya işıqlandırması"
              >
                <Sparkles size={11} />
                <span>Studiya</span>
              </button>
              <button
                type="button"
                onClick={() => setLighting("atelier")}
                className={`h-7 px-2.5 rounded-full font-semibold transition text-[11px] flex items-center gap-1 ${
                  lighting === "atelier"
                    ? "bg-[#e8c98a] text-[#181512] font-bold shadow-xs"
                    : "text-[#c4b5a3] hover:text-white"
                }`}
                title="Qızılı atelye ab-havası"
              >
                <Flame size={11} />
                <span>Atelye</span>
              </button>
              <button
                type="button"
                onClick={() => setLighting("daylight")}
                className={`h-7 px-2.5 rounded-full font-semibold transition text-[11px] flex items-center gap-1 ${
                  lighting === "daylight"
                    ? "bg-[#e8c98a] text-[#181512] font-bold shadow-xs"
                    : "text-[#c4b5a3] hover:text-white"
                }`}
                title="Açıq gün işığı"
              >
                <Sun size={11} />
                <span>Gün işığı</span>
              </button>
              <button
                type="button"
                onClick={() => setLighting("neon")}
                className={`h-7 px-2.5 rounded-full font-semibold transition text-[11px] flex items-center gap-1 ${
                  lighting === "neon"
                    ? "bg-[#e8c98a] text-[#181512] font-bold shadow-xs"
                    : "text-[#c4b5a3] hover:text-white"
                }`}
                title="Kiber neon işıqlandırması"
              >
                <Zap size={11} />
                <span>Neon</span>
              </button>
            </div>

            {/* 4. HD Snapshot 2x PNG Download Button */}
            <button
              type="button"
              onClick={handleDownloadSnapshot}
              disabled={isCapturing}
              className="h-9 px-3.5 rounded-full bg-[#2a231c] hover:bg-[#382f25] border border-[#e8c98a]/50 text-[#e8c98a] font-semibold text-[11px] flex items-center gap-1.5 transition active:scale-95 shadow-sm ml-auto sm:ml-0"
              title="Cari görünüşü 2x HD PNG formatında endir"
            >
              <Download size={13} />
              <span>{isCapturing ? "Saxlanılır…" : "HD Şəkil"}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
