# Execution Plan — Gender Categorization & International Shipping

## Objective
Implement end-to-end gender categorization (Admin Panel + Storefront Navigation & Filters) and comprehensive International Shipping & Checkout (Country selector, international address, postal/zip code, standard & express shipping rate calculations) for the luxury fashion e-commerce platform `clothes_veb`.

---

## Phase 0: Survey & Codebase Mapping (Parallel Exploration)
Per Project Pattern Step 0, spawn 3 parallel `teamwork_explorer` subagents:
1. **Explorer 1 (`explorer_gender`)**:
   - Locate and analyze product schemas (Prisma/DB/types/interfaces).
   - Inspect Admin Panel product creation and editing forms.
   - Inspect Storefront Header navigation and Collections page filtering logic.
   - Document required changes for Gender (Kişi / Qadın / Unisex).
2. **Explorer 2 (`explorer_shipping`)**:
   - Locate and analyze checkout flow, cart state management, and delivery calculation.
   - Inspect current Azerbaijan domestic delivery logic (rayonlar, metro, Bakı çatdırılma).
   - Analyze order placement API/actions and order data model.
   - Document architecture for international country selection, postal code, international address, and standard/express shipping rates (DHL/FedEx style tiered calculation).
3. **Explorer 3 (`explorer_infra_test`)**:
   - Inspect `package.json`, build/dev scripts, framework (Next.js/React/Vite etc.), TypeScript config.
   - Identify existing test runners (Vitest, Jest, Playwright, etc.) and verification mechanisms.
   - Identify linters, formatters, and environment variables.

---

## Phase 1: Synthesis & PROJECT.md
Aggregate reports from the 3 explorers to produce `PROJECT.md`:
- Architecture & module boundaries
- Feature Inventory (every requirement mapped to milestone)
- Milestones and dependency graph
- Interface Contracts (Gender schema & API, Shipping API & order types)
- Code Layout and file ownership boundaries

---

## Phase 2: Dual Track Execution
### Track A: E2E Testing Track
- Test infrastructure setup (`TEST_INFRA.md`).
- Tier 1: Feature coverage (Gender filtering, gender admin form, country selector, address form, shipping calculations).
- Tier 2: Boundary & corner cases (missing postal code, unknown country, invalid gender, 0 weight/price thresholds).
- Tier 3: Pairwise combinations (International shipping + different gender categories + discount/promo).
- Tier 4: Real-world checkout scenarios.
- Publish `TEST_READY.md`.

### Track B: Implementation Track
- **Milestone 1**: Gender Categorization
  - DB/Schema updates (Kişi, Qadın, Unisex).
  - Admin Panel product create/edit form gender selector.
  - Storefront Header navigation menu links (Kişi / Qadın).
  - Storefront Collections page filter tabs & query params.
  - Gated by: Explorer -> Worker -> 2 Reviewers -> 2 Challengers -> Forensic Auditor.
- **Milestone 2**: International Shipping & Rate Calculation Engine
  - Country list & configuration (Europe, US, Turkey, CIS, GCC, Rest of World).
  - Shipping options (Standard International vs DHL/FedEx Express International).
  - Dynamic rate calculation based on destination, weight/price, and delivery estimates.
  - Gated by: Explorer -> Worker -> 2 Reviewers -> 2 Challengers -> Forensic Auditor.
- **Milestone 3**: Storefront Checkout & Order Integration
  - Checkout form internationalization: Country dropdown, state/province, postal/zip code, international phone prefix.
  - Shipping method selector displaying live rates and delivery time estimates.
  - Order creation API updating order record with international shipping details.
  - Gated by: Explorer -> Worker -> 2 Reviewers -> 2 Challengers -> Forensic Auditor.
- **Final Milestone**:
  - Phase 1: 100% pass on E2E test suite (Tiers 1-4).
  - Phase 2: Tier 5 Adversarial Coverage Hardening (Challenger -> Worker -> Reviewer).

---

## Phase 3: Final Verification & Hand-off
- Full test pass report.
- Zero integrity violations verified by Forensic Auditor.
- Soft/Hard handoff generated and status communicated to parent agent.
