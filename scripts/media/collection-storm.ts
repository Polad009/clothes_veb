// Horwalle "STORM" — horror / lightning / mentality collection (designs: storm-designs.py,
// images: storm-images.py). Publish:
//   COLLECTION_FILE=./collection-storm PRINT_DIR=prints/storm IMG_DIR=products/storm npx tsx --env-file=.env.local \
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
const CHEST = {
  az: 'Öndə sinədə ildırım + MENTALITY nişanı.',
  en: 'Chest: lightning bolt + MENTALITY mark.',
  ru: 'На груди: молния и надпись MENTALITY.',
  tr: 'Göğüste: şimşek + MENTALITY işareti.',
};
const WORN = {
  az: 'Çap köhnəlmiş (vintage) effektlidir — bu dizaynın bir hissəsidir.',
  en: 'The print has a worn vintage finish by design.',
  ru: 'Принт с эффектом винтажной потёртости — так задумано.',
  tr: 'Baskı bilerek eskitilmiş (vintage) görünümdedir.',
};

const tee = (key: string, name: Product['name'], back: string, desc: { az: string; en: string; ru: string; tr: string }, colours: Colour[], badge?: string): Product => ({
  key, shape: 'oversize', category: 'koynek', price: 39, sizes: TOP, badge,
  fit: 'Boxy oversize', composition: TEE_COMP.az, colours, front: 'bolt-chest', back,
  name,
  description: {
    az: `${desc.az}\n${CHEST.az}\n${WORN.az}\nKəsim: geniş, düşük çiyinli boxy oversize.`,
    en: `${desc.en}\n${CHEST.en}\n${WORN.en}\nFit: boxy oversize with dropped shoulders.`,
    ru: `${desc.ru}\n${CHEST.ru}\n${WORN.ru}\nКрой: свободный оверсайз со спущенным плечом.`,
    tr: `${desc.tr}\n${CHEST.tr}\n${WORN.tr}\nKalıp: düşük omuzlu boxy oversize.`,
  },
  fitT: TEE_FIT, compositionT: TEE_COMP,
});

const hoodie = (key: string, name: Product['name'], back: string, desc: { az: string; en: string; ru: string; tr: string }, colours: Colour[], badge?: string): Product => ({
  key, shape: 'hoodie', category: 'hudi', price: 65, sizes: TOP, badge,
  fit: 'Hudi qalın (3iplik)', composition: HOOD_COMP.az, colours, front: 'bolt-chest', back,
  name,
  description: {
    az: `${desc.az}\n${CHEST.az}\n${WORN.az}\nQalın 3 iplik parça, içi yumşaq tüklü.`,
    en: `${desc.en}\n${CHEST.en}\n${WORN.en}\nHeavy 3-thread fleece, brushed inside.`,
    ru: `${desc.ru}\n${CHEST.ru}\n${WORN.ru}\nПлотный футер 3-нитка с начёсом.`,
    tr: `${desc.tr}\n${CHEST.tr}\n${WORN.tr}\nKalın 3 iplik, içi şardonlu.`,
  },
  fitT: HOOD_FIT, compositionT: HOOD_COMP,
});

export const COLLECTION: Product[] = [
  tee('storm-strike-tee', { az: 'Strike Köynək', en: 'Strike Tee', ru: 'Футболка Strike', tr: 'Strike Tişört' }, 'strike-back', {
    az: 'Arxada gecə səmasını yaran real ildırım fotosu və iri HORWALLE yazısı.',
    en: 'Back: a real photo of lightning splitting the night sky over a bold HORWALLE.',
    ru: 'Спина: настоящая фотография молнии в ночном небе и крупная надпись HORWALLE.',
    tr: 'Sırt: gece gökyüzünü yaran gerçek bir şimşek fotoğrafı ve iri HORWALLE yazısı.',
  }, [BLACK, WHITE], 'STORM · YENİ'),
  tee('storm-mentality-tee', { az: 'Mentality Köynək', en: 'Mentality Tee', ru: 'Футболка Mentality', tr: 'Mentality Tişört' }, 'mentality-back', {
    az: 'Arxada qaranlıqdan çıxan kəllə, üstündə MENTALITY, altında "Fear is a state of mind".',
    en: 'Back: a skull rising out of the dark under MENTALITY, with "Fear is a state of mind".',
    ru: 'Спина: череп, выходящий из темноты, надпись MENTALITY и «Fear is a state of mind».',
    tr: 'Sırt: karanlıktan çıkan kafatası, üstünde MENTALITY, altında "Fear is a state of mind".',
  }, [BLACK, WHITE]),
  {
    key: 'storm-halfdead-tee', shape: 'oversize', category: 'koynek', price: 42, sizes: TOP,
    fit: 'Boxy oversize', composition: TEE_COMP.az, colours: [BLACK], front: 'halfdead-big', frontKind: 'big',
    name: { az: 'Half Dead Köynək', en: 'Half Dead Tee', ru: 'Футболка Half Dead', tr: 'Half Dead Tişört' },
    description: {
      az: `Öndə böyük çap: yarısı işıqda, yarısı qaranlıqda kəllə və yan tərəfdə "Half dead / half alive".\n${WORN.az}\nKəsim: boxy oversize.`,
      en: `Big front print: a skull half in light, half in shadow, with "Half dead / half alive" down the side.\n${WORN.en}\nFit: boxy oversize.`,
      ru: `Большой принт спереди: череп наполовину в свете, наполовину в тени и надпись «Half dead / half alive» сбоку.\n${WORN.ru}\nКрой: свободный оверсайз.`,
      tr: `Önde büyük baskı: yarısı ışıkta yarısı gölgede bir kafatası, yanda "Half dead / half alive".\n${WORN.tr}\nKalıp: boxy oversize.`,
    },
    fitT: TEE_FIT, compositionT: TEE_COMP,
  },
  hoodie('storm-storm-hoodie', { az: 'Born in the Storm Hudi', en: 'Born in the Storm Hoodie', ru: 'Худи Born in the Storm', tr: 'Born in the Storm Kapüşonlu' }, 'storm-back', {
    az: 'Arxada cırıq çərçivədə ildırımlı fırtına fotosu, qotik Horwalle və "Born in the storm".',
    en: 'Back: a lightning storm in a torn frame, gothic Horwalle and "Born in the storm".',
    ru: 'Спина: грозовая буря в рваной рамке, готическая надпись Horwalle и «Born in the storm».',
    tr: 'Sırt: yırtık çerçevede şimşekli fırtına, gotik Horwalle ve "Born in the storm".',
  }, [BLACK], 'STORM · YENİ'),
  hoodie('storm-reach-hoodie', { az: 'Save Yourself Hudi', en: 'Save Yourself Hoodie', ru: 'Худи Save Yourself', tr: 'Save Yourself Kapüşonlu' }, 'reach-back', {
    az: 'Arxada qaranlıqdan yuxarı uzanan əllər və iri "SAVE YOURSELF".',
    en: 'Back: hands reaching up out of the dark under a bold "SAVE YOURSELF".',
    ru: 'Спина: руки, тянущиеся из темноты, и крупная надпись «SAVE YOURSELF».',
    tr: 'Sırt: karanlıktan yukarı uzanan eller ve iri "SAVE YOURSELF".',
  }, [BLACK, GREY]),
  hoodie('storm-mentality-hoodie', { az: 'Mentality Hudi', en: 'Mentality Hoodie', ru: 'Худи Mentality', tr: 'Mentality Kapüşonlu' }, 'mentality-back', {
    az: 'Arxada qaranlıqdan çıxan kəllə və MENTALITY yazısı.',
    en: 'Back: a skull rising out of the dark under MENTALITY.',
    ru: 'Спина: череп, выходящий из темноты, и надпись MENTALITY.',
    tr: 'Sırt: karanlıktan çıkan kafatası ve MENTALITY yazısı.',
  }, [BLACK, WHITE]),
  {
    key: 'storm-mentality-joggers', shape: 'pants', category: 'salvar', price: 49, sizes: TOP,
    fit: 'Şalvar qalın (3iplik)', composition: HOOD_COMP.az, colours: [BLACK], front: 'mentality-leg', frontKind: 'leg',
    name: { az: 'Mentality Şalvar', en: 'Mentality Joggers', ru: 'Брюки Mentality', tr: 'Mentality Eşofman Altı' },
    description: {
      az: 'Sol ayaq boyunca şaquli MENTALITY yazısı və ildırım. Rahat kəsim, rezinli bel.\nQalın 3 iplik parça, içi yumşaq tüklü.',
      en: 'A vertical MENTALITY print with a lightning bolt down the left leg. Relaxed fit, elastic waist.\nHeavy 3-thread fleece, brushed inside.',
      ru: 'Вертикальная надпись MENTALITY и молния вдоль левой штанины. Свободный крой, резинка на поясе.\nПлотный футер 3-нитка с начёсом.',
      tr: 'Sol paça boyunca dikey MENTALITY baskısı ve şimşek. Rahat kalıp, lastikli bel.\nKalın 3 iplik, içi şardonlu.',
    },
    fitT: { en: 'Joggers, 3-thread fleece', ru: 'Брюки, футер 3-нитка', tr: 'Eşofman altı, 3 iplik' }, compositionT: HOOD_COMP,
  },
  {
    key: 'storm-bolt-cap', shape: 'cap', category: 'aksesuar', price: 25, sizes: ['Standart'],
    fit: 'Kepka', composition: 'Pambıq', colours: [BLACK, WHITE], front: 'bolt-cap', frontKind: 'cap',
    name: { az: 'Bolt Kepka', en: 'Bolt Cap', ru: 'Кепка Bolt', tr: 'Bolt Şapka' },
    description: {
      az: 'Öndə ildırım nişanı. Arxadan tənzimlənir.\nRənglər: tam qara və ya ağ ön panel + qara tor arxa.',
      en: 'A lightning bolt on the front. Adjustable back.\nColours: all black, or white front panel with black mesh back.',
      ru: 'Молния спереди. Регулируется сзади.\nЦвета: полностью чёрная или белая передняя панель с чёрной сеткой сзади.',
      tr: 'Önde şimşek işareti. Arkadan ayarlanabilir.\nRenkler: tamamen siyah veya beyaz ön panel + siyah file arka.',
    },
    fitT: { en: 'Cap', ru: 'Кепка', tr: 'Şapka' }, compositionT: { az: 'Pambıq', en: 'Cotton', ru: 'Хлопок', tr: 'Pamuk' },
  },
  {
    key: 'storm-set', shape: 'set', category: 'dest', price: 105, sizes: TOP, badge: 'DƏST',
    fit: 'Hudi + şalvar, qalın (3iplik)', composition: HOOD_COMP.az, colours: [BLACK], front: 'bolt-chest', back: 'storm-back',
    extraPrints: [['mentality-leg', 'Şalvar — ayaq çapı', 'leg']],
    name: { az: 'Storm Dəst — Hudi + Şalvar', en: 'Storm Set — Hoodie + Joggers', ru: 'Комплект Storm — худи + брюки', tr: 'Storm Takım — Kapüşonlu + Eşofman Altı' },
    description: {
      az: 'Born in the Storm hudi və Mentality şalvar bir dəstdə — ayrı-ayrı almaqdan 9 ₼ ucuz.\nQalın 3 iplik parça. Hudi və şalvar üçün fərqli ölçü istəsəniz, sifariş qeydində yazın.',
      en: 'The Born in the Storm hoodie and Mentality joggers as one set — 9 ₼ less than buying them separately.\nHeavy 3-thread fleece. Need different sizes for top and bottom? Add a note to your order.',
      ru: 'Худи Born in the Storm и брюки Mentality в одном комплекте — на 9 ₼ дешевле, чем по отдельности.\nПлотный футер 3-нитка. Нужны разные размеры верха и низа? Укажите в комментарии к заказу.',
      tr: 'Born in the Storm kapüşonlu ve Mentality eşofman altı tek takımda — ayrı almaktan 9 ₼ daha ucuz.\nKalın 3 iplik. Üst ve alt için farklı beden mi istiyorsunuz? Sipariş notuna yazın.',
    },
    fitT: { en: 'Hoodie + joggers, 3-thread fleece', ru: 'Худи + брюки, футер 3-нитка', tr: 'Kapüşonlu + eşofman altı, 3 iplik' }, compositionT: HOOD_COMP,
  },
  {
    key: 'strike-set', shape: 'set', category: 'dest', price: 58, sizes: TOP, badge: 'DƏST',
    fit: 'Oversize köynək + kepka', composition: TEE_COMP.az, colours: [WHITE], front: 'bolt-chest', back: 'strike-back',
    extraPrints: [['bolt-cap', 'Kepka dizaynı', 'cap']],
    name: { az: 'Strike Dəst — Köynək + Kepka', en: 'Strike Set — Tee + Cap', ru: 'Комплект Strike — футболка + кепка', tr: 'Strike Takım — Tişört + Şapka' },
    description: {
      az: 'Ağ Strike köynək və Bolt kepka bir dəstdə — ayrı-ayrı almaqdan 6 ₼ ucuz.\nKöynək: arxada ildırım fotosu və HORWALLE. Kepka: ağ ön panel, qara tor arxa.\nÖlçü köynək üçündür.',
      en: 'The white Strike tee and the Bolt cap as one set — 6 ₼ less than buying them separately.\nTee: lightning photo and HORWALLE on the back. Cap: white front panel, black mesh back.\nThe size is for the tee.',
      ru: 'Белая футболка Strike и кепка Bolt в одном комплекте — на 6 ₼ дешевле, чем по отдельности.\nФутболка: фото молнии и HORWALLE на спине. Кепка: белая передняя панель, чёрная сетка сзади.\nРазмер — для футболки.',
      tr: 'Beyaz Strike tişört ve Bolt şapka tek takımda — ayrı almaktan 6 ₼ daha ucuz.\nTişört: sırtta şimşek fotoğrafı ve HORWALLE. Şapka: beyaz ön panel, siyah file arka.\nBeden tişört içindir.',
    },
    fitT: { en: 'Oversize tee + cap', ru: 'Футболка оверсайз + кепка', tr: 'Oversize tişört + şapka' }, compositionT: TEE_COMP,
  },
];
