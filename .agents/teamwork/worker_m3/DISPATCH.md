## 2026-11-08T18:22:37Z
You are worker_m3, an implementation worker.
Working directory: c:\Users\Elsan\Documents\clothes_veb\.agents\teamwork\worker_m3
Original request path: c:\Users\Elsan\Documents\clothes_veb\.agents\teamwork\ORIGINAL_REQUEST.md
Project scope path: c:\Users\Elsan\Documents\clothes_veb\PROJECT.md
Survey handoff path: c:\Users\Elsan\Documents\clothes_veb\.agents\teamwork\explorer_survey_2\handoff.md
M2 handoff path: c:\Users\Elsan\Documents\clothes_veb\.agents\teamwork\worker_m2\handoff.md

MANDATORY: Read c:\Users\Elsan\Documents\clothes_veb\.agents\teamwork\ORIGINAL_REQUEST.md first before starting work.
Study c:\Users\Elsan\Documents\clothes_veb\.agents\teamwork\explorer_survey_2\handoff.md and c:\Users\Elsan\Documents\clothes_veb\.agents\teamwork\worker_m2\handoff.md. Note that `lib/countries.ts` and `lib/shipping.ts` have already been implemented and tested in Milestone 2.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

File Ownership (You exclusively own these files; do not touch other files):
- app/checkout/page.tsx
- app/api/store/orders/route.ts
- app/api/checkout/route.ts
- lib/notifications/orderNotifier.ts
- lib/email/emailTemplates.ts

Task: Implement Milestone 3 - Storefront Checkout & Order Processing Integration:
1. Storefront Checkout Page (app/checkout/page.tsx):
   - Import country and shipping utilities: `lib/countries.ts` and `lib/shipping.ts`.
   - Use `detectedCountry` from `useCurrency()` to set initial country (defaults to "AZ" if in Azerbaijan, else customer's detected country).
   - Render a Country selector dropdown in the shipping details section.
   - Dynamic form fields:
     - When Country is "AZ": Display the domestic city buttons (Bakı, Sumqayıt, Rayonlar) and default phone prefix `+994 `. Postal code optional.
     - When Country is NOT "AZ" (International):
       - Automatically prefix phone input with country's dial code (e.g. `+1 `, `+44 `, `+90 `).
       - Render Address Line 1 and optional Address Line 2.
       - Render City and State/Province (mandatory for US/CA/AU).
       - Render Postal / ZIP code (mandatory for international).
   - Dynamic Shipping Method Selector:
     - Call `calculateShippingOptions(countryCode, subtotal, currency)` to get available options.
     - For domestic: Bakı & Sumqayıt Courier (0 AZN) or Rayonlar (5 AZN / free >= 60 AZN).
     - For international: Standard International Priority Post ($15 / 25 AZN, free >= $150 / 250 AZN) and DHL Express Worldwide ($35 / 60 AZN, discounted to $20 / 35 AZN >= $200 / 340 AZN).
     - Render selectable shipping cards showing carrier name, delivery estimate (e.g. "2–5 business days"), and price in active currency.
     - Update order summary totals dynamically with the selected shipping method rate.
   - Payment Method Gating:
     - When country !== "AZ", disable/hide Cash on Delivery (COD) with a helpful note ("Nağd ödəniş yalnız Azərbaycan daxili sifarişlər üçün keçərlidir"), keeping Card, Apple Pay, and Google Pay active.
   - In order submission payload, send: `country`, `countryCode`, `addressLine2`, `stateOrRegion`, `postalCode`, `shippingMethod`, `shippingMethodLabel`, `shipping`, `estimatedDelivery`.
2. Server Order Processing Routes (app/api/store/orders/route.ts & app/api/checkout/route.ts):
   - Sanitize customer address: extract `country`, `countryCode`, `addressLine2`, `stateOrRegion`, `postalCode`, `shippingMethod`.
   - Server-side shipping recalculation: Use `lib/shipping.ts` to verify shipping rate against destination, subtotal, and currency. Reject tampered rates.
   - Enforce COD gating: Reject COD requests if `countryCode !== 'AZ'`.
   - Save full address and shipping details to `StoreOrder` and pass to `syncOrderToSupabase()`.
   - Update `lib/notifications/orderNotifier.ts` and `lib/email/emailTemplates.ts` to include full international destination and carrier.
3. Build and verify:
   - Run `npx tsc --noEmit` and `npm run build`. Both MUST succeed with exit code 0.
4. Write your comprehensive report to c:\Users\Elsan\Documents\clothes_veb\.agents\teamwork\worker_m3\handoff.md and notify the caller when done.

## 2026-11-08T18:34:24Z
**Context**: Milestone 3 implementation status check
**Content**: Checking in on Milestone 3 (Checkout UI & Order API Integration). Could you update your progress.md with your current progress, files touched, and estimated completion?
**Action**: Reply with status update or submit handoff.md if complete.

