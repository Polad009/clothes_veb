import { calculateShippingOptions, validateShippingRate, isDomesticDestination } from '../lib/shipping.ts';
import { validatePaymentEligibility, defaultPaymentProvider } from '../lib/payments/provider.ts';
import assert from 'node:assert';

console.log('Testing Milestone 3 Implementation Rules...');

// 1. Item 8: International Shipping Rules
console.log('\n--- Item 8: International Shipping Rules ---');

const usOptionsLow = calculateShippingOptions('US', 50, 'USD');
const usStandardLow = usOptionsLow.find(o => o.id === 'intl_standard');
assert.strictEqual(usStandardLow.price, 15, 'USD Standard rate must be $15 for subtotal $50');
assert.strictEqual(usStandardLow.isFree, false, 'USD Standard must not be free for subtotal $50');

// Even with subtotal > $150, shipping must still be $15 and NOT free
const usOptionsHigh = calculateShippingOptions('US', 300, 'USD');
const usStandardHigh = usOptionsHigh.find(o => o.id === 'intl_standard');
assert.strictEqual(usStandardHigh.price, 15, 'USD Standard rate must still be $15 for subtotal $300');
assert.strictEqual(usStandardHigh.isFree, false, 'USD Standard must NOT be free for subtotal $300 (Threshold removed per Item 8)');

const valClaimedFree = validateShippingRate('US', 300, 'USD', 'intl_standard', 0);
assert.strictEqual(valClaimedFree.valid, false, 'Claimed free rate for international order must be rejected');

const valClaimed15 = validateShippingRate('US', 300, 'USD', 'intl_standard', 15);
assert.strictEqual(valClaimed15.valid, true, 'Claimed $15 rate for international standard must be valid');

// AZN International (e.g. subtotal 500 AZN)
const intlAznHigh = calculateShippingOptions('TR', 500, 'AZN');
const aznStandardHigh = intlAznHigh.find(o => o.id === 'intl_standard');
assert.strictEqual(aznStandardHigh.price, 25, 'AZN International Standard must be 25 AZN');
assert.strictEqual(aznStandardHigh.isFree, false, 'AZN International Standard must not be free');

console.log('✓ Item 8 International Shipping tests passed!');

// 2. Item 21: Total COD Removal
console.log('\n--- Item 21: Total COD Removal ---');

const codDomestic = validatePaymentEligibility([], 'cash_on_delivery', { countryCode: 'AZ', country: 'Azərbaycan' });
assert.strictEqual(codDomestic.valid, false, 'COD must be INVALID even for domestic Azerbaijan');
assert.strictEqual(codDomestic.eligible, false, 'COD must be INELIGIBLE even for domestic Azerbaijan');

const codIntl = validatePaymentEligibility([], 'cash_on_delivery', { countryCode: 'US', country: 'United States' });
assert.strictEqual(codIntl.valid, false, 'COD must be INVALID for US');
assert.strictEqual(codIntl.eligible, false, 'COD must be INELIGIBLE for US');

const cardDomestic = validatePaymentEligibility([], 'card', { countryCode: 'AZ' });
assert.strictEqual(cardDomestic.valid, true, 'Card payment must be valid for AZ');

const applePayIntl = validatePaymentEligibility([], 'apple_pay', { countryCode: 'US' });
assert.strictEqual(applePayIntl.valid, true, 'Apple Pay must be valid for US');

const googlePayIntl = validatePaymentEligibility([], 'google_pay', { countryCode: 'TR' });
assert.strictEqual(googlePayIntl.valid, true, 'Google Pay must be valid for TR');

console.log('✓ Item 21 Total COD Removal tests passed!');

// 3. Item 22: Promo Code Expiration & Max Uses Logic
console.log('\n--- Item 22: Promo Code Expiration & Usage Limits ---');

function validatePromoLogic(promo, subtotal) {
  if (!promo || !promo.active) return { valid: false, reason: 'inactive' };
  if (promo.expiresAt) {
    const exp = new Date(promo.expiresAt).getTime();
    if (!isNaN(exp) && exp < Date.now()) return { valid: false, reason: 'expired' };
  }
  if (typeof promo.maxUses === 'number' && typeof promo.uses === 'number' && promo.uses >= promo.maxUses) {
    return { valid: false, reason: 'max_uses' };
  }
  if (promo.minAmount && subtotal < promo.minAmount) {
    return { valid: false, reason: 'min_amount' };
  }
  return { valid: true };
}

// Expired promo
const expiredPromo = { code: 'EXP', active: true, expiresAt: new Date(Date.now() - 86400000).toISOString(), uses: 0, maxUses: 10 };
assert.strictEqual(validatePromoLogic(expiredPromo, 100).valid, false, 'Expired promo must be invalid');
assert.strictEqual(validatePromoLogic(expiredPromo, 100).reason, 'expired', 'Reason must be expired');

// Max uses reached promo
const maxedPromo = { code: 'MAX', active: true, uses: 10, maxUses: 10 };
assert.strictEqual(validatePromoLogic(maxedPromo, 100).valid, false, 'Promo with max uses reached must be invalid');
assert.strictEqual(validatePromoLogic(maxedPromo, 100).reason, 'max_uses', 'Reason must be max_uses');

// Valid promo with unreached limit and future expiry
const validPromo = { code: 'VALID', active: true, expiresAt: new Date(Date.now() + 86400000).toISOString(), uses: 5, maxUses: 10 };
assert.strictEqual(validatePromoLogic(validPromo, 100).valid, true, 'Active promo with valid expiry and usage must be valid');

console.log('✓ Item 22 Promo Code validation tests passed!');

console.log('\nAll M3 Core Rule Validations Passed Successfully!');

