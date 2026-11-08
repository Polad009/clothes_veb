/**
 * Tier 4 Scenario: Local Baku Resident Customer Journey
 * Journey: Browse Unisex Collection -> Add Boxy Hoodie (110 ₼) -> Baku Courier Delivery -> Cash on Delivery (COD)
 */

import { describe, test } from '../../scripts/run-e2e-tests.mjs';
import { assert, assertEqual, MOCK_PRODUCTS, filterProductsByGender, loadTsModule } from '../helpers/test-context.mjs';
import { validateInternationalAddressContract } from '../helpers/contracts.mjs';

describe('Tier 4 Scenario 1: Baku Domestic Order Lifecycle', async () => {
  const { calculateShippingOptions, getShippingOptionById } = await import('../../lib/shipping.ts');
  const { formatPhoneWithDialCode } = await import('../../lib/countries.ts');
  const { validatePaymentEligibility } = await loadTsModule('lib/payments/provider.ts');

  test('SCENARIO-01: Baku domestic customer discovers hoodie, selects Baku courier, pays via COD', () => {
    // 1. Browsing & Filtering
    const unisexProducts = filterProductsByGender(MOCK_PRODUCTS, 'unisex');
    const hoodie = unisexProducts.find((p) => p.slug === 'horwalle-heavyweight-hoodie-obsidian');
    assert(hoodie !== undefined, 'Customer must find obsidian heavyweight hoodie');
    assertEqual(hoodie.price, 110, 'Price must be 110 ₼');

    // 2. Cart building
    const cart = [{ productId: hoodie.id, name: hoodie.name, price: hoodie.price, quantity: 1, type: 'ready' }];
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    assertEqual(subtotal, 110);

    // 3. Customer Address Details
    const rawCustomerInput = {
      fullName: 'Rəşad Məmmədov',
      phone: '0502345678',
      email: 'rashad@example.az',
      address: 'Nizami küçəsi 28, mənzil 5',
      city: 'Bakı',
      country: 'Azərbaycan',
      countryCode: 'AZ',
    };

    // Phone normalization with dial code
    const formattedPhone = formatPhoneWithDialCode(rawCustomerInput.phone, rawCustomerInput.countryCode);
    assertEqual(formattedPhone, '+994 502345678');

    const customerAddress = {
      ...rawCustomerInput,
      phone: formattedPhone,
    };
    assertEqual(validateInternationalAddressContract(customerAddress), true);

    // 4. Shipping Calculation
    const shippingOptions = calculateShippingOptions(customerAddress.countryCode, subtotal, 'AZN');
    const selectedOption = getShippingOptionById(customerAddress.countryCode, subtotal, 'AZN', 'domestic_baku_sumgayit');
    assert(selectedOption !== null, 'Baku courier option must be available');
    assertEqual(selectedOption.price, 0, 'Baku courier must be free');
    assertEqual(selectedOption.isFree, true);

    // 5. Payment Selection & Eligibility Check
    const paymentMethod = 'cash_on_delivery';
    const eligibility = validatePaymentEligibility(cart, paymentMethod, customerAddress);
    assertEqual(eligibility.valid, true, 'COD must be allowed for ready-made domestic order');
    assertEqual(eligibility.eligible, true);

    // 6. Final Order Construction
    const finalOrder = {
      id: `ord_${Date.now()}_baku`,
      date: new Date().toISOString(),
      customer: customerAddress,
      items: cart,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'yeni',
      subtotal,
      shipping: selectedOption.price,
      shippingMethod: selectedOption.id,
      shippingMethodLabel: selectedOption.name,
      estimatedDelivery: selectedOption.estimatedDays,
      currency: 'AZN',
      total: subtotal + selectedOption.price,
    };

    assertEqual(finalOrder.total, 110, 'Total should equal subtotal since shipping is 0');
    assertEqual(finalOrder.shippingMethod, 'domestic_baku_sumgayit');
    assertEqual(finalOrder.currency, 'AZN');
  });
});
