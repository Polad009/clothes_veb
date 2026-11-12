// Imports a hand-picked list of exisstore.com products (the owner has the store's permission to
// resell them). Products showing other companies' brands, logos or characters (football clubs,
// Adidas, NASA, Harry Potter, BTS, games, car makers, F1 teams, YSL, "Love is…", Off-White style)
// are left out on purpose: exisstore's permission cannot cover those rights.
// Images are copied to our Storage (products/exisstore/). Matched by ref code EX-<id>, so re-runs update.
//   npx tsx --env-file=.env.local scripts/media/import-exisstore.ts
import { createClient } from '@supabase/supabase-js';
import { saveProduct } from '@/lib/db/products';

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
const BUCKET = 'product-images';
const API = 'https://exisstore.com/wp-json/wc/store/v1/products';
const USD_AZN = 1.7;

type Col = { name: string; hex: string };
const BLACK: Col = { name: 'Qara', hex: '#141414' };
const WHITE: Col = { name: 'Ağ', hex: '#EFECE6' };
const NATURAL: Col = { name: 'Təbii', hex: '#E9E2D3' };

// id -> colour (picked by looking at each photo)
const PICK: Record<number, Col> = {
  // hoodies
  1580: BLACK, 1500: BLACK, 1498: BLACK,
  // tees
  1177: BLACK, 1170: WHITE, 1135: BLACK, 1128: WHITE, 1120: WHITE, 1099: WHITE, 1092: BLACK, 1085: BLACK, 1142: WHITE,
  1070: { name: 'Bordo', hex: '#6B1E2B' }, 1055: { name: 'Açıq mavi', hex: '#A9CDE3' }, 1040: { name: 'Bej', hex: '#E6CBA3' },
  1025: { name: 'Mint', hex: '#BFDCCB' }, 1011: { name: 'Çəhrayı', hex: '#EBC9CF' }, 996: { name: 'Krem', hex: '#E7E1D5' },
  982: WHITE, 966: WHITE, 952: { name: 'Antrasit', hex: '#3A3A3A' },
  939: BLACK, 933: BLACK, 909: WHITE, 895: BLACK, 882: BLACK, 869: BLACK, 854: BLACK, 814: BLACK, 782: BLACK,
  // tote bags
  1322: NATURAL, 1320: BLACK, 1318: BLACK, 1310: BLACK, 1308: BLACK, 1306: NATURAL, 1304: NATURAL, 1302: BLACK,
  1298: NATURAL, 1295: BLACK, 1288: BLACK, 1286: NATURAL, 1282: NATURAL, 1280: NATURAL, 1278: NATURAL, 1276: NATURAL,
  1274: BLACK, 1257: NATURAL,
};

const KIND = {
  tee: {
    category: 'koynek', az: 'Köynək', en: 'Tee', ru: 'Футболка', tr: 'Tişört',
    desc: {
      az: 'Qrafik çaplı oversize köynək. Yumşaq pambıq, gündəlik geyim üçün rahat kəsim.',
      en: 'Oversize graphic tee. Soft cotton, relaxed everyday fit.',
      ru: 'Оверсайз футболка с графическим принтом. Мягкий хлопок, свободный крой на каждый день.',
      tr: 'Grafik baskılı oversize tişört. Yumuşak pamuk, günlük rahat kalıp.',
    },
    comp: { az: 'Pambıq', en: 'Cotton', ru: 'Хлопок', tr: 'Pamuk' },
    fit: { az: 'Oversize', en: 'Oversize', ru: 'Оверсайз', tr: 'Oversize' },
  },
  hoodie: {
    category: 'hudi', az: 'Hudi', en: 'Hoodie', ru: 'Худи', tr: 'Kapüşonlu',
    desc: {
      az: 'Qrafik çaplı hudi: öndə və qollarda çap. İsti, yumşaq parça.',
      en: 'Graphic hoodie with front and sleeve prints. Warm, soft fabric.',
      ru: 'Худи с графическим принтом спереди и на рукавах. Тёплая мягкая ткань.',
      tr: 'Önde ve kollarda baskılı grafik kapüşonlu. Sıcak, yumuşak kumaş.',
    },
    comp: { az: 'Pambıq qarışığı', en: 'Cotton blend', ru: 'Смесовый хлопок', tr: 'Pamuk karışımı' },
    fit: { az: 'Rahat kəsim', en: 'Relaxed fit', ru: 'Свободный крой', tr: 'Rahat kalıp' },
  },
  tote: {
    category: 'aksesuar', az: 'Eko Çanta', en: 'Tote Bag', ru: 'Эко-сумка', tr: 'Bez Çanta',
    desc: {
      az: 'Qalın parçadan çaplı eko çanta. Kitab, noutbuk və gündəlik əşyalar üçün geniş.',
      en: 'Printed canvas tote bag. Roomy enough for books, a laptop and everyday things.',
      ru: 'Эко-сумка из плотной ткани с принтом. Вмещает книги, ноутбук и вещи на каждый день.',
      tr: 'Baskılı kalın kanvas çanta. Kitap, laptop ve günlük eşyalar için geniş.',
    },
    comp: { az: 'Kətan parça', en: 'Canvas', ru: 'Канвас', tr: 'Kanvas' },
    fit: { az: 'Standart ölçü', en: 'One size', ru: 'Один размер', tr: 'Tek ölçü' },
  },
} as const;

const CUT = [' Graphic', ' Canvas Tote', ' Black T-Shirt', ' White T-Shirt', ' T-Shirt', ' Oversized', ' |', ' Black Graphic'];
function title(raw: string) {
  let t = raw.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).replace(/&amp;/g, '&');
  let cut = t.length;
  for (const c of CUT) {
    const i = t.indexOf(c);
    if (i > 8 && i < cut) cut = i;
  }
  t = t.slice(0, cut).trim();
  // the garment word and colour are added by us: drop them from the supplier's title
  for (let k = 0; k < 3; k++) t = t.replace(/\s+(Black|White|Hoodie|Graphic|Event Flyer)$/i, '').trim();
  return t;
}

async function copyImage(src: string, id: number, n: number) {
  const res = await fetch(src, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  const ext = (src.split('.').pop() || 'jpg').toLowerCase().split('?')[0];
  const type = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  const remote = `products/exisstore/${id}-${n}.${ext}`;
  const { error } = await sb.storage.from(BUCKET).upload(remote, buf, { contentType: type, upsert: true, cacheControl: '31536000' });
  if (error) return null;
  return sb.storage.from(BUCKET).getPublicUrl(remote).data.publicUrl;
}

(async () => {
  const all: any[] = [];
  for (let page = 1; page <= 3; page++) {
    const r = await fetch(`${API}?per_page=100&page=${page}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const list = await r.json();
    if (!Array.isArray(list) || !list.length) break;
    all.push(...list);
  }
  let order = 10;
  for (const [idStr, colour] of Object.entries(PICK)) {
    const id = Number(idStr);
    const x = all.find((p) => p.id === id);
    if (!x) { console.warn('missing', id); continue; }
    const cats: string[] = x.categories.map((c: any) => c.name);
    const kind = cats.includes('Hoodies') ? KIND.hoodie : cats.includes('Eco bags') ? KIND.tote : KIND.tee;
    // product photos only: skip size charts and duplicates
    const srcs: string[] = Array.from(new Set<string>(x.images.map((i: any) => i.src)))
      .filter((s) => !/size|huner_group/i.test(s));
    const urls: string[] = [];
    for (let n = 0; n < srcs.length; n++) {
      const u = await copyImage(srcs[n], id, n + 1);
      if (u) urls.push(u);
    }
    if (!urls.length) { console.warn('no images', id); continue; }
    const t = title(x.name);
    const usd = Number(x.prices.price) / 10 ** x.prices.currency_minor_unit;
    const price = Math.round(usd * USD_AZN);
    const sizeAttr = x.attributes.find((a: any) => a.name === 'size');
    const ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    const sizes: string[] = sizeAttr ? sizeAttr.terms.map((s: any) => s.name).sort((a: string, b: string) => ORDER.indexOf(a) - ORDER.indexOf(b)) : ['Standart'];
    const refCode = `EX-${id}`;
    const { data: existing } = await sb.from('products').select('id').eq('ref_code', refCode).maybeSingle();
    const colors = [{ name: colour.name, hex: colour.hex, image: urls[0], hoverImage: urls[1] || '', gallery: urls }];
    const saved = await saveProduct({
      id: existing?.id,
      name: `${t} ${kind.az}`,
      description: kind.desc.az,
      category: kind.category,
      gender: 'unisex',
      price,
      refCode,
      badge: '',
      fit: kind.fit.az,
      composition: kind.comp.az,
      care: '30°C-də tərsinə çevirib yuyun, çapın üstündən ütüləməyin.',
      inStock: true,
      trackStock: false,
      isNew: true,
      sortOrder: order++,
      hidden: false,
      sizes,
      colors,
      image: urls[0],
      images: [urls[0]],
      hoverImage: urls[1] || '',
      gallery: urls,
      printLayers: [],
      translations: Object.fromEntries(
        (['en', 'ru', 'tr'] as const).map((l) => [l, {
          name: `${t} ${kind[l]}`, description: kind.desc[l], fit: kind.fit[l], composition: kind.comp[l],
          care: { en: 'Wash inside out at 30°C; do not iron over the print.', ru: 'Стирать наизнанку при 30°C, не гладить по принту.', tr: 'Ters çevirerek 30°C\'de yıkayın; baskının üzerine ütü yapmayın.' }[l],
        }])
      ),
    } as any);
    // keep where it came from (admin only): the supplier's page
    const { data: row } = await sb.from('products').select('extra').eq('id', saved.id).single();
    await sb.from('products').update({ extra: { ...(row?.extra || {}), source: 'exisstore', sourceUrl: x.permalink } }).eq('id', saved.id);
    console.log(`${refCode} ${kind.category} ${price} AZN  ${t}  (${urls.length} img)`);
  }
})();
