#!/usr/bin/env node

/**
 * Challenger 2 Adversarial Challenge & Stress Test Suite
 * Focus: International Shipping, Checkout & Anti-Tampering Hardening
 *
 * Suites:
 * 1. Shipping Fee Manipulation & Anti-Tampering (Server-Authoritative Recalculation)
 * 2. Cash on Delivery (COD) Gating Bypass & Restriction Testing
 * 3. Threshold Boundaries & Mathematical Transitions (BVA)
 * 4. Address Validation Boundaries, Sanitization & Jurisdictions
 * 5. Currency Conversions, Float Arithmetic Precision & Extremes
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const require = createRequire(import.meta.url);
const jiti = require('jiti')(path.resolve(PROJECT_ROOT, 'index.js'), {
  alias: { '@': PROJECT_ROOT },
});

// Import system modules via JITI
const ordersRoute = jiti('./app/api/store/orders/route.ts');
const shippingModule = jiti('./lib/shipping.ts');
const countriesModule = jiti('./lib/countries.ts');
const paymentProviderModule = jiti('./lib/payments/provider.ts');

const {
  calculateShippingOptions,
  getShippingOptionById,
  validateShippingRate,
  isDomesticDestination,
  SHIPPING_TIERS,
} = shippingModule;

const {
  getAllCountries,
  getCountryByCode,
  isValidCountry,
  formatPhoneWithDialCode,
} = countriesModule;

const {
  validatePaymentEligibility,
  MockPaymentProvider,
} = paymentProviderModule;

// ANSI Colors
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
};

// Test Runner State
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];
let ipCounter = 100;

function createMockRequest(body, ipSuffix = null) {
  const ip = ipSuffix || `192.168.10.${++ipCounter}`;
  return {
    headers: {
      get: (header) => {
        const h = header.toLowerCase();
        if (h === 'x-forwarded-for') return ip;
        if (h === 'content-type') return 'application/json';
        return null;
      },
    },
    json: async () => body,
  };
}

function test(name, fn) {
  totalTests++;
  const start = performance.now();
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result
        .then(() => {
          const duration = (performance.now() - start).toFixed(1);
          console.log(`    ${colors.green}✓${colors.reset} ${name} ${colors.dim}(${duration}ms)${colors.reset}`);
          passedTests++;
        })
        .catch((err) => {
          const duration = (performance.now() - start).toFixed(1);
          console.error(`    ${colors.red}✗${colors.reset} ${name} ${colors.dim}(${duration}ms)${colors.reset}`);
          console.error(`      ${colors.red}Error: ${err.message}${colors.reset}`);
          if (err.stack) console.error(`      ${colors.dim}${err.stack.split('\n').slice(1, 3).join('\n      ')}${colors.reset}`);
          failedTests++;
          failures.push({ name, error: err });
        });
    } else {
      const duration = (performance.now() - start).toFixed(1);
      console.log(`    ${colors.green}✓${colors.reset} ${name} ${colors.dim}(${duration}ms)${colors.reset}`);
      passedTests++;
      return Promise.resolve();
    }
  } catch (err) {
    const duration = (performance.now() - start).toFixed(1);
    console.error(`    ${colors.red}✗${colors.reset} ${name} ${colors.dim}(${duration}ms)${colors.reset}`);
    console.error(`      ${colors.red}Error: ${err.message}${colors.reset}`);
    if (err.stack) console.error(`      ${colors.dim}${err.stack.split('\n').slice(1, 3).join('\n      ')}${colors.reset}`);
    failedTests++;
    failures.push({ name, error: err });
    return Promise.resolve();
  }
}

function assert(condition, message = 'Assertion failed') {
  if (!condition) throw new Error(message);
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      `${message ? message + ' ' : ''}Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`
    );
  }
}

function assertContains(haystack, needle, message) {
  if (!String(haystack).includes(needle)) {
    throw new Error(
      `${message ? message + ' ' : ''}Expected "${haystack}" to contain "${needle}"`
    );
  }
}

// =========================================================================
// MAIN RUNNER
// =========================================================================
async function runAdversarialSuite() {
  console.log(`\n${colors.bold}${colors.magenta}======================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.magenta}  HORVVALLE — CHALLENGER 2 ADVERSARIAL STRESS TEST SUITE${colors.reset}`);
  console.log(`${colors.bold}${colors.magenta}  International Shipping, Checkout Anti-Tampering & Gating Verifier${colors.reset}`);
  console.log(`${colors.bold}${colors.magenta}======================================================================${colors.reset}\n`);

  // -----------------------------------------------------------------------
  // SUITE 1: SHIPPING FEE MANIPULATION & ANTI-TAMPERING (SERVER VERIFICATION)
  // -----------------------------------------------------------------------
  console.log(`${colors.bold}${colors.yellow}▶ SUITE 1: Shipping Fee Manipulation & Anti-Tampering Defense...${colors.reset}`);

  await test('ADV-SHIP-01: Server rejects order with client-claimed shipping: 0 for US (subtotal $50 < $150)', async () => {
    const req = createMockRequest({
      id: `ATK-SHP-01-${Date.now()}`,
      customer: {
        fullName: 'Attacker Zero',
        phone: '+1 2125550199',
        email: 'attacker@sec.test',
        address: '10 Broadway',
        city: 'New York',
        stateOrRegion: 'NY',
        postalCode: '10004',
        country: 'United States',
        countryCode: 'US',
      },
      items: [{ productId: 'b8e699da-6036-49a2-9825-c5be5f16605e', name: 'Hoodie', price: 50, quantity: 1, isCustom: false }],
      shippingMethod: 'intl_standard',
      shipping: 0, // TAMPERED: Should be $15
      currency: 'USD',
      paymentMethod: 'card',
    });

    const res = await ordersRoute.POST(req);
    const body = await res.json();
    assertEqual(res.status, 400, 'Server must return HTTP 400 for tampered shipping rate');
    assertContains(body.error, 'Çatdırılma haqqı uyğunsuzluğu');
    assertContains(body.error, 'Gözlənilən: 15 USD');
    assertContains(body.error, 'təqdim edilən: 0 USD');
  });

  await test('ADV-SHIP-02: Server rejects negative shipping fee (shipping: -15.00)', async () => {
    const req = createMockRequest({
      id: `ATK-SHP-02-${Date.now()}`,
      customer: {
        fullName: 'Attacker Neg',
        phone: '+1 2125550199',
        email: 'neg@sec.test',
        address: '10 Broadway',
        city: 'New York',
        countryCode: 'US',
      },
      items: [{ productId: 'b8e699da-6036-49a2-9825-c5be5f16605e', name: 'Hoodie', price: 50, quantity: 1, isCustom: false }],
      shippingMethod: 'intl_standard',
      shipping: -15, // TAMPERED NEGATIVE
      currency: 'USD',
      paymentMethod: 'card',
    });

    const res = await ordersRoute.POST(req);
    assertEqual(res.status, 400, 'Server must return HTTP 400 for negative shipping');
  });

  await test('ADV-SHIP-03: Server rejects tiny negative fraction (shipping: -0.01)', async () => {
    const req = createMockRequest({
      id: `ATK-SHP-03-${Date.now()}`,
      customer: {
        fullName: 'Attacker TinyNeg',
        phone: '+1 2125550199',
        email: 'tiny@sec.test',
        address: '10 Broadway',
        city: 'New York',
        countryCode: 'US',
      },
      items: [{ productId: 'b8e699da-6036-49a2-9825-c5be5f16605e', name: 'Hoodie', price: 50, quantity: 1, isCustom: false }],
      shippingMethod: 'intl_standard',
      shipping: -0.01,
      currency: 'USD',
      paymentMethod: 'card',
    });

    const res = await ordersRoute.POST(req);
    assertEqual(res.status, 400, 'Server must return HTTP 400 for -0.01');
  });

  await test('ADV-SHIP-04: Server rejects client trying to underpay ($1 instead of $15)', async () => {
    const req = createMockRequest({
      id: `ATK-SHP-04-${Date.now()}`,
      customer: {
        fullName: 'Attacker Low',
        phone: '+1 2125550199',
        email: 'low@sec.test',
        address: '10 Broadway',
        city: 'New York',
        countryCode: 'US',
      },
      items: [{ productId: 'b8e699da-6036-49a2-9825-c5be5f16605e', name: 'Hoodie', price: 50, quantity: 1, isCustom: false }],
      shippingMethod: 'intl_standard',
      shipping: 1, // Underpay
      currency: 'USD',
      paymentMethod: 'card',
    });

    const res = await ordersRoute.POST(req);
    assertEqual(res.status, 400, 'Server must reject underpaid shipping');
  });

  await test('ADV-SHIP-05: Server rejects carrier tier downgrade (DHL Express with Standard fee $15 instead of $35)', async () => {
    const req = createMockRequest({
      id: `ATK-SHP-05-${Date.now()}`,
      customer: {
        fullName: 'Attacker Downgrade',
        phone: '+1 2125550199',
        email: 'down@sec.test',
        address: '10 Broadway',
        city: 'New York',
        countryCode: 'US',
      },
      items: [{ productId: 'b8e699da-6036-49a2-9825-c5be5f16605e', name: 'Hoodie', price: 50, quantity: 1, isCustom: false }],
      shippingMethod: 'intl_express', // Selected DHL Express ($35)
      shipping: 15, // Injected standard price ($15)
      currency: 'USD',
      paymentMethod: 'card',
    });

    const res = await ordersRoute.POST(req);
    const body = await res.json();
    assertEqual(res.status, 400, 'Server must return HTTP 400 for carrier fee mismatch');
    assertContains(body.error, 'Gözlənilən: 35 USD');
    assertContains(body.error, 'təqdim edilən: 15 USD');
  });

  await test('ADV-SHIP-06: Server rejects alternate payload key injection (shippingCost: 0)', async () => {
    const req = createMockRequest({
      id: `ATK-SHP-06-${Date.now()}`,
      customer: {
        fullName: 'Attacker AltKey',
        phone: '+1 2125550199',
        email: 'altkey@sec.test',
        address: '10 Broadway',
        city: 'New York',
        countryCode: 'US',
      },
      items: [{ productId: 'b8e699da-6036-49a2-9825-c5be5f16605e', name: 'Hoodie', price: 50, quantity: 1, isCustom: false }],
      shippingMethod: 'intl_standard',
      shippingCost: 0, // Using shippingCost instead of shipping
      currency: 'USD',
      paymentMethod: 'card',
    });

    const res = await ordersRoute.POST(req);
    assertEqual(res.status, 400, 'Server must reject tampered rate submitted via shippingCost');
  });

  await test('ADV-SHIP-07: Server rejects fraudulent free claim on DHL Express at $150 (only standard is free at $150)', async () => {
    const req = createMockRequest({
      id: `ATK-SHP-07-${Date.now()}`,
      customer: {
        fullName: 'Attacker FakeFreeExpress',
        phone: '+1 2125550199',
        email: 'expfree@sec.test',
        address: '10 Broadway',
        city: 'New York',
        countryCode: 'US',
      },
      // 5 items at $29.99 = ~$149.95, or custom items totaling $150
      items: [{ productId: 'custom-150', name: 'Custom Suit', price: 150, quantity: 1, isCustom: true }],
      shippingMethod: 'intl_express',
      shipping: 0, // Standard is free at $150, but Express is $35!
      currency: 'USD',
      paymentMethod: 'card',
    });

    const res = await ordersRoute.POST(req);
    assertEqual(res.status, 400, 'Server must reject $0 shipping on express when subtotal is $150');
  });

  await test('ADV-SHIP-08: Server accepts legitimate free standard shipping at $150.00 subtotal (shipping: 0)', async () => {
    const req = createMockRequest({
      id: `LEGIT-SHP-08-${Date.now()}`,
      customer: {
        fullName: 'Honest Buyer',
        phone: '+1 2125550199',
        email: 'honest@example.com',
        address: '10 Broadway',
        city: 'New York',
        countryCode: 'US',
      },
      items: [{ productId: 'custom-150', name: 'Custom Suit', price: 150, quantity: 1, isCustom: true }],
      shippingMethod: 'intl_standard',
      shipping: 0, // Valid free shipping
      currency: 'USD',
      paymentMethod: 'card',
    });

    const res = await ordersRoute.POST(req);
    const body = await res.json();
    assertEqual(res.status, 200, 'Server must accept valid free shipping');
    assertEqual(body.order.shipping, 0);
  });

  await test('ADV-SHIP-09: Server authoritatively assigns $15 when client completely omits shipping field', async () => {
    const req = createMockRequest({
      id: `LEGIT-OMIT-09-${Date.now()}`,
      customer: {
        fullName: 'Omitter Buyer',
        phone: '+1 2125550199',
        email: 'omitter@example.com',
        address: '10 Broadway',
        city: 'New York',
        countryCode: 'US',
      },
      items: [{ productId: 'custom-50', name: 'Custom Shirt', price: 50, quantity: 1, isCustom: true }],
      shippingMethod: 'intl_standard',
      // shipping field completely omitted!
      currency: 'USD',
      paymentMethod: 'card',
    });

    const res = await ordersRoute.POST(req);
    const body = await res.json();
    assertEqual(res.status, 200, 'Server must proceed with server-computed rate');
    assertEqual(body.order.shipping, 15, 'Server must authoritatively apply 15 USD');
    assertEqual(body.order.total, 65, 'Total must equal 50 + 15 = 65 USD');
  });

  await test('ADV-SHIP-10: Server rejects tampered international shipping in AZN (shipping: 0 for 100 AZN < 250 AZN threshold)', async () => {
    const req = createMockRequest({
      id: `ATK-SHP-10-${Date.now()}`,
      customer: {
        fullName: 'Attacker AZN',
        phone: '+90 555 123 4567',
        email: 'tr@sec.test',
        address: 'Bagdat Caddesi 12',
        city: 'Istanbul',
        countryCode: 'TR',
      },
      items: [{ productId: 'custom-100', name: 'Custom Pants', price: 100, quantity: 1, isCustom: true }],
      shippingMethod: 'intl_standard',
      shipping: 0, // Expected 25 AZN
      currency: 'AZN',
      paymentMethod: 'card',
    });

    const res = await ordersRoute.POST(req);
    const body = await res.json();
    assertEqual(res.status, 400, 'Server must reject tampered AZN international rate');
    assertContains(body.error, 'Gözlənilən: 25 AZN');
    assertContains(body.error, 'təqdim edilən: 0 AZN');
  });

  // -----------------------------------------------------------------------
  // SUITE 2: COD (CASH ON DELIVERY) GATING & BYPASS DEFENSE
  // -----------------------------------------------------------------------
  console.log(`\n${colors.bold}${colors.yellow}▶ SUITE 2: Cash on Delivery (COD) Gating & Bypass Defense...${colors.reset}`);

  await test('ADV-COD-01: Server strictly rejects COD for United States (countryCode: "US")', async () => {
    const req = createMockRequest({
      id: `ATK-COD-01-${Date.now()}`,
      customer: {
        fullName: 'John Hacker',
        phone: '+1 2125550199',
        email: 'us-cod@evil.com',
        address: '123 Wall St',
        city: 'New York',
        countryCode: 'US',
      },
      items: [{ productId: 'custom-50', name: 'Tee', price: 50, quantity: 1, isCustom: false }],
      shippingMethod: 'intl_standard',
      shipping: 15,
      currency: 'USD',
      paymentMethod: 'cash_on_delivery',
    });

    const res = await ordersRoute.POST(req);
    const body = await res.json();
    assertEqual(res.status, 400, 'Server must return HTTP 400 for international COD');
    assertContains(body.error, 'yalnız Azərbaycan daxili sifarişlər üçün keçərlidir');
  });

  await test('ADV-COD-02: Server strictly rejects COD for Turkey (countryCode: "TR")', async () => {
    const req = createMockRequest({
      id: `ATK-COD-02-${Date.now()}`,
      customer: {
        fullName: 'Ali Hacker',
        phone: '+90 555 123 4567',
        email: 'tr-cod@evil.com',
        address: 'Istiklal Cad 45',
        city: 'Istanbul',
        countryCode: 'TR',
      },
      items: [{ productId: 'custom-50', name: 'Tee', price: 50, quantity: 1, isCustom: false }],
      shippingMethod: 'intl_standard',
      shipping: 15,
      currency: 'USD',
      paymentMethod: 'cash_on_delivery',
    });

    const res = await ordersRoute.POST(req);
    const body = await res.json();
    assertEqual(res.status, 400, 'Server must return HTTP 400 for TR COD');
    assertContains(body.error, 'yalnız Azərbaycan daxili sifarişlər üçün keçərlidir');
  });

  await test('ADV-COD-03: Server strictly rejects COD for Germany (countryCode: "DE")', async () => {
    const req = createMockRequest({
      id: `ATK-COD-03-${Date.now()}`,
      customer: {
        fullName: 'Hans Hacker',
        phone: '+49 30 123456',
        email: 'de-cod@evil.com',
        address: 'Friedrichstrasse 10',
        city: 'Berlin',
        countryCode: 'DE',
      },
      items: [{ productId: 'custom-50', name: 'Tee', price: 50, quantity: 1, isCustom: false }],
      shippingMethod: 'intl_standard',
      shipping: 15,
      currency: 'USD',
      paymentMethod: 'cash_on_delivery',
    });

    const res = await ordersRoute.POST(req);
    const body = await res.json();
    assertEqual(res.status, 400, 'Server must return HTTP 400 for DE COD');
    assertContains(body.error, 'yalnız Azərbaycan daxili sifarişlər üçün keçərlidir');
  });

  await test('ADV-COD-04: Server rejects COD with lowercased or padded country code ("  us  ")', async () => {
    const req = createMockRequest({
      id: `ATK-COD-04-${Date.now()}`,
      customer: {
        fullName: 'Sneaky Case',
        phone: '+1 2125550199',
        email: 'case@evil.com',
        address: '123 Wall St',
        city: 'New York',
        countryCode: '  us  ',
      },
      items: [{ productId: 'custom-50', name: 'Tee', price: 50, quantity: 1, isCustom: false }],
      shippingMethod: 'intl_standard',
      shipping: 15,
      currency: 'USD',
      paymentMethod: 'cash_on_delivery',
    });

    const res = await ordersRoute.POST(req);
    assertEqual(res.status, 400, 'Server must normalize and reject "  us  " for COD');
  });

  await test('ADV-COD-05: Server rejects COD when countryCode is omitted but country name is "United States"', async () => {
    const req = createMockRequest({
      id: `ATK-COD-05-${Date.now()}`,
      customer: {
        fullName: 'Name Only',
        phone: '+1 2125550199',
        email: 'name@evil.com',
        address: '123 Wall St',
        city: 'New York',
        country: 'United States',
        countryCode: '', // omitted
      },
      items: [{ productId: 'custom-50', name: 'Tee', price: 50, quantity: 1, isCustom: false }],
      shippingMethod: 'intl_standard',
      shipping: 15,
      currency: 'USD',
      paymentMethod: 'cash_on_delivery',
    });

    const res = await ordersRoute.POST(req);
    assertEqual(res.status, 400, 'Server must detect destination country name and reject COD');
  });

  await test('ADV-COD-06: Server rejects COD payment method synonyms for international destinations ("delivery", "nağd")', async () => {
    const synonyms = ['delivery', 'nağd', 'çatdırılmada ödəniş', 'cod'];
    for (const syn of synonyms) {
      const req = createMockRequest({
        id: `ATK-COD-SYN-${Date.now()}-${syn}`,
        customer: {
          fullName: 'Synonym Attacker',
          phone: '+1 2125550199',
          email: 'syn@evil.com',
          address: '123 Wall St',
          city: 'New York',
          countryCode: 'US',
        },
        items: [{ productId: 'custom-50', name: 'Tee', price: 50, quantity: 1, isCustom: false }],
        shippingMethod: 'intl_standard',
        shipping: 15,
        currency: 'USD',
        paymentMethod: syn,
      });

      const res = await ordersRoute.POST(req);
      assertEqual(res.status, 400, `Server must normalize synonym "${syn}" to cash_on_delivery and reject`);
    }
  });

  await test('ADV-COD-07: Domestic Azerbaijan COD is strictly rejected if cart contains custom POD items', async () => {
    const req = createMockRequest({
      id: `ATK-COD-07-${Date.now()}`,
      customer: {
        fullName: 'Domestic Custom',
        phone: '+994 50 123 45 67',
        email: 'custom@dom.test',
        address: 'Nizami kuc 20',
        city: 'Bakı',
        countryCode: 'AZ',
      },
      items: [{ productId: 'custom-studio-1', name: '3D Studio Tee', price: 65, quantity: 1, isCustom: true }],
      shippingMethod: 'domestic_baku_sumgayit',
      shipping: 0,
      currency: 'AZN',
      paymentMethod: 'cash_on_delivery',
    });

    const res = await ordersRoute.POST(req);
    const body = await res.json();
    assertEqual(res.status, 400, 'Server must reject COD for custom POD items even domestically');
    assertContains(body.error, 'Fərdi dizaynlı məhsullar üçün çatdırılmada ödəniş keçərli deyil');
  });

  await test('ADV-COD-08: MockPaymentProvider defense-in-depth rejects COD for international customer directly', async () => {
    const provider = new MockPaymentProvider();
    const result = await provider.createPayment({
      orderId: 'TEST-DIRECT-PROVIDER',
      amount: 100,
      currency: 'USD',
      method: 'cash_on_delivery',
      items: [{ id: 'p1', name: 'Shirt', price: 100, quantity: 1, type: 'ready' }],
      customer: {
        fullName: 'Direct Test',
        countryCode: 'GB',
        country: 'United Kingdom',
      },
    });

    assertEqual(result.success, false, 'Payment provider must reject COD for GB customer');
    assertEqual(result.status, 'failed');
    assertContains(result.message, 'yalnız Azərbaycan daxili sifarişlər üçün keçərlidir');
  });

  // -----------------------------------------------------------------------
  // SUITE 3: THRESHOLD BOUNDARIES & MATHEMATICAL TRANSITIONS (BVA)
  // -----------------------------------------------------------------------
  console.log(`\n${colors.bold}${colors.yellow}▶ SUITE 3: Threshold Boundaries & Mathematical Transitions (BVA)...${colors.reset}`);

  await test('ADV-BVA-01: Standard Int\'l USD at exactly $149.99 charges full $15.00', () => {
    const opts = calculateShippingOptions('US', 149.99, 'USD');
    const std = opts.find((o) => o.id === 'intl_standard');
    assertEqual(std.price, 15);
    assertEqual(std.isFree, false);
  });

  await test('ADV-BVA-02: Standard Int\'l USD at exactly $150.00 transitions to $0.00 (FREE)', () => {
    const opts = calculateShippingOptions('US', 150.0, 'USD');
    const std = opts.find((o) => o.id === 'intl_standard');
    assertEqual(std.price, 0);
    assertEqual(std.isFree, true);
  });

  await test('ADV-BVA-03: Standard Int\'l USD float precision $149.999 is strictly < 150 -> $15.00', () => {
    const opts = calculateShippingOptions('US', 149.999, 'USD');
    const std = opts.find((o) => o.id === 'intl_standard');
    assertEqual(std.price, 15, '$149.999 must not prematurely round up to free');
  });

  await test('ADV-BVA-04: Express Int\'l USD at exactly $199.99 charges full $35.00', () => {
    const opts = calculateShippingOptions('US', 199.99, 'USD');
    const exp = opts.find((o) => o.id === 'intl_express');
    assertEqual(exp.price, 35);
  });

  await test('ADV-BVA-05: Express Int\'l USD at exactly $200.00 discounts to $20.00', () => {
    const opts = calculateShippingOptions('US', 200.0, 'USD');
    const exp = opts.find((o) => o.id === 'intl_express');
    assertEqual(exp.price, 20);
    assertEqual(exp.originalPrice, 35);
  });

  await test('ADV-BVA-06: Domestic Rayonlar AZN at exactly 59.99 ₼ charges 5.00 ₼', () => {
    const opts = calculateShippingOptions('AZ', 59.99, 'AZN');
    const rayon = opts.find((o) => o.id === 'domestic_region');
    assertEqual(rayon.price, 5);
    assertEqual(rayon.isFree, false);
  });

  await test('ADV-BVA-07: Domestic Rayonlar AZN at exactly 60.00 ₼ transitions to 0 ₼ (FREE)', () => {
    const opts = calculateShippingOptions('AZ', 60.0, 'AZN');
    const rayon = opts.find((o) => o.id === 'domestic_region');
    assertEqual(rayon.price, 0);
    assertEqual(rayon.isFree, true);
  });

  await test('ADV-BVA-08: Domestic Rayonlar in USD at $34.99 ($3) vs $35.00 ($0 FREE)', () => {
    const opts34 = calculateShippingOptions('AZ', 34.99, 'USD');
    const rayon34 = opts34.find((o) => o.id === 'domestic_region');
    assertEqual(rayon34.price, 3);
    assertEqual(rayon34.isFree, false);

    const opts35 = calculateShippingOptions('AZ', 35.0, 'USD');
    const rayon35 = opts35.find((o) => o.id === 'domestic_region');
    assertEqual(rayon35.price, 0);
    assertEqual(rayon35.isFree, true);
  });

  await test('ADV-BVA-09: International Standard AZN at 249.99 ₼ (25 ₼) vs 250.00 ₼ (0 ₼ FREE)', () => {
    const opts249 = calculateShippingOptions('TR', 249.99, 'AZN');
    const std249 = opts249.find((o) => o.id === 'intl_standard');
    assertEqual(std249.price, 25);
    assertEqual(std249.isFree, false);

    const opts250 = calculateShippingOptions('TR', 250.0, 'AZN');
    const std250 = opts250.find((o) => o.id === 'intl_standard');
    assertEqual(std250.price, 0);
    assertEqual(std250.isFree, true);
  });

  await test('ADV-BVA-10: International Express AZN at 339.99 ₼ (60 ₼) vs 340.00 ₼ (35 ₼ Discounted)', () => {
    const opts339 = calculateShippingOptions('TR', 339.99, 'AZN');
    const exp339 = opts339.find((o) => o.id === 'intl_express');
    assertEqual(exp339.price, 60);

    const opts340 = calculateShippingOptions('TR', 340.0, 'AZN');
    const exp340 = opts340.find((o) => o.id === 'intl_express');
    assertEqual(exp340.price, 35);
    assertEqual(exp340.originalPrice, 60);
  });

  // -----------------------------------------------------------------------
  // SUITE 4: ADDRESS VALIDATION BOUNDARIES & SANITIZATION
  // -----------------------------------------------------------------------
  console.log(`\n${colors.bold}${colors.yellow}▶ SUITE 4: Address Validation Boundaries & Sanitization...${colors.reset}`);

  await test('ADV-ADDR-01: Country catalog mandates postal codes for US, UK, DE, TR, FR, IT, ES, AU', () => {
    const requiredCountries = ['US', 'GB', 'DE', 'TR', 'FR', 'IT', 'ES', 'AU'];
    for (const code of requiredCountries) {
      const c = getCountryByCode(code);
      assert(c !== undefined, `Country ${code} must exist in catalog`);
      assertEqual(c.requiresPostalCode, true, `${code} must require postal code`);
    }
  });

  await test('ADV-ADDR-02: Azerbaijan does NOT mandate postal codes (requiresPostalCode: false)', () => {
    const az = getCountryByCode('AZ');
    assertEqual(az.requiresPostalCode, false, 'AZ postal code must be optional');
  });

  await test('ADV-ADDR-03: State is mandatory for US, CA, MX, AU but optional for TR, DE, GB, AZ', () => {
    const stateRequired = ['US', 'CA', 'MX', 'AU'];
    for (const code of stateRequired) {
      const c = getCountryByCode(code);
      assertEqual(c.requiresState, true, `${code} must require state/province`);
    }

    const stateOptional = ['TR', 'DE', 'GB', 'AZ'];
    for (const code of stateOptional) {
      const c = getCountryByCode(code);
      assertEqual(c.requiresState, false, `${code} must not mandate state`);
    }
  });

  await test('ADV-ADDR-04: Server sanitizes HTML/XSS injection tags in international address fields', async () => {
    const req = createMockRequest({
      id: `SAN-ADDR-${Date.now()}`,
      customer: {
        fullName: '<script>alert(1)</script>Jane Doe',
        phone: '+1 2125559904',
        email: 'xss@test.com',
        address: '<script>evil()</script>10 Broadway',
        addressLine2: '<b style="xss">Apt 4B</b>',
        city: '<img src=x>New York',
        stateOrRegion: '<svg onload=1>NY',
        postalCode: '<b>10004</b>',
        country: 'United States',
        countryCode: 'US',
      },
      items: [{ productId: 'custom-150', name: 'Dress', price: 150, quantity: 1, isCustom: true }],
      shippingMethod: 'intl_standard',
      shipping: 0,
      currency: 'USD',
      paymentMethod: 'card',
    });

    const res = await ordersRoute.POST(req);
    const body = await res.json();
    assertEqual(res.status, 200, 'Order should process with sanitized inputs');

    const cust = body.order.customer;
    assert(!cust.fullName.includes('<script>'), 'fullName must not contain script tags');
    assert(!cust.address.includes('<script>'), 'address must not contain script tags');
    assert(!cust.addressLine2.includes('<b'), 'addressLine2 must not contain <b tags');
    assert(!cust.stateOrRegion.includes('<svg'), 'stateOrRegion must not contain <svg tags');
    assert(!cust.postalCode.includes('<b>'), 'postalCode must not contain <b> tags');
    assertEqual(cust.postalCode, 'b10004/b', 'Angle brackets were stripped cleanly');
  });

  await test('ADV-ADDR-05: Server safely truncates oversized address fields', async () => {
    const hugeLine2 = 'B'.repeat(300);
    const hugeState = 'S'.repeat(250);
    const hugeZip = '9'.repeat(100);

    const req = createMockRequest({
      id: `TRUNC-ADDR-${Date.now()}`,
      customer: {
        fullName: 'A'.repeat(200),
        phone: '+1 2125559905',
        email: 'trunc@test.com',
        address: '10 Broadway',
        addressLine2: hugeLine2,
        city: 'New York',
        stateOrRegion: hugeState,
        postalCode: hugeZip,
        country: 'United States',
        countryCode: 'US',
      },
      items: [{ productId: 'custom-150', name: 'Dress', price: 150, quantity: 1, isCustom: true }],
      shippingMethod: 'intl_standard',
      shipping: 0,
      currency: 'USD',
      paymentMethod: 'card',
    });

    const res = await ordersRoute.POST(req);
    const body = await res.json();
    assertEqual(res.status, 200);

    const cust = body.order.customer;
    assert(cust.fullName.length <= 100, 'fullName length <= 100');
    assert(cust.addressLine2.length <= 150, 'addressLine2 length <= 150');
    assert(cust.stateOrRegion.length <= 100, 'stateOrRegion length <= 100');
    assert(cust.postalCode.length <= 30, 'postalCode length <= 30');
  });

  await test('ADV-ADDR-06: formatPhoneWithDialCode properly prefixes and strips local leading zeros', () => {
    // US (+1)
    assertEqual(formatPhoneWithDialCode('2125550199', 'US'), '+1 2125550199');
    assertEqual(formatPhoneWithDialCode('+1 2125550199', 'US'), '+1 2125550199');

    // Turkey (+90 with local 0555 -> 555)
    assertEqual(formatPhoneWithDialCode('05551234567', 'TR'), '+90 5551234567');

    // UK (+44 with local 07 -> 7)
    assertEqual(formatPhoneWithDialCode('07911123456', 'GB'), '+44 7911123456');

    // Azerbaijan (+994 with local 050 -> 50)
    assertEqual(formatPhoneWithDialCode('0501234567', 'AZ'), '+994 501234567');
  });

  await test('ADV-ADDR-07: Client validation boundary rejects missing postal codes for US, UK, DE, TR', () => {
    const countriesRequiringPostal = ['US', 'GB', 'DE', 'TR'];
    for (const code of countriesRequiringPostal) {
      const country = getCountryByCode(code);
      const isDomestic = isDomesticDestination(code);
      const postalCode = ''; // Missing

      // Simulating checkout page validateShipping logic:
      const hasPostalError = (country?.requiresPostalCode || !isDomestic) && !postalCode.trim();
      assertEqual(hasPostalError, true, `Missing postal code in ${code} must trigger validation error`);
    }
  });

  await test('ADV-ADDR-08: Client validation boundary rejects whitespace-only postal codes ("   ") for US, UK, DE, TR', () => {
    const countriesRequiringPostal = ['US', 'GB', 'DE', 'TR'];
    for (const code of countriesRequiringPostal) {
      const country = getCountryByCode(code);
      const isDomestic = isDomesticDestination(code);
      const postalCode = '   '; // Whitespace only

      const hasPostalError = (country?.requiresPostalCode || !isDomestic) && !postalCode.trim();
      assertEqual(hasPostalError, true, `Whitespace-only postal code in ${code} must trigger validation error`);
    }
  });

  await test('ADV-ADDR-09: Client validation boundary enforces state for US/CA but allows empty state for TR/DE/GB', () => {
    // US & CA mandate state
    const us = getCountryByCode('US');
    const ca = getCountryByCode('CA');
    const emptyState = '';

    const usStateError = us?.requiresState && !emptyState.trim();
    const caStateError = ca?.requiresState && !emptyState.trim();
    assertEqual(Boolean(usStateError), true, 'US must flag empty state as error');
    assertEqual(Boolean(caStateError), true, 'CA must flag empty state as error');

    // TR, DE, GB do not mandate state
    const tr = getCountryByCode('TR');
    const de = getCountryByCode('DE');
    const gb = getCountryByCode('GB');

    const trStateError = tr?.requiresState && !emptyState.trim();
    const deStateError = de?.requiresState && !emptyState.trim();
    const gbStateError = gb?.requiresState && !emptyState.trim();
    assertEqual(Boolean(trStateError), false, 'TR must not flag empty state as error');
    assertEqual(Boolean(deStateError), false, 'DE must not flag empty state as error');
    assertEqual(Boolean(gbStateError), false, 'GB must not flag empty state as error');
  });

  // -----------------------------------------------------------------------
  // SUITE 5: CURRENCY CONVERSIONS, FLOAT PRECISION & EXTREMES
  // -----------------------------------------------------------------------
  console.log(`\n${colors.bold}${colors.yellow}▶ SUITE 5: Currency Conversions & Float Arithmetic Precision...${colors.reset}`);

  await test('ADV-FLOAT-01: IEEE 754 precision handles 3 items @ $19.99 + $15.00 shipping cleanly', async () => {
    // 3 x $19.99 = $59.97 + $15.00 shipping = $74.97 (not 74.97000000000001)
    const req = createMockRequest({
      id: `FLOAT-PREC-01-${Date.now()}`,
      customer: {
        fullName: 'Precision Buyer',
        phone: '+1 2125550199',
        email: 'prec@test.com',
        address: '10 Broadway',
        city: 'New York',
        countryCode: 'US',
      },
      items: [{ productId: 'custom-1999', name: 'Tee', price: 19.99, quantity: 3, isCustom: true }],
      shippingMethod: 'intl_standard',
      shipping: 15,
      currency: 'USD',
      paymentMethod: 'card',
    });

    const res = await ordersRoute.POST(req);
    const body = await res.json();
    assertEqual(res.status, 200);
    assertEqual(body.order.subtotal, 59.97, 'Subtotal: 3 * 19.99 = 59.97');
    assertEqual(body.order.shipping, 15);
    assertEqual(body.order.total, 74.97, 'Total: 59.97 + 15 = 74.97');
  });

  await test('ADV-FLOAT-02: Zero subtotal ($0) calculates valid base rates without NaN or crashing', () => {
    const opts = calculateShippingOptions('US', 0, 'USD');
    assertEqual(opts.length, 2);
    assertEqual(opts[0].price, 15);
    assertEqual(opts[1].price, 35);
  });

  await test('ADV-FLOAT-03: Negative subtotal (-$50) clamped to 0 without generating discounts', () => {
    const opts = calculateShippingOptions('US', -50, 'USD');
    assertEqual(opts[0].price, 15);
    assertEqual(opts[0].isFree, false);
    assertEqual(opts[1].price, 35);
  });

  await test('ADV-FLOAT-04: Large VIP subtotal ($1,000,000) calculates correctly without overflow', () => {
    const opts = calculateShippingOptions('US', 1000000, 'USD');
    const std = opts.find((o) => o.id === 'intl_standard');
    const exp = opts.find((o) => o.id === 'intl_express');
    assertEqual(std.price, 0);
    assertEqual(std.isFree, true);
    assertEqual(exp.price, 20);
    assertEqual(exp.originalPrice, 35);
  });

  await test('ADV-FLOAT-05: Rate engine guarantees currency attribute matches requested currency', () => {
    const usdOpts = calculateShippingOptions('DE', 100, 'USD');
    for (const opt of usdOpts) {
      assertEqual(opt.currency, 'USD');
    }

    const aznOpts = calculateShippingOptions('DE', 100, 'AZN');
    for (const opt of aznOpts) {
      assertEqual(opt.currency, 'AZN');
    }
  });

  await test('ADV-FLOAT-06: validateShippingRate exact tolerance threshold (0.01 margin of error)', () => {
    // Target rate is $15.00
    // Claimed 15.005 -> within 0.01 -> Valid
    const checkNear = validateShippingRate('US', 100, 'USD', 'intl_standard', 15.005);
    assertEqual(checkNear.valid, true, 'Difference of 0.005 should be accepted as floating tolerance');

    // Claimed 15.02 -> diff 0.02 -> Invalid
    const checkFar = validateShippingRate('US', 100, 'USD', 'intl_standard', 15.02);
    assertEqual(checkFar.valid, false, 'Difference >= 0.01 must be marked invalid');
  });

  await test('ADV-FLOAT-07: Cart subtotal floating sum ($49.99 * 3 = $149.97) strictly charges $15, adding $0.03 ($150.00) activates FREE', () => {
    // 3 items at $49.99 = 149.97
    const subtotalBelow = +(49.99 * 3).toFixed(2);
    assertEqual(subtotalBelow, 149.97);

    const optsBelow = calculateShippingOptions('US', subtotalBelow, 'USD');
    const stdBelow = optsBelow.find((o) => o.id === 'intl_standard');
    assertEqual(stdBelow.price, 15, 'At $149.97 shipping must be $15');
    assertEqual(stdBelow.isFree, false);

    // Adding 3 cents gives 150.00
    const subtotalExact = +(subtotalBelow + 0.03).toFixed(2);
    assertEqual(subtotalExact, 150.00);

    const optsExact = calculateShippingOptions('US', subtotalExact, 'USD');
    const stdExact = optsExact.find((o) => o.id === 'intl_standard');
    assertEqual(stdExact.price, 0, 'At $150.00 shipping must be $0 (FREE)');
    assertEqual(stdExact.isFree, true);
  });

  await test('ADV-FLOAT-08: Cart subtotal express discount precision ($66.66 * 3 = $199.98 vs $200.00)', () => {
    // 3 items at $66.66 = 199.98
    const subtotalBelow = +(66.66 * 3).toFixed(2);
    assertEqual(subtotalBelow, 199.98);

    const optsBelow = calculateShippingOptions('US', subtotalBelow, 'USD');
    const expBelow = optsBelow.find((o) => o.id === 'intl_express');
    assertEqual(expBelow.price, 35, 'At $199.98 express must be $35');

    // Adding 2 cents gives 200.00
    const subtotalExact = +(subtotalBelow + 0.02).toFixed(2);
    assertEqual(subtotalExact, 200.00);

    const optsExact = calculateShippingOptions('US', subtotalExact, 'USD');
    const expExact = optsExact.find((o) => o.id === 'intl_express');
    assertEqual(expExact.price, 20, 'At $200.00 express must be discounted to $20');
  });

  // -----------------------------------------------------------------------
  // SUMMARY REPORT
  // -----------------------------------------------------------------------
  console.log(`\n${colors.bold}${colors.magenta}======================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.magenta}  CHALLENGER 2 STRESS TEST EXECUTION SUMMARY${colors.reset}`);
  console.log(`${colors.bold}${colors.magenta}======================================================================${colors.reset}`);
  console.log(`  Total Tests Run:  ${colors.bold}${totalTests}${colors.reset}`);
  console.log(`  Passed:           ${colors.bold}${colors.green}${passedTests}${colors.reset}`);
  console.log(`  Failed:           ${colors.bold}${failedTests > 0 ? colors.red : colors.green}${failedTests}${colors.reset}`);

  if (failedTests > 0) {
    console.log(`\n${colors.bold}${colors.red}FAILURES LIST:${colors.reset}`);
    for (const f of failures) {
      console.log(`  - ${f.name}: ${f.error.message}`);
    }
    process.exit(1);
  } else {
    console.log(`\n${colors.bold}${colors.green}ALL ${totalTests} ADVERSARIAL STRESS TESTS PASSED SUCCESSFULLY!${colors.reset}\n`);
    process.exit(0);
  }
}

runAdversarialSuite().catch((err) => {
  console.error('Fatal test suite crash:', err);
  process.exit(1);
});
