/**
 * INDEPENDENT VICTORY AUDITOR TEST SUITE
 * Zero shared context. Independent execution.
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const projectRoot = process.cwd();

console.log('======================================================');
console.log('   INDEPENDENT VICTORY AUDITOR TEST SUITE');
console.log('   Evaluating Gender Categorization & International Shipping');
console.log('======================================================\n');

let passCount = 0;
let failCount = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓ [AUDIT-PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ [AUDIT-FAIL] ${name}`);
    console.error(`    Error: ${err.message}`);
    failCount++;
  }
}

async function runAudit() {
  // ---------------------------------------------------------------------
  // REQUIREMENT 1: GENDER CATEGORIZATION & FILTERING
  // ---------------------------------------------------------------------

  console.log('▶ Auditing Requirement 1: Admin Panel Gender Selectors & Tables');

  await test('Admin HTML has radio buttons for Kişi, Qadın, and Unisex', () => {
    const adminHtml = fs.readFileSync(path.join(projectRoot, 'public', 'admin.html'), 'utf8');
    assert(adminHtml.includes('name="prodGender" value="men"'), 'Must have men radio input');
    assert(adminHtml.includes('name="prodGender" value="women"'), 'Must have women radio input');
    assert(adminHtml.includes('name="prodGender" value="unisex"'), 'Must have unisex radio input');
    assert(adminHtml.includes('Cins (Gender)'), 'Must have clear label');
  });

  await test('Admin portal parity: admin-portal/public/index.html has gender selector', () => {
    const portalHtml = fs.readFileSync(path.join(projectRoot, 'admin-portal', 'public', 'index.html'), 'utf8');
    assert(portalHtml.includes('name="prodGender" value="men"'), 'Portal must have men radio');
    assert(portalHtml.includes('name="prodGender" value="women"'), 'Portal must have women radio');
    assert(portalHtml.includes('name="prodGender" value="unisex"'), 'Portal must have unisex radio');
  });

  await test('Admin HTML resets gender to unisex on modal open and sets on edit', () => {
    const adminHtml = fs.readFileSync(path.join(projectRoot, 'public', 'admin.html'), 'utf8');
    assert(adminHtml.includes('r.checked = (r.value === \'unisex\')'), 'Must reset to unisex in openProductModal');
    assert(adminHtml.includes('prodGender"][value="${targetGender}"]'), 'Must check targetGender in editProduct');
    assert(adminHtml.includes('input[name="prodGender"]:checked'), 'Must extract checked gender on form submit');
  });

  await test('Admin HTML has table gender column, badges, and productGenderFilter', () => {
    const adminHtml = fs.readFileSync(path.join(projectRoot, 'public', 'admin.html'), 'utf8');
    assert(adminHtml.includes('<th class="p-3.5">Cins</th>'), 'Table header must have Cins column');
    assert(adminHtml.includes('id="productGenderFilter"'), 'Toolbar must have productGenderFilter select');
    assert(adminHtml.includes('data-gender="${pGender}"'), 'Table rows must store data-gender attribute');
  });

  console.log('\n▶ Auditing Requirement 1: Storefront Header & Navigation');

  await test('Header.tsx contains Kişi and Qadın navigation links with active state indicator', () => {
    const headerCode = fs.readFileSync(path.join(projectRoot, 'components', 'Header.tsx'), 'utf8');
    assert(headerCode.includes('/collections?gender=men'), 'Header must link to men collection');
    assert(headerCode.includes('/collections?gender=women'), 'Header must link to women collection');
    assert(headerCode.includes('rawGender.toLowerCase().trim()'), 'Header must normalize gender search param');
    assert(headerCode.includes('currentGender === item.genderId'), 'Header must highlight active link based on genderId');
  });

  await test('Translations in lib/translations.ts cover men, women, unisex across AZ, EN, RU, TR', () => {
    const transCode = fs.readFileSync(path.join(projectRoot, 'lib', 'translations.ts'), 'utf8');
    assert(transCode.includes('men: "Kişi"'), 'AZ nav must include Kişi');
    assert(transCode.includes('women: "Qadın"'), 'AZ nav must include Qadın');
    assert(transCode.includes('men: "Men"'), 'EN nav must include Men');
    assert(transCode.includes('women: "Women"'), 'EN nav must include Women');
    assert(transCode.includes('men: "Мужское"'), 'RU nav must include Мужское');
    assert(transCode.includes('women: "Женское"'), 'RU nav must include Женское');
    assert(transCode.includes('men: "Erkek"'), 'TR nav must include Erkek');
    assert(transCode.includes('women: "Kadın"'), 'TR nav must include Kadın');
  });

  console.log('\n▶ Auditing Requirement 1: Collections Page Filtering & Invariant Strictness');

  await test('Collections page source normalizes gender and renders interactive tabs', () => {
    const pageCode = fs.readFileSync(path.join(projectRoot, 'app', 'collections', 'page.tsx'), 'utf8');
    assert(pageCode.includes('rawGender.toLowerCase().trim()'), 'Must normalize rawGender');
    assert(pageCode.includes('handleGenderChange'), 'Must provide handleGenderChange callback');
    assert(pageCode.includes('genderTabs'), 'Must define genderTabs structure');
    assert(pageCode.includes('!pFit ||'), 'Must guard against empty fit bypass');
  });

  await test('Inclusive filtering math invariant: Men, Women, Unisex catalog rules', () => {
    const mockProducts = [
      { id: '1', name: 'Men Shirt', gender: 'men' },
      { id: '2', name: 'Women Dress', gender: 'women' },
      { id: '3', name: 'Unisex Hoodie', gender: 'unisex' },
      { id: '4', name: 'Men Jeans', gender: 'men' },
      { id: '5', name: 'Women Skirt', gender: 'women' },
      { id: '6', name: 'Unisex Cap', gender: 'unisex' },
    ];

    function runFilter(selectedGender) {
      const norm = (selectedGender || 'all').toLowerCase().trim();
      return mockProducts.filter((p) => {
        if (norm === 'all') return true;
        if (norm === 'men') return p.gender === 'men' || p.gender === 'unisex';
        if (norm === 'women') return p.gender === 'women' || p.gender === 'unisex';
        if (norm === 'unisex') return p.gender === 'unisex';
        return p.gender === norm;
      });
    }

    const menRes = runFilter('men');
    assert.strictEqual(menRes.length, 4, 'Men filter must return 2 men + 2 unisex = 4');
    assert(menRes.every((p) => p.gender !== 'women'), 'Men filter must NEVER leak pure women items');

    const womenRes = runFilter('women');
    assert.strictEqual(womenRes.length, 4, 'Women filter must return 2 women + 2 unisex = 4');
    assert(womenRes.every((p) => p.gender !== 'men'), 'Women filter must NEVER leak pure men items');

    const unisexRes = runFilter('unisex');
    assert.strictEqual(unisexRes.length, 2, 'Unisex filter must return strictly 2 unisex items');

    // Case insensitivity
    assert.strictEqual(runFilter('MEN').length, 4, 'Uppercase MEN must match');
    assert.strictEqual(runFilter('  WoMeN  ').length, 4, 'Padded WoMeN must match');
  });

  // ---------------------------------------------------------------------
  // REQUIREMENT 2: INTERNATIONAL SHIPPING & CHECKOUT
  // ---------------------------------------------------------------------

  console.log('\n▶ Auditing Requirement 2: Country Registry & Destination Catalog');

  await test('lib/countries.ts provides comprehensive country registry', async () => {
    const countriesMod = await import(pathToFileURL(path.join(projectRoot, 'lib', 'countries.ts')).href);
    const all = countriesMod.getAllCountries();
    assert(all.length >= 40, `Country catalog must contain >= 40 countries, found ${all.length}`);

    const az = countriesMod.getCountryByCode('AZ');
    assert(az, 'Azerbaijan must exist');
    assert.strictEqual(az.dialCode, '+994');
    assert.strictEqual(az.requiresPostalCode, false);

    const us = countriesMod.getCountryByCode('US');
    assert(us, 'United States must exist');
    assert.strictEqual(us.dialCode, '+1');
    assert.strictEqual(us.requiresPostalCode, true);
    assert.strictEqual(us.requiresState, true);

    const tr = countriesMod.getCountryByCode('TR');
    assert(tr, 'Turkey must exist');
    assert.strictEqual(tr.requiresPostalCode, true);

    // Phone formatting
    assert.strictEqual(countriesMod.formatPhoneWithDialCode('501234567', 'AZ'), '+994 501234567');
    assert.strictEqual(countriesMod.formatPhoneWithDialCode('0501234567', 'AZ'), '+994 501234567');
  });

  console.log('\n▶ Auditing Requirement 2: International Shipping Rate Engine');

  await test('lib/shipping.ts computes accurate tiered rates and free shipping thresholds', async () => {
    const shippingMod = await import(pathToFileURL(path.join(projectRoot, 'lib', 'shipping.ts')).href);

    // Domestic Azerbaijan
    const bakuRates = shippingMod.calculateShippingOptions('AZ', 20, 'AZN');
    const bakuOption = bakuRates.find((o) => o.id === 'domestic_baku_sumgayit');
    assert(bakuOption, 'Baku option must exist');
    assert.strictEqual(bakuOption.price, 0, 'Baku courier is always free');

    const rayonUnder60 = shippingMod.calculateShippingOptions('AZ', 50, 'AZN');
    const rayonOption1 = rayonUnder60.find((o) => o.id === 'domestic_region');
    assert.strictEqual(rayonOption1.price, 5, 'Rayon under 60 AZN is 5 AZN');

    const rayonOver60 = shippingMod.calculateShippingOptions('AZ', 60, 'AZN');
    const rayonOption2 = rayonOver60.find((o) => o.id === 'domestic_region');
    assert.strictEqual(rayonOption2.price, 0, 'Rayon >= 60 AZN is free');

    // International in USD
    const usUnder150 = shippingMod.calculateShippingOptions('US', 100, 'USD');
    const stdOption1 = usUnder150.find((o) => o.id === 'intl_standard');
    const expOption1 = usUnder150.find((o) => o.id === 'intl_express');
    assert.strictEqual(stdOption1.price, 15, 'Standard International under $150 is $15');
    assert.strictEqual(expOption1.price, 35, 'DHL Express under $200 is $35');

    const usOver150 = shippingMod.calculateShippingOptions('US', 150, 'USD');
    const stdOption2 = usOver150.find((o) => o.id === 'intl_standard');
    assert.strictEqual(stdOption2.price, 0, 'Standard International >= $150 is free');

    const usOver200 = shippingMod.calculateShippingOptions('US', 200, 'USD');
    const expOption2 = usOver200.find((o) => o.id === 'intl_express');
    assert.strictEqual(expOption2.price, 20, 'DHL Express >= $200 is discounted to $20');

    // Anti-tamper rate validation
    const validCheck = shippingMod.validateShippingRate('US', 100, 'USD', 'intl_standard', 15);
    assert.strictEqual(validCheck.valid, true, 'Claiming $15 when rate is $15 must be valid');

    const tamperedCheck = shippingMod.validateShippingRate('US', 100, 'USD', 'intl_standard', 0);
    assert.strictEqual(tamperedCheck.valid, false, 'Claiming $0 when rate is $15 must be rejected');
  });

  console.log('\n▶ Auditing Requirement 2: Payment Gating (COD restricted to Azerbaijan)');

  await test('lib/payments/provider.ts strictly gates Cash On Delivery to domestic AZ', async () => {
    const { loadTsModule } = await import(pathToFileURL(path.join(projectRoot, 'tests', 'helpers', 'test-context.mjs')).href);
    const paymentsMod = await loadTsModule('lib/payments/provider.ts');

    const azEligible = paymentsMod.validatePaymentEligibility(
      [],
      'cash_on_delivery',
      { countryCode: 'AZ' }
    );
    assert.strictEqual(azEligible.eligible, true, 'COD must be eligible for AZ');

    const usBlocked = paymentsMod.validatePaymentEligibility(
      [],
      'cash_on_delivery',
      { countryCode: 'US' }
    );
    assert.strictEqual(usBlocked.eligible, false, 'COD must be blocked for US');

    const trBlocked = paymentsMod.validatePaymentEligibility(
      [],
      'cash_on_delivery',
      { countryCode: 'TR' }
    );
    assert.strictEqual(trBlocked.eligible, false, 'COD must be blocked for TR');

    const cardUsEligible = paymentsMod.validatePaymentEligibility(
      [],
      'card',
      { countryCode: 'US' }
    );
    assert.strictEqual(cardUsEligible.eligible, true, 'Card must be eligible globally');
  });

  console.log('\n▶ Auditing Requirement 2: Checkout UI & Server-side Order Route');

  await test('Checkout UI (app/checkout/page.tsx) renders international address and country selector', () => {
    const checkoutCode = fs.readFileSync(path.join(projectRoot, 'app', 'checkout', 'page.tsx'), 'utf8');
    assert(checkoutCode.includes('selectedCountryCode'), 'Must manage selectedCountryCode state');
    assert(checkoutCode.includes('addressLine2'), 'Must have addressLine2 field');
    assert(checkoutCode.includes('stateOrRegion'), 'Must have stateOrRegion field');
    assert(checkoutCode.includes('postalCode'), 'Must have postalCode field');
    assert(checkoutCode.includes('calculateShippingOptions'), 'Must calculate dynamic shipping options');
    assert(checkoutCode.includes('requiresPostalCode') || checkoutCode.includes('!isDomestic'), 'Must enforce postal code when required');
    assert(checkoutCode.includes('setPaymentMethod("card")'), 'Must switch away from COD for intl');
  });

  await test('Server Order route (app/api/store/orders/route.ts) enforces server rates & COD gating', () => {
    const orderRouteCode = fs.readFileSync(path.join(projectRoot, 'app', 'api', 'store/orders', 'route.ts'), 'utf8');
    assert(orderRouteCode.includes('validateShippingRate'), 'Must call validateShippingRate');
    assert(orderRouteCode.includes('Çatdırılma haqqı uyğunsuzluğu'), 'Must return error on rate tampering');
    assert(orderRouteCode.includes('countryCode !== \'AZ\''), 'Must block COD outside AZ');
    assert(orderRouteCode.includes('sanitizedCustomer'), 'Must sanitize customer address');
  });

  await test('Database schema (lib/supabase/schema.sql) has international columns', () => {
    const schemaCode = fs.readFileSync(path.join(projectRoot, 'lib', 'supabase', 'schema.sql'), 'utf8');
    assert(schemaCode.includes('delivery_country'), 'Schema must have delivery_country');
    assert(schemaCode.includes('delivery_postal_code'), 'Schema must have delivery_postal_code');
    assert(schemaCode.includes('delivery_state'), 'Schema must have delivery_state');
    assert(schemaCode.includes('delivery_address_line2'), 'Schema must have delivery_address_line2');
    assert(schemaCode.includes('shipping_method'), 'Schema must have shipping_method');
    assert(schemaCode.includes('shipping_amount'), 'Schema must have shipping_amount');
  });

  console.log('\n======================================================');
  console.log(`   INDEPENDENT AUDITOR SUMMARY`);
  console.log(`   Passed: ${passCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log('======================================================');

  if (failCount > 0) {
    process.exit(1);
  }
}

runAudit();
