# Adversarial Challenge & Verification Report: Gender Categorization & Filtering

**Author**: `challenger_1` (Critic & Specialist)  
**Date**: 2026-11-08  
**Scope**: Gender Categorization & Filtering (M1 / M4 Hardening)  
**Verdict**: **REQUEST_CHANGES**  

---

## 1. Observation

### Empirical Test Execution Results
An adversarial stress test suite was authored in `tests/test-gender-stress.mjs` and executed via Node.js (`node tests/test-gender-stress.mjs`):

```text
======================================================================
  CHALLENGER_1: Gender Categorization & Filtering Stress Harness
======================================================================

▶ Area 1: Case-insensitivity & Whitespace Stress Testing
  ✗ ADV-GEND-01: Storefront Collections with uppercase "MEN" query param
    Error: VULNERABILITY DETECTED: /collections?gender=MEN returned 0 items instead of 6. Real code lacks .toLowerCase() on searchParams.get("gender")! Expected 6, received 0
  ✗ ADV-GEND-02: Storefront Collections with padded whitespace "  women  "
    Error: VULNERABILITY DETECTED: /collections?gender=  women  returned 0 items instead of 6. Real code lacks .trim() on searchParams.get("gender")! Expected 6, received 0
  ✓ ADV-GEND-03: Storefront Collections with lowercase exact "unisex"
  ✗ ADV-GEND-04: Storefront API GET /api/store/products?gender=MEN
    Error: VULNERABILITY DETECTED: API route GET /api/store/products?gender=MEN returned 0 items instead of 6. API lacks .toLowerCase()! Expected 6, received 0
  ✗ ADV-GEND-05: Storefront API GET /api/store/products?gender=  women  
    Error: VULNERABILITY DETECTED: API route GET /api/store/products?gender=  women  returned 0 items instead of 6. API lacks .trim()! Expected 6, received 0
  ✗ ADV-GEND-06: Header isLinkActive with uppercase or whitespace query param
    Error: VULNERABILITY DETECTED: Header Kişi link is NOT active when URL has ?gender=MEN because Header.tsx compares currentGender === item.genderId without lowercasing! Expected true, received false

▶ Area 2: Combined Multi-Criterion Filter Intersections
  ✓ ADV-COMB-01: Combined Category (koynek) + Gender (men) + Size (XL)
  ✓ ADV-COMB-02: Combined Category (hudi) + Gender (women) + Size (S)
  ✓ ADV-COMB-03: Combined Category + Gender + Fit (Exact match)
  ✓ ADV-COMB-04: Non-existent multi-filter intersection returns empty array gracefully
  ✗ ADV-COMB-05: Product with empty fit does NOT falsely match a specific fit filter
    Error: BUG DETECTED: Product with empty fit: "" incorrectly matched specific fit filter because sFit.includes("") is always true in page.tsx:179!

▶ Area 3: Inclusive Filtering Boundary Strictness
  ✓ ADV-BND-01: Men filter NEVER leaks women-only products
  ✓ ADV-BND-02: Women filter NEVER leaks men-only products
  ✓ ADV-BND-03: Unisex products appear in BOTH men and women filter results
  ✓ ADV-BND-04: Unisex filter NEVER leaks pure men or pure women products
  ✓ ADV-BND-05: Randomized stress catalog (100 products) boundary verification

▶ Area 4: Admin Form Lifecycle & State Persistence
  ✓ ADV-ADM-01: Admin HTML contains correct modal structure & radio button definitions
  ✓ ADV-ADM-02: Modal Reset: openProductModal sets unisex to checked and unchecks others
  ✓ ADV-ADM-03: Edit Product with "women" sets women radio to checked
  ✓ ADV-ADM-04: Edit Product with invalid/corrupt gender falls back safely to unisex
  ✓ ADV-ADM-05: Form Submission extracts checked gender and persists across simulated cycle

▶ Area 5: Storefront API Response Integrity
  ✓ ADV-API-01: API returns valid schema contract for all filtered items
  ✓ ADV-API-02: API with limit preserves gender constraint without truncation bias
  ✓ ADV-API-03: API with unknown gender parameter returns empty array safely
  ✓ ADV-API-04: API with all returns full catalog
  ✓ ADV-API-05: API with undefined/null gender returns full catalog

======================================================================
  STRESS TEST EXECUTION SUMMARY
======================================================================
  Total Stress Tests Run: 26
  Passed:                 20
  Failed:                 6
```

### Specific Code Observations

1. **`app/collections/page.tsx` (Lines 50 & 161–171)**:
   ```typescript
   50: const selectedGender = searchParams.get("gender") || "all";
   ...
   161: if (selectedGender !== "all") {
   162:   if (selectedGender === "men") {
   163:     if (product.gender !== "men" && product.gender !== "unisex") return false;
   164:   } else if (selectedGender === "women") {
   165:     if (product.gender !== "women" && product.gender !== "unisex") return false;
   166:   } else if (selectedGender === "unisex") {
   167:     if (product.gender !== "unisex") return false;
   168:   } else if (product.gender !== selectedGender) {
   169:     return false;
   170:   }
   171: }
   ```
   - When a user enters `/collections?gender=MEN`, `selectedGender` is `"MEN"`.
   - `selectedGender !== "men"` is true, `selectedGender !== "women"` is true, `selectedGender !== "unisex"` is true.
   - The code reaches line 168: `product.gender !== selectedGender` (`"men" !== "MEN"` is true) -> returns `false`.
   - Result: **0 products rendered** on `/collections?gender=MEN`.
   - Furthermore, in lines 249–279, title selection falls into the fallback branch displaying `"Unisex Kolleksiyası"`, while no filter pill is highlighted as active.

2. **`app/api/store/products/route.ts` (Lines 13 & 74–84)**:
   ```typescript
   13: const gender = searchParams.get('gender');
   ...
   74: if (gender && gender !== 'all') {
   75:   if (gender === 'men') {
   76:     products = products.filter(p => p.gender === 'men' || p.gender === 'unisex');
   77:   } else if (gender === 'women') {
   78:     products = products.filter(p => p.gender === 'women' || p.gender === 'unisex');
   79:   } else if (gender === 'unisex') {
   80:     products = products.filter(p => p.gender === 'unisex');
   81:   } else {
   82:     products = products.filter(p => p.gender === gender);
   83:   }
   84: }
   ```
   - When calling `GET /api/store/products?gender=MEN`, `gender` is `"MEN"`.
   - It bypasses lines 75–80 and executes line 82: `products.filter(p => p.gender === "MEN")`.
   - Result: Returns an empty JSON array `[]` (0 products).

3. **`components/Header.tsx` (Lines 37 & 140–143)**:
   ```typescript
   37: const currentGender = searchParams?.get("gender") || null;
   ...
   140: const isLinkActive = (item: { categoryId?: string; genderId?: string; href: string }) => {
   141:   if (item.genderId) {
   142:     return pathname === "/collections" && currentGender === item.genderId;
   143:   }
   ```
   - When query param is uppercase or has spaces (`?gender=MEN`), `currentGender === "men"` evaluates to `false`.
   - Result: Neither "Kişi" nor "Qadın" is highlighted in desktop glass navigation or mobile drawer.

4. **False Positive in Worker E2E Suite (`tests/tier2-boundaries/test-gender-query-edges.mjs`)**:
   ```javascript
   // tests/tier2-boundaries/test-gender-query-edges.mjs:10-13
   test('BVA-GEND-01: Case-insensitivity support for MEN, Women, and UNISEX', () => {
     const upperMen = filterProductsByGender(MOCK_PRODUCTS, 'MEN');
     const lowerMen = filterProductsByGender(MOCK_PRODUCTS, 'men');
     assertEqual(upperMen.length, lowerMen.length, 'MEN must match men');
   ```
   - `filterProductsByGender` was imported from `tests/helpers/test-context.mjs`, which contained:
     ```javascript
     const g = genderFilter.toLowerCase().trim();
     ```
   - The test verified its own mock function rather than the production code in `app/collections/page.tsx` or `app/api/store/products/route.ts`.

5. **Empty `fit` Bypass in `app/collections/page.tsx` (Lines 176–182)**:
   ```typescript
   176: if (selectedFit !== "all") {
   177:   const pFit = (product.fit || "").toLowerCase();
   178:   const sFit = selectedFit.toLowerCase();
   179:   if (pFit !== sFit && !pFit.includes(sFit) && !sFit.includes(pFit)) {
   180:     return false;
   181:   }
   182: }
   ```
   - If a product has empty or undefined fit (`pFit = ""`), in JavaScript `sFit.includes("")` is always `true`.
   - Therefore, `!sFit.includes(pFit)` evaluates to `false`, and the condition `pFit !== sFit && !pFit.includes(sFit) && !sFit.includes(pFit)` evaluates to `false`.
   - Result: A product without a specified fit erroneously matches every specific fit filter (e.g. "Hody qalın (3iplik)").

---

## 2. Logic Chain

1. **From Observation 1 & 2**: HTTP query parameters in web applications often arrive in varying casings or URL-encoded whitespace (e.g. from external referral links, search marketing, or manual typing). Both `app/collections/page.tsx` and `app/api/store/products/route.ts` consume `searchParams.get('gender')` verbatim without `.toLowerCase().trim()`.
2. **From Observation 1**: Because `selectedGender` does not equal `'men'`, `'women'`, or `'unisex'`, the fallback comparison `product.gender !== selectedGender` rejects all catalog items whose gender is stored as `'men'`, `'women'`, or `'unisex'`.
3. **From Observation 3**: The Header navigation relies on strict string equality (`currentGender === item.genderId`), which similarly breaks active route detection on non-normalized query strings.
4. **From Observation 4**: The 100% pass certification in `TEST_READY.md` masked this defect because the boundary test exercised an internal helper function with `.toLowerCase().trim()` rather than the actual application route.
5. **From Observation 5**: The substring match condition `!sFit.includes(pFit)` contains a boolean logic flaw where an empty string submatch unconditionally satisfies the filter bypass.
6. **Positive Findings**: 
   - When normalized inputs are provided, the inclusive filtering invariant is strictly honored: pure 'men' products NEVER appear on the 'women' page, pure 'women' products NEVER appear on the 'men' page, and 'unisex' products correctly appear on both.
   - The Admin panel lifecycle across both `public/admin.html` and `admin-portal/public/index.html` functions correctly: modal opening resets to `unisex`, editing a product checks the appropriate radio, saving persists the choice to the database, and re-opening displays the preserved state.

---

## 3. Caveats

- **Scope boundaries**: The database schema in PostgreSQL (`lib/supabase/schema.sql`) enforces `CHECK (gender IN ('men', 'women', 'unisex'))`. The vulnerability is localized to client/server query parameter sanitization, not database storage integrity.
- **Review-only constraint**: In accordance with the Challenger protocol, no implementation files were modified. All defects are reported with exact proposed diffs.

---

## 4. Conclusion & Actionable Recommendations

**Verdict**: **REQUEST_CHANGES**

The implementation is functionally sound in its core data modeling and admin workflows, but exhibits 2 critical bugs that must be resolved:
1. Lack of query parameter normalization (`.toLowerCase().trim()`) causing 0-result drops on case or whitespace variation across Collections, Header, and Storefront API.
2. An empty string bypass bug in `app/collections/page.tsx` fit filtering.

### Required Remediations

#### Patch 1: `app/collections/page.tsx` (Lines 50 & 176–182)
```typescript
// Replace line 50:
const rawGender = searchParams.get("gender") || "all";
const selectedGender = rawGender.toLowerCase().trim() || "all";

// Replace lines 176-182:
if (selectedFit !== "all") {
  const pFit = (product.fit || "").toLowerCase().trim();
  const sFit = selectedFit.toLowerCase().trim();
  if (!pFit || (pFit !== sFit && !pFit.includes(sFit) && !sFit.includes(pFit))) {
    return false;
  }
}
```

#### Patch 2: `app/api/store/products/route.ts` (Line 13)
```typescript
// Replace line 13:
const rawGender = searchParams.get('gender');
const gender = rawGender ? rawGender.toLowerCase().trim() : null;
```

#### Patch 3: `components/Header.tsx` (Line 37)
```typescript
// Replace line 37:
const rawGender = searchParams?.get("gender");
const currentGender = rawGender ? rawGender.toLowerCase().trim() : null;
```

---

## 5. Verification Method

To verify these findings and confirm any subsequent fix:

1. **Execute the adversarial stress test harness**:
   ```bash
   node tests/test-gender-stress.mjs
   ```
   - **Current result**: 6 failures out of 26 tests.
   - **Target pass criteria**: 26 passed, 0 failed, exit code 0.

2. **Execute the full E2E test suite**:
   ```bash
   node scripts/run-e2e-tests.mjs
   ```

3. **Inspect files**:
   - `app/collections/page.tsx` (lines 50, 160-185)
   - `app/api/store/products/route.ts` (lines 13, 74-84)
   - `components/Header.tsx` (lines 37, 140-143)
