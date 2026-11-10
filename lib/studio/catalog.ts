// "Öz dizaynını yarat" catalogue. Shared by the studio page and the order APIs,
// which recompute every custom item's price on the server from this file.
//
// Prices come from the DTF print price list (column "Kiçik çap / Tək tərəf / İki tərəf");
// the studio sells at that price plus STUDIO_MARKUP. Extra spots (sleeve, neck, …) cost
// EXTRA_SPOT_PRICE each, as in the list's "Qol / boyun" column.

export const STUDIO_MARKUP = 10;
export const EXTRA_SPOT_PRICE = 1;

export type PrintType = "small" | "one" | "two";
export type StudioSide = "front" | "back";
export type ExtraSpot = "sleeveLeft" | "sleeveRight" | "neck" | "side" | "leg" | "pocket";

/** Drawing used for the mockup (see lib/studio/mockups.ts). */
export type Shape =
  | "tee"
  | "oversize"
  | "polo"
  | "poloLong"
  | "sweatshirt"
  | "hoodie"
  | "halfzip"
  | "trackJacket"
  | "pants"
  | "cap"
  | "apronShort"
  | "apronLong"
  | "tote"
  | "mug"
  | "mugGold"
  | "mugHeart"
  | "mugRound"
  | "mugMagic"
  | "puzzle"
  | "puzzleHeart"
  | "briefs";

export type GroupKey =
  | "tshirt"
  | "polo"
  | "sweatshirt"
  | "hoodie"
  | "halfzip"
  | "track"
  | "pants"
  | "cap"
  | "apron"
  | "bag"
  | "mug"
  | "puzzle"
  | "underwear";

export interface StudioProduct {
  id: string;
  name: string;
  group: GroupKey;
  shape: Shape;
  /** Price-list prices (AZN) per print type, before the markup. Missing = not offered. */
  list: Partial<Record<PrintType, number>>;
  extras: ExtraSpot[];
  colors: string[];
  sizes: string[];
  /** Whether a back view exists (bags, mugs and briefs have one; puzzles do not). */
  hasBack: boolean;
}

export const STUDIO_COLORS: Record<string, string> = {
  white: "#F4F3EF",
  black: "#1B1B1D",
  sand: "#D9CFC3",
  beige: "#E6D9C2",
  skyblue: "#9CC4E8",
  navy: "#243049",
  olive: "#4B5A3E",
  red: "#A8322E",
  grey: "#9A9C9F",
  gold: "#C9A04E",
};

const APPAREL_COLORS = ["white", "black", "grey", "sand", "skyblue", "navy", "olive", "red"];
const TOP_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
const TOP_EXTRAS: ExtraSpot[] = ["sleeveLeft", "sleeveRight", "neck"];

export const STUDIO_PRODUCTS: StudioProduct[] = [
  { id: "tshirt-regular-suprem", name: "T-shirt Regular (Süprəm)", group: "tshirt", shape: "tee", list: { small: 12, one: 14, two: 15 }, extras: TOP_EXTRAS, colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "tshirt-regular-2iplik", name: "T-shirt Regular (2iplik / TS Parça)", group: "tshirt", shape: "tee", list: { small: 13, one: 15, two: 16 }, extras: TOP_EXTRAS, colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "tshirt-oversize-suprem-2iplik", name: "Oversize T-shirt (Süprəm / 2iplik)", group: "tshirt", shape: "oversize", list: { small: 15, one: 17, two: 18 }, extras: TOP_EXTRAS, colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "polo-qisaqol", name: "Polo — qısaqol", group: "polo", shape: "polo", list: { small: 15, one: 16, two: 17 }, extras: TOP_EXTRAS, colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "polo-uzunqol", name: "Polo — uzunqol", group: "polo", shape: "poloLong", list: { small: 19, one: 20, two: 21 }, extras: TOP_EXTRAS, colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "sviter-nazik-2iplik", name: "Sviter — nazik (2iplik)", group: "sweatshirt", shape: "sweatshirt", list: { small: 18, one: 20, two: 21 }, extras: TOP_EXTRAS, colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "sviter-qalin-3iplik", name: "Sviter — qalın (3iplik)", group: "sweatshirt", shape: "sweatshirt", list: { small: 21, one: 23, two: 24 }, extras: TOP_EXTRAS, colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "hody-nazik-2iplik", name: "Hudi — nazik (2iplik)", group: "hoodie", shape: "hoodie", list: { small: 22, one: 24, two: 25 }, extras: TOP_EXTRAS, colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "hody-qalin-3iplik", name: "Hudi — qalın (3iplik)", group: "hoodie", shape: "hoodie", list: { small: 23, one: 25, two: 26 }, extras: TOP_EXTRAS, colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "yarimzamok-nazik-2iplik", name: "Yarımzamok — nazik (2iplik)", group: "halfzip", shape: "halfzip", list: { small: 23, one: 25, two: 26 }, extras: TOP_EXTRAS, colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "yarimzamok-qalin-3iplik", name: "Yarımzamok — qalın (3iplik)", group: "halfzip", shape: "halfzip", list: { small: 24, one: 26, two: 27 }, extras: TOP_EXTRAS, colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "balonka", name: "Balonka", group: "track", shape: "trackJacket", list: { small: 24, one: 25, two: 26 }, extras: TOP_EXTRAS, colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "salvar-nazik-2iplik", name: "Şalvar — nazik (2iplik)", group: "pants", shape: "pants", list: { small: 21, one: 22, two: 23 }, extras: ["leg"], colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "salvar-qalin-3iplik", name: "Şalvar — qalın (3iplik / TS Parça)", group: "pants", shape: "pants", list: { small: 22, one: 23, two: 24 }, extras: ["leg"], colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "kepka-nazik", name: "Kepka — nazik", group: "cap", shape: "cap", list: { small: 6, one: 6.5 }, extras: ["side"], colors: APPAREL_COLORS, sizes: ["Standart"], hasBack: true },
  { id: "kepka-qalin", name: "Kepka — qalın", group: "cap", shape: "cap", list: { small: 7, one: 7.5 }, extras: ["side"], colors: APPAREL_COLORS, sizes: ["Standart"], hasBack: true },
  { id: "onluk-qisa", name: "Önlük — qısa", group: "apron", shape: "apronShort", list: { small: 12, one: 12 }, extras: ["pocket"], colors: ["black", "white", "beige", "navy", "red"], sizes: ["Standart"], hasBack: false },
  { id: "onluk-uzun", name: "Önlük — uzun", group: "apron", shape: "apronLong", list: { small: 15, one: 15 }, extras: ["pocket"], colors: ["black", "white", "beige", "navy", "red"], sizes: ["Standart"], hasBack: false },
  { id: "eko-canta", name: "Eko çanta", group: "bag", shape: "tote", list: { small: 7, one: 7, two: 9 }, extras: [], colors: ["beige", "white", "black"], sizes: ["Standart"], hasBack: true },
  { id: "fincan-sade", name: "Fincan — sadə rəngli", group: "mug", shape: "mug", list: { small: 4, one: 4, two: 4 }, extras: [], colors: ["white"], sizes: ["330 ml"], hasBack: true },
  { id: "fincan-qizili", name: "Fincan — qızılı", group: "mug", shape: "mugGold", list: { small: 7, one: 7, two: 7 }, extras: [], colors: ["gold"], sizes: ["330 ml"], hasBack: true },
  { id: "fincan-qulpu-urekli", name: "Fincan — qulpu ürəkli", group: "mug", shape: "mugHeart", list: { small: 6.5, one: 6.5, two: 6.5 }, extras: [], colors: ["white"], sizes: ["330 ml"], hasBack: true },
  { id: "fincan-qulpu-toplu", name: "Fincan — qulpu toplu", group: "mug", shape: "mugRound", list: { small: 6.5, one: 6.5, two: 6.5 }, extras: [], colors: ["white"], sizes: ["330 ml"], hasBack: true },
  { id: "fincan-sehirli", name: "Fincan — sehirli", group: "mug", shape: "mugMagic", list: { small: 7, one: 7, two: 7 }, extras: [], colors: ["black"], sizes: ["330 ml"], hasBack: true },
  { id: "puzzle-a4", name: "Puzzle — A4, karton", group: "puzzle", shape: "puzzle", list: { one: 6.5 }, extras: [], colors: ["white"], sizes: ["A4"], hasBack: false },
  { id: "puzzle-urek", name: "Puzzle — ürək, karton", group: "puzzle", shape: "puzzleHeart", list: { one: 6.5 }, extras: [], colors: ["white"], sizes: ["Ürək"], hasBack: false },
  { id: "alt-paltari", name: "Alt paltarı", group: "underwear", shape: "briefs", list: { two: 12 }, extras: ["side"], colors: ["black", "white", "grey", "navy"], sizes: ["S", "M", "L", "XL", "2XL"], hasBack: true },
];

export function studioProduct(id: unknown): StudioProduct | undefined {
  return STUDIO_PRODUCTS.find((p) => p.id === id);
}

/** Print types offered for a product, cheapest first. */
export function printTypes(p: StudioProduct): PrintType[] {
  return (["small", "one", "two"] as PrintType[]).filter((t) => typeof p.list[t] === "number");
}

/** Selling price (AZN) for a configuration, or null when it is not offered. */
export function studioPrice(p: StudioProduct, type: PrintType, extras: ExtraSpot[] = []): number | null {
  const base = p.list[type];
  if (typeof base !== "number") return null;
  const valid = extras.filter((e, i) => p.extras.includes(e) && extras.indexOf(e) === i);
  return Math.round((base + STUDIO_MARKUP + valid.length * EXTRA_SPOT_PRICE) * 100) / 100;
}

// Placements used by carts made before this price list (kept so old carts still check out).
const LEGACY_PLACEMENT: Record<string, { type: PrintType; extras: ExtraSpot[] }> = {
  "front-center": { type: "one", extras: [] },
  "back-center": { type: "one", extras: [] },
  "front-left": { type: "small", extras: [] },
  "back-neck": { type: "small", extras: [] },
  "sleeve-left": { type: "small", extras: [] },
  "sleeve-right": { type: "small", extras: [] },
  "both-sides": { type: "two", extras: [] },
};

/**
 * Server-side price (AZN) of a custom studio item, or null when the product or
 * configuration is unknown. Accepts the item's customData (or a legacy placement key).
 */
export function customPrintPrice(productId: unknown, custom: unknown): number | null {
  const p = studioProduct(productId);
  if (!p) return null;
  const data = custom && typeof custom === "object" ? (custom as Record<string, any>) : { placementKey: custom };
  let type = data.printType as PrintType | undefined;
  let extras: ExtraSpot[] = Array.isArray(data.extras) ? data.extras : [];
  if (!type) {
    const legacy = LEGACY_PLACEMENT[String(data.placementKey || "")];
    type = legacy?.type || printTypes(p).find((t) => t === "one") || printTypes(p)[0];
    extras = legacy ? legacy.extras : [];
  }
  return studioPrice(p, type, extras);
}
