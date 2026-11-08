/**
 * Tier 1 Feature Tests: Global Country & Destination Registry
 * Covers: lib/countries.ts
 */

import { describe, test } from '../../scripts/run-e2e-tests.mjs';
import { assert, assertEqual, assertContains, assertDeepEqual } from '../helpers/test-context.mjs';
import { validateCountryInfoContract } from '../helpers/contracts.mjs';

describe('Global Country Registry (lib/countries.ts)', async () => {
  const countriesModule = await import('../../lib/countries.ts');
  const {
    getAllCountries,
    getCountryByCode,
    isValidCountry,
    formatPhoneWithDialCode,
    searchCountries,
    AZERBAIJAN_COUNTRY_CODE,
    DEFAULT_COUNTRY,
  } = countriesModule;

  test('FEAT-SHIP-01.1: getAllCountries() returns a comprehensive catalog of >= 30 countries', () => {
    const list = getAllCountries();
    assert(Array.isArray(list), 'getAllCountries must return an array');
    assert(list.length >= 30, `Expected at least 30 countries, found ${list.length}`);
    for (const c of list) {
      validateCountryInfoContract(c);
    }
  });

  test('FEAT-SHIP-01.2: Origin country Azerbaijan (AZ) is properly defined with +994 dial code', () => {
    assertEqual(AZERBAIJAN_COUNTRY_CODE, 'AZ', 'AZERBAIJAN_COUNTRY_CODE must be "AZ"');
    const az = getCountryByCode('AZ');
    assert(az !== undefined, 'Azerbaijan must exist in registry');
    assertEqual(az.code, 'AZ', 'Country code must be AZ');
    assertEqual(az.name, 'Azerbaijan', 'English name must be Azerbaijan');
    assertEqual(az.localName, 'Azərbaycan', 'Local name must be Azərbaycan');
    assertEqual(az.dialCode, '+994', 'Dial code must be +994');
    assertEqual(az.requiresPostalCode, false, 'AZ domestic couriers do not require postal code');
    assertEqual(az.requiresState, false, 'AZ domestic couriers do not require state');
  });

  test('FEAT-SHIP-01.3: Major global e-commerce destinations exist in registry (US, TR, GB, DE, AE, CA)', () => {
    const expected = ['US', 'TR', 'GB', 'DE', 'AE', 'CA', 'FR', 'IT', 'ES', 'SA'];
    for (const code of expected) {
      const country = getCountryByCode(code);
      assert(country !== undefined, `Country ${code} must exist in registry`);
      assertEqual(country.code, code);
      assert(country.dialCode.startsWith('+'), `${code} dial code must start with +`);
    }
  });

  test('FEAT-SHIP-01.4: getCountryByCode() is case-insensitive and handles UK alias for GB', () => {
    const usLower = getCountryByCode('us');
    assert(usLower !== undefined, 'us lowercase should resolve to US');
    assertEqual(usLower.code, 'US');

    const trMixed = getCountryByCode('Tr');
    assert(trMixed !== undefined, 'Tr mixed case should resolve to TR');
    assertEqual(trMixed.code, 'TR');

    const ukAlias = getCountryByCode('UK');
    assert(ukAlias !== undefined, 'UK alias should resolve to GB');
    assertEqual(ukAlias.code, 'GB');
  });

  test('FEAT-SHIP-01.5: isValidCountry() accurately validates valid vs invalid ISO-2 codes', () => {
    assert(isValidCountry('AZ'), 'AZ must be valid');
    assert(isValidCountry('US'), 'US must be valid');
    assert(isValidCountry('TR'), 'TR must be valid');
    assert(!isValidCountry('ZZ'), 'ZZ must be invalid');
    assert(!isValidCountry(''), 'Empty string must be invalid');
    assert(!isValidCountry(null), 'null must be invalid');
    assert(!isValidCountry(undefined), 'undefined must be invalid');
  });

  test('FEAT-SHIP-01.6: Postal Code and State requirements are correctly configured per jurisdiction', () => {
    const us = getCountryByCode('US');
    assertEqual(us.requiresPostalCode, true, 'US must require ZIP code');
    assertEqual(us.requiresState, true, 'US must require state');

    const ca = getCountryByCode('CA');
    assertEqual(ca.requiresPostalCode, true, 'Canada must require postal code');
    assertEqual(ca.requiresState, true, 'Canada must require province');

    const tr = getCountryByCode('TR');
    assertEqual(tr.requiresPostalCode, true, 'Turkey must require postal code');
    assertEqual(tr.requiresState, false, 'Turkey does not require separate state');

    const az = getCountryByCode('AZ');
    assertEqual(az.requiresPostalCode, false, 'Azerbaijan does not require postal code');
  });

  test('FEAT-SHIP-01.7: formatPhoneWithDialCode() prefixes country dial code and strips leading zero', () => {
    // Azerbaijan local mobile starting with 050
    const azFormatted = formatPhoneWithDialCode('0501234567', 'AZ');
    assertEqual(azFormatted, '+994 501234567', 'Should strip leading 0 and prepend +994');

    // Azerbaijan number already having +994
    const azExisting = formatPhoneWithDialCode('+994501234567', 'AZ');
    assertEqual(azExisting, '+994501234567', 'Should leave existing prefix intact');

    // US number
    const usFormatted = formatPhoneWithDialCode('2125551234', 'US');
    assertEqual(usFormatted, '+1 2125551234', 'Should prepend +1 for US');

    // Turkey number
    const trFormatted = formatPhoneWithDialCode('5321234567', 'TR');
    assertEqual(trFormatted, '+90 5321234567', 'Should prepend +90 for TR');

    // Empty input returns dial code prefix
    const emptyAz = formatPhoneWithDialCode('', 'AZ');
    assertEqual(emptyAz, '+994 ', 'Empty phone should return dial code placeholder');
  });

  test('FEAT-SHIP-01.8: searchCountries() matches by name, local name, ISO code, or dial code', () => {
    const azMatches = searchCountries('azər');
    assert(azMatches.some((c) => c.code === 'AZ'), 'Search for "azər" must include Azerbaijan');

    const dialMatches = searchCountries('+90');
    assert(dialMatches.some((c) => c.code === 'TR'), 'Search for "+90" must include Turkey');

    const codeMatches = searchCountries('DE');
    assert(codeMatches.some((c) => c.code === 'DE'), 'Search for "DE" must include Germany');
  });
});
