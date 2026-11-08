/**
 * Tier 1 Feature Tests: Storefront Product API Gender Support
 * Covers: app/api/store/products/route.ts and data/storeData.json
 */

import { describe, test } from '../../scripts/run-e2e-tests.mjs';
import {
  assert,
  assertEqual,
  assertContains,
  assertMatches,
  readProjectFile,
} from '../helpers/test-context.mjs';
import { validateGenderValue } from '../helpers/contracts.mjs';

describe('Storefront Product API Gender Support (app/api/store/products/route.ts)', () => {
  const apiRouteCode = readProjectFile('app/api/store/products/route.ts');

  test('FEAT-GEND-04.1: API extracts gender query parameter from request URL', () => {
    assertMatches(
      apiRouteCode,
      /searchParams\.get\(["']gender["']\)/,
      'API route must read searchParams.get("gender")'
    );
  });

  test('FEAT-GEND-04.2: API implements inclusive filtering for "men" (men + unisex)', () => {
    assertMatches(
      apiRouteCode,
      /gender\s*===\s*["']men["'][\s\S]*?p\.gender\s*===\s*["']men["']\s*\|\|\s*p\.gender\s*===\s*["']unisex["']/,
      'Server-side filter for men must include p.gender === "men" || p.gender === "unisex"'
    );
  });

  test('FEAT-GEND-04.3: API implements inclusive filtering for "women" (women + unisex)', () => {
    assertMatches(
      apiRouteCode,
      /gender\s*===\s*["']women["'][\s\S]*?p\.gender\s*===\s*["']women["']\s*\|\|\s*p\.gender\s*===\s*["']unisex["']/,
      'Server-side filter for women must include p.gender === "women" || p.gender === "unisex"'
    );
  });

  test('FEAT-GEND-04.4: API implements strict filtering for "unisex"', () => {
    assertMatches(
      apiRouteCode,
      /gender\s*===\s*["']unisex["'][\s\S]*?p\.gender\s*===\s*["']unisex["']/,
      'Server-side filter for unisex must strictly match p.gender === "unisex"'
    );
  });
});

describe('Store Data Integrity & Schema Conformance (data/storeData.json)', () => {
  const storeDataRaw = readProjectFile('data/storeData.json');
  const storeData = JSON.parse(storeDataRaw);

  test('FEAT-GEND-04.5: All existing products in data store have valid gender attributes', () => {
    assert(Array.isArray(storeData.products), 'storeData.products must be an array');
    assert(storeData.products.length > 0, 'Catalog should contain products');

    for (const prod of storeData.products) {
      assert(prod.gender !== undefined, `Product ${prod.id} (${prod.name}) must have a gender property`);
      validateGenderValue(prod.gender);
    }
  });
});
