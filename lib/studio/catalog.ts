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
  | "zipHoodie"
  | "jacket"
  | "halfzip"
  | "trackJacket"
  | "pants"
  | "shorts"
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
  | "jacket"
  | "halfzip"
  | "track"
  | "pants"
  | "shorts"
  | "cap";

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

/**
 * The studio's products. `list` holds the default price-list prices; the admin can change
 * them (and hide products) in Admin → Studio qiymətləri, stored as settings.studioPrices.
 */
export const STUDIO_PRODUCTS: StudioProduct[] = [
  { id: "tshirt-regular-suprem", name: "T-shirt Regular (Süprəm)", group: "tshirt", shape: "tee", list: { small: 12, one: 14, two: 15 }, extras: TOP_EXTRAS, colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "tshirt-regular-2iplik", name: "T-shirt Regular (2iplik / TS Parça)", group: "tshirt", shape: "tee", list: { small: 13, one: 15, two: 16 }, extras: TOP_EXTRAS, colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "tshirt-oversize-suprem-2iplik", name: "Oversize T-shirt (Süprəm / 2iplik)", group: "tshirt", shape: "oversize", list: { small: 15, one: 17, two: 18 }, extras: TOP_EXTRAS, colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "polo-qisaqol", name: "Polo - qısaqol", group: "polo", shape: "polo", list: { small: 15, one: 16, two: 17 }, extras: TOP_EXTRAS, colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "polo-uzunqol", name: "Polo - uzunqol", group: "polo", shape: "poloLong", list: { small: 19, one: 20, two: 21 }, extras: TOP_EXTRAS, colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "sviter-nazik-2iplik", name: "Sviter - nazik (2iplik)", group: "sweatshirt", shape: "sweatshirt", list: { small: 18, one: 20, two: 21 }, extras: TOP_EXTRAS, colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "sviter-qalin-3iplik", name: "Sviter - qalın (3iplik)", group: "sweatshirt", shape: "sweatshirt", list: { small: 21, one: 23, two: 24 }, extras: TOP_EXTRAS, colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "hody-nazik-2iplik", name: "Hody nazik (2iplik)", group: "hoodie", shape: "hoodie", list: { small: 22, one: 24, two: 25 }, extras: TOP_EXTRAS, colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "hody-qalin-3iplik", name: "Hody qalın (3iplik)", group: "hoodie", shape: "hoodie", list: { small: 23, one: 25, two: 26 }, extras: TOP_EXTRAS, colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "hody-zamoklu-3iplik", name: "Hody Zamoklu (3iplik)", group: "hoodie", shape: "zipHoodie", list: { small: 24, one: 26, two: 27 }, extras: TOP_EXTRAS, colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "godekce-2iplik", name: "Gödəkcə (2iplik)", group: "jacket", shape: "jacket", list: { small: 23, one: 25, two: 26 }, extras: TOP_EXTRAS, colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "godekce-3iplik", name: "Gödəkcə (3iplik / TS Parça)", group: "jacket", shape: "jacket", list: { small: 24, one: 26, two: 27 }, extras: TOP_EXTRAS, colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "yarimzamok-nazik-2iplik", name: "Yarımzamok nazik (2iplik)", group: "halfzip", shape: "halfzip", list: { small: 23, one: 25, two: 26 }, extras: TOP_EXTRAS, colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "yarimzamok-qalin-3iplik", name: "Yarımzamok qalın (3iplik)", group: "halfzip", shape: "halfzip", list: { small: 24, one: 26, two: 27 }, extras: TOP_EXTRAS, colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "balonka", name: "Balonka", group: "track", shape: "trackJacket", list: { small: 24, one: 25, two: 26 }, extras: TOP_EXTRAS, colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "salvar-nazik-2iplik", name: "Şalvar nazik (2iplik)", group: "pants", shape: "pants", list: { small: 21, one: 22, two: 23 }, extras: ["leg"], colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "salvar-qalin-3iplik", name: "Şalvar qalın (3iplik / TS Parça)", group: "pants", shape: "pants", list: { small: 22, one: 23, two: 24 }, extras: ["leg"], colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "sortik", name: "Şortik", group: "shorts", shape: "shorts", list: { small: 18, one: 19, two: 20 }, extras: ["leg"], colors: APPAREL_COLORS, sizes: TOP_SIZES, hasBack: true },
  { id: "kepka-nazik", name: "Kepka - nazik", group: "cap", shape: "cap", list: { small: 6, one: 6.5 }, extras: ["side"], colors: APPAREL_COLORS, sizes: ["Standart"], hasBack: true },
  { id: "kepka-qalin", name: "Kepka - qalın", group: "cap", shape: "cap", list: { small: 7, one: 7.5 }, extras: ["side"], colors: APPAREL_COLORS, sizes: ["Standart"], hasBack: true },
];

/** Products whose default prices were not on the price list (the admin should confirm them). */
export const UNPRICED_DEFAULTS = ["hody-zamoklu-3iplik", "godekce-2iplik", "godekce-3iplik", "sortik"];

// ── admin price overrides ────────────────────────────────────────────────────
export interface StudioPriceSettings {
  markup?: number;
  extra?: number;
  items?: Record<string, { small?: number | null; one?: number | null; two?: number | null; active?: boolean }>;
}

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n < 10000 ? Math.round(n * 100) / 100 : null;
};

/** The catalogue with the admin's prices applied; hidden products are left out. */
export function resolveStudio(settings?: StudioPriceSettings | null) {
  const markup = num(settings?.markup) ?? STUDIO_MARKUP;
  const extra = num(settings?.extra) ?? EXTRA_SPOT_PRICE;
  const products: StudioProduct[] = [];
  for (const p of STUDIO_PRODUCTS) {
    const o = settings?.items?.[p.id];
    if (!o) {
      products.push(p);
      continue;
    }
    if (o.active === false) continue;
    const list: Partial<Record<PrintType, number>> = {};
    for (const t of ["small", "one", "two"] as PrintType[]) {
      if (o[t] === null) continue; // explicitly not offered
      const v = o[t] === undefined ? p.list[t] : num(o[t]);
      if (typeof v === "number") list[t] = v;
    }
    if (Object.keys(list).length) products.push({ ...p, list });
  }
  return { markup, extra, products };
}


export function studioProduct(id: unknown, settings?: StudioPriceSettings | null): StudioProduct | undefined {
  return resolveStudio(settings).products.find((p) => p.id === id);
}

/** Print types offered for a product, cheapest first. */
export function printTypes(p: StudioProduct): PrintType[] {
  return (["small", "one", "two"] as PrintType[]).filter((t) => typeof p.list[t] === "number");
}

/** Selling price (AZN) for a configuration, or null when it is not offered. */
export function studioPrice(
  p: StudioProduct,
  type: PrintType,
  extras: ExtraSpot[] = [],
  rates: { markup: number; extra: number } = { markup: STUDIO_MARKUP, extra: EXTRA_SPOT_PRICE }
): number | null {
  const base = p.list[type];
  if (typeof base !== "number") return null;
  const valid = extras.filter((e, i) => p.extras.includes(e) && extras.indexOf(e) === i);
  return Math.round((base + rates.markup + valid.length * rates.extra) * 100) / 100;
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
export function customPrintPrice(productId: unknown, custom: unknown, settings?: StudioPriceSettings | null): number | null {
  const studio = resolveStudio(settings);
  const p = studio.products.find((x) => x.id === productId);
  if (!p) return null;
  const data = custom && typeof custom === "object" ? (custom as Record<string, any>) : { placementKey: custom };
  let type = data.printType as PrintType | undefined;
  let extras: ExtraSpot[] = Array.isArray(data.extras) ? data.extras : [];
  if (!type) {
    const legacy = LEGACY_PLACEMENT[String(data.placementKey || "")];
    type = legacy?.type || printTypes(p).find((t) => t === "one") || printTypes(p)[0];
    extras = legacy ? legacy.extras : [];
  }
  return studioPrice(p, type, extras, studio);
}
