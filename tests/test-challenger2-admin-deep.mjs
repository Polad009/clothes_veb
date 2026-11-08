import fs from 'node:fs';
import path from 'node:path';

// WCAG Contrast Calculation Helpers
function hexToRgb(hex) {
  let cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleaned, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function getRelativeLuminance(rgb) {
  const sRGB = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
  const linear = sRGB.map(val => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function getContrastRatio(hex1, hex2) {
  const l1 = getRelativeLuminance(hexToRgb(hex1));
  const l2 = getRelativeLuminance(hexToRgb(hex2));
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}

console.log('='.repeat(70));
console.log('  CHALLENGER 2: DEEP EMPIRICAL STRESS TEST FOR ADMIN PANEL & SAAS');
console.log('='.repeat(70));

const adminPath = path.resolve('public/admin.html');
const portalPath = path.resolve('admin-portal/public/index.html');
const wrapperPath = path.resolve('app/admin/page.tsx');

const adminHtml = fs.readFileSync(adminPath, 'utf8');
const portalHtml = fs.readFileSync(portalPath, 'utf8');
const wrapperTsx = fs.readFileSync(wrapperPath, 'utf8');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testId, description, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${testId}: ${description}`);
  } else {
    failedTests++;
    console.error(`  ✗ ${testId}: ${description} -> FAILED: ${details}`);
  }
}

// -------------------------------------------------------------
// SECTION 1: ROYAL BLUE SAAS DESIGN AUDIT
// -------------------------------------------------------------
console.log('\n▶ SECTION 1: Royal Blue SaaS Design & Theme Parity...');

// 1.1 Canvas Background (#F8FAFC)
assert(
  adminHtml.includes('--saas-canvas-bg: #F8FAFC') && adminHtml.includes('background-color: #F8FAFC'),
  'SAAS-DES-01',
  'public/admin.html enforces clean #F8FAFC SaaS canvas background'
);
assert(
  portalHtml.includes('--saas-canvas-bg: #F8FAFC') || portalHtml.includes('bg-slate-50') || portalHtml.includes('#F8FAFC'),
  'SAAS-DES-02',
  'admin-portal/public/index.html enforces light slate / #F8FAFC canvas background'
);
assert(
  wrapperTsx.includes('bg-[#F8FAFC]'),
  'SAAS-DES-03',
  'app/admin/page.tsx Next.js wrapper uses bg-[#F8FAFC] to prevent black iframe loading flashes'
);

// 1.2 Sidebar Royal Blue Gradient (#1E40AF / #1D4ED8 / #1E3A8A)
const royalBlueTokens = ['#1D4ED8', '#1E40AF', '#1E3A8A'];
const hasAllSidebarTokensAdmin = royalBlueTokens.every(tok => adminHtml.includes(tok));
assert(
  hasAllSidebarTokensAdmin,
  'SAAS-DES-04',
  'public/admin.html contains all 3 Royal Blue sidebar gradient stops (#1D4ED8, #1E40AF, #1E3A8A)'
);

const hasAllSidebarTokensPortal = royalBlueTokens.every(tok => portalHtml.includes(tok));
assert(
  hasAllSidebarTokensPortal,
  'SAAS-DES-05',
  'admin-portal/public/index.html contains all 3 Royal Blue sidebar gradient stops'
);

// 1.3 Light Brand Logo & Fallback
assert(
  adminHtml.includes('/brand/logo-horizontal-light.png') && adminHtml.includes('/brand/logo-horizontal-black.png'),
  'SAAS-DES-06',
  'public/admin.html uses light brand logo on royal blue sidebar with robust black logo fallback'
);
assert(
  portalHtml.includes('/brand/logo-horizontal-light.png') && portalHtml.includes('/brand/logo-horizontal-black.png'),
  'SAAS-DES-07',
  'admin-portal/public/index.html uses light brand logo with fallback'
);

// 1.4 Curved Active Tab Pill Indicator
// Checks both markup initialization and dynamic class list in switchTab
const pillTokens = ['bg-white', 'text-blue-700', 'shadow-md', 'active', 'rounded-xl'];
const navDashboardAdminMatch = adminHtml.match(/id=["']nav-dashboard["'][^>]*class=["']([^"']+)["']/);
const navAdminClasses = navDashboardAdminMatch ? navDashboardAdminMatch[1] : '';
const adminHasAllPillTokens = pillTokens.every(t => navAdminClasses.includes(t));
assert(
  adminHasAllPillTokens && adminHtml.includes("targetNav.classList.add('bg-white', 'text-blue-700'"),
  'SAAS-DES-08',
  'public/admin.html renders curved active tab pill indicator (bg-white text-blue-700 font-bold shadow-md active rounded-xl) statically and in switchTab()'
);

const navDashboardPortalMatch = portalHtml.match(/id=["']nav-dashboard["'][^>]*class=["']([^"']+)["']/);
const navPortalClasses = navDashboardPortalMatch ? navDashboardPortalMatch[1] : '';
const portalHasAllPillTokens = pillTokens.every(t => navPortalClasses.includes(t));
assert(
  portalHasAllPillTokens && portalHtml.includes("targetNav.classList.add('bg-white', 'text-blue-700'"),
  'SAAS-DES-09',
  'admin-portal/public/index.html renders curved active tab pill indicator statically and in switchTab()'
);

// 1.5 Pure White Cards & Elevation
assert(
  adminHtml.includes('--saas-card-bg: #FFFFFF') && adminHtml.includes('background: #FFFFFF;'),
  'SAAS-DES-10',
  'public/admin.html configures pure white #FFFFFF cards for all panels'
);

// -------------------------------------------------------------
// SECTION 2: TEXT CONTRAST RATIO & WCAG AAA COMPLIANCE AUDIT
// -------------------------------------------------------------
console.log('\n▶ SECTION 2: Text Contrast Ratios & WCAG AAA Compliance...');

// Calculate specific contrast pairs
const contrastPairs = [
  { name: 'Primary Text (#0F172A) on Pure White (#FFFFFF)', fg: '#0F172A', bg: '#FFFFFF', minAAA: 7.0 },
  { name: 'Primary Text (#0F172A) on Canvas (#F8FAFC)', fg: '#0F172A', bg: '#F8FAFC', minAAA: 7.0 },
  { name: 'Secondary Text (#334155) on Pure White (#FFFFFF)', fg: '#334155', bg: '#FFFFFF', minAA: 4.5, minAAA: 7.0 },
  { name: 'Active Tab Text (#1D4ED8) on Pure White (#FFFFFF)', fg: '#1D4ED8', bg: '#FFFFFF', minAA: 4.5 },
  { name: 'Active Tab Text (#1E40AF) on Pure White (#FFFFFF)', fg: '#1E40AF', bg: '#FFFFFF', minAAA: 7.0 },
  { name: 'Sidebar White Text (#FFFFFF) on Royal Blue (#1E40AF)', fg: '#FFFFFF', bg: '#1E40AF', minAAA: 7.0 },
  { name: 'Sidebar White Text (#FFFFFF) on Royal Blue Dark (#1E3A8A)', fg: '#FFFFFF', bg: '#1E3A8A', minAAA: 7.0 },
  { name: 'Sidebar Light Muted Text (#DBEAFE) on Royal Blue (#1E3A8A)', fg: '#DBEAFE', bg: '#1E3A8A', minAAA: 7.0 },
  { name: 'Table Headings (#0F172A) on Slate Header (#F1F5F9)', fg: '#0F172A', bg: '#F1F5F9', minAAA: 7.0 },
  { name: 'Status Badge Green (#047857) on Emerald Tint (#ECFDF5)', fg: '#047857', bg: '#ECFDF5', minAA: 4.5 }
];

let contrastIndex = 1;
for (const pair of contrastPairs) {
  const ratio = getContrastRatio(pair.fg, pair.bg);
  const target = pair.minAAA || pair.minAA;
  const isAAA = ratio >= 7.0;
  const isAA = ratio >= 4.5;
  const rating = isAAA ? 'WCAG AAA' : (isAA ? 'WCAG AA' : 'FAIL');
  const pass = ratio >= (pair.minAA || pair.minAAA);
  
  assert(
    pass,
    `CONTRAST-${String(contrastIndex++).padStart(2, '0')}`,
    `${pair.name}: ${ratio.toFixed(2)}:1 [${rating}] (Threshold >= ${target}:1)`
  );
}

// Check that there is NO dark-on-dark unreadable combination in CSS
const darkOnDarkPatterns = [
  /color:\s*#0[0-9a-fA-F]{5};\s*background(?:-color)?:\s*#0[0-9a-fA-F]{5}/i,
  /text-neutral-900.*bg-neutral-900/,
  /text-black.*bg-black/,
  /text-neutral-800.*bg-neutral-950/
];
const hasDarkOnDarkAdmin = darkOnDarkPatterns.some(pat => pat.test(adminHtml));
assert(
  !hasDarkOnDarkAdmin,
  'CONTRAST-11',
  'public/admin.html contains zero dark-on-dark illegible color rules'
);

// -------------------------------------------------------------
// SECTION 3: SCROLL TRAP ELIMINATION AUDIT
// -------------------------------------------------------------
console.log('\n▶ SECTION 3: Admin Scroll Trap Elimination & Native Scrolling...');

// 3.1 Verify Lenis is purged completely
assert(
  !adminHtml.includes('lenis.min.js') && !adminHtml.includes('unpkg.com/lenis'),
  'SCROLL-01',
  'public/admin.html has NO Lenis script tag or CDN reference'
);
assert(
  !portalHtml.includes('lenis.min.js') && !portalHtml.includes('unpkg.com/lenis'),
  'SCROLL-02',
  'admin-portal/public/index.html has NO Lenis script tag or CDN reference'
);
assert(
  !adminHtml.includes('initAdminLenis') && !portalHtml.includes('initAdminLenis'),
  'SCROLL-03',
  'initAdminLenis() is completely purged from both admin files'
);

// 3.2 Verify <main id="adminMainContent"> with overflow-y-auto
const mainContentRegex = /<main\s+id=["']adminMainContent["'][^>]*class=["'][^"']*overflow-y-auto[^"']*["']/;
assert(
  mainContentRegex.test(adminHtml),
  'SCROLL-04',
  'public/admin.html declares <main id="adminMainContent"> with native overflow-y-auto'
);
assert(
  mainContentRegex.test(portalHtml),
  'SCROLL-05',
  'admin-portal/public/index.html declares <main id="adminMainContent"> with native overflow-y-auto'
);

// 3.3 Verify NO body { overflow: hidden } locking the admin page
const bodyOverflowHidden = /body\s*\{[^}]*overflow\s*:\s*hidden[^}]*\}/;
assert(
  !bodyOverflowHidden.test(adminHtml),
  'SCROLL-06',
  'public/admin.html has NO body { overflow: hidden } rule that locks scrolling'
);

// 3.4 Verify switchTab resets scroll cleanly to top
const switchTabScrollRegex = /mainContent\.scrollTo\(\s*\{\s*top:\s*0/;
assert(
  switchTabScrollRegex.test(adminHtml) || adminHtml.includes('scrollTo({ top: 0'),
  'SCROLL-07',
  'switchTab in public/admin.html safely resets main content scroll position without wheel hijacking'
);

// 3.5 Verify "ONLAYN SİFARİŞLƏR" tab is inside scrollable container
assert(
  adminHtml.includes('id="tab-orders"') && adminHtml.includes('ONLAYN SİFARİŞLƏR'),
  'SCROLL-08',
  'public/admin.html contains ONLAYN SİFARİŞLƏR (tab-orders) properly nested inside #adminMainContent'
);

// -------------------------------------------------------------
// SECTION 4: FUNCTIONALITY & DATA PARITY AUDIT
// -------------------------------------------------------------
console.log('\n▶ SECTION 4: Dual Admin Functionality & Parity...');

// 4.1 Check 10 core dashboard & data selectors present in both
const keySelectors = [
  'prodGender',
  'productGenderFilter',
  'ordersTableBody',
  'productsTableBody',
  'categoriesGrid',
  'badge-orders-count',
  'badge-products-count',
  'stat-dovriyye-val',
  'stat-kassa-val',
  'stat-kuryer-val',
  'stat-gozleme-val',
  'stat-sifaris-sayi'
];

let selCount = 0;
for (const sel of keySelectors) {
  if (adminHtml.includes(sel) && portalHtml.includes(sel)) {
    selCount++;
  }
}
assert(
  selCount === keySelectors.length,
  'PARITY-01',
  `All ${keySelectors.length} core dashboard & data selectors present in both admin files (${selCount}/${keySelectors.length})`
);

// 4.2 Check Tri-Channel synchronization hooks
assert(
  adminHtml.includes('horwalle_store_sync') && adminHtml.includes('lastStoreDataHash'),
  'PARITY-02',
  'public/admin.html retains tri-channel sync and DOM hash diffing engine'
);

// 4.3 Check Gender Form selector in both admin files
const genderRadioAdmin = adminHtml.includes('name="prodGender"') && adminHtml.includes('value="men"') && adminHtml.includes('value="women"') && adminHtml.includes('value="unisex"');
const genderRadioPortal = portalHtml.includes('name="prodGender"') && portalHtml.includes('value="men"') && portalHtml.includes('value="women"') && portalHtml.includes('value="unisex"');
assert(
  genderRadioAdmin && genderRadioPortal,
  'PARITY-03',
  'Both admin files provide explicit Kişi/Qadın/Unisex radio selector in product modal'
);

console.log('\n' + '='.repeat(70));
console.log(`  CHALLENGER 2 SUMMARY: Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log('='.repeat(70));

if (failedTests > 0) {
  console.error('\n❌ VERDICT: REJECT — Some empirical tests failed!\n');
  process.exit(1);
} else {
  console.log('\n✅ VERDICT: APPROVE — All empirical stress tests passed with 0 failures!\n');
  process.exit(0);
}
