/**
 * Tier 1 Feature Tests: Collections Page Gender Filtering
 * Covers: app/collections/page.tsx and filtering algorithms
 */

import { describe, test } from '../../scripts/run-e2e-tests.mjs';
import {
  assert,
  assertEqual,
  assertContains,
  assertMatches,
  readProjectFile,
  MOCK_PRODUCTS,
  filterProductsByGender,
} from '../helpers/test-context.mjs';

describe('Collections Page Gender Filtering UI (app/collections/page.tsx)', () => {
  const collectionsCode = readProjectFile('app/collections/page.tsx');

  test('FEAT-GEND-03.1: Collections page extracts selectedGender from searchParams', () => {
    assertMatches(
      collectionsCode,
      /searchParams\.get\(["']gender["']\)\s*\|\|\s*["']all["']/,
      'Must read searchParams.get("gender") defaulting to "all"'
    );
  });

  test('FEAT-GEND-03.2: genderTabs contains Hamısı, Kişi, Qadın, and Unisex tabs', () => {
    assertMatches(
      collectionsCode,
      /genderTabs\s*=\s*\[[\s\S]*?id:\s*["']all["'][\s\S]*?id:\s*["']men["'][\s\S]*?id:\s*["']women["'][\s\S]*?id:\s*["']unisex["']/,
      'genderTabs must include all, men, women, unisex options'
    );
  });

  test('FEAT-GEND-03.3: handleGenderChange() updates query param with URLSearchParams preserving other filters', () => {
    assertMatches(
      collectionsCode,
      /handleGenderChange\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*?new URLSearchParams[\s\S]*?params\.set\(["']gender["'], genId\)[\s\S]*?router\.replace/,
      'handleGenderChange must mutate URLSearchParams and call router.replace'
    );
  });

  test('FEAT-GEND-03.4: Collections UI renders interactive Gender filter pills', () => {
    assertMatches(
      collectionsCode,
      /genderTabs\.map/,
      'Collections page must map over genderTabs to render UI tab buttons or filter links'
    );
  });
});

describe('Collections Filtering Algorithm & Inclusive Logic Contract', () => {
  test('FEAT-GEND-03.5: "men" filter inclusively includes items tagged "men" and "unisex"', () => {
    const results = filterProductsByGender(MOCK_PRODUCTS, 'men');
    assert(results.length > 0, 'Men filter should return products');
    for (const p of results) {
      assert(
        p.gender === 'men' || p.gender === 'unisex',
        `Product ${p.id} (${p.gender}) should be either 'men' or 'unisex'`
      );
    }
    // Verify unisex items are present
    assert(results.some((p) => p.gender === 'unisex'), 'Unisex hoodie must be included in men collection');
    // Verify exclusive women items are excluded
    assert(!results.some((p) => p.gender === 'women'), 'Women dress must NOT be included in men collection');
  });

  test('FEAT-GEND-03.6: "women" filter inclusively includes items tagged "women" and "unisex"', () => {
    const results = filterProductsByGender(MOCK_PRODUCTS, 'women');
    assert(results.length > 0, 'Women filter should return products');
    for (const p of results) {
      assert(
        p.gender === 'women' || p.gender === 'unisex',
        `Product ${p.id} (${p.gender}) should be either 'women' or 'unisex'`
      );
    }
    // Verify unisex items are present
    assert(results.some((p) => p.gender === 'unisex'), 'Unisex hoodie must be included in women collection');
    // Verify exclusive men items are excluded
    assert(!results.some((p) => p.gender === 'men'), 'Men tee must NOT be included in women collection');
  });

  test('FEAT-GEND-03.7: "unisex" filter strictly returns only items tagged "unisex"', () => {
    const results = filterProductsByGender(MOCK_PRODUCTS, 'unisex');
    assert(results.length > 0, 'Unisex filter should return products');
    for (const p of results) {
      assertEqual(p.gender, 'unisex', `Product ${p.id} must be strictly unisex`);
    }
    assert(!results.some((p) => p.gender === 'men'), 'Men items must be excluded');
    assert(!results.some((p) => p.gender === 'women'), 'Women items must be excluded');
  });

  test('FEAT-GEND-03.8: "all" filter returns complete catalog without gender exclusions', () => {
    const resultsAll = filterProductsByGender(MOCK_PRODUCTS, 'all');
    assertEqual(resultsAll.length, MOCK_PRODUCTS.length, 'All filter should return entire catalog');

    const resultsUndefined = filterProductsByGender(MOCK_PRODUCTS, undefined);
    assertEqual(resultsUndefined.length, MOCK_PRODUCTS.length, 'Undefined filter should return entire catalog');
  });
});
