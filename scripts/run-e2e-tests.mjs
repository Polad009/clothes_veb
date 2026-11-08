#!/usr/bin/env node

/**
 * Automated E2E Test Suite Runner for clothes_veb
 * Executes 4-tier opaque-box test suites for Gender Categorization & International Shipping
 *
 * Usage:
 *   node scripts/run-e2e-tests.mjs
 *   node scripts/run-e2e-tests.mjs --tier=1
 *   node scripts/run-e2e-tests.mjs --tier=2
 *   node scripts/run-e2e-tests.mjs --tier=3
 *   node scripts/run-e2e-tests.mjs --tier=4
 *   node scripts/run-e2e-tests.mjs --all
 *   node scripts/run-e2e-tests.mjs --filter=<pattern>
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const TESTS_ROOT = path.resolve(PROJECT_ROOT, 'tests');

// ANSI Color codes
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
};

// Parse CLI Arguments
const args = process.argv.slice(2);
let selectedTiers = [];
let filterPattern = null;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--all') {
    selectedTiers = [1, 2, 3, 4];
  } else if (arg.startsWith('--tier=')) {
    const t = parseInt(arg.split('=')[1], 10);
    if (!isNaN(t) && t >= 1 && t <= 4) {
      if (!selectedTiers.includes(t)) selectedTiers.push(t);
    }
  } else if (arg === '-t' && args[i + 1]) {
    const t = parseInt(args[++i], 10);
    if (!isNaN(t) && t >= 1 && t <= 4) {
      if (!selectedTiers.includes(t)) selectedTiers.push(t);
    }
  } else if (arg.startsWith('--filter=')) {
    filterPattern = new RegExp(arg.split('=')[1], 'i');
  } else if (arg === '-f' && args[i + 1]) {
    filterPattern = new RegExp(args[++i], 'i');
  }
}

// Default to all tiers if none specified
if (selectedTiers.length === 0) {
  selectedTiers = [1, 2, 3, 4];
}
selectedTiers.sort((a, b) => a - b);

// Test Runner Global State
export const runnerState = {
  currentTier: null,
  currentSuite: null,
  suites: [],
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  failures: [],
  startTime: 0,
  endTime: 0,
};

/**
 * Register a test suite
 */
export function describe(suiteName, suiteFn) {
  const suite = {
    tier: runnerState.currentTier,
    name: suiteName,
    fn: suiteFn,
    tests: [],
  };
  runnerState.suites.push(suite);
}

/**
 * Register an individual test case
 */
export function test(testName, testFn) {
  const currentSuite = runnerState.suites[runnerState.suites.length - 1];
  if (!currentSuite) {
    throw new Error(`test() called outside of describe(): "${testName}"`);
  }
  currentSuite.tests.push({
    name: testName,
    fn: testFn,
  });
}
export const it = test;

/**
 * Discover test files for a specific tier
 */
function getTierFiles(tierNumber) {
  const tierDirs = {
    1: path.join(TESTS_ROOT, 'tier1-features'),
    2: path.join(TESTS_ROOT, 'tier2-boundaries'),
    3: path.join(TESTS_ROOT, 'tier3-combinations'),
    4: path.join(TESTS_ROOT, 'tier4-scenarios'),
  };

  const dir = tierDirs[tierNumber];
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mjs') || f.endsWith('.js'))
    .sort()
    .map((f) => path.join(dir, f));
}

/**
 * Execute all registered tests
 */
async function run() {
  runnerState.startTime = Date.now();

  console.log(`\n${colors.bold}${colors.cyan}======================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  HORVVALLE Atelier — E2E Test Suite Runner${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  Gender Categorization & International Shipping System${colors.reset}`);
  console.log(`${colors.dim}  Selected Tiers: [${selectedTiers.join(', ')}] | Filter: ${filterPattern ? filterPattern.source : 'none'}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}======================================================================${colors.reset}\n`);

  for (const tier of selectedTiers) {
    runnerState.currentTier = tier;
    const tierName =
      tier === 1
        ? 'Tier 1: Feature Coverage (Opaque-Box Category-Partition)'
        : tier === 2
        ? 'Tier 2: Boundary Value Analysis & Corner Cases'
        : tier === 3
        ? 'Tier 3: Cross-Feature Pairwise Combinations'
        : 'Tier 4: Real-World Workload Scenarios';

    console.log(`${colors.bold}${colors.yellow}▶ Running ${tierName}...${colors.reset}`);

    const files = getTierFiles(tier);
    if (files.length === 0) {
      console.log(`  ${colors.dim}No test files discovered for Tier ${tier}.${colors.reset}\n`);
      continue;
    }

    for (const filePath of files) {
      const relPath = path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/');
      const startSuiteIndex = runnerState.suites.length;

      try {
        const fileUrl = pathToFileURL(filePath).href;
        await import(fileUrl);
      } catch (importErr) {
        console.error(`  ${colors.red}✗ Failed to load test file ${relPath}:${colors.reset}`, importErr);
        runnerState.failedTests++;
        runnerState.failures.push({
          tier,
          suite: relPath,
          test: 'File Import',
          error: importErr,
        });
        continue;
      }

      // Execute suites registered by this file
      for (let s = startSuiteIndex; s < runnerState.suites.length; s++) {
        const suite = runnerState.suites[s];
        console.log(`  ${colors.bold}${colors.white}${suite.name}${colors.reset} ${colors.dim}(${relPath})${colors.reset}`);

        // Execute describe body if not already done
        if (typeof suite.fn === 'function') {
          try {
            await suite.fn();
          } catch (suiteErr) {
            console.error(`    ${colors.red}✗ Suite execution error:${colors.reset}`, suiteErr);
            runnerState.failedTests++;
            runnerState.failures.push({
              tier,
              suite: suite.name,
              test: 'Suite Setup',
              error: suiteErr,
            });
            continue;
          }
        }

        for (const testCase of suite.tests) {
          if (filterPattern && !filterPattern.test(`${suite.name} ${testCase.name}`)) {
            continue;
          }

          runnerState.totalTests++;
          const t0 = Date.now();
          try {
            await testCase.fn();
            const elapsed = Date.now() - t0;
            runnerState.passedTests++;
            console.log(`    ${colors.green}✓${colors.reset} ${testCase.name} ${colors.dim}(${elapsed}ms)${colors.reset}`);
          } catch (testErr) {
            const elapsed = Date.now() - t0;
            runnerState.failedTests++;
            console.log(`    ${colors.red}✗${colors.reset} ${colors.bold}${testCase.name}${colors.reset} ${colors.dim}(${elapsed}ms)${colors.reset}`);
            runnerState.failures.push({
              tier,
              suite: suite.name,
              test: testCase.name,
              error: testErr,
            });
          }
        }
      }
    }
    console.log('');
  }

  runnerState.endTime = Date.now();
  const totalDuration = ((runnerState.endTime - runnerState.startTime) / 1000).toFixed(2);

  // Print Summary
  console.log(`${colors.bold}${colors.cyan}======================================================================${colors.reset}`);
  console.log(`${colors.bold}  TEST EXECUTION SUMMARY${colors.reset}`);
  console.log(`${colors.cyan}======================================================================${colors.reset}`);
  console.log(`  Total Tests Run: ${runnerState.totalTests}`);
  console.log(`  Passed:          ${colors.green}${runnerState.passedTests}${colors.reset}`);
  console.log(`  Failed:          ${runnerState.failedTests > 0 ? colors.red : colors.green}${runnerState.failedTests}${colors.reset}`);
  console.log(`  Total Duration:  ${totalDuration}s`);

  if (runnerState.failures.length > 0) {
    console.log(`\n${colors.bold}${colors.red}FAILURE DETAILS (${runnerState.failures.length}):${colors.reset}`);
    runnerState.failures.forEach((fail, idx) => {
      console.log(`\n  ${colors.red}${idx + 1}) [Tier ${fail.tier}] ${fail.suite} > ${fail.test}${colors.reset}`);
      if (fail.error?.message) {
        console.log(`     ${colors.bold}Message:${colors.reset} ${fail.error.message}`);
      }
      if (fail.error?.stack) {
        const stackLines = fail.error.stack
          .split('\n')
          .slice(1, 5)
          .map((line) => `     ${colors.dim}${line.trim()}${colors.reset}`)
          .join('\n');
        console.log(stackLines);
      }
    });
    console.log(`\n${colors.bgRed}${colors.white}${colors.bold} FAILED ${colors.reset} ${runnerState.failedTests} tests failed.\n`);
    process.exit(1);
  } else {
    console.log(`\n${colors.bgGreen}${colors.white}${colors.bold} PASSED ${colors.reset} All ${runnerState.passedTests} test assertions passed successfully!\n`);
    process.exit(0);
  }
}

// Run test runner
run().catch((fatalErr) => {
  console.error(`\n${colors.bgRed}FATAL RUNNER ERROR:${colors.reset}`, fatalErr);
  process.exit(1);
});
