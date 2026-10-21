import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'storeData.json');

export interface ProductColor {
  name: string;
  hex: string;
  image: string;
  hoverImage?: string;
}

export interface StoreProduct {
  id: string;
  slug: string;
  name: string;
  refCode?: string;
  gender: 'men' | 'women' | 'accessories' | 'unisex' | string;
  category: 'koynek' | 'hudi' | 'salvar' | 'aksesuar' | string;
  fit: string;
  price: number;
  compareAtPrice?: number;
  badge?: string;
  rating: number;
  reviewCount: number;
  description: string;
  composition: string;
  care: string;
  inStock: boolean;
  sizes: string[];
  colors: ProductColor[];
}

export interface StoreContent {
  announcements: string[];
  hero: {
    tag: string;
    headline: string;
    subheadline: string;
    primaryCta: { label: string; link: string };
    secondaryCta: { label: string; link: string };
    customLabCta: { label: string; link: string };
    bgImage: string;
    mobileBgImage: string;
  };
  promoBanner: {
    tag: string;
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    image: string;
  };
  campaignSecondary: {
    tag: string;
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    image: string;
  };
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  freeShippingThreshold: number;
  currency: string;
  currencySymbol: string;
  contactEmail: string;
  contactPhone: string;
}

export interface StoreOrder {
  id: string;
  date: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
  };
  items: Array<{
    productId: string;
    name: string;
    size: string;
    color: string;
    price: number;
    quantity: number;
    isCustom?: boolean;
    customData?: any;
  }>;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

export interface PodOrder {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  garmentType: string;
  garmentColor: string;
  size: string;
  price: number;
  frontDesign: any;
  backDesign: any;
  status: 'Pending Print' | 'In Production' | 'Printed' | 'Shipped';
  createdAt: string;
}

export interface StoreData {
  settings: StoreSettings;
  content: StoreContent;
  products: StoreProduct[];
  orders: StoreOrder[];
  podOrders: PodOrder[];
}

export function readStoreDb(): StoreData {
  try {
    if (!fs.existsSync(DB_PATH)) {
      throw new Error(`DB file not found at ${DB_PATH}`);
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading store database:', error);
    throw error;
  }
}

export function writeStoreDb(data: StoreData): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing store database:', error);
    throw error;
  }
}
