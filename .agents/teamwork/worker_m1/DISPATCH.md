## 2026-11-08T18:13:18Z
You are worker_m1, an implementation worker.
Working directory: c:\Users\Elsan\Documents\clothes_veb\.agents\teamwork\worker_m1
Original request path: c:\Users\Elsan\Documents\clothes_veb\.agents\teamwork\ORIGINAL_REQUEST.md
Project scope path: c:\Users\Elsan\Documents\clothes_veb\PROJECT.md
Survey handoff path: c:\Users\Elsan\Documents\clothes_veb\.agents\teamwork\explorer_survey_1\handoff.md

MANDATORY: Read c:\Users\Elsan\Documents\clothes_veb\.agents\teamwork\ORIGINAL_REQUEST.md first before starting work.
Also study c:\Users\Elsan\Documents\clothes_veb\.agents\teamwork\explorer_survey_1\handoff.md which contains exact line numbers, code snippets, and instructions for all files.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

File Ownership (You exclusively own these files; do not touch other files):
- components/Header.tsx
- app/collections/page.tsx
- public/admin.html
- admin-portal/public/index.html
- lib/translations.ts
- app/api/store/products/route.ts

Task: Implement Milestone 1 - Gender Categorization & Filtering:
1. Admin Panel (public/admin.html and admin-portal/public/index.html):
   - In #productForm, add an explicit Gender radio selector group with options: Kişi ('men'), Qadın ('women'), and Unisex ('unisex' default).
   - In openProductModal(), reset selected gender to 'unisex'.
   - In editProduct(id), load the existing p.gender (defaulting to 'unisex').
   - In handleProductFormSubmit(), dynamically read the selected gender value and include it in the product payload (remove any hardcoded 'unisex').
   - In renderProductsTable(), display a clean badge showing Gender (Kişi / Qadın / Unisex).
   - In product table filter toolbar, add a Gender filter dropdown so admins can filter the product catalog by gender.
2. Storefront Header Navigation (components/Header.tsx):
   - Add navigation links for "Kişi" (/collections?gender=men) and "Qadın" (/collections?gender=women) to both the desktop glass pill navbar and the mobile drawer menu.
   - Update isLinkActive to recognize gender links when /collections?gender=men or women is visited.
   - Add multilingual translations in lib/translations.ts across all supported languages (az, en, ru, tr).
3. Storefront Collections Page (app/collections/page.tsx):
   - Read the gender query parameter from searchParams (defaulting to 'all').
   - Add interactive Gender filter tabs (Hamısı / Kişi / Qadın / Unisex).
   - Integrate Gender filter options into both the Desktop filter sidebar and the Mobile filter drawer.
   - Apply proper filtering logic in useMemo: 'men' includes items tagged 'men' and 'unisex'; 'women' includes items tagged 'women' and 'unisex'; 'unisex' matches strictly 'unisex'.
   - Update collection title/heading to reflect selected gender (e.g., Kişi Kolleksiyası / Qadın Kolleksiyası).
4. Storefront API (app/api/store/products/route.ts):
   - Ensure products query filter supports gender parameter consistently (including unisex for men/women).
5. Build and verify:
   - Run `npx tsc --noEmit` and `npm run build`. Both MUST succeed with exit code 0.
6. Write your comprehensive report to c:\Users\Elsan\Documents\clothes_veb\.agents\teamwork\worker_m1\handoff.md and notify the caller when done.
