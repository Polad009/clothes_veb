import storeData from './storeData.json';

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
  image?: string;
  hoverImage?: string;
  gallery?: string[];
}

export const MOCK_PRODUCTS: Product[] = (storeData.products as any[]).map(p => ({
  ...p,
  colors: (p.colors || []).map((c: any) => {
    const hasDistinctHover = Boolean(c.hoverImage && typeof c.hoverImage === 'string' && c.hoverImage.trim() !== '' && c.hoverImage !== c.image);
    const validHover = hasDistinctHover ? c.hoverImage : undefined;

    let gallery: string[] = [];
    if (c.gallery && Array.isArray(c.gallery) && c.gallery.length > 0) {
      // Keep unique non-empty images
      gallery = c.gallery.filter((img: string, idx: number, arr: string[]) => img && typeof img === 'string' && arr.indexOf(img) === idx);
    } else if (validHover) {
      gallery = [c.image, validHover];
    } else {
      gallery = [c.image];
    }

    return {
      ...c,
      hoverImage: validHover,
      gallery,
    };
  })
}));
