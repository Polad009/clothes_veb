/**
 * Shared Test Harness for Horwalle Atelier 24-Point E2E Test Suite
 * Supports standalone test file execution or invocation via run-24-point-e2e.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const PROJECT_ROOT = path.resolve(__dirname, '../..');

/**
 * Custom Assertion Error with actual vs expected diff details
 */
export class AssertionError extends Error {
  constructor(message, actual, expected) {
    super(message);
    this.name = 'AssertionError';
    this.actual = actual;
    this.expected = expected;
  }
}

export function assert(condition, message = 'Assertion failed') {
  if (!condition) {
    throw new AssertionError(message, condition, true);
  }
}

export function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    const msg = message
      ? `${message} (Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)})`
      : `Expected ${JSON.stringify(expected)} but received ${JSON.stringify(actual)}`;
    throw new AssertionError(msg, actual, expected);
  }
}

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

export function assertNotContains(haystack, needle, message) {
  if (typeof haystack === 'string') {
    if (haystack.includes(needle)) {
      const msg = message || `Expected string NOT to contain "${needle}"`;
      throw new AssertionError(msg, haystack, needle);
    }
    return;
  }
  if (Array.isArray(haystack)) {
    const found = haystack.some((item) =>
      typeof item === 'object' ? JSON.stringify(item) === JSON.stringify(needle) : item === needle
    );
    if (found) {
      const msg = message || `Expected array NOT to contain item`;
      throw new AssertionError(msg, haystack, needle);
    }
    return;
  }
  throw new Error('assertNotContains requires a string or array haystack');
}

export function assertMatches(string, regex, message) {
  if (!regex.test(string)) {
    const msg = message || `Expected string to match pattern ${regex}`;
    throw new AssertionError(msg, string, regex.toString());
  }
}

export function assertNotMatches(string, regex, message) {
  if (regex.test(string)) {
    const msg = message || `Expected string NOT to match pattern ${regex}`;
    throw new AssertionError(msg, string, regex.toString());
  }
}

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
        // Fallback
      }
      // Stub relative type-only imports that cause Node ESM resolution issues
      js = js.replace(/import\s*\{[^}]*\}\s*from\s*['"][^'"]*types['"];?/g, '// [test-runner stubbed types]');
      return await import('data:text/javascript,' + encodeURIComponent(js));
    }
    throw err;
  }
}

/**
 * Global Registry for Suites and Tests
 */
export const testRegistry = {
  suites: [],
  currentMilestone: null,
};

/**
 * Define a test suite
 */
export function describe(name, fn, meta = {}) {
  let detectedMilestone = meta.milestone || testRegistry.currentMilestone;
  if (!detectedMilestone && typeof name === 'string') {
    const mMatch = name.match(/milestone\s*(\d+)/i);
    if (mMatch) detectedMilestone = 'm' + mMatch[1];
  }
  const suite = {
    name,
    milestone: detectedMilestone || 'general',
    tests: [],
  };
  testRegistry.suites.push(suite);

  const prevSuite = currentSuite;
  currentSuite = suite;
  try {
    fn();
  } finally {
    currentSuite = prevSuite;
  }
}

let currentSuite = null;

/**
 * Register a single test case
 * @param {string} title
 * @param {Function} testFn
 * @param {Object} options - { id, item, tier, milestone }
 */
export function test(title, testFn, options = {}) {
  if (!currentSuite) {
    throw new Error(`Test "${title}" must be defined inside a describe() block`);
  }
  const testCase = {
    title,
    fn: testFn,
    id: options.id || `TEST-${currentSuite.tests.length + 1}`,
    item: options.item || null, // 1-24
    tier: options.tier || 1, // 1, 2, 3, 4
    milestone: options.milestone || currentSuite.milestone,
    suiteName: currentSuite.name,
  };
  currentSuite.tests.push(testCase);
}

export const it = test;

/**
 * Standalone executor for running an individual test file
 */
export async function runStandalone() {
  let passed = 0;
  let failed = 0;
  const failures = [];
  const start = Date.now();

  console.log(`\n\x1b[1m\x1b[36m=== Executing Test Suites ===\x1b[0m\n`);

  for (const suite of testRegistry.suites) {
    console.log(`\x1b[1m\x1b[34m▶ Suite: ${suite.name} [${suite.milestone.toUpperCase()}]\x1b[0m`);
    for (const t of suite.tests) {
      const tierTag = `\x1b[33m[Tier ${t.tier}]\x1b[0m`;
      const itemTag = t.item ? `\x1b[35m[Item ${t.item}]\x1b[0m` : '';
      try {
        await t.fn();
        passed++;
        console.log(`  \x1b[32m✔\x1b[0m ${tierTag} ${itemTag} \x1b[2m${t.id}\x1b[0m ${t.title}`);
      } catch (err) {
        failed++;
        failures.push({ test: t, error: err });
        console.log(`  \x1b[31m✖\x1b[0m ${tierTag} ${itemTag} \x1b[2m${t.id}\x1b[0m ${t.title}`);
        console.log(`    \x1b[31mError: ${err.message}\x1b[0m`);
      }
    }
  }

  const duration = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`\n\x1b[1m=== Execution Summary ===\x1b[0m`);
  console.log(`Total: ${passed + failed} | Passed: \x1b[32m${passed}\x1b[0m | Failed: \x1b[31m${failed}\x1b[0m | Time: ${duration}s\n`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}
