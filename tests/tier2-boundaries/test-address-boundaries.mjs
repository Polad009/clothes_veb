/**
 * Tier 2 Boundary Tests: Address Form & Country Validation Boundaries
 * Covers: Invalid country codes, missing postal codes, mandatory state jurisdictions
 */

import { describe, test } from '../../scripts/run-e2e-tests.mjs';
import { assert, assertEqual, assertThrows } from '../helpers/test-context.mjs';
import { validateInternationalAddressContract } from '../helpers/contracts.mjs';

describe('Tier 2 Boundary: Invalid Country Codes & Aliases', async () => {
  const { isValidCountry, getCountryByCode } = await import('../../lib/countries.ts');

  test('BVA-ADDR-01: 3-letter ISO-3 codes (e.g. USA, TUR) are rejected when strict ISO-2 expected', () => {
    assertEqual(isValidCountry('USA'), false, 'USA (ISO-3) should not be directly recognized as ISO-2');
    assertEqual(isValidCountry('TUR'), false, 'TUR (ISO-3) should not be directly recognized as ISO-2');
    assertEqual(isValidCountry('AZE'), false, 'AZE (ISO-3) should not be directly recognized as ISO-2');
  });

  test('BVA-ADDR-02: Non-existent, numeric, and symbol strings return undefined / false', () => {
    const invalidCodes = ['XX', '99', '!', 'ZZ', 'None', 'undefined', '123'];
    for (const code of invalidCodes) {
      assertEqual(isValidCountry(code), false, `${code} must be invalid`);
      assertEqual(getCountryByCode(code), undefined, `${code} must return undefined`);
    }
  });

  test('BVA-ADDR-03: Whitespace padded codes are trimmed and resolved accurately', () => {
    const paddedUs = getCountryByCode('  US  ');
    assert(paddedUs !== undefined, 'Padded code "  US  " should resolve to US');
    assertEqual(paddedUs.code, 'US');

    const paddedAz = getCountryByCode('\tAZ\n');
    assert(paddedAz !== undefined, 'Padded code "\\tAZ\\n" should resolve to AZ');
    assertEqual(paddedAz.code, 'AZ');
  });
});

describe('Tier 2 Boundary: Missing Postal Code Enforcement', () => {
  const baseAddress = {
    fullName: 'Jane Doe',
    phone: '+1 212 555 0100',
    email: 'jane@example.com',
    address: '123 Fifth Avenue',
    city: 'New York',
    stateOrRegion: 'NY',
    country: 'United States',
    countryCode: 'US',
  };

  test('BVA-ADDR-04: International address with missing postalCode throws contract error', () => {
    const missingZip = { ...baseAddress, postalCode: undefined };
    assertThrows(() => validateInternationalAddressContract(missingZip), /requires non-empty postalCode/);

    const emptyZip = { ...baseAddress, postalCode: '' };
    assertThrows(() => validateInternationalAddressContract(emptyZip), /requires non-empty postalCode/);

    const whitespaceZip = { ...baseAddress, postalCode: '    ' };
    assertThrows(() => validateInternationalAddressContract(whitespaceZip), /requires non-empty postalCode/);
  });

  test('BVA-ADDR-05: Domestic Azerbaijan address with missing postalCode PASSES contract', () => {
    const azNoZip = {
      fullName: 'Əli Həsənov',
      phone: '+994 50 222 33 44',
      email: 'ali@example.az',
      address: 'Fəvvarələr meydanı 10',
      city: 'Bakı',
      country: 'Azərbaycan',
      countryCode: 'AZ',
      postalCode: undefined, // omitted
    };
    assertEqual(validateInternationalAddressContract(azNoZip), true);
  });
});

describe('Tier 2 Boundary: State / Province Jurisdiction Requirements', () => {
  test('BVA-ADDR-06: US, CA, AU orders without stateOrRegion throw contract error', () => {
    const jurisdictions = [
      { code: 'US', name: 'United States', city: 'Los Angeles' },
      { code: 'CA', name: 'Canada', city: 'Toronto' },
      { code: 'AU', name: 'Australia', city: 'Sydney' },
    ];

    for (const j of jurisdictions) {
      const order = {
        fullName: 'Test Customer',
        phone: '+1 555 123 4567',
        email: 'test@example.com',
        address: '100 Main Street',
        city: j.city,
        postalCode: '12345',
        country: j.name,
        countryCode: j.code,
        stateOrRegion: undefined, // Missing
      };
      assertThrows(
        () => validateInternationalAddressContract(order),
        /requires non-empty stateOrRegion/
      );
    }
  });

  test('BVA-ADDR-07: European and Middle Eastern orders without stateOrRegion PASS contract', () => {
    const flexibleJurisdictions = [
      { code: 'TR', name: 'Turkey', city: 'Ankara', zip: '06000' },
      { code: 'DE', name: 'Germany', city: 'Berlin', zip: '10115' },
      { code: 'FR', name: 'France', city: 'Paris', zip: '75001' },
      { code: 'AE', name: 'United Arab Emirates', city: 'Dubai', zip: '00000' },
    ];

    for (const j of flexibleJurisdictions) {
      const order = {
        fullName: 'Global Customer',
        phone: '+44 20 7946 0991',
        email: 'customer@example.eu',
        address: 'Rue de la Paix 1',
        city: j.city,
        postalCode: j.zip,
        country: j.name,
        countryCode: j.code,
        stateOrRegion: undefined, // Optional
      };
      assertEqual(validateInternationalAddressContract(order), true);
    }
  });
});
