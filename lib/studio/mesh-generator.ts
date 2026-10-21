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
 * Separable Gaussian / Box Blur to smooth the depth field and eliminate normal banding
 */
function gaussianBlur2D(src: Float32Array, width: number, height: number, radius = 8): Float32Array {
  const tmp = new Float32Array(width * height);
  const out = new Float32Array(width * height);

  // Horizontal 1D pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;
      for (let k = -radius; k <= radius; k++) {
        const nx = x + k;
        if (nx >= 0 && nx < width) {
          sum += src[y * width + nx];
          count++;
        }
      }
      tmp[y * width + x] = sum / count;
    }
  }

  // Vertical 1D pass
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let sum = 0;
      let count = 0;
      for (let k = -radius; k <= radius; k++) {
        const ny = y + k;
        if (ny >= 0 && ny < height) {
          sum += tmp[ny * width + x];
          count++;
        }
      }
      out[y * width + x] = sum / count;
    }
  }

  return out;
}

/**
 * Dilates texture edges by 3px into transparent pixels to prevent white/gray halo around garment silhouette
 */
export function dilateTextureEdges(canvas: HTMLCanvasElement, radius = 3) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  const copy = new Uint8ClampedArray(data);

  for (let pass = 0; pass < radius; pass++) {
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = (y * w + x) * 4;
        if (copy[idx + 3] < 80) {
          const neighbors = [
            ((y - 1) * w + x) * 4,
            ((y + 1) * w + x) * 4,
            (y * w + (x - 1)) * 4,
            (y * w + (x + 1)) * 4,
          ];
          for (const n of neighbors) {
            if (copy[n + 3] >= 140) {
              data[idx] = copy[n];
              data[idx + 1] = copy[n + 1];
              data[idx + 2] = copy[n + 2];
              break;
            }
          }
        }
      }
    }
    copy.set(data);
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Builds an organic, high-density (200x200) watertight 3D BufferGeometry
 * Front and back meshes fuse together at z=0 with a smooth bevel perimeter band so there is zero gap when viewed from the side.
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
      const gridW = 200;
      const gridH = 200;

      const canvas = document.createElement("canvas");
      canvas.width = gridW;
      canvas.height = gridH;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        resolve(new THREE.PlaneGeometry(1.8, 2.4, 64, 64));
        return;
      }

      ctx.drawImage(img, 0, 0, gridW, gridH);
      const imgData = ctx.getImageData(0, 0, gridW, gridH);
      const data = imgData.data;

      const mask = new Uint8Array(gridW * gridH);
      for (let i = 0; i < gridW * gridH; i++) {
        mask[i] = data[i * 4 + 3] > 35 ? 1 : 0;
      }

      // Compute raw distance field
      const rawDist = computeDistanceTransform(mask, gridW, gridH);
      // Smooth distance field with Gaussian blur (radius ~10px) to prevent stepping
      const smoothDist = gaussianBlur2D(rawDist, gridW, gridH, 10);

      // Find max smoothed distance inside the garment body
      let maxDist = 1;
      for (let i = 0; i < smoothDist.length; i++) {
        if (smoothDist[i] > maxDist) maxDist = smoothDist[i];
      }

      const aspect = (img.naturalWidth || 1) / (img.naturalHeight || 1);
      const targetHeight = 2.4;
      const targetWidth = targetHeight * aspect;
      const baseThickness = shapeConfig.thickness || 0.14;

      const positions: number[] = [];
      const normals: number[] = [];
      const uvs: number[] = [];

      const frontIndices: number[] = [];
      const backIndices: number[] = [];
      const rimIndices: number[] = [];

      const vertexOffset = gridW * gridH;

      // 1. Generate Front Vertices (Indices 0 .. vertexOffset - 1)
      for (let y = 0; y < gridH; y++) {
        const v = 1 - y / (gridH - 1);
        const posY = (0.5 - y / (gridH - 1)) * targetHeight;

        for (let x = 0; x < gridW; x++) {
          const u = x / (gridW - 1);
          const posX = (u - 0.5) * targetWidth;
          const idx = y * gridW + x;

          const dVal = smoothDist[idx];
          // At the silhouette edge (dVal <= 0.8), depth seamlessly reaches 0
          const dNorm = dVal <= 0.8 ? 0 : Math.min(1, (dVal - 0.8) / Math.max(8, maxDist * 0.42));
          const depth = baseThickness * Math.sin(dNorm * (Math.PI / 2));

          positions.push(posX, posY, depth);
          uvs.push(u, v);
          normals.push(0, 0, 1);
        }
      }

      // 2. Generate Back Vertices (Indices vertexOffset .. 2 * vertexOffset - 1)
      for (let y = 0; y < gridH; y++) {
        const v = 1 - y / (gridH - 1);
        const posY = (0.5 - y / (gridH - 1)) * targetHeight;

        for (let x = 0; x < gridW; x++) {
          const u = x / (gridW - 1);
          const posX = (u - 0.5) * targetWidth;
          const idx = y * gridW + x;

          const dVal = smoothDist[idx];
          const dNorm = dVal <= 0.8 ? 0 : Math.min(1, (dVal - 0.8) / Math.max(8, maxDist * 0.42));
          // Back depth is negative; at edge (z=0) front and back meet identically
          const depth = -baseThickness * Math.sin(dNorm * (Math.PI / 2));

          positions.push(posX, posY, depth);
          uvs.push(1 - u, v);
          normals.push(0, 0, -1);
        }
      }

      // 3. Generate Triangles for Front and Back Faces
      for (let y = 0; y < gridH - 1; y++) {
        for (let x = 0; x < gridW - 1; x++) {
          const tl = y * gridW + x;
          const tr = y * gridW + (x + 1);
          const bl = (y + 1) * gridW + x;
          const br = (y + 1) * gridW + (x + 1);

          // Front Triangles (CCW)
          frontIndices.push(tl, bl, tr);
          frontIndices.push(tr, bl, br);

          // Back Triangles (CW when viewed from front, CCW when viewed from back)
          const btl = vertexOffset + tl;
          const btr = vertexOffset + tr;
          const bbl = vertexOffset + bl;
          const bbr = vertexOffset + br;

          backIndices.push(btl, btr, bbl);
          backIndices.push(btr, bbr, bbl);

          // 4. Watertight Rim Stitching: Connect perimeter boundaries between front and back
          // If this quad sits on the silhouette boundary
          const isBoundaryCell =
            (mask[tl] !== mask[br]) ||
            (mask[tr] !== mask[bl]);

          if (isBoundaryCell) {
            // Bridge front vertices to back vertices along the bevel edge
            rimIndices.push(tl, btl, tr);
            rimIndices.push(tr, btl, btr);
          }
        }
      }

      const allIndices = [...frontIndices, ...backIndices, ...rimIndices];

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
      geometry.setIndex(allIndices);

      // Define multi-material groups
      geometry.clearGroups();
      geometry.addGroup(0, frontIndices.length, 0); // Front Material
      geometry.addGroup(frontIndices.length, backIndices.length, 1); // Back Material
      geometry.addGroup(frontIndices.length + backIndices.length, rimIndices.length, 0); // Rim Bevel Material

      geometry.computeVertexNormals();
      geometry.center();

      meshCache.set(cacheKey, geometry);
      resolve(geometry.clone());
    };

    img.onerror = () => {
      const fallback = new THREE.PlaneGeometry(1.8, 2.4, 64, 64);
      resolve(fallback);
    };

    img.src = imageSrc;
  });
}
