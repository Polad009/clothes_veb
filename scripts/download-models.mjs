import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const MODEL_URL = 'https://huggingface.co/SacredNoir/isnet-general-use-onnx/resolve/main/isnet-general-use-q8.onnx';
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const MODELS_DIR = path.join(PUBLIC_DIR, 'models');
const MODEL_DEST = path.join(MODELS_DIR, 'isnet-general-use-q8.onnx');
const ONNX_RUNTIME_SRC = path.join(process.cwd(), 'node_modules', 'onnxruntime-web', 'dist');
const ONNX_RUNTIME_DEST = path.join(PUBLIC_DIR, 'onnxruntime');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyOnnxRuntimeAssets() {
  console.log('📦 Copying onnxruntime-web assets to public/onnxruntime...');
  ensureDir(ONNX_RUNTIME_DEST);

  if (fs.existsSync(ONNX_RUNTIME_SRC)) {
    const files = fs.readdirSync(ONNX_RUNTIME_SRC);
    let copiedCount = 0;
    for (const file of files) {
      if (file.endsWith('.wasm') || file.endsWith('.mjs') || file.endsWith('.js')) {
        const srcFile = path.join(ONNX_RUNTIME_SRC, file);
        const destFile = path.join(ONNX_RUNTIME_DEST, file);
        fs.copyFileSync(srcFile, destFile);
        copiedCount++;
      }
    }
    console.log(`✓ Copied ${copiedCount} onnxruntime-web runtime/WASM assets to public/onnxruntime`);
  } else {
    console.warn('⚠️ onnxruntime-web dist folder not found in node_modules.');
  }
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) {
      const stats = fs.statSync(dest);
      if (stats.size > 10 * 1024 * 1024) {
        console.log(`✓ Model already exists at ${dest} (${(stats.size / 1024 / 1024).toFixed(1)} MB). Skipping download.`);
        return resolve();
      }
    }

    console.log(`⬇️ Downloading IS-Net ONNX model (Apache-2.0) from Hugging Face...`);
    console.log(`URL: ${url}`);

    const makeRequest = (currentUrl, redirectCount = 0) => {
      if (redirectCount > 8) {
        return reject(new Error('Too many redirects'));
      }

      const client = currentUrl.startsWith('https') ? https : http;
      client.get(currentUrl, (response) => {
        // Handle Redirects
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          const nextUrl = new URL(response.headers.location, currentUrl).toString();
          return makeRequest(nextUrl, redirectCount + 1);
        }

        if (response.statusCode !== 200) {
          return reject(new Error(`Download failed with status ${response.statusCode}: ${response.statusMessage}`));
        }

        const totalBytes = parseInt(response.headers['content-length'] || '0', 10);
        let downloadedBytes = 0;
        let lastReport = 0;

        const fileStream = fs.createWriteStream(dest);

        response.on('data', (chunk) => {
          downloadedBytes += chunk.length;
          const now = Date.now();
          if (now - lastReport > 1000 || downloadedBytes === totalBytes) {
            lastReport = now;
            const pct = totalBytes ? ((downloadedBytes / totalBytes) * 100).toFixed(1) : '?';
            const mb = (downloadedBytes / 1024 / 1024).toFixed(1);
            const totalMb = totalBytes ? (totalBytes / 1024 / 1024).toFixed(1) : '?';
            process.stdout.write(`\rDownloading: ${mb}MB / ${totalMb}MB (${pct}%)`);
          }
        });

        response.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          console.log('\n✓ Download complete: isnet-general-use-q8.onnx');
          resolve();
        });

        fileStream.on('error', (err) => {
          fs.unlink(dest, () => {});
          reject(err);
        });
      }).on('error', (err) => {
        reject(err);
      });
    };

    makeRequest(url);
  });
}

async function main() {
  try {
    ensureDir(MODELS_DIR);
    copyOnnxRuntimeAssets();
    await downloadFile(MODEL_URL, MODEL_DEST);
    console.log('🎉 Setup complete: All AI models and runtime assets are ready in /public');
  } catch (err) {
    console.error('❌ Model setup error:', err);
    process.exit(1);
  }
}

main();
