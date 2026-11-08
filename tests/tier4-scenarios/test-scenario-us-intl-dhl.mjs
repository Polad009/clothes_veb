/**
 * Tier 4 Scenario: US Customer International DHL Express Journey
 * Journey: Browse Men Collection -> Add Tee + Carpenter Denim ($114 USD) -> Attempt COD (Blocked) -> Switch to Card -> Complete DHL Express Order
 */

import { describe, test } from '../../scripts/run-e2e-tests.mjs';
import { assert, assertEqual, assertContains, MOCK_PRODUCTS, filterProductsByGender, loadTsModule } from '../helpers/test-context.mjs';
import { validateInternationalAddressContract } from '../helpers/contracts.mjs';

describe('Tier 4 Scenario 2: US International DHL Express Journey', async () => {
  const { calculateShippingOptions, getShippingOptionById, validateShippingRate } = await import('../../lib/shipping.ts');
  const { formatPhoneWithDialCode, getCountryByCode } = await import('../../lib/countries.ts');
  const { validatePaymentEligibility } = await loadTsModule('lib/payments/provider.ts');

  test('SCENARIO-02: US customer filters Men items, selects DHL Express, COD is blocked, pays via Card', () => {
    // 1. Browsing & Filtering
    const menProducts = filterProductsByGender(MOCK_PRODUCTS, 'men');
    const tee = menProducts.find((p) => p.slug === 'horwalle-vintage-men-tee');
    const pants = menProducts.find((p) => p.slug === 'horwalle-carpenter-jeans-indigo');
    assert(tee !== undefined && pants !== undefined, 'Customer finds both vintage tee and jeans');

    // 2. Cart in USD
    const cart = [
      { productId: tee.id, name: tee.name, price: tee.internationalPrice, quantity: 1, type: 'ready' },
      { productId: pants.id, name: pants.name, price: pants.internationalPrice, quantity: 1, type: 'ready' },
    ];
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    assertEqual(subtotal, 114, 'Subtotal: $38 + $76 = $114 USD');

    // 3. Customer Address in New York
    const country = getCountryByCode('US');
    assert(country !== undefined && country.requiresState && country.requiresPostalCode);

    const rawCustomerInput = {
      fullName: 'Robert De Niro',
      phone: '2125550199',
      email: 'robert@tribeca.com',
      address: '10 Greenwich Street',
      addressLine2: 'Penthouse B',
      city: 'New York',
      stateOrRegion: 'NY',
      postalCode: '10013',
      country: country.name,
      countryCode: country.code,
    };

    const formattedPhone = formatPhoneWithDialCode(rawCustomerInput.phone, rawCustomerInput.countryCode);
    assertEqual(formattedPhone, '+1 2125550199');

    const customerAddress = {
      ...rawCustomerInput,
      phone: formattedPhone,
    };
    assertEqual(validateInternationalAddressContract(customerAddress), true);

    // 4. Shipping Calculation
    const shippingOptions = calculateShippingOptions(customerAddress.countryCode, subtotal, 'USD');
    assertEqual(shippingOptions.length, 2);

    const standardOpt = shippingOptions.find((o) => o.id === 'intl_standard');
    assertEqual(standardOpt.price, 15, 'Standard is $15 since $114 < $150 threshold');

    const expressOpt = getShippingOptionById(customerAddress.countryCode, subtotal, 'USD', 'intl_express');
    assert(expressOpt !== null);
    assertEqual(expressOpt.price, 35, 'Express is $35 since $114 < $200 threshold');

    // Verify rate validation
    const rateCheck = validateShippingRate(customerAddress.countryCode, subtotal, 'USD', 'intl_express', 35);
    assertEqual(rateCheck.valid, true);

    // 5. Payment Selection: Attempt Cash on Delivery
    const codAttempt = validatePaymentEligibility(cart, 'cash_on_delivery', customerAddress);
    assertEqual(codAttempt.valid, false, 'COD must be rejected for US customer');
    assertEqual(codAttempt.eligible, false);
    assertContains(codAttempt.reason, 'yalnız Azərbaycan');

    // Switch to Card payment
    const cardEligibility = validatePaymentEligibility(cart, 'card', customerAddress);
    assertEqual(cardEligibility.valid, true, 'Card payment must be accepted');

    // 6. Complete Order
    const total = subtotal + expressOpt.price;
    assertEqual(total, 149, 'Total: $114 + $35 = $149 USD');

    const finalOrder = {
      id: `ord_${Date.now()}_us`,
      date: new Date().toISOString(),
      customer: customerAddress,
      items: cart,
      paymentMethod: 'card',
      paymentStatus: 'paid',
      orderStatus: 'yeni',
      subtotal,
      shipping: expressOpt.price,
      shippingMethod: expressOpt.id,
      shippingMethodLabel: expressOpt.name,
      estimatedDelivery: expressOpt.estimatedDays,
      currency: 'USD',
      total,
    };

    assertEqual(finalOrder.customer.countryCode, 'US');
    assertEqual(finalOrder.customer.postalCode, '10013');
    assertEqual(finalOrder.customer.stateOrRegion, 'NY');
    assertEqual(finalOrder.shippingMethod, 'intl_express');
    assertEqual(finalOrder.currency, 'USD');
  });
});
