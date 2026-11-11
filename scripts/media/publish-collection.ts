// Uploads the "Bakı Seriyası 01" images + print files to Supabase Storage and creates/updates
// the products (matched by product code, so it can be re-run safely).
//   npx tsx --env-file=.env.local scripts/media/publish-collection.ts <designs_dir> <mockups_dir> [--hide-old]
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { saveProduct } from '@/lib/db/products';
import { COLLECTION, type Ink, type Product } from './collection';

const [designs, mockups] = process.argv.slice(2);
const HIDE_OLD = process.argv.includes('--hide-old');
// <mockups_dir>/mockups.json comes from compose.py (real garment photos) or make-mockups.ts (drawn flats).
// A product missing from mockups.json has no image yet: it is kept but hidden from the shop.
// New folder per image set: the old files are cached for a year under their old names.
const IMG_DIR = process.env.IMG_DIR || 'products/collection01-photo';
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});
const BUCKET = 'product-images';
const mock: Record<string, Record<string, { front: string; back?: string }>> = JSON.parse(
  fs.readFileSync(path.join(mockups, 'mockups.json'), 'utf8')
);

async function upload(local: string, remote: string, type: string): Promise<string | null> {
  const { error } = await sb.storage.from(BUCKET).upload(remote, fs.readFileSync(local), { contentType: type, upsert: true, cacheControl: '31536000' });
  if (error) {
    console.warn(`  ! ${remote}: ${error.message}`);
    return null;
  }
  return sb.storage.from(BUCKET).getPublicUrl(remote).data.publicUrl;
}

const INK_LABEL: Record<Ink, string> = { bone: 'açıq rəngli çap (qara geyim üçün)', ink: 'qara çap (açıq rəngli geyim üçün)' };
const WIDTH: Record<string, string> = {
  back: 'tövsiyə olunan eni: köynəkdə 30 sm, hudidə 28 sm',
  chest: 'sol sinə, tövsiyə olunan eni 9 sm',
  'buta-chest': 'sol sinə, tövsiyə olunan eni 6 sm',
  leg: 'sol ayaq, tövsiyə olunan uzunluğu 28 sm',
  cap: 'kepkanın önü, tövsiyə olunan eni 6 sm (tikmə də olar)',
};
const CARE = {
  az: '30°C-də tərsinə çevirib yuyun, çapın üstündən ütüləməyin.',
  en: 'Wash inside out at 30°C; do not iron over the print.',
  ru: 'Стирать наизнанку при 30°C, не гладить по принту.',
  tr: 'Ters çevirerek 30°C\'de yıkayın; baskının üzerine ütü yapmayın.',
};

async function printFiles(p: Product) {
  const out: Array<{ name: string; url: string; desc: string }> = [];
  const inks = Array.from(new Set(p.colours.map((c) => c.ink)));
  const parts: Array<[string, string, string]> = [];
  if (p.back) parts.push([p.back, 'Arxa çap', WIDTH.back]);
  if (p.front) {
    const kind = p.front === 'leg' ? 'leg' : p.front === 'cap' ? 'cap' : p.front === 'buta-chest' ? 'buta-chest' : 'chest';
    parts.push([p.front, kind === 'leg' ? 'Ayaq çapı' : kind === 'cap' ? 'Kepka dizaynı' : 'Sinə çapı', WIDTH[kind]]);
  }
  for (const [design, label, width] of parts) {
    for (const ink of inks) {
      const base = `${design}-${ink}`;
      const png = await upload(path.join(designs, `${base}.png`), `prints/collection01/${base}.png`, 'image/png');
      if (png) out.push({ name: `${label} — ${INK_LABEL[ink]} (PNG)`, url: png, desc: `Şəffaf fon, 300 dpi · ${width}` });
      const svg = await upload(path.join(designs, `${base}.svg`), `prints/collection01/${base}.svg`, 'image/svg+xml');
      if (svg) out.push({ name: `${label} — ${INK_LABEL[ink]} (SVG)`, url: svg, desc: `Vektor, istənilən ölçüdə · ${width}` });
    }
  }
  return out;
}

(async () => {
  const created: string[] = [];
  for (let i = 0; i < COLLECTION.length; i++) {
    const p = COLLECTION[i];
    const refCode = `HW-${p.key.toUpperCase()}`;
    console.log(`\n${p.name.az}  (${refCode})`);
    if (!mock[p.key]) {
      const { data: row } = await sb.from('products').select('id, extra').eq('ref_code', refCode).maybeSingle();
      if (row) {
        await sb.from('products').update({ extra: { ...(row.extra || {}), hidden: true } }).eq('id', row.id);
        created.push(row.id);
        console.log('  no photo yet: hidden from the shop (not deleted)');
      }
      continue;
    }
    const colors = [];
    for (const c of p.colours) {
      const m = mock[p.key][c.name];
      const front = await upload(path.join(mockups, m.front), `${IMG_DIR}/${m.front}`, 'image/png');
      const back = m.back ? await upload(path.join(mockups, m.back), `${IMG_DIR}/${m.back}`, 'image/png') : null;
      // tees: the back print is the statement, shown first; hoodies: the photo first, the back-print close-up on hover
      const main = p.shape === 'hoodie' ? front! : back || front!;
      const second = back ? (main === back ? front! : back) : '';
      colors.push({ name: c.name, hex: c.hex, image: main, hoverImage: second, gallery: [main, second].filter(Boolean) });
    }
    const layers = await printFiles(p);
    const { data: existing } = await sb.from('products').select('id').eq('ref_code', refCode).maybeSingle();
    const saved = await saveProduct({
      id: existing?.id,
      name: p.name.az,
      description: p.description.az,
      category: p.category,
      gender: 'unisex',
      price: p.price,
      refCode,
      badge: p.badge || '',
      fit: p.fit,
      composition: p.composition,
      care: CARE.az,
      inStock: true,
      trackStock: false,
      isNew: true,
      sortOrder: i + 1,
      hidden: false,
      sizes: p.sizes,
      colors,
      image: colors[0].image,
      images: [colors[0].image],
      hoverImage: colors[0].hoverImage,
      gallery: colors[0].gallery,
      printLayers: layers,
      translations: Object.fromEntries(
        (['en', 'ru', 'tr'] as const).map((l) => [
          l,
          { name: p.name[l], description: p.description[l], fit: p.fitT[l], composition: p.compositionT[l], care: CARE[l] },
        ])
      ),
    });
    created.push(saved.id);
    console.log(`  saved ${saved.slug} · ${layers.length} print files · ${colors.length} colour(s)`);
  }

  if (HIDE_OLD) {
    const { data: all } = await sb.from('products').select('id, name, extra');
    for (const row of all || []) {
      if (created.includes(row.id) || row.extra?.hidden === true) continue;
      await sb.from('products').update({ extra: { ...(row.extra || {}), hidden: true } }).eq('id', row.id);
      console.log(`hidden (not deleted): ${row.name}`);
    }
  }
})();
