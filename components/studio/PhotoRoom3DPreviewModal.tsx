"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  X,
  Play,
  Pause,
  Download,
  Sparkles,
  Sun,
  Flame,
  Zap,
  Compass,
  Check,
  CheckSquare,
  Square,
  ArrowLeftRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StudioSurface, getStudioGarmentCategory, getStudioGarmentImage, PRINT_AREAS } from "@/components/studio/GarmentCanvas";
import { SideDesignState } from "@/app/studio/page";
import { getProductShapeConfig } from "@/lib/studio/product-shapes";
import { buildInflatedGarmentGeometry, dilateTextureEdges } from "@/lib/studio/mesh-generator";

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

  const activeFront = designs?.front || frontDesign || {
    uploadedImage: null,
    originalImage: null,
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
    originalImage: null,
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
    originalImage: null,
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
    originalImage: null,
    customText: "",
    textColor: "#111827",
    fontFamily: "Inter",
    scale: 0.8,
    posX: 0,
    posY: -20,
    rotation: 0,
  };

  const shapeConfig = getProductShapeConfig(garmentId);
  const isLimitedView = shapeConfig.view3d === "limited" || true;
  const hasSideImages = garmentCategory === "tshirt" || garmentCategory === "oversize";

  // UI state
  const [autoRotate, setAutoRotate] = useState(true);
  const [lighting, setLighting] = useState<LightingPreset>("studio");
  const [currentViewTarget, setCurrentViewTarget] = useState<"front" | "back">("front");
  const [activeSideView2D, setActiveSideView2D] = useState<"left" | "right" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportingHd, setIsExportingHd] = useState(false);
  const [transparentBgExport, setTransparentBgExport] = useState(true);
  const [hasWebGl, setHasWebGl] = useState(true);

  // Three.js object references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const garmentMeshRef = useRef<THREE.Mesh | null>(null);
  const decalMeshRef = useRef<THREE.Mesh | null>(null);
  const shadowMeshRef = useRef<THREE.Mesh | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // Decal texture canvases (2048x2048 dedicated layer)
  const frontDecalTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const backDecalTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const frontDecalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const backDecalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Base mockup image elements for silhouette masking
  const frontMockupImgRef = useRef<HTMLImageElement | null>(null);
  const backMockupImgRef = useRef<HTMLImageElement | null>(null);

  const lightsRef = useRef<{
    keyLight: THREE.DirectionalLight;
    fillLight: THREE.DirectionalLight;
    rimLight: THREE.DirectionalLight;
    ambientLight: THREE.AmbientLight;
  } | null>(null);

  // Camera smooth 600ms transition
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
    radius: 4.5,
  });

  const frontImgSrc = getStudioGarmentImage(garmentId, colorKey, "front");
  const backImgSrc = getStudioGarmentImage(garmentId, colorKey, "back");
  const leftSleeveImgSrc = getStudioGarmentImage(garmentId, colorKey, "leftSleeve");
  const rightSleeveImgSrc = getStudioGarmentImage(garmentId, colorKey, "rightSleeve");

  // WebGL support check
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      setHasWebGl(Boolean(gl));
    } catch {
      setHasWebGl(false);
    }
  }, []);

  // 1. Procedural Soft Contact Shadow Texture
  const createContactShadowTexture = (): THREE.CanvasTexture => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(256, 256, 10, 256, 256, 240);
      grad.addColorStop(0, "rgba(10, 8, 6, 0.45)");
      grad.addColorStop(0.35, "rgba(10, 8, 6, 0.25)");
      grad.addColorStop(0.7, "rgba(10, 8, 6, 0.08)");
      grad.addColorStop(1, "rgba(10, 8, 6, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    return texture;
  };

  // 2. Load Full-Resolution Base Mockup Textures with Edge Dilation
  const loadFullResMockupTexture = (
    imageSrc: string,
    isFront: boolean,
    maxAnisotropy: number
  ): Promise<THREE.CanvasTexture> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (isFront) frontMockupImgRef.current = img;
        else backMockupImgRef.current = img;

        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || 1254;
        canvas.height = img.naturalHeight || 1254;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          dilateTextureEdges(canvas, 3);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = Math.min(16, maxAnisotropy);
        texture.needsUpdate = true;
        resolve(texture);
      };
      img.onerror = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        const texture = new THREE.CanvasTexture(canvas);
        resolve(texture);
      };
      img.src = imageSrc;
    });
  };

  // 3. Render High-Resolution 2048x2048 Decal Canvas MASKED by Garment Alpha (Zero White Card Spillage)
  const updateDecalCanvas = useCallback(
    async (side: "front" | "back") => {
      const design = side === "front" ? activeFront : activeBack;
      const isFront = side === "front";
      let canvas = isFront ? frontDecalCanvasRef.current : backDecalCanvasRef.current;

      if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.width = 2048;
        canvas.height = 2048;
        if (isFront) frontDecalCanvasRef.current = canvas;
        else backDecalCanvasRef.current = canvas;
      }

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      // Start with completely transparent canvas
      ctx.clearRect(0, 0, 2048, 2048);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const hasImg = Boolean(design.uploadedImage || design.originalImage);
      const hasTxt = Boolean(design.customText?.trim());

      const cat = getStudioGarmentCategory(garmentId);
      const pAreas = PRINT_AREAS[cat] || PRINT_AREAS.tshirt;
      const area = pAreas[side] || pAreas.front || { left: 0.28, top: 0.30, width: 0.44, height: 0.46 };

      const printCenterX = (area.left + area.width / 2) * 2048;
      const printCenterY = (area.top + area.height / 2) * 2048;
      const pxRatio = 2048 / 450;

      const finishAndMask = () => {
        // MASK WITH GARMENT SILHOUETTE: Any pixel outside garment becomes 100% transparent!
        const baseImg = isFront ? frontMockupImgRef.current : backMockupImgRef.current;
        if (baseImg) {
          ctx.save();
          ctx.globalCompositeOperation = "destination-in";
          ctx.drawImage(baseImg, 0, 0, 2048, 2048);
          ctx.restore();
        }

        const tex = isFront ? frontDecalTextureRef.current : backDecalTextureRef.current;
        if (tex) {
          tex.needsUpdate = true;
        }
      };

      if (!hasImg && !hasTxt) {
        finishAndMask();
        return;
      }

      const drawText = () => {
        if (hasTxt) {
          ctx.save();
          const txtX = printCenterX + (design.textPosX || 0) * pxRatio;
          const txtY = printCenterY + (design.textPosY || 55) * pxRatio;
          const txtScale = (design.textScale || 1.0) * pxRatio * 0.95;
          const txtRot = ((design.textRotation || 0) * Math.PI) / 180;

          ctx.translate(txtX, txtY);
          ctx.rotate(txtRot);

          const fontSize = Math.round(22 * txtScale);
          ctx.font = `900 ${fontSize}px ${design.fontFamily || "Inter, sans-serif"}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Micro elevation shadow for realistic DTG print feel
          ctx.shadowColor = "rgba(0,0,0,0.35)";
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 2;

          ctx.fillStyle = design.textColor || "#111827";
          ctx.fillText(design.customText.toUpperCase(), 0, 0);
          ctx.restore();
        }
        finishAndMask();
      };

      const artworkSrc = design.originalImage || design.uploadedImage;
      if (artworkSrc) {
        const artImg = new Image();
        artImg.crossOrigin = "anonymous";
        artImg.onload = () => {
          ctx.save();
          const artX = printCenterX + (design.posX || 0) * pxRatio;
          const artY = printCenterY + (design.posY || 0) * pxRatio;
          const artScale = (design.scale || 1.0) * pxRatio * 0.96;
          const artRot = ((design.rotation || 0) * Math.PI) / 180;

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

          ctx.shadowColor = "rgba(0,0,0,0.38)";
          ctx.shadowBlur = 6;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 3;

          ctx.drawImage(artImg, -dw / 2, -dh / 2, dw, dh);
          ctx.restore();
          drawText();
        };
        artImg.onerror = () => drawText();
        artImg.src = artworkSrc;
      } else {
        drawText();
      }
    },
    [garmentId, activeFront, activeBack]
  );

  // Debounced Decal Texture Update (120ms)
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      updateDecalCanvas("front");
      updateDecalCanvas("back");
    }, 120);
    return () => clearTimeout(timer);
  }, [isOpen, updateDecalCanvas]);

  // Main Three.js Scene Setup
  useEffect(() => {
    if (!isOpen || !mountRef.current || !hasWebGl) return;

    let isDisposed = false;
    setIsLoading(true);

    const width = mountRef.current.clientWidth || 600;
    const height = mountRef.current.clientHeight || 600;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0, 0.08, 4.5);
    cameraRef.current = camera;

    // 3. Renderer with antialiasing and proper SRGB color space
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    // 4. OrbitControls with ±40° Azimuth Angle Constraints in "limited" mode
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 2.0;
    controls.maxDistance = 6.2;
    controls.maxPolarAngle = Math.PI / 1.7; // Constrain viewing from under floor
    controls.minPolarAngle = Math.PI / 8;
    controls.target.set(0, 0, 0);

    // Apply limited azimuth range around current target view
    const limitAngleRad = 40 * (Math.PI / 180);
    if (isLimitedView) {
      if (currentViewTarget === "front") {
        controls.minAzimuthAngle = -limitAngleRad;
        controls.maxAzimuthAngle = limitAngleRad;
      } else {
        controls.minAzimuthAngle = Math.PI - limitAngleRad;
        controls.maxAzimuthAngle = Math.PI + limitAngleRad;
      }
    } else {
      controls.minAzimuthAngle = -Infinity;
      controls.maxAzimuthAngle = Infinity;
    }

    controlsRef.current = controls;

    controls.addEventListener("start", () => {
      setAutoRotate(false);
    });

    // 5. Lighting: Soft natural studio setup
    const ambientLight = new THREE.AmbientLight(0xfff8f0, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff4e8, 1.8);
    keyLight.position.set(2.8, 3.2, 3.5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe8f2ff, 1.0);
    fillLight.position.set(-3.2, 1.0, 2.0);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xe8c98a, 2.0);
    rimLight.position.set(0, 2.8, -3.5);
    scene.add(rimLight);

    lightsRef.current = { keyLight, fillLight, rimLight, ambientLight };

    // 6. Soft Radial Contact Shadow
    const shadowTex = createContactShadowTexture();
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 2.2),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.55,
      })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.32;
    scene.add(shadowPlane);
    shadowMeshRef.current = shadowPlane;

    // 7. Load Watertight Geometry and Base Mockup Textures
    const meshCacheKey = `watertight_${garmentId}_${shapeConfig.thickness}`;

    Promise.all([
      buildInflatedGarmentGeometry(frontImgSrc, shapeConfig, meshCacheKey),
      loadFullResMockupTexture(frontImgSrc, true, maxAnisotropy),
      loadFullResMockupTexture(backImgSrc, false, maxAnisotropy),
    ]).then(([geometry, frontBaseTex, backBaseTex]) => {
      if (isDisposed) return;

      // LAYER 1: Base Garment Mesh (Watertight manifold, zero side gap)
      const frontBaseMat = new THREE.MeshStandardMaterial({
        map: frontBaseTex,
        transparent: true,
        alphaTest: 0.05,
        roughness: 0.72,
        metalness: 0.02,
        side: THREE.FrontSide,
      });

      const backBaseMat = new THREE.MeshStandardMaterial({
        map: backBaseTex,
        transparent: true,
        alphaTest: 0.05,
        roughness: 0.72,
        metalness: 0.02,
        side: THREE.FrontSide,
      });

      const baseMesh = new THREE.Mesh(geometry, [frontBaseMat, backBaseMat]);
      baseMesh.position.set(0, 0, 0);
      scene.add(baseMesh);
      garmentMeshRef.current = baseMesh;

      // LAYER 2: Separate 2048x2048 High-Resolution Design Decal Mesh
      const frontDecalCanvas = document.createElement("canvas");
      frontDecalCanvas.width = 2048;
      frontDecalCanvas.height = 2048;
      frontDecalCanvasRef.current = frontDecalCanvas;

      const backDecalCanvas = document.createElement("canvas");
      backDecalCanvas.width = 2048;
      backDecalCanvas.height = 2048;
      backDecalCanvasRef.current = backDecalCanvas;

      const frontDecalTex = new THREE.CanvasTexture(frontDecalCanvas);
      frontDecalTex.colorSpace = THREE.SRGBColorSpace;
      frontDecalTex.anisotropy = Math.min(16, maxAnisotropy);
      frontDecalTex.generateMipmaps = true;
      frontDecalTextureRef.current = frontDecalTex;

      const backDecalTex = new THREE.CanvasTexture(backDecalCanvas);
      backDecalTex.colorSpace = THREE.SRGBColorSpace;
      backDecalTex.anisotropy = Math.min(16, maxAnisotropy);
      backDecalTex.generateMipmaps = true;
      backDecalTextureRef.current = backDecalTex;

      const frontDecalMat = new THREE.MeshStandardMaterial({
        map: frontDecalTex,
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1.5,
        polygonOffsetUnits: -1.5,
        roughness: 0.62,
        metalness: 0.02,
        side: THREE.FrontSide,
      });

      const backDecalMat = new THREE.MeshStandardMaterial({
        map: backDecalTex,
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1.5,
        polygonOffsetUnits: -1.5,
        roughness: 0.62,
        metalness: 0.02,
        side: THREE.FrontSide,
      });

      const decalMesh = new THREE.Mesh(geometry, [frontDecalMat, backDecalMat]);
      decalMesh.position.set(0, 0, 0);
      scene.add(decalMesh);
      decalMeshRef.current = decalMesh;

      updateDecalCanvas("front");
      updateDecalCanvas("back");

      setIsLoading(false);
    });

    // 8. Animation & Render Loop (with gentle rocking sway in limited mode)
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      if (isDisposed) return;
      rafIdRef.current = requestAnimationFrame(animate);

      if (document.visibilityState === "hidden") return;

      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const anim = cameraAnimRef.current;
      if (anim.isAnimating) {
        const elapsed = currentTime - anim.startTime;
        const progress = Math.min(1, elapsed / anim.duration);
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
        if (isLimitedView) {
          // Gentle rocking sway between -25° and +25° around current target
          const baseTheta = currentViewTarget === "front" ? 0 : Math.PI;
          const swayTheta = baseTheta + Math.sin(currentTime * 0.001) * (25 * Math.PI / 180);
          const r = anim.radius || 4.5;
          camera.position.x = r * Math.sin(swayTheta);
          camera.position.z = r * Math.cos(swayTheta);
          camera.lookAt(0, 0, 0);
          controls.update();
        } else {
          controls.autoRotate = true;
          controls.autoRotateSpeed = 2.0;
        }
      } else if (controlsRef.current) {
        controls.autoRotate = false;
        controls.update();
      }

      renderer.render(scene, camera);
    };

    rafIdRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      isDisposed = true;
      window.removeEventListener("resize", handleResize);

      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (controlsRef.current) controlsRef.current.dispose();

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

      if (decalMeshRef.current) {
        scene.remove(decalMeshRef.current);
        if (Array.isArray(decalMeshRef.current.material)) {
          decalMeshRef.current.material.forEach((m) => {
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
  }, [isOpen, hasWebGl, frontImgSrc, backImgSrc, garmentId, shapeConfig.thickness, isLimitedView, currentViewTarget, updateDecalCanvas]);

  // Lighting Mode Controller
  useEffect(() => {
    const lights = lightsRef.current;
    if (!lights) return;

    if (lighting === "studio") {
      lights.ambientLight.color.setHex(0xfff8f0);
      lights.ambientLight.intensity = 0.9;
      lights.keyLight.color.setHex(0xfff4e8);
      lights.keyLight.intensity = 1.8;
      lights.fillLight.color.setHex(0xe8f2ff);
      lights.fillLight.intensity = 1.0;
      lights.rimLight.color.setHex(0xe8c98a);
      lights.rimLight.intensity = 2.0;
    } else if (lighting === "atelier") {
      lights.ambientLight.color.setHex(0xffeed6);
      lights.ambientLight.intensity = 0.85;
      lights.keyLight.color.setHex(0xffd8a8);
      lights.keyLight.intensity = 2.2;
      lights.fillLight.color.setHex(0xfce8d2);
      lights.fillLight.intensity = 1.2;
      lights.rimLight.color.setHex(0xf59e0b);
      lights.rimLight.intensity = 2.0;
    } else if (lighting === "daylight") {
      lights.ambientLight.color.setHex(0xffffff);
      lights.ambientLight.intensity = 1.0;
      lights.keyLight.color.setHex(0xffffff);
      lights.keyLight.intensity = 2.2;
      lights.fillLight.color.setHex(0xdbeafe);
      lights.fillLight.intensity = 1.4;
      lights.rimLight.color.setHex(0xfef08a);
      lights.rimLight.intensity = 1.6;
    } else if (lighting === "neon") {
      lights.ambientLight.color.setHex(0x181528);
      lights.ambientLight.intensity = 0.55;
      lights.keyLight.color.setHex(0x06b6d4);
      lights.keyLight.intensity = 2.2;
      lights.fillLight.color.setHex(0xa855f7);
      lights.fillLight.intensity = 1.6;
      lights.rimLight.color.setHex(0xec4899);
      lights.rimLight.intensity = 3.0;
    }
  }, [lighting]);

  // Smooth Camera Orbit to Specific Target Angle (~600ms) with Azimuth Constraints
  const rotateCameraToAngle = (targetDeg: number, targetKey: "front" | "back") => {
    setActiveSideView2D(null);
    const camera = cameraRef.current;
    if (!camera) return;

    setAutoRotate(false);
    setCurrentViewTarget(targetKey);

    const controls = controlsRef.current;
    if (controls && isLimitedView) {
      const limitAngleRad = 40 * (Math.PI / 180);
      if (targetKey === "front") {
        controls.minAzimuthAngle = -limitAngleRad;
        controls.maxAzimuthAngle = limitAngleRad;
      } else {
        controls.minAzimuthAngle = Math.PI - limitAngleRad;
        controls.maxAzimuthAngle = Math.PI + limitAngleRad;
      }
    }

    const radius = Math.hypot(camera.position.x, camera.position.y, camera.position.z) || 4.5;
    const currentTheta = Math.atan2(camera.position.x, camera.position.z);
    let targetTheta = (targetDeg * Math.PI) / 180;

    while (targetTheta - currentTheta > Math.PI) targetTheta -= 2 * Math.PI;
    while (targetTheta - currentTheta < -Math.PI) targetTheta += 2 * Math.PI;

    cameraAnimRef.current = {
      isAnimating: true,
      startTime: performance.now(),
      duration: 600,
      startTheta: currentTheta,
      targetTheta,
      startPhi: Math.acos(Math.max(-1, Math.min(1, camera.position.y / radius))),
      targetPhi: Math.PI / 2,
      radius,
    };
  };

  const handleDoubleClick = () => {
    rotateCameraToAngle(0, "front");
  };

  // Dedicated Offscreen 3x (2800px) Ultra-HD Image Export
  const handleExportUltraHd = async () => {
    if (!sceneRef.current || !cameraRef.current) return;
    setIsExportingHd(true);

    await new Promise((resolve) => setTimeout(resolve, 80));

    try {
      const exportWidth = 2800;
      const exportHeight = 2800;

      const offscreenRenderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: false,
        powerPreference: "high-performance",
      });
      offscreenRenderer.setSize(exportWidth, exportHeight);
      offscreenRenderer.setPixelRatio(1);
      offscreenRenderer.outputColorSpace = THREE.SRGBColorSpace;
      offscreenRenderer.toneMapping = THREE.ACESFilmicToneMapping;
      offscreenRenderer.toneMappingExposure = 1.0;

      const currentCamera = cameraRef.current;
      const exportCamera = currentCamera.clone();
      exportCamera.aspect = 1.0;
      exportCamera.updateProjectionMatrix();

      const shadow = shadowMeshRef.current;
      if (transparentBgExport && shadow) {
        shadow.visible = false;
      }

      offscreenRenderer.render(sceneRef.current, exportCamera);
      const dataUrl = offscreenRenderer.domElement.toDataURL("image/png");

      if (transparentBgExport && shadow) {
        shadow.visible = true;
      }

      const link = document.createElement("a");
      link.download = `HD-3D-Baxis-${garmentName.replace(/\s+/g, "_")}-${transparentBgExport ? "seffaf" : "studiya"}.png`;
      link.href = dataUrl;
      link.click();

      offscreenRenderer.dispose();
      offscreenRenderer.forceContextLoss();
    } catch (e) {
      console.error("HD export error:", e);
    } finally {
      setIsExportingHd(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md">
        {/* Modal Window: Luxury Obsidian/Brown Glass Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="relative w-full h-full sm:h-auto sm:max-w-4xl sm:aspect-[4/3] max-h-[95vh] rounded-none sm:rounded-3xl bg-[#181512]/95 border border-[#3d3228]/80 text-[#f7f2ea] shadow-[0_25px_60px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden"
        >
          {/* Subtle Ambient Gold Gradient */}
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
                {garmentName} ·{" "}
                <span className="text-[#e8c98a] font-medium">
                  {activeSideView2D === "left"
                    ? "Sol qol (Yan baxış)"
                    : activeSideView2D === "right"
                    ? "Sağ qol (Yan baxış)"
                    : currentViewTarget === "front"
                    ? "Ön baxış (±40° bucaq)"
                    : "Arxa baxış (±40° bucaq)"}
                </span>
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
            {/* 2D Side View Overlay Mode (If User Clicks Sol/Sağ) */}
            {activeSideView2D ? (
              <div className="relative w-full h-full flex items-center justify-center p-6 animate-in fade-in duration-200">
                <div className="relative max-w-sm aspect-square w-full flex items-center justify-center">
                  <img
                    src={activeSideView2D === "left" ? leftSleeveImgSrc : rightSleeveImgSrc}
                    alt="Side Mockup"
                    className="max-h-full max-w-full object-contain drop-shadow-2xl select-none pointer-events-none"
                  />
                  {/* Side Print Artwork */}
                  {((activeSideView2D === "left" ? activeLeftSleeve : activeRightSleeve).uploadedImage ||
                    (activeSideView2D === "left" ? activeLeftSleeve : activeRightSleeve).originalImage) && (
                    <img
                      src={
                        (activeSideView2D === "left" ? activeLeftSleeve : activeRightSleeve).originalImage ||
                        (activeSideView2D === "left" ? activeLeftSleeve : activeRightSleeve).uploadedImage ||
                        ""
                      }
                      alt="Side Print"
                      className="absolute max-w-[28%] max-h-[28%] object-contain drop-shadow-md select-none pointer-events-none"
                      style={{
                        transform: `translate(${activeSideView2D === "left" ? "-15px" : "15px"}, -20px) scale(${
                          (activeSideView2D === "left" ? activeLeftSleeve : activeRightSleeve).scale || 0.8
                        })`,
                      }}
                    />
                  )}
                </div>
              </div>
            ) : hasWebGl ? (
              <div
                ref={mountRef}
                onDoubleClick={handleDoubleClick}
                className="w-full h-full cursor-grab active:cursor-grabbing select-none"
                title="Fırlatmaq üçün siçanla dartın (±40° məhdud bucaq), yaxınlaşdırmaq üçün təkəri fırladın, sıfırlamaq üçün ikiqat klikləyin"
              />
            ) : (
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

            {/* HD Export Indicator */}
            {isExportingHd && (
              <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#181512]/92 backdrop-blur-md gap-3">
                <div className="w-12 h-12 border-3 border-[#e8c98a] border-t-transparent rounded-full animate-spin" />
                <span className="font-eb-garamond text-lg text-[#e8c98a] tracking-wider animate-pulse">
                  HD hazırlanır… (2800px)
                </span>
              </div>
            )}

            {/* Sub-window subtle translucent disclaimer note */}
            <div className="absolute bottom-2 inset-x-0 z-20 pointer-events-none flex items-center justify-center px-4">
              <span className="text-[10px] text-[#8e8072]/85 bg-black/40 px-3 py-0.5 rounded-full backdrop-blur-xs border border-white/5 tracking-wide">
                Önizləmə təxminidir. Son çap atelyedə dəqiqləşdirilir.
              </span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* BOTTOM CONTROLS PANEL: Equal Heights & Uniform Spacing    */}
          {/* ========================================================= */}
          <div className="relative z-20 px-3 sm:px-6 py-3 border-t border-[#3d3228]/70 bg-gradient-to-t from-[#14110e] to-[#1f1a15] flex flex-wrap items-center justify-between gap-2.5 text-xs">
            
            {/* 1. Camera View Angle Buttons */}
            <div className="flex items-center bg-[#251f1a] p-1 rounded-full border border-[#42362b]">
              <button
                type="button"
                onClick={() => rotateCameraToAngle(0, "front")}
                className={`h-7 px-3 rounded-full font-semibold transition active:scale-95 text-[11px] ${
                  !activeSideView2D && currentViewTarget === "front"
                    ? "bg-[#e8c98a] text-[#181512] font-bold shadow-xs"
                    : "text-[#c4b5a3] hover:text-white"
                }`}
              >
                Ön
              </button>
              <button
                type="button"
                onClick={() => rotateCameraToAngle(180, "back")}
                className={`h-7 px-3 rounded-full font-semibold transition active:scale-95 text-[11px] ${
                  !activeSideView2D && currentViewTarget === "back"
                    ? "bg-[#e8c98a] text-[#181512] font-bold shadow-xs"
                    : "text-[#c4b5a3] hover:text-white"
                }`}
              >
                Arxa
              </button>

              {/* Show Sağ and Sol buttons ONLY if product has side images (T-shirt & Oversize) */}
              {hasSideImages && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setAutoRotate(false);
                      setActiveSideView2D("right");
                    }}
                    className={`h-7 px-3 rounded-full font-semibold transition active:scale-95 text-[11px] ${
                      activeSideView2D === "right"
                        ? "bg-[#e8c98a] text-[#181512] font-bold shadow-xs"
                        : "text-[#c4b5a3] hover:text-white"
                    }`}
                    title="Sağ qolun 2D yan görünüşü"
                  >
                    Sağ qol
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAutoRotate(false);
                      setActiveSideView2D("left");
                    }}
                    className={`h-7 px-3 rounded-full font-semibold transition active:scale-95 text-[11px] ${
                      activeSideView2D === "left"
                        ? "bg-[#e8c98a] text-[#181512] font-bold shadow-xs"
                        : "text-[#c4b5a3] hover:text-white"
                    }`}
                    title="Sol qolun 2D yan görünüşü"
                  >
                    Sol qol
                  </button>
                </>
              )}
            </div>

            {/* 2. Auto-Rotate 360 / Sway Toggle Button */}
            <button
              type="button"
              onClick={() => {
                setActiveSideView2D(null);
                setAutoRotate((prev) => !prev);
              }}
              className={`h-9 px-3 rounded-full border transition active:scale-95 flex items-center gap-1.5 font-semibold text-[11px] ${
                autoRotate
                  ? "bg-[#e8c98a]/20 border-[#e8c98a] text-[#e8c98a]"
                  : "bg-[#251f1a] hover:bg-[#302822] border-[#42362b] text-[#c4b5a3]"
              }`}
              title="Avtomatik yırğalanma / fırlanma"
            >
              {autoRotate ? <Pause size={13} /> : <Play size={13} />}
              <span>{isLimitedView ? "Yırğalan" : "360° Dövr et"}</span>
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

            {/* 4. HD Export Section */}
            <div className="flex items-center gap-2 ml-auto sm:ml-0">
              <label
                onClick={() => setTransparentBgExport((prev) => !prev)}
                className="flex items-center gap-1.5 text-[10px] text-[#c4b5a3] cursor-pointer hover:text-white select-none"
                title="PNG ixracında fonu şəffaf et"
              >
                {transparentBgExport ? (
                  <CheckSquare size={13} className="text-[#e8c98a]" />
                ) : (
                  <Square size={13} className="text-stone-500" />
                )}
                <span>Şəffaf fon</span>
              </label>

              <button
                type="button"
                onClick={handleExportUltraHd}
                disabled={isExportingHd}
                className="h-9 px-3.5 rounded-full bg-[#2a231c] hover:bg-[#382f25] border border-[#e8c98a]/50 text-[#e8c98a] font-semibold text-[11px] flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                title="Cari görünüşü 3x (2800px) Ultra-HD PNG kimi endir"
              >
                <Download size={13} />
                <span>{isExportingHd ? "Hazırlanır…" : "HD Şəkil"}</span>
              </button>
            </div>
          </div>

          {/* Sub-window Disclaimer (Point 2) */}
          <div className="w-full text-center py-1.5 bg-[#181512]/80 border-t border-[#30261e]/50 shrink-0">
            <span className="text-[10px] text-[#c4b5a3]/60 tracking-wider select-none">
              Önizləmə təxminidir. Son çap atelyedə dəqiqləşdirilir.
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
