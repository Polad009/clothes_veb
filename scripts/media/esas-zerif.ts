// "ƏSAS 01" (unisex basics) and "ZƏRİF 01" (womenswear): plain, logo-free pieces shown on people.
// Photos are free Unsplash stock (sources in MEDIA_LICENSES.md), cropped to 4:5 beforehand:
//   <images_dir>/<key>-<n>.jpg   e.g. tee-1.jpg
// They are uploaded to product-images/products/photo/, which the storefront shows full-bleed.
// Re-runnable: products are matched by ref code.
//   npx tsx --env-file=.env.local scripts/media/esas-zerif.ts <images_dir>
// Prices in AZN are suggestions; the owner confirms them in the admin.
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import { saveProduct } from '@/lib/db/products';

const DIR = process.argv[2];
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
const BUCKET = 'product-images';

type L = { az: string; en: string; ru: string; tr: string };
const l = (az: string, en: string, ru: string, tr: string): L => ({ az, en, ru, tr });
type Colour = { name: string; hex: string; files: string[] };
type Item = { ref: string; category: string; gender: 'unisex' | 'women'; price: number; sizes: string[]; name: L; desc: L; fit: L; comp: L; care: L; colours: Colour[] };

const UNI = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const WOM = ['XS', 'S', 'M', 'L', 'XL'];
const WASH30 = l('30°C-də tərsinə çevirib yuyun. Ağartmayın. Aşağı temperaturda ütüləyin.', 'Wash inside out at 30°C. Do not bleach. Iron on low heat.', 'Стирать наизнанку при 30°C. Не отбеливать. Гладить при низкой температуре.', 'Ters çevirerek 30°C\'de yıkayın. Ağartmayın. Düşük ısıda ütüleyin.');
const DELICATE = l('Əldə və ya 30°C zərif rejimdə yuyun. Sıxmayın. Tərsindən, aşağı temperaturda ütüləyin.', 'Hand wash or 30°C delicate cycle. Do not wring. Iron inside out on low heat.', 'Ручная стирка или деликатный режим 30°C. Не выкручивать. Гладить с изнанки при низкой температуре.', 'Elde veya 30°C hassas programda yıkayın. Sıkmayın. Tersinden düşük ısıda ütüleyin.');
const DRY = l('Quru təmizləmə tövsiyə olunur. Asılqanda saxlayın.', 'Dry clean recommended. Store on a hanger.', 'Рекомендуется химчистка. Хранить на вешалке.', 'Kuru temizleme önerilir. Askıda saklayın.');

const ITEMS: Item[] = [
  // ── ƏSAS 01 · unisex ─────────────────────────────────────────────────────
  {
    ref: 'HW-ES-TEE', category: 'koynek', gender: 'unisex', price: 45, sizes: UNI,
    name: l('Ağır Pambıq Köynək', 'Heavy Cotton Tee', 'Футболка из плотного хлопка', 'Kalın Pamuklu Tişört'),
    desc: l('Qalın pambıq trikotajdan köynək.\nDairəvi yaxa, bir az salınmış çiyin xətti.\nÇapsız, loqosuz.', 'Tee in heavyweight cotton jersey.\nRound neck, slightly dropped shoulder.\nNo print, no logo.', 'Футболка из плотного хлопкового трикотажа.\nКруглый вырез, слегка спущенное плечо.\nБез принта и логотипа.', 'Kalın pamuklu süprem tişört.\nBisiklet yaka, hafif düşük omuz.\nBaskısız, logosuz.'),
    fit: l('Rahat kəsim', 'Relaxed fit', 'Свободный крой', 'Rahat kalıp'),
    comp: l('100% pambıq, 240 q/m²', '100% cotton, 240 gsm', '100% хлопок, 240 г/м²', '%100 pamuk, 240 g/m²'), care: WASH30,
    colours: [{ name: 'Ağ', hex: '#F2F0EB', files: ['tee-2', 'tee-3'] }],
  },
  {
    ref: 'HW-ES-HOODIE', category: 'hudi', gender: 'unisex', price: 85, sizes: UNI,
    name: l('Ağır Hudi', 'Heavy Hoodie', 'Плотное худи', 'Kalın Kapüşonlu'),
    desc: l('Ağır pambıq flisdən oversize hudi.\nGeniş kapüşon, kenquru cibi.\nRezinli manjet və ətək.', 'Oversize hoodie in heavy cotton fleece.\nRoomy hood, kangaroo pocket.\nRibbed cuffs and hem.', 'Худи оверсайз из плотного хлопкового футера.\nОбъёмный капюшон, карман-кенгуру.\nМанжеты и низ на резинке.', 'Kalın pamuklu polardan oversize kapüşonlu.\nGeniş kapüşon, kanguru cep.\nRibana manşet ve etek.'),
    fit: l('Oversize', 'Oversize', 'Оверсайз', 'Oversize'),
    comp: l('Pambıq flis, 400 q/m², içi daranmış', 'Cotton fleece, 400 gsm, brushed inside', 'Хлопковый футер, 400 г/м², с начёсом', 'Pamuklu polar, 400 g/m², içi şardonlu'), care: WASH30,
    colours: [{ name: 'Daş bej', hex: '#B9A9A1', files: ['hoodie-1', 'hoodie-2'] }],
  },
  {
    ref: 'HW-ES-CREW', category: 'hudi', gender: 'unisex', price: 75, sizes: UNI,
    name: l('Dairəvi Yaxa Svitşot', 'Crew Neck Sweatshirt', 'Свитшот с круглым вырезом', 'Bisiklet Yaka Sweatshirt'),
    desc: l('Pambıq flisdən dairəvi yaxalı svitşot.\nSalınmış çiyin, geniş qol.\nRezinli haşiyələr.', 'Crew neck sweatshirt in cotton fleece.\nDropped shoulder, wide sleeve.\nRibbed trims.', 'Свитшот с круглым вырезом из хлопкового футера.\nСпущенное плечо, широкий рукав.\nТрикотажные манжеты.', 'Pamuklu polardan bisiklet yaka sweatshirt.\nDüşük omuz, geniş kol.\nRibana detaylar.'),
    fit: l('Rahat kəsim', 'Relaxed fit', 'Свободный крой', 'Rahat kalıp'),
    comp: l('Pambıq flis, 380 q/m²', 'Cotton fleece, 380 gsm', 'Хлопковый футер, 380 г/м²', 'Pamuklu polar, 380 g/m²'), care: WASH30,
    colours: [{ name: 'Krem', hex: '#E7E1D5', files: ['crewK-1'] }, { name: 'Ağ', hex: '#F2F0EB', files: ['crewB-1'] }],
  },
  {
    ref: 'HW-ES-SHIRT', category: 'koynek', gender: 'unisex', price: 69, sizes: UNI,
    name: l('Oversize Poplin Köynək', 'Oversize Poplin Shirt', 'Рубашка оверсайз из поплина', 'Oversize Poplin Gömlek'),
    desc: l('Pambıq poplindən oversize köynək.\nKlassik yaxa, uzun qol.\nÖn tərəfdən düymə ilə bağlanır.', 'Oversize shirt in cotton poplin.\nClassic collar, long sleeves.\nButton front.', 'Рубашка оверсайз из хлопкового поплина.\nКлассический воротник, длинный рукав.\nЗастёжка на пуговицы.', 'Pamuklu poplin oversize gömlek.\nKlasik yaka, uzun kol.\nÖnden düğmeli.'),
    fit: l('Oversize', 'Oversize', 'Оверсайз', 'Oversize'),
    comp: l('100% pambıq poplin', '100% cotton poplin', '100% хлопок, поплин', '%100 pamuk poplin'), care: WASH30,
    colours: [{ name: 'Ağ', hex: '#F2F0EB', files: ['shirt-1'] }],
  },
  {
    ref: 'HW-ES-RUGBY', category: 'koynek', gender: 'unisex', price: 65, sizes: UNI,
    name: l('Zolaqlı Uzunqol Polo', 'Striped Long Sleeve Polo', 'Поло в полоску с длинным рукавом', 'Çizgili Uzun Kollu Polo'),
    desc: l('Qalın pambıq trikotajdan uzunqol polo.\nEnli üfüqi zolaqlar, köynək yaxası.\nDüyməli planka.', 'Long sleeve polo in heavy cotton jersey.\nWide horizontal stripes, shirt collar.\nButton placket.', 'Поло с длинным рукавом из плотного хлопкового трикотажа.\nШирокая горизонтальная полоска, рубашечный воротник.\nПланка на пуговицах.', 'Kalın pamuklu süpremden uzun kollu polo.\nGeniş yatay çizgiler, gömlek yaka.\nDüğmeli pat.'),
    fit: l('Oversize', 'Oversize', 'Оверсайз', 'Oversize'),
    comp: l('100% pambıq, 280 q/m²', '100% cotton, 280 gsm', '100% хлопок, 280 г/м²', '%100 pamuk, 280 g/m²'), care: WASH30,
    colours: [{ name: 'Krem zolaqlı', hex: '#E9DFC6', files: ['rugby-1'] }],
  },
  {
    ref: 'HW-ES-TROUSERS', category: 'salvar', gender: 'unisex', price: 89, sizes: UNI,
    name: l('Pliseli Gen Şalvar', 'Pleated Wide Leg Trousers', 'Широкие брюки со складками', 'Pileli Bol Paça Pantolon'),
    desc: l('Hündür belli, gen balaqlı şalvar.\nÖndə plise, yan ciblər.\nFermuar və düymə ilə bağlanır.', 'High-waist trousers with a wide leg.\nFront pleats, side pockets.\nZip and button fastening.', 'Брюки с высокой посадкой и широкой штаниной.\nСкладки спереди, боковые карманы.\nЗастёжка на молнию и пуговицу.', 'Yüksek bel, bol paça pantolon.\nÖnde pile, yan cepler.\nFermuar ve düğme ile kapanır.'),
    fit: l('Gen balaq', 'Wide leg', 'Широкая штанина', 'Bol paça'),
    comp: l('Pambıq qarışıqlı tvil', 'Cotton-blend twill', 'Смесовый хлопок, твил', 'Pamuk karışımlı twill'), care: WASH30,
    colours: [{ name: 'Qara', hex: '#141414', files: ['trousers-1', 'trousers-2'] }],
  },
  {
    ref: 'HW-ES-JOGGER', category: 'salvar', gender: 'unisex', price: 79, sizes: UNI,
    name: l('Flis Jogger', 'Fleece Joggers', 'Джоггеры из футера', 'Polar Jogger'),
    desc: l('Pambıq flisdən jogger.\nRezinli bel və bağ, yan ciblər.\nRezinli balaq.', 'Joggers in cotton fleece.\nElastic waist with drawcord, side pockets.\nElastic cuffs.', 'Джоггеры из хлопкового футера.\nПояс на резинке со шнурком, боковые карманы.\nМанжеты на резинке.', 'Pamuklu polardan jogger.\nLastikli bel ve bağcık, yan cepler.\nLastikli paça.'),
    fit: l('Rahat kəsim', 'Relaxed fit', 'Свободный крой', 'Rahat kalıp'),
    comp: l('Pambıq flis, 320 q/m²', 'Cotton fleece, 320 gsm', 'Хлопковый футер, 320 г/м²', 'Pamuklu polar, 320 g/m²'), care: WASH30,
    colours: [{ name: 'Boz melanj', hex: '#B8B8B6', files: ['jogger-1', 'jogger-2', 'jogger-3'] }],
  },
  {
    ref: 'HW-ES-SET', category: 'dest', gender: 'unisex', price: 149, sizes: UNI,
    name: l('Dəst: Hudi + Gen Flis Şalvar', 'Set: Hoodie + Wide Fleece Trousers', 'Комплект: худи + широкие брюки из футера', 'Takım: Kapüşonlu + Bol Polar Pantolon'),
    desc: l('Eyni rəngdə ağır flis hudi və gen balaqlı şalvar.\nŞalvar: rezinli bel, bağ, düz açıq balaq.\nÜst və alt üçün fərqli ölçü istəsəniz, sifariş qeydində yazın.', 'Heavy fleece hoodie and wide leg trousers in the same colour.\nTrousers: elastic waist, drawcord, straight open hem.\nNeed different sizes for top and bottom? Add a note to your order.', 'Плотное худи и широкие брюки из футера одного цвета.\nБрюки: пояс на резинке, шнурок, прямой низ.\nНужны разные размеры верха и низа? Укажите в комментарии к заказу.', 'Aynı renkte kalın polar kapüşonlu ve bol paça pantolon.\nPantolon: lastikli bel, bağcık, düz açık paça.\nÜst ve alt için farklı beden mi? Sipariş notuna yazın.'),
    fit: l('Oversize', 'Oversize', 'Оверсайз', 'Oversize'),
    comp: l('Pambıq flis, 400 q/m²', 'Cotton fleece, 400 gsm', 'Хлопковый футер, 400 г/м²', 'Pamuklu polar, 400 g/m²'), care: WASH30,
    colours: [{ name: 'Daş bej', hex: '#B9A9A1', files: ['hoodie-3', 'set-2', 'set-3'] }],
  },
  {
    ref: 'HW-ES-TOTE', category: 'aksesuar', gender: 'unisex', price: 29, sizes: ['Standart'],
    name: l('Kanvas Çanta', 'Canvas Tote Bag', 'Сумка-шопер из канваса', 'Kanvas Çanta'),
    desc: l('Möhkəm pambıq kanvasdan çanta.\nİki uzun çiyin qulpu.\nSadə, çapsız.', 'Tote bag in sturdy cotton canvas.\nTwo long shoulder handles.\nPlain, no print.', 'Сумка из плотного хлопкового канваса.\nДве длинные ручки.\nБез принта.', 'Sağlam pamuklu kanvas çanta.\nİki uzun omuz sapı.\nSade, baskısız.'),
    fit: l('38 × 42 sm', '38 × 42 cm', '38 × 42 см', '38 × 42 cm'),
    comp: l('100% pambıq kanvas', '100% cotton canvas', '100% хлопок, канвас', '%100 pamuk kanvas'), care: WASH30,
    colours: [{ name: 'Qara', hex: '#141414', files: ['toteQ-1'] }, { name: 'Ağ', hex: '#F2F0EB', files: ['toteA-1'] }],
  },

  // ── ZƏRİF 01 · womenswear ────────────────────────────────────────────────
  {
    ref: 'HW-ZR-SKIRT', category: 'etek', gender: 'women', price: 79, sizes: WOM,
    name: l('Atlas Midi Ətək', 'Satin Midi Skirt', 'Атласная юбка миди', 'Saten Midi Etek'),
    desc: l('Axıcı atlas parçadan midi ətək.\nHündür bel, çəp kəsim.\nGizli rezinli bel.', 'Midi skirt in fluid satin.\nHigh waist, bias cut.\nConcealed elastic waistband.', 'Юбка миди из струящегося атласа.\nВысокая посадка, крой по косой.\nПотайная резинка на поясе.', 'Dökümlü saten midi etek.\nYüksek bel, verev kesim.\nGizli lastikli bel.'),
    fit: l('Düz, axıcı', 'Straight, fluid', 'Прямой, струящийся', 'Düz, dökümlü'),
    comp: l('Atlas (polyester)', 'Satin (polyester)', 'Атлас (полиэстер)', 'Saten (polyester)'), care: DELICATE,
    colours: [{ name: 'Qara', hex: '#141414', files: ['skirt-1', 'skirt-2'] }],
  },
  {
    ref: 'HW-ZR-WRAP', category: 'don', gender: 'women', price: 119, sizes: WOM,
    name: l('Qurşaqlı Midi Don', 'Belted Wrap Midi Dress', 'Платье миди с запахом и поясом', 'Kemerli Kruvaze Midi Elbise'),
    desc: l('Üst-üstə qapanan kəsimli midi don.\nKöynək yaxası, üçdə-iki qol.\nBeldə qurşaq, öndə yırtmac.', 'Midi dress with a wrap front.\nShirt collar, three-quarter sleeves.\nBelted waist, front slit.', 'Платье миди с запахом.\nРубашечный воротник, рукав три четверти.\nПояс на талии, разрез спереди.', 'Kruvaze kesim midi elbise.\nGömlek yaka, truvakar kol.\nBelde kemer, önde yırtmaç.'),
    fit: l('Belə oturan', 'Fitted waist', 'Приталенный', 'Bele oturan'),
    comp: l('Krep (polyester, elastan)', 'Crepe (polyester, elastane)', 'Креп (полиэстер, эластан)', 'Krep (polyester, elastan)'), care: DELICATE,
    colours: [{ name: 'Ağ', hex: '#F2F0EB', files: ['wrap-1'] }],
  },
  {
    ref: 'HW-ZR-KNIT', category: 'don', gender: 'women', price: 99, sizes: WOM,
    name: l('Trikotaj Midi Don', 'Knit Midi Dress', 'Трикотажное платье миди', 'Triko Midi Elbise'),
    desc: l('Rezin toxunuşlu trikotajdan midi don.\nDik yaxa, uzun qol.\nBədənə oturan kəsim.', 'Midi dress in rib knit.\nHigh neck, long sleeves.\nClose fit.', 'Платье миди из трикотажа в рубчик.\nВоротник-стойка, длинный рукав.\nОблегающий силуэт.', 'Fitilli trikodan midi elbise.\nDik yaka, uzun kol.\nVücuda oturan kalıp.'),
    fit: l('Bədənə oturan', 'Close fit', 'Облегающий', 'Vücuda oturan'),
    comp: l('Viskoza qarışıqlı trikotaj', 'Viscose-blend knit', 'Трикотаж с вискозой', 'Viskon karışımlı triko'), care: DELICATE,
    colours: [{ name: 'Bordo', hex: '#6B1E2B', files: ['knit-1', 'knit-2'] }],
  },
  {
    ref: 'HW-ZR-MIDI', category: 'don', gender: 'women', price: 109, sizes: WOM,
    name: l('Qara Midi Don', 'Black Midi Dress', 'Чёрное платье миди', 'Siyah Midi Elbise'),
    desc: l('Sadə kəsimli qara midi don.\nDairəvi yaxa, uzun qol.\nBaldıra qədər uzunluq, arxada yırtmac.', 'Black midi dress with a clean line.\nRound neck, long sleeves.\nCalf length, back vent.', 'Чёрное платье миди лаконичного кроя.\nКруглый вырез, длинный рукав.\nДлина до икры, шлица сзади.', 'Sade kesim siyah midi elbise.\nYuvarlak yaka, uzun kol.\nBaldır boyu, arkada yırtmaç.'),
    fit: l('Düz, belə oturan', 'Straight, fitted', 'Прямой, приталенный', 'Düz, bele oturan'),
    comp: l('Krep (polyester, elastan)', 'Crepe (polyester, elastane)', 'Креп (полиэстер, эластан)', 'Krep (polyester, elastan)'), care: DELICATE,
    colours: [{ name: 'Qara', hex: '#141414', files: ['midi-1'] }],
  },
  {
    ref: 'HW-ZR-BLOUSE', category: 'koynek', gender: 'women', price: 75, sizes: WOM,
    name: l('Atlas Bluz', 'Satin Blouse', 'Атласная блуза', 'Saten Bluz'),
    desc: l('Parlaq atlasdan qısa bluz.\nYaxada kəsik, büzməli çiyin.\nBeldə çarpaz qapanma.', 'Cropped blouse in lustrous satin.\nKeyhole neck, gathered shoulder.\nCrossover waist.', 'Укороченная блуза из блестящего атласа.\nВырез-капля, сборка на плече.\nЗапах на талии.', 'Parlak satenden kısa bluz.\nYakada damla, büzgülü omuz.\nBelde çapraz kapama.'),
    fit: l('Qısa, belə oturan', 'Cropped, fitted', 'Укороченный, приталенный', 'Kısa, bele oturan'),
    comp: l('Atlas (polyester)', 'Satin (polyester)', 'Атлас (полиэстер)', 'Saten (polyester)'), care: DELICATE,
    colours: [{ name: 'Tünd yaşıl', hex: '#1F3B3A', files: ['blouse-1', 'blouse-2', 'blouse-3'] }],
  },
  {
    ref: 'HW-ZR-BLAZER', category: 'ust-geyim', gender: 'women', price: 159, sizes: WOM,
    name: l('Oversize Blazer', 'Oversize Blazer', 'Блейзер оверсайз', 'Oversize Blazer'),
    desc: l('Oversize kəsimli blazer.\nKlassik yaxa, qapaqlı ciblər.\nÖndə düymə, astarlı.', 'Blazer in an oversize cut.\nNotched lapels, flap pockets.\nButton front, lined.', 'Блейзер оверсайз.\nКлассические лацканы, карманы с клапанами.\nЗастёжка на пуговицы, на подкладке.', 'Oversize kesim blazer.\nKlasik yaka, kapaklı cepler.\nÖnden düğmeli, astarlı.'),
    fit: l('Oversize', 'Oversize', 'Оверсайз', 'Oversize'),
    comp: l('Kostyumluq parça (polyester, viskoza)', 'Suiting (polyester, viscose)', 'Костюмная ткань (полиэстер, вискоза)', 'Takım kumaşı (polyester, viskon)'), care: DRY,
    colours: [{ name: 'Bej', hex: '#D9CDB8', files: ['blazer-1', 'blazer-2'] }],
  },
  {
    ref: 'HW-ZR-TROUSERS', category: 'salvar', gender: 'women', price: 95, sizes: WOM,
    name: l('Hündür Belli Gen Şalvar', 'High Waist Wide Leg Trousers', 'Широкие брюки с высокой посадкой', 'Yüksek Bel Bol Paça Pantolon'),
    desc: l('Hündür belli, axıcı gen balaqlı şalvar.\nÖndə plise, yan ciblər.\nFermuar və düymə ilə bağlanır.', 'High-waist trousers with a fluid wide leg.\nFront pleats, side pockets.\nZip and button fastening.', 'Брюки с высокой посадкой и струящейся широкой штаниной.\nСкладки спереди, боковые карманы.\nЗастёжка на молнию и пуговицу.', 'Yüksek bel, dökümlü bol paça pantolon.\nÖnde pile, yan cepler.\nFermuar ve düğme ile kapanır.'),
    fit: l('Gen balaq', 'Wide leg', 'Широкая штанина', 'Bol paça'),
    comp: l('Kostyumluq parça (polyester, viskoza)', 'Suiting (polyester, viscose)', 'Костюмная ткань (полиэстер, вискоза)', 'Takım kumaşı (polyester, viskon)'), care: DELICATE,
    colours: [{ name: 'Boz-bej', hex: '#A79A8C', files: ['wtr-2', 'wtr-1', 'wtr-3'] }],
  },
  {
    ref: 'HW-ZR-TRENCH', category: 'ust-geyim', gender: 'women', price: 189, sizes: WOM,
    name: l('Klassik Trençkot', 'Classic Trench Coat', 'Классический тренч', 'Klasik Trençkot'),
    desc: l('Pambıq qabardindən uzun trençkot.\nİkisıra düymə, geniş yaxa.\nBeldə və qolda qurşaq.', 'Long trench coat in cotton gabardine.\nDouble-breasted front, wide lapels.\nBelted waist and cuffs.', 'Длинный тренч из хлопкового габардина.\nДвубортная застёжка, широкие лацканы.\nПояс на талии и хлястики на рукавах.', 'Pamuklu gabardinden uzun trençkot.\nKruvaze düğme, geniş yaka.\nBelde ve kolda kemer.'),
    fit: l('Rahat, qurşaqlı', 'Relaxed, belted', 'Свободный, с поясом', 'Rahat, kemerli'),
    comp: l('Pambıq qabardin', 'Cotton gabardine', 'Хлопковый габардин', 'Pamuklu gabardin'), care: DRY,
    colours: [{ name: 'Bej', hex: '#D9CDB8', files: ['trench-1'] }],
  },
];

// New shop sections for womenswear. Section photos are separate stock photos, not product shots.
const CATEGORIES = [
  { id: 'don', sort: 6, photo: '1713425887001-5c7bb45711f8', title: l('Don', 'Dresses', 'Платья', 'Elbise'), desc: l('Midi donlar: trikotaj, krep və qurşaqlı kəsimlər.', 'Midi dresses: knit, crepe and belted cuts.', 'Платья миди: трикотаж, креп и модели с поясом.', 'Midi elbiseler: triko, krep ve kemerli kesimler.') },
  { id: 'etek', sort: 7, photo: '1597253702951-6b83f54bcb37', title: l('Ətək', 'Skirts', 'Юбки', 'Etek'), desc: l('Axıcı atlas və klassik midi ətəklər.', 'Fluid satin and classic midi skirts.', 'Струящиеся атласные и классические юбки миди.', 'Dökümlü saten ve klasik midi etekler.') },
  { id: 'ust-geyim', sort: 8, photo: '1589400445193-c881a4b0b38a', title: l('Üst geyim', 'Outerwear', 'Верхняя одежда', 'Dış giyim'), desc: l('Blazer, trençkot və mövsümlük üst geyimlər.', 'Blazers, trench coats and seasonal outerwear.', 'Блейзеры, тренчи и сезонная верхняя одежда.', 'Blazer, trençkot ve mevsimlik dış giyim.') },
];

async function put(body: Buffer, remote: string) {
  const { error } = await sb.storage.from(BUCKET).upload(remote, body, { contentType: 'image/jpeg', upsert: true, cacheControl: '31536000' });
  if (error) throw new Error(`${remote}: ${error.message}`);
  return sb.storage.from(BUCKET).getPublicUrl(remote).data.publicUrl;
}

(async () => {
  for (const c of CATEGORIES) {
    const src = Buffer.from(await (await fetch(`https://images.unsplash.com/photo-${c.photo}?w=1200&q=82&fm=jpg`)).arrayBuffer());
    const image = await put(await sharp(src).resize(1200, 1500, { fit: 'cover', position: 'top' }).jpeg({ quality: 82, progressive: true }).toBuffer(), `categories/${c.id}-${c.photo.split('-')[0]}.jpg`);
    const row = {
      id: c.id, title: c.title.az, description: c.desc.az, image, active: true, sort_order: c.sort,
      extra: { link: `/collections?category=${c.id}`, showInMenu: true, titles: { en: c.title.en, ru: c.title.ru, tr: c.title.tr }, descriptions: { en: c.desc.en, ru: c.desc.ru, tr: c.desc.tr } },
    };
    const { error } = await sb.from('categories').upsert(row);
    if (error) throw new Error(`category ${c.id}: ${error.message}`);
    console.log('category', c.id);
  }

  for (let i = 0; i < ITEMS.length; i++) {
    const p = ITEMS[i];
    const colors = [];
    for (const c of p.colours) {
      const gallery: string[] = [];
      for (const f of c.files) gallery.push(await put(fs.readFileSync(path.join(DIR, `${f}.jpg`)), `products/photo/${f}.jpg`));
      colors.push({ name: c.name, hex: c.hex, image: gallery[0], hoverImage: gallery[1] || '', gallery });
    }
    const { data: existing } = await sb.from('products').select('id').eq('ref_code', p.ref).maybeSingle();
    const saved = await saveProduct({
      id: existing?.id, refCode: p.ref, name: p.name.az, description: p.desc.az, category: p.category, gender: p.gender, price: p.price,
      badge: 'YENİ', fit: p.fit.az, composition: p.comp.az, care: p.care.az,
      inStock: true, trackStock: false, isNew: true, hidden: false, sortOrder: i - ITEMS.length, printLayers: [],
      sizes: p.sizes, colors,
      image: colors[0].image, images: [colors[0].image], hoverImage: colors[0].hoverImage, gallery: colors[0].gallery,
      translations: Object.fromEntries((['en', 'ru', 'tr'] as const).map((k) => [k, { name: p.name[k], description: p.desc[k], fit: p.fit[k], composition: p.comp[k], care: p.care[k] }])),
    } as any);
    console.log(p.ref, saved.slug, p.price, 'AZN');
  }
})();
