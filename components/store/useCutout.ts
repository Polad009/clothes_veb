"use client";

import { useEffect, useState } from "react";

// Whether an image has a transparent background (a cut-out garment). Only those look right on the
// dark banners; photos with a white background are left out there. Results are cached per URL.
const cache = new Map<string, boolean>();
const pending = new Map<string, Promise<boolean>>();

function probe(src: string): Promise<boolean> {
  if (cache.has(src)) return Promise.resolve(cache.get(src)!);
  if (pending.has(src)) return pending.get(src)!;
  const job = new Promise<boolean>((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const size = 24;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(false);
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        // corners and edge midpoints: transparent background shows up there
        const points = [[0, 0], [size - 1, 0], [0, size - 1], [size - 1, size - 1], [size >> 1, 0], [0, size >> 1]];
        const clear = points.filter(([x, y]) => data[(y * size + x) * 4 + 3] < 32).length;
        resolve(clear >= 4);
      } catch {
        resolve(false); // tainted canvas: cannot tell, treat as a photo
      }
    };
    img.onerror = () => resolve(false);
    img.src = src;
  }).then((v) => {
    cache.set(src, v);
    pending.delete(src);
    return v;
  });
  pending.set(src, job);
  return job;
}

/** Returns the subset of `srcs` that are cut-outs, in order; null while still checking. */
export function useCutouts(srcs: string[]): string[] | null {
  const key = srcs.join("|");
  const [result, setResult] = useState<string[] | null>(() => (srcs.every((s) => cache.has(s)) ? srcs.filter((s) => cache.get(s)) : null));
  useEffect(() => {
    let alive = true;
    Promise.all(srcs.map((s) => probe(s))).then((flags) => {
      if (alive) setResult(srcs.filter((_, i) => flags[i]));
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return result;
}
