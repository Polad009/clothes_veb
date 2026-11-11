// Renders the vector designs from designs.py to transparent 300 dpi PNG print files.
//   npx tsx scripts/media/render-designs.ts <designs_dir>
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const dir = process.argv[2];
const list: Record<string, { w: number; h: number; px: [number, number] }> = JSON.parse(
  fs.readFileSync(path.join(dir, 'designs.json'), 'utf8')
);

(async () => {
  for (const [name, d] of Object.entries(list)) {
    const svg = fs.readFileSync(path.join(dir, `${name}.svg`));
    const density = Math.round((72 * d.px[0]) / d.w);
    const full = await sharp(svg, { density, limitInputPixels: false })
      .resize(d.px[0], d.px[1], { fit: 'fill' })
      .png()
      .toBuffer();
    // trim the empty transparent canvas, keep a small margin: the print shop prints the artwork itself
    const trimmed = await sharp(full).trim({ threshold: 1 }).png().toBuffer();
    const t = await sharp(trimmed).metadata();
    const pad = Math.round(Math.max(t.width || 0, t.height || 0) * 0.02);
    await sharp(trimmed)
      .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .withMetadata({ density: 300 })
      .toFile(path.join(dir, `${name}.png`));
    const kb = Math.round(fs.statSync(path.join(dir, `${name}.png`)).size / 1024);
    const m = await sharp(path.join(dir, `${name}.png`)).metadata();
    console.log(`${name}.png ${m.width}x${m.height} (${((m.width || 0) / 300 * 2.54).toFixed(1)} cm wide at 300 dpi) ${kb} KB`);
  }
})();
