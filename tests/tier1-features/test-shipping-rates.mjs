/**
 * Tier 1 Feature Tests: International Shipping Rate Engine
 * Covers: lib/shipping.ts
 */

import { describe, test } from '../../scripts/run-e2e-tests.mjs';
import { assert, assertEqual } from '../helpers/test-context.mjs';
import { validateShippingOptionContract } from '../helpers/contracts.mjs';

describe('Shipping Rate Engine (lib/shipping.ts)', async () => {
  const shippingModule = await import('../../lib/shipping.ts');
  const {
    calculateShippingOptions,
    getShippingOptionById,
    validateShippingRate,
    isDomesticDestination,
  } = shippingModule;

  test('FEAT-SHIP-02.1: isDomesticDestination accurately distinguishes Azerbaijan from international codes', () => {
    assert(isDomesticDestination('AZ'), 'AZ must be domestic');
    assert(isDomesticDestination('AZE'), 'AZE must be domestic');
    assert(isDomesticDestination('Azərbaycan'), 'Azərbaycan must be domestic');
    assert(isDomesticDestination('azerbaijan'), 'azerbaijan must be domestic');
    assert(!isDomesticDestination('US'), 'US must not be domestic');
    assert(!isDomesticDestination('TR'), 'TR must not be domestic');
    assert(!isDomesticDestination('GB'), 'GB must not be domestic');
    assert(!isDomesticDestination('DE'), 'DE must not be domestic');
  });

  test('FEAT-SHIP-02.2: Domestic Azerbaijan returns Baku/Sumgayit Courier and Rayonlar options', () => {
    const options = calculateShippingOptions('AZ', 40, 'AZN');
    assertEqual(options.length, 2, 'Domestic destination should offer 2 shipping options');
    for (const opt of options) {
      validateShippingOptionContract(opt);
    }

    const baku = options.find((o) => o.id === 'domestic_baku_sumgayit');
    assert(baku !== undefined, 'Baku courier option must exist');
    assertEqual(baku.price, 0, 'Baku courier must always be 0');
    assertEqual(baku.isFree, true, 'Baku courier isFree must be true');
    assertEqual(baku.currency, 'AZN');

    const rayon = options.find((o) => o.id === 'domestic_region');
    assert(rayon !== undefined, 'Rayonlar option must exist');
    assertEqual(rayon.price, 5, 'Rayonlar price below 60 AZN must be 5 AZN');
    assertEqual(rayon.isFree, false);
  });

  test('FEAT-SHIP-02.3: Domestic Rayonlar delivery becomes FREE when order subtotal >= 60 AZN', () => {
    const optionsAt60 = calculateShippingOptions('AZ', 60, 'AZN');
    const rayonAt60 = optionsAt60.find((o) => o.id === 'domestic_region');
    assertEqual(rayonAt60.price, 0, 'Rayonlar must be 0 for subtotal 60 AZN');
    assertEqual(rayonAt60.isFree, true, 'isFree must be true for subtotal 60 AZN');

    const optionsAt100 = calculateShippingOptions('AZ', 100, 'AZN');
    const rayonAt100 = optionsAt100.find((o) => o.id === 'domestic_region');
    assertEqual(rayonAt100.price, 0, 'Rayonlar must be 0 for subtotal > 60 AZN');
    assertEqual(rayonAt100.isFree, true);
  });

  test('FEAT-SHIP-02.4: International destination returns Standard International and DHL Express options', () => {
    const options = calculateShippingOptions('US', 50, 'USD');
    assertEqual(options.length, 2, 'International destination should offer 2 shipping options');
    for (const opt of options) {
      validateShippingOptionContract(opt);
    }

    const standard = options.find((o) => o.id === 'intl_standard');
    assert(standard !== undefined, 'Standard international option must exist');
    assertEqual(standard.price, 15, 'Base standard international in USD must be $15');
    assertEqual(standard.isFree, false);
    assertEqual(standard.currency, 'USD');

    const express = options.find((o) => o.id === 'intl_express');
    assert(express !== undefined, 'DHL express option must exist');
    assertEqual(express.price, 35, 'Base express international in USD must be $35');
    assertEqual(express.isFree, false);
    assertEqual(express.currency, 'USD');
  });

  test('FEAT-SHIP-02.5: Standard International shipping is FREE on orders >= $150 USD', () => {
    const optionsAt150 = calculateShippingOptions('US', 150, 'USD');
    const standardAt150 = optionsAt150.find((o) => o.id === 'intl_standard');
    assertEqual(standardAt150.price, 0, 'Standard shipping must be $0 at $150 subtotal');
    assertEqual(standardAt150.isFree, true, 'isFree must be true at $150 subtotal');

    const optionsAt250 = calculateShippingOptions('US', 250, 'USD');
    const standardAt250 = optionsAt250.find((o) => o.id === 'intl_standard');
    assertEqual(standardAt250.price, 0);
    assertEqual(standardAt250.isFree, true);
  });

  test('FEAT-SHIP-02.6: Express DHL shipping is DISCOUNTED to $20 USD on orders >= $200 USD', () => {
    const optionsUnder200 = calculateShippingOptions('US', 190, 'USD');
    const expressUnder200 = optionsUnder200.find((o) => o.id === 'intl_express');
    assertEqual(expressUnder200.price, 35, 'Express must be $35 below $200 USD');

    const optionsAt200 = calculateShippingOptions('US', 200, 'USD');
    const expressAt200 = optionsAt200.find((o) => o.id === 'intl_express');
    assertEqual(expressAt200.price, 20, 'Express must be discounted to $20 USD at $200 subtotal');
    assertEqual(expressAt200.originalPrice, 35, 'originalPrice must show $35 baseline');
  });

  test('FEAT-SHIP-02.7: International rates in AZN correctly calculate base and threshold tiers', () => {
    // Under 250 AZN
    const optionsBase = calculateShippingOptions('TR', 100, 'AZN');
    const stdBase = optionsBase.find((o) => o.id === 'intl_standard');
    const expBase = optionsBase.find((o) => o.id === 'intl_express');
    assertEqual(stdBase.price, 25, 'Standard international in AZN must be 25 ₼');
    assertEqual(stdBase.currency, 'AZN');
    assertEqual(expBase.price, 60, 'Express international in AZN must be 60 ₼');
    assertEqual(expBase.currency, 'AZN');

    // Free Standard threshold at 250 AZN
    const optionsAt250 = calculateShippingOptions('TR', 250, 'AZN');
    const stdAt250 = optionsAt250.find((o) => o.id === 'intl_standard');
    assertEqual(stdAt250.price, 0, 'Standard international in AZN must be 0 ₼ at 250 ₼ subtotal');
    assertEqual(stdAt250.isFree, true);

    // Express discount threshold at 340 AZN
    const optionsAt340 = calculateShippingOptions('TR', 340, 'AZN');
    const expAt340 = optionsAt340.find((o) => o.id === 'intl_express');
    assertEqual(expAt340.price, 35, 'Express international in AZN must be discounted to 35 ₼ at 340 ₼ subtotal');
  });

  test('FEAT-SHIP-02.8: getShippingOptionById resolves direct IDs and aliases', () => {
    // Direct ID
    const optDirect = getShippingOptionById('US', 100, 'USD', 'intl_standard');
    assert(optDirect !== null, 'Direct ID intl_standard should resolve');
    assertEqual(optDirect.id, 'intl_standard');

    // Alias: 'express' -> 'intl_express'
    const optExpress = getShippingOptionById('US', 100, 'USD', 'express');
    assert(optExpress !== null, 'Alias express should resolve to intl_express');
    assertEqual(optExpress.id, 'intl_express');

    // Alias: 'dhl' -> 'intl_express'
    const optDhl = getShippingOptionById('GB', 100, 'USD', 'dhl');
    assertEqual(optDhl.id, 'intl_express');

    // Domestic alias: 'baku' -> 'domestic_baku_sumgayit'
    const optBaku = getShippingOptionById('AZ', 100, 'AZN', 'baku');
    assertEqual(optBaku.id, 'domestic_baku_sumgayit');

    // Invalid ID returns null
    const optInvalid = getShippingOptionById('US', 100, 'USD', 'teleportation_express');
    assertEqual(optInvalid, null);
  });

  test('FEAT-SHIP-02.9: validateShippingRate verifies claimed vs expected price accurately', () => {
    // Valid standard rate
    const valValid = validateShippingRate('US', 100, 'USD', 'intl_standard', 15);
    assertEqual(valValid.valid, true, 'Rate of 15 for standard under 150 must be valid');
    assertEqual(valValid.expectedRate, 15);

    // Tampered rate (claiming $0 when order is $100)
    const valTampered = validateShippingRate('US', 100, 'USD', 'intl_standard', 0);
    assertEqual(valTampered.valid, false, 'Claiming 0 for standard under 150 must be invalid');
    assertEqual(valTampered.expectedRate, 15);

    // Valid free rate at $160
    const valFree = validateShippingRate('US', 160, 'USD', 'intl_standard', 0);
    assertEqual(valFree.valid, true, 'Rate of 0 for standard at 160 must be valid');
    assertEqual(valFree.expectedRate, 0);
  });

  test('FEAT-SHIP-02.10: Carrier transit day estimates conform to luxury SLA standards', () => {
    const domesticOpts = calculateShippingOptions('AZ', 50, 'AZN');
    const baku = domesticOpts.find((o) => o.id === 'domestic_baku_sumgayit');
    assertEqual(baku.estimatedDays, '1-2 iş günü');

    const intlOpts = calculateShippingOptions('US', 50, 'USD');
    const standard = intlOpts.find((o) => o.id === 'intl_standard');
    assertEqual(standard.estimatedDays, '7-14 business days');

    const express = intlOpts.find((o) => o.id === 'intl_express');
    assertEqual(express.estimatedDays, '2-5 business days');
  });
});
