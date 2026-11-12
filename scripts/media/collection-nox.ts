// Horwalle "NOX" — dark streetwear collection (designs: scripts/media/nox-designs.py).
// Same shape as collection.ts so publish-collection.ts can upload it:
//   COLLECTION_FILE=./collection-nox PRINT_DIR=prints/nox IMG_DIR=products/nox npx tsx --env-file=.env.local \
//     scripts/media/publish-collection.ts <designs_dir> <images_dir> <images_dir> --hide-old
// Prices in AZN are suggestions; the owner confirms them in the admin.
import type { Colour, Product } from './collection';

const TOP = ['S', 'M', 'L', 'XL', 'XXL'];
const BLACK: Colour = { name: 'Qara', hex: '#141414', ink: 'bone' };
const WHITE: Colour = { name: 'Ağ', hex: '#EFECE6', ink: 'ink' };
const GREY: Colour = { name: 'Boz', hex: '#9C9B98', ink: 'ink' };

const TEE_COMP = { az: 'Pambıq, qalın süprəm (240 q/m²)', en: 'Cotton, heavyweight jersey (240 gsm)', ru: 'Хлопок, плотная кулирка (240 г/м²)', tr: 'Pamuk, kalın süprem (240 g/m²)' };
const HOOD_COMP = { az: 'Pambıq qarışığı, 3 iplik, içi yumşaq tüklü', en: 'Cotton blend, 3-thread fleece, brushed inside', ru: 'Смесовый хлопок, футер 3-нитка, с начёсом', tr: 'Pamuk karışımı, 3 iplik, içi şardonlu' };
const TEE_FIT = { en: 'Boxy oversize', ru: 'Свободный оверсайз', tr: 'Boxy oversize' };
const HOOD_FIT = { en: 'Heavy hoodie, 3-thread fleece', ru: 'Плотное худи, футер 3-нитка', tr: 'Kalın kapüşonlu, 3 iplik' };
const WORN = {
  az: 'Çap köhnəlmiş (vintage) effektlidir — bu dizaynın bir hissəsidir.',
  en: 'The print has a worn vintage finish by design.',
  ru: 'Принт с эффектом винтажной потёртости — так задумано.',
  tr: 'Baskı bilerek eskitilmiş (vintage) görünümdedir.',
};

export const COLLECTION: Product[] = [
  {
    key: 'nox-thorn-tee', shape: 'oversize', category: 'koynek', price: 39, sizes: TOP, badge: 'NOX · YENİ',
    fit: 'Boxy oversize', composition: TEE_COMP.az, colours: [BLACK, WHITE], front: 'thorn-big', frontKind: 'big',
    name: { az: 'Thorn Köynək', en: 'Thorn Tee', ru: 'Футболка Thorn', tr: 'Thorn Tişört' },
    description: {
      az: `Öndə böyük çap: tikanlı, simmetrik "sigil" xətləri və ortada qotik Horwalle yazısı.\n${WORN.az}\nKəsim: geniş, düşük çiyinli boxy oversize.`,
      en: `Big front print: symmetrical thorn "sigil" lines around a gothic Horwalle wordmark.\n${WORN.en}\nFit: boxy oversize with dropped shoulders.`,
      ru: `Большой принт спереди: симметричные шипастые линии-«сигилы» вокруг готической надписи Horwalle.\n${WORN.ru}\nКрой: свободный оверсайз со спущенным плечом.`,
      tr: `Önde büyük baskı: ortadaki gotik Horwalle yazısını saran simetrik dikenli "sigil" çizgileri.\n${WORN.tr}\nKalıp: düşük omuzlu boxy oversize.`,
    },
    fitT: TEE_FIT, compositionT: TEE_COMP,
  },
  {
    key: 'nox-gothic-tee', shape: 'oversize', category: 'koynek', price: 39, sizes: TOP,
    fit: 'Boxy oversize', composition: TEE_COMP.az, colours: [BLACK, WHITE], front: 'h-chest', back: 'gothic-back',
    name: { az: 'Gothic Köynək', en: 'Gothic Tee', ru: 'Футболка Gothic', tr: 'Gothic Tişört' },
    description: {
      az: `Arxada tağ boyunca qotik Horwalle, dörd uclu ulduz və "Est. MMXXVI". Öndə sinədə tikanlı H monoqramı.\n${WORN.az}\nKəsim: boxy oversize.`,
      en: `Back: an arched gothic Horwalle, a four-point star and "Est. MMXXVI". Chest: the thorned H monogram.\n${WORN.en}\nFit: boxy oversize.`,
      ru: `Спина: готическая надпись Horwalle дугой, четырёхконечная звезда и «Est. MMXXVI». Грудь: монограмма H с шипами.\n${WORN.ru}\nКрой: свободный оверсайз.`,
      tr: `Sırt: kemer şeklinde gotik Horwalle, dört köşeli yıldız ve "Est. MMXXVI". Göğüs: dikenli H monogramı.\n${WORN.tr}\nKalıp: boxy oversize.`,
    },
    fitT: TEE_FIT, compositionT: TEE_COMP,
  },
  {
    key: 'nox-chrome-tee', shape: 'oversize', category: 'koynek', price: 42, sizes: TOP,
    fit: 'Boxy oversize', composition: TEE_COMP.az, colours: [BLACK], front: 'h-chest', back: 'chrome-back',
    name: { az: 'Chrome Köynək', en: 'Chrome Tee', ru: 'Футболка Chrome', tr: 'Chrome Tişört' },
    description: {
      az: 'Arxada xrom effektli, parıltılı qotik Horwalle yazısı və ulduzlar (rəngli çap). Öndə sinədə H monoqramı.\nKəsim: boxy oversize.',
      en: 'Back: a liquid-chrome gothic Horwalle with sparkles (full-colour print). Chest: the H monogram.\nFit: boxy oversize.',
      ru: 'Спина: готическая надпись Horwalle с эффектом жидкого хрома и звёздами (цветная печать). Грудь: монограмма H.\nКрой: свободный оверсайз.',
      tr: 'Sırt: sıvı krom efektli gotik Horwalle ve parıltılar (renkli baskı). Göğüs: H monogramı.\nKalıp: boxy oversize.',
    },
    fitT: TEE_FIT, compositionT: TEE_COMP,
  },
  {
    key: 'nox-odlar-hoodie', shape: 'hoodie', category: 'hudi', price: 65, sizes: TOP, badge: 'NOX · YENİ',
    fit: 'Hudi qalın (3iplik)', composition: HOOD_COMP.az, colours: [BLACK, GREY], front: 'h-chest', back: 'odlar-back',
    name: { az: 'Odlar Yurdu Hudi', en: 'Land of Fire Hoodie', ru: 'Худи «Страна огней»', tr: 'Ateşler Diyarı Kapüşonlu' },
    description: {
      az: `Arxada tikan kimi yuxarı qalxan alov xətləri və qotik "Odlar Yurdu" yazısı. Öndə sinədə H monoqramı.\n${WORN.az}\nQalın 3 iplik parça, içi yumşaq tüklü.`,
      en: `Back: flames rising like thorns over a gothic "Odlar Yurdu" (Land of Fire). Chest: the H monogram.\n${WORN.en}\nHeavy 3-thread fleece, brushed inside.`,
      ru: `Спина: языки пламени, поднимающиеся как шипы, и готическая надпись «Odlar Yurdu» (Страна огней). Грудь: монограмма H.\n${WORN.ru}\nПлотный футер 3-нитка с начёсом.`,
      tr: `Sırt: diken gibi yükselen alevler ve gotik "Odlar Yurdu" (Ateşler Diyarı) yazısı. Göğüs: H monogramı.\n${WORN.tr}\nKalın 3 iplik, içi şardonlu.`,
    },
    fitT: HOOD_FIT, compositionT: HOOD_COMP,
  },
  {
    key: 'nox-thorn-hoodie', shape: 'hoodie', category: 'hudi', price: 65, sizes: TOP,
    fit: 'Hudi qalın (3iplik)', composition: HOOD_COMP.az, colours: [BLACK], front: 'thorn-big', frontKind: 'big',
    name: { az: 'Thorn Hudi', en: 'Thorn Hoodie', ru: 'Худи Thorn', tr: 'Thorn Kapüşonlu' },
    description: {
      az: `Öndə böyük tikanlı "sigil" çapı və qotik Horwalle yazısı.\n${WORN.az}\nQalın 3 iplik parça, içi yumşaq tüklü.`,
      en: `Big front print: thorn "sigil" lines and a gothic Horwalle wordmark.\n${WORN.en}\nHeavy 3-thread fleece, brushed inside.`,
      ru: `Большой принт спереди: шипастые линии-«сигилы» и готическая надпись Horwalle.\n${WORN.ru}\nПлотный футер 3-нитка с начёсом.`,
      tr: `Önde büyük baskı: dikenli "sigil" çizgileri ve gotik Horwalle yazısı.\n${WORN.tr}\nKalın 3 iplik, içi şardonlu.`,
    },
    fitT: HOOD_FIT, compositionT: HOOD_COMP,
  },
  {
    key: 'nox-star-hoodie', shape: 'hoodie', category: 'hudi', price: 65, sizes: TOP,
    fit: 'Hudi qalın (3iplik)', composition: HOOD_COMP.az, colours: [BLACK, WHITE], front: 'h-chest', back: 'star-back',
    name: { az: 'North Star Hudi', en: 'North Star Hoodie', ru: 'Худи North Star', tr: 'North Star Kapüşonlu' },
    description: {
      az: `Arxada iç-içə xətlərdən böyük dörd uclu ulduz və qotik Horwalle. Öndə sinədə H monoqramı.\n${WORN.az}\nQalın 3 iplik parça, içi yumşaq tüklü.`,
      en: `Back: a large four-point star drawn in nested lines over a gothic Horwalle. Chest: the H monogram.\n${WORN.en}\nHeavy 3-thread fleece, brushed inside.`,
      ru: `Спина: большая четырёхконечная звезда из вложенных линий и готическая надпись Horwalle. Грудь: монограмма H.\n${WORN.ru}\nПлотный футер 3-нитка с начёсом.`,
      tr: `Sırt: iç içe çizgilerden büyük dört köşeli yıldız ve gotik Horwalle. Göğüs: H monogramı.\n${WORN.tr}\nKalın 3 iplik, içi şardonlu.`,
    },
    fitT: HOOD_FIT, compositionT: HOOD_COMP,
  },
  {
    key: 'nox-thorn-joggers', shape: 'pants', category: 'salvar', price: 49, sizes: TOP,
    fit: 'Şalvar qalın (3iplik)', composition: HOOD_COMP.az, colours: [BLACK], front: 'nox-leg', frontKind: 'leg',
    name: { az: 'Thorn Şalvar', en: 'Thorn Joggers', ru: 'Брюки Thorn', tr: 'Thorn Eşofman Altı' },
    description: {
      az: 'Sol ayaq boyunca şaquli qotik Horwalle yazısı, altında ulduz və tikanlar. Rahat kəsim, rezinli bel.\nQalın 3 iplik parça, içi yumşaq tüklü.',
      en: 'A vertical gothic Horwalle down the left leg, ending in a star and thorns. Relaxed fit, elastic waist.\nHeavy 3-thread fleece, brushed inside.',
      ru: 'Вертикальная готическая надпись Horwalle вдоль левой штанины, внизу звезда и шипы. Свободный крой, резинка на поясе.\nПлотный футер 3-нитка с начёсом.',
      tr: 'Sol paça boyunca dikey gotik Horwalle, altında yıldız ve dikenler. Rahat kalıp, lastikli bel.\nKalın 3 iplik, içi şardonlu.',
    },
    fitT: { en: 'Joggers, 3-thread fleece', ru: 'Брюки, футер 3-нитка', tr: 'Eşofman altı, 3 iplik' }, compositionT: HOOD_COMP,
  },
  {
    key: 'nox-h-cap', shape: 'cap', category: 'aksesuar', price: 25, sizes: ['Standart'],
    fit: 'Kepka', composition: 'Pambıq', colours: [BLACK, WHITE], front: 'h-cap', frontKind: 'cap',
    name: { az: 'H Monoqram Kepka', en: 'H Monogram Cap', ru: 'Кепка H Monogram', tr: 'H Monogram Şapka' },
    description: {
      az: 'Öndə tikanlı qotik H monoqramı. Arxadan tənzimlənir.\nRənglər: tam qara və ya ağ ön panel + qara tor arxa.',
      en: 'The thorned gothic H monogram on the front. Adjustable back.\nColours: all black, or white front panel with black mesh back.',
      ru: 'Готическая монограмма H с шипами спереди. Регулируется сзади.\nЦвета: полностью чёрная или белая передняя панель с чёрной сеткой сзади.',
      tr: 'Önde dikenli gotik H monogramı. Arkadan ayarlanabilir.\nRenkler: tamamen siyah veya beyaz ön panel + siyah file arka.',
    },
    fitT: { en: 'Cap', ru: 'Кепка', tr: 'Şapka' }, compositionT: { az: 'Pambıq', en: 'Cotton', ru: 'Хлопок', tr: 'Pamuk' },
  },
  {
    key: 'nox-thorn-set', shape: 'set', category: 'dest', price: 105, sizes: TOP, badge: 'DƏST',
    fit: 'Hudi + şalvar, qalın (3iplik)', composition: HOOD_COMP.az, colours: [BLACK], front: 'thorn-big', frontKind: 'big',
    extraPrints: [['nox-leg', 'Şalvar — ayaq çapı', 'leg']],
    name: { az: 'Thorn Dəst — Hudi + Şalvar', en: 'Thorn Set — Hoodie + Joggers', ru: 'Комплект Thorn — худи + брюки', tr: 'Thorn Takım — Kapüşonlu + Eşofman Altı' },
    description: {
      az: 'Thorn hudi və Thorn şalvar bir dəstdə — ayrı-ayrı almaqdan 9 ₼ ucuz.\nHudi: öndə böyük tikanlı sigil çapı. Şalvar: sol ayaqda qotik Horwalle.\nQalın 3 iplik parça. Hudi və şalvar üçün fərqli ölçü istəsəniz, sifariş qeydində yazın.',
      en: 'The Thorn hoodie and Thorn joggers as one set — 9 ₼ less than buying them separately.\nHoodie: big thorn sigil print on the front. Joggers: gothic Horwalle on the left leg.\nHeavy 3-thread fleece. Need different sizes for top and bottom? Add a note to your order.',
      ru: 'Худи Thorn и брюки Thorn в одном комплекте — на 9 ₼ дешевле, чем по отдельности.\nХуди: большой шипастый принт спереди. Брюки: готическая надпись Horwalle на левой штанине.\nПлотный футер 3-нитка. Нужны разные размеры верха и низа? Укажите в комментарии к заказу.',
      tr: 'Thorn kapüşonlu ve Thorn eşofman altı tek takımda — ayrı almaktan 9 ₼ daha ucuz.\nKapüşonlu: önde büyük dikenli sigil baskı. Eşofman altı: sol paçada gotik Horwalle.\nKalın 3 iplik. Üst ve alt için farklı beden mi istiyorsunuz? Sipariş notuna yazın.',
    },
    fitT: { en: 'Hoodie + joggers, 3-thread fleece', ru: 'Худи + брюки, футер 3-нитка', tr: 'Kapüşonlu + eşofman altı, 3 iplik' }, compositionT: HOOD_COMP,
  },
  {
    key: 'nox-gothic-set', shape: 'set', category: 'dest', price: 58, sizes: TOP, badge: 'DƏST',
    fit: 'Oversize köynək + kepka', composition: TEE_COMP.az, colours: [WHITE], front: 'h-chest', back: 'gothic-back',
    extraPrints: [['h-cap', 'Kepka dizaynı', 'cap']],
    name: { az: 'Gothic Dəst — Köynək + Kepka', en: 'Gothic Set — Tee + Cap', ru: 'Комплект Gothic — футболка + кепка', tr: 'Gothic Takım — Tişört + Şapka' },
    description: {
      az: 'Ağ Gothic köynək və H monoqram kepka bir dəstdə — ayrı-ayrı almaqdan 6 ₼ ucuz.\nKöynək: arxada qotik Horwalle və ulduz, öndə H monoqramı. Kepka: ağ ön panel, qara tor arxa.\nÖlçü köynək üçündür.',
      en: 'The white Gothic tee and the H monogram cap as one set — 6 ₼ less than buying them separately.\nTee: gothic Horwalle and star on the back, H monogram on the chest. Cap: white front panel, black mesh back.\nThe size is for the tee.',
      ru: 'Белая футболка Gothic и кепка H Monogram в одном комплекте — на 6 ₼ дешевле, чем по отдельности.\nФутболка: готическая надпись Horwalle и звезда на спине, монограмма H на груди. Кепка: белая передняя панель, чёрная сетка сзади.\nРазмер — для футболки.',
      tr: 'Beyaz Gothic tişört ve H monogram şapka tek takımda — ayrı almaktan 6 ₼ daha ucuz.\nTişört: sırtta gotik Horwalle ve yıldız, göğüste H monogramı. Şapka: beyaz ön panel, siyah file arka.\nBeden tişört içindir.',
    },
    fitT: { en: 'Oversize tee + cap', ru: 'Футболка оверсайз + кепка', tr: 'Oversize tişört + şapka' }, compositionT: TEE_COMP,
  },
];
