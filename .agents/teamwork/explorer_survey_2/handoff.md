# Shipping & Checkout Architecture Survey Report: Domestic vs. International Expansion

**Agent**: `explorer_survey_2`  
**Date**: 2026-11-08  
**Scope**: Checkout, Cart State, Delivery Options, Address Fields, Order Models/APIs, and International Shipping System Specification.

---

## 1. Observation

### 1.1 Key File Inventory & Responsibilities
Through directory mapping and grep searches, the following key files govern checkout, delivery, orders, and pricing:

| File Path | Role | Key Functions / State |
|-----------|------|------------------------|
| `app/checkout/page.tsx` (1771 lines) | Primary Next.js client-side checkout page | Manages customer address form, city/region selector, payment method selection, client-side shipping calculation, client validation, order dispatch to `/api/store/orders`. |
| `context/CartContext.tsx` (161 lines) | Global shopping cart state | `CartItem` interface, item quantities, `isOpen`, `totalPrice`, `hasCustomItems`, `addItem`, `removeItem`, `updateQuantity`. Persisted in `localStorage` under `atelier_cart_items_v1`. |
| `components/CartDrawer.tsx` (356 lines) | Slide-over cart drawer | Visual summary of items, free delivery banner (`Bakı və Sumqayıt daxili çatdırılma PULSUZ`), subtotal calculation via `getProductPrice()`, checkout CTA. |
| `context/CurrencyContext.tsx` (212 lines) | Multi-currency & Geo-detection context | Supports `AZN` and `USD`, fetches `/api/geo` for country detection (`detectedCountry`, `isAzerbaijan`), computes dual pricing (`getProductPrice()`). |
| `app/api/geo/route.ts` (21 lines) | IP-based Geo-location detector | Reads headers `x-vercel-ip-country`, `cf-ipcountry`, returns `{ country, isAzerbaijan, defaultLang, defaultCurrency }`. |
| `app/api/store/orders/route.ts` (451 lines) | Order creation & persistence API | Server-side price recalculation, server-side shipping rate calculation, promo validation, payment provider delegation, duplicate check, saves to `lib/storeDb.ts` and syncs to Supabase `orders` table. |
| `app/api/checkout/route.ts` (111 lines) | Alternative/Direct payment initiation route | Validates payment eligibility (`validatePaymentEligibility`), calculates total, delegates to `defaultPaymentProvider`. |
| `lib/storeDb.ts` (274 lines) | Persistent JSON file DB layer | Defines `StoreOrder`, `StoreSettings`, `StoreProduct`, `PodOrder`. Reads/writes to `data/storeData.json` and `/tmp/storeData.json`. |
| `lib/supabase/schema.sql` (183 lines) | Supabase PostgreSQL schema | Table definitions for `orders`, `order_items`, `profiles`, `payments`. |
| `lib/payments/types.ts` (78 lines) | Payment & order type definitions | `PaymentRequest`, `PaymentCustomer`, `PaymentMethod`, `PaymentResponse`. |
| `lib/payments/provider.ts` & `lib/payments/providers/*` | Pluggable payment providers | `EpointPaymentProvider`, `MockPaymentProvider`, `validatePaymentEligibility`. |
| `lib/notifications/orderNotifier.ts` (79 lines) | Real-time order alerts | Telegram bot & NTFY mobile push notification with customer address, items, and total. |
| `lib/email/emailTemplates.ts` (201 lines) | Customer confirmation emails | Formats shipping address and order receipt for email dispatch. |
| `public/admin.html` (5740 lines) & `data/adminData.ts` (142 lines) | Admin portal & thermal label printing | `renderShippingLabelString()` for printing 100mm x 150mm courier shipping labels. |

---

### 1.2 Current Azerbaijan Domestic Delivery System (Observed Code)

#### A. Client-Side Shipping Logic (`app/checkout/page.tsx`)
Lines 330–333:
```typescript
// Free delivery for Baku & Sumqayit regardless of cart amount
const isFreeZone = /^(bak[ıi]|sumqay[ıi]t)/i.test(city.trim());
const shippingCost = isFreeZone ? 0 : (effectiveSubtotal >= 60 ? 0 : 5);
const discountAmount = promoDiscountAmount > 0 ? promoDiscountAmount : (effectiveSubtotal * discountPercent) / 100;
const finalTotal = Math.max(0, effectiveSubtotal - discountAmount + shippingCost);
```
Lines 1235–1291 (City Selector Component):
- **Bakı Button**: sets `city = "Bakı"`, displays "Bakı - Pulsuz" (Free delivery: 0 ₼).
- **Sumqayıt Button**: sets `city = "Sumqayıt"`, displays "Sumqayıt - Pulsuz" (Free delivery: 0 ₼).
- **Rayonlar Button**: sets `city = ""`, displays "Bölgə: 5 ₼" (Free if order ≥ 60 ₼). When active, it reveals an input field `placeholder="Rayon və ya şəhər (Gəncə, Şəki)"`.

#### B. Server-Side Shipping Calculation (`app/api/store/orders/route.ts`)
Lines 156–159:
```typescript
// 2. Server-side Shipping Calculation
const city = String(customer.city || 'Bakı').trim();
const isFreeZone = /^(bak[ıi]|sumqay[ıi]t)/i.test(city);
const serverShipping = isFreeZone ? 0 : (serverSubtotal >= 60 ? 0 : 5);
```
Line 245 & Line 283:
```typescript
country: 'Azərbaycan', // Hardcoded country in customer payload and sanitized record
```

#### C. Cart Drawer Banner (`components/CartDrawer.tsx`)
Lines 28, 93–98, 151–159, 294–297:
```typescript
freeDeliveryBanner: "Bakı və Sumqayıt daxili çatdırılma PULSUZ",
deliveryFreeBaku: "PULSUZ (Bakı & Sumqayıt)",
const FREE_SHIPPING_THRESHOLD = 60;
```

---

### 1.3 Address Fields Currently Collected

#### Observed in `app/checkout/page.tsx` (Lines 261–266, 351–389):
| Field | State Variable | Validation Rule | Form Input Type |
|-------|----------------|-----------------|-----------------|
| Full Name | `fullName` | Mandatory; min 3 characters | `text` (`#field-fullName`) |
| Phone | `phone` | Mandatory; min 9 numeric digits; default `+994 ` | `tel` (`#field-phone`) |
| Email | `email` | Mandatory; valid regex `^[^\s@]+@[^\s@]+\.[^\s@]+$` | `email` (`#field-email`) |
| City / Region | `city` | Defaults to `"Bakı"`; options: `"Bakı"`, `"Sumqayıt"`, or manual text for Rayonlar | 3-button selector + text input |
| Delivery Address | `address` | Mandatory; min 4 characters (e.g. Street, building, apt) | `text` (`#field-address`) |

#### What is completely missing for International Customers:
1. **Country Selector**: No country dropdown exists in the UI. In `orders/route.ts`, `country` is hardcoded to `'Azərbaycan'`.
2. **Postal / ZIP Code**: No field exists in the form, state, `PaymentCustomer` interface, or database schema.
3. **State / Province / County**: No field exists (crucial for US states, Canadian provinces, UAE emirates, etc.).
4. **Address Line 2**: No secondary address field for Apartment/Suite/Floor/Building.
5. **International Phone Validation**: Form hardcodes `+994 ` prefix in default state; validation checks `digits.length < 9` assuming AZ domestic mobile numbers.

---

### 1.4 Order Creation, Models, and Payment Flow

#### A. Order Submission Flow
1. **User action**: Clicks submit in `app/checkout/page.tsx` (either via Card, Apple Pay, or Google Pay).
2. **Client Request**: `fetch("/api/store/orders", { method: "POST", body: JSON.stringify({...}) })`.
   - Sends: `id`, `userId`, `customer` (`fullName`, `phone`, `email`, `address`, `city`, `country: "Azərbaycan"`), `items`, `paymentMethod`, `subtotal`, `shipping`, `discount`, `promoCode`, `currency`, `total`, `turnstileToken`.
3. **Server Validation (`app/api/store/orders/route.ts`)**:
   - Rate limit check (`checkRateLimit`).
   - Turnstile token verification (`verifyTurnstileToken`).
   - Price recalculation against server products DB.
   - Recalculates shipping (`isFreeZone ? 0 : 5`).
   - Normalizes payment method: `apple_pay`, `google_pay`, `cash_on_delivery`, or `card`.
   - COD eligibility check: If cart contains custom POD items, COD is rejected with HTTP 400.
   - Idempotency / Duplicate order guard: Prevents duplicate orders if submitted within 20 seconds with identical phone & amount.
   - Calls Payment Provider: `provider.createPayment(paymentRequest)`.
   - Decrements stock count (if not test mode).
   - Writes order to `data/storeData.json` and `/tmp/storeData.json` via `writeStoreDb(db)`.
   - If POD custom items exist, creates companion record in `db.podOrders`.
   - Background syncs to Supabase Cloud Database: `syncOrderToSupabase()`.
   - Triggers Telegram bot & NTFY mobile push notification (`notifyNewOrder()`).
   - Asynchronously sends order confirmation email (`sendOrderConfirmation()`).
   - Returns `{ success: true, order: newOrder, paymentResponse }`.
4. **Client redirect**: `router.push('/checkout/success?orderId=...&method=...&total=...')`.

#### B. Data Models & Schemas

**`StoreOrder` (`lib/storeDb.ts`, Lines 83–119)**:
```typescript
export interface StoreOrder {
  id: string;
  trackingCode?: string;
  userId?: string;
  source?: string;
  date: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
  };
  items: Array<{
    productId: string;
    name: string;
    size: string;
    color: string;
    price: number;
    quantity: number;
    isCustom?: boolean;
    customData?: any;
  }>;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  isTest?: boolean;
  provider?: string;
  providerPaymentId?: string;
  promoCode?: string;
  currency?: string;
}
```

**Supabase Schema (`lib/supabase/schema.sql`, Lines 79–95)**:
```sql
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    delivery_address TEXT NOT NULL,
    delivery_city TEXT NOT NULL DEFAULT 'Bakı',
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'apple_pay', 'google_pay', 'cash_on_delivery')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    order_status TEXT DEFAULT 'yeni' CHECK (order_status IN ('yeni', 'təsdiqləndi', 'çapdadır', 'kuryerdə', 'tamamlandı', 'ləğv_edildi')),
    has_custom_items BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

---

## 2. Logic Chain

```
[Observation 1.1 - 1.2]: Shipping logic hardcodes Azerbaijan cities (Bakı, Sumqayıt, Rayonlar) and flat 0 ₼ / 5 ₼.
[Observation 1.3]: Address fields only capture fullName, phone, email, city, address; no country, postalCode, state/region.
[Observation 1.4]: StoreOrder, orders table, and API hardcode country to 'Azərbaycan'.
    │
    ▼ (Inference 1: Current system cannot support international orders)
A customer outside Azerbaijan cannot select their country, cannot provide a postal code or province, is charged domestic AZN shipping (0 or 5 ₼) instead of international shipping rates, and the database stores country as 'Azərbaycan'.
    │
    ▼ (Inference 2: Foundation for internationalization already partially exists)
`context/CurrencyContext.tsx` and `app/api/geo/route.ts` already detect the customer's country via IP geolocation (`isAzerbaijan`, `detectedCountry`), automatically switch default currency to USD, and support custom international product pricing (`internationalPrice`).
    │
    ▼ (Inference 3: Missing Bridge)
The checkout form and server order endpoint were never wired to leverage `isAzerbaijan` / `detectedCountry` for:
1. Dynamic domestic vs. international address form fields.
2. Selection of international carriers & shipping methods (Standard International vs. Express DHL/FedEx).
3. International shipping rate calculation & currency conversion.
4. Gating payment methods (COD must remain Azerbaijan-only; Card/Apple Pay/Google Pay enabled globally).
5. Saving country, postalCode, state/province, addressLine2, and shippingMethod to orders DB and Supabase.
```

---

## 3. Caveats

1. **Carrier API Integration**: We are not integrating live dynamic carrier rate APIs (such as DHL XML/REST API or FedEx Web Services requiring live corporate account credentials). Instead, luxury fashion e-commerce best practice for boutique atelyes (e.g. Farfetch boutique partner or independent atelier) uses transparent tiered flat-rate shipping rules with clear delivery day estimates (e.g. Standard International: $15 or Free over $150; DHL Express Worldwide: $35).
2. **Customs Duties & Taxes (DDP vs DDU)**: Standard practice for independent luxury ateliers is DDU (Delivered Duty Unpaid / Customer responsible for local import duties) or threshold-free for destinations like the US ($800 de minimis) and EU VAT. The checkout UI must clearly state the customs note to prevent international customer disputes.
3. **Database Migration Safety**: In `lib/supabase/schema.sql` and `syncOrderToSupabase`, adding columns like `delivery_country`, `delivery_postal_code`, `delivery_state`, `shipping_method` must be backwards-compatible so that existing orders continue working without errors. `syncOrderToSupabase` already implements fallback handling for missing columns.

---

## 4. Conclusion & Concrete Recommendations

To expand the platform from Azerbaijan domestic to seamless international shipping, the following architectural specifications must be implemented:

### 4.1 Country Selection & Geolocation Pre-Selection
- **Country Data**: Create `lib/countries.ts` with a curated list of top global shipping destinations (ISO-2 code, English name, local name, calling dial code, flag emoji, and postal code format requirements).
- **Auto-Detection**: Initialize selected country using `detectedCountry` from `useCurrency()` (which is already populated by `/api/geo` headers `x-vercel-ip-country`). If detected as `"AZ"`, default to Azerbaijan; otherwise default to customer's country.
- **Dynamic Address Fields Switch**:
  - **When Country is "AZ" (Azerbaijan)**:
    - Display the familiar domestic buttons: Bakı (Pulsuz), Sumqayıt (Pulsuz), Rayonlar (5 ₼).
    - Phone prefix defaults to `+994 `.
    - Postal code optional or hidden (since domestic Azerbaijani couriers rely strictly on phone + address).
  - **When Country is NOT "AZ" (International)**:
    - Country dropdown selector with search / quick select.
    - Phone input dynamically prefixes country dial code (e.g. `+1 `, `+44 `, `+90 `, `+49 `, `+971 `).
    - Address Line 1 (Street name & number) + Address Line 2 (Apartment / Suite / Unit).
    - City / Town input.
    - State / Province / Region input (mandatory for US/CA/AU).
    - Postal / ZIP Code input (mandatory for all international deliveries).

---

### 4.2 International Shipping Methods & Rate Calculation

#### Proposed Shipping Tiers:
| Method ID | Label (Bilingual) | Carrier / Style | Estimated Transit Time | Cost (USD) | Cost (AZN equivalent) | Free Threshold |
|-----------|-------------------|-----------------|------------------------|------------|------------------------|----------------|
| `domestic_free` | Bakı & Sumqayıt Çatdırılma | Local Courier | 1–2 iş günü | Free ($0.00) | 0 ₼ | Always Free |
| `domestic_region` | Rayonlara Çatdırılma | Regional Express / Azərpoçt | 2–4 iş günü | $3.00 | 5 ₼ | Free on orders ≥ 60 ₼ |
| `intl_standard` | Standard International Shipping | Tracked Airmail / Priority Post | 7–14 business days | $15.00 | 25 ₼ | Free on orders ≥ $150 |
| `intl_express` | DHL Express Worldwide / FedEx Priority | DHL / FedEx Air Express | 2–5 business days | $35.00 | 60 ₼ | $20 discount on orders ≥ $200 |

#### Shipping Rate Engine (`lib/shipping.ts`):
```typescript
export interface ShippingOption {
  id: string;
  name: string;
  carrier: string;
  estimatedDays: string;
  price: number; // in current currency
  isFree: boolean;
  currency: "AZN" | "USD";
}

export function calculateShippingOptions(
  countryCode: string,
  subtotal: number,
  currency: "AZN" | "USD"
): ShippingOption[] {
  const isAz = countryCode === "AZ";

  if (isAz) {
    return [
      {
        id: "domestic_baku_sumgayit",
        name: "Bakı və Sumqayıt Kuryer",
        carrier: "HORVVALLE Express Courier",
        estimatedDays: "1–2 iş günü",
        price: 0,
        isFree: true,
        currency: "AZN",
      },
      {
        id: "domestic_region",
        name: "Bölgələr / Rayonlar",
        carrier: "Azərpoçt / Regional Express",
        estimatedDays: "2–4 iş günü",
        price: subtotal >= 60 ? 0 : 5,
        isFree: subtotal >= 60,
        currency: "AZN",
      },
    ];
  }

  // International Destinations
  const isUsd = currency === "USD";
  const standardCost = isUsd ? (subtotal >= 150 ? 0 : 15) : (subtotal >= 250 ? 0 : 25);
  const expressCost = isUsd ? (subtotal >= 200 ? 20 : 35) : (subtotal >= 340 ? 35 : 60);

  return [
    {
      id: "intl_standard",
      name: "Standard International Shipping",
      carrier: "Tracked Priority Post",
      estimatedDays: "7–14 business days",
      price: standardCost,
      isFree: standardCost === 0,
      currency,
    },
    {
      id: "intl_express",
      name: "DHL Express Worldwide",
      carrier: "DHL Express / FedEx Priority",
      estimatedDays: "2–5 business days",
      price: expressCost,
      isFree: false,
      currency,
    },
  ];
}
```

---

### 4.3 Payment Method Gating for International Orders
- **Cash on Delivery (COD)**: Must be **automatically hidden or disabled** when country !== "AZ".
- **Bank Cards (Visa / Mastercard)**: Default choice for both domestic and international.
- **Apple Pay & Google Pay**: Valid globally with proper currency passing (`currencyCode: currency || "USD"` and `countryCode: selectedCountryCode`).

---

### 4.4 Schema & Model Enhancements

#### `StoreOrder` (`lib/storeDb.ts`) Updates:
```typescript
export interface StoreCustomerAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  addressLine2?: string;
  city: string;
  stateOrRegion?: string;
  postalCode?: string;
  country: string;
  countryCode: string; // ISO 2-letter, e.g. "AZ", "US", "TR", "GB"
}

export interface StoreOrder {
  id: string;
  trackingCode?: string;
  userId?: string;
  date: string;
  customer: StoreCustomerAddress;
  items: Array<any>;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  subtotal: number;
  shipping: number;
  shippingMethod?: string;
  shippingMethodLabel?: string;
  estimatedDelivery?: string;
  discount: number;
  total: number;
  isTest?: boolean;
  provider?: string;
  providerPaymentId?: string;
  promoCode?: string;
  currency?: string;
}
```

#### Supabase Database Migration (`lib/supabase/schema.sql`):
```sql
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivery_country TEXT DEFAULT 'Azərbaycan',
ADD COLUMN IF NOT EXISTS delivery_postal_code TEXT,
ADD COLUMN IF NOT EXISTS delivery_state TEXT,
ADD COLUMN IF NOT EXISTS delivery_address_line2 TEXT,
ADD COLUMN IF NOT EXISTS shipping_method TEXT DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS shipping_amount NUMERIC(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'AZN';
```

---

### 4.5 Server Order Processing Route (`app/api/store/orders/route.ts`)
- Replace the domestic-only shipping calculation (lines 156–159) with a call to the shipping engine.
- Sanitize the incoming `postalCode`, `stateOrRegion`, `addressLine2`, `country`, `countryCode`, and `shippingMethod`.
- Pass all address fields to `syncOrderToSupabase()`, `notifyNewOrder()`, and `sendOrderConfirmation()`.

---

### 4.6 Thermal Label & Admin Order Viewer Updates
- In `public/admin.html` (`renderShippingLabelString`), update the shipping label to print:
  - Full international format: `[Customer Name]`, `[Address Line 1] [Address Line 2]`, `[City], [State] [Postal Code]`, `[COUNTRY]`.
  - Carrier badge: `DHL EXPRESS` or `TRACKED POST` for international orders vs `LOCAL COURIER` for domestic.

---

## 5. Verification Method

To independently verify the current implementation and future modifications:

1. **Inspect Current Domestic Hardcoding**:
   - Run: `view_file` on `app/checkout/page.tsx` at lines 330–333, 553, and 1235–1291. Confirm hardcoded Baku/Sumgayit/Regions buttons and `country: "Azərbaycan"`.
   - Run: `view_file` on `app/api/store/orders/route.ts` at lines 156–159 and line 283. Confirm server-side hardcoded city regex and `'Azərbaycan'`.
2. **Inspect Currency & Geo Detection**:
   - Run: `view_file` on `context/CurrencyContext.tsx` lines 83–97 and `app/api/geo/route.ts` lines 6–19 to verify existing IP-based country detection.
3. **Inspect Models & Tables**:
   - Run: `view_file` on `lib/storeDb.ts` lines 89–96 to verify absence of `postalCode` / `state` / `countryCode`.
   - Run: `view_file` on `lib/supabase/schema.sql` lines 79–95 to verify absence of `delivery_country` and `delivery_postal_code`.
4. **Build & Typecheck Command**:
   - `npm run build` or `npx tsc --noEmit` to verify type safety across TypeScript definitions when fields are added.
