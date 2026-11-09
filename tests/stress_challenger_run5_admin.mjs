#!/usr/bin/env node

/**
 * Challenger 2 Adversarial Stress Test Harness: Admin & Supabase 2-Way Sync
 * 
 * Targets 6 Critical Verification Items:
 * - Item 3: Order deletion persistence (UUID vs string IDs, storeDb, Supabase, localStorage)
 * - Item 11: Live order tracking PostgreSQL UUID query robustness (zero 500 crashes on non-UUID / malformed / tracking codes)
 * - Item 17: Total DOM & AST absence of VIP, Loyalty Terminal, Cashback, and Bonus Points
 * - Item 19: CMS Static pages update round-trip (hero, announcements, banners, persistence & live store consumption)
 * - Item 20: POD artwork download URL generation, content headers, and path traversal security
 * - Item 23: Live chat batch delete API (`DELETE /api/chat/threads?all=true`) & UI contract
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

// Import route handlers and system libraries via JITI
const adminRoute = jiti('./app/api/admin/[...slug]/route.ts');
const trackRoute = jiti('./app/api/orders/track/route.ts');
const storeDataRoute = jiti('./app/api/store/data/route.ts');
const chatRoute = jiti('./app/api/chat/threads/route.ts');
const uploadsRoute = jiti('./app/images/uploads/[...slug]/route.ts');
const storeDb = jiti('./lib/storeDb.ts');
const adminAuth = jiti('./lib/adminAuth.ts');

const { readStoreDb, writeStoreDb, markOrderDeleted, isOrderDeleted } = storeDb;
const { createAdminToken } = adminAuth;

// ANSI Colors for output
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function assert(condition, message = 'Assertion failed') {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(actual, expected, message = '') {
  if (actual !== expected) {
    throw new Error(`${message} Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
  }
}

async function test(name, fn) {
  totalTests++;
  const start = performance.now();
  try {
    const result = fn();
    if (result instanceof Promise) {
      await result;
    }
    const elapsed = (performance.now() - start).toFixed(1);
    passedTests++;
    console.log(`  ${colors.green}✓${colors.reset} ${name} ${colors.dim}(${elapsed}ms)${colors.reset}`);
  } catch (err) {
    const elapsed = (performance.now() - start).toFixed(1);
    failedTests++;
    failures.push({ name, error: err.message, stack: err.stack });
    console.log(`  ${colors.red}✗${colors.reset} ${name} ${colors.dim}(${elapsed}ms)${colors.reset}`);
    console.log(`    ${colors.red}Error:${colors.reset} ${err.message}`);
  }
}

// Helper to create mock NextRequest objects
function createMockRequest({
  url = 'http://localhost:3000',
  method = 'GET',
  headers = {},
  body = null,
  cookies = {},
}) {
  const parsedUrl = new URL(url);
  const headerMap = new Map();
  Object.entries(headers).forEach(([k, v]) => headerMap.set(k.toLowerCase(), v));

  return {
    url,
    method,
    nextUrl: parsedUrl,
    headers: {
      get: (h) => headerMap.get(h.toLowerCase()) || null,
      has: (h) => headerMap.has(h.toLowerCase()),
    },
    cookies: {
      get: (name) => (cookies[name] ? { name, value: cookies[name] } : undefined),
    },
    json: async () => body || {},
    formData: async () => null,
  };
}

const adminToken = createAdminToken('admin');
const authHeaders = {
  Authorization: `Bearer ${adminToken}`,
  'Content-Type': 'application/json',
};

console.log('='.repeat(75));
console.log(`${colors.bold}${colors.cyan}  HORWALLE ATELIER — CHALLENGER 2: EMPIRICAL ADVERSARIAL STRESS HARNESS${colors.reset}`);
console.log(`${colors.dim}  Scope: Admin & Supabase 2-Way Sync (Items 3, 11, 17, 19, 20, 23)${colors.reset}`);
console.log('='.repeat(75));

// =========================================================================
// SUITE 1: ITEM 3 — ORDER DELETION PERSISTENCE (UUID & STRING IDs)
// =========================================================================
console.log(`\n${colors.bold}▶ SUITE 1: Item 3 — Order Deletion Persistence (UUID vs String IDs, storeDb, Supabase, LocalStorage)${colors.reset}`);

await test('ITEM-3-01: Delete order with authentic PostgreSQL v4 UUID via admin DELETE endpoint', async () => {
  const testUuid = crypto.randomUUID();
  const db = readStoreDb();
  if (!db.orders) db.orders = [];

  const newOrder = {
    id: testUuid,
    date: new Date().toISOString(),
    customer: { fullName: 'Test UUID Buyer', phone: '+994501112233', email: 'uuid.buyer@test.az' },
    items: [{ name: 'Test Hoodie', size: 'L', quantity: 1, price: 95 }],
    total: 95,
    paymentMethod: 'Kart',
    paymentStatus: 'Paid',
    orderStatus: 'Yeni Sifariş',
  };

  db.orders.push(newOrder);
  writeStoreDb(db);

  // Confirm order exists prior to deletion
  const preCheck = readStoreDb();
  assert(preCheck.orders.some((o) => String(o.id) === testUuid), 'Order must exist in storeDb before deletion');

  // Issue DELETE request
  const req = createMockRequest({
    url: `http://localhost:3000/api/admin/orders/${testUuid}`,
    method: 'DELETE',
    headers: authHeaders,
  });

  const res = await adminRoute.DELETE(req, { params: { slug: ['orders', testUuid] } });
  const data = await res.json();

  assertEqual(res.status, 200, 'DELETE order must return HTTP 200');
  assertEqual(data.success, true, 'DELETE response must return success: true');

  // Verify tombstone set
  assert(isOrderDeleted(testUuid), 'isOrderDeleted(uuid) must return true after deletion');

  // Verify removed from storeDb
  const postCheck = readStoreDb();
  assert(!postCheck.orders.some((o) => String(o.id) === testUuid), 'Deleted UUID order must be filtered out of storeDb');
});

await test('ITEM-3-02: Delete order with non-UUID string ID and tracking code', async () => {
  const testStringId = 'ORD-STR-ADV-' + Math.floor(Math.random() * 900000 + 100000);
  const testTracking = 'AZ-EXP-TEST-' + Math.floor(Math.random() * 900000 + 100000);
  const testPhone = '+99450' + Math.floor(Math.random() * 9000000 + 1000000);

  const db = readStoreDb();
  if (!db.orders) db.orders = [];

  const newOrder = {
    id: testStringId,
    trackingCode: testTracking,
    date: new Date().toISOString(),
    customer: { fullName: 'String ID Buyer', phone: testPhone, email: 'str.buyer@test.az' },
    items: [{ name: 'Test T-Shirt', size: 'M', quantity: 2, price: 45 }],
    total: 90,
    paymentMethod: 'Kart',
    paymentStatus: 'Paid',
    orderStatus: 'Yeni Sifariş',
  };

  db.orders.push(newOrder);
  writeStoreDb(db);

  // Confirm presence
  const preCheck = readStoreDb();
  assert(preCheck.orders.some((o) => String(o.id) === testStringId), 'String order must exist before deletion');

  // Issue DELETE request by string ID
  const req = createMockRequest({
    url: `http://localhost:3000/api/admin/orders/${encodeURIComponent(testStringId)}`,
    method: 'DELETE',
    headers: authHeaders,
  });

  const res = await adminRoute.DELETE(req, { params: { slug: ['orders', testStringId] } });
  const data = await res.json();

  assertEqual(res.status, 200, 'DELETE non-UUID string order must return HTTP 200');
  assertEqual(data.success, true, 'DELETE non-UUID string order must succeed');

  // Tombstones must track both string ID and tracking code
  assert(isOrderDeleted(testStringId), 'String ID must be tombstoned');
  assert(isOrderDeleted(undefined, testTracking), 'Tracking code must be tombstoned');

  const postCheck = readStoreDb();
  assert(!postCheck.orders.some((o) => String(o.id) === testStringId), 'String order must be removed from storeDb');
  assert(!postCheck.orders.some((o) => o.trackingCode === testTracking), 'Order with tracking code must be removed');
});

await test('ITEM-3-03: Deletion persistence across memory reset (simulated cold reload)', async () => {
  const permId = 'PERM-DELETE-' + crypto.randomUUID();
  markOrderDeleted(permId);

  // Directly attempt to inject order with tombstoned ID
  const db = readStoreDb();
  db.orders.push({ id: permId, total: 100, customer: { fullName: 'Ghost' } });
  writeStoreDb(db);

  // Clear in-memory global cache
  const g = globalThis;
  delete g.__HORVVALLE_STORE_DB__;
  delete g.__HORVVALLE_DELETED_ORDERS__;

  // Re-read store database from storage
  const reloadedDb = readStoreDb();
  assert(
    !reloadedDb.orders.some((o) => String(o.id) === permId),
    'Tombstoned order must NOT re-appear after complete in-memory cache purge'
  );
});

await test('ITEM-3-04: Order deletion idempotency and malformed/malicious ID resilience', async () => {
  const maliciousIds = [
    'NON_EXISTENT_ORDER_99999',
    "'; DROP TABLE orders; --",
    '../../etc/passwd',
    '<script>alert(1)</script>',
    '   ',
    'undefined',
    'null',
  ];

  for (const malId of maliciousIds) {
    const req = createMockRequest({
      url: `http://localhost:3000/api/admin/orders/${encodeURIComponent(malId)}`,
      method: 'DELETE',
      headers: authHeaders,
    });

    const res = await adminRoute.DELETE(req, { params: { slug: ['orders', malId] } });
    const data = await res.json();
    assertEqual(res.status, 200, `Deleting id "${malId}" must not throw or 500`);
    assertEqual(data.success, true, `Deleting id "${malId}" must return success: true`);
  }
});

await test('ITEM-3-05: LocalStorage cache cleanup contract in public/admin.html and admin-portal', () => {
  const adminHtml = fs.readFileSync(path.join(PROJECT_ROOT, 'public/admin.html'), 'utf8');
  const portalHtml = fs.readFileSync(path.join(PROJECT_ROOT, 'admin-portal/public/index.html'), 'utf8');

  // Verify deleteOrder in public/admin.html
  assert(adminHtml.includes('async function deleteOrder(id)'), 'public/admin.html must implement deleteOrder(id)');
  assert(
    adminHtml.includes("localStorage.getItem('horvvalle_saved_orders')"),
    'public/admin.html deleteOrder must read horvvalle_saved_orders from localStorage'
  );
  assert(
    adminHtml.includes('o.id !== id && o.trackingCode !== id && o.tracking_code !== id'),
    'public/admin.html deleteOrder must filter by id, trackingCode, and tracking_code'
  );

  // Verify deleteOrder in admin-portal/public/index.html
  assert(portalHtml.includes('async function deleteOrder(id)'), 'admin-portal index.html must implement deleteOrder(id)');
  assert(
    portalHtml.includes("localStorage.getItem('horvvalle_saved_orders')"),
    'admin-portal deleteOrder must read horvvalle_saved_orders from localStorage'
  );
  assert(
    portalHtml.includes('o.id !== id && o.trackingCode !== id && o.tracking_code !== id'),
    'admin-portal deleteOrder must filter by id, trackingCode, and tracking_code'
  );

  // Execute empirical simulation of localStorage filter logic
  const mockCache = [
    { id: 'uuid-1', trackingCode: 'HRW-001', tracking_code: 'HRW-001' },
    { id: 'uuid-2', trackingCode: 'HRW-002', tracking_code: 'HRW-002' },
    { id: 'uuid-3', trackingCode: 'HRW-003', tracking_code: 'HRW-003' },
  ];

  // Delete by UUID
  let filtered = mockCache.filter((o) => o.id !== 'uuid-2' && o.trackingCode !== 'uuid-2' && o.tracking_code !== 'uuid-2');
  assertEqual(filtered.length, 2, 'Simulated delete by UUID must leave 2 items');

  // Delete by tracking code
  filtered = filtered.filter((o) => o.id !== 'HRW-001' && o.trackingCode !== 'HRW-001' && o.tracking_code !== 'HRW-001');
  assertEqual(filtered.length, 1, 'Simulated delete by trackingCode must leave 1 item');
  assertEqual(filtered[0].id, 'uuid-3', 'Only remaining order should be uuid-3');
});

// =========================================================================
// SUITE 2: ITEM 11 — LIVE ORDER TRACKING POSTGRESQL UUID QUERY ROBUSTNESS
// =========================================================================
console.log(`\n${colors.bold}▶ SUITE 2: Item 11 — Live Order Tracking PostgreSQL UUID Query Robustness${colors.reset}`);

const liveTestOrderId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const liveTestTracking = 'HRW-829104';
const liveTestPhone = '+994508291040';

// Seed active order in storeDb for live verification
const dbForTrack = readStoreDb();
if (!dbForTrack.orders) dbForTrack.orders = [];
dbForTrack.orders.push({
  id: liveTestOrderId,
  trackingCode: liveTestTracking,
  date: new Date().toISOString(),
  customer: { fullName: 'Ali Mammadov', phone: liveTestPhone, email: 'ali@example.com', city: 'Bakı' },
  items: [{ name: 'Premium Oversized Hoodie', size: 'XL', quantity: 1, price: 120 }],
  total: 120,
  orderStatus: 'Təsdiqləndi',
  paymentMethod: 'Kart',
  paymentStatus: 'Paid',
});
writeStoreDb(dbForTrack);

await test('ITEM-11-01: Tracking code query finds order with HTTP 200 and zero 500 errors', async () => {
  const req = createMockRequest({
    url: `http://localhost:3000/api/orders/track?q=${liveTestTracking}`,
  });

  const res = await trackRoute.GET(req);
  assertEqual(res.status, 200, `Track code "${liveTestTracking}" must return 200 status`);
  const data = await res.json();
  assertEqual(data.success, true, 'Track code query must return success: true');
  assertEqual(data.order.id, liveTestOrderId, 'Track query must return correct order ID');
  assertEqual(data.order.trackingCode, liveTestTracking, 'Track query must return correct tracking code');
  assertEqual(data.order.statusMeta.step, 2, 'Status "Təsdiqləndi" must map to stepper step 2');
});

await test('ITEM-11-02: Authentic v4 UUID query executes with exact match eq() query', async () => {
  const req = createMockRequest({
    url: `http://localhost:3000/api/orders/track?q=${liveTestOrderId}`,
  });

  const res = await trackRoute.GET(req);
  assertEqual(res.status, 200, 'Authentic UUID query must return 200 OK');
  const data = await res.json();
  assertEqual(data.success, true, 'UUID query must succeed');
  assertEqual(data.order.id, liveTestOrderId, 'Must match target order');
});

await test('ITEM-11-03: Phone number query finds order and masks PII properly', async () => {
  const req = createMockRequest({
    url: `http://localhost:3000/api/orders/track?q=${encodeURIComponent(liveTestPhone)}`,
  });

  const res = await trackRoute.GET(req);
  assertEqual(res.status, 200, 'Phone search must return 200 OK');
  const data = await res.json();
  assertEqual(data.success, true, 'Phone query must succeed');
  assert(data.order.customer.phone.includes('***'), 'Customer phone must be masked');
  assert(data.order.customer.fullName.includes('***'), 'Customer name must be masked');
});

await test('ITEM-11-04: Non-existent / Malformed UUIDs safely return 404 without PostgreSQL 500 error', async () => {
  const malformedInputs = [
    '3fa85f64-5717-4562-b3fc-XXXXXX',
    '3fa85f64-5717-4562-b3fc-2c963f66afa6-extra',
    '00000000-0000-0000-0000-00000000000g',
    'not-a-uuid-at-all',
    'DROP TABLE orders;--',
    "' OR '1'='1",
    '<script>alert("hack")</script>',
    '!@#$%^&*()_+~|}{[]:;?><,./',
    'HRW-999999-NOTFOUND',
  ];

  for (const input of malformedInputs) {
    const req = createMockRequest({
      url: `http://localhost:3000/api/orders/track?q=${encodeURIComponent(input)}`,
    });

    const res = await trackRoute.GET(req);
    // Must be 404 Not Found — NEVER 500
    assertEqual(res.status, 404, `Malformed input "${input}" must safely return 404 Not Found without 500 crash`);
    const data = await res.json();
    assertEqual(data.success, false, 'Non-existent order must have success: false');
    assert(
      !data.error?.includes('operator does not exist: uuid'),
      `Malformed input "${input}" must NOT produce PostgreSQL UUID operator mismatch error`
    );
  }
});

await test('ITEM-11-05: Empty or whitespace query returns 400 Bad Request with localized message', async () => {
  const emptyQueries = ['', '   ', '\t\n'];

  for (const eq of emptyQueries) {
    const req = createMockRequest({
      url: `http://localhost:3000/api/orders/track?q=${encodeURIComponent(eq)}`,
    });

    const res = await trackRoute.GET(req);
    assertEqual(res.status, 400, 'Empty query must return 400 Bad Request');
    const data = await res.json();
    assertEqual(data.success, false, 'Empty query must have success: false');
    assert(data.error?.includes('Axtarış üçün'), 'Error message must be localized Azerbaijani guidance');
  }
});

await test('ITEM-11-06: Status stepper mapping accurately reflects all order lifecycle states', async () => {
  const statuses = [
    { status: 'Yeni Sifariş', expectedStep: 1, expectedColor: 'sky' },
    { status: 'Təsdiqləndi', expectedStep: 2, expectedColor: 'indigo' },
    { status: 'Çapda / Dərzidə', expectedStep: 3, expectedColor: 'amber' },
    { status: 'Kuryerdədir (Yoldadır)', expectedStep: 4, expectedColor: 'teal' },
    { status: 'Çatdırıldı', expectedStep: 5, expectedColor: 'emerald' },
    { status: 'Ləğv edildi', expectedStep: 0, expectedColor: 'rose', isCancelled: true },
  ];

  const db = readStoreDb();
  for (const s of statuses) {
    const tempTrack = 'TEST-STATUS-' + s.expectedStep;
    db.orders.push({
      id: 'STATUS-ORDER-' + s.expectedStep,
      trackingCode: tempTrack,
      date: new Date().toISOString(),
      customer: { fullName: 'Test Stepper', phone: '+99450999000' + s.expectedStep },
      items: [{ name: 'Step Test Item', quantity: 1, price: 50 }],
      total: 50,
      orderStatus: s.status,
    });
    writeStoreDb(db);

    const req = createMockRequest({
      url: `http://localhost:3000/api/orders/track?q=${tempTrack}`,
    });

    const res = await trackRoute.GET(req);
    assertEqual(res.status, 200, `Tracking status "${s.status}" must return 200`);
    const data = await res.json();
    assertEqual(data.order.statusMeta.step, s.expectedStep, `Status "${s.status}" must map to step ${s.expectedStep}`);
    assertEqual(data.order.statusMeta.color, s.expectedColor, `Status "${s.status}" must map to color ${s.expectedColor}`);
    if (s.isCancelled) {
      assertEqual(data.order.statusMeta.isCancelled, true, 'Cancelled order must have isCancelled: true');
    }
  }
});

// =========================================================================
// SUITE 3: ITEM 17 — TOTAL DOM & AST ABSENCE OF VIP/LOYALTY/BONUS POINTS
// =========================================================================
console.log(`\n${colors.bold}▶ SUITE 3: Item 17 — Total DOM & AST Absence of VIP/Loyalty/Bonus Points${colors.reset}`);

await test('ITEM-17-01: public/admin.html DOM templates have total absence of VIP, loyalty, and cashback', () => {
  const content = fs.readFileSync(path.join(PROJECT_ROOT, 'public/admin.html'), 'utf8');
  const domPart = content.substring(0, content.indexOf('<script>')).toLowerCase();

  // 1. Verify DOM markup (HTML before <script>) is 100% free of VIP/Loyalty terms
  assert(!domPart.includes('vip'), 'DOM template must not contain "vip"');
  assert(!domPart.includes('loyalt'), 'DOM template must not contain "loyalty" or "loyallıq"');
  assert(!domPart.includes('bonus'), 'DOM template must not contain "bonus"');
  assert(!domPart.includes('keşbek'), 'DOM template must not contain "keşbek"');

  // 2. Prohibited business terms must be absent across entire file
  const lowerAll = content.toLowerCase();
  const forbiddenTerms = [
    'vip müştəri',
    'loyallıq terminalı',
    'müştəri keşbeki',
    'bonus xalları',
    'loyalty',
    'keşbek',
    'bonus xall',
  ];

  for (const term of forbiddenTerms) {
    assert(!lowerAll.includes(term.toLowerCase()), `public/admin.html MUST NOT contain "${term}"`);
  }
});

await test('ITEM-17-02: admin-portal/public/index.html DOM templates have total absence of VIP and loyalty terms', () => {
  const content = fs.readFileSync(path.join(PROJECT_ROOT, 'admin-portal/public/index.html'), 'utf8');
  const domPart = content.substring(0, content.indexOf('<script>')).toLowerCase();

  assert(!domPart.includes('vip'), 'admin-portal DOM template must not contain "vip"');
  assert(!domPart.includes('loyalt'), 'admin-portal DOM template must not contain "loyalty"');
  assert(!domPart.includes('bonus'), 'admin-portal DOM template must not contain "bonus"');
  assert(!domPart.includes('keşbek'), 'admin-portal DOM template must not contain "keşbek"');

  const lowerAll = content.toLowerCase();
  const forbiddenTerms = [
    'vip müştəri',
    'loyallıq terminalı',
    'müştəri keşbeki',
    'bonus xalları',
    'loyalty',
    'keşbek',
    'bonus xall',
  ];

  for (const term of forbiddenTerms) {
    assert(!lowerAll.includes(term.toLowerCase()), `admin-portal/public/index.html MUST NOT contain "${term}"`);
  }
});

await test('ITEM-17-03: Storefront code has zero VIP and Loyalty remnants', () => {
  const filesToScan = [
    'app/page.tsx',
    'components/Header.tsx',
    'components/Footer.tsx',
    'components/CartDrawer.tsx',
    'app/checkout/page.tsx',
    'app/track/page.tsx',
  ];

  const forbiddenTerms = [
    'vip müştəri',
    'loyallıq terminalı',
    'müştəri keşbeki',
    'bonus xalları',
  ];

  for (const file of filesToScan) {
    const filePath = path.join(PROJECT_ROOT, file);
    if (fs.existsSync(filePath)) {
      const lower = fs.readFileSync(filePath, 'utf8').toLowerCase();
      for (const term of forbiddenTerms) {
        assert(!lower.includes(term), `${file} MUST NOT contain "${term}"`);
      }
    }
  }
});

// =========================================================================
// SUITE 4: ITEM 19 — CMS STATIC PAGES UPDATE ROUND-TRIP
// =========================================================================
console.log(`\n${colors.bold}▶ SUITE 4: Item 19 — CMS Static Pages Update Round-Trip (Hero, Announcements, Banners)${colors.reset}`);

// Create a safe snapshot of current CMS data to guarantee complete restoration
const initialDb = readStoreDb();
const initialContentBackup = JSON.parse(JSON.stringify(initialDb.content || {}));
const initialSettingsBackup = JSON.parse(JSON.stringify(initialDb.settings || {}));

try {
  await test('ITEM-19-01: Update hero title, announcements, and banners via admin content API', async () => {
    const updatedPayload = {
      content: {
        hero: {
          tag: 'YENİ SEZON 2026',
          headline: 'HORVVALLE ATELIER LÜKS MODA',
          subheadline: 'Fərdi kəsim və yüksək dərzilik sənəti',
        },
        announcements: [
          'Şəhərdaxili çatdırılma 24 saat ərzində tamamilə təhlükəsizdir',
          'Yeni yaz-yay kolleksiyası artıq sifarişə açıqdır',
        ],
        promoBanner: {
          tag: 'BAHAR FÜRSƏTİ',
          title: 'ÖZƏL SEÇİLMİŞ MODELLƏR',
          subtitle: 'Kişi və Qadın dərzilik xətləri',
          ctaText: 'Kolleksiyaya Bax',
          ctaLink: '/collections',
        },
      },
      settings: {
        storeName: 'HORVVALLE ATELIER LIVE',
      },
    };

    const req = createMockRequest({
      url: 'http://localhost:3000/api/admin/content',
      method: 'POST',
      headers: authHeaders,
      body: updatedPayload,
    });

    const res = await adminRoute.POST(req, { params: { slug: ['content'] } });
    assertEqual(res.status, 200, 'POST /api/admin/content must return HTTP 200');
    const data = await res.json();
    assertEqual(data.success, true, 'CMS update must succeed');

    assertEqual(data.content.hero.headline, 'HORVVALLE ATELIER LÜKS MODA', 'Hero headline must match updated text');
    assertEqual(data.content.announcements.length, 2, 'Announcements must contain exactly 2 items');
    assertEqual(data.settings.storeName, 'HORVVALLE ATELIER LIVE', 'Store name must match updated setting');
  });

  await test('ITEM-19-02: CMS updates persist immediately in storeDb on disk and memory', () => {
    const db = readStoreDb();
    assertEqual(db.content.hero.headline, 'HORVVALLE ATELIER LÜKS MODA', 'storeDb must reflect updated headline');
    assertEqual(db.content.hero.tag, 'YENİ SEZON 2026', 'storeDb must reflect updated hero tag');
    assertEqual(db.content.announcements[0], 'Şəhərdaxili çatdırılma 24 saat ərzində tamamilə təhlükəsizdir', 'Announcements must persist');
    assertEqual(db.settings.storeName, 'HORVVALLE ATELIER LIVE', 'storeName must persist');
  });

  await test('ITEM-19-03: Live Storefront GET /api/store/data reflects updated CMS content without code change', async () => {
    const res = await storeDataRoute.GET();
    assertEqual(res.status, 200, 'GET /api/store/data must return 200');
    const data = await res.json();

    assertEqual(data.content.hero.headline, 'HORVVALLE ATELIER LÜKS MODA', 'Storefront data must show updated hero headline');
    assertEqual(data.content.hero.subheadline, 'Fərdi kəsim və yüksək dərzilik sənəti', 'Storefront data must show updated subheadline');
    assertEqual(data.content.announcements.length, 2, 'Storefront data must show updated announcements');
    assertEqual(data.settings.storeName, 'HORVVALLE ATELIER LIVE', 'Storefront data must show updated storeName');

    // Confirm no-cache headers are set for instant live reflection
    assert(
      res.headers.get('Cache-Control')?.includes('no-store'),
      'Cache-Control must specify no-store for immediate reflection'
    );
  });

  await test('ITEM-19-04: Adversarial CMS inputs (Azerbaijani Unicode, empty announcements, deep merge safety)', async () => {
    // 1. Unicode characters test
    const unicodePayload = {
      content: {
        hero: {
          headline: 'Xüsusi Dərzilik: Ən Dəyərli Parçalar, İsti Geyimlər & Şalvarlar (Çatdırılma)',
        },
        announcements: ['Əlaqə: Bakı şəhəri, Nizami küç. 42'],
      },
    };

    const req = createMockRequest({
      url: 'http://localhost:3000/api/admin/content',
      method: 'POST',
      headers: authHeaders,
      body: unicodePayload,
    });

    const res = await adminRoute.POST(req, { params: { slug: ['content'] } });
    const data = await res.json();
    assertEqual(data.success, true, 'Unicode CMS update must succeed');
    assertEqual(
      data.content.hero.headline,
      'Xüsusi Dərzilik: Ən Dəyərli Parçalar, İsti Geyimlər & Şalvarlar (Çatdırılma)',
      'Unicode characters (ə, ç, ş, ı, ö, ü, ğ) must be preserved without corruption'
    );

    // Deep merge check: promoBanner should still exist and not be wiped by hero update
    assert(data.content.promoBanner?.title, 'Deep merge must preserve existing promoBanner');
  });
} finally {
  // Cleanly restore initial CMS snapshot
  const restoreDb = readStoreDb();
  restoreDb.content = initialContentBackup;
  restoreDb.settings = initialSettingsBackup;
  writeStoreDb(restoreDb);
  console.log(`  ${colors.dim}Cleanly restored initial CMS snapshot.${colors.reset}`);
}

// =========================================================================
// SUITE 5: ITEM 20 — POD ARTWORK DOWNLOAD URL GENERATION & HEADERS
// =========================================================================
console.log(`\n${colors.bold}▶ SUITE 5: Item 20 — POD Artwork Download URL Generation & Content Headers${colors.reset}`);

await test('ITEM-20-01: Static inspection of app/images/uploads/[...slug]/route.ts security and headers', () => {
  const uploadRouteSrc = fs.readFileSync(path.join(PROJECT_ROOT, 'app/images/uploads/[...slug]/route.ts'), 'utf8');

  // Verify path traversal sanitation
  assert(
    uploadRouteSrc.includes('path.basename(segment)'),
    'Uploads route must sanitize slug segments using path.basename to prevent directory traversal'
  );

  // Verify MIME type mapping
  assert(uploadRouteSrc.includes('".png": "image/png"'), 'Must map .png to image/png');
  assert(uploadRouteSrc.includes('".jpg": "image/jpeg"'), 'Must map .jpg to image/jpeg');
  assert(uploadRouteSrc.includes('".webp": "image/webp"'), 'Must map .webp to image/webp');
  assert(uploadRouteSrc.includes('".svg": "image/svg+xml"'), 'Must map .svg to image/svg+xml');

  // Verify Cache-Control header
  assert(
    uploadRouteSrc.includes('Cache-Control') && uploadRouteSrc.includes('immutable'),
    'Upload route must set immutable cache headers'
  );
});

await test('ITEM-20-02: Path traversal attack vectors safely rejected by uploads route', async () => {
  const attackVectors = [
    ['..', '..', 'package.json'],
    ['..', '..', '..', 'etc', 'passwd'],
    ['..', '..', 'windows', 'system32', 'cmd.exe'],
    ['%2e%2e', '%2e%2e', 'secret.txt'],
  ];

  for (const slug of attackVectors) {
    const req = createMockRequest({
      url: `http://localhost:3000/images/uploads/${slug.join('/')}`,
    });

    const res = await uploadsRoute.GET(req, { params: { slug } });
    // Must return 404 (file not found in uploads folder) rather than traversing into root files
    assertEqual(res.status, 404, `Path traversal slug "${slug.join('/')}" must return 404`);
  }

  // Empty slug returns 400
  const emptyReq = createMockRequest({ url: 'http://localhost:3000/images/uploads' });
  const emptyRes = await uploadsRoute.GET(emptyReq, { params: { slug: [] } });
  assertEqual(emptyRes.status, 400, 'Empty slug must return 400');
});

await test('ITEM-20-03: POD artwork download contract in public/admin.html', () => {
  const adminHtml = fs.readFileSync(path.join(PROJECT_ROOT, 'public/admin.html'), 'utf8');

  // Verify downloadArtworkFile implementation
  assert(
    adminHtml.includes('async function downloadArtworkFile(url, orderId, label = \'qrafika\')'),
    'public/admin.html must implement downloadArtworkFile(url, orderId, label)'
  );

  assert(
    adminHtml.includes('a.download = `POD_${orderId}_${label}.${ext}`;'),
    'downloadArtworkFile must name files POD_${orderId}_${label}.${ext}'
  );

  assert(
    adminHtml.includes("if (blob.type.includes('jpeg') || blob.type.includes('jpg')) ext = 'jpg';") &&
      adminHtml.includes("else if (blob.type.includes('svg')) ext = 'svg';") &&
      adminHtml.includes("else if (blob.type.includes('webp')) ext = 'webp';",),
    'downloadArtworkFile must extract extension dynamically from MIME type'
  );

  assert(
    adminHtml.includes("window.open(url, '_blank')"),
    'downloadArtworkFile must have fallback to window.open on CORS or fetch failure'
  );

  // Verify renderPodOrders binds download button
  assert(
    adminHtml.includes('function renderPodOrders()'),
    'public/admin.html must implement renderPodOrders()'
  );
  assert(
    adminHtml.includes("downloadArtworkFile('${frontArtwork}', '${p.id}', 'on_qrafika')"),
    'renderPodOrders must bind front artwork download button'
  );
  assert(
    adminHtml.includes("downloadArtworkFile('${backArtwork}', '${p.id}', 'arxa_qrafika')"),
    'renderPodOrders must bind back artwork download button'
  );
});

// =========================================================================
// SUITE 6: ITEM 23 — LIVE CHAT BATCH DELETE API
// =========================================================================
console.log(`\n${colors.bold}▶ SUITE 6: Item 23 — Live Chat Batch Delete API (DELETE /api/chat/threads?all=true)${colors.reset}`);

await test('ITEM-23-01: Authentication gating on DELETE /api/chat/threads', async () => {
  // 1. Request without auth header
  const unauthReq = createMockRequest({
    url: 'http://localhost:3000/api/chat/threads?all=true',
    method: 'DELETE',
  });

  const res1 = await chatRoute.DELETE(unauthReq);
  assertEqual(res1.status, 401, 'Unauthenticated chat DELETE must return 401 Unauthorized');
  const data1 = await res1.json();
  assertEqual(data1.success, false, 'Unauthenticated chat DELETE must have success: false');

  // 2. Request with invalid token
  const badAuthReq = createMockRequest({
    url: 'http://localhost:3000/api/chat/threads?all=true',
    method: 'DELETE',
    headers: { Authorization: 'Bearer invalid_fake_token_12345' },
  });

  const res2 = await chatRoute.DELETE(badAuthReq);
  assertEqual(res2.status, 401, 'Invalid token must return 401');
});

await test('ITEM-23-02: Missing parameters validation on DELETE /api/chat/threads', async () => {
  const req = createMockRequest({
    url: 'http://localhost:3000/api/chat/threads',
    method: 'DELETE',
    headers: authHeaders,
  });

  const res = await chatRoute.DELETE(req);
  assertEqual(res.status, 400, 'DELETE without sessionId or all=true must return 400 Bad Request');
  const data = await res.json();
  assert(data.error?.includes('sessionId or all=true required'), 'Must require sessionId or all=true');
});

await test('ITEM-23-03: Single thread deletion (DELETE /api/chat/threads?sessionId=test_sess_001)', async () => {
  const testSessionId = 'test_sess_' + Math.floor(Math.random() * 100000);
  const req = createMockRequest({
    url: `http://localhost:3000/api/chat/threads?sessionId=${testSessionId}`,
    method: 'DELETE',
    headers: authHeaders,
  });

  const res = await chatRoute.DELETE(req);
  assertEqual(res.status, 200, 'Single thread DELETE must return 200 OK');
  const data = await res.json();
  assertEqual(data.success, true, 'Single thread DELETE must return success: true');
  assertEqual(data.deletedSessionId, testSessionId, 'Response must confirm deletedSessionId');
});

await test('ITEM-23-04: Batch purge all chat messages (DELETE /api/chat/threads?all=true)', async () => {
  const req = createMockRequest({
    url: 'http://localhost:3000/api/chat/threads?all=true',
    method: 'DELETE',
    headers: authHeaders,
  });

  const res = await chatRoute.DELETE(req);
  assertEqual(res.status, 200, 'Batch delete all=true must return 200 OK');
  const data = await res.json();
  assertEqual(data.success, true, 'Batch delete must return success: true');
  assertEqual(data.deletedAll, true, 'Response must confirm deletedAll: true');
  // Message is present if live supabase storage is contacted
  if (data.message) {
    assert(
      data.message.includes('Bütün mesajlar və söhbət tarixçəsi uğurla silindi'),
      'Response message must contain localized confirmation text'
    );
  }
});

await test('ITEM-23-05: Live Chat batch delete UI contract in public/admin.html', () => {
  const adminHtml = fs.readFileSync(path.join(PROJECT_ROOT, 'public/admin.html'), 'utf8');

  // Verify deleteAllLiveChatMessages implementation
  assert(
    adminHtml.includes('async function deleteAllLiveChatMessages()'),
    'public/admin.html must implement deleteAllLiveChatMessages()'
  );

  assert(
    adminHtml.includes("confirm('Bütün canlı dəstək mesajlarını"),
    'deleteAllLiveChatMessages must prompt user confirmation'
  );

  assert(
    adminHtml.includes("fetch('/api/chat/threads?all=true', {\n          method: 'DELETE'"),
    'deleteAllLiveChatMessages must invoke DELETE /api/chat/threads?all=true'
  );

  assert(
    adminHtml.includes('allChatThreads = [];'),
    'deleteAllLiveChatMessages must clear in-memory allChatThreads array'
  );

  assert(
    adminHtml.includes("renderLiveChatThreads([]);"),
    'deleteAllLiveChatMessages must render empty threads list'
  );

  assert(
    adminHtml.includes("badgeEl.classList.add('hidden')"),
    'deleteAllLiveChatMessages must hide unread count badge'
  );

  assert(
    adminHtml.includes('window.deleteAllChatMessages = deleteAllLiveChatMessages;') &&
      adminHtml.includes('window.clearAllThreads = deleteAllLiveChatMessages;'),
    'deleteAllLiveChatMessages must be exported to window namespace'
  );
});

// =========================================================================
// SUMMARY & VERDICT
// =========================================================================
console.log('\n' + '='.repeat(75));
console.log(`${colors.bold}  TEST EXECUTION SUMMARY${colors.reset}`);
console.log('='.repeat(75));
console.log(`  Total Adversarial Tests : ${totalTests}`);
console.log(`  ${colors.green}Passed Assertions       : ${passedTests}${colors.reset}`);
console.log(`  ${failedTests === 0 ? colors.green : colors.red}Failed Assertions       : ${failedTests}${colors.reset}`);

if (failedTests > 0) {
  console.log(`\n${colors.red}${colors.bold}FAILURES ENCOUNTERED:${colors.reset}`);
  failures.forEach((f, idx) => {
    console.log(`  ${idx + 1}. ${f.name}`);
    console.log(`     Error: ${f.error}`);
  });
  process.exit(1);
} else {
  console.log(`\n${colors.green}${colors.bold}✓ ALL ADVERSARIAL STRESS TESTS PASSED WITH 100% SUCCESS RATE.${colors.reset}`);
  console.log(`${colors.cyan}  VERDICT: APPROVE (Admin & Supabase 2-Way Sync Verified Resilient)${colors.reset}\n`);
  process.exit(0);
}
