import assert from 'node:assert';
import { calculateShippingOptions, getShippingOptionById, validateShippingRate, isDomesticDestination } from '../../../lib/shipping.ts';
import { getAllCountries, getCountryByCode, formatPhoneWithDialCode, isValidCountry } from '../../../lib/countries.ts';
import { notifyNewOrder } from '../../../lib/notifications/orderNotifier.ts';
import { generateOrderConfirmationHtml, generateStatusUpdateHtml } from '../../../lib/email/emailTemplates.ts';

console.log('--- Starting Milestone 3 Verification Suite ---');

// 1. Countries Catalog in Checkout
console.log('\n[Test Group 1] Countries Catalog & Phone Formatting in Checkout');
const countries = getAllCountries();
assert(countries.length >= 50, 'Catalog should have at least 50 countries');
assert(isValidCountry('AZ'), 'AZ is valid');
assert(isValidCountry('US'), 'US is valid');
assert(isValidCountry('GB'), 'GB is valid');
assert(isValidCountry('TR'), 'TR is valid');

assert.strictEqual(formatPhoneWithDialCode('', 'AZ'), '+994 ');
assert.strictEqual(formatPhoneWithDialCode('501234567', 'AZ'), '+994 501234567');
assert.strictEqual(formatPhoneWithDialCode('5551234', 'US'), '+1 5551234');
assert.strictEqual(formatPhoneWithDialCode('5321234567', 'TR'), '+90 5321234567');
console.log('✓ Group 1 passed successfully');

// 2. Dynamic Shipping Rate Calculations for Checkout UI
console.log('\n[Test Group 2] Checkout Shipping Calculation & Options');
// Domestic Baku
const azOptions = calculateShippingOptions('AZ', 40, 'AZN');
assert.strictEqual(azOptions.length, 2);
assert.strictEqual(azOptions[0].id, 'domestic_baku_sumgayit');
assert.strictEqual(azOptions[0].price, 0);
assert.strictEqual(azOptions[1].id, 'domestic_region');
assert.strictEqual(azOptions[1].price, 5); // < 60 AZN

// Domestic Region >= 60 AZN
const azOptionsHigh = calculateShippingOptions('AZ', 75, 'AZN');
assert.strictEqual(azOptionsHigh[1].price, 0); // Free >= 60 AZN

// International USD (< $150)
const usOptions = calculateShippingOptions('US', 100, 'USD');
assert.strictEqual(usOptions.length, 2);
assert.strictEqual(usOptions[0].id, 'intl_standard');
assert.strictEqual(usOptions[0].price, 15);
assert.strictEqual(usOptions[1].id, 'intl_express');
assert.strictEqual(usOptions[1].price, 35);

// International USD (>= $150, < $200)
const usOptions150 = calculateShippingOptions('US', 160, 'USD');
assert.strictEqual(usOptions150[0].price, 0); // Free standard >= $150
assert.strictEqual(usOptions150[1].price, 35);

// International USD (>= $200)
const usOptions200 = calculateShippingOptions('US', 220, 'USD');
assert.strictEqual(usOptions200[0].price, 0); // Free standard
assert.strictEqual(usOptions200[1].price, 20); // Discounted express to $20

// International AZN (< 250 AZN)
const intlAzn = calculateShippingOptions('TR', 200, 'AZN');
assert.strictEqual(intlAzn[0].price, 25);
assert.strictEqual(intlAzn[1].price, 60);

// International AZN (>= 340 AZN)
const intlAzn340 = calculateShippingOptions('DE', 350, 'AZN');
assert.strictEqual(intlAzn340[0].price, 0);
assert.strictEqual(intlAzn340[1].price, 35);
console.log('✓ Group 2 passed successfully');

// 3. Server Shipping Validation & Anti-Tamper Guard
console.log('\n[Test Group 3] Server Shipping Rate Validation & Anti-Tampering');
// Valid claimed rate
const validRes = validateShippingRate('US', 100, 'USD', 'intl_standard', 15);
assert.strictEqual(validRes.valid, true);
assert.strictEqual(validRes.expectedRate, 15);

// Tampered claimed rate ($0 instead of $15)
const tamperedRes = validateShippingRate('US', 100, 'USD', 'intl_standard', 0);
assert.strictEqual(tamperedRes.valid, false);
assert.strictEqual(tamperedRes.expectedRate, 15);

// Valid free standard
const freeStandardRes = validateShippingRate('US', 160, 'USD', 'intl_standard', 0);
assert.strictEqual(freeStandardRes.valid, true);
assert.strictEqual(freeStandardRes.expectedRate, 0);

// Tampered claimed rate ($10 instead of $20 express)
const tamperedExpress = validateShippingRate('US', 220, 'USD', 'intl_express', 10);
assert.strictEqual(tamperedExpress.valid, false);
assert.strictEqual(tamperedExpress.expectedRate, 20);
console.log('✓ Group 3 passed successfully');

// 4. Notifications & Email Formatting
console.log('\n[Test Group 4] International Order Notifications & Email Templates');
const mockOrder = {
  id: 'VTX-ORD-9999',
  date: new Date().toISOString(),
  customer: {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+1 555 987 6543',
    address: '742 Evergreen Terrace',
    addressLine2: 'Apt 2B',
    city: 'Springfield',
    stateOrRegion: 'Oregon',
    postalCode: '97477',
    country: 'United States',
    countryCode: 'US',
  },
  items: [
    { name: 'Oversized Wool Coat', price: 220, quantity: 1, size: 'M', color: 'Black' }
  ],
  paymentMethod: 'Bank Kartı (Visa/Mastercard)',
  paymentStatus: 'paid',
  orderStatus: 'Yeni Sifariş',
  subtotal: 220,
  shipping: 20,
  shippingMethod: 'intl_express',
  shippingMethodLabel: 'DHL Express Worldwide / FedEx Priority',
  estimatedDelivery: '2-5 business days',
  discount: 0,
  total: 240,
  currency: 'USD',
};

const confirmationHtml = generateOrderConfirmationHtml(mockOrder);
assert(confirmationHtml.includes('Jane Doe'), 'Includes customer name');
assert(confirmationHtml.includes('742 Evergreen Terrace'), 'Includes address line 1');
assert(confirmationHtml.includes('Apt 2B'), 'Includes address line 2');
assert(confirmationHtml.includes('Springfield'), 'Includes city');
assert(confirmationHtml.includes('Oregon'), 'Includes state');
assert(confirmationHtml.includes('97477'), 'Includes postal code');
assert(confirmationHtml.includes('United States'), 'Includes country');
assert(confirmationHtml.includes('DHL Express Worldwide'), 'Includes carrier label');
assert(confirmationHtml.includes('$240.00'), 'Includes USD total formatted');

const statusHtml = generateStatusUpdateHtml(mockOrder, 'Kuryerdə');
assert(statusHtml.includes('Kuryerdə'), 'Includes new status');
assert(statusHtml.includes('DHL Express Worldwide'), 'Includes carrier info');
console.log('✓ Group 4 passed successfully');

console.log('\n--- ALL MILESTONE 3 TESTS PASSED PERFECTLY ---');
