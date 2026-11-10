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
  image?: string;
  hoverImage?: string;
  gallery?: string[];
}
