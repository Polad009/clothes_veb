"use client";

/**
 * Client-side high-performance image preprocessor
 * Zero external APIs, 100% in-browser, fully open-source (MIT/Apache compatible).
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

  // Add 4px padding
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
 * 2. Flood-Fill Solid Background Removal with tolerance (0-60) and 1px edge feathering
 */
export function removeSolidBackground(
  canvas: HTMLCanvasElement,
  tolerance = 25
): HTMLCanvasElement {
  const w = canvas.width;
  const h = canvas.height;
  const outCanvas = document.createElement("canvas");
  outCanvas.width = w;
  outCanvas.height = h;

  const ctx = outCanvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return canvas;

  ctx.drawImage(canvas, 0, 0);
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Sample 4 corners to find background reference color
  const sampleCorner = (x: number, y: number) => {
    const idx = (y * w + x) * 4;
    return [data[idx], data[idx + 1], data[idx + 2]];
  };

  const corners = [
    sampleCorner(0, 0),
    sampleCorner(w - 1, 0),
    sampleCorner(0, h - 1),
    sampleCorner(w - 1, h - 1),
  ];

  const bgR = (corners[0][0] + corners[1][0] + corners[2][0] + corners[3][0]) / 4;
  const bgG = (corners[0][1] + corners[1][1] + corners[2][1] + corners[3][1]) / 4;
  const bgB = (corners[0][2] + corners[1][2] + corners[2][2] + corners[3][2]) / 4;

  const visited = new Uint8Array(w * h);
  const queue: number[] = [];

  // Seed boundary border pixels
  for (let x = 0; x < w; x++) {
    queue.push(0 * w + x);
    queue.push((h - 1) * w + x);
    visited[0 * w + x] = 1;
    visited[(h - 1) * w + x] = 1;
  }
  for (let y = 0; y < h; y++) {
    queue.push(y * w + 0);
    queue.push(y * w + (w - 1));
    visited[y * w + 0] = 1;
    visited[y * w + (w - 1)] = 1;
  }

  const tolSquared = tolerance * tolerance * 3;

  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    const cx = curr % w;
    const cy = Math.floor(curr / w);
    const pIdx = curr * 4;

    const r = data[pIdx];
    const g = data[pIdx + 1];
    const b = data[pIdx + 2];

    const dr = r - bgR;
    const dg = g - bgG;
    const db = b - bgB;
    const distSq = dr * dr + dg * dg + db * db;

    if (distSq <= tolSquared) {
      data[pIdx + 3] = 0; // Make transparent

      // Check 4 neighbors
      const neighbors = [
        cx > 0 ? cy * w + (cx - 1) : -1,
        cx < w - 1 ? cy * w + (cx + 1) : -1,
        cy > 0 ? (cy - 1) * w + cx : -1,
        cy < h - 1 ? (cy + 1) * w + cx : -1,
      ];

      for (const n of neighbors) {
        if (n !== -1 && !visited[n]) {
          visited[n] = 1;
          queue.push(n);
        }
      }
    }
  }

  // 1px Feathering / Edge softening
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      if (data[idx + 3] > 0) {
        const hasTransparentNeighbor =
          data[((y - 1) * w + x) * 4 + 3] === 0 ||
          data[((y + 1) * w + x) * 4 + 3] === 0 ||
          data[(y * w + (x - 1)) * 4 + 3] === 0 ||
          data[(y * w + (x + 1)) * 4 + 3] === 0;

        if (hasTransparentNeighbor) {
          data[idx + 3] = Math.round(data[idx + 3] * 0.75); // Soften boundary
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return outCanvas;
}

/**
 * 3. Auto-fit scale to occupy ~75% of printable chest area
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
