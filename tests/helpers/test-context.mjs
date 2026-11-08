/**
 * Test Context & Assertion Helpers for E2E Test Suite
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const PROJECT_ROOT = path.resolve(__dirname, '../..');

/**
 * Custom Assertion Error
 */
export class AssertionError extends Error {
  constructor(message, actual, expected) {
    super(message);
    this.name = 'AssertionError';
    this.actual = actual;
    this.expected = expected;
  }
}

/**
 * Basic truthy assertion
 */
export function assert(condition, message = 'Assertion failed') {
  if (!condition) {
    throw new AssertionError(message, condition, true);
  }
}

/**
 * Strict equality assertion
 */
export function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    const msg = message
      ? `${message} (Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)})`
      : `Expected ${JSON.stringify(expected)} but received ${JSON.stringify(actual)}`;
    throw new AssertionError(msg, actual, expected);
  }
}

/**
 * Deep equality assertion for objects/arrays
 */
export function assertDeepEqual(actual, expected, message) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    const msg = message
      ? `${message} (Expected: ${expectedStr}, Actual: ${actualStr})`
      : `Expected deep equality:\nExpected: ${expectedStr}\nActual:   ${actualStr}`;
    throw new AssertionError(msg, actual, expected);
  }
}

/**
 * Substring or array element containment assertion
 */
export function assertContains(haystack, needle, message) {
  if (typeof haystack === 'string') {
    if (!haystack.includes(needle)) {
      const msg = message || `Expected string to contain "${needle}"`;
      throw new AssertionError(msg, haystack, needle);
    }
    return;
  }
  if (Array.isArray(haystack)) {
    const found = haystack.some((item) =>
      typeof item === 'object' ? JSON.stringify(item) === JSON.stringify(needle) : item === needle
    );
    if (!found) {
      const msg = message || `Expected array to contain item`;
      throw new AssertionError(msg, haystack, needle);
    }
    return;
  }
  throw new Error('assertContains requires a string or array haystack');
}

/**
 * Regular expression match assertion
 */
export function assertMatches(string, regex, message) {
  if (!regex.test(string)) {
    const msg = message || `Expected string to match pattern ${regex}`;
    throw new AssertionError(msg, string, regex.toString());
  }
}

/**
 * Function throws error assertion
 */
export function assertThrows(fn, expectedPattern, message) {
  let threw = false;
  let thrownError = null;
  try {
    fn();
  } catch (err) {
    threw = true;
    thrownError = err;
  }

  if (!threw) {
    throw new AssertionError(message || 'Expected function to throw an error, but it succeeded', null, 'Error');
  }

  if (expectedPattern) {
    const errMsg = thrownError?.message || String(thrownError);
    if (expectedPattern instanceof RegExp) {
      if (!expectedPattern.test(errMsg)) {
        throw new AssertionError(
          `Thrown error "${errMsg}" does not match pattern ${expectedPattern}`,
          errMsg,
          expectedPattern.toString()
        );
      }
    } else if (typeof expectedPattern === 'string') {
      if (!errMsg.includes(expectedPattern)) {
        throw new AssertionError(
          `Thrown error "${errMsg}" does not contain "${expectedPattern}"`,
          errMsg,
          expectedPattern
        );
      }
    }
  }
}

/**
 * Read text file from project root
 */
export function readProjectFile(relativePath) {
  const fullPath = path.resolve(PROJECT_ROOT, relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Project file does not exist: ${relativePath} (${fullPath})`);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

/**
 * Check if a project file exists
 */
export function projectFileExists(relativePath) {
  return fs.existsSync(path.resolve(PROJECT_ROOT, relativePath));
}

/**
 * Robust loader for application TypeScript/ESM modules
 */
export async function loadTsModule(moduleRelativePath) {
  const fullPath = path.resolve(PROJECT_ROOT, moduleRelativePath);
  const fileUrl = pathToFileURL(fullPath).href;
  try {
    return await import(fileUrl);
  } catch (err) {
    if (err.code === 'ERR_MODULE_NOT_FOUND' || err instanceof SyntaxError) {
      const rawTs = fs.readFileSync(fullPath, 'utf8');
      let js = rawTs;
      try {
        const { stripTypeScriptTypes } = await import('node:module');
        if (typeof stripTypeScriptTypes === 'function') {
          js = stripTypeScriptTypes(rawTs);
        }
      } catch {
        // Fallback to rawTs
      }
      // Stub relative type-only imports that cause Node ESM resolution issues
      js = js.replace(/import\s*\{[^}]*\}\s*from\s*['"][^'"]*types['"];?/g, '// [test-runner stubbed types]');
      return await import('data:text/javascript,' + encodeURIComponent(js));
    }
    throw err;
  }
}

/**
 * Mock Product Catalog Fixture with distinct Genders & Categories
 */
export const MOCK_PRODUCTS = [
  {
    id: 'prod-001-men-tee',
    slug: 'horwalle-vintage-men-tee',
    name: 'Vintage Distressed Graphic Tee',
    price: 65,
    internationalPrice: 38,
    category: 'koynek',
    gender: 'men',
    inStock: true,
  },
  {
    id: 'prod-002-women-tee',
    slug: 'horwalle-cropped-women-tee',
    name: 'Signature Cropped Ribbed Tee',
    price: 55,
    internationalPrice: 32,
    category: 'koynek',
    gender: 'women',
    inStock: true,
  },
  {
    id: 'prod-003-unisex-hoodie',
    slug: 'horwalle-heavyweight-hoodie-obsidian',
    name: 'Heavyweight Boxy Hoodie Obsidian',
    price: 110,
    internationalPrice: 65,
    category: 'hudi',
    gender: 'unisex',
    inStock: true,
  },
  {
    id: 'prod-004-men-pants',
    slug: 'horwalle-carpenter-jeans-indigo',
    name: 'Wide-Leg Carpenter Denim',
    price: 130,
    internationalPrice: 76,
    category: 'salvar',
    gender: 'men',
    inStock: true,
  },
  {
    id: 'prod-005-women-dress',
    slug: 'horwalle-draped-mini-dress',
    name: 'Draped Silk Evening Dress',
    price: 180,
    internationalPrice: 105,
    category: 'salvar',
    gender: 'women',
    inStock: true,
  },
  {
    id: 'prod-006-unisex-beanie',
    slug: 'horwalle-merino-wool-beanie',
    name: 'Merino Ribbed Wool Beanie',
    price: 35,
    internationalPrice: 20,
    category: 'aksesuar',
    gender: 'unisex',
    inStock: true,
  },
];

/**
 * Pure Collections Gender Filtering Algorithm (Specification from PROJECT.md)
 * - 'men': product.gender === 'men' || product.gender === 'unisex'
 * - 'women': product.gender === 'women' || product.gender === 'unisex'
 * - 'unisex': product.gender === 'unisex'
 * - 'all' or undefined: all products
 */
export function filterProductsByGender(products, genderFilter) {
  if (!genderFilter || genderFilter === 'all') {
    return products;
  }
  const g = genderFilter.toLowerCase().trim();
  if (g === 'men') {
    return products.filter((p) => p.gender === 'men' || p.gender === 'unisex');
  }
  if (g === 'women') {
    return products.filter((p) => p.gender === 'women' || p.gender === 'unisex');
  }
  if (g === 'unisex') {
    return products.filter((p) => p.gender === 'unisex');
  }
  return products.filter((p) => p.gender === g);
}
