// Custom print (studio) catalogue. Shared by the studio page and the order
// API, so the server prices custom items itself instead of trusting the browser.

export interface GarmentOption {
  id: string;
  name: string;
  category: "tshirt" | "oversize" | "polo" | "polo-long" | "sweatshirt" | "hoodie" | "yarimzamok" | "balonka" | "salvar" | "kepka";
  basePrice: number;
  description: string;
}

export const GARMENTS: GarmentOption[] = [
  {
    id: "tshirt-regular-suprem",
    name: "T-shirt Regular (Süprəm)",
    category: "tshirt",
    basePrice: 14,
    description: "Klassik rahat kəsim, 100% daranmış incə süprəm pambıq toxuma.",
  },
  {
    id: "tshirt-regular-2iplik",
    name: "T-shirt Regular (2iplik / TS Parça)",
    category: "tshirt",
    basePrice: 16,
    description: "Formasını möhkəm saxlayan, sıx toxunuşlu premium 2-iplik TS parça.",
  },
  {
    id: "tshirt-oversize-suprem-2iplik",
    name: "Oversize T-shirt (Süprəm / 2iplik)",
    category: "oversize",
    basePrice: 18,
    description: "Düşük çiyinli boxy kəsim, ağır və dayanıqlı pambıq toxunuşu.",
  },
  {
    id: "polo-qisaqol",
    name: "Polo - qısaqol",
    category: "polo",
    basePrice: 19,
    description: "Klassik qatlanan polo yaxalıq, düyməli ön kəsim və zərif manjetlər.",
  },
  {
    id: "polo-uzunqol",
    name: "Polo - uzunqol",
    category: "polo-long",
    basePrice: 22,
    description: "Mövsümi uzunqol zərif polo kəsimi, elastik bilək manjetləri.",
  },
  {
    id: "sviter-nazik-2iplik",
    name: "Sviter - nazik (2iplik)",
    category: "sweatshirt",
    basePrice: 24,
    description: "Yüngül və nəfəs alan 2-iplik pambıq toxunuşlu yumru yaxa sviter.",
  },
  {
    id: "sviter-qalin-3iplik",
    name: "Sviter - qalın (3iplik)",
    category: "sweatshirt",
    basePrice: 28,
    description: "Qalın 3-iplik isti şardonlu astar, payız-qış üçün ideal sweatshirt.",
  },
  {
    id: "hody-nazik-2iplik",
    name: "Hody nazik (2iplik)",
    category: "hoodie",
    basePrice: 26,
    description: "Mövsümlük yüngül 2-iplik kapüşonlu hudi, kordonlu başlıq və kenquru cib.",
  },
  {
    id: "hody-qalin-3iplik",
    name: "Hody qalın (3iplik)",
    category: "hoodie",
    basePrice: 32,
    description: "Ağır 380 GSM 3-iplik isti şardonlu fleece, geniş kapüşon və möhkəm cib.",
  },
  {
    id: "yarimzamok-nazik-2iplik",
    name: "Yarımzamok nazik (2iplik)",
    category: "yarimzamok",
    basePrice: 28,
    description: "Yarım boyun fermuarlı (half-zip) zərif 2-iplik idman və şəhər stili.",
  },
  {
    id: "yarimzamok-qalin-3iplik",
    name: "Yarımzamok qalın (3iplik)",
    category: "yarimzamok",
    basePrice: 34,
    description: "Qalın 3-iplik şardonlu yarımzamok, möhkəm metal fermuar və dik yaxa.",
  },
  {
    id: "balonka",
    name: "Balonka",
    category: "balonka",
    basePrice: 38,
    description: "Külək və nəmdən qoruyan xüsusi izolyasiyalı, suya davamlı premium parça.",
  },
  {
    id: "salvar-nazik-2iplik",
    name: "Şalvar nazik (2iplik)",
    category: "salvar",
    basePrice: 24,
    description: "Rahat elastik belli, kordonlu və cibli yüngül 2-iplik pambıq şalvar.",
  },
  {
    id: "salvar-qalin-3iplik",
    name: "Şalvar qalın (3iplik / TS Parça)",
    category: "salvar",
    basePrice: 28,
    description: "Qalın 3-iplik TS toxuma, isti astar və möhkəmləndirilmiş tikişli şalvar.",
  },
  {
    id: "kepka-nazik",
    name: "Kepka - nazik",
    category: "kepka",
    basePrice: 10,
    description: "Yüngül yay kepkası, nəfəs alan panellər və tənzimlənən kəmər.",
  },
  {
    id: "kepka-qalin",
    name: "Kepka - qalın",
    category: "kepka",
    basePrice: 14,
    description: "Qalın sərt panelli snapback / beysbol kepkası, premium toxuma.",
  },
];

export interface PlacementOption {
  id: string;
  label: string;
  sublabel: string;
  side: "front" | "back" | "left" | "right";
  extraPrice: number;
}

export const PLACEMENTS: PlacementOption[] = [
  {
    id: "front-center",
    label: "Ön — Sinə (Mərkəz Böyük)",
    sublabel: "A4 / A3 standart əsas dizayn",
    side: "front",
    extraPrice: 0,
  },
  {
    id: "front-left",
    label: "Ön — Sol Sinə (Kiçik Loqo)",
    sublabel: "10x10 sm zərif brend loqosu",
    side: "front",
    extraPrice: 0,
  },
  {
    id: "back-center",
    label: "Arxa — Kürək (Böyük)",
    sublabel: "Bütün kürəyi əhatə edən böyük dizayn",
    side: "back",
    extraPrice: 0,
  },
  {
    id: "back-neck",
    label: "Arxa — Boyun Altı",
    sublabel: "Kiçik simvol və ya yazı",
    side: "back",
    extraPrice: 0,
  },
  {
    id: "sleeve-left",
    label: "Sol Qol",
    sublabel: "Sol qol kənarında loqo və ya yazı",
    side: "left",
    extraPrice: 0,
  },
  {
    id: "sleeve-right",
    label: "Sağ Qol",
    sublabel: "Sağ qol kənarında loqo və ya yazı",
    side: "right",
    extraPrice: 0,
  },
  {
    id: "both-sides",
    label: "İkitərəfli (Həm Ön, Həm Arxa)",
    sublabel: "Öndə loqo + Arxada böyük dizayn (+3 ₼)",
    side: "front",
    extraPrice: 3,
  },
];

/**
 * Catalogue price (AZN) of a custom print item, or null when the garment is
 * unknown. An unknown or missing placement counts as the standard placement.
 */
export function customPrintPrice(garmentId: unknown, placementId: unknown): number | null {
  const garment = GARMENTS.find((g) => g.id === garmentId);
  if (!garment) return null;
  const placement = PLACEMENTS.find((p) => p.id === placementId);
  return garment.basePrice + (placement ? placement.extraPrice : 0);
}
