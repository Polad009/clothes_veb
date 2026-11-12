// Sets (Dəst category): bundles of products that are already in the shop, at a lower price.
// Each set's image = the two products side by side. Matched by ref code, so re-runs update.
//   npx tsx --env-file=.env.local scripts/media/basics-and-sets.ts
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import { saveProduct } from '@/lib/db/products';

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
const BUCKET = 'product-images';
const W = 1600, H = 2000;
const BG = { r: 236, g: 234, b: 230, alpha: 1 };

type L = { az: string; en: string; ru: string; tr: string };
const SETS: Array<{ ref: string; a: string; b: string; price: number; name: L; kinds: L; sizeNote: L }> = [
  {
    ref: 'HW-SET-NEON', a: 'EX-1580', b: 'EX-1177', price: 129,
    name: { az: 'Neon Night Dəst', en: 'Neon Night Set', ru: 'Комплект Neon Night', tr: 'Neon Night Takım' },
    kinds: { az: 'Hudi + Köynək', en: 'Hoodie + Tee', ru: 'худи + футболка', tr: 'Kapüşonlu + Tişört' },
    sizeNote: { az: 'Hudi və köynək üçün fərqli ölçü istəsəniz, sifariş qeydində yazın.', en: 'Need different sizes for the hoodie and tee? Add a note to your order.', ru: 'Нужны разные размеры худи и футболки? Укажите в комментарии к заказу.', tr: 'Kapüşonlu ve tişört için farklı beden mi istiyorsunuz? Sipariş notuna yazın.' },
  },
  {
    ref: 'HW-SET-LIQUID', a: 'EX-1500', b: 'EX-1308', price: 119,
    name: { az: 'Liquid Dəst', en: 'Liquid Set', ru: 'Комплект Liquid', tr: 'Liquid Takım' },
    kinds: { az: 'Hudi + Eko Çanta', en: 'Hoodie + Tote Bag', ru: 'худи + эко-сумка', tr: 'Kapüşonlu + Bez Çanta' },
    sizeNote: { az: 'Ölçü hudi üçündür.', en: 'The size is for the hoodie.', ru: 'Размер — для худи.', tr: 'Beden kapüşonlu içindir.' },
  },
  {
    ref: 'HW-SET-ROSE', a: 'EX-1085', b: 'EX-1302', price: 69,
    name: { az: 'Rose Dəst', en: 'Rose Set', ru: 'Комплект Rose', tr: 'Rose Takım' },
    kinds: { az: 'Köynək + Eko Çanta', en: 'Tee + Tote Bag', ru: 'футболка + эко-сумка', tr: 'Tişört + Bez Çanta' },
    sizeNote: { az: 'Ölçü köynək üçündür.', en: 'The size is for the tee.', ru: 'Размер — для футболки.', tr: 'Beden tişört içindir.' },
  },
  {
    ref: 'HW-SET-SAMURAI', a: 'EX-939', b: 'EX-1274', price: 69,
    name: { az: 'Samurai Dəst', en: 'Samurai Set', ru: 'Комплект Samurai', tr: 'Samurai Takım' },
    kinds: { az: 'Köynək + Eko Çanta', en: 'Tee + Tote Bag', ru: 'футболка + эко-сумка', tr: 'Tişört + Bez Çanta' },
    sizeNote: { az: 'Ölçü köynək üçündür.', en: 'The size is for the tee.', ru: 'Размер — для футболки.', tr: 'Beden tişört içindir.' },
  },
];

async function put(buf: Buffer, remote: string) {
  const { error } = await sb.storage.from(BUCKET).upload(remote, buf, { contentType: 'image/jpeg', upsert: true, cacheControl: '31536000' });
  if (error) throw new Error(`${remote}: ${error.message}`);
  return sb.storage.from(BUCKET).getPublicUrl(remote).data.publicUrl;
}

async function fetchBuf(url: string) {
  return Buffer.from(await (await fetch(url)).arrayBuffer());
}

/** two product photos side by side on the shop's light tile colour */
async function pair(a: Buffer, b: Buffer) {
  const half = { width: W / 2 - 30, height: H - 120, fit: 'contain' as const, background: BG };
  const left = await sharp(a).resize(half).toBuffer();
  const right = await sharp(b).resize(half).toBuffer();
  return sharp({ create: { width: W, height: H, channels: 4, background: BG } })
    .composite([{ input: left, left: 20, top: 60 }, { input: right, left: W / 2 + 10, top: 60 }])
    .jpeg({ quality: 86, progressive: true })
    .toBuffer();
}

async function product(ref: string) {
  const { data } = await sb.from('products').select('id, name, price, sizes, colors, extra').eq('ref_code', ref).single();
  return data!;
}

(async () => {
  for (let i = 0; i < SETS.length; i++) {
    const s = SETS[i];
    const a = await product(s.a);
    const b = await product(s.b);
    const aImg = a.colors[0].image as string;
    const bImg = b.colors[0].image as string;
    const img = await put(await pair(await fetchBuf(aImg), await fetchBuf(bImg)), `products/sets/${s.ref.toLowerCase()}.jpg`);
    const save = Number(a.price) + Number(b.price) - s.price;
    const tr = (l: 'en' | 'ru' | 'tr') => (a.extra?.translations?.[l]?.name || a.name) + ' + ' + (b.extra?.translations?.[l]?.name || b.name);
    const sizes = (a.sizes?.length && a.sizes[0] !== 'Standart' ? a.sizes : b.sizes) || ['Standart'];
    const { data: existing } = await sb.from('products').select('id').eq('ref_code', s.ref).maybeSingle();
    const saved = await saveProduct({
      id: existing?.id,
      refCode: s.ref,
      name: `${s.name.az} — ${s.kinds.az}`,
      description: `${a.name} + ${b.name} bir dəstdə — ayrı-ayrı almaqdan ${save} ₼ ucuz.\n${s.sizeNote.az}`,
      category: 'dest', price: s.price, sortOrder: i + 1, badge: 'DƏST', gender: 'unisex',
      fit: s.kinds.az, composition: '', care: '30°C-də tərsinə çevirib yuyun, çapın üstündən ütüləməyin.',
      inStock: true, trackStock: false, isNew: true, hidden: false, printLayers: [],
      sizes,
      colors: [{ name: a.colors[0].name, hex: a.colors[0].hex, image: img, hoverImage: aImg, gallery: [img, aImg, bImg] }],
      image: img, images: [img], hoverImage: aImg, gallery: [img, aImg, bImg],
      translations: {
        en: { name: `${s.name.en} — ${s.kinds.en}`, description: `${tr('en')} as one set — ${save} ₼ less than buying them separately.\n${s.sizeNote.en}`, fit: s.kinds.en, composition: '', care: 'Wash inside out at 30°C; do not iron over the print.' },
        ru: { name: `${s.name.ru} — ${s.kinds.ru}`, description: `${tr('ru')} в одном комплекте — на ${save} ₼ дешевле, чем по отдельности.\n${s.sizeNote.ru}`, fit: s.kinds.ru, composition: '', care: 'Стирать наизнанку при 30°C, не гладить по принту.' },
        tr: { name: `${s.name.tr} — ${s.kinds.tr}`, description: `${tr('tr')} tek takımda — ayrı almaktan ${save} ₼ daha ucuz.\n${s.sizeNote.tr}`, fit: s.kinds.tr, composition: '', care: 'Ters çevirerek 30°C\'de yıkayın; baskının üzerine ütü yapmayın.' },
      },
    } as any);
    console.log(s.ref, saved.slug, `${s.price} AZN (saves ${save})`);
  }
})();
