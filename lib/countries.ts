/**
 * International Country Registry & Address Formatting
 * Comprehensive catalog of countries and territories for international e-commerce.
 */

export interface CountryInfo {
  code: string; // ISO 3166-1 alpha-2 code (uppercase)
  name: string; // Official / Common English name
  localName: string; // Localized native name
  dialCode: string; // International telephone calling code (e.g. "+994", "+1")
  flag: string; // Unicode flag emoji
  requiresPostalCode: boolean; // Whether postal/ZIP code is mandatory for couriers
  requiresState: boolean; // Whether state/province/region is mandatory
  postalCodePlaceholder?: string;
  statePlaceholder?: string;
}

export const AZERBAIJAN_COUNTRY_CODE = 'AZ';

export const COUNTRIES: CountryInfo[] = [
  // Domestic Origin
  {
    code: 'AZ',
    name: 'Azerbaijan',
    localName: 'Azərbaycan',
    dialCode: '+994',
    flag: '🇦🇿',
    requiresPostalCode: false,
    requiresState: false,
    postalCodePlaceholder: 'AZ1000',
    statePlaceholder: 'Bölgə / Şəhər',
  },

  // Major Regional & Strategic Partners
  {
    code: 'TR',
    name: 'Turkey',
    localName: 'Türkiye',
    dialCode: '+90',
    flag: '🇹🇷',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '34000',
    statePlaceholder: 'İl / Şehir',
  },
  {
    code: 'GE',
    name: 'Georgia',
    localName: 'საქართველო',
    dialCode: '+995',
    flag: '🇬🇪',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '0100',
    statePlaceholder: 'Region',
  },
  {
    code: 'RU',
    name: 'Russia',
    localName: 'Россия',
    dialCode: '+7',
    flag: '🇷🇺',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '101000',
    statePlaceholder: 'Область / Край',
  },
  {
    code: 'KZ',
    name: 'Kazakhstan',
    localName: 'Қазақстан',
    dialCode: '+7',
    flag: '🇰🇿',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '010000',
    statePlaceholder: 'Облыс / Region',
  },
  {
    code: 'UZ',
    name: 'Uzbekistan',
    localName: 'Oʻzbekiston',
    dialCode: '+998',
    flag: '🇺🇿',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '100000',
    statePlaceholder: 'Viloyat',
  },
  {
    code: 'UA',
    name: 'Ukraine',
    localName: 'Україна',
    dialCode: '+380',
    flag: '🇺🇦',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '01001',
    statePlaceholder: 'Область',
  },

  // North America
  {
    code: 'US',
    name: 'United States',
    localName: 'United States',
    dialCode: '+1',
    flag: '🇺🇸',
    requiresPostalCode: true,
    requiresState: true,
    postalCodePlaceholder: '90210',
    statePlaceholder: 'State (e.g. CA, NY, TX)',
  },
  {
    code: 'CA',
    name: 'Canada',
    localName: 'Canada',
    dialCode: '+1',
    flag: '🇨🇦',
    requiresPostalCode: true,
    requiresState: true,
    postalCodePlaceholder: 'M5V 2T6',
    statePlaceholder: 'Province (e.g. ON, BC, QC)',
  },
  {
    code: 'MX',
    name: 'Mexico',
    localName: 'México',
    dialCode: '+52',
    flag: '🇲🇽',
    requiresPostalCode: true,
    requiresState: true,
    postalCodePlaceholder: '06000',
    statePlaceholder: 'Estado',
  },

  // United Kingdom & Western Europe
  {
    code: 'GB',
    name: 'United Kingdom',
    localName: 'United Kingdom',
    dialCode: '+44',
    flag: '🇬🇧',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: 'W1B 3AG',
    statePlaceholder: 'County',
  },
  {
    code: 'DE',
    name: 'Germany',
    localName: 'Deutschland',
    dialCode: '+49',
    flag: '🇩🇪',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '10115',
    statePlaceholder: 'Bundesland',
  },
  {
    code: 'FR',
    name: 'France',
    localName: 'France',
    dialCode: '+33',
    flag: '🇫🇷',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '75008',
    statePlaceholder: 'Région / Département',
  },
  {
    code: 'IT',
    name: 'Italy',
    localName: 'Italia',
    dialCode: '+39',
    flag: '🇮🇹',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '20121',
    statePlaceholder: 'Provincia',
  },
  {
    code: 'ES',
    name: 'Spain',
    localName: 'España',
    dialCode: '+34',
    flag: '🇪🇸',
    requiresPostalCode: true,
    requiresState: true,
    postalCodePlaceholder: '28001',
    statePlaceholder: 'Provincia (e.g. Madrid, Barcelona)',
  },
  {
    code: 'CH',
    name: 'Switzerland',
    localName: 'Schweiz / Suisse',
    dialCode: '+41',
    flag: '🇨🇭',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '8001',
    statePlaceholder: 'Kanton / Canton',
  },
  {
    code: 'AT',
    name: 'Austria',
    localName: 'Österreich',
    dialCode: '+43',
    flag: '🇦🇹',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '1010',
    statePlaceholder: 'Bundesland',
  },
  {
    code: 'NL',
    name: 'Netherlands',
    localName: 'Nederland',
    dialCode: '+31',
    flag: '🇳🇱',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '1012 JS',
    statePlaceholder: 'Provincie',
  },
  {
    code: 'BE',
    name: 'Belgium',
    localName: 'België / Belgique',
    dialCode: '+32',
    flag: '🇧🇪',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '1000',
    statePlaceholder: 'Province',
  },
  {
    code: 'SE',
    name: 'Sweden',
    localName: 'Sverige',
    dialCode: '+46',
    flag: '🇸🇪',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '111 22',
    statePlaceholder: 'Län',
  },
  {
    code: 'NO',
    name: 'Norway',
    localName: 'Norge',
    dialCode: '+47',
    flag: '🇳🇴',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '0159',
    statePlaceholder: 'Fylke',
  },
  {
    code: 'DK',
    name: 'Denmark',
    localName: 'Danmark',
    dialCode: '+45',
    flag: '🇩🇰',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '1050',
    statePlaceholder: 'Region',
  },
  {
    code: 'FI',
    name: 'Finland',
    localName: 'Suomi',
    dialCode: '+358',
    flag: '🇫🇮',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '00100',
    statePlaceholder: 'Maakunta',
  },
  {
    code: 'IE',
    name: 'Ireland',
    localName: 'Éire',
    dialCode: '+353',
    flag: '🇮🇪',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: 'D02 X285',
    statePlaceholder: 'County',
  },
  {
    code: 'PT',
    name: 'Portugal',
    localName: 'Portugal',
    dialCode: '+351',
    flag: '🇵🇹',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '1100-048',
    statePlaceholder: 'Distrito',
  },
  {
    code: 'PL',
    name: 'Poland',
    localName: 'Polska',
    dialCode: '+48',
    flag: '🇵🇱',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '00-001',
    statePlaceholder: 'Województwo',
  },
  {
    code: 'CZ',
    name: 'Czech Republic',
    localName: 'Česká republika',
    dialCode: '+420',
    flag: '🇨🇿',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '110 00',
    statePlaceholder: 'Kraj',
  },
  {
    code: 'HU',
    name: 'Hungary',
    localName: 'Magyarország',
    dialCode: '+36',
    flag: '🇭🇺',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '1051',
    statePlaceholder: 'Megye',
  },
  {
    code: 'RO',
    name: 'Romania',
    localName: 'România',
    dialCode: '+40',
    flag: '🇷🇴',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '010011',
    statePlaceholder: 'Județ',
  },
  {
    code: 'GR',
    name: 'Greece',
    localName: 'Ελλάδα',
    dialCode: '+30',
    flag: '🇬🇷',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '105 57',
    statePlaceholder: 'Περιφέρεια',
  },

  // Middle East & GCC
  {
    code: 'AE',
    name: 'United Arab Emirates',
    localName: 'دولة الإمارات العربية المتحدة',
    dialCode: '+971',
    flag: '🇦🇪',
    requiresPostalCode: false,
    requiresState: true,
    postalCodePlaceholder: '00000 (Optional)',
    statePlaceholder: 'Emirate (e.g. Dubai, Abu Dhabi)',
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    localName: 'المملكة العربية السعودية',
    dialCode: '+966',
    flag: '🇸🇦',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '11564',
    statePlaceholder: 'Region / Province',
  },
  {
    code: 'QA',
    name: 'Qatar',
    localName: 'دولة قطر',
    dialCode: '+974',
    flag: '🇶🇦',
    requiresPostalCode: false,
    requiresState: false,
    postalCodePlaceholder: 'Postal Zone',
    statePlaceholder: 'Municipality',
  },
  {
    code: 'KW',
    name: 'Kuwait',
    localName: 'دولة الكويت',
    dialCode: '+965',
    flag: '🇰🇼',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '13001',
    statePlaceholder: 'Governorate',
  },
  {
    code: 'BH',
    name: 'Bahrain',
    localName: 'مملكة البحرين',
    dialCode: '+973',
    flag: '🇧🇭',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '317',
    statePlaceholder: 'Governorate',
  },
  {
    code: 'OM',
    name: 'Oman',
    localName: 'سلطنة عُمان',
    dialCode: '+968',
    flag: '🇴🇲',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '100',
    statePlaceholder: 'Governorate',
  },
  {
    code: 'IL',
    name: 'Israel',
    localName: 'ישראל',
    dialCode: '+972',
    flag: '🇮🇱',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '61000',
    statePlaceholder: 'District',
  },

  // Asia Pacific
  {
    code: 'JP',
    name: 'Japan',
    localName: '日本',
    dialCode: '+81',
    flag: '🇯🇵',
    requiresPostalCode: true,
    requiresState: true,
    postalCodePlaceholder: '100-0001',
    statePlaceholder: 'Prefecture (e.g. Tokyo, Osaka)',
  },
  {
    code: 'KR',
    name: 'South Korea',
    localName: '대한민국',
    dialCode: '+82',
    flag: '🇰🇷',
    requiresPostalCode: true,
    requiresState: true,
    postalCodePlaceholder: '04524',
    statePlaceholder: 'Province / City',
  },
  {
    code: 'CN',
    name: 'China',
    localName: '中国',
    dialCode: '+86',
    flag: '🇨🇳',
    requiresPostalCode: true,
    requiresState: true,
    postalCodePlaceholder: '100000',
    statePlaceholder: 'Province (e.g. Guangdong, Shanghai)',
  },
  {
    code: 'HK',
    name: 'Hong Kong',
    localName: '香港',
    dialCode: '+852',
    flag: '🇭🇰',
    requiresPostalCode: false,
    requiresState: false,
    postalCodePlaceholder: '00000',
    statePlaceholder: 'District',
  },
  {
    code: 'TW',
    name: 'Taiwan',
    localName: '台灣',
    dialCode: '+886',
    flag: '🇹🇼',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '100',
    statePlaceholder: 'County / City',
  },
  {
    code: 'SG',
    name: 'Singapore',
    localName: 'Singapore',
    dialCode: '+65',
    flag: '🇸🇬',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '238801',
    statePlaceholder: 'Region',
  },
  {
    code: 'AU',
    name: 'Australia',
    localName: 'Australia',
    dialCode: '+61',
    flag: '🇦🇺',
    requiresPostalCode: true,
    requiresState: true,
    postalCodePlaceholder: '2000',
    statePlaceholder: 'State (e.g. NSW, VIC, QLD)',
  },
  {
    code: 'NZ',
    name: 'New Zealand',
    localName: 'New Zealand',
    dialCode: '+64',
    flag: '🇳🇿',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '1010',
    statePlaceholder: 'Region',
  },
  {
    code: 'IN',
    name: 'India',
    localName: 'India',
    dialCode: '+91',
    flag: '🇮🇳',
    requiresPostalCode: true,
    requiresState: true,
    postalCodePlaceholder: '110001',
    statePlaceholder: 'State (e.g. Maharashtra, Delhi)',
  },

  // South America & Africa
  {
    code: 'BR',
    name: 'Brazil',
    localName: 'Brasil',
    dialCode: '+55',
    flag: '🇧🇷',
    requiresPostalCode: true,
    requiresState: true,
    postalCodePlaceholder: '01310-100',
    statePlaceholder: 'Estado (e.g. SP, RJ)',
  },
  {
    code: 'ZA',
    name: 'South Africa',
    localName: 'South Africa',
    dialCode: '+27',
    flag: '🇿🇦',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '8001',
    statePlaceholder: 'Province',
  },
  {
    code: 'EG',
    name: 'Egypt',
    localName: 'مصر',
    dialCode: '+20',
    flag: '🇪🇬',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '11511',
    statePlaceholder: 'Governorate',
  },
  {
    code: 'MA',
    name: 'Morocco',
    localName: 'المغرب',
    dialCode: '+212',
    flag: '🇲🇦',
    requiresPostalCode: true,
    requiresState: false,
    postalCodePlaceholder: '20000',
    statePlaceholder: 'Région',
  },
];

export const DEFAULT_COUNTRY: CountryInfo = COUNTRIES[0]; // Azerbaijan

/**
 * Get all supported countries
 */
export function getAllCountries(): CountryInfo[] {
  return [...COUNTRIES];
}

/**
 * Retrieve country by ISO-2 code (case-insensitive, supports 'UK' alias)
 */
export function getCountryByCode(code: string): CountryInfo | undefined {
  if (!code || typeof code !== 'string') return undefined;
  const trimmed = code.trim().toUpperCase();
  const normalizedCode = trimmed === 'UK' ? 'GB' : trimmed;
  return COUNTRIES.find((c) => c.code.toUpperCase() === normalizedCode);
}

/**
 * Check if given country code is in the catalog
 */
export function isValidCountry(code: string): boolean {
  return Boolean(getCountryByCode(code));
}

/**
 * Format a phone number ensuring the correct international dial code
 * - Preserves existing international prefixes
 * - Strips leading zero if local dial format was used
 * - Prepends dial code if missing
 */
export function formatPhoneWithDialCode(phone: string, countryCode: string): string {
  const country = getCountryByCode(countryCode) || DEFAULT_COUNTRY;
  const dialCode = country.dialCode;
  const cleanPhone = (phone || '').trim();

  if (!cleanPhone) {
    return `${dialCode} `;
  }

  // Already starts with the country's dial code
  if (cleanPhone.startsWith(dialCode)) {
    return cleanPhone;
  }

  // Starts with another plus prefix
  if (cleanPhone.startsWith('+')) {
    return cleanPhone;
  }

  // Strip leading zero common in local formats (e.g. 050 -> 50)
  const stripped = cleanPhone.startsWith('0') ? cleanPhone.slice(1).trim() : cleanPhone;
  return `${dialCode} ${stripped}`;
}

/**
 * Search countries by name, code, or local name
 */
export function searchCountries(query: string): CountryInfo[] {
  if (!query || typeof query !== 'string') return getAllCountries();
  const q = query.trim().toLowerCase();
  return COUNTRIES.filter(
    (c) =>
      c.code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.localName.toLowerCase().includes(q) ||
      c.dialCode.includes(q)
  );
}
