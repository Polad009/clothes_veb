export interface ProductColor {
  name: string;
  hex: string;
  image: string;
  hoverImage?: string;
  leftShoulderImage?: string;
  rightShoulderImage?: string;
  gallery?: string[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  refCode?: string;
  description: string;
  price: number;
  internationalPrice?: number;
  compareAtPrice?: number;
  badge?: string;
  category: 'koynek' | 'hudi' | 'salvar' | 'aksesuar' | string;
  gender: 'men' | 'women' | 'unisex' | string;
  rating: number;
  reviewCount: number;
  composition: string;
  fit: string;
  care: string;
  inStock: boolean;
  sizes: string[];
  colors: ProductColor[];
  /** When true, `stock` holds units per colour/size (see lib/stock.ts). */
  trackStock?: boolean;
  stock?: Record<string, number>;
  translations?: Partial<Record<'en' | 'ru' | 'tr', { name?: string; description?: string }>>;
  /** Running discount, if any (prices already include it). */
  campaign?: { id: string; name: string; percent: number; endsAt: string | null; showCountdown: boolean };
  /** Perfume details; see lib/perfume.ts. */
  perfume?: import('@/lib/perfume').PerfumeInfo;
  image?: string;
  hoverImage?: string;
  gallery?: string[];
}
