// Product images for the collection: the garment drawing with the design placed in its print area.
//   npx tsx scripts/media/make-mockups.ts <designs_dir> <out_dir>
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { mockupSvg, PRINT_AREAS } from '@/lib/studio/mockups';
import { COLLECTION } from './collection';

const [designs, out] = process.argv.slice(2);
const S = 1600; // output size (the drawing's 400 box x4)
const K = S / 400;
fs.mkdirSync(out, { recursive: true });

async function place(base: Buffer, designFile: string, area: { cx: number; cy: number; w: number; h: number }) {
  const meta = await sharp(designFile).metadata();
  const ratio = (meta.width || 1) / (meta.height || 1);
  let w = area.w * K;
  let h = w / ratio;
  if (h > area.h * K) {
    h = area.h * K;
    w = h * ratio;
  }
  const art = await sharp(designFile).resize(Math.round(w), Math.round(h)).png().toBuffer();
  return sharp(base)
    .composite([{ input: art, left: Math.round(area.cx * K - w / 2), top: Math.round(area.cy * K - h / 2) }])
    .png()
    .toBuffer();
}

async function garment(shape: string, hex: string, side: 'front' | 'back') {
  const svg = mockupSvg(shape as any, hex, side, `${shape}${side}`).replace('width="100%" height="100%"', `width="${S}" height="${S}"`);
  return sharp(Buffer.from(svg)).png().toBuffer();
}

(async () => {
  const manifest: Record<string, Record<string, { front: string; back?: string }>> = {};
  for (const p of COLLECTION) {
    manifest[p.key] = {};
    for (const c of p.colours) {
      const tag = `${p.key}-${c.ink === 'bone' ? 'qara' : c.name === 'Boz' ? 'boz' : 'ag'}`;
      const areas = PRINT_AREAS[p.shape as keyof typeof PRINT_AREAS];
      // front: chest mark (small area); joggers use the leg strip, the cap its front panel
      let front = await garment(p.shape, c.hex, 'front');
      if (p.front) {
        const area = p.shape === 'pants' || p.shape === 'cap' ? areas.front.large! : areas.front.small!;
        front = await place(front, path.join(designs, `${p.front}-${c.ink}.png`), area);
      }
      const frontFile = path.join(out, `${tag}-front.png`);
      await sharp(front).png({ compressionLevel: 9 }).toFile(frontFile);
      const entry: { front: string; back?: string } = { front: path.basename(frontFile) };
      if (p.back) {
        const back = await place(await garment(p.shape, c.hex, 'back'), path.join(designs, `${p.back}-${c.ink}.png`), areas.back.large!);
        const backFile = path.join(out, `${tag}-back.png`);
        await sharp(back).png({ compressionLevel: 9 }).toFile(backFile);
        entry.back = path.basename(backFile);
      }
      manifest[p.key][c.name] = entry;
      console.log(tag, Object.values(entry).join(' '));
    }
  }
  fs.writeFileSync(path.join(out, 'mockups.json'), JSON.stringify(manifest, null, 1));
})();
