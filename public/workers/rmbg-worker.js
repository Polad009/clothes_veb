// IS-Net Web Worker (Apache-2.0 model, MIT onnxruntime-web)
// 100% in-browser, WASM SIMD execution, zero external API calls.

importScripts('/onnxruntime/ort.all.min.js');

ort.env.wasm.wasmPaths = '/onnxruntime/';
ort.env.wasm.simd = true;

// Multi-threading requires SharedArrayBuffer (crossOriginIsolated === true)
const isIsolated = typeof crossOriginIsolated !== 'undefined' && crossOriginIsolated;
ort.env.wasm.numThreads = isIsolated
  ? Math.min(4, Math.max(1, (self.navigator.hardwareConcurrency || 2) - 1))
  : 1;

let session = null;
const CACHE_NAME = 'isnet-model-cache-v1';
const MODEL_URL = '/models/isnet-general-use-q8.onnx';

async function getOrDownloadModel() {
  let cache = null;
  try {
    if ('caches' in self) {
      cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(MODEL_URL);
      if (cachedResponse) {
        self.postMessage({ type: 'status', message: 'Model brauzer keşindən oxunur…' });
        return await cachedResponse.arrayBuffer();
      }
    }
  } catch (e) {
    console.warn('Cache Storage access error, falling back to network:', e);
  }

  self.postMessage({ type: 'status', message: 'Model yüklənir…' });
  const response = await fetch(MODEL_URL);
  if (!response.ok) {
    throw new Error(`Model faylı yüklənə bilmədi: HTTP ${response.status}`);
  }

  const contentLength = response.headers.get('content-length');
  const total = contentLength ? parseInt(contentLength, 10) : 44436071;

  if (!response.body) {
    const buf = await response.arrayBuffer();
    if (cache) {
      try {
        await cache.put(MODEL_URL, new Response(buf));
      } catch (err) {
        console.warn('Could not cache model:', err);
      }
    }
    return buf;
  }

  const reader = response.body.getReader();
  const chunks = [];
  let received = 0;
  let lastReportTime = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;

    const now = Date.now();
    if (now - lastReportTime > 150 || received === total) {
      lastReportTime = now;
      const percent = total > 0 ? Math.min(100, Math.round((received / total) * 100)) : 0;
      self.postMessage({ type: 'progress', percent, message: `Model yüklənir… ${percent}%` });
    }
  }

  const fullBuffer = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    fullBuffer.set(chunk, offset);
    offset += chunk.length;
  }

  if (cache) {
    try {
      await cache.put(MODEL_URL, new Response(fullBuffer.buffer));
    } catch (err) {
      console.warn('Could not save model to cache:', err);
    }
  }

  return fullBuffer.buffer;
}

async function initSession() {
  if (session) return session;

  const modelBuffer = await getOrDownloadModel();
  self.postMessage({ type: 'status', message: 'Süni intellekt mühərriki başladılır…' });

  // Pure WASM execution (IS-Net MaxPool ceil_mode is fully supported on WASM SIMD)
  try {
    session = await ort.InferenceSession.create(modelBuffer, {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all',
    });
    console.log('✓ IS-Net session created with WASM EP (threads:', ort.env.wasm.numThreads, ')');
    return session;
  } catch (err) {
    session = null;
    throw err;
  }
}

// Bilinear interpolation resize from srcW*srcH to dstW*dstH
function resizeMaskBilinear(srcMask, srcW, srcH, dstW, dstH) {
  const dst = new Float32Array(dstW * dstH);
  const xRatio = (srcW - 1) / Math.max(1, dstW - 1);
  const yRatio = (srcH - 1) / Math.max(1, dstH - 1);

  for (let y = 0; y < dstH; y++) {
    const srcY = y * yRatio;
    const y0 = Math.floor(srcY);
    const y1 = Math.min(srcH - 1, y0 + 1);
    const yWeight = srcY - y0;

    const rowOffset = y * dstW;
    const srcRow0 = y0 * srcW;
    const srcRow1 = y1 * srcW;

    for (let x = 0; x < dstW; x++) {
      const srcX = x * xRatio;
      const x0 = Math.floor(srcX);
      const x1 = Math.min(srcW - 1, x0 + 1);
      const xWeight = srcX - x0;

      const top = srcMask[srcRow0 + x0] * (1 - xWeight) + srcMask[srcRow0 + x1] * xWeight;
      const btm = srcMask[srcRow1 + x0] * (1 - xWeight) + srcMask[srcRow1 + x1] * xWeight;
      dst[rowOffset + x] = top * (1 - yWeight) + btm * yWeight;
    }
  }
  return dst;
}

self.onmessage = async (e) => {
  const { type, id } = e.data;

  if (type === 'reset') {
    session = null;
    self.postMessage({ type: 'reset_complete', id });
    return;
  }

  if (type === 'init') {
    try {
      await initSession();
      self.postMessage({ type: 'ready', id });
    } catch (err) {
      session = null;
      self.postMessage({
        type: 'error',
        id,
        error: 'Fon silinmədi. Yenidən cəhd edin və ya fırça ilə əl ilə təmizləyin',
      });
    }
    return;
  }

  if (type === 'segment') {
    const { rgbaBuffer, width, height } = e.data;
    try {
      const sess = await initSession();
      self.postMessage({ type: 'status', message: 'Fon silinir… 5-15 saniyə çəkə bilər' });

      const rgba = new Uint8ClampedArray(rgbaBuffer);
      const TARGET_SIZE = 1024;

      // 1. Aspect-preserving Letterbox to 1024x1024
      const scale = TARGET_SIZE / Math.max(width, height);
      const newW = Math.round(width * scale);
      const newH = Math.round(height * scale);
      const padX = Math.floor((TARGET_SIZE - newW) / 2);
      const padY = Math.floor((TARGET_SIZE - newH) / 2);

      // Pre-scale image to newW x newH
      const tempR = new Float32Array(newW * newH);
      const tempG = new Float32Array(newW * newH);
      const tempB = new Float32Array(newW * newH);

      const xRatio = (width - 1) / Math.max(1, newW - 1);
      const yRatio = (height - 1) / Math.max(1, newH - 1);

      for (let y = 0; y < newH; y++) {
        const srcY = Math.min(height - 1, Math.round(y * yRatio));
        const srcRow = srcY * width;
        const dstRow = y * newW;
        for (let x = 0; x < newW; x++) {
          const srcX = Math.min(width - 1, Math.round(x * xRatio));
          const idx = (srcRow + srcX) * 4;
          tempR[dstRow + x] = rgba[idx] / 255.0;
          tempG[dstRow + x] = rgba[idx + 1] / 255.0;
          tempB[dstRow + x] = rgba[idx + 2] / 255.0;
        }
      }

      // Normalization according to IS-Net spec:
      // mean = [0.485, 0.456, 0.406], std = [0.229, 0.224, 0.225]
      const tensorData = new Float32Array(1 * 3 * TARGET_SIZE * TARGET_SIZE);
      const channelSize = TARGET_SIZE * TARGET_SIZE;
      const gOffset = channelSize;
      const bOffset = channelSize * 2;

      // Default background padding normalized (neutral gray)
      const padR = (0.5 - 0.485) / 0.229;
      const padG = (0.5 - 0.456) / 0.224;
      const padB = (0.5 - 0.406) / 0.225;
      tensorData.fill(padR, 0, channelSize);
      tensorData.fill(padG, gOffset, gOffset + channelSize);
      tensorData.fill(padB, bOffset, bOffset + channelSize);

      for (let y = 0; y < newH; y++) {
        const dstRow = (padY + y) * TARGET_SIZE + padX;
        const srcRow = y * newW;
        for (let x = 0; x < newW; x++) {
          const sIdx = srcRow + x;
          const dIdx = dstRow + x;
          tensorData[dIdx] = (tempR[sIdx] - 0.485) / 0.229;
          tensorData[gOffset + dIdx] = (tempG[sIdx] - 0.456) / 0.224;
          tensorData[bOffset + dIdx] = (tempB[sIdx] - 0.406) / 0.225;
        }
      }

      // 2. Run ONNX Inference with WASM
      const inputTensor = new ort.Tensor('float32', tensorData, [1, 3, TARGET_SIZE, TARGET_SIZE]);
      const feeds = { [sess.inputNames[0]]: inputTensor };
      const outputMap = await sess.run(feeds);
      const rawOutput = outputMap[sess.outputNames[0]].data;

      // 3. Min-Max Normalization of Raw Output
      let minVal = Infinity;
      let maxVal = -Infinity;
      const totalPixels = TARGET_SIZE * TARGET_SIZE;

      for (let i = 0; i < totalPixels; i++) {
        const v = rawOutput[i];
        if (v < minVal) minVal = v;
        if (v > maxVal) maxVal = v;
      }

      const range = maxVal - minVal > 1e-6 ? maxVal - minVal : 1;

      // 4. Crop Letterbox Padding back to newW x newH
      const croppedMask = new Float32Array(newW * newH);
      for (let y = 0; y < newH; y++) {
        const srcRow = (padY + y) * TARGET_SIZE + padX;
        const dstRow = y * newW;
        for (let x = 0; x < newW; x++) {
          const norm = (rawOutput[srcRow + x] - minVal) / range;
          croppedMask[dstRow + x] = norm;
        }
      }

      // 5. Bilinear Resize Mask Back to EXACT Original Image Dimensions
      const fullMask = resizeMaskBilinear(croppedMask, newW, newH, width, height);

      // 6. Contrast Sharpening and Soft Feathering
      const maskBytes = new Uint8ClampedArray(width * height);
      for (let i = 0; i < fullMask.length; i++) {
        let v = fullMask[i];
        // Contrast enhancement curve centered around 0.5
        v = (v - 0.5) * 1.55 + 0.5;
        v = Math.max(0, Math.min(1, v));
        maskBytes[i] = Math.round(v * 255);
      }

      // Transfer binary mask back to main thread
      self.postMessage(
        {
          type: 'complete',
          id,
          mask: maskBytes.buffer,
          width,
          height,
        },
        [maskBytes.buffer]
      );
    } catch (err) {
      console.error('IS-Net segmentation error:', err);
      session = null; // Reset session on error so fresh attempt can retry
      self.postMessage({
        type: 'error',
        id,
        error: 'Fon silinmədi. Yenidən cəhd edin və ya fırça ilə əl ilə təmizləyin',
      });
    }
  }
};
