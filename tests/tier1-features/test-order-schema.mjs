/**
 * Tier 1 Feature Tests: Order Schema & International Address Models
 * Covers: lib/storeDb.ts and lib/supabase/schema.sql
 */

import { describe, test } from '../../scripts/run-e2e-tests.mjs';
import {
  assert,
  assertEqual,
  assertContains,
  assertMatches,
  readProjectFile,
} from '../helpers/test-context.mjs';
import { validateInternationalAddressContract } from '../helpers/contracts.mjs';

describe('Order Data Model & Schema Expansion (lib/storeDb.ts)', () => {
  const storeDbCode = readProjectFile('lib/storeDb.ts');

  test('FEAT-SHIP-04.1: StoreCustomerAddress interface defines international fields (postalCode, countryCode, stateOrRegion, addressLine2)', () => {
    assertContains(storeDbCode, 'export interface StoreCustomerAddress', 'Must define StoreCustomerAddress');
    assertMatches(storeDbCode, /addressLine2\?:\s*string/, 'addressLine2 must be defined in customer address');
    assertMatches(storeDbCode, /stateOrRegion\?:\s*string/, 'stateOrRegion must be defined in customer address');
    assertMatches(storeDbCode, /postalCode\?:\s*string/, 'postalCode must be defined in customer address');
    assertMatches(storeDbCode, /countryCode\?:\s*string/, 'countryCode must be defined in customer address');
  });

  test('FEAT-SHIP-04.2: StoreOrder interface defines shippingMethod, shippingMethodLabel, estimatedDelivery, and currency', () => {
    assertMatches(storeDbCode, /shippingMethod\?:\s*string/, 'shippingMethod must be defined in StoreOrder');
    assertMatches(storeDbCode, /shippingMethodLabel\?:\s*string/, 'shippingMethodLabel must be defined in StoreOrder');
    assertMatches(storeDbCode, /estimatedDelivery\?:\s*string/, 'estimatedDelivery must be defined in StoreOrder');
    assertMatches(storeDbCode, /currency\?:\s*string/, 'currency must be defined in StoreOrder');
  });
});

describe('Database Schema Migration Scripts (lib/supabase/schema.sql)', () => {
  const schemaSql = readProjectFile('lib/supabase/schema.sql');

  test('FEAT-SHIP-04.3: orders table definition includes international columns', () => {
    assertContains(schemaSql, 'delivery_address_line2 TEXT', 'orders table must have delivery_address_line2');
    assertContains(schemaSql, 'delivery_state TEXT', 'orders table must have delivery_state');
    assertContains(schemaSql, 'delivery_postal_code TEXT', 'orders table must have delivery_postal_code');
    assertContains(schemaSql, 'delivery_country TEXT NOT NULL', 'orders table must have delivery_country');
    assertContains(schemaSql, 'shipping_method TEXT', 'orders table must have shipping_method');
  });

  test('FEAT-SHIP-04.4: Idempotent ALTER TABLE migrations exist for production safety', () => {
    assertContains(
      schemaSql,
      'ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_country',
      'Must contain idempotent migration for delivery_country'
    );
    assertContains(
      schemaSql,
      'ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_postal_code',
      'Must contain idempotent migration for delivery_postal_code'
    );
    assertContains(
      schemaSql,
      'ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_state',
      'Must contain idempotent migration for delivery_state'
    );
    assertContains(
      schemaSql,
      'ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address_line2',
      'Must contain idempotent migration for delivery_address_line2'
    );
    assertContains(
      schemaSql,
      'ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_method',
      'Must contain idempotent migration for shipping_method'
    );
    assertContains(
      schemaSql,
      'ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_amount',
      'Must contain idempotent migration for shipping_amount'
    );
    assertContains(
      schemaSql,
      'ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency',
      'Must contain idempotent migration for currency'
    );
  });
});

describe('International Address Contract Conformance', () => {
  test('FEAT-SHIP-04.5: Domestic Baku order satisfies address contract', () => {
    const bakuAddress = {
      fullName: 'Nizami Gəncəvi',
      phone: '+994 50 123 45 67',
      email: 'nizami@example.az',
      address: 'Nizami küçəsi 45, mənzil 12',
      city: 'Bakı',
      country: 'Azərbaycan',
      countryCode: 'AZ',
    };
    assertEqual(validateInternationalAddressContract(bakuAddress), true);
  });

  test('FEAT-SHIP-04.6: US international order with state and ZIP satisfies address contract', () => {
    const usAddress = {
      fullName: 'Alexander Hamilton',
      phone: '+1 212 555 0199',
      email: 'alexander@example.com',
      address: '55 Wall Street',
      addressLine2: 'Penthouse B',
      city: 'New York',
      stateOrRegion: 'NY',
      postalCode: '10005',
      country: 'United States',
      countryCode: 'US',
    };
    assertEqual(validateInternationalAddressContract(usAddress), true);
  });

  test('FEAT-SHIP-04.7: Turkey international order with postal code satisfies address contract', () => {
    const trAddress = {
      fullName: 'Mehmet Yılmaz',
      phone: '+90 532 111 22 33',
      email: 'mehmet@example.tr',
      address: 'Bağdat Caddesi No: 120, Daire: 4',
      city: 'Kadıköy, İstanbul',
      postalCode: '34728',
      country: 'Turkey',
      countryCode: 'TR',
    };
    assertEqual(validateInternationalAddressContract(trAddress), true);
  });
});
