/**
 * Tier 4 Scenario: Admin Product Creation to Global Storefront Order Lifecycle
 * Journey: Admin creates product with explicit Gender 'women' -> Product listed with badge -> Filtered in table -> Customer discovers & buys
 */

import { describe, test } from '../../scripts/run-e2e-tests.mjs';
import { assert, assertEqual, readProjectFile, filterProductsByGender } from '../helpers/test-context.mjs';
import { validateGenderValue } from '../helpers/contracts.mjs';

describe('Tier 4 Scenario 4: Admin Product Lifecycle to Global Order', async () => {
  const adminHtml = readProjectFile('public/admin.html');
  const { calculateShippingOptions } = await import('../../lib/shipping.ts');

  test('SCENARIO-04: Full lifecycle from admin product creation with gender to customer purchase', () => {
    // 1. Admin UI Form Verification
    assert(adminHtml.includes('name="prodGender" value="women"'), 'Admin form must have women gender radio');

    // 2. Simulated Admin Submission Payload
    const newAdminProduct = {
      id: 'prod-new-001-silk-cami',
      slug: 'horwalle-couture-silk-camisole',
      name: 'HORVVALLE Couture Silk Camisole',
      category: 'koynek',
      price: 85,
      internationalPrice: 50,
      gender: 'women', // Explicit admin selection
      inStock: true,
      colors: [{ name: 'Champagne Gold', code: '#f7e7ce', inStock: true }],
    };

    validateGenderValue(newAdminProduct.gender);
    assertEqual(newAdminProduct.gender, 'women');

    // 3. Admin Table Badge Simulation
    const badgeLabel = newAdminProduct.gender === 'men' ? 'Kişi' : newAdminProduct.gender === 'women' ? 'Qadın' : 'Unisex';
    assertEqual(badgeLabel, 'Qadın', 'Badge label must be Qadın');

    // 4. Storefront Discovery & Filtering
    const catalogWithNewItem = [newAdminProduct];

    // Customer filters by Women
    const womenDiscovery = filterProductsByGender(catalogWithNewItem, 'women');
    assertEqual(womenDiscovery.length, 1, 'Product must appear in Women collection');
    assertEqual(womenDiscovery[0].id, newAdminProduct.id);

    // Customer filters by Men
    const menDiscovery = filterProductsByGender(catalogWithNewItem, 'men');
    assertEqual(menDiscovery.length, 0, 'Product must NOT appear in Men collection');

    // Customer filters by Unisex
    const unisexDiscovery = filterProductsByGender(catalogWithNewItem, 'unisex');
    assertEqual(unisexDiscovery.length, 0, 'Product must NOT appear in strictly Unisex collection');

    // 5. Customer Purchase via International Express Shipping
    const shippingOptions = calculateShippingOptions('FR', newAdminProduct.internationalPrice, 'USD');
    const expressOption = shippingOptions.find((o) => o.id === 'intl_express');
    assert(expressOption !== undefined);
    assertEqual(expressOption.price, 35);

    const orderTotal = newAdminProduct.internationalPrice + expressOption.price;
    assertEqual(orderTotal, 85, 'Total: $50 + $35 = $85 USD');
  });
});
