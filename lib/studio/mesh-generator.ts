"use client";

import * as THREE from "three";
import { ProductShapeConfig } from "./product-shapes";

// In-memory cache for generated 3D meshes to avoid recomputation
const meshCache = new Map<string, THREE.BufferGeometry>();

/**
 * Fast 2-pass Distance Transform to compute distance from silhouette boundary
 */
function computeDistanceTransform(mask: Uint8Array, width: number, height: number): Float32Array {
  const dist = new Float32Array(width * height);
  const INF = 9999;

  // Initialize
  for (let i = 0; i < mask.length; i++) {
    dist[i] = mask[i] ? INF : 0;
  }

  // Pass 1: Top-Left to Bottom-Right
  for (let y = 1; y < height; y++) {
    for (let x = 1; x < width; x++) {
      const idx = y * width + x;
      if (dist[idx] > 0) {
        const top = dist[(y - 1) * width + x] + 1;
        const left = dist[y * width + (x - 1)] + 1;
        const topLeft = dist[(y - 1) * width + (x - 1)] + 1.414;
        dist[idx] = Math.min(dist[idx], top, left, topLeft);
      }
    }
  }

  // Pass 2: Bottom-Right to Top-Left
  for (let y = height - 2; y >= 0; y--) {
    for (let x = width - 2; x >= 0; x--) {
      const idx = y * width + x;
      if (dist[idx] > 0) {
        const bottom = dist[(y + 1) * width + x] + 1;
        const right = dist[y * width + (x + 1)] + 1;
        const bottomRight = dist[(y + 1) * width + (x + 1)] + 1.414;
        dist[idx] = Math.min(dist[idx], bottom, right, bottomRight);
      }
    }
  }

  return dist;
}

/**
 * Loads an image and extracts its binary silhouette mask
 */
function extractSilhouetteMask(
  img: HTMLImageElement,
  gridW: number,
  gridH: number
): { mask: Uint8Array; width: number; height: number; aspect: number } {
  const canvas = document.createElement("canvas");
  canvas.width = gridW;
  canvas.height = gridH;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return { mask: new Uint8Array(gridW * gridH), width: gridW, height: gridH, aspect: 1 };
  }

  ctx.drawImage(img, 0, 0, gridW, gridH);
  const imgData = ctx.getImageData(0, 0, gridW, gridH);
  const data = imgData.data;
  const mask = new Uint8Array(gridW * gridH);

  // Check corner pixels to determine if image background is transparent or solid
  let isAlphaTransparent = false;
  for (let i = 3; i < data.length; i += 16) {
    if (data[i] < 200) {
      isAlphaTransparent = true;
      break;
    }
  }

  const bgR = (data[0] + data[(gridW - 1) * 4] + data[(gridH - 1) * gridW * 4]) / 3;
  const bgG = (data[1] + data[(gridW - 1) * 4 + 1] + data[(gridH - 1) * gridW * 4 + 1]) / 3;
  const bgB = (data[2] + data[(gridW - 1) * 4 + 2] + data[(gridH - 1) * gridW * 4 + 2]) / 3;

  for (let y = 0; y < gridH; y++) {
    for (let x = 0; x < gridW; x++) {
      const idx = y * gridW + x;
      const pIdx = idx * 4;

      if (isAlphaTransparent) {
        mask[idx] = data[pIdx + 3] > 40 ? 1 : 0;
      } else {
        const diff =
          Math.abs(data[pIdx] - bgR) +
          Math.abs(data[pIdx + 1] - bgG) +
          Math.abs(data[pIdx + 2] - bgB);
        mask[idx] = diff > 45 ? 1 : 0;
      }
    }
  }

  return {
    mask,
    width: gridW,
    height: gridH,
    aspect: (img.naturalWidth || 1) / (img.naturalHeight || 1),
  };
}

/**
 * Builds an organic, inflated 3D watertight BufferGeometry directly from mockup silhouette
 */
export async function buildInflatedGarmentGeometry(
  imageSrc: string,
  shapeConfig: ProductShapeConfig,
  cacheKey: string
): Promise<THREE.BufferGeometry> {
  const existing = meshCache.get(cacheKey);
  if (existing) {
    return existing.clone();
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const gridW = 80;
      const gridH = 80;
      const { mask, width, height, aspect } = extractSilhouetteMask(img, gridW, gridH);
      const dist = computeDistanceTransform(mask, width, height);

      // Find max distance
      let maxDist = 1;
      for (let i = 0; i < dist.length; i++) {
        if (dist[i] > maxDist) maxDist = dist[i];
      }

      // Arrays for BufferGeometry
      const positions: number[] = [];
      const normals: number[] = [];
      const uvs: number[] = [];
      const indices: number[] = [];

      // Grid index lookup: -1 means transparent / outside
      const frontGrid = new Int32Array(width * height).fill(-1);
      const backGrid = new Int32Array(width * height).fill(-1);

      const targetHeight = 2.4;
      const targetWidth = targetHeight * aspect;
      const baseThickness = shapeConfig.thickness || 0.14;

      // 1. Create Front Surface Vertices
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          if (mask[idx] === 1) {
            const posX = ((x / (width - 1)) - 0.5) * targetWidth;
            const posY = (0.5 - (y / (height - 1))) * targetHeight;

            // Smooth organic inflation profile using sine easing
            const dNorm = Math.min(1, dist[idx] / Math.max(6, maxDist * 0.45));
            const depth = baseThickness * Math.sin(dNorm * (Math.PI / 2));

            const vIndex = positions.length / 3;
            frontGrid[idx] = vIndex;

            positions.push(posX, posY, depth);
            uvs.push(x / (width - 1), 1 - (y / (height - 1)));
            normals.push(0, 0, 1);
          }
        }
      }

      // 2. Create Back Surface Vertices
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          if (mask[idx] === 1) {
            const posX = ((x / (width - 1)) - 0.5) * targetWidth;
            const posY = (0.5 - (y / (height - 1))) * targetHeight;

            const dNorm = Math.min(1, dist[idx] / Math.max(6, maxDist * 0.45));
            const depth = -baseThickness * Math.sin(dNorm * (Math.PI / 2));

            const vIndex = positions.length / 3;
            backGrid[idx] = vIndex;

            positions.push(posX, posY, depth);
            // Flip U for back viewing
            uvs.push(1 - (x / (width - 1)), 1 - (y / (height - 1)));
            normals.push(0, 0, -1);
          }
        }
      }

      // 3. Triangulate Front and Back Faces
      const frontIndices: number[] = [];
      const backIndices: number[] = [];
      const rimIndices: number[] = [];

      for (let y = 0; y < height - 1; y++) {
        for (let x = 0; x < width - 1; x++) {
          const idxTL = y * width + x;
          const idxTR = y * width + (x + 1);
          const idxBL = (y + 1) * width + x;
          const idxBR = (y + 1) * width + (x + 1);

          // Front Triangles (CCW)
          const fTL = frontGrid[idxTL];
          const fTR = frontGrid[idxTR];
          const fBL = frontGrid[idxBL];
          const fBR = frontGrid[idxBR];

          if (fTL !== -1 && fTR !== -1 && fBL !== -1) {
            frontIndices.push(fTL, fBL, fTR);
          }
          if (fTR !== -1 && fBL !== -1 && fBR !== -1) {
            frontIndices.push(fTR, fBL, fBR);
          }

          // Back Triangles (CW when viewed from front, CCW when viewed from back)
          const bTL = backGrid[idxTL];
          const bTR = backGrid[idxTR];
          const bBL = backGrid[idxBL];
          const bBR = backGrid[idxBR];

          if (bTL !== -1 && bTR !== -1 && bBL !== -1) {
            backIndices.push(bTL, bTR, bBL);
          }
          if (bTR !== -1 && bBL !== -1 && bBR !== -1) {
            backIndices.push(bTR, bBR, bBL);
          }
        }
      }

      // 4. Bridge Perimeter Rim Edges between Front and Back
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          if (mask[idx] === 1) {
            // Check 4-connected neighbors for boundary
            const isTopEdge = y === 0 || mask[(y - 1) * width + x] === 0;
            const isRightEdge = x === width - 1 || mask[y * width + (x + 1)] === 0;
            const isBottomEdge = y === height - 1 || mask[(y + 1) * width + x] === 0;
            const isLeftEdge = x === 0 || mask[y * width + (x - 1)] === 0;

            const fCur = frontGrid[idx];
            const bCur = backGrid[idx];

            if (isRightEdge && y < height - 1 && mask[(y + 1) * width + x] === 1) {
              const fNext = frontGrid[(y + 1) * width + x];
              const bNext = backGrid[(y + 1) * width + x];
              if (fNext !== -1 && bNext !== -1) {
                rimIndices.push(fCur, fNext, bNext);
                rimIndices.push(fCur, bNext, bCur);
              }
            }

            if (isBottomEdge && x < width - 1 && mask[y * width + (x + 1)] === 1) {
              const fNext = frontGrid[y * width + (x + 1)];
              const bNext = backGrid[y * width + (x + 1)];
              if (fNext !== -1 && bNext !== -1) {
                rimIndices.push(fCur, bCur, bNext);
                rimIndices.push(fCur, bNext, fNext);
              }
            }

            if (isLeftEdge && y < height - 1 && mask[(y + 1) * width + x] === 1) {
              const fNext = frontGrid[(y + 1) * width + x];
              const bNext = backGrid[(y + 1) * width + x];
              if (fNext !== -1 && bNext !== -1) {
                rimIndices.push(fCur, bCur, bNext);
                rimIndices.push(fCur, bNext, fNext);
              }
            }

            if (isTopEdge && x < width - 1 && mask[y * width + (x + 1)] === 1) {
              const fNext = frontGrid[y * width + (x + 1)];
              const bNext = backGrid[y * width + (x + 1)];
              if (fNext !== -1 && bNext !== -1) {
                rimIndices.push(fCur, fNext, bNext);
                rimIndices.push(fCur, bNext, bCur);
              }
            }
          }
        }
      }

      // Assemble BufferGeometry
      const allIndices = [...frontIndices, ...backIndices, ...rimIndices];
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
      geometry.setIndex(allIndices);

      // Define multi-material groups
      geometry.clearGroups();
      geometry.addGroup(0, frontIndices.length, 0); // Material 0: Front
      geometry.addGroup(frontIndices.length, backIndices.length, 1); // Material 1: Back
      geometry.addGroup(frontIndices.length + backIndices.length, rimIndices.length, 0); // Material 0: Rim

      geometry.computeVertexNormals();

      // Center geometry around origin
      geometry.center();

      meshCache.set(cacheKey, geometry);
      resolve(geometry.clone());
    };

    img.onerror = () => {
      // Emergency fallback to soft curved plane
      const fallback = new THREE.PlaneGeometry(1.8, 2.2, 32, 32);
      resolve(fallback);
    };

    img.src = imageSrc;
  });
}
