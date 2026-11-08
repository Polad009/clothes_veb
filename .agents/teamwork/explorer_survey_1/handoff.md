# Comprehensive Investigation Report: Gender Categorization & Filtering Architecture

## 1. Observation

Direct observations from the codebase investigation:

### 1.1 Product Data Model & Database Schema
1. **Supabase PostgreSQL Schema (`lib/supabase/schema.sql`)**:
   - Lines 15–16:
     ```sql
     category TEXT NOT NULL CHECK (category IN ('tshirt', 'hoodie', 'longsleeve', 'accessories')),
     gender TEXT NOT NULL DEFAULT 'unisex' CHECK (gender IN ('men', 'women', 'unisex')),
     ```
   - Line 128:
     ```sql
     CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
     ```
   - Verbatim check: The `gender` column **already exists** in PostgreSQL with a `CHECK (gender IN ('men', 'women', 'unisex'))` constraint and an existing B-tree index.
2. **TypeScript Interface for Store Product (`lib/storeDb.ts`)**:
   - Lines 18–25:
     ```typescript
     export interface StoreProduct {
       id: string;
       slug: string;
       name: string;
       refCode?: string;
       gender: 'men' | 'women' | 'accessories' | 'unisex' | string;
       category: 'koynek' | 'hudi' | 'salvar' | 'aksesuar' | string;
       fit: string;
     ```
3. **Frontend Product Interface (`data/products.ts`)**:
   - Lines 13–25:
     ```typescript
     export interface Product {
       id: string;
       slug: string;
       name: string;
       refCode?: string;
       description: string;
       price: number;
       internationalPrice?: number;
       compareAtPrice?: number;
       badge?: string;
       category: 'koynek' | 'hudi' | 'salvar' | 'aksesuar' | string;
       gender: 'men' | 'women' | 'unisex' | string;
     ```
4. **Bundled / Local Mock Database (`data/storeData.json`)**:
   - Line 101: `"gender": "unisex",` (for product `horwalle-angel-dust-vintage-hoodie`)
   - Line 149: `"gender": "unisex",` (for product `horwalle-angelus-heavyweight-vintage-polo`)
   - Line 227: `"gender": "unisex",` (for product `-stay-focused-bear-qara-hudi`)
   - Verbatim check: All 3 active products in `data/storeData.json` have `"gender": "unisex"`.
5. **Client-Side State Normalization (`context/StoreDataContext.tsx`)**:
   - Line 53:
     ```typescript
     gender: p.gender || "unisex",
     ```
   - Verbatim check: Products are automatically defaulted to `"unisex"` if `gender` is falsy or omitted.

---

### 1.2 Admin Panel Product Creation & Editing
1. **Admin Page Structure (`app/admin/page.tsx`)**:
   - Lines 55–65:
     ```typescript
     const iframeSrc = `/admin.html?access=${encodeURIComponent(expectedKey)}&${cacheBuster}`;
     return (
       <div className="fixed inset-0 z-[999999] w-screen h-screen bg-[#F8F9FA] overflow-hidden m-0 p-0">
         <iframe
           src={iframeSrc}
           className="w-full h-full border-none m-0 p-0 block"
           title="HORWALLE İdarəetmə Portalı"
         />
       </div>
     );
     ```
   - Verbatim check: The Next.js `/admin` route mounts `public/admin.html` inside an isolated full-screen iframe. A standalone server also exists in `admin-portal/server.js` serving `admin-portal/public/index.html`.
2. **Product Form in Admin Portal (`public/admin.html`)**:
   - Lines 2066–2080:
     ```html
     <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
       <div>
         <label class="block font-bold text-slate-700 mb-1">Məhsulun Adı *</label>
         <input type="text" id="prodName" required placeholder="məs. HORWALLE Angelus Vintage Polo"
           class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
       </div>
       <div>
         <label class="block font-bold text-slate-700 mb-1">Kateqoriya *</label>
         <select id="prodCategory" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
           <option value="koynek">T-Shirt & Köynək</option>
           <option value="hudi">Hudi & Sviter</option>
           <option value="salvar">Şalvar & Cins</option>
           <option value="aksesuar">Aksesuar</option>
         </select>
       </div>
     ```
   - Verbatim check: The form contains `prodName` and `prodCategory`, but completely lacks a `prodGender` element.
3. **Product Modal Reset Logic (`public/admin.html`)**:
   - Lines 4101–4125 (`openProductModal()`):
     ```javascript
     document.getElementById('prodEditId').value = '';
     document.getElementById('prodName').value = '';
     document.getElementById('prodPrice').value = '';
     ```
     `prodGender` is neither reset nor initialized.
4. **Product Edit Population Logic (`public/admin.html`)**:
   - Lines 4127–4137 (`editProduct(id)`):
     ```javascript
     document.getElementById('prodEditId').value = p.id;
     document.getElementById('prodName').value = p.name || '';
     document.getElementById('prodCategory').value = p.category || 'koynek';
     ```
     `prodGender` is not populated from `p.gender`.
5. **Product Form Submit Payload (`public/admin.html`)**:
   - Lines 4537–4590 (`handleProductFormSubmit()`):
     ```javascript
     const name = document.getElementById('prodName').value.trim();
     const category = document.getElementById('prodCategory').value;
     ...
     const payload = {
       ...(existing || {}),
       id: id || undefined,
       slug: existing?.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
       name,
       category,
       price,
       internationalPrice,
       compareAtPrice: compareAtPrice,
       ...
       gender: 'unisex',
     };
     ```
   - Verbatim check: Line 4589 **hardcodes** `gender: 'unisex'`.
6. **Product Listing Table (`public/admin.html`)**:
   - Lines 2700–2753 (`renderProductsTable()`):
     - Displays `Image`, `Name / Code`, `Category` (`p.category`), `Price`, `Stock Status`, `Colors`, and `Actions`.
     - It does NOT display a Gender badge or column.
   - Lines 2755–2770 (`filterProductsTable()`):
     - Only filters by `productSearchInput` and `productCategoryFilter`. There is no gender filter dropdown.
7. **Standalone Admin Portal (`admin-portal/public/index.html`)**:
   - Lines 1320–1335 (HTML modal), line 2475 (`editProduct`), line 2512 (`gender: 'unisex'` in submit payload). It mirrors `public/admin.html` and also hardcodes `gender: 'unisex'`.

---

### 1.3 Storefront Navigation & Header Menu
1. **Header Navigation Links (`components/Header.tsx`)**:
   - Lines 128–135:
     ```typescript
     const navLinks = [
       { label: t.nav.shirts, href: "/collections?category=koynek", categoryId: "koynek" },
       { label: t.nav.hoodies, href: "/collections?category=hudi", categoryId: "hudi" },
       { label: t.nav.pants, href: "/collections?category=salvar", categoryId: "salvar" },
       { label: t.nav.accessories, href: "/collections?category=aksesuar", categoryId: "aksesuar" },
       { label: t.nav.collection, href: "/collections", categoryId: "all" },
       { label: t.nav.track, href: "/track", categoryId: "track" },
     ];
     ```
   - Verbatim check: The primary navigation bar only provides category links (`koynek`, `hudi`, `salvar`, `aksesuar`, `all`). There are no links for `Kişi` (Men) or `Qadın` (Women).
2. **Active Link Indicator (`components/Header.tsx`)**:
   - Lines 137–151:
     ```typescript
     const isLinkActive = (categoryId: string, href: string) => {
       if (categoryId !== "all") {
         if (pathname === "/collections" && currentCategory === categoryId) {
           return true;
         }
         if (pathname === "/" && categoryId === "koynek") {
           return true;
         }
         return false;
       }
       if (categoryId === "all") {
         return pathname === "/collections" && (!currentCategory || currentCategory === "all");
       }
       return false;
     };
     ```
   - Verbatim check: `isLinkActive` only checks `currentCategory` and ignores any `gender` query parameter.
3. **Mobile Drawer Menu (`components/Header.tsx`)**:
   - Lines 480–535: Renders the same `navLinks` list with staggered cascading animations.

---

### 1.4 Storefront Collections Page & Product Filtering
1. **Query Parameter Extraction (`app/collections/page.tsx`)**:
   - Lines 47–50:
     ```typescript
     const searchParams = useSearchParams();
     const { products } = useStoreData();
     const { t, language } = useLanguage();
     const selectedCategory = searchParams.get("category") || "all";
     ```
   - Verbatim check: `searchParams.get("gender")` is NOT read.
2. **Category Tabs (`app/collections/page.tsx`)**:
   - Lines 74–80:
     ```typescript
     const categories = [
       { id: "all", label: t.collections?.allModels || "Bütün modellər" },
       { id: "koynek", label: t.collections?.shirts || "T-Shirt & köynək" },
       { id: "hudi", label: t.collections?.hoodies || "Hudi & sviter" },
       { id: "salvar", label: t.collections?.pants || "Şalvar & şortik" },
       { id: "aksesuar", label: t.collections?.accessories || "Aksesuarlar" },
     ];
     ```
   - Lines 282–311: Horizontal pill tabs only switch `category`. There are NO Gender filter tabs (`Kişi`, `Qadın`, `Unisex`).
3. **Product Filtering Logic (`app/collections/page.tsx`)**:
   - Lines 111–133:
     ```typescript
     const filteredProducts = useMemo(() => {
       return products.filter((product) => {
         if (selectedCategory !== "all" && product.category !== selectedCategory) {
           return false;
         }
         if (selectedFit !== "all") {
           const pFit = (product.fit || "").toLowerCase();
           const sFit = selectedFit.toLowerCase();
           if (pFit !== sFit && !pFit.includes(sFit) && !sFit.includes(pFit)) {
             return false;
           }
         }
         if (selectedSize !== "all" && !product.sizes.includes(selectedSize)) {
           return false;
         }
         return true;
       }).sort(...);
     }, [products, selectedCategory, selectedFit, selectedSize, sortBy]);
     ```
   - Verbatim check: `product.gender` is completely ignored during client-side filtering.
4. **Desktop Sidebar & Mobile Drawer Filters (`app/collections/page.tsx`)**:
   - Lines 321–425 (Desktop) & Lines 474–640 (Mobile): Filters exist for `Kateqoriya` (Category), `Ölçü` (Size), and `Siluet & Kəsim` (Fit). There is NO section for `Cins` (Gender).

---

### 1.5 Backend APIs & Server Endpoints
1. **Admin Product Mutation API (`app/api/admin/[...slug]/route.ts`)**:
   - Lines 112: In `GET /api/admin/data`: `gender: sp.gender || 'unisex'`
   - Lines 310–341: In `POST /api/admin/products`:
     ```typescript
     db.products[existingIndex] = {
       ...db.products[existingIndex],
       ...product,
       price: Number(product.price) || 0,
     };
     ```
   - Lines 418–448: In Supabase update & insert:
     ```typescript
     // Update
     await supabaseServer.from('products').update({
       name: product.name,
       price: Number(product.price) || 0,
       category: product.category || existingSupa.category || 'koynek',
       gender: product.gender || existingSupa.gender || 'unisex',
       ...
     }).eq('id', existingSupa.id);

     // Insert
     await supabaseServer.from('products').insert({
       slug: product.slug,
       name: product.name,
       price: Number(product.price) || 0,
       category: product.category || 'koynek',
       gender: product.gender || 'unisex',
       ...
     });
     ```
   - Verbatim check: The Admin API already receives `product.gender` and persists it directly into the Supabase `products` table and `storeData.json`.
2. **Storefront Product Fetch API (`app/api/store/products/route.ts`)**:
   - Lines 12–13:
     ```typescript
     const { searchParams } = new URL(req.url);
     const gender = searchParams.get('gender');
     ```
   - Lines 74–76:
     ```typescript
     if (gender && gender !== 'all') {
       products = products.filter(p => p.gender === gender || p.gender === 'accessories');
     }
     ```
   - Lines 215 & 225: Also supports `gender: product.gender || 'unisex'`.
3. **Storefront Unified Data Route (`app/api/store/data/route.ts`)**:
   - Line 43:
     ```typescript
     gender: sp.gender || 'unisex',
     ```
4. **Supabase Helper Library (`lib/supabase/products.ts`)**:
   - Lines 18–22:
     ```typescript
     if (filters?.gender && filters.gender !== "all") {
       products = products.filter(
         (p) => p.gender === filters.gender || p.gender === "unisex"
       );
     }
     ```

---

## 2. Logic Chain

From the direct observations:

1. **Schema Readiness**:
   - `lib/supabase/schema.sql` (Line 16) already defines `gender TEXT NOT NULL DEFAULT 'unisex' CHECK (gender IN ('men', 'women', 'unisex'))`.
   - `data/products.ts` (Line 24) and `lib/storeDb.ts` (Line 23) already type `gender` as `'men' | 'women' | 'unisex'`.
   - *Inference*: No database schema migration or altering of columns is required for the `products` table. The supported values are strictly defined as `'men'`, `'women'`, and `'unisex'`.

2. **Admin Panel Bottleneck**:
   - In `public/admin.html` (and `admin-portal/public/index.html`), `handleProductFormSubmit()` line 4589 explicitly hardcodes `gender: 'unisex'`.
   - Form `#productForm` (line 2073) only exposes `prodCategory` and does not provide an input/selector for Gender.
   - *Inference*: Products saved through the Admin Portal are always forced to `"unisex"`, preventing store admins from tagging items as Kişi (`men`) or Qadın (`women`).
   - *Required Action*:
     - In `#productForm`, add an explicit Gender selector with the three options:
       - 🔘 Kişi (`men`)
       - 🔘 Qadın (`women`)
       - 🔘 Unisex (`unisex`)
     - Update `openProductModal()` to default to `'unisex'`.
     - Update `editProduct(id)` to load `p.gender || 'unisex'`.
     - In `handleProductFormSubmit()`, read the selected gender instead of hardcoding `'unisex'`.
     - In `renderProductsTable()`, render a badge for Gender (Kişi / Qadın / Unisex).
     - In `filterProductsTable()`, add a Gender filter dropdown so admins can filter their catalog by gender.
     - Keep `admin-portal/public/index.html` synchronized.

3. **Storefront Header Navigation Gap**:
   - `components/Header.tsx` lines 128–135 only list categories: `shirts`, `hoodies`, `pants`, `accessories`, `collection`, `track`.
   - *Inference*: Visitors have no entry point to browse products specifically for Men or Women from the top navigation.
   - *Required Action*:
     - Add navigation links for `Kişi` (`/collections?gender=men`) and `Qadın` (`/collections?gender=women`) (and optionally `Unisex` `/collections?gender=unisex`).
     - Update `isLinkActive` to check `currentGender === link.genderId` when `/collections?gender=...` is active.
     - Ensure both desktop glass pill navbar and mobile drawer menu render these links.
     - Add translations for `men`, `women`, `unisex` in `lib/translations.ts` across `az`, `en`, `ru`, `tr`.

4. **Collections Page Filter Tabs & Logic Gap**:
   - `app/collections/page.tsx` line 50 only reads `category`, and line 112 only filters by `category`.
   - *Inference*: When a user navigates to `/collections?gender=men` or `/collections?gender=women`, the page currently ignores the query parameter and shows all products regardless of gender.
   - *Required Action*:
     - Read `const selectedGender = searchParams.get("gender") || "all";`.
     - Add dedicated Gender filter tabs: `Hamısı` (`all`), `Kişi` (`men`), `Qadın` (`women`), `Unisex` (`unisex`).
     - Add Gender filter options in the Desktop Filter Sidebar (lines 337–360) and Mobile Filter Drawer (lines 474–640).
     - In `filteredProducts` (line 112):
       ```typescript
       if (selectedGender !== "all") {
         if (selectedGender === "men") {
           if (product.gender !== "men" && product.gender !== "unisex") return false;
         } else if (selectedGender === "women") {
           if (product.gender !== "women" && product.gender !== "unisex") return false;
         } else if (selectedGender === "unisex") {
           if (product.gender !== "unisex") return false;
         }
       }
       ```
       *(Note: In luxury streetwear, unisex pieces should naturally display under both Men and Women collections unless strict exact matching is requested. When "Unisex" tab is chosen, only pure unisex pieces are displayed).*
     - Update page heading and subtitle (lines 187–252) to dynamically say "Kişi Kolleksiyası" / "Qadın Kolleksiyası" / "Unisex Kolleksiyası" when filtered by gender.

5. **API & Store Synchronization**:
   - `app/api/store/products/route.ts` line 75 currently filters: `p.gender === gender || p.gender === 'accessories'`.
   - *Inference*: To remain completely consistent with `lib/supabase/products.ts` (line 20) and `app/collections/page.tsx`, `app/api/store/products/route.ts` should also include unisex items when `gender === 'men'` or `gender === 'women'`.

---

## 3. Caveats

1. **Existing Catalog Products**:
   - All 3 existing products in `data/storeData.json` (`horwalle-angel-dust-vintage-hoodie`, `horwalle-angelus-heavyweight-vintage-polo`, and `-stay-focused-bear-qara-hudi`) currently have `"gender": "unisex"`.
   - If an admin tests the store before adding or updating products, selecting "Kişi" or "Qadın" will display these products because they are unisex (under inclusive filtering). If strict filtering were used, 0 products would show until an admin edits a product's gender in the admin panel.
2. **Inclusive vs. Strict Filtering**:
   - Standard fashion e-commerce practice: Men (`men` + `unisex`), Women (`women` + `unisex`), Unisex (strictly `unisex`). This ensures unisex luxury apparel is discoverable by both male and female shoppers. The recommendations in this report follow this standard while allowing exact unisex isolation.
3. **Dual Admin Entrypoints**:
   - The app has two admin entrypoints: Next.js `/admin` which embeds `/admin.html`, and `admin-portal/server.js` on port 3001 serving `admin-portal/public/index.html`. Both files must receive the UI updates to avoid discrepancies.

---

## 4. Conclusion & Actionable Recommendations

### 4.1 Architecture Summary Table

| Layer | File Path | Existing State | Required Modification |
|---|---|---|---|
| **Database Schema** | `lib/supabase/schema.sql` (line 16) | Column `gender TEXT DEFAULT 'unisex' CHECK (gender IN ('men', 'women', 'unisex'))` exists | No schema changes needed. Existing values: `'men'`, `'women'`, `'unisex'`. |
| **Data Types** | `lib/storeDb.ts` (line 23), `data/products.ts` (line 24) | `gender: 'men' \| 'women' \| 'unisex' \| string` defined | Already typed and ready. |
| **Admin UI Form** | `public/admin.html` (lines 2073-2079), `admin-portal/public/index.html` (line 1320) | No gender field in `#productForm` | Add Gender selector (Kişi / Qadın / Unisex) with radio pills or select dropdown. |
| **Admin Controller** | `public/admin.html` (lines 4101, 4127, 4589) | `openProductModal` ignores gender; `editProduct` ignores gender; `handleProductFormSubmit` hardcodes `gender: 'unisex'` | Reset to `'unisex'`, populate from `p.gender`, read value dynamically in payload. |
| **Admin Table** | `public/admin.html` (lines 2700, 2755) | Table has no gender column; filter has no gender dropdown | Add gender badge in table row and gender filter dropdown in header toolbar. |
| **Header Navigation** | `components/Header.tsx` (lines 128-151, 480-535) | Only category links (`koynek`, `hudi`, etc.) | Add `Kişi` (`/collections?gender=men`) and `Qadın` (`/collections?gender=women`) links; update `isLinkActive`. |
| **Multilingual Labels** | `lib/translations.ts` | Missing `men`, `women`, `unisex` in `nav` and `collections` | Add translations for AZ, EN, RU, TR. |
| **Collections Page** | `app/collections/page.tsx` (lines 50, 74-133, 282-311, 321-425) | Only filters by `category`, `fit`, `size`; no gender tabs | Read `gender` query param; add Gender filter tabs; filter `products` by gender; update page titles. |
| **Storefront API** | `app/api/store/products/route.ts` (lines 74-76) | Filters `p.gender === gender \|\| p.gender === 'accessories'` | Include unisex when querying `men` or `women`. |

---

### 4.2 Exact Code Snippets for Implementer

#### A. Admin Panel (`public/admin.html` & `admin-portal/public/index.html`)

1. **In `#productForm` HTML (around line 2080)**:
```html
<div class="space-y-1">
  <label class="block font-bold text-slate-700 mb-1">Cins (Gender) *</label>
  <div class="grid grid-cols-3 gap-2">
    <label class="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 text-xs font-semibold text-slate-700 has-[:checked]:bg-slate-900 has-[:checked]:text-white has-[:checked]:border-slate-900 transition">
      <input type="radio" name="prodGender" value="men" class="sr-only">
      <span>Kişi</span>
    </label>
    <label class="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 text-xs font-semibold text-slate-700 has-[:checked]:bg-slate-900 has-[:checked]:text-white has-[:checked]:border-slate-900 transition">
      <input type="radio" name="prodGender" value="women" class="sr-only">
      <span>Qadın</span>
    </label>
    <label class="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 text-xs font-semibold text-slate-700 has-[:checked]:bg-slate-900 has-[:checked]:text-white has-[:checked]:border-slate-900 transition">
      <input type="radio" name="prodGender" value="unisex" checked class="sr-only">
      <span>Unisex</span>
    </label>
  </div>
</div>
```

2. **In `openProductModal()` (around line 4105)**:
```javascript
const genderInputs = document.querySelectorAll('input[name="prodGender"]');
genderInputs.forEach(input => { input.checked = (input.value === 'unisex'); });
```

3. **In `editProduct(id)` (around line 4133)**:
```javascript
const targetGender = p.gender || 'unisex';
const genderRadio = document.querySelector(`input[name="prodGender"][value="${targetGender}"]`);
if (genderRadio) { genderRadio.checked = true; }
```

4. **In `handleProductFormSubmit()` (line 4589)**:
```javascript
// Replace hardcoded: gender: 'unisex'
const selectedGender = document.querySelector('input[name="prodGender"]:checked')?.value || 'unisex';
// In payload:
gender: selectedGender,
```

---

#### B. Header Navigation (`components/Header.tsx`)

1. **Update `navLinks` (lines 128–135)**:
```typescript
const navLinks = [
  { label: t.nav.men || "Kişi", href: "/collections?gender=men", genderId: "men" },
  { label: t.nav.women || "Qadın", href: "/collections?gender=women", genderId: "women" },
  { label: t.nav.shirts, href: "/collections?category=koynek", categoryId: "koynek" },
  { label: t.nav.hoodies, href: "/collections?category=hudi", categoryId: "hudi" },
  { label: t.nav.pants, href: "/collections?category=salvar", categoryId: "salvar" },
  { label: t.nav.accessories, href: "/collections?category=aksesuar", categoryId: "aksesuar" },
  { label: t.nav.collection, href: "/collections", categoryId: "all" },
  { label: t.nav.track, href: "/track", categoryId: "track" },
];
```

2. **Update `isLinkActive` (lines 137–151)**:
```typescript
const currentGender = searchParams?.get("gender") || null;

const isLinkActive = (item: { categoryId?: string; genderId?: string; href: string }) => {
  if (item.genderId) {
    return pathname === "/collections" && currentGender === item.genderId;
  }
  if (item.categoryId && item.categoryId !== "all") {
    if (pathname === "/collections" && currentCategory === item.categoryId && !currentGender) {
      return true;
    }
    return false;
  }
  if (item.categoryId === "all") {
    return pathname === "/collections" && (!currentCategory || currentCategory === "all") && !currentGender;
  }
  return false;
};
```

---

#### C. Collections Page (`app/collections/page.tsx`)

1. **Extract `gender` parameter (around line 50)**:
```typescript
const selectedGender = searchParams.get("gender") || "all";
const selectedCategory = searchParams.get("category") || "all";
```

2. **Gender Navigation Tabs Component (Desktop & Mobile)**:
```typescript
const genderTabs = [
  { id: "all", label: language === "az" ? "Bütün Modellər" : language === "ru" ? "Все" : language === "tr" ? "Tümü" : "All" },
  { id: "men", label: language === "az" ? "Kişi" : language === "ru" ? "Мужское" : language === "tr" ? "Erkek" : "Men" },
  { id: "women", label: language === "az" ? "Qadın" : language === "ru" ? "Женское" : language === "tr" ? "Kadın" : "Women" },
  { id: "unisex", label: language === "az" ? "Unisex" : language === "ru" ? "Унисекс" : language === "tr" ? "Uniseks" : "Unisex" },
];

const handleGenderChange = (genderId: string) => {
  const params = new URLSearchParams(searchParams.toString());
  if (genderId === "all") {
    params.delete("gender");
  } else {
    params.set("gender", genderId);
  }
  const qs = params.toString();
  router.replace(`/collections${qs ? `?${qs}` : ""}`, { scroll: false });
};
```

3. **Filtering in `filteredProducts` (around line 112)**:
```typescript
if (selectedGender !== "all") {
  if (selectedGender === "men") {
    if (product.gender !== "men" && product.gender !== "unisex") return false;
  } else if (selectedGender === "women") {
    if (product.gender !== "women" && product.gender !== "unisex") return false;
  } else if (selectedGender === "unisex") {
    if (product.gender !== "unisex") return false;
  }
}
```

---

## 5. Verification Method

To verify these findings and validate future implementations:

1. **Database Schema & Types Verification**:
   - Inspect `lib/supabase/schema.sql` line 16: confirm `gender IN ('men', 'women', 'unisex')`.
   - Inspect `data/products.ts` line 24: confirm `gender: 'men' | 'women' | 'unisex' | string;`.
2. **Admin Panel Verification**:
   - Open browser or curl: verify `GET /api/admin/data` returns product list with `gender` property on each item.
   - In `public/admin.html`, inspect `#productForm` in browser devtools: verify radio buttons for Kişi (`men`), Qadın (`women`), and Unisex (`unisex`) exist.
   - Edit an existing product, change gender to `men` or `women`, click submit, and verify `POST /api/admin/products` sends `{ ..., gender: 'men' }`.
   - Re-open edit modal for that product: verify the selected gender radio is checked.
3. **Storefront Navigation & Collections Verification**:
   - Navigate to `/collections?gender=men`:
     - Verify Header "Kişi" tab is visually active.
     - Verify Collections gender filter tab "Kişi" is active.
     - Verify displayed products include products with `gender === 'men'` and `gender === 'unisex'`, but exclude `gender === 'women'`.
   - Navigate to `/collections?gender=women`:
     - Verify Header "Qadın" tab is active.
     - Verify displayed products exclude products with `gender === 'men'`.
   - Navigate to `/collections?gender=unisex`:
     - Verify only products with `gender === 'unisex'` are displayed.
4. **TypeScript Build Verification**:
   - Run `npm run build` or `npx tsc --noEmit` to ensure no interface mismatches or typing errors occur.
