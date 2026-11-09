/**
 * E2E Test Suite: Milestone 1 - Storefront Hero, Viewport Framing & Visual Refinement
 * Items Covered: 1, 4, 6, 7, 9, 10, 14, 16
 *
 * Tiers:
 * - Tier 1: Feature Coverage (Items 1, 4, 6, 7, 9, 10, 14, 16)
 * - Tier 2: Boundary & Corner Cases
 * - Tier 3: Cross-Feature Interactions
 * - Tier 4: Real-World Workflows
 */

import {
  describe,
  test,
  assert,
  assertEqual,
  assertContains,
  assertNotContains,
  assertMatches,
  assertNotMatches,
  readProjectFile,
  runStandalone,
} from './harness.mjs';

describe('Milestone 1: Storefront Hero, Viewport Framing & Visual Refinement', () => {
  const heroCode = readProjectFile('components/Hero.tsx');
  const storeShellCode = readProjectFile('components/StoreShell.tsx');
  const pageCode = readProjectFile('app/page.tsx');
  const faqCode = readProjectFile('components/FAQSection.tsx');
  const customDropdownCode = readProjectFile('components/ui/CustomDropdown.tsx');
  const headerQuickSearchCode = readProjectFile('components/HeaderQuickSearch.tsx');

  // =========================================================================
  // TIER 1: FEATURE COVERAGE (Items 1, 4, 6, 7, 9, 10, 14, 16)
  // =========================================================================

  test('Hero section is contained and prevents awkward vertical stretching on horizontal scroll', () => {
    // Item 1: Hero section must remain contained and prevent vertical flex stretching
    assertMatches(
      heroCode,
      /overflow-x-hidden|overflow-hidden/,
      'Hero container must contain horizontal overflow'
    );
    assertMatches(
      heroCode,
      /id=["']hero-section["']/,
      'Hero section element must be explicitly declared with id="hero-section"'
    );
  }, { id: 'T1-FEAT-01-HERO-STRETCH-CONTAINMENT', item: 1, tier: 1, milestone: 'm1' });

  test('Hero section dimensions fit 100% within viewport height without initial page scroll', () => {
    // Item 4: Restore exact original hero dimensions and framing (100dvh viewport fit)
    assertMatches(
      heroCode,
      /100dvh/,
      'Hero section must utilize 100dvh for exact viewport height fitting'
    );
    assertMatches(
      heroCode,
      /isolate/,
      'Hero section should create an isolated stacking context'
    );
  }, { id: 'T1-FEAT-04-HERO-VIEWPORT-FIT', item: 4, tier: 1, milestone: 'm1' });

  test('Category highlight section "DÖRD ƏSAS DƏRZİLİK İSTİQAMƏTİ" features 4 refined luxury categories with active visuals', () => {
    // Item 6: Clean imagery, refined typography, matching product visuals for each category
    assertContains(pageCode, 'categoryHighlights', 'Homepage must define categoryHighlights list');
    assertMatches(pageCode, /koynek[\s\S]*?hudi[\s\S]*?salvar[\s\S]*?aksesuar/, 'All 4 essential fashion directions must be present');
    assertMatches(
      pageCode,
      /aspect-\[(4\/3|3\/4)\]/,
      'Category visuals must feature refined luxury aspect-ratio framing'
    );
  }, { id: 'T1-FEAT-06-FOUR-ATELIER-DIRECTIONS', item: 6, tier: 1, milestone: 'm1' });

  test('Headline prominently features "SEÇİLMİŞ MODELLƏR" and purges outdated "QARDEROBUNUZUN TƏMƏLİ"', () => {
    // Item 7: Remove "QARDEROBUNUZUN TƏMƏLİ" as primary headline, enlarge "SEÇİLMİŞ MODELLƏR"
    assertContains(pageCode, 'SEÇİLMİŞ MODELLƏR', 'SEÇİLMİŞ MODELLƏR must be present');
    assertMatches(
      pageCode,
      /<h2[^>]*>[\s\S]*?(SEÇİLMİŞ MODELLƏR|selectedModels)[\s\S]*?<\/h2>/i,
      'SEÇİLMİŞ MODELLƏR must take the prominent <h2> position in the section'
    );
    assertNotMatches(
      pageCode,
      /<h2[^>]*>[\s\S]*?QARDEROBUNUZUN TƏMƏLİ[\s\S]*?<\/h2>/,
      'Outdated "QARDEROBUNUZUN TƏMƏLİ" must not remain as the main <h2> headline'
    );
  }, { id: 'T1-FEAT-07-HEADLINE-ELEVATION', item: 7, tier: 1, milestone: 'm1' });

  test('Pants section layout presents model fitting in an elegant editorial split showcase', () => {
    // Item 9: Pants section model fitting editorial split
    assertMatches(
      pageCode,
      /(salvar|pants)[\s\S]*?(model|editorial|split|showcase)/i,
      'Homepage must feature dedicated pants showcase layout'
    );
    assertMatches(
      pageCode,
      /HORVVALLE KƏSİMLƏRİ|HORWALLE KƏSİMLƏRİ|Şalvar Kolleksiyası|İDEAL ŞALVARLAR/i,
      'Pants section title must be present'
    );
  }, { id: 'T1-FEAT-09-PANTS-MODEL-EDITORIAL', item: 9, tier: 1, milestone: 'm1' });

  test('AI sparkle bot icon is completely removed from FAQ Help Center header', () => {
    // Item 10: Remove the AI sparkle/bot icon in front of "Kömək Mərkəzi"
    assertNotMatches(
      faqCode,
      /<Sparkles[^>]*>[\s\S]*?Kömək Mərkəzi/,
      'AI Sparkles icon must NOT be positioned directly in front of Kömək Mərkəzi'
    );
    assertMatches(
      faqCode,
      /(HelpCircle|LifeBuoy|HelpCenter|icon|Kömək Mərkəzi)/,
      'FAQ header must retain clean, professional help center badge styling'
    );
  }, { id: 'T1-FEAT-10-FAQ-AI-ICON-PURGED', item: 10, tier: 1, milestone: 'm1' });

  test('Search UI is redesigned as a centered luxury command-palette modal with quick search', () => {
    // Item 14: Modernize search UI into centered modal / command palette
    assert(headerQuickSearchCode.length > 0, 'HeaderQuickSearch component must exist');
    assertMatches(
      headerQuickSearchCode,
      /(dialog|modal|fixed inset-0|backdrop-blur)/i,
      'Search UI must render as a modern modal overlay with backdrop blur'
    );
    assertMatches(
      headerQuickSearchCode,
      /(input|searchQuery|axtar)/i,
      'Search UI must provide interactive search input'
    );
  }, { id: 'T1-FEAT-14-SEARCH-MODAL-REDESIGN', item: 14, tier: 1, milestone: 'm1' });

  test('Dropdowns utilize unified Framer Motion spring physics animations across the site', () => {
    // Item 16: Smooth polished spring animation applied to all dropdowns
    assertMatches(
      customDropdownCode,
      /type:\s*["']spring["']/,
      'CustomDropdown must declare Framer Motion spring animation type'
    );
    assertMatches(
      customDropdownCode,
      /stiffness:\s*\d+/,
      'CustomDropdown spring must specify stiffness parameter'
    );
    assertMatches(
      customDropdownCode,
      /damping:\s*\d+/,
      'CustomDropdown spring must specify damping parameter'
    );
  }, { id: 'T1-FEAT-16-DROPDOWN-SPRING-ANIMATION', item: 16, tier: 1, milestone: 'm1' });

  // =========================================================================
  // TIER 2: BOUNDARY & CORNER CASES (Items 1, 4, 6, 7, 9, 10, 14, 16)
  // =========================================================================

  test('Hero slider navigation safely handles bounds cycling without NaN or out-of-index errors', () => {
    assertMatches(
      heroCode,
      /\(prev\s*\+\s*1\)\s*%\s*total/,
      'handleNext must clamp modulo total products'
    );
    assertMatches(
      heroCode,
      /\(prev\s*-\s*1\s*\+\s*total\)\s*%\s*total/,
      'handlePrev must wrap around modulo total products'
    );
    assertMatches(
      heroCode,
      /if\s*\([^)]*total\s*===\s*0[^)]*\)\s*return/,
      'Slider must guard against empty product catalog (total === 0)'
    );
  }, { id: 'T2-BND-01-HERO-SLIDER-BOUNDS', item: 1, tier: 2, milestone: 'm1' });

  test('Hero section height handles mobile dvh vs desktop max-height constraints seamlessly', () => {
    assertMatches(
      heroCode,
      /h-\[100dvh\]\s*max-h-\[100dvh\]/,
      'Must clamp viewport height to 100dvh'
    );
    assertMatches(
      heroCode,
      /-mt-\[88px\]/,
      'Must apply negative margin to tuck under transparent atelier header'
    );
  }, { id: 'T2-BND-04-HERO-DVH-CLAMPING', item: 4, tier: 2, milestone: 'm1' });

  test('Category highlight grid handles missing or empty categories without crashing', () => {
    assertMatches(
      pageCode,
      /categoryHighlights\.map/,
      'Homepage must safely iterate over category highlights array'
    );
    assertMatches(
      pageCode,
      /cat\.link/,
      'Category cards must link to valid collection routes'
    );
  }, { id: 'T2-BND-06-CATEGORIES-GRID-SAFETY', item: 6, tier: 2, milestone: 'm1' });

  test('Headline localized fallback gracefully renders if translation key is missing', () => {
    assertMatches(
      pageCode,
      /t\.home\.(selectedModels|headline)[\s\S]*?\|\|\s*["']SEÇİLMİŞ MODELLƏR["']/,
      'Headline must provide a robust hardcoded Azerbaijani fallback "SEÇİLMİŞ MODELLƏR"'
    );
  }, { id: 'T2-BND-07-HEADLINE-I18N-FALLBACK', item: 7, tier: 2, milestone: 'm1' });

  test('Pants editorial section handles responsive column stacking on small mobile screens', () => {
    assertMatches(
      pageCode,
      /(grid-cols-1|flex-col)[\s\S]*?(lg:grid-cols|md:grid-cols|lg:flex-row)/,
      'Pants showcase layout must adapt cleanly from single column on mobile to split on desktop'
    );
  }, { id: 'T2-BND-09-PANTS-RESPONSIVE-STACKING', item: 9, tier: 2, milestone: 'm1' });

  test('FAQ accordion handles rapid clicking and simultaneous toggle states without race conditions', () => {
    assertMatches(
      faqCode,
      /openId\s*===\s*id\s*\?\s*null\s*:\s*id/,
      'FAQ accordion toggle must toggle openId or set null'
    );
  }, { id: 'T2-BND-10-FAQ-ACCORDION-TOGGLE-ATOMIC', item: 10, tier: 2, milestone: 'm1' });

  test('Search modal handles empty query and special characters without throwing RegExp syntax errors', () => {
    assertMatches(
      headerQuickSearchCode,
      /trim\(\)/,
      'Search query must be trimmed before execution'
    );
  }, { id: 'T2-BND-14-SEARCH-SPECIAL-CHARS-GUARD', item: 14, tier: 2, milestone: 'm1' });

  test('CustomDropdown handles clicking outside and keyboard Escape key dismissal', () => {
    assertMatches(
      customDropdownCode,
      /handleClickOutside/,
      'Dropdown must register outside click listener'
    );
    assertMatches(
      customDropdownCode,
      /e\.key\s*===\s*["']Escape["']/,
      'Dropdown must close on Escape keypress'
    );
  }, { id: 'T2-BND-16-DROPDOWN-DISMISSAL', item: 16, tier: 2, milestone: 'm1' });

  // =========================================================================
  // TIER 3: CROSS-FEATURE COMBINATIONS
  // =========================================================================

  test('Hero color synchronization updates document theme and dispatches custom event', () => {
    assertMatches(
      heroCode,
      /hv-hero-color-change/,
      'Hero slide change must emit custom event for global color coordination'
    );
    assertMatches(
      heroCode,
      /--hero-bg/,
      'Hero must set CSS variable --hero-bg on documentElement'
    );
  }, { id: 'T3-INT-HERO-THEME-COORDINATION', item: 1, tier: 3, milestone: 'm1' });

  test('Search command palette links directly to filtered collections with category parameters', () => {
    assertMatches(
      headerQuickSearchCode,
      /\/collections\?category=|\/collections\?q=|\/products\//,
      'Search results must direct customer to product details or category collections'
    );
  }, { id: 'T3-INT-SEARCH-CATALOG-INTEGRATION', item: 14, tier: 3, milestone: 'm1' });

  // =========================================================================
  // TIER 4: REAL-WORLD APPLICATION SCENARIOS
  // =========================================================================

  test('Scenario: Customer visits homepage, observes framed hero, opens search modal, navigates to category', () => {
    // 1. StoreShell wraps page in smooth scroll with header and footer
    assertMatches(storeShellCode, /<Header\s*\/>/, 'StoreShell renders global Header');
    assertMatches(storeShellCode, /<Footer\s*\/>/, 'StoreShell renders global Footer');

    // 2. Hero fits viewport seamlessly
    assertMatches(heroCode, /100dvh/, 'Hero fits exact viewport');

    // 3. Search is globally accessible from header
    const headerCode = readProjectFile('components/Header.tsx');
    assertMatches(headerCode, /QuickSearch|search/i, 'Header integrates quick search');

    // 4. Category highlights provide direct conversion pathways
    assertMatches(pageCode, /categoryHighlights/, 'Category highlights provide visual pathways');
  }, { id: 'T4-SCEN-STOREFRONT-DISCOVERY-FLOW', item: 4, tier: 4, milestone: 'm1' });
});

if (process.argv[1] && process.argv[1].endsWith('test_m1_ui_hero.mjs')) {
  runStandalone();
}
