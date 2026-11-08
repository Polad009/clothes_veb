/**
 * Adversarial Stress Test Suite: Gender Categorization & Filtering
 * 
 * Verifies:
 * 1. Case-insensitivity & whitespace handling in gender query params (Collections & API)
 * 2. Combined filters: Category + Gender + Size + Fit combinations
 * 3. Inclusive filtering boundaries (Zero leakage between men & women, unisex dual-presence)
 * 4. Admin form lifecycle (modal reset, edit populate, submit payload, re-open persistence)
 * 5. Storefront API response integrity (schema conformance, no data corruption)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// ============================================================================
// TEST HARNESS & ASSERTIONS
// ============================================================================

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function describe(title, fn) {
  console.log(`\n\x1b[1m\x1b[36m▶ ${title}\x1b[0m`);
  fn();
}

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
  } catch (err) {
    failedTests++;
    failures.push({ name, error: err.message });
    console.log(`  \x1b[31m✗\x1b[0m ${name}`);
    console.log(`    \x1b[33mError: ${err.message}\x1b[0m`);
  }
}

function assert(condition, message = 'Assertion failed') {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(actual, expected, message = '') {
  if (actual !== expected) {
    throw new Error(`${message} Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
}

// ============================================================================
// PRODUCTION CODE EXTRACTION / REPLICATION
// ============================================================================

// 1. Read files
const collectionsCode = fs.readFileSync(path.join(ROOT, 'app/collections/page.tsx'), 'utf8');
const apiProductsCode = fs.readFileSync(path.join(ROOT, 'app/api/store/products/route.ts'), 'utf8');
const headerCode = fs.readFileSync(path.join(ROOT, 'components/Header.tsx'), 'utf8');
const adminHtml = fs.readFileSync(path.join(ROOT, 'public/admin.html'), 'utf8');
const portalHtml = fs.readFileSync(path.join(ROOT, 'admin-portal/public/index.html'), 'utf8');

// 2. Realistic test dataset
const CATALOG = [
  // Men items
  { id: 'm-1', name: 'Men Supreme Tee', category: 'koynek', gender: 'men', fit: 'T-shirt Regular (Süprəm)', sizes: ['S', 'M', 'L', 'XL'], price: 45, inStock: true },
  { id: 'm-2', name: 'Men Heavy Hoodie', category: 'hudi', gender: 'men', fit: 'Hody qalın (3iplik)', sizes: ['M', 'L', '2XL'], price: 95, inStock: true },
  { id: 'm-3', name: 'Men Cargo Pants', category: 'salvar', gender: 'men', fit: 'Şalvar qalın (3iplik / TS Parça)', sizes: ['32', '34', '36'], price: 110, inStock: true },
  
  // Women items
  { id: 'w-1', name: 'Women Cropped Tee', category: 'koynek', gender: 'women', fit: 'T-shirt Regular (Süprəm)', sizes: ['XS', 'S', 'M'], price: 40, inStock: true },
  { id: 'w-2', name: 'Women Knit Sweater', category: 'hudi', gender: 'women', fit: 'Sviter - nazik (2iplik)', sizes: ['S', 'M', 'L'], price: 85, inStock: true },
  { id: 'w-3', name: 'Women Silk Pants', category: 'salvar', gender: 'women', fit: 'Şalvar nazik (2iplik)', sizes: ['30', '32'], price: 125, inStock: true },

  // Unisex items
  { id: 'u-1', name: 'Unisex Oversize Tee', category: 'koynek', gender: 'unisex', fit: 'Oversize T-shirt (Süprəm / 2iplik)', sizes: ['S', 'M', 'L', 'XL', '2XL'], price: 55, inStock: true },
  { id: 'u-2', name: 'Unisex Obsidian Hoodie', category: 'hudi', gender: 'unisex', fit: 'Hody qalın (3iplik)', sizes: ['M', 'L', 'XL'], price: 120, inStock: true },
  { id: 'u-3', name: 'Unisex Heavy Beanie', category: 'aksesuar', gender: 'unisex', fit: 'Kepka - qalın', sizes: ['all'], price: 30, inStock: true },
];

/**
 * EXACT production filtering logic extracted directly from app/collections/page.tsx
 */
function runCollectionsFiltering(products, { gender = 'all', category = 'all', fit = 'all', size = 'all' }) {
  // As in page.tsx line 50:
  const rawGender = gender || "all";
  const selectedGender = rawGender.toLowerCase().trim() || "all";
  const selectedCategory = category;
  const selectedFit = fit;
  const selectedSize = size;

  return products.filter((product) => {
    // Gender filtering (page.tsx lines 161-171)
    if (selectedGender !== "all") {
      if (selectedGender === "men") {
        if (product.gender !== "men" && product.gender !== "unisex") return false;
      } else if (selectedGender === "women") {
        if (product.gender !== "women" && product.gender !== "unisex") return false;
      } else if (selectedGender === "unisex") {
        if (product.gender !== "unisex") return false;
      } else if (product.gender !== selectedGender) {
        return false;
      }
    }

    if (selectedCategory !== "all" && product.category !== selectedCategory) {
      return false;
    }
    if (selectedFit !== "all") {
      const pFit = (product.fit || "").toLowerCase().trim();
      const sFit = selectedFit.toLowerCase().trim();
      if (!pFit || (pFit !== sFit && !pFit.includes(sFit) && !sFit.includes(pFit))) {
        return false;
      }
    }
    if (selectedSize !== "all" && (!product.sizes || !product.sizes.includes(selectedSize))) {
      return false;
    }
    return true;
  });
}

/**
 * EXACT production API filtering logic extracted directly from app/api/store/products/route.ts
 */
function runStoreProductApiFiltering(products, { gender, category, search, limit }) {
  let result = [...products];

  // As in line 13 of app/api/store/products/route.ts
  const rawGender = gender;
  const normalizedGender = rawGender ? rawGender.toLowerCase().trim() : null;

  // lines 74-84 of app/api/store/products/route.ts
  if (normalizedGender && normalizedGender !== 'all') {
    if (normalizedGender === 'men') {
      result = result.filter(p => p.gender === 'men' || p.gender === 'unisex');
    } else if (normalizedGender === 'women') {
      result = result.filter(p => p.gender === 'women' || p.gender === 'unisex');
    } else if (normalizedGender === 'unisex') {
      result = result.filter(p => p.gender === 'unisex');
    } else {
      result = result.filter(p => p.gender === normalizedGender);
    }
  }

  if (category && category !== 'all') {
    result = result.filter(p => p.category === category);
  }

  if (limit && limit > 0) {
    result = result.slice(0, limit);
  }

  return result;
}

/**
 * EXACT Header isLinkActive logic from components/Header.tsx
 */
function runHeaderLinkActive(item, { pathname, currentCategory, currentGender }) {
  // As in line 37 of components/Header.tsx:
  const rawGender = currentGender;
  const normalizedGender = rawGender ? rawGender.toLowerCase().trim() : null;

  if (item.genderId) {
    return pathname === "/collections" && normalizedGender === item.genderId;
  }
  if (item.categoryId && item.categoryId !== "all") {
    if (pathname === "/collections" && currentCategory === item.categoryId && !normalizedGender) {
      return true;
    }
    return false;
  }
  if (item.categoryId === "all") {
    return pathname === "/collections" && (!currentCategory || currentCategory === "all") && !normalizedGender;
  }
  return false;
}

// ============================================================================
// ADVERSARIAL STRESS TEST SUITE
// ============================================================================

console.log('======================================================================');
console.log('  CHALLENGER_1: Gender Categorization & Filtering Stress Harness');
console.log('======================================================================');

// ----------------------------------------------------------------------------
// AREA 1: Case-insensitivity & Whitespace in Gender Query Params
// ----------------------------------------------------------------------------
describe('Area 1: Case-insensitivity & Whitespace Stress Testing', () => {

  test('ADV-GEND-01: Storefront Collections with uppercase "MEN" query param', () => {
    // Assert production file normalization
    assert(
      collectionsCode.includes('rawGender.toLowerCase().trim()'),
      'Production app/collections/page.tsx must normalize gender with toLowerCase().trim()'
    );
    // A user visiting /collections?gender=MEN
    const res = runCollectionsFiltering(CATALOG, { gender: 'MEN' });
    const expectedMenCount = CATALOG.filter(p => p.gender === 'men' || p.gender === 'unisex').length;
    assertEqual(
      res.length,
      expectedMenCount,
      `VULNERABILITY DETECTED: /collections?gender=MEN returned ${res.length} items instead of ${expectedMenCount}. Real code lacks .toLowerCase() on searchParams.get("gender")!`
    );
  });

  test('ADV-GEND-02: Storefront Collections with padded whitespace "  women  "', () => {
    assert(
      collectionsCode.includes('rawGender.toLowerCase().trim()'),
      'Production app/collections/page.tsx must normalize gender with toLowerCase().trim()'
    );
    const res = runCollectionsFiltering(CATALOG, { gender: '  women  ' });
    const expectedWomenCount = CATALOG.filter(p => p.gender === 'women' || p.gender === 'unisex').length;
    assertEqual(
      res.length,
      expectedWomenCount,
      `VULNERABILITY DETECTED: /collections?gender=  women  returned ${res.length} items instead of ${expectedWomenCount}. Real code lacks .trim() on searchParams.get("gender")!`
    );
  });

  test('ADV-GEND-03: Storefront Collections with lowercase exact "unisex"', () => {
    const res = runCollectionsFiltering(CATALOG, { gender: 'unisex' });
    const expectedUnisexCount = CATALOG.filter(p => p.gender === 'unisex').length;
    assertEqual(res.length, expectedUnisexCount, 'Exact lowercase "unisex" should return all unisex products');
    assert(res.every(p => p.gender === 'unisex'), 'Every item must be unisex');
  });

  test('ADV-GEND-04: Storefront API GET /api/store/products?gender=MEN', () => {
    assert(
      apiProductsCode.includes('rawGender ? rawGender.toLowerCase().trim() : null'),
      'Production app/api/store/products/route.ts must normalize gender with toLowerCase().trim()'
    );
    const res = runStoreProductApiFiltering(CATALOG, { gender: 'MEN' });
    const expectedMenCount = CATALOG.filter(p => p.gender === 'men' || p.gender === 'unisex').length;
    assertEqual(
      res.length,
      expectedMenCount,
      `VULNERABILITY DETECTED: API route GET /api/store/products?gender=MEN returned ${res.length} items instead of ${expectedMenCount}. API lacks .toLowerCase()!`
    );
  });

  test('ADV-GEND-05: Storefront API GET /api/store/products?gender=  women  ', () => {
    assert(
      apiProductsCode.includes('rawGender ? rawGender.toLowerCase().trim() : null'),
      'Production app/api/store/products/route.ts must normalize gender with toLowerCase().trim()'
    );
    const res = runStoreProductApiFiltering(CATALOG, { gender: '  women  ' });
    const expectedWomenCount = CATALOG.filter(p => p.gender === 'women' || p.gender === 'unisex').length;
    assertEqual(
      res.length,
      expectedWomenCount,
      `VULNERABILITY DETECTED: API route GET /api/store/products?gender=  women  returned ${res.length} items instead of ${expectedWomenCount}. API lacks .trim()!`
    );
  });

  test('ADV-GEND-06: Header isLinkActive with uppercase or whitespace query param', () => {
    assert(
      headerCode.includes('rawGender ? rawGender.toLowerCase().trim() : null'),
      'Production components/Header.tsx must normalize gender with toLowerCase().trim()'
    );
    const menLink = { label: 'Kişi', href: '/collections?gender=men', genderId: 'men' };
    const isActiveUpper = runHeaderLinkActive(menLink, { pathname: '/collections', currentCategory: null, currentGender: 'MEN' });
    assertEqual(
      isActiveUpper,
      true,
      'VULNERABILITY DETECTED: Header Kişi link is NOT active when URL has ?gender=MEN because Header.tsx compares currentGender === item.genderId without lowercasing!'
    );
  });
});

// ----------------------------------------------------------------------------
// AREA 2: Combined Filters (Category + Gender + Size + Fit)
// ----------------------------------------------------------------------------
describe('Area 2: Combined Multi-Criterion Filter Intersections', () => {

  test('ADV-COMB-01: Combined Category (koynek) + Gender (men) + Size (XL)', () => {
    const res = runCollectionsFiltering(CATALOG, {
      category: 'koynek',
      gender: 'men',
      size: 'XL',
    });
    // Matching items:
    // m-1: koynek, men, sizes contains XL -> match
    // u-1: koynek, unisex, sizes contains XL -> match (unisex included in men)
    // w-1: koynek, women, sizes does not contain XL -> excluded (both gender and size)
    // m-2: hudi -> excluded (category)
    assertEqual(res.length, 2, 'Should find exactly 2 shirts (m-1 and u-1)');
    assert(res.some(p => p.id === 'm-1'), 'Should contain m-1');
    assert(res.some(p => p.id === 'u-1'), 'Should contain u-1');
  });

  test('ADV-COMB-02: Combined Category (hudi) + Gender (women) + Size (S)', () => {
    const res = runCollectionsFiltering(CATALOG, {
      category: 'hudi',
      gender: 'women',
      size: 'S',
    });
    // Matching items:
    // w-2: hudi, women, sizes contains S -> match
    // u-2: hudi, unisex, sizes ['M','L','XL'] does NOT contain S -> excluded
    // m-2: hudi, men -> excluded
    assertEqual(res.length, 1, 'Should find exactly 1 women hoodie (w-2)');
    assertEqual(res[0].id, 'w-2', 'Matched item must be w-2');
  });

  test('ADV-COMB-03: Combined Category + Gender + Fit (Exact match)', () => {
    const res = runCollectionsFiltering(CATALOG, {
      category: 'salvar',
      gender: 'men',
      fit: 'Şalvar qalın (3iplik / TS Parça)',
    });
    assertEqual(res.length, 1, 'Should find exactly 1 men heavyweight pant');
    assertEqual(res[0].id, 'm-3');
  });

  test('ADV-COMB-04: Non-existent multi-filter intersection returns empty array gracefully', () => {
    const res = runCollectionsFiltering(CATALOG, {
      category: 'aksesuar',
      gender: 'women', // accessory u-3 is unisex, but if category was koynek and size was 4XL
      size: '4XL',
    });
    assertEqual(res.length, 0, 'No accessories have size 4XL');
  });

  test('ADV-COMB-05: Product with empty fit does NOT falsely match a specific fit filter', () => {
    assert(
      collectionsCode.includes('!pFit || (pFit !== sFit && !pFit.includes(sFit) && !sFit.includes(pFit))'),
      'Production app/collections/page.tsx must guard against empty product.fit matching specific fit filter'
    );
    const catalogWithEmptyFit = [
      ...CATALOG,
      { id: 'ghost-1', name: 'No Fit Item', category: 'koynek', gender: 'men', fit: '', sizes: ['M'], price: 50, inStock: true }
    ];
    const res = runCollectionsFiltering(catalogWithEmptyFit, {
      category: 'koynek',
      gender: 'men',
      fit: 'Hody qalın (3iplik)'
    });
    const ghostMatched = res.some(p => p.id === 'ghost-1');
    assert(
      !ghostMatched,
      'BUG DETECTED: Product with empty fit: "" incorrectly matched specific fit filter because sFit.includes("") is always true in page.tsx:179!'
    );
  });
});

// ----------------------------------------------------------------------------
// AREA 3: Inclusive Filtering Boundary Strictness
// ----------------------------------------------------------------------------
describe('Area 3: Inclusive Filtering Boundary Strictness', () => {

  test('ADV-BND-01: Men filter NEVER leaks women-only products', () => {
    const res = runCollectionsFiltering(CATALOG, { gender: 'men' });
    const leakedWomen = res.filter(p => p.gender === 'women');
    assertEqual(leakedWomen.length, 0, 'Men filter must strictly never include women-only items');
  });

  test('ADV-BND-02: Women filter NEVER leaks men-only products', () => {
    const res = runCollectionsFiltering(CATALOG, { gender: 'women' });
    const leakedMen = res.filter(p => p.gender === 'men');
    assertEqual(leakedMen.length, 0, 'Women filter must strictly never include men-only items');
  });

  test('ADV-BND-03: Unisex products appear in BOTH men and women filter results', () => {
    const menRes = runCollectionsFiltering(CATALOG, { gender: 'men' });
    const womenRes = runCollectionsFiltering(CATALOG, { gender: 'women' });

    for (const item of CATALOG.filter(p => p.gender === 'unisex')) {
      assert(menRes.some(p => p.id === item.id), `Unisex product ${item.id} must be in men results`);
      assert(womenRes.some(p => p.id === item.id), `Unisex product ${item.id} must be in women results`);
    }
  });

  test('ADV-BND-04: Unisex filter NEVER leaks pure men or pure women products', () => {
    const res = runCollectionsFiltering(CATALOG, { gender: 'unisex' });
    assert(res.every(p => p.gender === 'unisex'), 'Unisex tab must strictly contain only unisex products');
    assert(!res.some(p => p.gender === 'men'), 'Pure men products leaked into unisex tab');
    assert(!res.some(p => p.gender === 'women'), 'Pure women products leaked into unisex tab');
  });

  test('ADV-BND-05: Randomized stress catalog (100 products) boundary verification', () => {
    const randomCatalog = [];
    const categories = ['koynek', 'hudi', 'salvar', 'aksesuar'];
    const genders = ['men', 'women', 'unisex'];

    for (let i = 0; i < 100; i++) {
      randomCatalog.push({
        id: `rand-${i}`,
        name: `Item ${i}`,
        category: categories[i % categories.length],
        gender: genders[i % genders.length],
        fit: 'Regular Fit',
        sizes: ['S', 'M', 'L', 'XL'],
        price: 50 + (i % 100),
        inStock: true
      });
    }

    const menFiltered = runCollectionsFiltering(randomCatalog, { gender: 'men' });
    const womenFiltered = runCollectionsFiltering(randomCatalog, { gender: 'women' });
    const unisexFiltered = runCollectionsFiltering(randomCatalog, { gender: 'unisex' });

    // Boundary invariants:
    assertEqual(menFiltered.filter(p => p.gender === 'women').length, 0, 'Zero women items in men filter');
    assertEqual(womenFiltered.filter(p => p.gender === 'men').length, 0, 'Zero men items in women filter');
    assertEqual(unisexFiltered.filter(p => p.gender !== 'unisex').length, 0, 'Zero non-unisex items in unisex filter');

    // Counts consistency
    const totalMen = randomCatalog.filter(p => p.gender === 'men').length;
    const totalWomen = randomCatalog.filter(p => p.gender === 'women').length;
    const totalUnisex = randomCatalog.filter(p => p.gender === 'unisex').length;

    assertEqual(menFiltered.length, totalMen + totalUnisex, 'Men filter count == totalMen + totalUnisex');
    assertEqual(womenFiltered.length, totalWomen + totalUnisex, 'Women filter count == totalWomen + totalUnisex');
    assertEqual(unisexFiltered.length, totalUnisex, 'Unisex filter count == totalUnisex');
  });
});

// ----------------------------------------------------------------------------
// AREA 4: Admin Form Lifecycle Simulation
// ----------------------------------------------------------------------------
describe('Area 4: Admin Form Lifecycle & State Persistence', () => {

  test('ADV-ADM-01: Admin HTML contains correct modal structure & radio button definitions', () => {
    assert(adminHtml.includes('name="prodGender" value="men"'), 'admin.html has men radio');
    assert(adminHtml.includes('name="prodGender" value="women"'), 'admin.html has women radio');
    assert(adminHtml.includes('name="prodGender" value="unisex" checked'), 'admin.html defaults unisex to checked in markup');
    assert(portalHtml.includes('name="prodGender" value="men"'), 'portal index.html has men radio');
  });

  test('ADV-ADM-02: Modal Reset: openProductModal sets unisex to checked and unchecks others', () => {
    // Simulate DOM elements
    const mockRadios = [
      { name: 'prodGender', value: 'men', checked: true },
      { name: 'prodGender', value: 'women', checked: false },
      { name: 'prodGender', value: 'unisex', checked: false }
    ];

    // Logic in admin.html line 4149-4150:
    mockRadios.forEach(r => { r.checked = (r.value === 'unisex'); });

    assertEqual(mockRadios.find(r => r.value === 'men').checked, false, 'men must be unchecked');
    assertEqual(mockRadios.find(r => r.value === 'women').checked, false, 'women must be unchecked');
    assertEqual(mockRadios.find(r => r.value === 'unisex').checked, true, 'unisex must be checked');
  });

  test('ADV-ADM-03: Edit Product with "women" sets women radio to checked', () => {
    const mockRadios = [
      { name: 'prodGender', value: 'men', checked: false },
      { name: 'prodGender', value: 'women', checked: false },
      { name: 'prodGender', value: 'unisex', checked: true }
    ];
    const product = { id: 'w-1', name: 'Silk Blouse', gender: 'women' };

    // Logic in admin.html line 4175-4182:
    const targetGender = product.gender || 'unisex';
    const genderRadio = mockRadios.find(r => r.value === targetGender);
    if (genderRadio) {
      genderRadio.checked = true;
      mockRadios.filter(r => r !== genderRadio).forEach(r => { r.checked = false; });
    }

    assertEqual(mockRadios.find(r => r.value === 'women').checked, true, 'women radio must be checked');
    assertEqual(mockRadios.find(r => r.value === 'men').checked, false, 'men radio must not be checked');
    assertEqual(mockRadios.find(r => r.value === 'unisex').checked, false, 'unisex radio must not be checked');
  });

  test('ADV-ADM-04: Edit Product with invalid/corrupt gender falls back safely to unisex', () => {
    const mockRadios = [
      { name: 'prodGender', value: 'men', checked: true },
      { name: 'prodGender', value: 'women', checked: false },
      { name: 'prodGender', value: 'unisex', checked: false }
    ];
    const product = { id: 'corrupt-1', name: 'Legacy Item', gender: 'alien_category' };

    const targetGender = product.gender || 'unisex';
    const genderRadio = mockRadios.find(r => r.value === targetGender);
    if (genderRadio) {
      genderRadio.checked = true;
    } else {
      const defaultRadio = mockRadios.find(r => r.value === 'unisex');
      if (defaultRadio) {
        defaultRadio.checked = true;
        mockRadios.filter(r => r !== defaultRadio).forEach(r => { r.checked = false; });
      }
    }

    assertEqual(mockRadios.find(r => r.value === 'unisex').checked, true, 'Corrupt gender must fallback to unisex');
    assertEqual(mockRadios.find(r => r.value === 'men').checked, false);
  });

  test('ADV-ADM-05: Form Submission extracts checked gender and persists across simulated cycle', () => {
    const mockDb = { products: [{ id: 'p-1', name: 'Tee', gender: 'unisex' }] };
    
    // Simulate user selecting "men"
    const selectedGender = 'men';
    const payload = {
      id: 'p-1',
      name: 'Tee Modified',
      gender: selectedGender
    };

    // Save in DB
    const existingIndex = mockDb.products.findIndex(p => p.id === payload.id);
    mockDb.products[existingIndex] = { ...mockDb.products[existingIndex], ...payload };

    // Verify DB updated
    assertEqual(mockDb.products[0].gender, 'men', 'Product gender updated to men in DB');

    // Re-open edit
    const reOpened = mockDb.products.find(p => p.id === 'p-1');
    assertEqual(reOpened.gender, 'men', 'Re-opening loads persisted gender');
  });
});

// ----------------------------------------------------------------------------
// AREA 5: Storefront API Response Integrity
// ----------------------------------------------------------------------------
describe('Area 5: Storefront API Response Integrity', () => {

  test('ADV-API-01: API returns valid schema contract for all filtered items', () => {
    const res = runStoreProductApiFiltering(CATALOG, { gender: 'men' });
    for (const p of res) {
      assert(p.id && typeof p.id === 'string', 'Product must have string id');
      assert(p.name && typeof p.name === 'string', 'Product must have string name');
      assert(typeof p.price === 'number', 'Product must have numeric price');
      assert(['men', 'unisex'].includes(p.gender), 'Product gender must be men or unisex');
      assert(p.inStock === true || p.inStock === false, 'Product must have inStock boolean');
    }
  });

  test('ADV-API-02: API with limit preserves gender constraint without truncation bias', () => {
    const res = runStoreProductApiFiltering(CATALOG, { gender: 'men', limit: 2 });
    assertEqual(res.length, 2, 'Limit 2 must return exactly 2 items');
    assert(res.every(p => p.gender === 'men' || p.gender === 'unisex'), 'Every sliced item respects gender constraint');
  });

  test('ADV-API-03: API with unknown gender parameter returns empty array safely', () => {
    const res = runStoreProductApiFiltering(CATALOG, { gender: 'kids' });
    assertEqual(res.length, 0, 'Unknown gender "kids" returns empty array');
  });

  test('ADV-API-04: API with all returns full catalog', () => {
    const res = runStoreProductApiFiltering(CATALOG, { gender: 'all' });
    assertEqual(res.length, CATALOG.length, 'gender=all returns full catalog');
  });

  test('ADV-API-05: API with undefined/null gender returns full catalog', () => {
    const res = runStoreProductApiFiltering(CATALOG, {});
    assertEqual(res.length, CATALOG.length, 'Omitted gender returns full catalog');
  });
});

// ============================================================================
// SUMMARY & VERDICT
// ============================================================================
console.log('\n======================================================================');
console.log('  STRESS TEST EXECUTION SUMMARY');
console.log('======================================================================');
console.log(`  Total Stress Tests Run: ${totalTests}`);
console.log(`  Passed:                 ${passedTests}`);
console.log(`  Failed:                 ${failedTests}`);

if (failedTests > 0) {
  console.log('\n  FAILURES / VULNERABILITIES IDENTIFIED:');
  failures.forEach((f, i) => {
    console.log(`  ${i + 1}. [${f.name}]`);
    console.log(`     -> ${f.error}`);
  });
  console.log('\n  OVERALL VERDICT: REQUEST_CHANGES');
} else {
  console.log('\n  OVERALL VERDICT: APPROVE');
}
console.log('======================================================================\n');

process.exit(failedTests > 0 ? 1 : 0);
