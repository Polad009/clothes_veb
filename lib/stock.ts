// Stock helpers shared by the storefront, the admin panel and the server.

/** Key of one colour/size combination in a product's stock map. */
export function stockKey(color: string, size: string): string {
  return `${color}|${size}`;
}

/**
 * Units available for one colour/size, or null when the product is not
 * stock-tracked (unlimited).
 */
export function availableQty(
  product: { trackStock?: boolean; stock?: Record<string, number> } | null | undefined,
  color: string,
  size: string
): number | null {
  if (!product?.trackStock) return null;
  return Math.max(0, Number(product.stock?.[stockKey(color, size)]) || 0);
}

/** Shown on the product page when a size is running out. */
export const LOW_STOCK = 3;
