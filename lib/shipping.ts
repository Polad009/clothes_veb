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

export interface ShippingCalculationParams {
  countryCode: string;
  subtotal: number;
  currency: ShippingCurrency;
  rates?: unknown;
}

/** Rates the shop owner can change in the admin panel (Settings, Shipping). */
export interface ShippingRates {
  regionAZN: number;
  regionUSD: number;
  /** Regional delivery is free from this subtotal. 0 = always free. */
  regionFreeFromAZN: number;
  regionFreeFromUSD: number;
  intlStandardAZN: number;
  intlStandardUSD: number;
  intlExpressAZN: number;
  intlExpressUSD: number;
}

export const DEFAULT_SHIPPING_RATES: ShippingRates = {
  regionAZN: 5,
  regionUSD: 3,
  regionFreeFromAZN: 60,
  regionFreeFromUSD: 35,
  intlStandardAZN: 25,
  intlStandardUSD: 15,
  intlExpressAZN: 60,
  intlExpressUSD: 35,
};

/** Stored settings layered over the defaults; anything that is not a sane number is ignored. */
export function resolveShippingRates(raw?: unknown): ShippingRates {
  const rates: ShippingRates = { ...DEFAULT_SHIPPING_RATES };
  if (raw && typeof raw === 'object') {
    const source = raw as Record<string, unknown>;
    for (const key of Object.keys(DEFAULT_SHIPPING_RATES) as Array<keyof ShippingRates>) {
      const given = source[key];
      const value = Number(given);
      if (given !== '' && given != null && Number.isFinite(value) && value >= 0 && value <= 10000) {
        rates[key] = Math.round(value * 100) / 100;
      }
    }
  }
  return rates;
}

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
  currencyParam?: ShippingCurrency,
  ratesParam?: unknown
): ShippingOption[] {
  let countryCode: string;
  let subtotal: number;
  let currency: ShippingCurrency;
  let rawRates: unknown = ratesParam;

  if (typeof countryCodeOrParams === 'object' && countryCodeOrParams !== null) {
    countryCode = countryCodeOrParams.countryCode;
    subtotal = countryCodeOrParams.subtotal;
    currency = countryCodeOrParams.currency;
    rawRates = countryCodeOrParams.rates ?? ratesParam;
  } else {
    countryCode = countryCodeOrParams as string;
    subtotal = subtotalParam ?? 0;
    currency = currencyParam ?? 'AZN';
  }

  const safeSubtotal = Math.max(0, Number(subtotal) || 0);
  const safeCurrency: ShippingCurrency = currency === 'USD' ? 'USD' : 'AZN';
  const isDomestic = isDomesticDestination(countryCode);
  const rates = resolveShippingRates(rawRates);

  if (isDomestic) {
    const regionBase = safeCurrency === 'USD' ? rates.regionUSD : rates.regionAZN;
    const regionFreeFrom = safeCurrency === 'USD' ? rates.regionFreeFromUSD : rates.regionFreeFromAZN;
    const isFreeRegion = regionBase === 0 || safeSubtotal >= regionFreeFrom;
    const regionRate = isFreeRegion ? 0 : regionBase;
    const regionFreeNote =
      regionBase === 0 || regionFreeFrom === 0
        ? 'pulsuz'
        : `${regionFreeFrom} ${safeCurrency === 'USD' ? '$' : '₼'}-dən yuxarı pulsuz`;

    return [
      {
        id: 'domestic_baku_sumgayit',
        name: 'Bakı & Sumqayıt Kuryer',
        carrier: 'HORWALLE Express Courier',
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
        originalPrice: isFreeRegion && regionBase > 0 ? regionBase : undefined,
        description: `Azərbaycanın bütün bölgələrinə və rayonlarına çatdırılma (${regionFreeNote})`,
      },
    ];
  }

  // International Destinations (Always paid, never free)
  if (safeCurrency === 'USD') {
    const standardCost = rates.intlStandardUSD;

    const isExpressDiscounted = safeSubtotal >= 200 && rates.intlExpressUSD > 20;
    const expressCost = isExpressDiscounted ? 20 : rates.intlExpressUSD;

    return [
      {
        id: 'intl_standard',
        name: 'Standard International Tracked Priority Post',
        carrier: 'Tracked Priority Post',
        estimatedDays: '7-14 business days',
        price: standardCost,
        isFree: false,
        currency: 'USD',
        description: `Tracked international priority airmail ($${standardCost} flat rate)`,
      },
      {
        id: 'intl_express',
        name: 'DHL Express Worldwide / FedEx Priority',
        carrier: 'DHL Express / FedEx Priority',
        estimatedDays: '2-5 business days',
        price: expressCost,
        isFree: false,
        currency: 'USD',
        originalPrice: isExpressDiscounted ? rates.intlExpressUSD : undefined,
        description: 'Premium express air courier delivery (Discounted to $20 on orders >= $200 USD)',
      },
    ];
  }

  // International in AZN (Always paid, never free)
  const standardCostAZN = rates.intlStandardAZN;

  const isExpressDiscountedAZN = safeSubtotal >= 340 && rates.intlExpressAZN > 35;
  const expressCostAZN = isExpressDiscountedAZN ? 35 : rates.intlExpressAZN;

  return [
    {
      id: 'intl_standard',
      name: 'Standard International Tracked Priority Post',
      carrier: 'Tracked Priority Post',
      estimatedDays: '7-14 business days',
      price: standardCostAZN,
      isFree: false,
      currency: 'AZN',
      description: `Beynəlxalq standart poçt çatdırılması (${standardCostAZN} ₼ sabit tarif)`,
    },
    {
      id: 'intl_express',
      name: 'DHL Express Worldwide / FedEx Priority',
      carrier: 'DHL Express / FedEx Priority',
      estimatedDays: '2-5 business days',
      price: expressCostAZN,
      isFree: false,
      currency: 'AZN',
      originalPrice: isExpressDiscountedAZN ? rates.intlExpressAZN : undefined,
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
  optionId: string,
  rates?: unknown
): ShippingOption | null {
  const options = calculateShippingOptions(countryCode, subtotal, currency, rates);
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
  claimedRate: number,
  rates?: unknown
): { valid: boolean; expectedRate: number; option: ShippingOption } {
  const options = calculateShippingOptions(countryCode, subtotal, currency, rates);
  let matchedOption = getShippingOptionById(countryCode, subtotal, currency, optionId, rates);

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
