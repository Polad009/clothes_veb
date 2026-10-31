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
  categories?: any[];
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
  trackingCode?: string;
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
  loyalty?: any[];
}

const GLOBAL_STORE_KEY = '__HORVVALLE_STORE_DATA__';
const ORDERS_BACKUP_PATH = path.join(os.tmpdir(), 'horvvalle_orders_backup.json');

export function readStoreDb(): StoreData {
  const g = globalThis as any;
  if (g[GLOBAL_STORE_KEY]) {
    return g[GLOBAL_STORE_KEY];
  }

  let dbData: StoreData | null = null;

  // 1. If /tmp/storeData.json exists (from recent writes in this serverless environment), use it
  if (fs.existsSync(TMP_DB_PATH)) {
    try {
      const raw = fs.readFileSync(TMP_DB_PATH, 'utf-8');
      dbData = JSON.parse(raw);
    } catch (e) {
      console.warn('Error reading from tmp DB, falling back to bundled DB:', e);
    }
  }

  // 2. Otherwise read from bundled storeData.json
  if (!dbData) {
    try {
      if (fs.existsSync(BUNDLED_DB_PATH)) {
        const raw = fs.readFileSync(BUNDLED_DB_PATH, 'utf-8');
        dbData = JSON.parse(raw);
      }
    } catch (error) {
      console.error('Error reading store database:', error);
    }
  }

  if (!dbData) {
    dbData = {
      settings: {
        storeName: "HORVVALLE",
        tagline: "LÜKS MODA & FƏRDİ DƏRZİLİK ATELYESİ",
        freeShippingThreshold: 60,
        currency: "AZN",
        currencySymbol: "₼",
        contactEmail: "info@horvvalle.com",
        contactPhone: "+994 55-766-90-50",
      },
      content: {
        announcements: [],
        hero: {} as any,
        promoBanner: {} as any,
        campaignSecondary: {} as any,
      },
      products: [],
      orders: [],
      podOrders: [],
    };
  }

  // Ensure orders array exists
  if (!Array.isArray(dbData.orders)) {
    dbData.orders = [];
  }

  // Merge extra orders backup if available in /tmp
  if (fs.existsSync(ORDERS_BACKUP_PATH)) {
    try {
      const backupRaw = fs.readFileSync(ORDERS_BACKUP_PATH, 'utf-8');
      const backupOrders = JSON.parse(backupRaw);
      if (Array.isArray(backupOrders)) {
        for (const bo of backupOrders) {
          if (!dbData.orders.some((o) => o.id === bo.id)) {
            dbData.orders.unshift(bo);
          }
        }
      }
    } catch (e) {}
  }

  cachedDb = dbData;
  g[GLOBAL_STORE_KEY] = dbData;
  return dbData;
}

export function writeStoreDb(data: StoreData): void {
  // Always update in-memory global cache first
  cachedDb = data;
  const g = globalThis as any;
  g[GLOBAL_STORE_KEY] = data;

  const jsonStr = JSON.stringify(data, null, 2);

  // 1. Try writing to bundled path (works in local dev)
  try {
    fs.writeFileSync(BUNDLED_DB_PATH, jsonStr, 'utf-8');
  } catch (error: any) {
    // EROFS on Vercel is expected, fallback to /tmp
  }

  // 2. Always write to /tmp so other serverless functions in the same instance have it
  try {
    fs.writeFileSync(TMP_DB_PATH, jsonStr, 'utf-8');
  } catch (tmpError) {
    console.warn('Failed to write to tmp DB:', tmpError);
  }

  // 3. Keep dedicated orders backup in /tmp
  try {
    if (data.orders && Array.isArray(data.orders)) {
      fs.writeFileSync(ORDERS_BACKUP_PATH, JSON.stringify(data.orders), 'utf-8');
    }
  } catch (e) {}
}
