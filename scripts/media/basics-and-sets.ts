// Fills the categories exisstore has nothing for:
//  - Şalvar: a plain black jogger, shown on the Pexels photos of a model wearing plain black joggers
//  - Dəst: two bundles of products already in the shop (images = the two products side by side)
//   npx tsx --env-file=.env.local scripts/media/basics-and-sets.ts <model_raw_dir>
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import { saveProduct } from '@/lib/db/products';

const RAW = process.argv[2];
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
const BUCKET = 'product-images';
const W = 1600, H = 2000;
const BG = { r: 236, g: 234, b: 230, alpha: 1 };

async function put(buf: Buffer, remote: string) {
  const { error } = await sb.storage.from(BUCKET).upload(remote, buf, { contentType: 'image/jpeg', upsert: true, cacheControl: '31536000' });
  if (error) throw new Error(`${remote}: ${error.message}`);
  return sb.storage.from(BUCKET).getPublicUrl(remote).data.publicUrl;
}

/** crop a 4:5 window from a photo; top = share of the photo height where the window starts */
async function crop45(file: string, top: number) {
  const m = await sharp(file).metadata();
  const w = m.width!, h = m.height!;
  const ch = Math.min(h, Math.round(w * 1.25));
  const y = Math.min(h - ch, Math.round(h * top));
  return sharp(file).extract({ left: 0, top: y, width: w, height: ch }).resize(W, H).jpeg({ quality: 86, progressive: true }).toBuffer();
}

async function fetchBuf(url: string) {
  const r = await fetch(url);
  return Buffer.from(await r.arrayBuffer());
}

/** two product photos side by side (or stacked) on the shop's light tile colour */
async function pair(a: Buffer, b: Buffer) {
  const half = { width: W / 2 - 30, height: H - 120, fit: 'contain' as const, background: BG };
  const left = await sharp(a).resize(half).toBuffer();
  const right = await sharp(b).resize(half).toBuffer();
  return sharp({ create: { width: W, height: H, channels: 4, background: BG } })
    .composite([{ input: left, left: 20, top: 60 }, { input: right, left: W / 2 + 10, top: 60 }])
    .jpeg({ quality: 86, progressive: true })
    .toBuffer();
}

async function upsert(refCode: string, data: Record<string, unknown>) {
  const { data: existing } = await sb.from('products').select('id').eq('ref_code', refCode).maybeSingle();
  return saveProduct({ id: existing?.id, refCode, gender: 'unisex', badge: '', inStock: true, trackStock: false, isNew: true, hidden: false, printLayers: [], ...data } as any);
}

async function imageOf(ref: string) {
  const { data } = await sb.from('products').select('id, price, colors, name').eq('ref_code', ref).single();
  return data!;
}

(async () => {
  // ── plain joggers ─────────────────────────────────────────────────────────
  const front = await put(await crop45(path.join(RAW, '6311619.jpg'), 0.36), 'products/basics/joggers-black-1.jpg');
  const back = await put(await crop45(path.join(RAW, '6311506.jpg'), 0.36), 'products/basics/joggers-black-2.jpg');
  const joggers = await upsert('HW-BASIC-JOGGERS', {
    name: 'Basic Qara Şalvar',
    description: 'Çapsız, sadə qara şalvar: rezinli bel, bağcıq, yan ciblər. Hər şeylə geyinilir.',
    category: 'salvar', price: 39, sortOrder: 5,
    fit: 'Rahat kəsim (jogger)', composition: 'Pambıq qarışığı, içi yumşaq tüklü', care: '30°C-də yuyun.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Qara', hex: '#141414', image: front, hoverImage: back, gallery: [front, back] }],
    image: front, images: [front], hoverImage: back, gallery: [front, back],
    translations: {
      en: { name: 'Basic Black Joggers', description: 'Plain black joggers with no print: elastic waist, drawcord, side pockets. Goes with everything.', fit: 'Relaxed jogger fit', composition: 'Cotton blend, brushed inside', care: 'Wash at 30°C.' },
      ru: { name: 'Базовые чёрные брюки', description: 'Простые чёрные брюки без принта: резинка, шнурок, боковые карманы. Сочетаются со всем.', fit: 'Свободный крой (джоггеры)', composition: 'Смесовый хлопок, с начёсом', care: 'Стирать при 30°C.' },
      tr: { name: 'Basic Siyah Eşofman Altı', description: 'Baskısız sade siyah eşofman altı: lastikli bel, bağcık, yan cepler. Her şeyle uyumlu.', fit: 'Rahat jogger kalıp', composition: 'Pamuk karışımı, içi şardonlu', care: '30°C\'de yıkayın.' },
    },
  });
  console.log('joggers', joggers.slug);

  // ── sets ──────────────────────────────────────────────────────────────────
  const hood = await imageOf('EX-1580');
  const tee = await imageOf('EX-1085');
  const bag = await imageOf('EX-1302');
  const setA = await put(await pair(await fetchBuf(hood.colors[0].image), await fetchBuf(front)), 'products/basics/set-skull-joggers.jpg');
  const setB = await put(await pair(await fetchBuf(tee.colors[0].image), await fetchBuf(bag.colors[0].image)), 'products/basics/set-rose-tote.jpg');

  const a = await upsert('HW-SET-SKULL', {
    name: 'Neon Skull Dəst — Hudi + Şalvar',
    description: `Obsession Neon Skull hudi və Basic qara şalvar bir dəstdə — ayrı-ayrı almaqdan ${Number(hood.price) + 39 - 129} ₼ ucuz.\nHudi və şalvar üçün fərqli ölçü istəsəniz, sifariş qeydində yazın.`,
    category: 'dest', price: 129, sortOrder: 1, badge: 'DƏST',
    fit: 'Hudi + şalvar', composition: 'Pambıq qarışığı', care: '30°C-də tərsinə çevirib yuyun.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Qara', hex: '#141414', image: setA, hoverImage: hood.colors[0].image, gallery: [setA, hood.colors[0].image, front, back] }],
    image: setA, images: [setA], hoverImage: hood.colors[0].image, gallery: [setA, hood.colors[0].image, front, back],
    translations: {
      en: { name: 'Neon Skull Set — Hoodie + Joggers', description: 'The Obsession Neon Skull hoodie and Basic black joggers as one set. Need different sizes for top and bottom? Add a note to your order.', fit: 'Hoodie + joggers', composition: 'Cotton blend', care: 'Wash inside out at 30°C.' },
      ru: { name: 'Комплект Neon Skull — худи + брюки', description: 'Худи Obsession Neon Skull и базовые чёрные брюки в одном комплекте. Нужны разные размеры? Укажите в комментарии к заказу.', fit: 'Худи + брюки', composition: 'Смесовый хлопок', care: 'Стирать наизнанку при 30°C.' },
      tr: { name: 'Neon Skull Takım — Kapüşonlu + Eşofman Altı', description: 'Obsession Neon Skull kapüşonlu ve Basic siyah eşofman altı tek takımda. Farklı beden mi istiyorsunuz? Sipariş notuna yazın.', fit: 'Kapüşonlu + eşofman altı', composition: 'Pamuk karışımı', care: 'Ters çevirerek 30°C\'de yıkayın.' },
    },
  });
  const b = await upsert('HW-SET-ROSE', {
    name: 'Rose Dəst — Köynək + Eko Çanta',
    description: `True Love Never Dies köynək və Red Roses eko çanta bir dəstdə — ayrı-ayrı almaqdan ${Number(tee.price) + Number(bag.price) - 69} ₼ ucuz.\nÖlçü köynək üçündür.`,
    category: 'dest', price: 69, sortOrder: 2, badge: 'DƏST',
    fit: 'Köynək + çanta', composition: 'Pambıq, kətan', care: '30°C-də tərsinə çevirib yuyun.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Qara', hex: '#141414', image: setB, hoverImage: tee.colors[0].image, gallery: [setB, tee.colors[0].image, bag.colors[0].image] }],
    image: setB, images: [setB], hoverImage: tee.colors[0].image, gallery: [setB, tee.colors[0].image, bag.colors[0].image],
    translations: {
      en: { name: 'Rose Set — Tee + Tote Bag', description: 'The True Love Never Dies tee and the Red Roses tote bag as one set. The size is for the tee.', fit: 'Tee + tote', composition: 'Cotton, canvas', care: 'Wash inside out at 30°C.' },
      ru: { name: 'Комплект Rose — футболка + эко-сумка', description: 'Футболка True Love Never Dies и эко-сумка Red Roses в одном комплекте. Размер — для футболки.', fit: 'Футболка + сумка', composition: 'Хлопок, канвас', care: 'Стирать наизнанку при 30°C.' },
      tr: { name: 'Rose Takım — Tişört + Bez Çanta', description: 'True Love Never Dies tişört ve Red Roses bez çanta tek takımda. Beden tişört içindir.', fit: 'Tişört + çanta', composition: 'Pamuk, kanvas', care: 'Ters çevirerek 30°C\'de yıkayın.' },
    },
  });
  console.log('sets', a.slug, b.slug);
})();
