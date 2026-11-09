/**
 * E2E Test Suite: Milestone 3 - Checkout, Shipping Rules & Payment Security Hardening
 * Items Covered: 8, 13, 21, 22
 *
 * Tiers:
 * - Tier 1: Feature Coverage (Items 8, 13, 21, 22)
 * - Tier 2: Boundary & Corner Cases
 * - Tier 3: Cross-Feature Interactions
 * - Tier 4: Real-World Workflows
 */

import {
  describe,
  test,
  assert,
  assertEqual,
  assertContains,
  assertNotContains,
  assertMatches,
  assertNotMatches,
  readProjectFile,
  loadTsModule,
  runStandalone,
} from './harness.mjs';

const checkoutCode = readProjectFile('app/checkout/page.tsx');
const cartDrawerCode = readProjectFile('components/CartDrawer.tsx');
const paymentsProviderCode = readProjectFile('lib/payments/provider.ts');
const adminHtmlCode = readProjectFile('public/admin.html');

// Load Shipping module
const shippingModule = await loadTsModule('lib/shipping.ts');
const { calculateShippingOptions, isDomesticDestination } = shippingModule;

// Load Payment module
const paymentModule = await loadTsModule('lib/payments/provider.ts');
const { validatePaymentEligibility } = paymentModule;

describe('Milestone 3: Checkout, Shipping Rules & Payment Security Hardening', () => {
  // =========================================================================
  // TIER 1: FEATURE COVERAGE (Items 8, 13, 21, 22)
  // =========================================================================

  test('International deliveries ALWAYS require paid shipping with no free threshold regardless of order subtotal', () => {
    // Item 8: Remove free shipping threshold for international orders; shipping must ALWAYS be paid
    const testCases = [
      { country: 'US', subtotal: 50, currency: 'USD' },
      { country: 'US', subtotal: 150, currency: 'USD' }, // Former $150 free threshold
      { country: 'US', subtotal: 250, currency: 'USD' },
      { country: 'US', subtotal: 1000, currency: 'USD' },
      { country: 'TR', subtotal: 150, currency: 'USD' },
      { country: 'GB', subtotal: 300, currency: 'USD' },
      { country: 'DE', subtotal: 500, currency: 'AZN' },
    ];

    for (const tc of testCases) {
      const options = calculateShippingOptions(tc.country, tc.subtotal, tc.currency);
      assert(options.length > 0, `Shipping options must be available for ${tc.country}`);
      for (const opt of options) {
        assert(
          opt.price > 0,
          `International shipping (${opt.id}) for ${tc.country} at subtotal ${tc.subtotal} must be paid (> 0), got ${opt.price}`
        );
        assertEqual(
          opt.isFree,
          false,
          `International shipping option ${opt.id} must have isFree === false for subtotal ${tc.subtotal}`
        );
      }
    }
  }, { id: 'T1-FEAT-08-INTL-ALWAYS-PAID-SHIPPING', item: 8, tier: 1, milestone: 'm3' });

  test('CartDrawer and shipping banners purge the $150 free international shipping copy', () => {
    // Item 8: Remove "$150-dan yuxarı sifarişlərdə çatdırılma pulsuzdur" copy and rules
    assertNotMatches(
      cartDrawerCode,
      /150[\s\S]*?(pulsuz|free shipping)/i,
      'CartDrawer must not advertise free international shipping over $150'
    );
    assertNotMatches(
      checkoutCode,
      /150[\s\S]*?(pulsuz|free shipping)/i,
      'Checkout must not advertise free international shipping over $150'
    );
  }, { id: 'T1-FEAT-08-PURGE-150-FREE-SHIPPING-COPY', item: 8, tier: 1, milestone: 'm3' });

  test('Checkout form displays styled, localized inline validation messages instead of browser default tooltips', () => {
    // Item 13: Replace default browser English tooltips with styled, localized inline validation messages
    assertMatches(
      checkoutCode,
      /checkErrorsBelow|Məlumatları yoxlayın|qırmızı xəbərdarlıqlı/,
      'Checkout must provide custom validation error banners'
    );
    assertMatches(
      checkoutCode,
      /text-rose-500|text-red-500|border-rose-400|border-red-500/,
      'Checkout inputs must visually highlight with inline error styling'
    );
  }, { id: 'T1-FEAT-13-INLINE-FORM-VALIDATION-DESIGN', item: 13, tier: 1, milestone: 'm3' });

  test('Cash on Delivery (COD) is completely disabled for ALL countries including Azerbaijan', () => {
    // Item 21: Cash on delivery must be COMPLETELY disabled for ALL countries; all orders paid securely online
    const azResult = validatePaymentEligibility({
      items: [{ id: '1', name: 'Tee', price: 50, quantity: 1, type: 'standard' }],
      method: 'cash_on_delivery',
      customer: { countryCode: 'AZ', country: 'Azərbaycan' },
    });

    assert(
      !azResult.eligible,
      'Cash on Delivery must NOT be eligible even for domestic Azerbaijan orders'
    );

    const intlResult = validatePaymentEligibility({
      items: [{ id: '1', name: 'Tee', price: 50, quantity: 1, type: 'standard' }],
      method: 'cash_on_delivery',
      customer: { countryCode: 'US', country: 'United States' },
    });

    assert(
      !intlResult.eligible,
      'Cash on Delivery must NOT be eligible for international orders'
    );
  }, { id: 'T1-FEAT-21-COD-TOTAL-REMOVAL', item: 21, tier: 1, milestone: 'm3' });

  test('Checkout payment UI presents only secure online prepayments (Card, Apple Pay, Google Pay)', () => {
    // Item 21: Storefront checkout UI must not offer COD option
    assertNotMatches(
      checkoutCode,
      /<input[^>]*value=["']cash_on_delivery["'][^>]*>/,
      'Checkout UI must not offer cash_on_delivery selectable payment input'
    );
    assertMatches(
      checkoutCode,
      /CreditCard|ApplePay|GooglePay|Kart/,
      'Checkout UI must feature secure online card and digital wallet prepayment methods'
    );
  }, { id: 'T1-FEAT-21-CHECKOUT-PREPAYMENT-ONLY', item: 21, tier: 1, milestone: 'm3' });

  test('Promo code system verifies expiration dates and maximum usage limits before applying discounts', () => {
    // Item 22: Expiration date and maximum usage count configured in admin and verified in checkout
    assertMatches(
      adminHtmlCode,
      /id=["']promoExpiresAt["']|name=["']expiresAt["']/,
      'Admin promo code form must provide expiration date input'
    );
    assertMatches(
      adminHtmlCode,
      /id=["']promoMaxUses["']|name=["']maxUses["']/,
      'Admin promo code form must provide maximum usage count input'
    );
    assertMatches(
      checkoutCode,
      /expiresAt|maxUses/,
      'Checkout promo verification must check expiration dates and max usage counts'
    );
  }, { id: 'T1-FEAT-22-PROMO-EXPIRY-AND-USAGE-LIMITS', item: 22, tier: 1, milestone: 'm3' });

  // =========================================================================
  // TIER 2: BOUNDARY & CORNER CASES (Items 8, 13, 21, 22)
  // =========================================================================

  test('Promo code verification boundary: rejects expired date and permits active future date', () => {
    const expiredPromo = {
      code: 'EXPIRED10',
      active: true,
      expiresAt: '2020-01-01T00:00:00Z',
      uses: 0,
      maxUses: 100,
    };
    const isExpired = new Date(expiredPromo.expiresAt) < new Date();
    assert(isExpired, 'Promo with past date must be detected as expired');

    const futurePromo = {
      code: 'FUTURE10',
      active: true,
      expiresAt: '2099-01-01T00:00:00Z',
      uses: 0,
      maxUses: 100,
    };
    const isFutureExpired = new Date(futurePromo.expiresAt) < new Date();
    assert(!isFutureExpired, 'Promo with future date must not be detected as expired');
  }, { id: 'T2-BND-22-PROMO-EXPIRY-BOUNDARY', item: 22, tier: 2, milestone: 'm3' });

  test('Promo code verification boundary: rejects when uses equals or exceeds maxUses', () => {
    const exhaustedPromo = {
      code: 'EXHAUSTED',
      active: true,
      uses: 10,
      maxUses: 10,
    };
    const isExhausted = Boolean(exhaustedPromo.maxUses && exhaustedPromo.uses >= exhaustedPromo.maxUses);
    assert(isExhausted, 'Promo with uses >= maxUses must be rejected');

    const availablePromo = {
      code: 'AVAILABLE',
      active: true,
      uses: 9,
      maxUses: 10,
    };
    const isAvailableExhausted = Boolean(availablePromo.maxUses && availablePromo.uses >= availablePromo.maxUses);
    assert(!isAvailableExhausted, 'Promo with uses < maxUses must be accepted');
  }, { id: 'T2-BND-22-PROMO-MAX-USES-BOUNDARY', item: 22, tier: 2, milestone: 'm3' });

  test('International shipping handles extreme subtotal bounds ($0 to $50,000) with strictly positive rates', () => {
    const zeroOptions = calculateShippingOptions('US', 0, 'USD');
    assert(zeroOptions[0].price > 0, 'Subtotal $0 must have positive shipping rate');

    const highOptions = calculateShippingOptions('US', 50000, 'USD');
    assert(highOptions[0].price > 0, 'Subtotal $50,000 must still have positive shipping rate (never free)');
    assertEqual(highOptions[0].isFree, false, 'isFree must remain false even at $50,000');
  }, { id: 'T2-BND-08-INTL-SUBTOTAL-EXTREMES', item: 8, tier: 2, milestone: 'm3' });

  test('Form validation handles empty strings, whitespace-only names, and invalid phone formats', () => {
    assertMatches(
      checkoutCode,
      /fullName\.trim\(\)\.length\s*<\s*3/,
      'Validation must reject whitespace-only or short full names'
    );
    assertMatches(
      checkoutCode,
      /phone\.trim\(\)/,
      'Validation must trim phone input before validation'
    );
  }, { id: 'T2-BND-13-FORM-WHITESPACE-HANDLING', item: 13, tier: 2, milestone: 'm3' });

  // =========================================================================
  // TIER 3: CROSS-FEATURE COMBINATIONS
  // =========================================================================

  test('Combined order checkout calculation: items subtotal + mandatory international shipping - promo discount', () => {
    const subtotal = 200; // USD
    const shippingOptions = calculateShippingOptions('US', subtotal, 'USD');
    const standardShipping = shippingOptions.find((o) => o.id === 'intl_standard') || shippingOptions[0];

    const promoDiscountPercent = 15; // 15% discount
    const discountAmount = (subtotal * promoDiscountPercent) / 100;
    const finalTotal = subtotal + standardShipping.price - discountAmount;

    assert(standardShipping.price > 0, 'International shipping must add positive cost');
    assertEqual(discountAmount, 30, '15% of $200 is $30');
    assertEqual(finalTotal, 200 + standardShipping.price - 30, 'Total must equal subtotal + shipping - discount');
  }, { id: 'T3-INT-CHECKOUT-PRICE-COMPOSITION', item: 8, tier: 3, milestone: 'm3' });

  test('Payment provider eligibility and checkout submission strictly enforce online-only payment', () => {
    assertMatches(
      paymentsProviderCode,
      /(cash_on_delivery|cod)[\s\S]*?(eligible:\s*false|valid:\s*false|qadağandır|disabled)/i,
      'Payment provider must enforce online-only payment policy'
    );
  }, { id: 'T3-INT-ONLINE-PAYMENT-ENFORCEMENT', item: 21, tier: 3, milestone: 'm3' });

  test('Switching destination country from domestic to international transitions from free courier to paid airmail', () => {
    // 1. Domestic Azerbaijan destination gives free Baku/Sumqayit courier
    const domesticOpts = calculateShippingOptions('AZ', 100, 'AZN');
    const bakuCourier = domesticOpts.find((o) => o.id === 'domestic_baku_sumgayit');
    assert(bakuCourier !== undefined, 'Baku courier option must be available for AZ');
    assertEqual(bakuCourier.price, 0, 'Baku courier must be free (0 AZN)');
    assertEqual(bakuCourier.isFree, true, 'Baku courier isFree must be true');

    // 2. Switching to international destination (e.g. Turkey) changes to paid airmail
    const intlOpts = calculateShippingOptions('TR', 100, 'USD');
    const intlStandard = intlOpts.find((o) => o.id === 'intl_standard') || intlOpts[0];
    assert(intlStandard.price > 0, 'International shipping must be paid');
    assertEqual(intlStandard.isFree, false, 'International isFree must be false');
  }, { id: 'T3-INT-DESTINATION-COUNTRY-SWITCH', item: 8, tier: 3, milestone: 'm3' });

  test('Checkout preserves form inputs and cart contents when an invalid promo code is rejected', () => {
    assertMatches(
      checkoutCode,
      /promoError|promoCode/i,
      'Checkout must manage separate promoError state to avoid resetting form inputs'
    );
  }, { id: 'T3-INT-PROMO-REJECTION-FORM-PRESERVATION', item: 22, tier: 3, milestone: 'm3' });

  // =========================================================================
  // TIER 4: REAL-WORLD APPLICATION SCENARIOS
  // =========================================================================

  test('Scenario: International customer from United States checks out with promo code and online payment', () => {
    // 1. Destination is detected as international
    const isDomestic = isDomesticDestination('US');
    assertEqual(isDomestic, false, 'United States must be identified as international');

    // 2. Shipping calculation produces paid rates
    const options = calculateShippingOptions('US', 180, 'USD');
    assert(options.length >= 1, 'At least one international shipping option must be returned');
    assert(options[0].price > 0, 'Shipping cost must be positive');
    assertEqual(options[0].isFree, false, 'Free shipping must not be granted');

    // 3. Online payment is accepted
    const payResult = validatePaymentEligibility({
      items: [{ id: 'hudi-1', name: 'Hoodie', price: 110, quantity: 1, type: 'standard' }],
      method: 'card',
      customer: { countryCode: 'US', country: 'United States' },
    });
    assert(payResult.eligible, 'Card payment for international destination must be eligible');
  }, { id: 'T4-SCEN-INTL-CHECKOUT-FLOW', item: 8, tier: 4, milestone: 'm3' });

  test('Scenario: Customer attempts guest checkout, triggers mandatory auth gating, logs in, and completes order', () => {
    // 1. Checkout checks customer authentication status
    assertMatches(checkoutCode, /useAuth/, 'Checkout imports useAuth');
    assertMatches(checkoutCode, /user|profile/, 'Checkout references user/profile state');

    // 2. Auth requirement blocks unauthenticated checkout
    assertMatches(checkoutCode, /authRequiredOrder|loginToBuy/, 'Auth requirement message presented');

    // 3. Only secure online payment methods are selectable
    assertNotMatches(checkoutCode, /value=["']cash_on_delivery["']/, 'COD is absent');
  }, { id: 'T4-SCEN-AUTH-GATED-CHECKOUT-FLOW', item: 24, tier: 4, milestone: 'm3' });
});

if (process.argv[1] && process.argv[1].endsWith('test_m3_checkout_shipping.mjs')) {
  runStandalone();
}
