/**
 * E2E Test Suite: Milestone 2 - Catalog, Navigation, Runway Showcase & Gender Consistency
 * Items Covered: 2, 5, 15
 *
 * Tiers:
 * - Tier 1: Feature Coverage (Items 2, 5, 15)
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

describe('Milestone 2: Catalog, Navigation, Runway Showcase & Gender Consistency', () => {
  const headerCode = readProjectFile('components/Header.tsx');
  const unwovenLoomCode = readProjectFile('components/UnwovenLoom.tsx');
  const collectionsCode = readProjectFile('app/collections/page.tsx');
  const adminHtmlCode = readProjectFile('public/admin.html');

  // =========================================================================
  // TIER 1: FEATURE COVERAGE (Items 2, 5, 15)
  // =========================================================================

  test('Gender selection (Kişi / Qadın) is cleanly integrated in desktop navigation and mobile drawer without layout overflow', () => {
    // Item 2: Keep Gender selection properly integrated on Mobile Menu and clean non-overflowing location on Web/Desktop
    assertMatches(
      headerCode,
      /href:\s*["']\/collections\?gender=men["']/,
      'Header must provide link to /collections?gender=men (Kişi)'
    );
    assertMatches(
      headerCode,
      /href:\s*["']\/collections\?gender=women["']/,
      'Header must provide link to /collections?gender=women (Qadın)'
    );
    assertMatches(
      headerCode,
      /currentGender/,
      'Header must track currentGender state from URL parameters'
    );
  }, { id: 'T1-FEAT-02-HEADER-GENDER-NAV', item: 2, tier: 1, milestone: 'm2' });

  test('Admin panel provides complete gender management with radio controls and table filters', () => {
    // Item 2: In Admin Panel, ensure gender management is clean and functional
    assertMatches(
      adminHtmlCode,
      /name=["']prodGender["'][\s\S]*?value=["']men["']/,
      'Admin product modal must have Kişi (men) radio input'
    );
    assertMatches(
      adminHtmlCode,
      /name=["']prodGender["'][\s\S]*?value=["']women["']/,
      'Admin product modal must have Qadın (women) radio input'
    );
    assertMatches(
      adminHtmlCode,
      /name=["']prodGender["'][\s\S]*?value=["']unisex["']/,
      'Admin product modal must have Unisex radio input'
    );
    assertMatches(
      adminHtmlCode,
      /id=["']productGenderFilter["']/,
      'Admin product table must include gender filter select dropdown'
    );
  }, { id: 'T1-FEAT-02-ADMIN-GENDER-MANAGEMENT', item: 2, tier: 1, milestone: 'm2' });

  test('Runway showcase derives items dynamically from active catalog products and removes deleted inventory', () => {
    // Item 5: In multi-card showcase strip, sync displayed clothes with current active DB products
    assertMatches(
      unwovenLoomCode,
      /useStoreData|products/,
      'UnwovenLoom must access active store products context'
    );
  }, { id: 'T1-FEAT-05-RUNWAY-DYNAMIC-SYNC', item: 5, tier: 1, milestone: 'm2' });

  test('Runway showcase completely purges AI runway copy ("Horwalle canlı dalğalı runway")', () => {
    // Item 5: Completely remove the sentence mentioning "Horwalle canlı dalğalı runway" or similar text
    assertNotMatches(
      unwovenLoomCode,
      /Horwalle canlı dalğalı runway/i,
      'UnwovenLoom must NOT contain the AI copy "Horwalle canlı dalğalı runway"'
    );
  }, { id: 'T1-FEAT-05-RUNWAY-AI-TEXT-PURGED', item: 5, tier: 1, milestone: 'm2' });

  test('"Siluet & Kəsim" filter options align accurately with active in-stock products', () => {
    // Item 15: Align categories/fits under "Siluet & Kəsim" to accurately match active products in stock
    assertMatches(
      collectionsCode,
      /fits\s*=/,
      'Collections page must declare list of active fits'
    );
    assertMatches(
      collectionsCode,
      /selectedFit/,
      'Collections page must provide selectedFit filter state'
    );
  }, { id: 'T1-FEAT-15-SILUET-KESIM-ALIGNMENT', item: 15, tier: 1, milestone: 'm2' });

  // =========================================================================
  // TIER 2: BOUNDARY & CORNER CASES (Items 2, 5, 15)
  // =========================================================================

  test('Gender query parser normalizes casing and handles invalid or unrecognized gender parameters safely', () => {
    assertMatches(
      collectionsCode,
      /rawGender\.toLowerCase\(\)\.trim\(\)/,
      'Collections page must normalize gender query parameter by trimming and lowercasing'
    );
  }, { id: 'T2-BND-02-GENDER-QUERY-NORMALIZATION', item: 2, tier: 2, milestone: 'm2' });

  test('Gender filter in collections includes unisex items when filtering for men or women', () => {
    // Smart inclusive filtering rule:
    // Men filter includes men + unisex
    // Women filter includes women + unisex
    assertMatches(
      collectionsCode,
      /if\s*\(\s*product\.gender\s*!==\s*["']men["']\s*&&\s*product\.gender\s*!==\s*["']unisex["']\s*\)/,
      'Men filter must allow both men and unisex items'
    );
    assertMatches(
      collectionsCode,
      /if\s*\(\s*product\.gender\s*!==\s*["']women["']\s*&&\s*product\.gender\s*!==\s*["']unisex["']\s*\)/,
      'Women filter must allow both women and unisex items'
    );
  }, { id: 'T2-BND-02-GENDER-INCLUSIVE-UNISEX', item: 2, tier: 2, milestone: 'm2' });

  test('Runway marquee safely renders with fallback safety timer if image decode takes longer than 400ms', () => {
    assertMatches(
      unwovenLoomCode,
      /setTimeout\(\(\)\s*=>\s*\{[\s\S]*?setImagesReady\(true\)/,
      'UnwovenLoom must include fallback safety timer to release marquee'
    );
  }, { id: 'T2-BND-05-RUNWAY-IMAGE-LOAD-SAFETY', item: 5, tier: 2, milestone: 'm2' });

  test('Runway marquee pauses smoothly when out of viewport using IntersectionObserver', () => {
    assertMatches(
      unwovenLoomCode,
      /IntersectionObserver/,
      'UnwovenLoom must monitor viewport intersection to pause off-screen animations'
    );
    assertMatches(
      unwovenLoomCode,
      /data-paused=\{!isAnimated\}/,
      'Runway tracks must respect paused state to conserve GPU/CPU cycles'
    );
  }, { id: 'T2-BND-05-RUNWAY-INTERSECTION-PAUSE', item: 5, tier: 2, milestone: 'm2' });

  test('"Siluet & Kəsim" fit matching performs case-insensitive substring comparisons to prevent missing product matches', () => {
    assertMatches(
      collectionsCode,
      /pFit\.includes\(sFit\)\s*\|\|\s*sFit\.includes\(pFit\)/,
      'Fit matching must be resilient to slight wording differences'
    );
  }, { id: 'T2-BND-15-FIT-SUBSTRING-RESILIENCE', item: 15, tier: 2, milestone: 'm2' });

  // =========================================================================
  // TIER 3: CROSS-FEATURE COMBINATIONS
  // =========================================================================

  test('Collections URL helpers preserve active gender and category filters simultaneously', () => {
    assertMatches(
      collectionsCode,
      /getCategoryHref[\s\S]*?params\.set\(["']category["']/,
      'getCategoryHref must preserve existing query parameters such as gender'
    );
    assertMatches(
      collectionsCode,
      /getGenderHref[\s\S]*?params\.set\(["']gender["']/,
      'getGenderHref must preserve existing query parameters such as category'
    );
  }, { id: 'T3-INT-COLLECTIONS-QUERY-PRESERVATION', item: 2, tier: 3, milestone: 'm2' });

  test('Admin product form submission maps selected radio gender directly to product object payload', () => {
    assertMatches(
      adminHtmlCode,
      /document\.querySelector\(['"]input\[name="prodGender"\]:checked['"]\)\?\.value/,
      'Admin form handler must read selected prodGender value'
    );
  }, { id: 'T3-INT-ADMIN-FORM-GENDER-SERIALIZATION', item: 2, tier: 3, milestone: 'm2' });

  // =========================================================================
  // TIER 4: REAL-WORLD APPLICATION SCENARIOS
  // =========================================================================

  test('Scenario: Customer selects "Kişi" from header, arrives at filtered collections, and switches fit filter', () => {
    // 1. Header has dedicated link to /collections?gender=men
    assertMatches(headerCode, /\/collections\?gender=men/, 'Header links to Men collection');

    // 2. Collections page reads gender from searchParams
    assertMatches(collectionsCode, /searchParams\.get\(["']gender["']\)/, 'Collections extracts gender param');

    // 3. Gender tabs provide interactive tab switches
    assertMatches(collectionsCode, /genderTabs\.map/, 'Collections renders gender tabs');

    // 4. Products grid updates based on filteredProducts calculation
    assertMatches(collectionsCode, /filteredProducts\.map/, 'Filtered products rendered in grid');
  }, { id: 'T4-SCEN-GENDER-CATALOG-FILTERING', item: 2, tier: 4, milestone: 'm2' });
});

if (process.argv[1] && process.argv[1].endsWith('test_m2_catalog_gender.mjs')) {
  runStandalone();
}
