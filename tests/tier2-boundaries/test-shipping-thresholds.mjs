/**
 * Tier 2 Boundary Tests: Shipping Rate Thresholds & Boundary Value Analysis (BVA)
 * Covers: Exact dollar/manat boundary transitions ($150, $200, 60 ₼, 250 ₼, 340 ₼)
 */

import { describe, test } from '../../scripts/run-e2e-tests.mjs';
import { assertEqual } from '../helpers/test-context.mjs';

describe('Tier 2 BVA: International Standard Free Shipping Threshold ($150 USD)', async () => {
  const { calculateShippingOptions } = await import('../../lib/shipping.ts');

  test('BVA-SHIP-01: Exactly $149.99 subtotal incurs full standard rate ($15)', () => {
    const opts = calculateShippingOptions('US', 149.99, 'USD');
    const std = opts.find((o) => o.id === 'intl_standard');
    assertEqual(std.price, 15, 'At $149.99 standard shipping must still be $15');
    assertEqual(std.isFree, false);
  });

  test('BVA-SHIP-02: Exactly $150.00 subtotal transitions to FREE standard shipping ($0)', () => {
    const opts = calculateShippingOptions('US', 150.00, 'USD');
    const std = opts.find((o) => o.id === 'intl_standard');
    assertEqual(std.price, 0, 'At exactly $150.00 standard shipping must be $0 (FREE)');
    assertEqual(std.isFree, true);
  });

  test('BVA-SHIP-03: Exactly $150.01 subtotal retains FREE standard shipping ($0)', () => {
    const opts = calculateShippingOptions('US', 150.01, 'USD');
    const std = opts.find((o) => o.id === 'intl_standard');
    assertEqual(std.price, 0, 'At $150.01 standard shipping must remain $0 (FREE)');
    assertEqual(std.isFree, true);
  });
});

describe('Tier 2 BVA: International Express DHL Discount Threshold ($200 USD)', async () => {
  const { calculateShippingOptions } = await import('../../lib/shipping.ts');

  test('BVA-SHIP-04: Exactly $199.99 subtotal incurs full express rate ($35)', () => {
    const opts = calculateShippingOptions('US', 199.99, 'USD');
    const exp = opts.find((o) => o.id === 'intl_express');
    assertEqual(exp.price, 35, 'At $199.99 express shipping must still be $35');
    assertEqual(exp.originalPrice, undefined);
  });

  test('BVA-SHIP-05: Exactly $200.00 subtotal discounts express shipping to $20', () => {
    const opts = calculateShippingOptions('US', 200.00, 'USD');
    const exp = opts.find((o) => o.id === 'intl_express');
    assertEqual(exp.price, 20, 'At exactly $200.00 express shipping must be discounted to $20');
    assertEqual(exp.originalPrice, 35);
  });

  test('BVA-SHIP-06: Exactly $200.01 subtotal retains discounted express shipping ($20)', () => {
    const opts = calculateShippingOptions('US', 200.01, 'USD');
    const exp = opts.find((o) => o.id === 'intl_express');
    assertEqual(exp.price, 20, 'At $200.01 express shipping must be $20');
  });
});

describe('Tier 2 BVA: Domestic Azerbaijan Rayonlar Threshold (60 ₼ AZN)', async () => {
  const { calculateShippingOptions } = await import('../../lib/shipping.ts');

  test('BVA-SHIP-07: Exactly 59.99 ₼ subtotal incurs 5 ₼ regional shipping', () => {
    const opts = calculateShippingOptions('AZ', 59.99, 'AZN');
    const rayon = opts.find((o) => o.id === 'domestic_region');
    assertEqual(rayon.price, 5, 'At 59.99 ₼ rayon shipping must be 5 ₼');
    assertEqual(rayon.isFree, false);
  });

  test('BVA-SHIP-08: Exactly 60.00 ₼ subtotal transitions to FREE regional shipping (0 ₼)', () => {
    const opts = calculateShippingOptions('AZ', 60.00, 'AZN');
    const rayon = opts.find((o) => o.id === 'domestic_region');
    assertEqual(rayon.price, 0, 'At exactly 60.00 ₼ rayon shipping must be 0 ₼ (FREE)');
    assertEqual(rayon.isFree, true);
  });

  test('BVA-SHIP-09: Exactly 60.01 ₼ subtotal retains FREE regional shipping (0 ₼)', () => {
    const opts = calculateShippingOptions('AZ', 60.01, 'AZN');
    const rayon = opts.find((o) => o.id === 'domestic_region');
    assertEqual(rayon.price, 0);
    assertEqual(rayon.isFree, true);
  });
});

describe('Tier 2 BVA: International AZN Thresholds (250 ₼ and 340 ₼)', async () => {
  const { calculateShippingOptions } = await import('../../lib/shipping.ts');

  test('BVA-SHIP-10: Standard international AZN free transition at 249.99 ₼ vs 250.00 ₼', () => {
    const optsUnder = calculateShippingOptions('TR', 249.99, 'AZN');
    const stdUnder = optsUnder.find((o) => o.id === 'intl_standard');
    assertEqual(stdUnder.price, 25, 'At 249.99 ₼ standard is 25 ₼');

    const optsAt = calculateShippingOptions('TR', 250.00, 'AZN');
    const stdAt = optsAt.find((o) => o.id === 'intl_standard');
    assertEqual(stdAt.price, 0, 'At 250.00 ₼ standard is 0 ₼');
    assertEqual(stdAt.isFree, true);
  });

  test('BVA-SHIP-11: Express international AZN discount transition at 339.99 ₼ vs 340.00 ₼', () => {
    const optsUnder = calculateShippingOptions('TR', 339.99, 'AZN');
    const expUnder = optsUnder.find((o) => o.id === 'intl_express');
    assertEqual(expUnder.price, 60, 'At 339.99 ₼ express is 60 ₼');

    const optsAt = calculateShippingOptions('TR', 340.00, 'AZN');
    const expAt = optsAt.find((o) => o.id === 'intl_express');
    assertEqual(expAt.price, 35, 'At 340.00 ₼ express is discounted to 35 ₼');
  });
});
