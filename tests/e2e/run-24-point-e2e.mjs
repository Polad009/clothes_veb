#!/usr/bin/env node

/**
 * Horwalle Atelier 24-Point Comprehensive E2E Test Runner
 *
 * Requirements:
 * - Opaque-box requirement-driven verification of all 24 features from ORIGINAL_REQUEST.md
 * - 4-tier testing methodology:
 *     Tier 1: Feature Coverage (all 24 items)
 *     Tier 2: Boundary & Corner Cases
 *     Tier 3: Cross-Feature Combinations
 *     Tier 4: Real-World Application Workloads
 * - Clear pass/fail output and strict exit code semantics (exit 0 on pass, exit 1 on fail)
 *
 * Usage:
 *   node tests/e2e/run-24-point-e2e.mjs
 *   node tests/e2e/run-24-point-e2e.mjs --all
 *   node tests/e2e/run-24-point-e2e.mjs --tier=1
 *   node tests/e2e/run-24-point-e2e.mjs --milestone=m1
 *   node tests/e2e/run-24-point-e2e.mjs --filter=<pattern>
 */

import { testRegistry } from './harness.mjs';

// ANSI Colors
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
let selectedMilestones = [];
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
  } else if (arg.startsWith('--milestone=')) {
    const m = arg.split('=')[1].toLowerCase().trim();
    if (!selectedMilestones.includes(m)) selectedMilestones.push(m);
  } else if (arg.startsWith('--filter=')) {
    filterPattern = new RegExp(arg.split('=')[1], 'i');
  }
}

if (selectedTiers.length === 0) {
  selectedTiers = [1, 2, 3, 4];
}

async function loadAllSuites() {
  testRegistry.suites = [];

  // Import all 5 milestone suites
  await import('./test_m1_ui_hero.mjs');
  await import('./test_m2_catalog_gender.mjs');
  await import('./test_m3_checkout_shipping.mjs');
  await import('./test_m4_admin_supabase.mjs');
  await import('./test_m5_tracking_chat_auth.mjs');
}

async function run() {
  const startTime = Date.now();

  console.log(`\n${colors.bold}${colors.cyan}========================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}   HORVVALLE ATELIER — 24-POINT COMPREHENSIVE E2E TEST RUNNER           ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}   Requirement-Driven Opaque-Box Suite (Tiers 1 - 4)                    ${colors.reset}`);
  console.log(`${colors.cyan}========================================================================${colors.reset}\n`);

  await loadAllSuites();

  const tierStats = {
    1: { total: 0, passed: 0, failed: 0 },
    2: { total: 0, passed: 0, failed: 0 },
    3: { total: 0, passed: 0, failed: 0 },
    4: { total: 0, passed: 0, failed: 0 },
  };

  const itemStats = {};
  for (let i = 1; i <= 24; i++) {
    itemStats[i] = { total: 0, passed: 0, failed: 0 };
  }

  const failures = [];
  let totalExecuted = 0;
  let totalPassed = 0;
  let totalFailed = 0;

  for (const suite of testRegistry.suites) {
    if (selectedMilestones.length > 0 && !selectedMilestones.includes(suite.milestone.toLowerCase())) {
      continue;
    }

    console.log(`\n${colors.bold}${colors.blue}▶ [${suite.milestone.toUpperCase()}] ${suite.name}${colors.reset}`);

    for (const t of suite.tests) {
      if (!selectedTiers.includes(t.tier)) {
        continue;
      }
      if (filterPattern && !filterPattern.test(t.title) && !filterPattern.test(t.id)) {
        continue;
      }

      totalExecuted++;
      tierStats[t.tier].total++;
      if (t.item && itemStats[t.item]) {
        itemStats[t.item].total++;
      }

      const tierBadge = `${colors.yellow}[Tier ${t.tier}]${colors.reset}`;
      const itemBadge = t.item ? `${colors.magenta}[Item ${t.item}]${colors.reset}` : '';

      try {
        await t.fn();
        totalPassed++;
        tierStats[t.tier].passed++;
        if (t.item && itemStats[t.item]) {
          itemStats[t.item].passed++;
        }
        console.log(`  ${colors.green}✔${colors.reset} ${tierBadge} ${itemBadge} ${colors.dim}${t.id}${colors.reset} ${t.title}`);
      } catch (err) {
        totalFailed++;
        tierStats[t.tier].failed++;
        if (t.item && itemStats[t.item]) {
          itemStats[t.item].failed++;
        }
        failures.push({ test: t, error: err });
        console.log(`  ${colors.red}✖${colors.reset} ${tierBadge} ${itemBadge} ${colors.dim}${t.id}${colors.reset} ${t.title}`);
        console.log(`    ${colors.red}Error: ${err.message}${colors.reset}`);
      }
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Print Tier Breakdown Table
  console.log(`\n${colors.bold}------------------------------------------------------------------------${colors.reset}`);
  console.log(`${colors.bold}   TEST EXECUTION BREAKDOWN BY TIER${colors.reset}`);
  console.log(`${colors.bold}------------------------------------------------------------------------${colors.reset}`);
  console.log(`  ${colors.bold}Tier${colors.reset}                                    ${colors.bold}Total${colors.reset}   ${colors.bold}Passed${colors.reset}   ${colors.bold}Failed${colors.reset}   ${colors.bold}Rate${colors.reset}`);
  console.log(`  ----------------------------------------------------------------------`);
  for (let t = 1; t <= 4; t++) {
    const s = tierStats[t];
    const rate = s.total > 0 ? Math.round((s.passed / s.total) * 100) : 0;
    const tierName =
      t === 1 ? 'Tier 1: Feature Coverage (24 Items)' :
      t === 2 ? 'Tier 2: Boundary & Corner Cases     ' :
      t === 3 ? 'Tier 3: Cross-Feature Combinations  ' :
                'Tier 4: Real-World User Scenarios   ';
    const rateColor = rate === 100 ? colors.green : colors.red;
    console.log(
      `  ${colors.yellow}${tierName}${colors.reset}   ${String(s.total).padStart(5)}   ` +
      `${colors.green}${String(s.passed).padStart(6)}${colors.reset}   ` +
      `${s.failed > 0 ? colors.red : colors.dim}${String(s.failed).padStart(6)}${colors.reset}   ` +
      `${rateColor}${String(rate).padStart(3)}%${colors.reset}`
    );
  }
  console.log(`  ----------------------------------------------------------------------`);

  // Print 24-Item Coverage Matrix
  console.log(`\n${colors.bold}------------------------------------------------------------------------${colors.reset}`);
  console.log(`${colors.bold}   24-ITEM REQUIREMENT COVERAGE MATRIX (ORIGINAL_REQUEST.md)${colors.reset}`);
  console.log(`${colors.bold}------------------------------------------------------------------------${colors.reset}`);
  let itemGrid = '';
  for (let i = 1; i <= 24; i++) {
    const s = itemStats[i];
    let tag = '';
    if (s.total === 0) {
      tag = `${colors.dim}[#${i}: NONE]${colors.reset}`;
    } else if (s.failed === 0) {
      tag = `${colors.green}[#${i}: PASS (${s.passed})]${colors.reset}`;
    } else {
      tag = `${colors.red}[#${i}: FAIL (${s.failed}/${s.total})]${colors.reset}`;
    }
    itemGrid += tag.padEnd(26);
    if (i % 3 === 0) itemGrid += '\n';
  }
  console.log(itemGrid);

  // Failures Summary if any
  if (failures.length > 0) {
    console.log(`\n${colors.bold}${colors.red}============================ FAILURES ==================================${colors.reset}`);
    failures.forEach((f, idx) => {
      console.log(`\n${colors.bold}${colors.red}[${idx + 1}] ${f.test.id} — ${f.test.title}${colors.reset}`);
      console.log(`    Suite: ${f.test.suiteName} | Tier ${f.test.tier} | Item ${f.test.item || 'N/A'}`);
      console.log(`    ${colors.red}${f.error.stack || f.error.message}${colors.reset}`);
    });
    console.log(`\n${colors.bold}${colors.red}========================================================================${colors.reset}`);
  }

  // Final Summary Banner
  console.log(`\n${colors.bold}========================================================================${colors.reset}`);
  if (totalFailed === 0) {
    console.log(`${colors.bold}${colors.bgGreen}${colors.white}   ✓ ALL ${totalPassed} TESTS PASSED CLEANLY (${duration}s)                             ${colors.reset}`);
  } else {
    console.log(`${colors.bold}${colors.bgRed}${colors.white}   ✖ TEST SUITE FAILED: ${totalFailed} OF ${totalExecuted} TESTS FAILED (${duration}s)                ${colors.reset}`);
  }
  console.log(`${colors.bold}========================================================================${colors.reset}\n`);

  process.exit(totalFailed === 0 ? 0 : 1);
}

run().catch((err) => {
  console.error(`Fatal Runner Error:`, err);
  process.exit(1);
});
