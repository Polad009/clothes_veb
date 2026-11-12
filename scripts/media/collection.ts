// Horwalle "Bakı Seriyası 01" — product definitions shared by the mockup and upload scripts.
// Designs: scripts/media/designs.py (original artwork). Prices in AZN (Azerbaijan price;
// buyers abroad pay the foreign markup from Admin → Tənzimləmələr).

export type Ink = 'bone' | 'ink';
export type Shape = 'oversize' | 'hoodie' | 'pants' | 'cap' | 'set';

export interface Colour {
  name: string;   // Azerbaijani colour name the site already translates (Qara, Ağ, Boz)
  hex: string;
  ink: Ink;       // print colour on this garment
}

export interface Product {
  key: string;
  shape: Shape;
  category: 'koynek' | 'hudi' | 'salvar' | 'aksesuar' | 'dest';
  price: number;
  sizes: string[];
  fit: string;
  composition: string;
  colours: Colour[];
  front?: string;     // design used on the front (chest / leg / cap)
  frontKind?: 'chest' | 'big' | 'leg' | 'cap'; // print size of the front design (default: from its name)
  back?: string;      // design used on the back
  extraPrints?: Array<[design: string, label: string, kind: string]>; // sets: the other pieces' designs
  badge?: string;
  name: { az: string; en: string; ru: string; tr: string };
  description: { az: string; en: string; ru: string; tr: string };
  fitT: { en: string; ru: string; tr: string };
  compositionT: { az?: string; en: string; ru: string; tr: string };
}

const TOP = ['S', 'M', 'L', 'XL', 'XXL'];
const BLACK: Colour = { name: 'Qara', hex: '#141414', ink: 'bone' };
const WHITE: Colour = { name: 'Ağ', hex: '#EFECE6', ink: 'ink' };
const GREY: Colour = { name: 'Boz', hex: '#9C9B98', ink: 'ink' };

const TEE_COMP = { az: 'Pambıq, süprəm toxuma (qalın)', en: 'Cotton, heavy single jersey', ru: 'Хлопок, плотная кулирка', tr: 'Pamuk, kalın süprem' };
const HOOD_COMP = { az: 'Pambıq qarışığı, 3 iplik, içi yumşaq tüklü', en: 'Cotton blend, 3-thread fleece, brushed inside', ru: 'Смесовый хлопок, футер 3-нитка, с начёсом', tr: 'Pamuk karışımı, 3 iplik, içi şardonlu' };
const PRINT_AZ = 'Arxada böyük çap, öndə sinədə kiçik nişan.';

export const COLLECTION: Product[] = [
  {
    key: 'schwa-tee', shape: 'oversize', category: 'koynek', price: 35, sizes: TOP, badge: 'YENİ SEZON · 2026',
    fit: 'Oversize', composition: TEE_COMP.az, colours: [BLACK, WHITE], front: 'schwa-chest', back: 'schwa-back',
    name: { az: 'Ə Oversize Köynək', en: 'Ə Oversize Tee', ru: 'Футболка оверсайз «Ə»', tr: 'Ə Oversize Tişört' },
    description: {
      az: `Azərbaycan əlifbasının ən tanınan hərfi — Ə. ${PRINT_AZ}\n\nArxada: böyük "Ə", altında Bakının koordinatları (40.4093° N, 49.8671° E).\nKəsim: geniş, düşük çiyinli oversize.`,
      en: 'The most recognisable letter of the Azerbaijani alphabet — Ə. Large back print, small chest mark.\n\nBack: a giant "Ə" with the coordinates of Baku (40.4093° N, 49.8671° E).\nFit: relaxed oversize with dropped shoulders.',
      ru: 'Самая узнаваемая буква азербайджанского алфавита — Ə. Большой принт на спине, маленький знак на груди.\n\nСпина: огромная «Ə» и координаты Баку (40.4093° N, 49.8671° E).\nКрой: свободный оверсайз со спущенным плечом.',
      tr: 'Azerbaycan alfabesinin en tanınan harfi — Ə. Sırtta büyük baskı, göğüste küçük işaret.\n\nSırt: dev "Ə" ve Bakü\'nün koordinatları (40.4093° N, 49.8671° E).\nKalıp: düşük omuzlu rahat oversize.',
    },
    fitT: { en: 'Oversize', ru: 'Оверсайз', tr: 'Oversize' }, compositionT: TEE_COMP,
  },
  {
    key: 'winds-tee', shape: 'oversize', category: 'koynek', price: 35, sizes: TOP,
    fit: 'Oversize', composition: TEE_COMP.az, colours: [WHITE, BLACK], front: 'winds-chest', back: 'winds-back',
    name: { az: 'Küləklər Şəhəri Köynək', en: 'City of Winds Tee', ru: 'Футболка «Город ветров»', tr: 'Rüzgârlar Şehri Tişört' },
    description: {
      az: `Bakıya "Küləklər şəhəri" deyilməsinə həsr olunub. ${PRINT_AZ}\n\nArxada: "KÜLƏKLƏR ŞƏHƏRİ" yazısı və külək xətləri.\nKəsim: geniş oversize.`,
      en: 'A tribute to Baku, the City of Winds. Large back print, small chest mark.\n\nBack: "KÜLƏKLƏR ŞƏHƏRİ" (City of Winds) with flowing wind lines.\nFit: relaxed oversize.',
      ru: 'Посвящение Баку — Городу ветров. Большой принт на спине, маленький знак на груди.\n\nСпина: надпись «KÜLƏKLƏR ŞƏHƏRİ» (Город ветров) и линии ветра.\nКрой: свободный оверсайз.',
      tr: 'Rüzgârlar Şehri Bakü\'ye bir selam. Sırtta büyük baskı, göğüste küçük işaret.\n\nSırt: "KÜLƏKLƏR ŞƏHƏRİ" (Rüzgârlar Şehri) yazısı ve rüzgâr çizgileri.\nKalıp: rahat oversize.',
    },
    fitT: { en: 'Oversize', ru: 'Оверсайз', tr: 'Oversize' }, compositionT: TEE_COMP,
  },
  {
    key: 'carpet-tee', shape: 'oversize', category: 'koynek', price: 35, sizes: TOP,
    fit: 'Oversize', composition: TEE_COMP.az, colours: [BLACK, WHITE], front: 'carpet-chest', back: 'carpet-back',
    name: { az: 'Xalça Code Köynək', en: 'Carpet Code Tee', ru: 'Футболка «Ковровый код»', tr: 'Halı Kodu Tişört' },
    description: {
      az: `Azərbaycan xalçalarının həndəsəsindən ilhamlanan, "ilmə-ilmə" çəkilmiş orijinal medalyon. ${PRINT_AZ}\n\nArxada: səkkizguşəli ulduzlu medalyon və "XALÇA" yazısı.\nKəsim: geniş oversize.`,
      en: 'An original medallion drawn knot by knot, inspired by the geometry of Azerbaijani carpets. Large back print, small chest mark.\n\nBack: an eight-point star medallion and "XALÇA" (carpet).\nFit: relaxed oversize.',
      ru: 'Оригинальный медальон, «вытканный» узелок за узелком по мотивам геометрии азербайджанских ковров. Большой принт на спине, маленький знак на груди.\n\nСпина: медальон с восьмиконечной звездой и надпись «XALÇA» (ковёр).\nКрой: свободный оверсайз.',
      tr: 'Azerbaycan halılarının geometrisinden esinlenen, düğüm düğüm çizilmiş özgün madalyon. Sırtta büyük baskı, göğüste küçük işaret.\n\nSırt: sekiz köşeli yıldızlı madalyon ve "XALÇA" (halı) yazısı.\nKalıp: rahat oversize.',
    },
    fitT: { en: 'Oversize', ru: 'Оверсайз', tr: 'Oversize' }, compositionT: TEE_COMP,
  },
  {
    key: 'buta-hoodie', shape: 'hoodie', category: 'hudi', price: 59, sizes: TOP, badge: 'YENİ SEZON · 2026',
    fit: 'Hody qalın (3iplik)', composition: HOOD_COMP.az, colours: [BLACK], front: 'buta-chest', back: 'buta-back',
    name: { az: 'Buta Hudi', en: 'Buta Hoodie', ru: 'Худи «Бута»', tr: 'Buta Kapüşonlu' },
    description: {
      az: `Odlar Yurdunun simvolu olan buta naxışı — xətlərlə, sadə və güclü. ${PRINT_AZ}\n\nArxada: böyük buta və "ODLAR YURDU" yazısı.\nQalın 3 iplik parça, içi yumşaq tüklü.`,
      en: 'The buta, symbol of the Land of Fire — drawn in clean lines. Large back print, small chest mark.\n\nBack: a large buta with "ODLAR YURDU" (Land of Fire).\nHeavy 3-thread fleece, brushed inside.',
      ru: 'Бута — символ Страны огней — в чистых линиях. Большой принт на спине, маленький знак на груди.\n\nСпина: большая бута и надпись «ODLAR YURDU» (Страна огней).\nПлотный футер 3-нитка с начёсом.',
      tr: 'Ateşler Diyarı\'nın sembolü buta — sade çizgilerle. Sırtta büyük baskı, göğüste küçük işaret.\n\nSırt: büyük buta ve "ODLAR YURDU" (Ateşler Diyarı) yazısı.\nKalın 3 iplik, içi şardonlu.',
    },
    fitT: { en: 'Heavy hoodie, 3-thread fleece', ru: 'Плотное худи, футер 3-нитка', tr: 'Kalın kapüşonlu, 3 iplik' }, compositionT: HOOD_COMP,
  },
  {
    key: 'caspian-hoodie', shape: 'hoodie', category: 'hudi', price: 59, sizes: TOP,
    fit: 'Hody qalın (3iplik)', composition: HOOD_COMP.az, colours: [GREY, BLACK], front: 'caspian-chest', back: 'caspian-back',
    name: { az: 'Xəzər Hudi', en: 'Caspian Hoodie', ru: 'Худи «Каспий»', tr: 'Hazar Kapüşonlu' },
    description: {
      az: `Xəzər dənizi: hərflərin içində dalğalar. ${PRINT_AZ}\n\nArxada: dalğa xətləri ilə "XƏZƏR" yazısı və "−28 M" — dənizin səviyyəsi.\nQalın 3 iplik parça, içi yumşaq tüklü.`,
      en: 'The Caspian Sea, with waves running through the letters. Large back print, small chest mark.\n\nBack: "XƏZƏR" (Caspian) filled with wave lines and "−28 M" — the sea\'s level below the ocean.\nHeavy 3-thread fleece, brushed inside.',
      ru: 'Каспийское море — волны внутри букв. Большой принт на спине, маленький знак на груди.\n\nСпина: надпись «XƏZƏR» (Каспий), заполненная волнами, и «−28 M» — уровень моря ниже океана.\nПлотный футер 3-нитка с начёсом.',
      tr: 'Hazar Denizi — harflerin içinde dalgalar. Sırtta büyük baskı, göğüste küçük işaret.\n\nSırt: dalga çizgileriyle "XƏZƏR" (Hazar) yazısı ve "−28 M" — denizin okyanus seviyesinin altındaki yüksekliği.\nKalın 3 iplik, içi şardonlu.',
    },
    fitT: { en: 'Heavy hoodie, 3-thread fleece', ru: 'Плотное худи, футер 3-нитка', tr: 'Kalın kapüşonlu, 3 iplik' }, compositionT: HOOD_COMP,
  },
  {
    key: 'essential-hoodie', shape: 'hoodie', category: 'hudi', price: 55, sizes: TOP,
    fit: 'Hody qalın (3iplik)', composition: HOOD_COMP.az, colours: [BLACK, WHITE], front: 'essential-chest', back: 'essential-back',
    name: { az: 'Horwalle Essential Hudi', en: 'Horwalle Essential Hoodie', ru: 'Худи Horwalle Essential', tr: 'Horwalle Essential Kapüşonlu' },
    description: {
      az: 'Hər gün üçün əsas hudi. Öndə sinədə HORWALLE, arxada böyük "HOR / WAL / LE".\n\nQalın 3 iplik parça, içi yumşaq tüklü.',
      en: 'The everyday essential. HORWALLE on the chest, a large "HOR / WAL / LE" on the back.\n\nHeavy 3-thread fleece, brushed inside.',
      ru: 'Базовое худи на каждый день. HORWALLE на груди, крупное «HOR / WAL / LE» на спине.\n\nПлотный футер 3-нитка с начёсом.',
      tr: 'Her gün için temel kapüşonlu. Göğüste HORWALLE, sırtta büyük "HOR / WAL / LE".\n\nKalın 3 iplik, içi şardonlu.',
    },
    fitT: { en: 'Heavy hoodie, 3-thread fleece', ru: 'Плотное худи, футер 3-нитка', tr: 'Kalın kapüşonlu, 3 iplik' }, compositionT: HOOD_COMP,
  },
  {
    key: 'logo-joggers', shape: 'pants', category: 'salvar', price: 45, sizes: TOP,
    fit: 'Şalvar qalın (3iplik)', composition: HOOD_COMP.az, colours: [BLACK], front: 'leg',
    name: { az: 'Horwalle Şalvar', en: 'Horwalle Joggers', ru: 'Брюки Horwalle', tr: 'Horwalle Eşofman Altı' },
    description: {
      az: 'Sol ayaq boyunca şaquli HORWALLE yazısı. Rahat kəsim, rezinli bel.\n\nQalın 3 iplik parça, içi yumşaq tüklü.',
      en: 'A vertical HORWALLE print along the left leg. Relaxed fit, elastic waist.\n\nHeavy 3-thread fleece, brushed inside.',
      ru: 'Вертикальная надпись HORWALLE вдоль левой штанины. Свободный крой, резинка на поясе.\n\nПлотный футер 3-нитка с начёсом.',
      tr: 'Sol paça boyunca dikey HORWALLE baskısı. Rahat kalıp, lastikli bel.\n\nKalın 3 iplik, içi şardonlu.',
    },
    fitT: { en: 'Joggers, 3-thread fleece', ru: 'Брюки, футер 3-нитка', tr: 'Eşofman altı, 3 iplik' }, compositionT: HOOD_COMP,
  },
  {
    key: 'schwa-cap', shape: 'cap', category: 'aksesuar', price: 22, sizes: ['Standart'],
    fit: 'Kepka - qalın', composition: 'Pambıq', colours: [BLACK, WHITE], front: 'cap',
    name: { az: 'Ə Kepka', en: 'Ə Cap', ru: 'Кепка «Ə»', tr: 'Ə Şapka' },
    description: {
      az: 'Öndə "Ə" hərfi olan klassik kepka. Arxadan tənzimlənir.\n\nRənglər: tam qara və ya ağ ön panel + qara tor arxa.',
      en: 'A classic cap with the letter "Ə" on the front. Adjustable back.\n\nColours: all black, or white front panel with black mesh back.',
      ru: 'Классическая кепка с буквой «Ə» спереди. Регулируется сзади.\n\nЦвета: полностью чёрная или белая передняя панель с чёрной сеткой сзади.',
      tr: 'Önünde "Ə" harfi olan klasik şapka. Arkadan ayarlanabilir.\n\nRenkler: tamamen siyah veya beyaz ön panel + siyah file arka.',
    },
    fitT: { en: 'Cap', ru: 'Кепка', tr: 'Şapka' }, compositionT: { az: 'Pambıq', en: 'Cotton', ru: 'Хлопок', tr: 'Pamuk' },
  },
  {
    key: 'essential-set', shape: 'set', category: 'dest', price: 89, sizes: TOP, badge: 'DƏST',
    fit: 'Hudi + şalvar, qalın (3iplik)', composition: HOOD_COMP.az, colours: [BLACK], front: 'essential-chest', back: 'essential-back',
    extraPrints: [['leg', 'Şalvar — ayaq çapı', 'leg']],
    name: { az: 'Essential Dəst — Hudi + Şalvar', en: 'Essential Set — Hoodie + Joggers', ru: 'Комплект Essential — худи + брюки', tr: 'Essential Takım — Kapüşonlu + Eşofman Altı' },
    description: {
      az: 'Qara Essential hudi və Horwalle şalvar bir dəstdə — ayrı-ayrı almaqdan 11 ₼ ucuz.\n\nHudi: öndə sinədə HORWALLE, arxada böyük "HOR / WAL / LE".\nŞalvar: sol ayaq boyunca şaquli HORWALLE yazısı, rezinli bel.\nQalın 3 iplik parça, içi yumşaq tüklü. Ölçünü sifarişdə qeyd edin; hudi və şalvar üçün fərqli ölçü istəsəniz, qeyddə yazın.',
      en: 'The black Essential hoodie and Horwalle joggers as one set — 11 ₼ less than buying them separately.\n\nHoodie: HORWALLE on the chest, a large "HOR / WAL / LE" on the back.\nJoggers: vertical HORWALLE print along the left leg, elastic waist.\nHeavy 3-thread fleece, brushed inside. Need different sizes for top and bottom? Add a note to your order.',
      ru: 'Чёрное худи Essential и брюки Horwalle в одном комплекте — на 11 ₼ дешевле, чем по отдельности.\n\nХуди: HORWALLE на груди, крупное «HOR / WAL / LE» на спине.\nБрюки: вертикальная надпись HORWALLE вдоль левой штанины, резинка на поясе.\nПлотный футер 3-нитка с начёсом. Нужны разные размеры верха и низа? Укажите в комментарии к заказу.',
      tr: 'Siyah Essential kapüşonlu ve Horwalle eşofman altı tek takımda — ayrı almaktan 11 ₼ daha ucuz.\n\nKapüşonlu: göğüste HORWALLE, sırtta büyük "HOR / WAL / LE".\nEşofman altı: sol paça boyunca dikey HORWALLE baskısı, lastikli bel.\nKalın 3 iplik, içi şardonlu. Üst ve alt için farklı beden mi istiyorsunuz? Sipariş notuna yazın.',
    },
    fitT: { en: 'Hoodie + joggers, 3-thread fleece', ru: 'Худи + брюки, футер 3-нитка', tr: 'Kapüşonlu + eşofman altı, 3 iplik' }, compositionT: HOOD_COMP,
  },
  {
    key: 'baku-set', shape: 'set', category: 'dest', price: 52, sizes: TOP, badge: 'DƏST',
    fit: 'Oversize köynək + kepka', composition: TEE_COMP.az, colours: [WHITE], front: 'schwa-chest', back: 'schwa-back',
    extraPrints: [['cap', 'Kepka dizaynı', 'cap']],
    name: { az: 'Bakı Dəsti — Köynək + Kepka', en: 'Baku Set — Tee + Cap', ru: 'Комплект «Баку» — футболка + кепка', tr: 'Bakü Takımı — Tişört + Şapka' },
    description: {
      az: 'Ağ "Ə" oversize köynək və "Ə" kepka bir dəstdə — ayrı-ayrı almaqdan 5 ₼ ucuz.\n\nKöynək: arxada böyük "Ə" və Bakının koordinatları, öndə sinədə kiçik "Ə".\nKepka: ağ ön panel, qara tor arxa, arxadan tənzimlənir. Ölçü köynək üçündür.',
      en: 'The white "Ə" oversize tee and the "Ə" cap as one set — 5 ₼ less than buying them separately.\n\nTee: a giant "Ə" with the coordinates of Baku on the back, a small "Ə" on the chest.\nCap: white front panel, black mesh back, adjustable. The size is for the tee.',
      ru: 'Белая футболка оверсайз «Ə» и кепка «Ə» в одном комплекте — на 5 ₼ дешевле, чем по отдельности.\n\nФутболка: огромная «Ə» и координаты Баку на спине, маленькая «Ə» на груди.\nКепка: белая передняя панель, чёрная сетка сзади, регулируется. Размер — для футболки.',
      tr: 'Beyaz "Ə" oversize tişört ve "Ə" şapka tek takımda — ayrı almaktan 5 ₼ daha ucuz.\n\nTişört: sırtta dev "Ə" ve Bakü\'nün koordinatları, göğüste küçük "Ə".\nŞapka: beyaz ön panel, siyah file arka, ayarlanabilir. Beden tişört içindir.',
    },
    fitT: { en: 'Oversize tee + cap', ru: 'Футболка оверсайз + кепка', tr: 'Oversize tişört + şapka' }, compositionT: TEE_COMP,
  },
];
