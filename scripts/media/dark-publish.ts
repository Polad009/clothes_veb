// Dark graphic prints (designs: dark-designs.py, images: dark-images.py). Re-runnable, matched by ref code.
//   npx tsx --env-file=.env.local scripts/media/dark-publish.ts <designs_dir> <images_dir>
// Prices in AZN are suggestions; the owner confirms them in the admin.
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { saveProduct } from '@/lib/db/products';

const [DESIGNS, IMAGES] = process.argv.slice(2);
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
const BUCKET = 'product-images';
const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
type L = { az: string; en: string; ru: string; tr: string };
const l = (az: string, en: string, ru: string, tr: string): L => ({ az, en, ru, tr });
const CARE = l('30°C-də tərsinə çevirib yuyun, çapın üstündən ütüləməyin.', 'Wash inside out at 30°C; do not iron over the print.', 'Стирать наизнанку при 30°C, не гладить по принту.', 'Ters çevirerek 30°C\'de yıkayın; baskının üzerine ütü yapmayın.');
const TEE = { category: 'koynek', price: 45, fit: l('Oversize', 'Oversize', 'Оверсайз', 'Oversize'), comp: l('Pambıq, qalın süprəm (240 q/m²)', 'Cotton, heavyweight jersey (240 gsm)', 'Хлопок, плотная кулирка (240 г/м²)', 'Pamuk, kalın süprem (240 g/m²)'), views: ['model', 'flat', 'model2'], width: 'ön tərəf, tövsiyə olunan eni 30 sm' };

const ITEMS = [
  { ...TEE, key: 'money', name: l('Money Köynək', 'Money Tee', 'Футболка Money', 'Money Tişört'),
    desc: l('Öndə əskinaslardan kəsilmiş MONEY yazısı, aşağı axan boya izləri.\nAltında: "Count it. Keep it. Multiply it."\nQara, oversize kəsim.', 'Front print: MONEY cut out of banknotes, with running ink drips.\nBelow: "Count it. Keep it. Multiply it."\nBlack, oversize fit.', 'Принт спереди: надпись MONEY из банкнот с подтёками краски.\nНиже: «Count it. Keep it. Multiply it.»\nЧёрная, оверсайз.', 'Önde banknotlardan kesilmiş MONEY yazısı, akan boya izleri.\nAltında: "Count it. Keep it. Multiply it."\nSiyah, oversize kalıp.') },
  { ...TEE, key: 'awake', name: l('Stay Awake Köynək', 'Stay Awake Tee', 'Футболка Stay Awake', 'Stay Awake Tişört'),
    desc: l('Öndə iri STAY AWAKE yazısı, sözlərin arasında göz.\nAltında qotik şriftlə: "they blink — you don\'t".\nQara, oversize kəsim.', 'Front print: bold STAY AWAKE with an eye between the words.\nBelow, in blackletter: "they blink — you don\'t".\nBlack, oversize fit.', 'Принт спереди: крупная надпись STAY AWAKE и глаз между словами.\nНиже готическим шрифтом: «they blink — you don\'t».\nЧёрная, оверсайз.', 'Önde iri STAY AWAKE yazısı, kelimelerin arasında göz.\nAltında gotik yazıyla: "they blink — you don\'t".\nSiyah, oversize kalıp.') },
  { ...TEE, key: 'eternal', name: l('Eternal Köynək', 'Eternal Tee', 'Футболка Eternal', 'Eternal Tişört'),
    desc: l('Öndə çəhrayı mərmər büst, arxasında dalğalanan ETERNAL sətirləri.\nAltında qotik şriftlə: "nothing gold can stay".\nQara, oversize kəsim.', 'Front print: a marble bust in magenta over rippling rows of ETERNAL.\nBelow, in blackletter: "nothing gold can stay".\nBlack, oversize fit.', 'Принт спереди: мраморный бюст в цвете маджента на фоне волнистых строк ETERNAL.\nНиже готическим шрифтом: «nothing gold can stay».\nЧёрная, оверсайз.', 'Önde macenta mermer büst, arkasında dalgalanan ETERNAL satırları.\nAltında gotik yazıyla: "nothing gold can stay".\nSiyah, oversize kalıp.') },
  { key: 'strike', category: 'hudi', price: 85, views: ['hood'], width: 'sinə boyu, tövsiyə olunan eni 45 sm',
    fit: l('Hudi qalın (3iplik)', 'Heavy hoodie, 3-thread fleece', 'Плотное худи, футер 3-нитка', 'Kalın kapüşonlu, 3 iplik'),
    comp: l('Pambıq qarışığı, 3 iplik, içi yumşaq tüklü', 'Cotton blend, 3-thread fleece, brushed inside', 'Смесовый хлопок, футер 3-нитка, с начёсом', 'Pamuk karışımı, 3 iplik, içi şardonlu'),
    name: l('Strike Hudi', 'Strike Hoodie', 'Худи Strike', 'Strike Kapüşonlu'),
    desc: l('Sinə boyu real ildırım fotolarından çap.\nQara, qalın 3 iplik parça, kenquru cibi.', 'Real lightning photographed and printed across the chest.\nBlack, heavy 3-thread fleece, kangaroo pocket.', 'Принт с настоящими молниями через всю грудь.\nЧёрное, плотный футер 3-нитка, карман-кенгуру.', 'Göğüs boyunca gerçek şimşek fotoğraflarından baskı.\nSiyah, kalın 3 iplik, kanguru cep.') },
];

async function put(local: string, remote: string, type: string) {
  const { error } = await sb.storage.from(BUCKET).upload(remote, fs.readFileSync(local), { contentType: type, upsert: true, cacheControl: '31536000' });
  if (error) throw new Error(`${remote}: ${error.message}`);
  return sb.storage.from(BUCKET).getPublicUrl(remote).data.publicUrl;
}

(async () => {
  for (let i = 0; i < ITEMS.length; i++) {
    const p = ITEMS[i];
    const gallery: string[] = [];
    for (const v of p.views) gallery.push(await put(path.join(IMAGES, `${p.key}-${v}.jpg`), `products/photo/dark-${p.key}-${v}.jpg`, 'image/jpeg'));
    const print = await put(path.join(DESIGNS, `${p.key}.png`), `prints/dark/${p.key}.png`, 'image/png');
    const ref = `HW-DK-${p.key.toUpperCase()}`;
    const { data: existing } = await sb.from('products').select('id').eq('ref_code', ref).maybeSingle();
    const saved = await saveProduct({
      id: existing?.id, refCode: ref, name: p.name.az, description: p.desc.az, category: p.category, gender: 'unisex', price: p.price,
      badge: 'YENİ', fit: p.fit.az, composition: p.comp.az, care: CARE.az,
      inStock: true, trackStock: false, isNew: true, hidden: false, sortOrder: i - ITEMS.length,
      printLayers: [{ name: 'Ön çap — qara geyim üçün (PNG)', url: print, desc: `Şəffaf fon · ${p.width}` }],
      sizes: SIZES, colors: [{ name: 'Qara', hex: '#141414', image: gallery[0], hoverImage: gallery[1] || '', gallery }],
      image: gallery[0], images: [gallery[0]], hoverImage: gallery[1] || '', gallery,
      translations: Object.fromEntries((['en', 'ru', 'tr'] as const).map((k) => [k, { name: p.name[k], description: p.desc[k], fit: p.fit[k], composition: p.comp[k], care: CARE[k] }])),
    } as any);
    console.log(ref, saved.slug, p.price, 'AZN');
  }
})();
