import storeData from './storeData.json';

export interface ProductColor {
  name: string;
  hex: string;
  image: string;
  hoverImage?: string;
  gallery?: string[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  refCode?: string;
  description: string;
  price: number;
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
}

export const MOCK_PRODUCTS: Product[] = (storeData.products as any[]).map(p => ({
  ...p,
  colors: p.colors.map((c: any) => ({
    ...c,
    gallery: c.gallery && Array.isArray(c.gallery) && c.gallery.length > 0
      ? c.gallery
      : [c.image, c.hoverImage || c.image],
  }))
}));
