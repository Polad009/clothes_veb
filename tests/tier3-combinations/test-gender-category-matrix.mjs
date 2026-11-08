/**
 * Tier 3 Combination Tests: Gender Filter x Category Pairwise Matrix
 * Covers: Cross-filtering on both gender and product category dimensions
 */

import { describe, test } from '../../scripts/run-e2e-tests.mjs';
import { assert, assertEqual, MOCK_PRODUCTS, filterProductsByGender } from '../helpers/test-context.mjs';

describe('Tier 3 Combinations: Gender Filter x Category Matrix', () => {
  function filterByGenderAndCategory(products, gender, category) {
    const byGender = filterProductsByGender(products, gender);
    if (!category || category === 'all') return byGender;
    return byGender.filter((p) => p.category === category);
  }

  test('PAIRWISE: Men x T-Shirt (koynek) returns men and unisex t-shirts only', () => {
    const results = filterByGenderAndCategory(MOCK_PRODUCTS, 'men', 'koynek');
    assert(results.length > 0, 'Should return matching items');
    for (const p of results) {
      assertEqual(p.category, 'koynek', 'Category must be koynek');
      assert(p.gender === 'men' || p.gender === 'unisex', 'Gender must be men or unisex');
    }
    // Specific exclusions
    assert(!results.some((p) => p.gender === 'women'), 'Women tees must be excluded');
    assert(!results.some((p) => p.category !== 'koynek'), 'Non-tshirts must be excluded');
  });

  test('PAIRWISE: Women x T-Shirt (koynek) returns women and unisex t-shirts only', () => {
    const results = filterByGenderAndCategory(MOCK_PRODUCTS, 'women', 'koynek');
    assert(results.length > 0);
    for (const p of results) {
      assertEqual(p.category, 'koynek');
      assert(p.gender === 'women' || p.gender === 'unisex');
    }
    assert(!results.some((p) => p.gender === 'men'), 'Men tees must be excluded');
  });

  test('PAIRWISE: Men x Pants (salvar) returns men pants only', () => {
    const results = filterByGenderAndCategory(MOCK_PRODUCTS, 'men', 'salvar');
    assert(results.length > 0);
    for (const p of results) {
      assertEqual(p.category, 'salvar');
      assert(p.gender === 'men' || p.gender === 'unisex');
    }
    assert(!results.some((p) => p.id === 'prod-005-women-dress'), 'Women dress must be excluded');
  });

  test('PAIRWISE: Women x Pants/Dress (salvar) returns women pants/dress only', () => {
    const results = filterByGenderAndCategory(MOCK_PRODUCTS, 'women', 'salvar');
    assert(results.length > 0);
    for (const p of results) {
      assertEqual(p.category, 'salvar');
      assert(p.gender === 'women' || p.gender === 'unisex');
    }
    assert(!results.some((p) => p.id === 'prod-004-men-pants'), 'Men pants must be excluded');
  });

  test('PAIRWISE: Unisex x Hoodie (hudi) returns strictly unisex hoodies', () => {
    const results = filterByGenderAndCategory(MOCK_PRODUCTS, 'unisex', 'hudi');
    assert(results.length > 0);
    for (const p of results) {
      assertEqual(p.category, 'hudi');
      assertEqual(p.gender, 'unisex');
    }
  });

  test('PAIRWISE: Unisex x Accessories (aksesuar) returns strictly unisex accessories', () => {
    const results = filterByGenderAndCategory(MOCK_PRODUCTS, 'unisex', 'aksesuar');
    assert(results.length > 0);
    for (const p of results) {
      assertEqual(p.category, 'aksesuar');
      assertEqual(p.gender, 'unisex');
    }
  });
});
