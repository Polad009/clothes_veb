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
  fabric?: string;
  care: string;
  inStock: boolean;
  sizes: string[];
  colors: ProductColor[];
  images?: string[];
  features?: string[];
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
  policies?: any;
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

export interface StoreCustomerAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  addressLine2?: string;
  city: string;
  stateOrRegion?: string;
  postalCode?: string;
  country: string;
  countryCode?: string;
}

export interface StoreOrder {
  id: string;
  trackingCode?: string;
  tracking_code?: string;
  refCode?: string;
  customerPhone?: string;
  userId?: string;
  source?: string;
  date: string;
  customer: StoreCustomerAddress;
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
  shippingMethod?: string;
  shippingMethodLabel?: string;
  estimatedDelivery?: string;
  discount: number;
  total: number;
  isTest?: boolean;
  provider?: string;
  providerPaymentId?: string;
  promoCode?: string;
  currency?: string;
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
  maxUses?: number | null;
  expiresAt?: string | null;
}

export interface StoreData {
  settings: StoreSettings;
  content: StoreContent;
  products: StoreProduct[];
  orders: StoreOrder[];
  podOrders: PodOrder[];
  promoCodes?: StorePromoCode[];
}

const GLOBAL_STORE_KEY = '__HORVVALLE_STORE_DATA__';
const ORDERS_BACKUP_PATH = path.join(os.tmpdir(), 'horvvalle_orders_backup.json');
const TOMBSTONES_PATH = path.join(os.tmpdir(), 'horvvalle_deleted_orders.json');

export function getDeletedOrderIds(): Set<string> {
  const g = globalThis as any;
  if (!g.__HORVVALLE_DELETED_ORDERS__) {
    g.__HORVVALLE_DELETED_ORDERS__ = new Set<string>();
    if (fs.existsSync(TOMBSTONES_PATH)) {
      try {
        const raw = fs.readFileSync(TOMBSTONES_PATH, 'utf-8');
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          list.forEach((id: string) => g.__HORVVALLE_DELETED_ORDERS__.add(String(id)));
        }
      } catch (e) {}
    }
  }
  return g.__HORVVALLE_DELETED_ORDERS__;
}

export function markOrderDeleted(id: string, trackingCode?: string): void {
  const deleted = getDeletedOrderIds();
  if (id) deleted.add(String(id));
  if (trackingCode) deleted.add(String(trackingCode));
  try {
    fs.writeFileSync(TOMBSTONES_PATH, JSON.stringify(Array.from(deleted)), 'utf-8');
  } catch (e) {}
}

export function isOrderDeleted(id?: string, trackingCode?: string): boolean {
  const deleted = getDeletedOrderIds();
  if (id && deleted.has(String(id))) return true;
  if (trackingCode && deleted.has(String(trackingCode))) return true;
  return false;
}

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
        contactPhone: "+994 10 328 31 52",
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

  // Ensure orders array exists and filter out tombstoned deleted orders
  if (!Array.isArray(dbData.orders)) {
    dbData.orders = [];
  } else {
    dbData.orders = dbData.orders.filter((o) => !isOrderDeleted(o.id, o.trackingCode || (o as any).tracking_code));
  }
  if (Array.isArray(dbData.podOrders)) {
    dbData.podOrders = dbData.podOrders.filter((p) => !isOrderDeleted(p.orderId) && !isOrderDeleted(p.id));
  }

  // Merge extra orders backup if available in /tmp (only non-deleted orders)
  if (fs.existsSync(ORDERS_BACKUP_PATH)) {
    try {
      const backupRaw = fs.readFileSync(ORDERS_BACKUP_PATH, 'utf-8');
      const backupOrders = JSON.parse(backupRaw);
      if (Array.isArray(backupOrders)) {
        for (const bo of backupOrders) {
          if (!isOrderDeleted(bo.id, bo.trackingCode || bo.tracking_code) && !dbData.orders.some((o) => o.id === bo.id)) {
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
  // Purge any tombstoned orders from data before saving
  if (data.orders && Array.isArray(data.orders)) {
    data.orders = data.orders.filter((o) => !isOrderDeleted(o.id, o.trackingCode || (o as any).tracking_code));
  }
  if (data.podOrders && Array.isArray(data.podOrders)) {
    data.podOrders = data.podOrders.filter((p) => !isOrderDeleted(p.orderId) && !isOrderDeleted(p.id));
  }

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
