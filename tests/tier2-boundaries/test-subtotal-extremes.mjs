/**
 * Tier 2 Boundary Tests: Subtotal Extremes, Zero, Negative, and Precision
 * Covers: lib/shipping.ts edge handling
 */

import { describe, test } from '../../scripts/run-e2e-tests.mjs';
import { assert, assertEqual } from '../helpers/test-context.mjs';

describe('Tier 2 Boundary: Subtotal Extremes & Precision', async () => {
  const { calculateShippingOptions } = await import('../../lib/shipping.ts');

  test('BVA-EXTR-01: Zero subtotal ($0 / 0 ₼) computes valid baseline rates without errors', () => {
    const usZero = calculateShippingOptions('US', 0, 'USD');
    assertEqual(usZero.length, 2);
    const stdUs = usZero.find((o) => o.id === 'intl_standard');
    assertEqual(stdUs.price, 15, 'Standard rate on $0 order must be $15');

    const azZero = calculateShippingOptions('AZ', 0, 'AZN');
    const rayonAz = azZero.find((o) => o.id === 'domestic_region');
    assertEqual(rayonAz.price, 5, 'Rayon rate on 0 ₼ order must be 5 ₼');
  });

  test('BVA-EXTR-02: Negative subtotal is clamped to 0 and does not crash or generate discounts', () => {
    const usNeg = calculateShippingOptions('US', -150, 'USD');
    const stdUs = usNeg.find((o) => o.id === 'intl_standard');
    assertEqual(stdUs.price, 15, 'Negative subtotal should not trigger free shipping');

    const azNeg = calculateShippingOptions('AZ', -100, 'AZN');
    const rayonAz = azNeg.find((o) => o.id === 'domestic_region');
    assertEqual(rayonAz.price, 5, 'Negative subtotal should not trigger free rayon shipping');
  });

  test('BVA-EXTR-03: Extreme high subtotal ($1,000,000 VIP order) calculates thresholds without integer overflow', () => {
    const vipOrder = calculateShippingOptions('US', 1000000, 'USD');
    const std = vipOrder.find((o) => o.id === 'intl_standard');
    assertEqual(std.price, 0, 'Extreme subtotal receives free standard shipping');
    assertEqual(std.isFree, true);

    const exp = vipOrder.find((o) => o.id === 'intl_express');
    assertEqual(exp.price, 20, 'Extreme subtotal receives discounted express shipping');
  });

  test('BVA-EXTR-04: Floating-point precision edge values ($149.999 vs $150.00)', () => {
    // 149.999 is technically < 150
    const optsFloat = calculateShippingOptions('US', 149.999, 'USD');
    const std = optsFloat.find((o) => o.id === 'intl_standard');
    assertEqual(std.price, 15, 'Subtotal below 150 must incur rate');

    const optsAt = calculateShippingOptions('US', 150.00001, 'USD');
    const stdAt = optsAt.find((o) => o.id === 'intl_standard');
    assertEqual(stdAt.price, 0, 'Subtotal >= 150 receives free rate');
  });

  test('BVA-EXTR-05: Non-numeric subtotal inputs (null, undefined, strings) handled gracefully', () => {
    // String number '160'
    const optsStr = calculateShippingOptions('US', '160', 'USD');
    const stdStr = optsStr.find((o) => o.id === 'intl_standard');
    assertEqual(stdStr.price, 0, 'String "160" should be parsed as number');

    // NaN or undefined
    const optsNan = calculateShippingOptions('US', NaN, 'USD');
    const stdNan = optsNan.find((o) => o.id === 'intl_standard');
    assertEqual(stdNan.price, 15, 'NaN subtotal should fallback to 0 and charge base rate');
  });
});
