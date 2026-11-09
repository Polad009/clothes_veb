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
