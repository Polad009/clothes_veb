/**
 * Contract Validators for Interface Contracts defined in PROJECT.md
 */

import { assert, assertEqual } from './test-context.mjs';

/**
 * Validate CountryInfo object matches contract
 */
export function validateCountryInfoContract(country) {
  assert(country && typeof country === 'object', 'Country must be a non-null object');
  assertEqual(typeof country.code, 'string', 'country.code must be string');
  assert(/^[A-Z]{2}$/.test(country.code), `country.code must be 2 uppercase letters: ${country.code}`);
  assertEqual(typeof country.name, 'string', 'country.name must be string');
  assert(country.name.length > 0, 'country.name must not be empty');
  assertEqual(typeof country.localName, 'string', 'country.localName must be string');
  assertEqual(typeof country.dialCode, 'string', 'country.dialCode must be string');
  assert(country.dialCode.startsWith('+'), `country.dialCode must start with +: ${country.dialCode}`);
  assertEqual(typeof country.flag, 'string', 'country.flag must be emoji string');
  assertEqual(typeof country.requiresPostalCode, 'boolean', 'country.requiresPostalCode must be boolean');
  assertEqual(typeof country.requiresState, 'boolean', 'country.requiresState must be boolean');
  return true;
}

/**
 * Validate ShippingOption object matches contract
 */
export function validateShippingOptionContract(option) {
  assert(option && typeof option === 'object', 'ShippingOption must be an object');
  assertEqual(typeof option.id, 'string', 'option.id must be string');
  assert(option.id.length > 0, 'option.id must not be empty');
  assertEqual(typeof option.name, 'string', 'option.name must be string');
  assertEqual(typeof option.carrier, 'string', 'option.carrier must be string');
  assertEqual(typeof option.estimatedDays, 'string', 'option.estimatedDays must be string');
  assertEqual(typeof option.price, 'number', 'option.price must be a number');
  assert(option.price >= 0, `option.price must be non-negative: ${option.price}`);
  assertEqual(typeof option.isFree, 'boolean', 'option.isFree must be boolean');
  assert(
    option.currency === 'AZN' || option.currency === 'USD',
    `option.currency must be 'AZN' or 'USD', got: ${option.currency}`
  );
  if (option.isFree) {
    assertEqual(option.price, 0, 'When isFree is true, price must be 0');
  }
  return true;
}

/**
 * Validate Gender enum value
 */
export function validateGenderValue(gender) {
  const allowed = ['men', 'women', 'unisex'];
  assert(allowed.includes(gender), `Invalid gender: "${gender}". Must be one of: ${allowed.join(', ')}`);
  return true;
}

/**
 * Validate InternationalAddress payload contract
 */
export function validateInternationalAddressContract(addr) {
  assert(addr && typeof addr === 'object', 'Address must be an object');
  assertEqual(typeof addr.fullName, 'string', 'fullName must be string');
  assert(addr.fullName.trim().length >= 3, 'fullName must be at least 3 chars');
  assertEqual(typeof addr.phone, 'string', 'phone must be string');
  assert(addr.phone.trim().length >= 5, 'phone must have digits');
  assertEqual(typeof addr.email, 'string', 'email must be string');
  assert(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr.email), 'email must be valid email format');
  assertEqual(typeof addr.address, 'string', 'address must be string');
  assert(addr.address.trim().length >= 4, 'address must be at least 4 chars');
  assertEqual(typeof addr.city, 'string', 'city must be string');
  assertEqual(typeof addr.country, 'string', 'country name must be string');
  assertEqual(typeof addr.countryCode, 'string', 'countryCode must be string');
  assert(/^[A-Z]{2}$/.test(addr.countryCode), 'countryCode must be 2-letter uppercase ISO code');

  // If international (not AZ), postal code is required
  if (addr.countryCode !== 'AZ') {
    assert(
      typeof addr.postalCode === 'string' && addr.postalCode.trim().length > 0,
      `International destination (${addr.countryCode}) requires non-empty postalCode`
    );
  }

  // If US, CA, or AU, state/province is required
  if (['US', 'CA', 'AU'].includes(addr.countryCode)) {
    assert(
      typeof addr.stateOrRegion === 'string' && addr.stateOrRegion.trim().length > 0,
      `Destination (${addr.countryCode}) requires non-empty stateOrRegion`
    );
  }

  return true;
}
