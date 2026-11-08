# Codebase Infrastructure, Build, Test & Environment Survey Report

**Agent**: `explorer_survey_3`  
**Date**: 2026-11-08  
**Scope**: Codebase infrastructure, package manager, build scripts, test harness, environment variables, database connections, and architectural audit for Gender Categorization and International Shipping.

---

## 1. Observation

### 1.1 Project Identification & Runtime
- **Repository Root**: `c:\Users\Elsan\Documents\clothes_veb`
- **Framework**: **Next.js 14.2.35** with React 18.3.1 (App Router architecture).
- **Runtime Environment**: Node.js **v24.15.0**, verified on Windows x64.
- **Package Manager**: **npm** version **11.12.1**, verified by `package-lock.json` (`lockfileVersion: 3`, line 4). No yarn, pnpm, or bun lockfiles exist.
- **TypeScript Configuration**: `tsconfig.json` targets `esnext` with `"moduleResolution": "bundler"`, `"strict": true`, and path alias `"@/*": ["./*"]`.

### 1.2 `package.json` Scripts
From `c:\Users\Elsan\Documents\clothes_veb\package.json` (lines 5-16):
```json
"scripts": {
  "dev": "next dev --turbo",
  "build": "next build",
  "start": "next start -p 3000",
  "start:prod": "node scripts/start-prod.js",
  "start:frontend": "next start -p 3000",
  "start:admin": "node admin-portal/server.js",
  "start:backend": "node server/server.js",
  "admin": "node admin-portal/server.js",
  "lint": "next lint",
  "download-models": "node scripts/download-models.mjs"
}
```
- **Build Command**: `npm run build` (executes `next build`). Successfully tested; compiles 24+ routes with 0 errors.
- **Typecheck Script**: Not present in `package.json`. Direct command: `npx tsc --noEmit`. Tested directly; exits with code 0 and 0 errors.
- **Lint Script**: `"lint": "next lint"`. When invoked non-interactively, fails with exit code 1 because ESLint configuration (`.eslintrc.json` or `eslint.config.mjs`) is not yet initialized, causing Next.js to prompt for interactive configuration.
- **Test Script**: Not defined in `package.json`.

### 1.3 Test Suites & Runners
- **Automated Test Runners**: There are **no** automated test runners (no Vitest, Jest, Playwright, Cypress, or Mocha configurations or test dependencies in `package.json`).
- Search for `*.test.*` or `*.spec.*` yielded 0 automated unit or integration test files.
- `public/test-suite.html` (209 lines): An interactive, in-browser visual demo/test page for testing the local client-side IS-Net background-removal Web Worker (`/workers/rmbg-worker.js`), not an automated test suite.

### 1.4 Environment Variables & Database Connections
- **`.env.example`** (lines 1-42) & **`.env.local`** (lines 1-40):
  - `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_SITE_URL`: `https://www.horwalle.com`
  - `NEXT_PUBLIC_SUPABASE_URL`: `https://hrgvvsyalafdscponoca.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`: Configured for Supabase client & server instances.
  - `PAYMENT_MODE`: `"test"`
  - `PAYMENT_PROVIDER`: `"mock"`
  - `NEXT_PUBLIC_ENABLE_COD`: `"true"` (Cash on Delivery enabled)
  - `ADMIN_ACCESS_KEY`: `"horvvalle_portal_2026_xQ9mK"`
  - `ADMIN_JWT_SECRET`: `"horvvalle_super_secure_admin_secret_key_2026_98124"`
- **Database Architecture**:
  - **Local Store**: `data/storeData.json` handled via `lib/storeDb.ts` (`readStoreDb()`, `writeStoreDb()`). Serves as bundled file and runtime cache (`/tmp/storeData.json`).
  - **Cloud Database**: Supabase PostgreSQL (`lib/supabaseServer.ts`), with tables `products`, `orders`, `order_items`, `profiles`, `custom_designs`.
  - In `lib/supabase/schema.sql` (line 16), the column already exists:
    ```sql
    gender TEXT NOT NULL DEFAULT 'unisex' CHECK (gender IN ('men', 'women', 'unisex'))
    ```
  - In `lib/storeDb.ts` (line 23), `gender` is already typed:
    ```typescript
    gender: 'men' | 'women' | 'accessories' | 'unisex' | string;
    ```
  - In `app/api/admin/[...slug]/route.ts` (lines 423, 438), the API already accepts `product.gender` and syncs to Supabase.

### 1.5 Codebase Observations for Feature Requirements

#### Part 1: Gender Categorization & Filtering
1. **Admin Panel Form (`public/admin.html` and `admin-portal/public/index.html`)**:
   - `public/admin.html` lines 2066-2080: Only `prodName`, `prodCategory` (`koynek`, `hudi`, `salvar`, `aksesuar`), and prices exist. No Gender selector input.
   - `public/admin.html` lines 4101-4125 (`openProductModal`) and lines 4127-4166 (`editProduct`): No gender field is populated.
   - `public/admin.html` line 4589 (`handleProductFormSubmit`): Hardcoded to `gender: 'unisex'`.
   - `admin-portal/public/index.html` lines 1320, 2475, 2512: Similarly hardcoded to `gender: 'unisex'`.
2. **Navigation Header (`components/Header.tsx`)**:
   - Lines 128-135: `navLinks` contains only categories (`koynek`, `hudi`, `salvar`, `aksesuar`, `all`, `track`). No links or selectors for "Kişi" (Men) or "Qadın" (Women).
3. **Collections Page (`app/collections/page.tsx`)**:
   - Line 50: Reads only `searchParams.get("category")`.
   - Lines 111-133: `filteredProducts` filters only by `selectedCategory`, `selectedFit`, and `selectedSize`. There is no gender parameter reading and no gender filter tab/pill.
4. **Translations (`lib/translations.ts`)**:
   - `Translations` interface lacks gender keys in `nav` and `collections`.

#### Part 2: International Shipping & Checkout
1. **Hardcoded Domestic Shipping**:
   - `app/api/store/orders/route.ts` lines 156-158:
     ```typescript
     const city = String(customer.city || 'Bakı').trim();
     const isFreeZone = /^(bak[ıi]|sumqay[ıi]t)/i.test(city);
     const serverShipping = isFreeZone ? 0 : (serverSubtotal >= 60 ? 0 : 5);
     ```
   - `app/checkout/page.tsx` lines 330-331:
     ```typescript
     const isFreeZone = /^(bak[ıi]|sumqay[ıi]t)/i.test(city.trim());
     const shippingCost = isFreeZone ? 0 : (effectiveSubtotal >= 60 ? 0 : 5);
     ```
2. **Checkout Form Fields (`app/checkout/page.tsx`)**:
   - Lines 261-267: Form fields are `fullName`, `phone` (defaults to `"+994 "`), `email`, `city` (defaults to `"Bakı"`), and `address`.
   - Missing: Country selector dropdown, Postal code / ZIP code field, international phone format handling, international shipping method selection (Standard vs Express DHL/FedEx).
3. **Multi-currency & Geo Support**:
   - `context/CurrencyContext.tsx` and `middleware.ts` already support geo-country cookies (`horwalle_geo_country`), language cookie (`horvvalle_user_language_v1`), and dual pricing (`AZN` vs `USD`).
   - Missing: International shipping rate calculation in USD/AZN, carrier options, and server-side validation rejecting Cash on Delivery for international destinations.

---

## 2. Logic Chain

1. **Build & Type Health**:
   - `npx tsc --noEmit` executes without error, confirming that TypeScript declarations, imports, and strict type constraints across all modules are currently 100% sound.
   - `next build` generates all static and dynamic routes cleanly, confirming the Next.js compilation pipeline is healthy.
   - Any proposed changes to interfaces or components can be reliably verified using `npx tsc --noEmit` and `npm run build`.

2. **Gender Categorization Path**:
   - Supabase schema (`lib/supabase/schema.sql`: 16), backend Admin API (`app/api/admin/[...slug]/route.ts`: 423), and database types (`lib/storeDb.ts`: 23) already recognize `gender: 'men' | 'women' | 'unisex'`.
   - The reason gender categorization was non-functional was purely UI-level:
     - The admin UI modal omitted the gender input and hardcoded `'unisex'` during submit.
     - The storefront header navigation omitted gender links.
     - The collections page omitted gender query parsing and filtering logic.
   - Therefore, adding the selector to `public/admin.html` and `admin-portal/public/index.html`, adding links to `components/Header.tsx`, and adding filter tabs to `app/collections/page.tsx` will complete the end-to-end gender flow without needing breaking database schema changes.

3. **International Shipping Path**:
   - The application already has geo-location detection via `middleware.ts` and `/api/geo`, and currency conversion via `CurrencyContext.tsx`.
   - The domestic-only limitation stems directly from:
     - Hardcoded `customer.city` regex check (`/^(bak[ıi]|sumqay[ıi]t)/i`) in both `app/checkout/page.tsx` and `app/api/store/orders/route.ts`.
     - Absence of country selector, postal code field, and international carrier selection in `app/checkout/page.tsx`.
     - Absence of structured international shipping calculation in `app/api/store/orders/route.ts` and `app/api/checkout/route.ts`.
   - Adding a unified shipping rate configuration (e.g. `lib/shipping/rates.ts` defining domestic vs international DHL/FedEx and standard rates), updating checkout fields, and updating the server calculation will resolve this limitation while preserving domestic rules.

---

## 3. Caveats

1. **ESLint Command (`npm run lint`)**: Running `npm run lint` directly will prompt interactively and fail with code 1 in non-interactive environments because no `.eslintrc.json` is configured. Workers and Reviewers should use `npx tsc --noEmit` and `npm run build` for code quality verification.
2. **Admin Portal Files**: There are two admin files: `public/admin.html` (embedded directly in Next.js at `/admin` via iframe) and `admin-portal/public/index.html` (served on port 3001). Both must be kept synchronized so that gender selection works regardless of entry point.
3. **Automated Unit Tests**: Because the repository lacks an existing test runner like Vitest or Jest, new test verification can be done via custom node verification scripts (e.g. testing shipping rate calculations and filter logic) or by adding a lightweight test harness if requested.

---

## 4. Conclusion

The repository infrastructure is in an excellent, clean state:
- **Build**: Next.js 14.2.35 builds with 0 errors (`npm run build`).
- **Typecheck**: TypeScript 5.4.5 typechecks with 0 errors (`npx tsc --noEmit`).
- **Environment**: Configured with test payment mode (`PAYMENT_MODE=test`, `PAYMENT_PROVIDER=mock`) and active Supabase connection.
- **Database Schema**: Already has `gender` in `lib/supabase/schema.sql` and `lib/storeDb.ts`.
- **Primary Gaps Identified**:
  - `public/admin.html` and `admin-portal/public/index.html` need Gender selector (Kişi / Qadın / Unisex).
  - `components/Header.tsx` needs "Kişi" and "Qadın" navigation links.
  - `app/collections/page.tsx` needs Gender filter tabs and query filtering.
  - `app/checkout/page.tsx` needs Country selector, Postal Code field, and International shipping carrier options (Standard vs DHL Express).
  - `app/api/store/orders/route.ts` and `app/api/checkout/route.ts` need server-side international shipping calculation and cash-on-delivery restrictions for international orders.

---

## 5. Verification Method

To independently verify the infrastructure, build, and typecheck health:

### Verification Commands
```bash
# 1. Verify TypeScript type health across entire codebase
npx tsc --noEmit

# 2. Verify complete Next.js production compilation and static page generation
npm run build

# 3. Verify local development server startup
npm run dev

# 4. Verify admin express portal (port 3001)
npm run admin
```

### Invalidation Conditions
- Any TypeScript error emitted by `npx tsc --noEmit` (exit code !== 0).
- Any Next.js compilation or page-rendering failure during `npm run build`.
- Hardcoded domestic shipping rates applied when `country !== 'AZ'`.
- Missing gender attribute when creating or updating products via admin portal.
