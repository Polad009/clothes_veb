# Test Infrastructure Specification: Gender Categorization & International Shipping

## 1. Test Philosophy & Principles

The test suite for `clothes_veb` enforces an **opaque-box, contract-driven, multi-tier** quality assurance strategy. The goal is to guarantee that both Storefront and Admin systems strictly adhere to interface contracts, boundary rules, and real-world shopping workloads for both domestic Azerbaijani and global international clientele.

### Core Testing Tenets:
1. **Opaque-Box Contract Verification**: Tests validate interfaces, schemas, calculations, state transitions, and observable behavior rather than internal private variables.
2. **Progressive Testability & Isolation**: Tests are self-contained, independent, deterministic, and runnable without relying on external network dependencies or live third-party payment gateways.
3. **Defense-in-Depth Across Four Tiers**:
   - **Tier 1 (Feature Coverage)**: Exhaustive functional verification of individual features (>=5 tests per feature).
   - **Tier 2 (Boundary & Corner Cases)**: Value analysis on thresholds ($150, $200, 60 ₼, zero, negative, extreme subtotals, invalid codes).
   - **Tier 3 (Cross-Feature Combinations)**: Pairwise interactions of destination countries, currencies, delivery carriers, payment methods, and gender filters.
   - **Tier 4 (Real-World Workloads)**: End-to-end customer journey simulations (product discovery -> filtering -> cart additions -> international checkout -> order creation).
4. **Zero Flakiness**: Clean assertions, predictable inputs, synchronous and asynchronous error trapping, and structured reporting.

---

## 2. Feature Inventory & Coverage Matrix

| Feature ID | Feature Name | Target Scope | Tier 1 Tests | Tier 2 Tests | Tier 3 Tests | Tier 4 Scenarios |
|------------|--------------|--------------|--------------|--------------|--------------|-------------------|
| `FEAT-GEND-01` | Admin Gender Selector | `public/admin.html`, `admin-portal/public/index.html` | 6 tests | 3 tests | 4 tests | Scenario 1, 3 |
| `FEAT-GEND-02` | Storefront Navigation Gender Links | `components/Header.tsx`, `lib/translations.ts` | 6 tests | 2 tests | 3 tests | Scenario 1, 2 |
| `FEAT-GEND-03` | Collections Page Gender Filtering | `app/collections/page.tsx`, filtering logic | 8 tests | 5 tests | 6 tests | Scenario 1, 2, 4 |
| `FEAT-GEND-04` | Storefront Product API Gender Filter | `app/api/store/products/route.ts`, `data/storeData.json` | 5 tests | 3 tests | 3 tests | Scenario 1, 4 |
| `FEAT-SHIP-01` | Global Country & Destination Registry | `lib/countries.ts` | 8 tests | 6 tests | 5 tests | Scenario 2, 3, 4 |
| `FEAT-SHIP-02` | Shipping Rate Engine (Tiered Rates) | `lib/shipping.ts` | 10 tests | 12 tests | 8 tests | Scenario 2, 3, 4 |
| `FEAT-SHIP-03` | Payment Method Gating (COD Restriction) | `lib/payments/provider.ts` | 6 tests | 4 tests | 6 tests | Scenario 2, 3, 4 |
| `FEAT-SHIP-04` | Order Schema & Validation Engine | `lib/storeDb.ts`, `app/api/store/orders/route.ts` | 7 tests | 6 tests | 6 tests | Scenario 3, 4 |

---

## 3. Test Architecture & Directory Layout

The testing infrastructure is implemented as a standalone, zero-dependency Node.js ES Module runner with dedicated tier test modules co-located in `tests/`:

```
clothes_veb/
├── TEST_INFRA.md                 # Architecture, specifications, and test philosophy
├── TEST_READY.md                 # Test execution certification & checklist
├── scripts/
│   └── run-e2e-tests.mjs         # CLI Test Runner with CLI flags (--tier=1..4, --all)
└── tests/
    ├── helpers/
    │   ├── test-context.mjs      # In-memory mock DB, fixtures, and assertions
    │   └── contracts.mjs         # Interface schema validators and contracts
    ├── tier1-features/
    │   ├── test-admin-gender.mjs         # Admin panel form, modal, table, badge
    │   ├── test-header-gender-nav.mjs    # Glass navbar, mobile drawer, translations
    │   ├── test-collections-filtering.mjs # Gender filter tabs, inclusive logic
    │   ├── test-product-api-gender.mjs   # API endpoints and product schema
    │   ├── test-country-registry.mjs     # ISO-2 catalog, dial codes, postal requirements
    │   ├── test-shipping-rates.mjs       # Domestic vs international rates & estimates
    │   ├── test-cod-gating.mjs           # Azerbaijan COD permission vs intl rejection
    │   └── test-order-schema.mjs         # Order model and international address fields
    ├── tier2-boundaries/
    │   ├── test-shipping-thresholds.mjs  # $150 standard free, $200 express discount, 60 ₼
    │   ├── test-address-boundaries.mjs   # Missing postal code, invalid ISO-2, malformed phone
    │   ├── test-subtotal-extremes.mjs    # 0 subtotal, decimal precision, extreme order amounts
    │   └── test-gender-query-edges.mjs   # Unknown gender slugs, case insensitivity, empty query
    ├── tier3-combinations/
    │   ├── test-country-currency-matrix.mjs # AZ, US, TR, GB, DE across AZN and USD
    │   ├── test-payment-carrier-matrix.mjs  # COD vs Card vs ApplePay x Standard vs DHL Express
    │   └── test-gender-category-matrix.mjs  # Men/Women/Unisex x T-Shirt/Hoodie/Pants/Accessories
    └── tier4-scenarios/
        ├── test-scenario-baku-domestic.mjs  # Baku resident orders unisex hoodie with COD
        ├── test-scenario-us-intl-dhl.mjs    # US customer orders men vintage polo via DHL Express
        ├── test-scenario-tr-free-intl.mjs   # Turkey customer orders $160 items for Free Int'l Post
        └── test-scenario-admin-lifecycle.mjs # Admin creates Women tee, customer discovers & buys
```

---

## 4. Test Runner CLI Specification

The test runner is invoked via `node scripts/run-e2e-tests.mjs`:

### Usage:
- `node scripts/run-e2e-tests.mjs` (runs all tiers)
- `node scripts/run-e2e-tests.mjs --all` (explicitly runs all tiers)
- `node scripts/run-e2e-tests.mjs --tier=1` (runs only Tier 1 Feature tests)
- `node scripts/run-e2e-tests.mjs --tier=2` (runs only Tier 2 Boundary tests)
- `node scripts/run-e2e-tests.mjs --tier=3` (runs only Tier 3 Combination tests)
- `node scripts/run-e2e-tests.mjs --tier=4` (runs only Tier 4 Real-World Scenarios)
- `node scripts/run-e2e-tests.mjs --filter=<pattern>` (runs tests matching a specific pattern)

### Exit Codes:
- `0`: All executed test assertions passed.
- `1`: One or more test assertions failed.

### Reporting Format:
- Grouped hierarchical suite and test case names.
- Elapsed time per test and total suite duration.
- Detailed diffs and stack traces on assertion failure.
- Summary banner displaying passed/failed counts and pass percentage.

---

## 5. Coverage Thresholds & Quality Gates

To satisfy production deployment readiness, the following thresholds are enforced:
- **Total Test Cases**: Minimum 60 distinct automated test cases across Tiers 1-4.
- **Pass Rate**: 100% pass rate required for all tiers.
- **Zero Regression**: Existing domestic Azerbaijan delivery (Baku free, Sumgayit free, Rayonlar 5 ₼ / free >= 60 ₼) must remain 100% intact.
- **Contract Fidelity**: All data models match `StoreProduct`, `CountryInfo`, `ShippingOption`, and `StoreOrder` defined in `PROJECT.md`.
