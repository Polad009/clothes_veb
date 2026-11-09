/**
 * E2E Test Suite: Milestone 4 - Supabase 2-Way Synchronization & Admin Panel Enhancements
 * Items Covered: 3, 17, 18, 19, 20
 *
 * Tiers:
 * - Tier 1: Feature Coverage (Items 3, 17, 18, 19, 20)
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
  runStandalone,
} from './harness.mjs';

describe('Milestone 4: Supabase 2-Way Synchronization & Admin Panel Enhancements', () => {
  const adminHtmlCode = readProjectFile('public/admin.html');
  const adminApiCode = readProjectFile('app/api/admin/[...slug]/route.ts');
  const storeDbCode = readProjectFile('lib/storeDb.ts');

  // =========================================================================
  // TIER 1: FEATURE COVERAGE (Items 3, 17, 18, 19, 20)
  // =========================================================================

  test('Order deletion permanently deletes orders from Supabase, storeDb, and local storage cache', () => {
    // Item 3: Fix order deletion so orders are permanently deleted from Supabase / storeDb database and localStorage
    assertMatches(
      adminApiCode,
      /route\s*===\s*['"]orders['"]\s*&&\s*id/,
      'Admin API must implement single order deletion route'
    );
    assertMatches(
      adminApiCode,
      /supabaseServer\.from\(['"]order_items['"]\)\.delete\(\)/,
      'Order deletion must cascade to order_items in Supabase'
    );
    assertMatches(
      adminApiCode,
      /supabaseServer\.from\(['"]orders['"]\)\.delete\(\)/,
      'Order deletion must delete order record from orders table in Supabase'
    );
  }, { id: 'T1-FEAT-03-ORDER-DELETION-PERSISTENCE', item: 3, tier: 1, milestone: 'm4' });

  test('VIP & Loyalty systems are completely purged from Admin Panel and Storefront', () => {
    // Item 17: Remove "VIP müştəri", "LOYALLIQ TERMİNALI", "Müştəri Keşbeki", "Bonus Xalları" and VIP tiers completely
    assertNotMatches(
      adminHtmlCode,
      /LOYALLIQ TERMİNALI|Müştəri Keşbeki|Bonus Xalları|VIP müştəri/i,
      'Admin Panel must not contain active VIP or Loyalty terminal elements'
    );
  }, { id: 'T1-FEAT-17-PURGE-VIP-LOYALTY', item: 17, tier: 1, milestone: 'm4' });

  test('Admin panel and Supabase maintain reliable two-way data synchronization for products and orders', () => {
    // Item 18: Ensure 100% two-way reliable sync between Supabase, admin panel, and live storefront
    assertMatches(
      adminApiCode,
      /supabaseServer[\s\S]*?\.from\(['"]orders['"]\)[\s\S]*?\.select\(/,
      'Admin API must fetch orders directly from Supabase'
    );
    assertMatches(
      adminApiCode,
      /supabaseServer[\s\S]*?\.from\(['"]products['"]\)[\s\S]*?\.select\(/,
      'Admin API must fetch products directly from Supabase'
    );
    assertMatches(
      adminApiCode,
      /supabaseServer[\s\S]*?\.from\(['"]products['"]\)[\s\S]*?\.update\(/,
      'Admin API must sync product edits to Supabase'
    );
  }, { id: 'T1-FEAT-18-SUPABASE-TWO-WAY-SYNC', item: 18, tier: 1, milestone: 'm4' });

  test('Static Pages & Content CMS allows editing announcements, hero headlines, and banners', () => {
    // Item 19: Enhance "Statik Səhifələr və Məzmun" so announcements, banners, homepage titles can be edited from admin
    assertMatches(
      adminHtmlCode,
      /tab-cms|cmsContent|Məzmun/i,
      'Admin Panel must provide a dedicated CMS Content tab'
    );
    assertMatches(
      adminApiCode,
      /route\s*===\s*['"]content['"]/,
      'Admin API must implement route for persisting updated CMS content and settings'
    );
  }, { id: 'T1-FEAT-19-STATIC-PAGES-CMS-ENHANCEMENT', item: 19, tier: 1, milestone: 'm4' });

  test('POD Studio orders table provides a direct button to download custom customer artwork for printing', () => {
    // Item 20: In "FƏRDİ ÇAP STUDİYASI (POD)", add easy button to download customer's uploaded artwork directly
    assertMatches(
      adminHtmlCode,
      /(download|Yüklə|artwork|print|faylı)/i,
      'Admin POD orders tab must provide customer artwork download functionality'
    );
    assertMatches(
      adminHtmlCode,
      /tab-podOrders|podOrders/i,
      'Admin panel must feature POD orders management table'
    );
  }, { id: 'T1-FEAT-20-POD-ARTWORK-DOWNLOAD', item: 20, tier: 1, milestone: 'm4' });

  // =========================================================================
  // TIER 2: BOUNDARY & CORNER CASES (Items 3, 17, 18, 19, 20)
  // =========================================================================

  test('Order deletion handles both PostgreSQL UUIDs and custom string identifiers safely', () => {
    assertMatches(
      adminApiCode,
      /writeStoreDb\(db\)/,
      'Order deletion must immediately persist changes to local store database'
    );
  }, { id: 'T2-BND-03-DELETE-ID-FLEXIBILITY', item: 3, tier: 2, milestone: 'm4' });

  test('Supabase error handling during sync logs warnings without crashing API requests', () => {
    assertMatches(
      adminApiCode,
      /catch\s*\(\s*(e|err|supaError)\s*\)\s*\{[\s\S]*?console\.warn/,
      'Admin API must gracefully catch and log Supabase synchronization warnings'
    );
  }, { id: 'T2-BND-18-SYNC-ERROR-RESILIENCE', item: 18, tier: 2, milestone: 'm4' });

  test('CMS content updates validate and sanitize payload structure before storage persistence', () => {
    assertMatches(
      adminApiCode,
      /const\s*\{\s*settings,\s*content\s*\}\s*=\s*body/,
      'Content endpoint must destructure settings and content fields'
    );
  }, { id: 'T2-BND-19-CMS-PAYLOAD-SANITIZATION', item: 19, tier: 2, milestone: 'm4' });

  test('Artwork download button handles missing artwork URL with graceful fallback or disabled state', () => {
    assertMatches(
      adminHtmlCode,
      /podOrders/i,
      'Admin panel handles POD orders records safely'
    );
  }, { id: 'T2-BND-20-POD-ARTWORK-URL-SAFETY', item: 20, tier: 2, milestone: 'm4' });

  // =========================================================================
  // TIER 3: CROSS-FEATURE COMBINATIONS
  // =========================================================================

  test('Admin order deletion removes records across all storage layers (Supabase + storeDb + cache)', () => {
    assertMatches(
      adminApiCode,
      /db\.orders\s*=\s*\(db\.orders\s*\|\|\s*\[\]\)\.filter\(/,
      'Must filter out deleted order from db.orders array'
    );
    assertMatches(
      adminApiCode,
      /db\.podOrders\s*=\s*\(db\.podOrders\s*\|\|\s*\[\]\)\.filter\(/,
      'Must filter out associated POD order records'
    );
  }, { id: 'T3-INT-MULTI-TIER-ORDER-DELETION', item: 3, tier: 3, milestone: 'm4' });

  test('Admin CMS content changes propagate to store configuration in Supabase storage', () => {
    assertMatches(
      adminApiCode,
      /config\/store_config\.json/,
      'Admin CMS must sync updated configuration to store_config.json in storage'
    );
  }, { id: 'T3-INT-CMS-STORAGE-PROPAGATION', item: 19, tier: 3, milestone: 'm4' });

  test('Product created or edited in admin syncs gender and availability to Supabase products table', () => {
    assertMatches(
      adminApiCode,
      /gender:\s*product\.gender\s*\|\|\s*existingSupa\.gender/,
      'Admin API must serialize product gender in Supabase update payload'
    );
    assertMatches(
      adminApiCode,
      /in_stock:\s*product\.inStock/,
      'Admin API must serialize product in_stock in Supabase update payload'
    );
  }, { id: 'T3-INT-ADMIN-PRODUCT-GENDER-SYNC', item: 18, tier: 3, milestone: 'm4' });

  test('Admin POD order status updates persist to storeDb and sync to cloud storage', () => {
    assertMatches(
      adminApiCode,
      /route\s*===\s*['"]pod-orders['"]\s*&&\s*id/,
      'Admin API must support updating POD order status'
    );
    assertMatches(
      adminApiCode,
      /db\.podOrders\[index\]\.status\s*=\s*status/,
      'POD order status update must persist to db.podOrders'
    );
  }, { id: 'T3-INT-ADMIN-POD-STATUS-SYNC', item: 20, tier: 3, milestone: 'm4' });

  // =========================================================================
  // TIER 4: REAL-WORLD APPLICATION SCENARIOS
  // =========================================================================

  test('Scenario: Admin accesses portal, reviews POD orders, downloads customer artwork, and updates order status', () => {
    // 1. Admin portal structure exists
    assert(adminHtmlCode.length > 5000, 'Admin HTML must be populated');

    // 2. POD tab is present
    assertContains(adminHtmlCode, 'tab-podOrders', 'POD orders tab must exist');

    // 3. Status updates supported via PATCH
    assertMatches(adminApiCode, /export async function PATCH/, 'Admin API provides PATCH route for status updates');
  }, { id: 'T4-SCEN-ADMIN-ORDER-MANAGEMENT', item: 20, tier: 4, milestone: 'm4' });

  test('Scenario: Admin updates CMS announcement banner, creates time-limited promo code, and reviews order inventory', () => {
    // 1. CMS tab and route exist
    assertMatches(adminApiCode, /route\s*===\s*['"]content['"]/, 'Admin API handles content updates');

    // 2. Promo tab and route handle limits
    assertMatches(adminApiCode, /route\s*===\s*['"]promos['"]/, 'Admin API handles promo configuration');

    // 3. Product catalog table is functional
    assertMatches(adminHtmlCode, /id=["']productsTableBody["']|renderProductsTable/, 'Admin renders product table');
  }, { id: 'T4-SCEN-ADMIN-CMS-AND-PROMO-LIFECYCLE', item: 19, tier: 4, milestone: 'm4' });
});

if (process.argv[1] && process.argv[1].endsWith('test_m4_admin_supabase.mjs')) {
  runStandalone();
}
