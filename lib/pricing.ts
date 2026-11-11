// One price rule for the storefront, the cart and the server.
//
// Product prices are set in manat (AZN) for customers in Azerbaijan. Customers in any
// other country pay the "foreign" price:
//   - the product's own "Xarici qiymət ($)" when the admin filled it in, otherwise
//   - the manat price + the foreign markup % (Admin → Tənzimləmələr → Ölkəyə görə qiymət).
// The storefront decides by the visitor's country; the order is charged by the
// delivery country, so the Azerbaijan price only applies to deliveries in Azerbaijan.

export const AZN_PER_USD = 1.7;
export const DEFAULT_FOREIGN_MARKUP = 20;

export type PriceCurrency = 'AZN' | 'USD';

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Foreign markup in percent, from the settings (0–300). */
export function foreignMarkup(settings: unknown): number {
  const raw = Number((settings as any)?.regionPricing?.foreignMarkupPercent);
  if (!Number.isFinite(raw)) return DEFAULT_FOREIGN_MARKUP;
  return Math.min(300, Math.max(0, raw));
}

/** Foreign price in USD. */
export function foreignUsd(product: { price: number; internationalPrice?: number | null }, markupPct: number): number {
  const own = Number(product.internationalPrice);
  if (product.internationalPrice != null && Number.isFinite(own) && own > 0) return round2(own);
  return round2(((Number(product.price) || 0) * (1 + markupPct / 100)) / AZN_PER_USD);
}

/** What one unit costs for this buyer, in the currency shown. */
export function unitPriceFor(
  product: { price: number; internationalPrice?: number | null },
  opts: { foreign: boolean; currency: PriceCurrency; markupPct: number }
): number {
  const azn = Number(product.price) || 0;
  if (!opts.foreign) return opts.currency === 'USD' ? round2(azn / AZN_PER_USD) : round2(azn);
  const usd = foreignUsd(product, opts.markupPct);
  return opts.currency === 'USD' ? usd : round2(usd * AZN_PER_USD);
}

/** The crossed-out "was" price, scaled the same way as the product's current price. */
export function compareAtFor(
  product: { price: number; compareAtPrice?: number | null; internationalPrice?: number | null },
  opts: { foreign: boolean; currency: PriceCurrency; markupPct: number }
): number | null {
  const was = Number(product.compareAtPrice);
  const now = Number(product.price) || 0;
  if (!(was > now) || now <= 0) return null;
  return round2((unitPriceFor(product, opts) * was) / now);
}
