import assert from 'node:assert';
import {
  getAllCountries,
  getCountryByCode,
  isValidCountry,
  formatPhoneWithDialCode,
  searchCountries,
} from '../../../lib/countries.ts';
import {
  calculateShippingOptions,
  getShippingOptionById,
  validateShippingRate,
  isDomesticDestination,
} from '../../../lib/shipping.ts';
import {
  validatePaymentEligibility,
  MockPaymentProvider,
} from '../../../lib/payments/provider.ts';

console.log('--- Starting Milestone 2 Verification Suite ---');

// 1. Countries tests
console.log('[Test Group 1] Countries Catalog & Helpers');
const allCountries = getAllCountries();
assert(allCountries.length >= 50, `Expected at least 50 countries, found ${allCountries.length}`);

const az = getCountryByCode('AZ');
assert(az, 'Azerbaijan not found');
assert.strictEqual(az.dialCode, '+994');
assert.strictEqual(az.requiresPostalCode, false);
assert.strictEqual(az.requiresState, false);

const us = getCountryByCode('us');
assert(us, 'United States not found with lowercase code');
assert.strictEqual(us.dialCode, '+1');
assert.strictEqual(us.requiresPostalCode, true);
assert.strictEqual(us.requiresState, true);

const uk = getCountryByCode('UK');
assert(uk, 'UK alias not found');
assert.strictEqual(uk.code, 'GB');
assert.strictEqual(uk.dialCode, '+44');

assert(isValidCountry('AZ'));
assert(isValidCountry('TR'));
assert(isValidCountry('DE'));
assert(!isValidCountry('NON_EXISTENT'));

assert.strictEqual(formatPhoneWithDialCode('+994 50 123 45 67', 'AZ'), '+994 50 123 45 67');
assert.strictEqual(formatPhoneWithDialCode('050 123 45 67', 'AZ'), '+994 50 123 45 67');
assert.strictEqual(formatPhoneWithDialCode('50 123 45 67', 'AZ'), '+994 50 123 45 67');
assert.strictEqual(formatPhoneWithDialCode('2025550143', 'US'), '+1 2025550143');

const searchResults = searchCountries('united');
assert(searchResults.some((c) => c.code === 'US'), 'Search for united should find US');
assert(searchResults.some((c) => c.code === 'GB'), 'Search for united should find GB');
assert(searchResults.some((c) => c.code === 'AE'), 'Search for united should find AE');
console.log('✓ Group 1 passed successfully');

// 2. Shipping tests
console.log('[Test Group 2] Domestic Azerbaijan Shipping Rates');
assert(isDomesticDestination('AZ'));
assert(isDomesticDestination('AZE'));
assert(isDomesticDestination('Azərbaycan'));
assert(!isDomesticDestination('US'));
assert(!isDomesticDestination('TR'));

// Domestic under 60 AZN
const azDomesticLow = calculateShippingOptions('AZ', 30, 'AZN');
assert.strictEqual(azDomesticLow.length, 2);
const bakuLow = azDomesticLow.find((o) => o.id === 'domestic_baku_sumgayit');
const regionLow = azDomesticLow.find((o) => o.id === 'domestic_region');
assert(bakuLow && bakuLow.price === 0 && bakuLow.isFree === true);
assert(regionLow && regionLow.price === 5 && regionLow.isFree === false);

// Domestic >= 60 AZN
const azDomesticHigh = calculateShippingOptions('AZ', 60, 'AZN');
const regionHigh = azDomesticHigh.find((o) => o.id === 'domestic_region');
assert(regionHigh && regionHigh.price === 0 && regionHigh.isFree === true);

console.log('[Test Group 3] International Rates (USD)');
// Standard < 150 USD, Express < 200 USD
const intlUsdLow = calculateShippingOptions('US', 100, 'USD');
const stdLow = intlUsdLow.find((o) => o.id === 'intl_standard');
const expLow = intlUsdLow.find((o) => o.id === 'intl_express');
assert(stdLow && stdLow.price === 15 && stdLow.isFree === false);
assert(expLow && expLow.price === 35 && expLow.isFree === false);

// Standard >= 150 USD, Express < 200 USD
const intlUsdMid = calculateShippingOptions('US', 150, 'USD');
const stdMid = intlUsdMid.find((o) => o.id === 'intl_standard');
const expMid = intlUsdMid.find((o) => o.id === 'intl_express');
assert(stdMid && stdMid.price === 0 && stdMid.isFree === true);
assert(expMid && expMid.price === 35 && expMid.isFree === false);

// Standard >= 150 USD, Express >= 200 USD
const intlUsdHigh = calculateShippingOptions('US', 200, 'USD');
const stdHigh = intlUsdHigh.find((o) => o.id === 'intl_standard');
const expHigh = intlUsdHigh.find((o) => o.id === 'intl_express');
assert(stdHigh && stdHigh.price === 0 && stdHigh.isFree === true);
assert(expHigh && expHigh.price === 20 && expHigh.isFree === false && expHigh.originalPrice === 35);

console.log('[Test Group 4] International Rates (AZN)');
// Standard < 250 AZN, Express < 340 AZN
const intlAznLow = calculateShippingOptions('TR', 100, 'AZN');
assert.strictEqual(intlAznLow.find((o) => o.id === 'intl_standard').price, 25);
assert.strictEqual(intlAznLow.find((o) => o.id === 'intl_express').price, 60);

// Standard >= 250 AZN
const intlAznMid = calculateShippingOptions('TR', 250, 'AZN');
assert.strictEqual(intlAznMid.find((o) => o.id === 'intl_standard').price, 0);
assert.strictEqual(intlAznMid.find((o) => o.id === 'intl_standard').isFree, true);
assert.strictEqual(intlAznMid.find((o) => o.id === 'intl_express').price, 60);

// Express >= 340 AZN
const intlAznHigh = calculateShippingOptions('TR', 340, 'AZN');
assert.strictEqual(intlAznHigh.find((o) => o.id === 'intl_express').price, 35);

console.log('[Test Group 5] Shipping Option by ID and Aliases');
assert.strictEqual(getShippingOptionById('AZ', 20, 'AZN', 'domestic_baku_sumgayit').price, 0);
assert.strictEqual(getShippingOptionById('AZ', 20, 'AZN', 'domestic_free').price, 0);
assert.strictEqual(getShippingOptionById('AZ', 20, 'AZN', 'baku').price, 0);
assert.strictEqual(getShippingOptionById('AZ', 20, 'AZN', 'domestic_region').price, 5);
assert.strictEqual(getShippingOptionById('AZ', 20, 'AZN', 'region').price, 5);

assert.strictEqual(getShippingOptionById('US', 100, 'USD', 'intl_standard').price, 15);
assert.strictEqual(getShippingOptionById('US', 100, 'USD', 'standard').price, 15);
assert.strictEqual(getShippingOptionById('US', 100, 'USD', 'intl_express').price, 35);
assert.strictEqual(getShippingOptionById('US', 100, 'USD', 'express').price, 35);
assert.strictEqual(getShippingOptionById('US', 100, 'USD', 'dhl').price, 35);

console.log('[Test Group 6] Shipping Rate Validation');
const valPass = validateShippingRate('US', 100, 'USD', 'intl_standard', 15);
assert.strictEqual(valPass.valid, true);
assert.strictEqual(valPass.expectedRate, 15);

const valFail = validateShippingRate('US', 100, 'USD', 'intl_standard', 0);
assert.strictEqual(valFail.valid, false);
assert.strictEqual(valFail.expectedRate, 15);

console.log('✓ Shipping groups 2-6 passed successfully');

// 3. Payment eligibility & COD restriction tests
console.log('[Test Group 7] Payment Eligibility & COD Gating');
const readyItems = [{ id: '1', name: 'T-shirt', price: 45, quantity: 1, type: 'ready' }];
const customItems = [{ id: '2', name: 'Custom Hoodie', price: 85, quantity: 1, type: 'custom' }];

// Domestic AZ COD with ready items -> valid
const azCodReady = validatePaymentEligibility(readyItems, 'cash_on_delivery', {
  country: 'Azərbaycan',
  countryCode: 'AZ',
});
assert.strictEqual(azCodReady.valid, true);
assert.strictEqual(azCodReady.eligible, true);

// International US COD with ready items -> rejected
const usCodReady = validatePaymentEligibility(readyItems, 'cash_on_delivery', {
  country: 'United States',
  countryCode: 'US',
});
assert.strictEqual(usCodReady.valid, false);
assert.strictEqual(usCodReady.eligible, false);
assert(usCodReady.reason.includes('Nağd ödəniş (COD) yalnız Azərbaycan daxili sifarişlər'));

// International TR COD with countryCode 'TR' -> rejected
const trCodReady = validatePaymentEligibility(readyItems, 'cash_on_delivery', { countryCode: 'TR' });
assert.strictEqual(trCodReady.valid, false);
assert.strictEqual(trCodReady.eligible, false);

// International US Card payment -> valid
const usCard = validatePaymentEligibility(readyItems, 'card', { countryCode: 'US' });
assert.strictEqual(usCard.valid, true);
assert.strictEqual(usCard.eligible, true);

// Domestic AZ COD with custom items -> rejected for custom reason
const azCodCustom = validatePaymentEligibility(customItems, 'cash_on_delivery', { countryCode: 'AZ' });
assert.strictEqual(azCodCustom.valid, false);
assert.strictEqual(azCodCustom.eligible, false);
assert(azCodCustom.reason.includes('Fərdi çap (custom)'));

// Pluggable provider test
const provider = new MockPaymentProvider();
const reqFail = {
  orderId: 'ord_123',
  amount: 45,
  currency: 'USD',
  method: 'cash_on_delivery',
  items: readyItems,
  customer: {
    fullName: 'John Doe',
    phone: '+1 202 555 0143',
    email: 'john@example.com',
    address: '123 Main St',
    city: 'New York',
    country: 'United States',
    countryCode: 'US',
  },
};
const resFail = await provider.createPayment(reqFail);
assert.strictEqual(resFail.success, false);
assert.strictEqual(resFail.status, 'failed');
assert(resFail.message.includes('Nağd ödəniş (COD) yalnız Azərbaycan daxili sifarişlər'));

const reqPass = {
  ...reqFail,
  method: 'card',
};
const resPass = await provider.createPayment(reqPass);
assert.strictEqual(resPass.success, true);
assert.strictEqual(resPass.status, 'test_paid');

console.log('✓ Group 7 passed successfully');
console.log('--- ALL MILESTONE 2 TESTS PASSED PERFECTLY ---');
