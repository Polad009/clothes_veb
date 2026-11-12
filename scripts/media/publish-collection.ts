// Uploads the "Bakı Seriyası 01" images + print files to Supabase Storage and creates/updates
// the products (matched by product code, so it can be re-run safely).
//   npx tsx --env-file=.env.local scripts/media/publish-collection.ts <designs_dir> <mockups_dir> [<models_dir>] [--hide-old]
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { saveProduct } from '@/lib/db/products';
import { type Ink, type Product } from './collection';

const [designs, mockups, modelsDir] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const HIDE_OLD = process.argv.includes('--hide-old');
// <mockups_dir>/mockups.json comes from compose.py (real garment photos) or make-mockups.ts (drawn flats).
// A product missing from mockups.json has no image yet: it is kept but hidden from the shop.
// New folder per image set: the old files are cached for a year under their old names.
const IMG_DIR = process.env.IMG_DIR || 'products/collection01-photo';
const PRINT_DIR = process.env.PRINT_DIR || 'prints/collection01';
// which collection to publish (module exporting COLLECTION), e.g. ./collection-nox
const COLLECTION_FILE = process.env.COLLECTION_FILE || './collection';
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});
const BUCKET = 'product-images';
const mock: Record<string, Record<string, { front: string; back?: string }>> = JSON.parse(
  fs.readFileSync(path.join(mockups, 'mockups.json'), 'utf8')
);
// optional <models_dir>/model.json from model.py: photos of people wearing the product, per colour
const models: Record<string, Record<string, string[]>> =
  modelsDir && fs.existsSync(path.join(modelsDir, 'model.json')) ? JSON.parse(fs.readFileSync(path.join(modelsDir, 'model.json'), 'utf8')) : {};

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
  big: 'ön tərəf, böyük çap, tövsiyə olunan eni 28 sm',
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
    const kind = p.frontKind || (p.front === 'leg' ? 'leg' : p.front === 'cap' ? 'cap' : p.front === 'buta-chest' ? 'buta-chest' : 'chest');
    const label = kind === 'leg' ? 'Ayaq çapı' : kind === 'cap' ? 'Kepka dizaynı' : kind === 'big' ? 'Ön çap (böyük)' : 'Sinə çapı';
    parts.push([p.front, label, WIDTH[kind]]);
  }
  for (const [design, label, kind] of p.extraPrints || []) parts.push([design, label, WIDTH[kind]]);
  for (const [design, label, width] of parts) {
    for (const ink of inks) {
      // full-colour designs exist once (for black garments): use that file for every ink
      const base = fs.existsSync(path.join(designs, `${design}-${ink}.png`)) ? `${design}-${ink}` : `${design}-bone`;
      if (!fs.existsSync(path.join(designs, `${base}.png`))) continue;
      if (out.some((o) => o.url.endsWith(`/${base}.png`))) continue;
      const inkLabel = design.startsWith('chrome') ? 'rəngli xrom çap (DTF / DTG)' : INK_LABEL[ink];
      const png = await upload(path.join(designs, `${base}.png`), `${PRINT_DIR}/${base}.png`, 'image/png');
      if (png) out.push({ name: `${label} — ${inkLabel} (PNG)`, url: png, desc: `Şəffaf fon, 300 dpi · ${width}` });
      // photo-based designs have no vector version
      const svg = fs.existsSync(path.join(designs, `${base}.svg`))
        ? await upload(path.join(designs, `${base}.svg`), `${PRINT_DIR}/${base}.svg`, 'image/svg+xml')
        : null;
      if (svg) out.push({ name: `${label} — ${inkLabel} (SVG)`, url: svg, desc: `Vektor, istənilən ölçüdə · ${width}` });
    }
  }
  return out;
}

(async () => {
  const { COLLECTION } = (await import(COLLECTION_FILE)) as { COLLECTION: Product[] };
  const created: string[] = [];
  for (let i = 0; i < COLLECTION.length; i++) {
    const p = COLLECTION[i];
    const refCode = `HW-${p.key.toUpperCase()}`;
    console.log(`\n${p.name.az}  (${refCode})`);
    if (!mock[p.key] && !models[p.key]) {
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
      const m = mock[p.key]?.[c.name];
      const worn: string[] = [];
      for (const f of models[p.key]?.[c.name] || []) {
        const u = await upload(path.join(modelsDir, f), `${IMG_DIR}/${f}`, 'image/jpeg');
        if (u) worn.push(u);
      }
      let main = '';
      let second = '';
      if (m) {
        const front = await upload(path.join(mockups, m.front), `${IMG_DIR}/${m.front}`, 'image/png');
        const back = m.back ? await upload(path.join(mockups, m.back), `${IMG_DIR}/${m.back}`, 'image/png') : null;
        // tees: the back print is the statement, shown first; hoodies: the photo first, the back-print close-up after
        main = p.shape === 'hoodie' ? front! : back || front!;
        second = back ? (main === back ? front! : back) : '';
      }
      if (!main && !worn.length) continue;
      // plain product photo first, worn on a person on hover; sets have only worn photos
      const image = main || worn[0];
      const gallery = Array.from(new Set([image, ...worn, second].filter(Boolean)));
      colors.push({ name: c.name, hex: c.hex, image, hoverImage: gallery[1] || '', gallery });
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
