import fs from 'fs';
import path from 'path';
import os from 'os';

const BUNDLED_DB_PATH = path.join(process.cwd(), 'data', 'storeData.json');
const TMP_DB_PATH = path.join(os.tmpdir(), 'storeData.json');

// In-memory cache across serverless warm requests
let cachedDb: StoreData | null = null;

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
  originalImage?: string;
  placement?: string;
  customerNote?: string;
  placementData?: any;
  previewImage?: string;
  customData?: any;
}

export interface StorePromoCode {
  id?: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minAmount?: number;
  active: boolean;
  desc?: string;
  uses?: number;
}

export interface StoreData {
  settings: StoreSettings;
  content: StoreContent;
  products: StoreProduct[];
  orders: StoreOrder[];
  podOrders: PodOrder[];
  promoCodes?: StorePromoCode[];
}

export function readStoreDb(): StoreData {
  if (cachedDb) {
    return cachedDb;
  }

  // 1. If /tmp/storeData.json exists (from recent writes in this serverless environment), use it
  if (fs.existsSync(TMP_DB_PATH)) {
    try {
      const raw = fs.readFileSync(TMP_DB_PATH, 'utf-8');
      cachedDb = JSON.parse(raw);
      return cachedDb!;
    } catch (e) {
      console.warn('Error reading from tmp DB, falling back to bundled DB:', e);
    }
  }

  // 2. Otherwise read from bundled storeData.json
  try {
    if (fs.existsSync(BUNDLED_DB_PATH)) {
      const raw = fs.readFileSync(BUNDLED_DB_PATH, 'utf-8');
      cachedDb = JSON.parse(raw);
      return cachedDb!;
    }
    throw new Error(`DB file not found at ${BUNDLED_DB_PATH}`);
  } catch (error) {
    console.error('Error reading store database:', error);
    throw error;
  }
}

export function writeStoreDb(data: StoreData): void {
  // Always update in-memory cache first
  cachedDb = data;

  const jsonStr = JSON.stringify(data, null, 2);

  // 1. Try writing to bundled path (works in local dev)
  try {
    fs.writeFileSync(BUNDLED_DB_PATH, jsonStr, 'utf-8');
    return;
  } catch (error: any) {
    // If read-only filesystem (e.g. Vercel / AWS Lambda EROFS)
    if (error.code === 'EROFS' || error.message?.includes('read-only')) {
      try {
        fs.writeFileSync(TMP_DB_PATH, jsonStr, 'utf-8');
        return;
      } catch (tmpError) {
        console.warn('Failed to write to tmp DB:', tmpError);
      }
    } else {
      console.warn('Warning writing store database:', error.message);
    }
  }
}
