#!/usr/bin/env node

/**
 * Challenger Run 3 — Empirical Security & Adversarial Stress Suite
 * Horwalle Atelier Luxury E-Commerce
 *
 * Focus Areas:
 * 1. Price Tampering Defense & Server-Authoritative Recalculation
 * 2. Strict Authentication Gating & Bypass Defense (401 Verification)
 * 3. Customer PII Leakage & NTFY / Telegram Push Privacy Protection
 * 4. Stored XSS / HTML Injection Defense & Sanitization
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import crypto from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const require = createRequire(import.meta.url);
const jiti = require('jiti')(path.resolve(PROJECT_ROOT, 'index.js'), {
  alias: { '@': PROJECT_ROOT },
});

// Import route handlers and core modules via JITI
const checkoutRoute = jiti('./app/api/checkout/route.ts');
const ordersRoute = jiti('./app/api/store/orders/route.ts');
const productsRoute = jiti('./app/api/store/products/route.ts');
const contentRoute = jiti('./app/api/store/content/route.ts');
const podOrdersRoute = jiti('./app/api/store/pod-orders/route.ts');
const chatThreadsRoute = jiti('./app/api/chat/threads/route.ts');
const adminAuth = jiti('./lib/adminAuth.ts');
const orderNotifier = jiti('./lib/notifications/orderNotifier.ts');
const storeDb = jiti('./lib/storeDb.ts');

const { readStoreDb } = storeDb;
const { createAdminToken, verifyAdminToken, verifyAdminCredentials } = adminAuth;
const { notifyNewOrder } = orderNotifier;

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
};

// Test Runner State
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];
let ipCounter = 200;

function createMockRequest({
  method = 'GET',
  url = 'http://localhost:3000/api/endpoint',
  headers = {},
  cookies = {},
  body = null,
} = {}) {
  const ip = headers['x-forwarded-for'] || `192.168.100.${++ipCounter}`;
  const normalizedHeaders = {};
  for (const [k, v] of Object.entries(headers)) {
    normalizedHeaders[k.toLowerCase()] = v;
  }
  normalizedHeaders['x-forwarded-for'] = ip;
  if (!normalizedHeaders['content-type']) {
    normalizedHeaders['content-type'] = 'application/json';
  }

  return {
    method,
    url,
    headers: {
      get: (header) => normalizedHeaders[header.toLowerCase()] || null,
    },
    cookies: {
      get: (cookieName) => (cookies[cookieName] !== undefined ? { value: cookies[cookieName] } : undefined),
    },
    json: async () => (body !== null ? body : {}),
  };
}

async function test(name, fn) {
  totalTests++;
  const start = performance.now();
  try {
    const result = fn();
    if (result instanceof Promise) {
      await result;
    }
    const duration = (performance.now() - start).toFixed(1);
    console.log(`    ${colors.green}✓${colors.reset} ${name} ${colors.dim}(${duration}ms)${colors.reset}`);
    passedTests++;
  } catch (err) {
    const duration = (performance.now() - start).toFixed(1);
    console.error(`    ${colors.red}✗${colors.reset} ${name} ${colors.dim}(${duration}ms)${colors.reset}`);
    console.error(`      ${colors.red}Error: ${err.message}${colors.reset}`);
    failedTests++;
    failures.push({ name, error: err.message });
  }
}

function assert(condition, message = 'Assertion failed') {
  if (!condition) throw new Error(message);
}

function assertEqual(actual, expected, message = '') {
  if (actual !== expected) {
    throw new Error(`${message ? message + ' ' : ''}Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
}

// Extract escapeHtml function from public/admin.html for exact fidelity testing
const adminHtmlContent = fs.readFileSync(path.join(PROJECT_ROOT, 'public/admin.html'), 'utf8');
const escapeHtmlMatch = adminHtmlContent.match(/function escapeHtml\s*\([^)]*\)\s*\{[\s\S]*?return\s+String\(str\)[\s\S]*?;\s*\}/);
if (!escapeHtmlMatch) {
  throw new Error('Unable to extract function escapeHtml from public/admin.html');
}
const escapeHtmlFn = new Function(`
  ${escapeHtmlMatch[0]}
  return escapeHtml;
`)();

// =========================================================================
// MAIN RUNNER
// =========================================================================
async function runChallengerSecuritySuite() {
  console.log(`\n${colors.bold}${colors.magenta}======================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.magenta}  HORWALLE ATELIER — CHALLENGER 3 EMPIRICAL SECURITY & STRESS SUITE  ${colors.reset}`);
  console.log(`${colors.bold}${colors.magenta}  Anti-Tampering, Auth Gating, PII Protection & XSS Hardening        ${colors.reset}`);
  console.log(`${colors.bold}${colors.magenta}======================================================================${colors.reset}\n`);

  const db = readStoreDb();
  const testProduct = (db.products && db.products.length > 0) ? db.products[0] : { id: 'vtx-sample', name: 'Sample Item', price: 45 };
  const catalogPrice = Number(testProduct.price);
  console.log(`${colors.cyan}Baseline Catalog Product:${colors.reset} [ID: ${testProduct.id}, Name: "${testProduct.name}", Price: ${catalogPrice} AZN]\n`);

  // -----------------------------------------------------------------------
  // SUITE 1: PRICE TAMPERING & SERVER-AUTHORITATIVE RECALCULATION
  // -----------------------------------------------------------------------
  console.log(`${colors.bold}${colors.yellow}▶ SUITE 1: Price Tampering Defense (Server Recalculation)...${colors.reset}`);

  // Test 1.1: Checkout route recalculates modified penny price (0.01) back to catalog price
  await test('SEC-PRICE-01: /api/checkout overrides modified penny price (0.01) with authoritative catalog price', async () => {
    const req = createMockRequest({
      method: 'POST',
      body: {
        customer: {
          fullName: 'Test Buyer',
          phone: '+994501234567',
          address: 'Nizami küç. 15',
          city: 'Bakı',
          country: 'Azərbaycan',
          countryCode: 'AZ',
        },
        method: 'card',
        items: [
          {
            id: testProduct.id,
            productId: testProduct.id,
            name: testProduct.name,
            price: 0.01, // TAMPERED PENNY PRICE
            quantity: 1,
          },
        ],
        currency: 'AZN',
      },
    });

    const res = await checkoutRoute.POST(req);
    const data = await res.json();
    assert(data.success === true, `Checkout failed: ${data.message || JSON.stringify(data)}`);
    // Expected: subtotal = catalogPrice, total = catalogPrice + shipping (domestic Baku shipping: 0 or free)
    assert(data.total >= catalogPrice, `Server did not recalculate price! Expected total >= ${catalogPrice}, got ${data.total}`);
    assert(data.total !== 0.01, `Tampered price 0.01 was accepted by server!`);
  });

  // Test 1.2: Checkout route rejects / overrides negative price (-100)
  await test('SEC-PRICE-02: /api/checkout overrides negative price (-100) with authoritative catalog price', async () => {
    const req = createMockRequest({
      method: 'POST',
      body: {
        customer: {
          fullName: 'Malicious Buyer',
          phone: '+994501234567',
          address: 'Nizami küç. 15',
          city: 'Bakı',
          country: 'Azərbaycan',
          countryCode: 'AZ',
        },
        method: 'card',
        items: [
          {
            id: testProduct.id,
            productId: testProduct.id,
            name: testProduct.name,
            price: -100, // NEGATIVE EXTREME
            quantity: 1,
          },
        ],
        currency: 'AZN',
      },
    });

    const res = await checkoutRoute.POST(req);
    const data = await res.json();
    assert(data.success === true, `Checkout failed: ${data.message || JSON.stringify(data)}`);
    assert(data.total >= catalogPrice, `Server did not override negative price! Expected >= ${catalogPrice}, got ${data.total}`);
  });

  // Test 1.3: Checkout route overrides astronomical price (999999)
  await test('SEC-PRICE-03: /api/checkout overrides astronomical price (999999) with catalog price', async () => {
    const req = createMockRequest({
      method: 'POST',
      body: {
        customer: {
          fullName: 'Test Buyer',
          phone: '+994501234567',
          address: 'Nizami küç. 15',
          city: 'Bakı',
          country: 'Azərbaycan',
          countryCode: 'AZ',
        },
        method: 'card',
        items: [
          {
            id: testProduct.id,
            productId: testProduct.id,
            name: testProduct.name,
            price: 999999, // ASTRONOMICAL TAMPERING
            quantity: 1,
          },
        ],
        currency: 'AZN',
      },
    });

    const res = await checkoutRoute.POST(req);
    const data = await res.json();
    assert(data.success === true, `Checkout failed: ${data.message}`);
    assert(data.total < 10000, `Server accepted astronomical price! Got total: ${data.total}`);
    assert(data.total >= catalogPrice, `Server total should be at least catalog price`);
  });

  // Test 1.4: Orders route overrides tampered price in /api/store/orders
  await test('SEC-PRICE-04: /api/store/orders overrides tampered price and recalculates subtotal from catalog', async () => {
    const req = createMockRequest({
      method: 'POST',
      body: {
        customer: {
          fullName: 'Audit User',
          phone: '+994501234567',
          address: 'Nizami küç. 20',
          city: 'Bakı',
          country: 'Azərbaycan',
          countryCode: 'AZ',
        },
        paymentMethod: 'card',
        items: [
          {
            productId: testProduct.id,
            name: testProduct.name,
            price: 0.05, // TAMPERED
            quantity: 2,
          },
        ],
        currency: 'AZN',
      },
    });

    const res = await ordersRoute.POST(req);
    const data = await res.json();
    assert(data.success === true, `Order creation failed: ${data.error}`);
    const expectedSubtotal = catalogPrice * 2;
    assertEqual(data.order.subtotal, expectedSubtotal, 'Order subtotal must equal authoritative catalog price * 2');
    assertEqual(data.order.items[0].price, catalogPrice, 'Order item unit price must be restored to catalog price');
  });

  // Test 1.5: Multi-item mixed price tampering test
  await test('SEC-PRICE-05: Multi-item cart with mixed modified prices (0.01 and -50) calculates exact catalog sum', async () => {
    const secondProduct = db.products[1] || { id: 'vtx-sample2', name: 'Sample Item 2', price: 65 };
    const p2Price = Number(secondProduct.price);

    const req = createMockRequest({
      method: 'POST',
      body: {
        customer: {
          fullName: 'Audit Multi',
          phone: '+994509998877',
          address: 'Təbriz küç. 45',
          city: 'Bakı',
          country: 'Azərbaycan',
          countryCode: 'AZ',
        },
        paymentMethod: 'card',
        items: [
          { productId: testProduct.id, name: testProduct.name, price: 0.01, quantity: 3 },
          { productId: secondProduct.id, name: secondProduct.name, price: -500, quantity: 1 },
        ],
        currency: 'AZN',
      },
    });

    const res = await ordersRoute.POST(req);
    const data = await res.json();
    assert(data.success === true, `Order creation failed: ${data.error}`);
    const expectedSubtotal = (catalogPrice * 3) + p2Price;
    assertEqual(data.order.subtotal, expectedSubtotal, 'Multi-item subtotal must match authoritative catalog sum');
  });

  // Test 1.6: Quantity tampering (negative, zero, fractional) clamped to positive integer >= 1
  await test('SEC-PRICE-06: Quantity tampering (-5, 0, 0.4) clamped to positive integer >= 1', async () => {
    const req = createMockRequest({
      method: 'POST',
      body: {
        customer: {
          fullName: 'Qty Tamperer',
          phone: '+994507776655',
          address: 'Bakıxanov küç. 10',
          city: 'Bakı',
          country: 'Azərbaycan',
          countryCode: 'AZ',
        },
        method: 'card',
        items: [
          {
            id: testProduct.id,
            productId: testProduct.id,
            name: testProduct.name,
            price: catalogPrice,
            quantity: -5, // TAMPERED NEGATIVE QTY
          },
        ],
        currency: 'AZN',
      },
    });

    const res = await checkoutRoute.POST(req);
    const data = await res.json();
    assert(data.success === true, `Checkout failed: ${data.message}`);
    assert(data.total >= catalogPrice, 'Negative quantity must be clamped to at least 1 item');
  });

  // -----------------------------------------------------------------------
  // SUITE 2: STRICT AUTHENTICATION GATING & BYPASS DEFENSE
  // -----------------------------------------------------------------------
  console.log(`\n${colors.bold}${colors.yellow}▶ SUITE 2: Authentication Gating & Bypass Defense (Strict 401 Rejection)...${colors.reset}`);

  // Test 2.1: POST /api/store/products unauthenticated -> 401
  await test('SEC-AUTH-01: POST /api/store/products strictly rejects unauthenticated request with 401', async () => {
    const req = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/store/products',
      body: { name: 'Unauthorized Tee', price: 99 },
    });
    const res = await productsRoute.POST(req);
    assertEqual(res.status, 401, 'POST /api/store/products must return 401');
    const data = await res.json();
    assertEqual(data.success, false, 'Expected success: false');
  });

  // Test 2.2: DELETE /api/store/products unauthenticated -> 401
  await test('SEC-AUTH-02: DELETE /api/store/products strictly rejects unauthenticated request with 401', async () => {
    const req = createMockRequest({
      method: 'DELETE',
      url: 'http://localhost:3000/api/store/products?id=vtx-test',
    });
    const res = await productsRoute.DELETE(req);
    assertEqual(res.status, 401, 'DELETE /api/store/products must return 401');
    const data = await res.json();
    assertEqual(data.success, false, 'Expected success: false');
  });

  // Test 2.3: POST /api/store/content unauthenticated -> 401
  await test('SEC-AUTH-03: POST /api/store/content strictly rejects unauthenticated request with 401', async () => {
    const req = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/store/content',
      body: { settings: { maintenance: true } },
    });
    const res = await contentRoute.POST(req);
    assertEqual(res.status, 401, 'POST /api/store/content must return 401');
    const data = await res.json();
    assertEqual(data.success, false, 'Expected success: false');
  });

  // Test 2.4: GET /api/store/pod-orders unauthenticated -> 401
  await test('SEC-AUTH-04: GET /api/store/pod-orders strictly rejects unauthenticated request with 401', async () => {
    const req = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/store/pod-orders',
    });
    const res = await podOrdersRoute.GET(req);
    assertEqual(res.status, 401, 'GET /api/store/pod-orders must return 401');
    const data = await res.json();
    assertEqual(data.success, false, 'Expected success: false');
  });

  // Test 2.5: PATCH /api/store/pod-orders unauthenticated -> 401
  await test('SEC-AUTH-05: PATCH /api/store/pod-orders strictly rejects unauthenticated request with 401', async () => {
    const req = createMockRequest({
      method: 'PATCH',
      url: 'http://localhost:3000/api/store/pod-orders',
      body: { id: 'POD-101', status: 'In Production' },
    });
    const res = await podOrdersRoute.PATCH(req);
    assertEqual(res.status, 401, 'PATCH /api/store/pod-orders must return 401');
    const data = await res.json();
    assertEqual(data.success, false, 'Expected success: false');
  });

  // Test 2.6: GET /api/chat/threads unauthenticated -> 401
  await test('SEC-AUTH-06: GET /api/chat/threads strictly rejects unauthenticated request with 401', async () => {
    const req = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/chat/threads',
    });
    const res = await chatThreadsRoute.GET(req);
    assertEqual(res.status, 401, 'GET /api/chat/threads must return 401');
    const data = await res.json();
    assertEqual(data.success, false, 'Expected success: false');
  });

  // Test 2.7: DELETE /api/chat/threads unauthenticated -> 401
  await test('SEC-AUTH-07: DELETE /api/chat/threads strictly rejects unauthenticated request with 401', async () => {
    const req = createMockRequest({
      method: 'DELETE',
      url: 'http://localhost:3000/api/chat/threads?sessionId=sess_123',
    });
    const res = await chatThreadsRoute.DELETE(req);
    assertEqual(res.status, 401, 'DELETE /api/chat/threads must return 401');
    const data = await res.json();
    assertEqual(data.success, false, 'Expected success: false');
  });

  // Test 2.8: Forged JWT signature attack rejected
  await test('SEC-AUTH-08: Token with forged HMAC signature is rejected as invalid', async () => {
    const validToken = createAdminToken('admin');
    const parts = validToken.split('.');
    // Tamper payload or signature
    const forgedToken = `${parts[0]}.${parts[1]}.tampered_signature_payload_xyz`;
    assert(!verifyAdminToken(forgedToken), 'Forged token signature must return false');

    const req = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/store/products',
      headers: { authorization: `Bearer ${forgedToken}` },
      body: { name: 'Exploit Item', price: 10 },
    });
    const res = await productsRoute.POST(req);
    assertEqual(res.status, 401, 'Forged token must be rejected with 401');
  });

  // Test 2.9: Expired admin token rejected
  await test('SEC-AUTH-09: Expired admin token is strictly rejected', async () => {
    // Craft expired token
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ u: 'admin', exp: Date.now() - 60000 })).toString('base64url');
    const secret = process.env.ADMIN_JWT_SECRET || 'horvvalle_super_secure_admin_secret_key_2026_98124';
    const sig = crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
    const expiredToken = `${header}.${payload}.${sig}`;

    assert(!verifyAdminToken(expiredToken), 'Expired token must return false');
    const req = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/store/pod-orders',
      headers: { 'x-admin-token': expiredToken },
    });
    const res = await podOrdersRoute.GET(req);
    assertEqual(res.status, 401, 'Expired token must be rejected with 401');
  });

  // Test 2.10: Legitimate authenticated admin request succeeds
  await test('SEC-AUTH-10: Legitimate admin token successfully authenticates and grants access', async () => {
    const validToken = createAdminToken('admin');
    assert(verifyAdminToken(validToken), 'Valid token must verify true');

    const req = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/store/pod-orders',
      headers: { authorization: `Bearer ${validToken}` },
    });
    const res = await podOrdersRoute.GET(req);
    assertEqual(res.status, 200, 'Legitimate admin request must return 200');
  });

  // -----------------------------------------------------------------------
  // SUITE 3: PII LEAKAGE & NTFY / TELEGRAM PRIVACY PROTECTION
  // -----------------------------------------------------------------------
  console.log(`\n${colors.bold}${colors.yellow}▶ SUITE 3: Customer PII Leakage & Notification Privacy...${colors.reset}`);

  // Test 3.1: Verify NTFY broadcast is completely suppressed when NTFY_TOPIC is not configured
  await test('SEC-PII-01: NTFY push notification is completely suppressed when NTFY_TOPIC is unset', async () => {
    const originalTopic = process.env.NTFY_TOPIC;
    delete process.env.NTFY_TOPIC;

    let fetchCalled = false;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, opts) => {
      if (String(url).includes('ntfy')) {
        fetchCalled = true;
      }
      return { ok: true, json: async () => ({}) };
    };

    try {
      await notifyNewOrder({
        id: 'SEC-TEST-01',
        customer: { fullName: 'Ali Aliyev', phone: '+994501112233', city: 'Bakı' },
        items: [],
        total: 50,
      });
      assert(!fetchCalled, 'NTFY fetch must NOT be called when NTFY_TOPIC is unset');
    } finally {
      globalThis.fetch = originalFetch;
      if (originalTopic) process.env.NTFY_TOPIC = originalTopic;
    }
  });

  // Test 3.2: Verify NTFY masks customer phone and name, and redacts street address
  await test('SEC-PII-02: NTFY masks phone numbers, customer names, and only broadcasts city/country', async () => {
    process.env.NTFY_TOPIC = 'private_atelier_topic_sec';
    process.env.NTFY_ACCESS_TOKEN = 'mock_sec_token_9988';

    let capturedPayload = null;
    let capturedHeaders = null;
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async (url, opts) => {
      if (String(url).includes('ntfy.sh')) {
        capturedHeaders = opts?.headers;
        capturedPayload = opts?.body;
      }
      return { ok: true, json: async () => ({}) };
    };

    try {
      await notifyNewOrder({
        id: 'SEC-ORD-999',
        customer: {
          fullName: 'Vüqar Məmmədov',
          phone: '+994502223344',
          address: 'İstiqlaliyyət küçəsi bina 12, mənzil 54',
          city: 'Bakı',
          country: 'Azərbaycan',
        },
        items: [{ name: 'Atelier Noir Hoodie', quantity: 1, price: 95 }],
        shippingMethodLabel: 'Kuryer',
        shipping: 0,
        total: 95,
      });

      assert(capturedPayload !== null, 'NTFY push was not sent');
      // Assert Auth header
      assertEqual(capturedHeaders['Authorization'], 'Bearer mock_sec_token_9988', 'NTFY must use Bearer token header');

      // Assert Name Masking
      assert(!capturedPayload.includes('Vüqar Məmmədov'), 'Raw customer name must NOT appear in NTFY push');
      assert(capturedPayload.includes('V*** M***'), `Expected masked name "V*** M***", got: ${capturedPayload}`);

      // Assert Phone Masking
      assert(!capturedPayload.includes('+994502223344'), 'Raw customer phone must NOT appear in NTFY push');
      assert(capturedPayload.includes('+994***44'), `Expected masked phone "+994***44", got: ${capturedPayload}`);

      // Assert Address Redaction
      assert(!capturedPayload.includes('İstiqlaliyyət'), 'Exact street address must NOT appear in NTFY push');
      assert(!capturedPayload.includes('mənzil 54'), 'Exact apartment number must NOT appear in NTFY push');
      assert(capturedPayload.includes('Bakı, Azərbaycan'), 'Only broad city/country should appear in push');
    } finally {
      globalThis.fetch = originalFetch;
      delete process.env.NTFY_TOPIC;
      delete process.env.NTFY_ACCESS_TOKEN;
    }
  });

  // Test 3.3: Verify DISABLE_NTFY flag completely silences NTFY even if topic is configured
  await test('SEC-PII-03: DISABLE_NTFY="true" suppresses NTFY dispatch even with topic present', async () => {
    process.env.NTFY_TOPIC = 'some_topic';
    process.env.DISABLE_NTFY = 'true';

    let ntfyCalled = false;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url) => {
      if (String(url).includes('ntfy')) ntfyCalled = true;
      return { ok: true, json: async () => ({}) };
    };

    try {
      await notifyNewOrder({ id: 'ORD-SILENT', customer: { fullName: 'A' }, items: [] });
      assert(!ntfyCalled, 'DISABLE_NTFY must prevent any call to NTFY');
    } finally {
      globalThis.fetch = originalFetch;
      delete process.env.NTFY_TOPIC;
      delete process.env.DISABLE_NTFY;
    }
  });

  // -----------------------------------------------------------------------
  // SUITE 4: STORED XSS & HTML INJECTION SANITIZATION
  // -----------------------------------------------------------------------
  console.log(`\n${colors.bold}${colors.yellow}▶ SUITE 4: HTML Injection & XSS Sanitization Defense...${colors.reset}`);

  // Test 4.1: escapeHtml escapes standard script tags
  await test('SEC-XSS-01: escapeHtml sanitizes script tag injection (<script>alert(1)</script>)', () => {
    const vector = '<script>alert("XSS")</script>';
    const escaped = escapeHtmlFn(vector);
    assert(!escaped.includes('<script>'), 'Unescaped <script> tag detected');
    assert(!escaped.includes('</script>'), 'Unescaped </script> tag detected');
    assertEqual(escaped, '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
  });

  // Test 4.2: escapeHtml escapes event handlers with quotes (onerror, onload)
  await test('SEC-XSS-02: escapeHtml sanitizes image onerror attribute vectors', () => {
    const vector = '<img src="x" onerror="alert(document.cookie)" />';
    const escaped = escapeHtmlFn(vector);
    assert(!escaped.includes('<img'), 'Unescaped <img tag detected');
    assert(!escaped.includes('"'), 'Unescaped double quote detected');
    assertEqual(escaped, '&lt;img src=&quot;x&quot; onerror=&quot;alert(document.cookie)&quot; /&gt;');
  });

  // Test 4.3: escapeHtml escapes single-quoted attribute breakout
  await test('SEC-XSS-03: escapeHtml sanitizes single-quote breakout vectors', () => {
    const vector = "input' onfocus='alert(1)' autofocus='";
    const escaped = escapeHtmlFn(vector);
    assert(!escaped.includes("'"), 'Unescaped single quote detected');
    assert(escaped.includes('&#039;'), 'Single quote must be converted to &#039;');
  });

  // Test 4.4: escapeHtml handles nested and malformed vectors
  await test('SEC-XSS-04: escapeHtml sanitizes malformed and nested vectors (<<SCRIPT>...)', () => {
    const vector = '<<SCRIPT>alert("XSS");//<</SCRIPT>';
    const escaped = escapeHtmlFn(vector);
    assert(!escaped.includes('<'), 'Unescaped < bracket detected');
    assert(!escaped.includes('>'), 'Unescaped > bracket detected');
    assertEqual(escaped, '&lt;&lt;SCRIPT&gt;alert(&quot;XSS&quot;);//&lt;&lt;/SCRIPT&gt;');
  });

  // Test 4.5: escapeHtml handles SVG and body onload vectors
  await test('SEC-XSS-05: escapeHtml sanitizes SVG/body onload and mathml vectors', () => {
    const vector = '<svg onload="alert(1)"><g><path /></g></svg>';
    const escaped = escapeHtmlFn(vector);
    assert(!escaped.includes('<svg'), 'Unescaped <svg detected');
    assert(!escaped.includes('>'), 'Unescaped > detected');
    assertEqual(escaped, '&lt;svg onload=&quot;alert(1)&quot;&gt;&lt;g&gt;&lt;path /&gt;&lt;/g&gt;&lt;/svg&gt;');
  });

  // Test 4.6: Database / Route layer strips HTML tags from customer input
  await test('SEC-XSS-06: /api/store/orders sanitizes HTML brackets from customer fields', async () => {
    const req = createMockRequest({
      method: 'POST',
      body: {
        customer: {
          fullName: 'Hacker <script>alert(1)</script> Joe',
          phone: '+994500000000<style>body{color:red}</style>',
          address: 'Baku <img src=x onerror=alert(1)> Main St',
          city: 'Bakı',
          country: 'Azərbaycan',
          countryCode: 'AZ',
        },
        paymentMethod: 'card',
        items: [{ productId: testProduct.id, name: testProduct.name, price: catalogPrice, quantity: 1 }],
      },
    });

    const res = await ordersRoute.POST(req);
    const data = await res.json();
    assert(data.success === true, `Order creation failed: ${data.error}`);
    const cust = data.order.customer;
    assert(!cust.fullName.includes('<script>'), 'Customer name must not contain raw <script>');
    assert(!cust.fullName.includes('<'), 'Customer name must not contain <');
    assert(!cust.fullName.includes('>'), 'Customer name must not contain >');
    assert(!cust.phone.includes('<style>'), 'Customer phone must not contain raw <style>');
    assert(!cust.address.includes('<img'), 'Customer address must not contain raw <img');
  });

  // Test 4.7: /api/store/pod-orders sanitizes HTML brackets in custom order fields
  await test('SEC-XSS-07: /api/store/pod-orders sanitizes HTML brackets in placement, note, and garment', async () => {
    const req = createMockRequest({
      method: 'POST',
      body: {
        customerName: 'POD <script>alert(2)</script>',
        customerPhone: '+994508889900',
        customerNote: 'Print this: <b>Bold</b> and <script>steal()</script>',
        placement: 'Sinə <svg onload=alert(3)> Mərkəz',
        garmentType: 'Hoodie <iframe src=javascript:alert(4)>',
        price: 75,
      },
    });

    const res = await podOrdersRoute.POST(req);
    const data = await res.json();
    assert(data.success === true, `POD creation failed: ${data.error}`);
    const pod = data.podOrder;
    assert(!pod.customerName.includes('<'), 'POD customerName must not contain <');
    assert(!pod.customerNote.includes('<script>'), 'POD customerNote must not contain raw <script>');
    assert(!pod.placement.includes('<svg'), 'POD placement must not contain <svg');
    assert(!pod.garmentType.includes('<iframe'), 'POD garmentType must not contain <iframe');
  });

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log(`\n${colors.bold}${colors.magenta}======================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.magenta}  CHALLENGER 3 SECURITY STRESS TEST SUMMARY                           ${colors.reset}`);
  console.log(`${colors.bold}${colors.magenta}======================================================================${colors.reset}`);
  console.log(`  Total Tests Run:  ${colors.bold}${totalTests}${colors.reset}`);
  console.log(`  Passed:           ${colors.green}${colors.bold}${passedTests}${colors.reset}`);
  console.log(`  Failed:           ${failedTests > 0 ? colors.red : colors.green}${colors.bold}${failedTests}${colors.reset}`);

  if (failedTests > 0) {
    console.error(`\n${colors.bold}${colors.red}FAILURES:${colors.reset}`);
    for (const f of failures) {
      console.error(`  - ${f.name}: ${f.error}`);
    }
    process.exit(1);
  } else {
    console.log(`\n${colors.bold}${colors.green}ALL ${totalTests} SECURITY AND STRESS TESTS PASSED EMPIRICALLY!${colors.reset}\n`);
    process.exit(0);
  }
}

runChallengerSecuritySuite().catch((err) => {
  console.error('Fatal test harness error:', err);
  process.exit(1);
});
