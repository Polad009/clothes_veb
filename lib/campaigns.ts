// Timed discounts ("Endirimlər"). Shared by the server and the browser — no server imports.

export type CampaignScope = 'all' | 'categories' | 'products';

export interface Campaign {
  id: string;
  name: string;
  /** Whole percent, 1–90. */
  percent: number;
  scope: CampaignScope;
  categoryIds: string[];
  productIds: string[];
  /** ISO times; empty = no limit on that side. */
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
  /** Show a "ends in …" countdown on the product page. */
  showCountdown: boolean;
  /** Label on the product image; empty = "-20%". */
  badge: string;
}

export interface AppliedCampaign {
  id: string;
  name: string;
  percent: number;
  endsAt: string | null;
  showCountdown: boolean;
}

export type CampaignState = 'running' | 'scheduled' | 'ended' | 'paused';

export function campaignState(c: Campaign, now = Date.now()): CampaignState {
  if (!c.active) return 'paused';
  if (c.startsAt && now < new Date(c.startsAt).getTime()) return 'scheduled';
  if (c.endsAt && now >= new Date(c.endsAt).getTime()) return 'ended';
  return 'running';
}

function covers(c: Campaign, p: { id: string; supaId?: string; category: string }): boolean {
  if (c.scope === 'all') return true;
  if (c.scope === 'categories') return c.categoryIds.includes(p.category);
  return c.productIds.includes(p.id) || Boolean(p.supaId && c.productIds.includes(p.supaId));
}

/** The running campaign with the biggest discount for this product, if any. */
export function bestCampaign(campaigns: Campaign[], p: { id: string; supaId?: string; category: string }, now = Date.now()): Campaign | null {
  let best: Campaign | null = null;
  for (const c of campaigns) {
    if (campaignState(c, now) !== 'running' || !covers(c, p)) continue;
    if (!best || c.percent > best.percent) best = c;
  }
  return best;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Applies running campaigns to catalogue products: `price` becomes the sale price and
 * `compareAtPrice` shows what it was. Used for the storefront and for checkout pricing —
 * never for the admin editor, which must keep the real base price.
 */
export function applyCampaigns<
  T extends { id: string; supaId?: string; category: string; price: number; compareAtPrice?: number; internationalPrice?: number; badge?: string }
>(products: T[], campaigns: Campaign[], now = Date.now()): Array<T & { campaign?: AppliedCampaign }> {
  if (!campaigns.length) return products;
  return products.map((p) => {
    const c = bestCampaign(campaigns, p, now);
    if (!c) return p;
    const factor = 1 - c.percent / 100;
    return {
      ...p,
      price: round2(p.price * factor),
      compareAtPrice: Math.max(Number(p.compareAtPrice) || 0, p.price),
      internationalPrice: p.internationalPrice != null ? round2(p.internationalPrice * factor) : undefined,
      badge: c.badge || `-${c.percent}%`,
      campaign: { id: c.id, name: c.name, percent: c.percent, endsAt: c.endsAt, showCountdown: c.showCountdown },
    };
  });
}

/** Validates and normalises admin input. Throws a readable error. */
export function cleanCampaign(input: any): Campaign {
  const name = String(input?.name || '').replace(/[<>]/g, '').trim().slice(0, 80);
  if (!name) throw new Error('Endirimin adını yazın.');
  const percent = Math.round(Number(input?.percent));
  if (!(percent >= 1 && percent <= 90)) throw new Error('Endirim 1% ilə 90% arasında olmalıdır.');
  const scope: CampaignScope = input?.scope === 'categories' || input?.scope === 'products' ? input.scope : 'all';
  const list = (v: unknown) => (Array.isArray(v) ? v.map(String).filter(Boolean).slice(0, 500) : []);
  const categoryIds = scope === 'categories' ? list(input?.categoryIds) : [];
  const productIds = scope === 'products' ? list(input?.productIds) : [];
  if (scope === 'categories' && !categoryIds.length) throw new Error('Ən azı bir kateqoriya seçin.');
  if (scope === 'products' && !productIds.length) throw new Error('Ən azı bir məhsul seçin.');
  const time = (v: unknown) => {
    if (!v) return null;
    const t = new Date(String(v)).getTime();
    return Number.isNaN(t) ? null : new Date(t).toISOString();
  };
  const startsAt = time(input?.startsAt);
  const endsAt = time(input?.endsAt);
  if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) throw new Error('Bitmə vaxtı başlama vaxtından sonra olmalıdır.');
  return {
    id: String(input?.id || '').trim() || `disc-${Date.now().toString(36)}`,
    name,
    percent,
    scope,
    categoryIds,
    productIds,
    startsAt,
    endsAt,
    active: input?.active !== false,
    showCountdown: Boolean(input?.showCountdown) && Boolean(endsAt),
    badge: String(input?.badge || '').replace(/[<>]/g, '').trim().slice(0, 20),
  };
}
