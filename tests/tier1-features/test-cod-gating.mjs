/**
 * Tier 1 Feature Tests: Payment Method Gating (COD Restriction)
 * Covers: lib/payments/provider.ts
 */

import { describe, test } from '../../scripts/run-e2e-tests.mjs';
import { assert, assertEqual, assertContains, loadTsModule } from '../helpers/test-context.mjs';

describe('Payment Method Gating & COD Restriction (lib/payments/provider.ts)', async () => {
  const providerModule = await loadTsModule('lib/payments/provider.ts');
  const { validatePaymentEligibility } = providerModule;

  const sampleStandardItems = [
    { productId: 'p1', name: 'Vintage Tee', type: 'ready', price: 65, quantity: 1 },
  ];

  const sampleCustomItems = [
    { productId: 'custom-1', name: 'Custom Studio Tee', type: 'custom', price: 80, quantity: 1 },
  ];

  test('FEAT-SHIP-03.1: Cash on Delivery (COD) is ELIGIBLE for domestic Azerbaijan orders', () => {
    // With customer object having countryCode 'AZ'
    const resultAzCode = validatePaymentEligibility(
      sampleStandardItems,
      'cash_on_delivery',
      { countryCode: 'AZ', country: 'Azərbaycan' }
    );
    assertEqual(resultAzCode.valid, true, 'COD should be valid for AZ countryCode');
    assertEqual(resultAzCode.eligible, true);

    // With country name 'Azərbaycan'
    const resultAzName = validatePaymentEligibility(
      sampleStandardItems,
      'cash_on_delivery',
      { country: 'Azərbaycan' }
    );
    assertEqual(resultAzName.valid, true, 'COD should be valid for country Azərbaycan');
  });

  test('FEAT-SHIP-03.2: Cash on Delivery (COD) is BLOCKED for international destinations (US, TR, GB, DE)', () => {
    const internationalDestinations = [
      { countryCode: 'US', country: 'United States' },
      { countryCode: 'TR', country: 'Turkey' },
      { countryCode: 'GB', country: 'United Kingdom' },
      { countryCode: 'DE', country: 'Germany' },
      { countryCode: 'AE', country: 'United Arab Emirates' },
    ];

    for (const dest of internationalDestinations) {
      const res = validatePaymentEligibility(
        sampleStandardItems,
        'cash_on_delivery',
        dest
      );
      assertEqual(res.valid, false, `COD must be invalid for ${dest.countryCode}`);
      assertEqual(res.eligible, false, `COD must not be eligible for ${dest.countryCode}`);
      assertContains(
        res.reason,
        'yalnız Azərbaycan',
        `Error reason for ${dest.countryCode} must explain Azerbaijan-only restriction`
      );
    }
  });

  test('FEAT-SHIP-03.3: Online Card payments are ELIGIBLE globally (both AZ and International)', () => {
    const resAz = validatePaymentEligibility(
      sampleStandardItems,
      'card',
      { countryCode: 'AZ', country: 'Azerbaijan' }
    );
    assertEqual(resAz.valid, true, 'Card payment must be valid in AZ');

    const resUs = validatePaymentEligibility(
      sampleStandardItems,
      'card',
      { countryCode: 'US', country: 'United States' }
    );
    assertEqual(resUs.valid, true, 'Card payment must be valid in US');

    const resTr = validatePaymentEligibility(
      sampleStandardItems,
      'card',
      { countryCode: 'TR', country: 'Turkey' }
    );
    assertEqual(resTr.valid, true, 'Card payment must be valid in TR');
  });

  test('FEAT-SHIP-03.4: Apple Pay and Google Pay are ELIGIBLE for all international customers', () => {
    const resApplePay = validatePaymentEligibility(
      sampleStandardItems,
      'apple_pay',
      { countryCode: 'GB', country: 'United Kingdom' }
    );
    assertEqual(resApplePay.valid, true, 'Apple Pay must be valid in GB');

    const resGooglePay = validatePaymentEligibility(
      sampleStandardItems,
      'google_pay',
      { countryCode: 'DE', country: 'Germany' }
    );
    assertEqual(resGooglePay.valid, true, 'Google Pay must be valid in DE');
  });

  test('FEAT-SHIP-03.5: Custom POD items block COD even for domestic Azerbaijan orders', () => {
    const resCustomAz = validatePaymentEligibility(
      sampleCustomItems,
      'cash_on_delivery',
      { countryCode: 'AZ', country: 'Azərbaycan' }
    );
    assertEqual(resCustomAz.valid, false, 'Custom items must block COD even in AZ');
    assertContains(resCustomAz.reason, 'Fərdi çap (custom)', 'Reason must cite custom item restriction');
  });

  test('FEAT-SHIP-03.6: Single-argument object signature compatibility', () => {
    const resObj = validatePaymentEligibility({
      items: sampleStandardItems,
      method: 'cash_on_delivery',
      customer: { countryCode: 'US', country: 'United States' },
    });
    assertEqual(resObj.valid, false, 'Object signature must correctly identify US and block COD');
    assertContains(resObj.reason, 'yalnız Azərbaycan');
  });
});
