"use client";

/**
 * Client-side high-performance image preprocessor & IS-Net AI segmentation
 * Zero external APIs, 100% in-browser, fully open-source (MIT/Apache-2.0 compatible).
 */

export interface PreprocessResult {
  processedDataUrl: string;
  originalDataUrl: string;
  width: number;
  height: number;
  autoScale: number;
  isLowQuality: boolean;
  effectiveDpi: number;
}

/**
 * 1. Automatically trims empty or uniform color margins (autocrop)
 */
export function autoTrimCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return canvas;

  const w = canvas.width;
  const h = canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Check corner background color
  const tlR = data[0], tlG = data[1], tlB = data[2], tlA = data[3];
  const trR = data[(w - 1) * 4], trG = data[(w - 1) * 4 + 1], trB = data[(w - 1) * 4 + 2], trA = data[(w - 1) * 4 + 3];
  const blR = data[(h - 1) * w * 4], blG = data[(h - 1) * w * 4 + 1], blB = data[(h - 1) * w * 4 + 2], blA = data[(h - 1) * w * 4 + 3];
  const brR = data[((h - 1) * w + (w - 1)) * 4], brG = data[((h - 1) * w + (w - 1)) * 4 + 1], brB = data[((h - 1) * w + (w - 1)) * 4 + 2], brA = data[((h - 1) * w + (w - 1)) * 4 + 3];

  const avgBgR = (tlR + trR + blR + brR) / 4;
  const avgBgG = (tlG + trG + blG + brG) / 4;
  const avgBgB = (tlB + trB + blB + brB) / 4;
  const isAlphaBg = tlA < 20 && trA < 20 && blA < 20 && brA < 20;

  let minX = w, maxX = 0, minY = h, maxY = 0;
  let hasContent = false;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const a = data[idx + 3];
      let isContent = false;

      if (isAlphaBg) {
        if (a > 25) isContent = true;
      } else {
        if (a > 25) {
          const diff =
            Math.abs(data[idx] - avgBgR) +
            Math.abs(data[idx + 1] - avgBgG) +
            Math.abs(data[idx + 2] - avgBgB);
          if (diff > 18) isContent = true;
        }
      }

      if (isContent) {
        hasContent = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!hasContent || minX >= maxX || minY >= maxY) return canvas;

  // Add 4px safe margin
  minX = Math.max(0, minX - 4);
  minY = Math.max(0, minY - 4);
  maxX = Math.min(w - 1, maxX + 4);
  maxY = Math.min(h - 1, maxY + 4);

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;

  const croppedCanvas = document.createElement("canvas");
  croppedCanvas.width = cropW;
  croppedCanvas.height = cropH;
  const cCtx = croppedCanvas.getContext("2d");
  if (!cCtx) return canvas;

  cCtx.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
  return croppedCanvas;
}

/**
 * 2. Edge Bleed / Color Dilation & Alpha Mask Composite
 * Prevents white/gray halo around isolated objects by expanding foreground RGB 2-3px
 */
export function applyMaskWithAntiHalo(
  sourceCanvas: HTMLCanvasElement,
  maskBytes: Uint8ClampedArray,
  autoTrim = true
): HTMLCanvasElement {
  const w = sourceCanvas.width;
  const h = sourceCanvas.height;

  const outCanvas = document.createElement("canvas");
  outCanvas.width = w;
  outCanvas.height = h;

  const ctx = outCanvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return sourceCanvas;

  ctx.drawImage(sourceCanvas, 0, 0);
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Step 1: Color Bleed / Dilation into semi-transparent boundary
  // For pixels with 10 <= alpha <= 200, sample nearest high-confidence opaque pixel
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const alpha = maskBytes[i];
        if (alpha > 0 && alpha < 210) {
          // Check 4 cardinal neighbors for solid foreground color
          const neighbors = [i - 1, i + 1, i - w, i + w];
          for (const n of neighbors) {
            if (maskBytes[n] > 230) {
              const nIdx = n * 4;
              const curIdx = i * 4;
              data[curIdx] = data[nIdx];
              data[curIdx + 1] = data[nIdx + 1];
              data[curIdx + 2] = data[nIdx + 2];
              break;
            }
          }
        }
      }
    }
  }

  // Step 2: Apply final mask to alpha channel
  for (let i = 0; i < maskBytes.length; i++) {
    data[i * 4 + 3] = maskBytes[i];
  }

  ctx.putImageData(imgData, 0, 0);

  return autoTrim ? autoTrimCanvas(outCanvas) : outCanvas;
}

/**
 * 3. IS-Net Background Removal Web Worker Orchestrator
 * Fully client-side, zero server API calls, lazy-loads model, keeps UI 60fps responsive
 */
let workerInstance: Worker | null = null;

function getOrCreateWorker(): Worker {
  if (!workerInstance) {
    workerInstance = new Worker("/workers/rmbg-worker.js");
  }
  return workerInstance;
}

export function removeBackgroundWithISNet(
  imageSrc: string,
  onProgress?: (percent: number, statusText: string) => void
): Promise<{
  processedDataUrl: string;
  maskBytes: Uint8ClampedArray;
  width: number;
  height: number;
  originalCanvas: HTMLCanvasElement;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        return reject(new Error("Canvas context yaradıla bilmədi"));
      }
      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);

      const worker = getOrCreateWorker();
      const requestId = `rmbg_${Date.now()}`;

      const handleMessage = (e: MessageEvent) => {
        const data = e.data;
        if (!data) return;

        if (data.type === "progress") {
          onProgress?.(data.percent || 0, data.message || "Model yüklənir…");
        } else if (data.type === "status") {
          onProgress?.(50, data.message || "Emal edilir…");
        } else if (data.type === "complete" && data.id === requestId) {
          worker.removeEventListener("message", handleMessage);
          const maskBytes = new Uint8ClampedArray(data.mask);

          onProgress?.(100, "Fon təmizləndi!");
          const finalCanvas = applyMaskWithAntiHalo(canvas, maskBytes, true);

          resolve({
            processedDataUrl: finalCanvas.toDataURL("image/png"),
            maskBytes,
            width: w,
            height: h,
            originalCanvas: canvas,
          });
        } else if (data.type === "error" && data.id === requestId) {
          worker.removeEventListener("message", handleMessage);
          reject(new Error(data.error || "Fon silinmədi. Yenidən cəhd edin və ya fırça ilə əl ilə təmizləyin"));
        }
      };

      worker.addEventListener("message", handleMessage);

      // Send RGBA buffer to worker
      onProgress?.(5, "Model hazırlanır…");
      worker.postMessage(
        {
          type: "segment",
          id: requestId,
          rgbaBuffer: imgData.data.buffer,
          width: w,
          height: h,
        },
        [imgData.data.buffer]
      );
    };

    img.onerror = (e) => reject(new Error("Şəkil faylı oxuna bilmədi"));
    img.src = imageSrc;
  });
}

/**
 * 4. Auto-fit scale to occupy ~75% of printable chest area
 */
export function calculateAutoFitScale(
  artWidth: number,
  artHeight: number,
  maxAllowedWidth = 200,
  maxAllowedHeight = 200,
  coverage = 0.75
): number {
  if (artWidth <= 0 || artHeight <= 0) return 1.0;
  const targetW = maxAllowedWidth * coverage;
  const targetH = maxAllowedHeight * coverage;

  const scaleW = targetW / artWidth;
  const scaleH = targetH / artHeight;
  const baseScale = Math.min(scaleW, scaleH);

  // Normalize scale relative to standard 200px container
  const normalized = parseFloat((baseScale * (Math.max(artWidth, artHeight) / 100)).toFixed(2));
  return Math.max(0.5, Math.min(1.8, normalized || 1.0));
}
