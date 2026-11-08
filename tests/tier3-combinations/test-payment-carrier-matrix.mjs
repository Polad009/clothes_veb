/**
 * Tier 3 Combination Tests: Payment Method x Shipping Carrier Pairwise Matrix
 * Covers: Interactions between payment options and destination carriers
 */

import { describe, test } from '../../scripts/run-e2e-tests.mjs';
import { assert, assertEqual, loadTsModule } from '../helpers/test-context.mjs';

describe('Tier 3 Combinations: Payment Method x Carrier Matrix', async () => {
  const { validatePaymentEligibility } = await loadTsModule('lib/payments/provider.ts');

  const readyItems = [{ productId: 'item-1', name: 'Hoodie', type: 'ready', price: 90, quantity: 1 }];

  const testMatrix = [
    // 1. Cash on Delivery
    { method: 'cash_on_delivery', countryCode: 'AZ', carrier: 'domestic_baku_sumgayit', expectedEligible: true },
    { method: 'cash_on_delivery', countryCode: 'AZ', carrier: 'domestic_region', expectedEligible: true },
    { method: 'cash_on_delivery', countryCode: 'US', carrier: 'intl_standard', expectedEligible: false },
    { method: 'cash_on_delivery', countryCode: 'US', carrier: 'intl_express', expectedEligible: false },
    { method: 'cash_on_delivery', countryCode: 'TR', carrier: 'intl_standard', expectedEligible: false },
    { method: 'cash_on_delivery', countryCode: 'GB', carrier: 'intl_express', expectedEligible: false },

    // 2. Card Payments
    { method: 'card', countryCode: 'AZ', carrier: 'domestic_baku_sumgayit', expectedEligible: true },
    { method: 'card', countryCode: 'AZ', carrier: 'domestic_region', expectedEligible: true },
    { method: 'card', countryCode: 'US', carrier: 'intl_standard', expectedEligible: true },
    { method: 'card', countryCode: 'US', carrier: 'intl_express', expectedEligible: true },
    { method: 'card', countryCode: 'TR', carrier: 'intl_standard', expectedEligible: true },
    { method: 'card', countryCode: 'DE', carrier: 'intl_express', expectedEligible: true },

    // 3. Apple Pay
    { method: 'apple_pay', countryCode: 'AZ', carrier: 'domestic_baku_sumgayit', expectedEligible: true },
    { method: 'apple_pay', countryCode: 'US', carrier: 'intl_standard', expectedEligible: true },
    { method: 'apple_pay', countryCode: 'US', carrier: 'intl_express', expectedEligible: true },
    { method: 'apple_pay', countryCode: 'GB', carrier: 'intl_express', expectedEligible: true },

    // 4. Google Pay
    { method: 'google_pay', countryCode: 'AZ', carrier: 'domestic_region', expectedEligible: true },
    { method: 'google_pay', countryCode: 'US', carrier: 'intl_standard', expectedEligible: true },
    { method: 'google_pay', countryCode: 'DE', carrier: 'intl_standard', expectedEligible: true },
    { method: 'google_pay', countryCode: 'AE', carrier: 'intl_express', expectedEligible: true },
  ];

  for (const pair of testMatrix) {
    const label = `${pair.method} + ${pair.carrier} (${pair.countryCode}) -> ${pair.expectedEligible ? 'ELIGIBLE' : 'BLOCKED'}`;
    test(`PAIRWISE: ${label}`, () => {
      const res = validatePaymentEligibility(readyItems, pair.method, { countryCode: pair.countryCode });
      assertEqual(
        res.eligible,
        pair.expectedEligible,
        `Expected eligible=${pair.expectedEligible} for ${pair.method} in ${pair.countryCode}`
      );
    });
  }
});
