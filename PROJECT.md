# Project: Horwalle Atelier Storefront Luxury Overhaul, Glassmorphism Admin & Security Hardening

## Architecture
- **Framework**: Next.js 14.2 (App Router) with React 18, TypeScript 5.4, Tailwind CSS.
- **Storefront Layer**:
  - High-performance ambient video hero (`components/HeroVideo.tsx` / `components/Hero.tsx`) with dual 16:9 & 9:16 responsive streams, poster fallback, `IntersectionObserver` pause/resume, and frosted glass CTAs.
  - Floating dynamic header (`components/Header.tsx`) with smooth backdrop blur and contrast stabilization.
  - Consistent Atelier Obsidian color tokens and typography hierarchy across `app/globals.css`, `app/page.tsx`, and `components/ProductCard.tsx`.
- **Admin System Layer**:
  - Dedicated luxury Glassmorphism UI in `public/admin.html` and `admin-portal/public/index.html` (`#090A0F` obsidian canvas, frosted glass acrylic panels, luminous borders, gold/emerald accents).
  - Tri-channel synchronization engine (`BroadcastChannel('horwalle_store_sync')`, `window.parent.postMessage`, `localStorage` storage events) connecting Admin to `context/StoreDataContext.tsx` with zero latency.
  - Non-destructive DOM fingerprint diffing eliminating 8s polling input loss, plus non-blocking glass toasts replacing native alerts.
  - International Order Detail Inspector modal dialog displaying full destination coordinates, carrier methods, custom POD artwork, and audit logs.
- **Defensive Security & Resilience Layer**:
  - Centralized authorization enforcement via `isAdminAuthenticated` across all mutation/deletion endpoints (`/api/store/products`, `/api/store/content`, `/api/store/pod-orders`, `/api/chat/threads`).
  - Secrets rotation and privacy enforcement: eliminated fallback service role keys, sanitized customer PII, stopped open ntfy broadcasting.
  - Comprehensive injection defense: sanitized HTML interpolation for Stored XSS defense, server-side database price validation on checkout.
  - Security headers (CSP, HSTS, X-Content-Type-Options, X-Frame-Options) in `next.config.mjs` and middleware rate limiting.

---

## Feature Inventory
Every feature identified from the survey and requirements is cataloged and assigned to a milestone:

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Ambient Video Hero Component | Responsive video hero with 16:9 desktop & 9:16 mobile cuts, WebP poster fallback, zero-flash opacity transition on play, IntersectionObserver auto-pause, frosted glass CTAs. | M1 | Survey (explorer 1) |
| 2 | Header Contrast & Float Transition | Float-on-scroll navigation header in `Header.tsx` eliminating contrast flicker and scroll threshold jumps, optimized nav link layout for 1024px-1280px viewports. | M1 | Survey (explorer 1) |
| 3 | Storefront Color Tokens & Smooth Atmosphere | Unified Atelier tokens in `globals.css` (`--atelier-noir`, `--atelier-carbon`, `--atelier-gold`, `--atelier-cream`) and seamless dark-to-light transition in `app/page.tsx`. | M1 | Survey (explorer 1) |
| 4 | Product Card Visual Refinement | Remove awkward double-border in light mode card in `ProductCard.tsx`, standardize hover lift physics and aspect ratio consistency. | M1 | Survey (explorer 1) |
| 5 | Admin Atelier Obsidian Glass Design System | Dark obsidian theme (`#090A0F`), frosted acrylic glass panels (`backdrop-blur-xl`, `bg-white/[0.03]`, `border-white/[0.08]`), champagne gold & emerald rim lighting in `public/admin.html` & `admin-portal/public/index.html`. | M2 | Survey (explorer 2) |
| 6 | Real-Time Tri-Channel Data Synchronization | Connect admin actions to storefront via `BroadcastChannel`, `postMessage`, and `storage` events, backed by HTTP `Cache-Control: no-store` on `/api/admin/data` and client cache busters. | M2 | Survey (explorer 2) |
| 7 | Non-Destructive DOM Diffing & Glass Toasts | Payload hash diffing preventing 8s table recreation, preserving search input focus in `#productSearchInput`, and luxury glass toasts replacing native `alert()` calls. | M2 | Survey (explorer 2) |
| 8 | International Order Detail Inspector Modal | Dedicated admin modal displaying full international address details, carrier badge (DHL/Post/Courier), tracking number, custom POD artwork, and audit logs. | M2 | Survey (explorer 2) |
| 9 | Admin Page Wrapper Polish | Eliminate light-gray flash in `app/admin/page.tsx` by styling iframe container with obsidian glass aesthetic. | M2 | Survey (explorer 2) |
| 10 | Strict Automated Test Parity Preservation | Retain all 150 automated test selectors (`prodGender`, `productGenderFilter`, `<th class="p-3.5">Cins</th>`, `data-gender`) in both admin HTML files. | M2 | Survey (explorer 2) |
| 11 | API Route Authentication Gating | Enforce `isAdminAuthenticated` across `POST`/`DELETE` in `/api/store/products`, `POST` in `/api/store/content`, `GET`/`PATCH` in `/api/store/pod-orders`, and `GET`/`DELETE` in `/api/chat/threads`. | M3 | Survey (explorer 3) |
| 12 | Secrets Sanitization & PII Privacy Protection | Remove hardcoded Supabase Service Role Key fallback in `lib/supabaseServer.ts`; mask or eliminate public unauthenticated `ntfy.sh` customer PII broadcasts. | M3 | Survey (explorer 3) |
| 13 | Stored XSS & Injection Sanitization | Escape all user-controlled values interpolated into `innerHTML` (`customerName`, `customerNote`, `promoCode`, `o.id`) in `public/admin.html`. | M3 | Survey (explorer 3) |
| 14 | Server-Side Checkout Price Recalculation | Verify item prices against authoritative database in `app/api/checkout/route.ts` to prevent client price tampering. | M3 | Survey (explorer 3) |
| 15 | Security Headers & Rate Limiting | Add CSP, HSTS, X-Content-Type-Options, X-Frame-Options to `next.config.mjs`, and implement rate limiting on authentication and checkout endpoints. | M3 | Survey (explorer 3) |
| 16 | Dead Code & Performance Optimization | Purge unimported legacy components (`EditorialHero.tsx`, unused studio components), wrap `ProductCard` in `React.memo`. | M3 | Survey (explorer 3) |
| 17 | Comprehensive Automated E2E Test Suite | Tiers 1-4 automated test runner verifying all storefront, admin, synchronization, and security hardening features, publishing `TEST_READY.md`. | TestTrack | Project Pattern |
| 18 | Final Adversarial Hardening & Forensic Audit | 100% pass of E2E test suite + Tier 5 adversarial stress testing + clean Forensic Integrity Audit. | M4 | Project Pattern |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| TestTrack | E2E Testing Track | Build test runner & Tiers 1-4 automated test suite covering all features, publish `TEST_READY.md` | Survey | PLANNED |
| M1 | Storefront Design & Luxury Video Hero | Video hero component, header contrast float, atelier color tokens, ProductCard polish | Survey | PLANNED |
| M2 | Admin Glassmorphism & Real-Time Sync | Atelier Obsidian Glass UI, tri-channel sync, order inspector, DOM diffing, test selector parity | Survey | PLANNED |
| M3 | Defensive Security & Code Optimization | Route auth gating, secrets cleanup, PII masking, XSS escaping, checkout price validation, dead code purge | Survey | PLANNED |
| M4 | Final E2E Test Pass & Adversarial Hardening | 100% pass of E2E suite + Tier 5 adversarial testing + clean Forensic Integrity Audit | M1, M2, M3, TestTrack | PLANNED |

---

## Interface Contracts

### 1. Hero Video Component Interface
```typescript
export interface HeroVideoProps {
  posterDesktop: string;
  posterMobile: string;
  videoDesktopSrc: string;
  videoMobileSrc: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}
```
- Autoplay muted loop with `playsInline`.
- Responsive sources: `<source media="(max-width: 767px)" src={videoMobileSrc} type="video/mp4" />` & `<source src={videoDesktopSrc} type="video/mp4" />`.
- Visibility tracking: `IntersectionObserver` auto-pauses when `< 20%` visible.

### 2. Tri-Channel State Synchronization Contract
- Admin Channel Name: `'horwalle_store_sync'`
- Payload: `{ type: 'DATA_UPDATED' | 'PRODUCT_MUTATED' | 'ORDER_PLACED', timestamp: number, source: 'admin' | 'storefront' }`
- Channels:
  1. `BroadcastChannel`: `new BroadcastChannel('horwalle_store_sync').postMessage(payload)`
  2. `window.parent.postMessage`: `if (window.parent !== window) window.parent.postMessage({ type: 'hv-store-refresh', payload }, '*')`
  3. `localStorage`: `localStorage.setItem('hv_last_sync', Date.now().toString())`
- Client Listening in `context/StoreDataContext.tsx`:
  - Listens on `BroadcastChannel`, `window.addEventListener('message')`, and `window.addEventListener('storage')`.
  - Triggers non-destructive background fetch with `Cache-Control: no-store` and `?_t=${Date.now()}`.

### 3. API Authorization Contract
- Function: `isAdminAuthenticated(req: NextRequest): Promise<boolean>` in `lib/adminAuth.ts`.
- Gating Rule:
  ```typescript
  if (!(await isAdminAuthenticated(req))) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin authentication required' }, { status: 401 });
  }
  ```
- Applied to:
  - `POST`, `DELETE` in `/api/store/products`
  - `POST` in `/api/store/content`
  - `GET`, `PATCH` in `/api/store/pod-orders`
  - `GET`, `DELETE` in `/api/chat/threads`

---

## Code Layout & Ownership Boundaries
- **Testing Track**: Exclusive owner of `tests/` and test runner scripts (`scripts/run-e2e-tests.mjs`, `TEST_INFRA.md`, `TEST_READY.md`).
- **Milestone 1 Worker**: Exclusive owner of `components/Hero.tsx`, `components/HeroVideo.tsx`, `components/Header.tsx`, `components/ProductCard.tsx`, `app/page.tsx`, `app/globals.css`.
- **Milestone 2 Worker**: Exclusive owner of `public/admin.html`, `admin-portal/public/index.html`, `app/admin/page.tsx`, `context/StoreDataContext.tsx`, `app/api/admin/[...slug]/route.ts`.
- **Milestone 3 Worker**: Exclusive owner of `app/api/store/products/route.ts`, `app/api/store/content/route.ts`, `app/api/store/pod-orders/route.ts`, `app/api/chat/threads/route.ts`, `app/api/chat/route.ts`, `app/api/checkout/route.ts`, `lib/supabaseServer.ts`, `lib/notifications/orderNotifier.ts`, `next.config.mjs`, `middleware.ts`.
- Concurrent workers MUST NOT write to each other's owned files.
