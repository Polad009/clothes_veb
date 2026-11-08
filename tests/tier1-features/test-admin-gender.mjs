/**
 * Tier 1 Feature Tests: Admin Gender Selector & Table Management
 * Covers: public/admin.html and admin-portal/public/index.html
 */

import { describe, test } from '../../scripts/run-e2e-tests.mjs';
import { assert, assertEqual, assertContains, assertMatches, readProjectFile } from '../helpers/test-context.mjs';

describe('Admin Panel Gender Categorization (public/admin.html)', () => {
  const adminHtml = readProjectFile('public/admin.html');

  test('FEAT-GEND-01.1: Product form contains explicit Gender radio selector with Kişi, Qadın, and Unisex', () => {
    // Must contain input[name="prodGender"] or radio buttons with values men, women, unisex
    assertMatches(
      adminHtml,
      /name=["']prodGender["']\s+value=["']men["']|value=["']men["']\s+name=["']prodGender["']/,
      'Must contain radio input with name="prodGender" and value="men"'
    );
    assertMatches(
      adminHtml,
      /name=["']prodGender["']\s+value=["']women["']|value=["']women["']\s+name=["']prodGender["']/,
      'Must contain radio input with name="prodGender" and value="women"'
    );
    assertMatches(
      adminHtml,
      /name=["']prodGender["']\s+value=["']unisex["']|value=["']unisex["']\s+name=["']prodGender["']/,
      'Must contain radio input with name="prodGender" and value="unisex"'
    );
    assertContains(adminHtml, 'Cins (Gender)', 'Must contain Cins (Gender) form section label');
  });

  test('FEAT-GEND-01.2: openProductModal() resets gender selection to unisex default', () => {
    assertMatches(
      adminHtml,
      /openProductModal\s*\(\)[\s\S]*?prodGender[\s\S]*?unisex/,
      'openProductModal must reset prodGender to unisex'
    );
  });

  test('FEAT-GEND-01.3: editProduct() correctly loads and checks the product gender', () => {
    assertMatches(
      adminHtml,
      /editProduct\s*\([^)]*\)[\s\S]*?prodGender[\s\S]*?p\.gender/,
      'editProduct must retrieve p.gender and select the corresponding prodGender radio'
    );
  });

  test('FEAT-GEND-01.4: handleProductFormSubmit() dynamically extracts selected gender from radio group', () => {
    assertMatches(
      adminHtml,
      /prodGender.*:checked.*value/,
      'handleProductFormSubmit must read checked prodGender value'
    );
    // Ensure gender: 'unisex' is not hardcoded in the final submission payload without dynamic check
    const payloadMatches = adminHtml.match(/const\s+payload\s*=\s*\{[\s\S]*?\};/);
    if (payloadMatches) {
      assert(
        !payloadMatches[0].includes("gender: 'unisex',"),
        'Payload should not hardcode gender: "unisex" unconditionally'
      );
    }
  });

  test('FEAT-GEND-01.5: renderProductsTable() renders a dedicated Gender column and badge', () => {
    assertContains(adminHtml, '<th class="p-3.5">Cins</th>', 'Table header must have Cins column');
    assertMatches(
      adminHtml,
      /data-gender=/,
      'Table row should have data-gender attribute for filtering'
    );
    assertMatches(
      adminHtml,
      /genderBadgeClass|pGender === 'men'|pGender === 'women'/,
      'Must assign styled badge according to product gender'
    );
  });

  test('FEAT-GEND-01.6: Product filter toolbar includes Gender filter dropdown (#productGenderFilter)', () => {
    assertContains(adminHtml, 'id="productGenderFilter"', 'Filter toolbar must include #productGenderFilter dropdown');
    assertContains(adminHtml, 'value="all">Bütün Cinslər</option>', 'Must include Bütün Cinslər option');
    assertContains(adminHtml, 'value="men">Kişi</option>', 'Must include Kişi option');
    assertContains(adminHtml, 'value="women">Qadın</option>', 'Must include Qadın option');
    assertContains(adminHtml, 'value="unisex">Unisex</option>', 'Must include Unisex option');
    assertMatches(
      adminHtml,
      /filterProductsTable[\s\S]*?productGenderFilter/,
      'filterProductsTable function must read productGenderFilter value'
    );
  });
});

describe('Standalone Admin Portal Parity (admin-portal/public/index.html)', () => {
  const portalHtml = readProjectFile('admin-portal/public/index.html');

  test('FEAT-GEND-01.7: Standalone admin portal contains identical gender selector options and table filters', () => {
    assertMatches(
      portalHtml,
      /name=["']prodGender["']/,
      'Standalone portal must contain prodGender radio inputs'
    );
    assertMatches(
      portalHtml,
      /productGenderFilter/,
      'Standalone portal must include productGenderFilter'
    );
    assertMatches(
      portalHtml,
      /data-gender=/,
      'Standalone portal rows must include data-gender attribute'
    );
  });
});
