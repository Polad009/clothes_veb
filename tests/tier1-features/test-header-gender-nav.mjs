/**
 * Tier 1 Feature Tests: Storefront Navigation & Header Gender Links
 * Covers: components/Header.tsx and lib/translations.ts
 */

import { describe, test } from '../../scripts/run-e2e-tests.mjs';
import { assert, assertEqual, assertContains, assertMatches, readProjectFile, loadTsModule } from '../helpers/test-context.mjs';

describe('Storefront Header Navigation (components/Header.tsx)', () => {
  const headerCode = readProjectFile('components/Header.tsx');

  test('FEAT-GEND-02.1: Header navLinks contains dedicated Kişi (/collections?gender=men) link', () => {
    assertMatches(
      headerCode,
      /href:\s*["']\/collections\?gender=men["']/,
      'navLinks must contain link to /collections?gender=men'
    );
    assertMatches(
      headerCode,
      /genderId:\s*["']men["']/,
      'navLink must define genderId: "men"'
    );
  });

  test('FEAT-GEND-02.2: Header navLinks contains dedicated Qadın (/collections?gender=women) link', () => {
    assertMatches(
      headerCode,
      /href:\s*["']\/collections\?gender=women["']/,
      'navLinks must contain link to /collections?gender=women'
    );
    assertMatches(
      headerCode,
      /genderId:\s*["']women["']/,
      'navLink must define genderId: "women"'
    );
  });

  test('FEAT-GEND-02.3: isLinkActive() properly detects gender route matching', () => {
    assertMatches(
      headerCode,
      /item\.genderId[\s\S]*?pathname === ["']\/collections["'][\s\S]*?currentGender === item\.genderId/,
      'isLinkActive must compare currentGender with item.genderId on /collections'
    );
  });

  test('FEAT-GEND-02.4: Mobile navigation drawer renders gender navigation links', () => {
    // navLinks is mapped both in desktop navbar and mobile sidebar
    const mapCount = (headerCode.match(/navLinks\.map/g) || []).length;
    assert(mapCount >= 2, `navLinks should be mapped for both desktop and mobile drawer, found ${mapCount}`);
  });

  test('FEAT-GEND-02.5: Header extracts searchParams "gender" and responds to query changes', () => {
    assertMatches(
      headerCode,
      /searchParams\??\.get\(["']gender["']\)/,
      'Header must read searchParams.get("gender")'
    );
    assertMatches(
      headerCode,
      /useEffect\(\(\) => \{[\s\S]*?setMobileMenuOpen\(false\)[\s\S]*?\}, \[[^\]]*currentGender[^\]]*\]\)/,
      'useEffect closing mobile menu must include currentGender in dependency array'
    );
  });
});

describe('Multilingual Gender Translations (lib/translations.ts)', async () => {
  const translationsModule = await loadTsModule('lib/translations.ts');
  const { TRANSLATIONS } = translationsModule;

  test('FEAT-GEND-02.6: Translations for men, women, unisex exist across all 4 supported languages', () => {
    const requiredLanguages = ['az', 'en', 'ru', 'tr'];

    for (const lang of requiredLanguages) {
      assert(TRANSLATIONS[lang] !== undefined, `Language ${lang} must exist in TRANSLATIONS`);
      const nav = TRANSLATIONS[lang].nav;
      assert(nav !== undefined, `nav object must exist for ${lang}`);

      assert(typeof nav.men === 'string' && nav.men.length > 0, `nav.men must be a non-empty string in ${lang}`);
      assert(typeof nav.women === 'string' && nav.women.length > 0, `nav.women must be a non-empty string in ${lang}`);
      assert(typeof nav.unisex === 'string' && nav.unisex.length > 0, `nav.unisex must be a non-empty string in ${lang}`);
    }

    // Specific language checks
    assertEqual(TRANSLATIONS.az.nav.men, 'Kişi', 'Azerbaijani men translation');
    assertEqual(TRANSLATIONS.az.nav.women, 'Qadın', 'Azerbaijani women translation');
    assertEqual(TRANSLATIONS.en.nav.men, 'Men', 'English men translation');
    assertEqual(TRANSLATIONS.en.nav.women, 'Women', 'English women translation');
    assertEqual(TRANSLATIONS.tr.nav.men, 'Erkek', 'Turkish men translation');
    assertEqual(TRANSLATIONS.tr.nav.women, 'Kadın', 'Turkish women translation');
  });
});
