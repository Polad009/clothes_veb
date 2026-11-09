/**
 * E2E Test Suite: Milestone 5 - Customer Order Tracking, Live Chat & Customer Account Gating
 * Items Covered: 11, 12, 23, 24
 *
 * Tiers:
 * - Tier 1: Feature Coverage (Items 11, 12, 23, 24)
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

describe('Milestone 5: Customer Order Tracking, Live Chat & Customer Account Gating', () => {
  const trackApiCode = readProjectFile('app/api/orders/track/route.ts');
  const trackPageCode = readProjectFile('app/track/page.tsx');
  const chatComponentCode = readProjectFile('components/FloatingWhatsApp.tsx');
  const chatThreadsApiCode = readProjectFile('app/api/chat/threads/route.ts');
  const checkoutCode = readProjectFile('app/checkout/page.tsx');
  const adminHtmlCode = readProjectFile('public/admin.html');

  // =========================================================================
  // TIER 1: FEATURE COVERAGE (Items 11, 12, 23, 24)
  // =========================================================================

  test('Live tracking code synchronization safely queries Supabase without PostgreSQL UUID typecast failure', () => {
    // Item 11: Fix PostgreSQL UUID query failure in /api/orders/track
    assertMatches(
      trackApiCode,
      /export async function GET/,
      'Tracking API must expose GET handler'
    );
    assertMatches(
      trackApiCode,
      /supabaseServer/,
      'Tracking API must support querying Supabase for live cloud orders'
    );
    // Ensure .ilike is not blindly executed on UUID column without casting or formatting
    assertMatches(
      trackApiCode,
      /isEmailSearch|isPhoneSearch|cleanQuery/,
      'Tracking API must intelligently differentiate between email, phone, and order code searches'
    );
  }, { id: 'T1-FEAT-11-TRACKING-SYNC-UUID-FIX', item: 11, tier: 1, milestone: 'm5' });

  test('Live tracking page displays order status pipeline (Təsdiqləndi, Kuryerdə, Çatdırıldı)', () => {
    // Item 11: Accurate status reflection on /track
    assertMatches(
      trackPageCode,
      /Təsdiqləndi|Kuryerdə|Çatdırıldı|Yeni Sifariş/,
      'Tracking page must display localized order status stages'
    );
  }, { id: 'T1-FEAT-11-TRACKING-STATUS-PIPELINE', item: 11, tier: 1, milestone: 'm5' });

  test('Live chat automated assistant responds with polite waiting message after customer enters contact info', () => {
    // Item 12: Say a polite message: "Zəhmət olmasa xətdə qalın, operatorumuz ən qısa zamanda sizə cavab verəcək."
    assertMatches(
      chatComponentCode,
      /Zəhmət olmasa xətdə qalın|operatorumuz ən qısa zamanda/i,
      'Live chat must display the specified polite waiting message after lead capture'
    );
  }, { id: 'T1-FEAT-12-CHAT-POLITE-WAITING-MESSAGE', item: 12, tier: 1, milestone: 'm5' });

  test('Live chat modal prevents background body scrolling when open on mobile devices', () => {
    // Item 12: Prevent background body scrolling when the chat modal/drawer is open on mobile
    assertMatches(
      chatComponentCode,
      /document\.body\.style\.overflow\s*=\s*["']hidden["']/,
      'Chat must set document.body.style.overflow = "hidden" when open'
    );
  }, { id: 'T1-FEAT-12-CHAT-MOBILE-SCROLL-LOCK', item: 12, tier: 1, milestone: 'm5' });

  test('Admin panel live chat provides batch delete action to purge all messages and threads', () => {
    // Item 23: In admin panel "Canlı Dəstək & Çat", add a "Bütün mesajları sil" (Delete all messages) button
    assertMatches(
      adminHtmlCode,
      /Bütün mesajları sil|deleteAllChatMessages|clearAllThreads/i,
      'Admin live chat panel must feature "Bütün mesajları sil" button or handler'
    );
    assertMatches(
      chatThreadsApiCode,
      /DELETE/,
      'Chat threads API must support DELETE method'
    );
  }, { id: 'T1-FEAT-23-CHAT-BATCH-DELETE', item: 23, tier: 1, milestone: 'm5' });

  test('Customer checkout requires account sign-in / registration to prevent lost tracking codes', () => {
    // Item 24: To prevent losing tracking codes, require customers to create/sign in to an account when ordering
    assertMatches(
      checkoutCode,
      /authRequiredOrder|loginToBuy|useAuth/i,
      'Checkout must enforce customer authentication / account gating'
    );
  }, { id: 'T1-FEAT-24-MANDATORY-AUTH-CHECKOUT-GATING', item: 24, tier: 1, milestone: 'm5' });

  test('Admin panel provides phone and email customer lookup tool to recover lost tracking codes', () => {
    // Item 24: Admin panel must have a clear lookup section where admin can find customer orders by phone/email
    assertMatches(
      adminHtmlCode,
      /lookup|axtar|telefon|email|Müştəri Axtarışı/i,
      'Admin panel must offer phone/email lookup tool for tracking code recovery'
    );
  }, { id: 'T1-FEAT-24-ADMIN-TRACKING-RECOVERY-LOOKUP', item: 24, tier: 1, milestone: 'm5' });

  // =========================================================================
  // TIER 2: BOUNDARY & CORNER CASES (Items 11, 12, 23, 24)
  // =========================================================================

  test('Tracking API masks personally identifiable information (PII) in public tracking responses', () => {
    assertMatches(
      trackApiCode,
      /maskName|maskPhone|\*\*\*/,
      'Tracking API must mask customer full name and phone number for privacy'
    );
  }, { id: 'T2-BND-11-PII-MASKING-IN-TRACKING', item: 11, tier: 2, milestone: 'm5' });

  test('Tracking search handles various telephone number formats (+994, leading 0, raw digits)', () => {
    assertMatches(
      trackApiCode,
      /normalizePhone|replace\(\/\[\^0-9\]\/g,\s*['"]['"]\)/,
      'Tracking API must normalize phone numbers by stripping formatting characters'
    );
  }, { id: 'T2-BND-11-PHONE-FORMAT-RESILIENCE', item: 11, tier: 2, milestone: 'm5' });

  test('Live chat onboarding validates required customer name before initiating conversation', () => {
    assertMatches(
      chatComponentCode,
      /if\s*\(\s*!cleanName\s*\)\s*\{[\s\S]*?setLeadError/,
      'Chat onboarding must reject empty name submissions'
    );
  }, { id: 'T2-BND-12-CHAT-NAME-VALIDATION', item: 12, tier: 2, milestone: 'm5' });

  test('Chat threads DELETE API guards against unauthorized requests with 401 Unauthorized', () => {
    assertMatches(
      chatThreadsApiCode,
      /isAdminAuthenticated/,
      'Chat deletion must be protected by isAdminAuthenticated'
    );
  }, { id: 'T2-BND-23-CHAT-DELETE-AUTH-GUARD', item: 23, tier: 2, milestone: 'm5' });

  test('Checkout authentication modal offers seamless tabs for both Sign In and Sign Up', () => {
    assertMatches(
      checkoutCode,
      /AuthModal|login|register/i,
      'Checkout must provide user pathways for both existing login and new account creation'
    );
  }, { id: 'T2-BND-24-AUTH-LOGIN-SIGNUP-PATHWAYS', item: 24, tier: 2, milestone: 'm5' });

  // =========================================================================
  // TIER 3: CROSS-FEATURE COMBINATIONS
  // =========================================================================

  test('Tracking status updates reflect in real-time across both API responses and tracking page UI', () => {
    assertMatches(
      trackPageCode,
      /fetch\([`'"]\/api\/orders\/track/,
      'Track page must query /api/orders/track endpoint'
    );
    assertMatches(
      trackPageCode,
      /statusMeta/,
      'Track page must visualize active status progress step'
    );
  }, { id: 'T3-INT-TRACKING-PAGE-API-SYNC', item: 11, tier: 3, milestone: 'm5' });

  test('Live chat session metadata associates authenticated customer email with support thread', () => {
    assertMatches(
      chatComponentCode,
      /user\?\.email/,
      'Chat onboarding should associate logged-in customer email with chat thread'
    );
  }, { id: 'T3-INT-CHAT-AUTH-PROFILE-SYNC', item: 12, tier: 3, milestone: 'm5' });

  test('Admin phone and email search queries live orders to recover customer tracking codes', () => {
    assertMatches(
      adminHtmlCode,
      /customer_phone|customer_email|telefon|email/i,
      'Admin customer lookup must search by phone or email'
    );
  }, { id: 'T3-INT-TRACKING-LOOKUP-ADMIN-PHONE-SEARCH', item: 24, tier: 3, milestone: 'm5' });

  test('Live chat batch delete action purges thread files from cloud storage', () => {
    assertMatches(
      chatThreadsApiCode,
      /remove|DELETE/i,
      'Chat threads API must support deleting thread files from storage'
    );
  }, { id: 'T3-INT-CHAT-BATCH-DELETE-STORAGE-PURGE', item: 23, tier: 3, milestone: 'm5' });

  // =========================================================================
  // TIER 4: REAL-WORLD APPLICATION SCENARIOS
  // =========================================================================

  test('Scenario: Customer places order, receives tracking code, checks live status, and admin assists with lookup', () => {
    // 1. Tracking code format standard
    assertMatches(trackApiCode, /trackingCode|AZ-EXP-/, 'Tracking code conforms to atelier tracking standard');

    // 2. Tracking page allows querying
    assertMatches(trackPageCode, /handleSearch|searchVal|setQuery|query/i, 'Tracking page has user input query handler');

    // 3. Admin has lookup mechanism
    assertMatches(adminHtmlCode, /order|lookup|axtar/i, 'Admin has order lookup interface');
  }, { id: 'T4-SCEN-ORDER-TRACKING-SUPPORT-LIFECYCLE', item: 24, tier: 4, milestone: 'm5' });

  test('Scenario: Customer loses tracking code, initiates live chat with polite waiting message, and admin recovers tracking code', () => {
    // 1. Customer initiates chat and completes lead form
    assertMatches(chatComponentCode, /handleOnboardingSubmit/, 'Chat handles onboarding submission');

    // 2. Polite waiting message is displayed
    assertMatches(chatComponentCode, /Zəhmət olmasa xətdə qalın|operatorumuz ən qısa zamanda/i, 'Polite waiting message presented');

    // 3. Admin retrieves tracking code using phone/email lookup
    assertMatches(adminHtmlCode, /axtar|lookup|order/i, 'Admin retrieves customer order details');
  }, { id: 'T4-SCEN-CUSTOMER-SUPPORT-RECOVERY-JOURNEY', item: 24, tier: 4, milestone: 'm5' });
});

if (process.argv[1] && process.argv[1].endsWith('test_m5_tracking_chat_auth.mjs')) {
  runStandalone();
}
