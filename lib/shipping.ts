/**
 * International Shipping Rate Engine
 * Transparent, tiered shipping rules for domestic Azerbaijan and international destinations.
 */

export type ShippingCurrency = 'AZN' | 'USD';

export interface ShippingOption {
  id: string; // 'domestic_baku_sumgayit' | 'domestic_region' | 'intl_standard' | 'intl_express'
  name: string;
  carrier: string;
  estimatedDays: string;
  price: number;
  isFree: boolean;
  currency: ShippingCurrency;
  originalPrice?: number;
  description?: string;
}

export interface ShippingTier {
  id: string;
  name: string;
  carrier: string;
  estimatedDays: string;
  baseRateAZN: number;
  baseRateUSD: number;
  freeThresholdAZN?: number;
  freeThresholdUSD?: number;
  discountedRateAZN?: number;
  discountedRateUSD?: number;
  discountThresholdAZN?: number;
  discountThresholdUSD?: number;
  isDomestic: boolean;
}

export interface ShippingCalculationParams {
  countryCode: string;
  subtotal: number;
  currency: ShippingCurrency;
}

export const SHIPPING_TIERS: Record<string, ShippingTier> = {
  domestic_baku_sumgayit: {
    id: 'domestic_baku_sumgayit',
    name: 'Bakı & Sumqayıt Kuryer',
    carrier: 'HORVVALLE Express Courier',
    estimatedDays: '1-2 iş günü',
    baseRateAZN: 0,
    baseRateUSD: 0,
    freeThresholdAZN: 0,
    freeThresholdUSD: 0,
    isDomestic: true,
  },
  domestic_region: {
    id: 'domestic_region',
    name: 'Rayonlar / Azərpoçt',
    carrier: 'Azərpoçt / Regional Express',
    estimatedDays: '2-4 iş günü',
    baseRateAZN: 5,
    baseRateUSD: 3,
    freeThresholdAZN: 60,
    freeThresholdUSD: 35,
    isDomestic: true,
  },
  intl_standard: {
    id: 'intl_standard',
    name: 'Standard International Tracked Priority Post',
    carrier: 'Tracked Priority Post',
    estimatedDays: '7-14 business days',
    baseRateAZN: 25,
    baseRateUSD: 15,
    freeThresholdAZN: 250,
    freeThresholdUSD: 150,
    isDomestic: false,
  },
  intl_express: {
    id: 'intl_express',
    name: 'DHL Express Worldwide / FedEx Priority',
    carrier: 'DHL Express / FedEx Priority',
    estimatedDays: '2-5 business days',
    baseRateAZN: 60,
    baseRateUSD: 35,
    discountThresholdAZN: 340,
    discountThresholdUSD: 200,
    discountedRateAZN: 35,
    discountedRateUSD: 20,
    isDomestic: false,
  },
};

/**
 * Determine whether a country code or name represents domestic Azerbaijan delivery
 */
export function isDomesticDestination(countryCode: string): boolean {
  if (!countryCode || typeof countryCode !== 'string') return true;
  const normalized = countryCode.trim().toUpperCase();
  const lower = countryCode.trim().toLowerCase();
  return (
    normalized === 'AZ' ||
    normalized === 'AZE' ||
    lower === 'azərbaycan' ||
    lower === 'azerbaijan'
  );
}

/**
 * Calculate available shipping options and live rates based on destination, order subtotal, and currency
 */
export function calculateShippingOptions(
  countryCodeOrParams: string | ShippingCalculationParams,
  subtotalParam?: number,
  currencyParam?: ShippingCurrency
): ShippingOption[] {
  let countryCode: string;
  let subtotal: number;
  let currency: ShippingCurrency;

  if (typeof countryCodeOrParams === 'object' && countryCodeOrParams !== null) {
    countryCode = countryCodeOrParams.countryCode;
    subtotal = countryCodeOrParams.subtotal;
    currency = countryCodeOrParams.currency;
  } else {
    countryCode = countryCodeOrParams as string;
    subtotal = subtotalParam ?? 0;
    currency = currencyParam ?? 'AZN';
  }

  const safeSubtotal = Math.max(0, Number(subtotal) || 0);
  const safeCurrency: ShippingCurrency = currency === 'USD' ? 'USD' : 'AZN';
  const isDomestic = isDomesticDestination(countryCode);

  if (isDomestic) {
    const isFreeRegion =
      safeCurrency === 'USD' ? safeSubtotal >= 35 : safeSubtotal >= 60;
    const regionRate = isFreeRegion ? 0 : safeCurrency === 'USD' ? 3 : 5;

    return [
      {
        id: 'domestic_baku_sumgayit',
        name: 'Bakı & Sumqayıt Kuryer',
        carrier: 'HORVVALLE Express Courier',
        estimatedDays: '1-2 iş günü',
        price: 0,
        isFree: true,
        currency: safeCurrency,
        description: 'Bakı və Sumqayıt daxili ünvana qapıda çatdırılma (Həmişə pulsuz)',
      },
      {
        id: 'domestic_region',
        name: 'Rayonlar / Azərpoçt',
        carrier: 'Azərpoçt / Regional Express',
        estimatedDays: '2-4 iş günü',
        price: regionRate,
        isFree: isFreeRegion,
        currency: safeCurrency,
        originalPrice: isFreeRegion ? (safeCurrency === 'USD' ? 3 : 5) : undefined,
        description: 'Azərbaycanın bütün bölgələrinə və rayonlarına çatdırılma (60 ₼-dən yuxarı pulsuz)',
      },
    ];
  }

  // International Destinations
  if (safeCurrency === 'USD') {
    const isStandardFree = safeSubtotal >= 150;
    const standardCost = isStandardFree ? 0 : 15;

    const isExpressDiscounted = safeSubtotal >= 200;
    const expressCost = isExpressDiscounted ? 20 : 35;

    return [
      {
        id: 'intl_standard',
        name: 'Standard International Tracked Priority Post',
        carrier: 'Tracked Priority Post',
        estimatedDays: '7-14 business days',
        price: standardCost,
        isFree: isStandardFree,
        currency: 'USD',
        originalPrice: isStandardFree ? 15 : undefined,
        description: 'Tracked international priority airmail (Free on orders >= $150 USD)',
      },
      {
        id: 'intl_express',
        name: 'DHL Express Worldwide / FedEx Priority',
        carrier: 'DHL Express / FedEx Priority',
        estimatedDays: '2-5 business days',
        price: expressCost,
        isFree: false,
        currency: 'USD',
        originalPrice: isExpressDiscounted ? 35 : undefined,
        description: 'Premium express air courier delivery (Discounted to $20 on orders >= $200 USD)',
      },
    ];
  }

  // International in AZN
  const isStandardFreeAZN = safeSubtotal >= 250;
  const standardCostAZN = isStandardFreeAZN ? 0 : 25;

  const isExpressDiscountedAZN = safeSubtotal >= 340;
  const expressCostAZN = isExpressDiscountedAZN ? 35 : 60;

  return [
    {
      id: 'intl_standard',
      name: 'Standard International Tracked Priority Post',
      carrier: 'Tracked Priority Post',
      estimatedDays: '7-14 business days',
      price: standardCostAZN,
      isFree: isStandardFreeAZN,
      currency: 'AZN',
      originalPrice: isStandardFreeAZN ? 25 : undefined,
      description: 'Beynəlxalq standart poçt çatdırılması (250 ₼-dən yuxarı pulsuz)',
    },
    {
      id: 'intl_express',
      name: 'DHL Express Worldwide / FedEx Priority',
      carrier: 'DHL Express / FedEx Priority',
      estimatedDays: '2-5 business days',
      price: expressCostAZN,
      isFree: false,
      currency: 'AZN',
      originalPrice: isExpressDiscountedAZN ? 60 : undefined,
      description: 'Sürətli DHL Express beynəlxalq çatdırılma (340 ₼-dən yuxarı endirimlə 35 ₼)',
    },
  ];
}

/**
 * Retrieve a specific shipping option by id or alias for a given destination and order
 */
export function getShippingOptionById(
  countryCode: string,
  subtotal: number,
  currency: 'AZN' | 'USD',
  optionId: string
): ShippingOption | null {
  const options = calculateShippingOptions(countryCode, subtotal, currency);
  if (!optionId || typeof optionId !== 'string') return null;

  const normalizedId = optionId.trim().toLowerCase();

  // 1. Direct match
  const direct = options.find((o) => o.id.toLowerCase() === normalizedId);
  if (direct) return direct;

  // 2. Domestic Aliases
  if (
    normalizedId === 'domestic_free' ||
    normalizedId === 'baku' ||
    normalizedId === 'sumgayit' ||
    normalizedId === 'free'
  ) {
    return options.find((o) => o.id === 'domestic_baku_sumgayit') || null;
  }

  if (
    normalizedId === 'region' ||
    normalizedId === 'rayonlar' ||
    normalizedId === 'azerpost' ||
    normalizedId === 'azerpoct'
  ) {
    return options.find((o) => o.id === 'domestic_region') || null;
  }

  // 3. International Aliases
  if (
    normalizedId === 'standard' ||
    normalizedId === 'post' ||
    normalizedId === 'intl_post' ||
    normalizedId === 'airmail'
  ) {
    return options.find((o) => o.id === 'intl_standard') || null;
  }

  if (
    normalizedId === 'express' ||
    normalizedId === 'dhl' ||
    normalizedId === 'fedex' ||
    normalizedId === 'dhl_express'
  ) {
    return options.find((o) => o.id === 'intl_express') || null;
  }

  return null;
}

/**
 * Validate a client-provided shipping rate against the server-computed rate
 */
export function validateShippingRate(
  countryCode: string,
  subtotal: number,
  currency: 'AZN' | 'USD',
  optionId: string,
  claimedRate: number
): { valid: boolean; expectedRate: number; option: ShippingOption } {
  const options = calculateShippingOptions(countryCode, subtotal, currency);
  let matchedOption = getShippingOptionById(countryCode, subtotal, currency, optionId);

  if (!matchedOption) {
    const fallback = options[0];
    return {
      valid: false,
      expectedRate: fallback.price,
      option: fallback,
    };
  }

  const expectedRate = matchedOption.price;
  const claimed = Number(claimedRate);
  const valid = !isNaN(claimed) && Math.abs(claimed - expectedRate) < 0.01;

  return {
    valid,
    expectedRate,
    option: matchedOption,
  };
}
