# DISPATCH

Subagent: worker_m2
Role: Milestone 2 Implementation Worker (International Shipping Engine & Data Models)
Working Directory: c:\Users\Elsan\Documents\clothes_veb\.agents\teamwork\worker_m2
Project Scope: c:\Users\Elsan\Documents\clothes_veb\PROJECT.md
Original Request: c:\Users\Elsan\Documents\clothes_veb\.agents\teamwork\ORIGINAL_REQUEST.md
Explorer Handoff: c:\Users\Elsan\Documents\clothes_veb\.agents\teamwork\explorer_survey_2\handoff.md
## 2026-11-08T18:13:33Z
You are worker_m2, an implementation worker.
Working directory: c:\Users\Elsan\Documents\clothes_veb\.agents\teamwork\worker_m2
Original request path: c:\Users\Elsan\Documents\clothes_veb\.agents\teamwork\ORIGINAL_REQUEST.md
Project scope path: c:\Users\Elsan\Documents\clothes_veb\PROJECT.md
Survey handoff path: c:\Users\Elsan\Documents\clothes_veb\.agents\teamwork\explorer_survey_2\handoff.md

Task: Implement Milestone 2 - International Shipping Engine & Data Models:
1. Create `lib/countries.ts`:
   - Comprehensive catalog of international countries and territories with ISO-2 code, English name, local name, international dial code, flag emoji, whether postal code is required, and whether state/province is required.
   - Include Azerbaijan ("AZ", dial code "+994") plus all major international destinations (US, UK, TR, DE, FR, IT, ES, AE, SA, RU, KZ, GE, CA, AU, JP, CH, etc.).
   - Export helper functions: `getAllCountries()`, `getCountryByCode(code: string)`, `isValidCountry(code: string)`, `formatPhoneWithDialCode(...)`.
2. Create `lib/shipping.ts`:
   - Define interfaces: `ShippingOption`, `ShippingTier`, `ShippingCalculationParams`.
   - Domestic Azerbaijan rates:
     - Bakı & Sumqayıt Courier: 0 ₼ (Always free, 1-2 iş günü)
     - Rayonlar / Azərpoçt: 5 ₼ (Free on orders >= 60 ₼, 2-4 iş günü)
   - International rates:
     - Standard International Tracked Priority Post: $15 USD / 25 AZN (Free on orders >= $150 USD / 250 AZN, 7-14 business days)
     - DHL Express Worldwide / FedEx Priority: $35 USD / 60 AZN (Discounted to $20 USD / 35 AZN on orders >= $200 USD / 340 AZN, 2-5 business days)
   - Export helper functions:
     - `calculateShippingOptions(countryCode: string, subtotal: number, currency: "AZN" | "USD"): ShippingOption[]`
     - `getShippingOptionById(countryCode: string, subtotal: number, currency: "AZN" | "USD", optionId: string): ShippingOption | null`
     - `validateShippingRate(countryCode: string, subtotal: number, currency: "AZN" | "USD", optionId: string, claimedRate: number): { valid: boolean; expectedRate: number; option: ShippingOption }`
3. Update `lib/payments/provider.ts`:
   - In `validatePaymentEligibility()`, add a rule: If `paymentMethod === 'cash_on_delivery'`, check `request.customer.country` and `countryCode`. If not Azerbaijan ("AZ" or "Azərbaycan"), return `{ eligible: false, reason: "Nağd ödəniş (COD) yalnız Azərbaycan daxili sifarişlər üçün keçərlidir. Beynəlxalq sifarişlər üçün kart və ya Apple/Google Pay seçin." }`.
4. Update `lib/storeDb.ts`:
   - Enhance `StoreCustomerAddress` and `StoreOrder` to include `addressLine2?: string`, `stateOrRegion?: string`, `postalCode?: string`, `countryCode: string`, `shippingMethod?: string`, `shippingMethodLabel?: string`, `estimatedDelivery?: string`. Maintain backward compatibility.
5. Update `lib/supabase/schema.sql`:
   - Add idempotent `ALTER TABLE orders ADD COLUMN IF NOT EXISTS ...` for `delivery_country`, `delivery_postal_code`, `delivery_state`, `delivery_address_line2`, `shipping_method`, `shipping_amount`, `currency`.
6. Build and verify:
   - Run `npx tsc --noEmit` and `npm run build`. Both MUST succeed with exit code 0.
7. Write your comprehensive report to c:\Users\Elsan\Documents\clothes_veb\.agents\teamwork\worker_m2\handoff.md and notify the caller when done.
