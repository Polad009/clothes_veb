// 1) joggers that match the black tees (images from joggers-from-tees.py)
// 2) tote bags: only the bag's front and back (back from tote-backs.py); the supplier's sample photos go
// 3) sets = a tee + the joggers with the same design (older bundles are removed)
//   npx tsx --env-file=.env.local scripts/media/joggers-totes-sets.ts <joggers_dir> <totes_dir>
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import { saveProduct } from '@/lib/db/products';

const [JOG, TOTES] = process.argv.slice(2);
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
const BUCKET = 'product-images';
const W = 1600, H = 2000;
const BG = { r: 236, g: 234, b: 230, alpha: 1 };
const TEES = ['1177', '1085', '814', '782'];
const TOTE_IDS = [1322, 1320, 1318, 1310, 1308, 1306, 1304, 1302, 1298, 1295, 1288, 1286, 1282, 1280, 1278, 1276, 1274, 1257];
const JOGGER_PRICE = 59;
const SET_DISCOUNT = 13;

async function put(local: string | Buffer, remote: string, type: string) {
  const body = typeof local === 'string' ? fs.readFileSync(local) : local;
  const { error } = await sb.storage.from(BUCKET).upload(remote, body, { contentType: type, upsert: true, cacheControl: '31536000' });
  if (error) throw new Error(`${remote}: ${error.message}`);
  return sb.storage.from(BUCKET).getPublicUrl(remote).data.publicUrl;
}

async function pair(a: Buffer, b: Buffer) {
  const half = { width: W / 2 - 30, height: H - 120, fit: 'contain' as const, background: BG };
  const flat = async (x: Buffer) => sharp(x).flatten({ background: BG }).resize(half).toBuffer();
  return sharp({ create: { width: W, height: H, channels: 4, background: BG } })
    .composite([{ input: await flat(a), left: 20, top: 60 }, { input: await flat(b), left: W / 2 + 10, top: 60 }])
    .jpeg({ quality: 86, progressive: true })
    .toBuffer();
}

const tr = (en: string, ru: string, trk: string) => ({ en, ru, tr: trk });

(async () => {
  // ── 1. joggers ────────────────────────────────────────────────────────────
  const made: Array<{ teeRef: string; jogRef: string; title: string; front: string; teeImg: string; teePrice: number }> = [];
  for (const id of TEES) {
    const { data: tee } = await sb.from('products').select('name, price, colors, extra').eq('ref_code', `EX-${id}`).single();
    const title = String(tee!.name).replace(/\s*Köynək$/, '');
    const front = await put(path.join(JOG, `${id}-front.png`), `products/joggers/${id}-front.png`, 'image/png');
    const detail = await put(path.join(JOG, `${id}-detail.jpg`), `products/joggers/${id}-detail.jpg`, 'image/jpeg');
    const ref = `HW-JOG-${id}`;
    const { data: existing } = await sb.from('products').select('id').eq('ref_code', ref).maybeSingle();
    const n = tr(`${title} Joggers`, `Брюки ${title}`, `${title} Eşofman Altı`);
    await saveProduct({
      id: existing?.id, refCode: ref, name: `${title} Şalvar`, category: 'salvar', price: JOGGER_PRICE, gender: 'unisex', badge: '',
      description: `"${title}" köynəyi ilə eyni dizayn: çap sol budda. Qara, rezinli bel, bağcıq, yan və kargo cibləri.`,
      fit: 'Kargo jogger', composition: 'Pambıq qarışığı', care: '30°C-də tərsinə çevirib yuyun, çapın üstündən ütüləməyin.',
      inStock: true, trackStock: false, isNew: true, hidden: false, sortOrder: 1, printLayers: [],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: [{ name: 'Qara', hex: '#141414', image: front, hoverImage: detail, gallery: [front, detail] }],
      image: front, images: [front], hoverImage: detail, gallery: [front, detail],
      translations: {
        en: { name: n.en, description: `Same design as the "${title}" tee, printed on the left thigh. Black, elastic waist, drawcord, side and cargo pockets.`, fit: 'Cargo joggers', composition: 'Cotton blend', care: 'Wash inside out at 30°C; do not iron over the print.' },
        ru: { name: n.ru, description: `Тот же дизайн, что у футболки «${title}», принт на левом бедре. Чёрные, резинка, шнурок, боковые и карго-карманы.`, fit: 'Карго-джоггеры', composition: 'Смесовый хлопок', care: 'Стирать наизнанку при 30°C, не гладить по принту.' },
        tr: { name: n.tr, description: `"${title}" tişörtüyle aynı tasarım, baskı sol uylukta. Siyah, lastikli bel, bağcık, yan ve kargo cepler.`, fit: 'Kargo jogger', composition: 'Pamuk karışımı', care: 'Ters çevirerek 30°C\'de yıkayın; baskının üzerine ütü yapmayın.' },
      },
    } as any);
    made.push({ teeRef: `EX-${id}`, jogRef: ref, title, front, teeImg: tee!.colors[0].image, teePrice: Number(tee!.price) });
    console.log('joggers', ref, title);
  }

  // ── 2. tote bags: front + back only ───────────────────────────────────────
  for (const id of TOTE_IDS) {
    const { data: p } = await sb.from('products').select('id, colors, extra').eq('ref_code', `EX-${id}`).single();
    if (!p) continue;
    const front = p.colors[0].image as string;
    const back = await put(path.join(TOTES, `${id}-back.jpg`), `products/exisstore/${id}-back.jpg`, 'image/jpeg');
    const colors = [{ ...p.colors[0], image: front, hoverImage: back, gallery: [front, back] }];
    await sb.from('products').update({ colors, images: [front], extra: { ...(p.extra || {}), image: front, hoverImage: back, gallery: [front, back] } }).eq('id', p.id);
    // the supplier's sample photos are no longer used
    await sb.storage.from(BUCKET).remove([`products/exisstore/${id}-2.webp`, `products/exisstore/${id}-3.webp`]);
  }
  console.log('totes', TOTE_IDS.length, 'updated');

  // ── 3. sets: tee + matching joggers ───────────────────────────────────────
  const { data: oldSets } = await sb.from('products').select('id, ref_code').eq('category', 'dest');
  const keep = new Set(made.map((m) => `HW-SET-${m.teeRef.slice(3)}`));
  const drop = (oldSets || []).filter((s) => !keep.has(s.ref_code)).map((s) => s.id);
  if (drop.length) await sb.from('products').delete().in('id', drop);
  await sb.storage.from(BUCKET).remove(['products/sets/hw-set-neon.jpg', 'products/sets/hw-set-liquid.jpg', 'products/sets/hw-set-rose.jpg', 'products/sets/hw-set-samurai.jpg']);
  console.log('old sets removed', drop.length);

  for (let i = 0; i < made.length; i++) {
    const m = made[i];
    const img = await put(await pair(Buffer.from(await (await fetch(m.teeImg)).arrayBuffer()), fs.readFileSync(path.join(JOG, `${m.teeRef.slice(3)}-front.png`))), `products/sets/${m.teeRef.slice(3)}.jpg`, 'image/jpeg');
    const full = m.teePrice + JOGGER_PRICE;
    const price = full - SET_DISCOUNT;
    const ref = `HW-SET-${m.teeRef.slice(3)}`;
    const { data: existing } = await sb.from('products').select('id').eq('ref_code', ref).maybeSingle();
    await saveProduct({
      id: existing?.id, refCode: ref, name: `${m.title} Dəst — Köynək + Şalvar`, category: 'dest', price, gender: 'unisex', badge: 'DƏST',
      description: `"${m.title}" köynəyi və eyni dizaynlı qara şalvar bir dəstdə — ayrı-ayrı almaqdan ${SET_DISCOUNT} ₼ ucuz.\nKöynək və şalvar üçün fərqli ölçü istəsəniz, sifariş qeydində yazın.`,
      fit: 'Köynək + şalvar', composition: 'Pambıq, pambıq qarışığı', care: '30°C-də tərsinə çevirib yuyun, çapın üstündən ütüləməyin.',
      inStock: true, trackStock: false, isNew: true, hidden: false, sortOrder: i + 1, printLayers: [],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: [{ name: 'Qara', hex: '#141414', image: img, hoverImage: m.teeImg, gallery: [img, m.teeImg, m.front] }],
      image: img, images: [img], hoverImage: m.teeImg, gallery: [img, m.teeImg, m.front],
      translations: {
        en: { name: `${m.title} Set — Tee + Joggers`, description: `The "${m.title}" tee and black joggers with the same design as one set — ${SET_DISCOUNT} ₼ less than buying them separately.\nNeed different sizes for top and bottom? Add a note to your order.`, fit: 'Tee + joggers', composition: 'Cotton, cotton blend', care: 'Wash inside out at 30°C; do not iron over the print.' },
        ru: { name: `Комплект ${m.title} — футболка + брюки`, description: `Футболка «${m.title}» и чёрные брюки с тем же дизайном в одном комплекте — на ${SET_DISCOUNT} ₼ дешевле, чем по отдельности.\nНужны разные размеры верха и низа? Укажите в комментарии к заказу.`, fit: 'Футболка + брюки', composition: 'Хлопок, смесовый хлопок', care: 'Стирать наизнанку при 30°C, не гладить по принту.' },
        tr: { name: `${m.title} Takım — Tişört + Eşofman Altı`, description: `"${m.title}" tişörtü ve aynı tasarımlı siyah eşofman altı tek takımda — ayrı almaktan ${SET_DISCOUNT} ₼ daha ucuz.\nÜst ve alt için farklı beden mi istiyorsunuz? Sipariş notuna yazın.`, fit: 'Tişört + eşofman altı', composition: 'Pamuk, pamuk karışımı', care: 'Ters çevirerek 30°C\'de yıkayın; baskının üzerine ütü yapmayın.' },
      },
    } as any);
    console.log('set', ref, price, 'AZN');
  }

  // ── 4. trousers are back: show the category again, set descriptions ─────
  await sb.from('categories').update({ active: true }).eq('id', 'salvar');
  const { data: d } = await sb.from('categories').select('extra').eq('id', 'dest').single();
  await sb.from('categories').update({
    description: 'Köynək və eyni dizaynlı şalvar dəstləri — ayrı-ayrı almaqdan sərfəli.',
    extra: { ...(d?.extra || {}), descriptions: { en: 'Tee and matching joggers sets — better value than buying separately.', ru: 'Комплекты: футболка и брюки с тем же дизайном — выгоднее, чем по отдельности.', tr: 'Tişört ve aynı tasarımlı eşofman altı takımları — ayrı almaktan daha avantajlı.' } },
  }).eq('id', 'dest');
  console.log('categories updated');
})();
