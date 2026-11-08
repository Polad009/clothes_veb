/**
 * Tier 4 Scenario: Istanbul Turkey Customer Free International Shipping Journey
 * Journey: Browse Women Collection -> Cart Subtotal $157 USD (> $150) -> Qualifies for FREE Priority Post -> Apple Pay
 */

import { describe, test } from '../../scripts/run-e2e-tests.mjs';
import { assert, assertEqual, MOCK_PRODUCTS, filterProductsByGender, loadTsModule } from '../helpers/test-context.mjs';
import { validateInternationalAddressContract } from '../helpers/contracts.mjs';

describe('Tier 4 Scenario 3: Turkey International Free Shipping Journey', async () => {
  const { calculateShippingOptions, getShippingOptionById } = await import('../../lib/shipping.ts');
  const { formatPhoneWithDialCode, getCountryByCode } = await import('../../lib/countries.ts');
  const { validatePaymentEligibility } = await loadTsModule('lib/payments/provider.ts');

  test('SCENARIO-03: Istanbul customer orders $157 USD, qualifies for Free Standard Shipping, pays with Apple Pay', () => {
    // 1. Browsing & Filtering
    const womenProducts = filterProductsByGender(MOCK_PRODUCTS, 'women');
    const croppedTee = womenProducts.find((p) => p.slug === 'horwalle-cropped-women-tee');
    const silkDress = womenProducts.find((p) => p.slug === 'horwalle-draped-mini-dress');
    const beanie = womenProducts.find((p) => p.slug === 'horwalle-merino-wool-beanie'); // unisex inclusion

    assert(croppedTee !== undefined && silkDress !== undefined && beanie !== undefined);

    // 2. Cart in USD
    const cart = [
      { productId: croppedTee.id, name: croppedTee.name, price: croppedTee.internationalPrice, quantity: 1, type: 'ready' },
      { productId: silkDress.id, name: silkDress.name, price: silkDress.internationalPrice, quantity: 1, type: 'ready' },
      { productId: beanie.id, name: beanie.name, price: beanie.internationalPrice, quantity: 1, type: 'ready' },
    ];
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    assertEqual(subtotal, 157, 'Subtotal: $32 + $105 + $20 = $157 USD');

    // 3. Customer Address in Turkey
    const trCountry = getCountryByCode('TR');
    assertEqual(trCountry.requiresPostalCode, true);
    assertEqual(trCountry.requiresState, false);

    const rawCustomerInput = {
      fullName: 'Defne Samyeli',
      phone: '5329876543',
      email: 'defne@example.tr',
      address: 'Nispetiye Caddesi No: 24, Daire: 6',
      city: 'Beşiktaş, İstanbul',
      postalCode: '34340',
      country: trCountry.name,
      countryCode: trCountry.code,
    };

    const formattedPhone = formatPhoneWithDialCode(rawCustomerInput.phone, rawCustomerInput.countryCode);
    assertEqual(formattedPhone, '+90 5329876543');

    const customerAddress = {
      ...rawCustomerInput,
      phone: formattedPhone,
    };
    assertEqual(validateInternationalAddressContract(customerAddress), true);

    // 4. Shipping Calculation: Subtotal $157 >= $150 threshold
    const shippingOptions = calculateShippingOptions(customerAddress.countryCode, subtotal, 'USD');
    const standardOpt = shippingOptions.find((o) => o.id === 'intl_standard');
    assert(standardOpt !== undefined);
    assertEqual(standardOpt.price, 0, 'Standard shipping must be FREE ($0) on $157 subtotal');
    assertEqual(standardOpt.isFree, true);

    // 5. Payment Selection: Apple Pay
    const paymentCheck = validatePaymentEligibility(cart, 'apple_pay', customerAddress);
    assertEqual(paymentCheck.valid, true);
    assertEqual(paymentCheck.eligible, true);

    // 6. Complete Order
    const finalOrder = {
      id: `ord_${Date.now()}_istanbul`,
      date: new Date().toISOString(),
      customer: customerAddress,
      items: cart,
      paymentMethod: 'apple_pay',
      paymentStatus: 'paid',
      orderStatus: 'yeni',
      subtotal,
      shipping: standardOpt.price,
      shippingMethod: standardOpt.id,
      shippingMethodLabel: standardOpt.name,
      estimatedDelivery: standardOpt.estimatedDays,
      currency: 'USD',
      total: subtotal + standardOpt.price,
    };

    assertEqual(finalOrder.total, 157, 'Total equals subtotal with 0 shipping');
    assertEqual(finalOrder.shipping, 0);
    assertEqual(finalOrder.shippingMethod, 'intl_standard');
    assertEqual(finalOrder.customer.countryCode, 'TR');
  });
});
