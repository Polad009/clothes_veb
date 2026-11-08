/**
 * Tier 2 Boundary Tests: Gender Query Param Edge Cases & Casing
 * Covers: filtering behavior under malformed or atypical inputs
 */

import { describe, test } from '../../scripts/run-e2e-tests.mjs';
import { assertEqual, MOCK_PRODUCTS, filterProductsByGender } from '../helpers/test-context.mjs';

describe('Tier 2 Boundary: Gender Query Param Edges & Casing', () => {
  test('BVA-GEND-01: Case-insensitivity support for MEN, Women, and UNISEX', () => {
    const upperMen = filterProductsByGender(MOCK_PRODUCTS, 'MEN');
    const lowerMen = filterProductsByGender(MOCK_PRODUCTS, 'men');
    assertEqual(upperMen.length, lowerMen.length, 'MEN must match men');

    const mixedWomen = filterProductsByGender(MOCK_PRODUCTS, 'WoMeN');
    const lowerWomen = filterProductsByGender(MOCK_PRODUCTS, 'women');
    assertEqual(mixedWomen.length, lowerWomen.length, 'WoMeN must match women');

    const upperUnisex = filterProductsByGender(MOCK_PRODUCTS, 'UNISEX');
    const lowerUnisex = filterProductsByGender(MOCK_PRODUCTS, 'unisex');
    assertEqual(upperUnisex.length, lowerUnisex.length, 'UNISEX must match unisex');
  });

  test('BVA-GEND-02: Whitespace padded gender queries are trimmed cleanly', () => {
    const paddedMen = filterProductsByGender(MOCK_PRODUCTS, '  men  ');
    const cleanMen = filterProductsByGender(MOCK_PRODUCTS, 'men');
    assertEqual(paddedMen.length, cleanMen.length, 'Padded "  men  " must match "men"');
  });

  test('BVA-GEND-03: Unknown or invalid gender values return empty list or fallback safely', () => {
    const unknownKids = filterProductsByGender(MOCK_PRODUCTS, 'kids');
    assertEqual(unknownKids.length, 0, 'Non-existent gender "kids" should return 0 products');

    const unknownPets = filterProductsByGender(MOCK_PRODUCTS, 'pets');
    assertEqual(unknownPets.length, 0, 'Non-existent gender "pets" should return 0 products');
  });

  test('BVA-GEND-04: Empty string, null, or undefined gender queries fallback to all products', () => {
    const emptyQuery = filterProductsByGender(MOCK_PRODUCTS, '');
    assertEqual(emptyQuery.length, MOCK_PRODUCTS.length, 'Empty gender query returns all products');

    const nullQuery = filterProductsByGender(MOCK_PRODUCTS, null);
    assertEqual(nullQuery.length, MOCK_PRODUCTS.length, 'Null gender query returns all products');
  });

  test('BVA-GEND-05: Adversarial / meta-characters do not cause runtime errors or unhandled exceptions', () => {
    const injectionQuery = filterProductsByGender(MOCK_PRODUCTS, '<script>alert(1)</script>');
    assertEqual(injectionQuery.length, 0, 'XSS string returns 0 products safely');

    const sqlQuery = filterProductsByGender(MOCK_PRODUCTS, "men' OR 1=1--");
    assertEqual(sqlQuery.length, 0, 'SQL injection string returns 0 products safely');
  });
});
