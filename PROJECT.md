# Project: clothes_veb Gender Categorization & International Shipping

## Architecture
- **Framework**: Next.js 14.2 (App Router) with React 18, TypeScript 5.4, Tailwind CSS.
- **Admin System**: Dual entrypoints (`public/admin.html` embedded via iframe in `/admin` and `admin-portal/public/index.html`).
- **Data Layers**: Local persistent JSON store (`lib/storeDb.ts` accessing `data/storeData.json` / `/tmp/storeData.json`) synced with Supabase PostgreSQL (`lib/supabase/schema.sql`).
- **Storefront**: Next.js App Router (`components/Header.tsx`, `app/collections/page.tsx`, `app/checkout/page.tsx`, `context/CurrencyContext.tsx`).
- **Shipping & Rates Engine**: Isolated module (`lib/shipping.ts` / `lib/countries.ts`) responsible for tiered rate calculation, destination rules, and currency conversion.

---

## Feature Inventory
Every feature identified from the survey and requirements is cataloged and assigned to a milestone:

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Admin Gender Selector | Explicit Gender selector (🔘 Kişi / 🔘 Qadın / 🔘 Unisex) in `#productForm`, reset in `openProductModal`, populate in `editProduct`, dynamic submit payload, and badge in `renderProductsTable` across both `public/admin.html` and `admin-portal/public/index.html`. | M1 | Survey (explorer 1) |
| 2 | Header Navigation Gender Links | "Kişi" (`/collections?gender=men`) and "Qadın" (`/collections?gender=women`) navigation links in desktop glass navbar and mobile drawer menu with active route indicator and multilingual translations. | M1 | Survey (explorer 1) |
| 3 | Collections Page Gender Filtering | Read `gender` query param, display interactive Gender filter tabs (Hamısı / Kişi / Qadın / Unisex), apply inclusive filtering (`men` includes `men`+`unisex`, `women` includes `women`+`unisex`, `unisex` is strict), and update heading/filters. | M1 | Survey (explorer 1) |
| 4 | Storefront Product API Gender Support | Ensure `app/api/store/products/route.ts` and `app/api/store/data/route.ts` correctly serve and filter gender consistently. | M1 | Survey (explorer 1) |
| 5 | Global Destination & Country Registry | `lib/countries.ts` with comprehensive country catalog (ISO-2 code, name, dial code, flag, postal code validation pattern) and auto-detection integration from `CurrencyContext` / `/api/geo`. | M2 | Survey (explorer 2) |
| 6 | International Shipping Rate Engine | `lib/shipping.ts` providing transparent tiered rates (Standard International vs. DHL Express Worldwide), delivery day estimates, currency-aware calculation (USD/AZN), and free shipping thresholds ($150+ standard free, $200+ express discount). | M2 | Survey (explorer 2) |
| 7 | Payment Method Gating (COD restriction) | Enforce Cash on Delivery availability only for domestic Azerbaijan orders; disable/hide COD for international destinations while enabling Card, Apple Pay, and Google Pay. | M2 | Survey (explorer 2) |
| 8 | Order Schema & Database Expansion | Update `StoreOrder` and `StoreCustomerAddress` in `lib/storeDb.ts`, and Supabase schema in `lib/supabase/schema.sql` with `delivery_country`, `delivery_postal_code`, `delivery_state`, `delivery_address_line2`, `shipping_method`, `currency`. | M2 | Survey (explorer 2) |
| 9 | Checkout International Address Form | Dynamic domestic vs. international form in `app/checkout/page.tsx` with Country dropdown, international phone dial code, Address Line 1 & 2, City, State/Province, and Postal/ZIP code. | M3 | Survey (explorer 2) |
| 10 | Dynamic Shipping Method Selector in Checkout | Live shipping selection UI in `app/checkout/page.tsx` displaying available carriers, rates in active currency, delivery estimates, and instant order summary price recalculation. | M3 | Survey (explorer 2) |
| 11 | Server-Side Order Submission & Validation | Server-side recalculation and validation in `app/api/store/orders/route.ts` & `app/api/checkout/route.ts`, sanitizing international address fields, verifying shipping rates, and persisting complete records. | M3 | Survey (explorer 2) |
| 12 | Thermal Labels & Admin Order Viewer | Update `renderShippingLabelString` in `public/admin.html` and admin order detail modal to display international destination, postal code, and carrier badge (DHL vs Post vs Courier). | M3 | Survey (explorer 2) |
| 13 | E2E Testing Suite (Tiers 1-4) | Comprehensive opaque-box test runner covering all inventoried features across Category-Partition (Tier 1), Boundary Value Analysis (Tier 2), Pairwise Combinations (Tier 3), and Real-World Scenarios (Tier 4). | TestTrack | Project Pattern |
| 14 | Final Verification & Adversarial Hardening | Pass 100% of E2E test suite followed by Tier 5 adversarial stress testing and forensic audit clean verification. | M4 | Project Pattern |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| TestTrack | E2E Testing Track | Build test runner & Tiers 1-4 automated tests, publish `TEST_READY.md` | Survey | DONE |
| M1 | Gender Categorization & Filtering | Admin forms, Header navigation links, Collections tabs and product filtering, API consistency | Survey | DONE |
| M2 | International Shipping Engine & Data Models | `lib/countries.ts`, `lib/shipping.ts`, COD gating rules, `StoreOrder` interface & SQL schema | Survey | DONE |
| M3 | Storefront Checkout & Order Processing | `app/checkout/page.tsx` address form & carrier selector, `app/api/store/orders/route.ts` server validation | M2 | DONE |
| M4 | Final E2E Test Pass & Adversarial Hardening | 100% pass of E2E test suite + Tier 5 adversarial coverage hardening + clean Forensic Audit | M1, M3, TestTrack | DONE |

---

## Interface Contracts

### 1. Gender Schema & Product Contract
```typescript
export type ProductGender = 'men' | 'women' | 'unisex';

export interface ProductGenderFilter {
  gender: 'all' | ProductGender;
}
```
- In DB: `gender TEXT NOT NULL DEFAULT 'unisex' CHECK (gender IN ('men', 'women', 'unisex'))`.
- In Admin UI: `#prodGender` radio buttons with values `'men'`, `'women'`, `'unisex'`.
- In URL query: `/collections?gender=men`, `/collections?gender=women`, `/collections?gender=unisex`.
- In Filtering logic:
  - `gender === 'men'`: includes items where `product.gender === 'men' || product.gender === 'unisex'`.
  - `gender === 'women'`: includes items where `product.gender === 'women' || product.gender === 'unisex'`.
  - `gender === 'unisex'`: includes items where `product.gender === 'unisex'`.

### 2. Country & International Shipping Contract
```typescript
export interface CountryInfo {
  code: string; // ISO 2-letter, e.g. "AZ", "US", "TR", "GB", "DE", "AE"
  name: string; // English
  localName: string;
  dialCode: string; // e.g. "+994", "+1", "+90", "+44"
  flag: string; // emoji
  requiresPostalCode: boolean;
  requiresState: boolean;
}

export interface ShippingOption {
  id: string; // 'domestic_baku_sumgayit' | 'domestic_region' | 'intl_standard' | 'intl_express'
  name: string;
  carrier: string;
  estimatedDays: string;
  price: number;
  isFree: boolean;
  currency: 'AZN' | 'USD';
}

export interface InternationalAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  addressLine2?: string;
  city: string;
  stateOrRegion?: string;
  postalCode?: string;
  country: string;
  countryCode: string;
}
```

### 3. Order Processing API Contract
Endpoint: `POST /api/store/orders`
- Request Payload `customer`:
  - `fullName`: string (min 3)
  - `phone`: string (numeric digits validated per dial code)
  - `email`: string (valid email regex)
  - `address`: string (min 4)
  - `addressLine2`: optional string
  - `city`: string
  - `stateOrRegion`: optional string (required for US/CA/AU)
  - `postalCode`: optional string (required for international)
  - `country`: string
  - `countryCode`: string (ISO-2)
- Request Payload `shippingMethod`: string (`'domestic_free'` | `'domestic_region'` | `'intl_standard'` | `'intl_express'`)
- Rate verification: Server computes shipping according to destination `countryCode`, `subtotal`, and `currency`. Rejects if COD is requested for `countryCode !== 'AZ'`.

---

## Code Layout & Ownership Boundaries
- **Testing Track**: Exclusive owner of `tests/` and test runner scripts (`scripts/run-e2e-tests.mjs`, `TEST_INFRA.md`, `TEST_READY.md`).
- **Milestone 1 Worker**: Exclusive owner of `components/Header.tsx`, `app/collections/page.tsx`, `public/admin.html`, `admin-portal/public/index.html`, `lib/translations.ts`.
- **Milestone 2 Worker**: Exclusive owner of `lib/countries.ts`, `lib/shipping.ts`, `lib/storeDb.ts`, `lib/supabase/schema.sql`, `lib/payments/provider.ts`.
- **Milestone 3 Worker**: Exclusive owner of `app/checkout/page.tsx`, `app/api/store/orders/route.ts`, `app/api/checkout/route.ts`, `lib/notifications/orderNotifier.ts`.
- Concurrent workers MUST NOT write to each other's owned files.
