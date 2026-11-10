# Horwalle — online clothing store

Next.js 14 (App Router) storefront and admin panel, deployed on Vercel, with Supabase as the only database.
Pushing to `main` deploys to https://www.horwalle.com.

## How data flows

Supabase is the single source of truth. Nothing is stored in files or in memory.

| Data | Table | Code |
|---|---|---|
| Products | `products` | `lib/db/products.ts` |
| Orders, order items | `orders`, `order_items` | `lib/db/orders.ts` |
| Custom print jobs | `pod_orders` | `lib/db/orders.ts` |
| Promo codes | `promo_codes` | `lib/db/site.ts` |
| Site content, settings | `site_settings` (keys `content`, `settings`) | `lib/db/site.ts` |
| Categories | `categories` | `lib/db/site.ts` |
| Dashboard figures, customers | derived | `lib/db/stats.ts` |
| Live chat transcripts | private Storage bucket `private-data` | `app/api/chat/` |
| Product images | public Storage bucket `product-images` | `lib/adminUpload.ts` |

All tables have RLS enabled with no policies: only the server (service role) can reach them.
Schema changes live in `supabase/migrations/`.

`data/storeData.json` holds only the default content and settings used until something is saved in the admin.

## Storefront

- The root layout loads products, content and settings on the server (`lib/storeSnapshot.ts`) and hands them to
  `context/StoreDataContext.tsx`, so the first HTML already contains live data.
- Reads are cached under the tag `store`. Every admin write that the storefront shows calls `refreshStore()`,
  which revalidates the tag; 60 seconds is the fallback.
- Prices at checkout are always recomputed on the server from the catalogue (`resolveUnitPrice`), including
  custom print items (`lib/studio/catalog.ts`). An order is stored before payment starts.
- Promo codes are never listed publicly; `/api/store/promo` checks one code.

## Admin panel

- `/admin?access=<ADMIN_ACCESS_KEY>` opens the login page; after signing in, `/admin` works without the key.
  Without a session or the key every admin URL returns a plain 404 (`middleware.ts`).
- Pages are under `app/admin/(panel)/`, components under `components/admin/`. Pages read from `lib/db` on the
  server; changes go through `/api/admin/*` and `router.refresh()`.
- Sections: dashboard, orders (detail, printable receipt with a Code 128 barcode; the order search opens an
  order when a scanner types its number + Enter), custom print jobs, products, promo codes, sales/tax report
  (CSV export, print), customers, live chat, e-mail campaign, site content, settings (shipping rates, legal texts).
- Shipping rates live in `settings.shipping` and are read by both the checkout page and the server validation
  (`lib/shipping.ts`). Privacy/terms pages show the admin text when it is set, the built-in text otherwise.

## Working on it

- `npm run dev` uses `.env.local`, which points at the **production** database. Be careful with writes.
- `npm run verify:db` exercises `lib/db` end to end against the database and removes what it creates.
- Environment variables are listed in `.env.example`. The admin variables have no defaults.
