-- ==============================================================================
-- HORWALLE: SUPABASE AS THE SINGLE SOURCE OF TRUTH
-- Replaces the JSON-file store (lib/storeDb.ts) and the JSON blobs kept in Storage.
-- Additive only: no column or table that the currently deployed code reads is
-- dropped or changed, so this is safe to apply before the new code is deployed.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PRODUCTS: real columns instead of a JSON string inside `description`
--    (`description` is left untouched as a legacy column for rollback safety)
-- ------------------------------------------------------------------------------
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS ref_code text,
  ADD COLUMN IF NOT EXISTS long_description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS compare_at_price numeric,
  ADD COLUMN IF NOT EXISTS international_price numeric,
  ADD COLUMN IF NOT EXISTS badge text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS fit text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS fabric text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS composition text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS care text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS rating numeric NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS review_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sizes jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS colors jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS images jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS features jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS extra jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Backfill the new columns from the legacy JSON kept in `description`
DO $$
DECLARE
  r record;
  m jsonb;
BEGIN
  FOR r IN SELECT id, slug, description FROM public.products WHERE description LIKE '{%' LOOP
    BEGIN
      m := r.description::jsonb;
    EXCEPTION WHEN others THEN
      CONTINUE;
    END;

    UPDATE public.products SET
      ref_code            = COALESCE(NULLIF(m->>'refCode', ''), r.slug),
      long_description    = COALESCE(m->>'description', ''),
      compare_at_price    = NULLIF(m->>'compareAtPrice', '')::numeric,
      international_price = NULLIF(m->>'internationalPrice', '')::numeric,
      badge               = COALESCE(m->>'badge', ''),
      fit                 = COALESCE(m->>'fit', ''),
      fabric              = COALESCE(m->>'fabric', ''),
      composition         = COALESCE(m->>'composition', ''),
      care                = COALESCE(m->>'care', ''),
      rating              = COALESCE(NULLIF(m->>'rating', '')::numeric, 5),
      review_count        = COALESCE(NULLIF(m->>'reviewCount', '')::numeric::integer, 0),
      sizes               = CASE WHEN jsonb_typeof(m->'sizes') = 'array' THEN m->'sizes' ELSE '[]'::jsonb END,
      colors              = CASE WHEN jsonb_typeof(m->'colors') = 'array' THEN m->'colors' ELSE '[]'::jsonb END,
      images              = CASE WHEN jsonb_typeof(m->'images') = 'array' THEN m->'images' ELSE '[]'::jsonb END,
      features            = CASE WHEN jsonb_typeof(m->'features') = 'array' THEN m->'features' ELSE '[]'::jsonb END,
      extra               = jsonb_strip_nulls(jsonb_build_object(
                              'image', m->'image',
                              'hoverImage', m->'hoverImage',
                              'leftShoulderImage', m->'leftShoulderImage',
                              'rightShoulderImage', m->'rightShoulderImage',
                              'gallery', m->'gallery',
                              'printLayers', m->'printLayers'
                            ))
    WHERE id = r.id;
  END LOOP;
END $$;

-- ------------------------------------------------------------------------------
-- 2. ORDERS: everything the checkout produces is stored, nothing lives in files
-- ------------------------------------------------------------------------------
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_number text,
  ADD COLUMN IF NOT EXISTS tracking_code text,
  ADD COLUMN IF NOT EXISTS delivery_address_line2 text,
  ADD COLUMN IF NOT EXISTS delivery_state text,
  ADD COLUMN IF NOT EXISTS delivery_postal_code text,
  ADD COLUMN IF NOT EXISTS delivery_country text DEFAULT 'Azərbaycan',
  ADD COLUMN IF NOT EXISTS delivery_country_code text,
  ADD COLUMN IF NOT EXISTS subtotal numeric,
  ADD COLUMN IF NOT EXISTS discount_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_method text,
  ADD COLUMN IF NOT EXISTS shipping_method_label text,
  ADD COLUMN IF NOT EXISTS estimated_delivery text,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'AZN',
  ADD COLUMN IF NOT EXISTS promo_code text,
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS provider text,
  ADD COLUMN IF NOT EXISTS provider_payment_id text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Digits-only phone, so customers can find an order whatever formatting they typed
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_phone_digits text
  GENERATED ALWAYS AS (regexp_replace(customer_phone, '\D', '', 'g')) STORED;

CREATE UNIQUE INDEX IF NOT EXISTS orders_order_number_key ON public.orders (order_number) WHERE order_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS orders_tracking_code_idx ON public.orders (tracking_code);
CREATE INDEX IF NOT EXISTS orders_customer_email_idx ON public.orders (lower(customer_email));
CREATE INDEX IF NOT EXISTS orders_customer_phone_digits_idx ON public.orders (customer_phone_digits);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders (created_at DESC);

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS product_id text,
  ADD COLUMN IF NOT EXISTS is_custom boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS custom_data jsonb;

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items (order_id);

-- ------------------------------------------------------------------------------
-- 3. CUSTOM PRINT (POD) ORDERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pod_orders (
  id text PRIMARY KEY,
  order_id text,
  customer_name text NOT NULL DEFAULT '',
  customer_phone text NOT NULL DEFAULT '',
  customer_email text NOT NULL DEFAULT '',
  garment_type text NOT NULL DEFAULT '',
  garment_color text NOT NULL DEFAULT '',
  size text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  placement text NOT NULL DEFAULT '',
  customer_note text NOT NULL DEFAULT '',
  original_image text NOT NULL DEFAULT '',
  preview_image text NOT NULL DEFAULT '',
  front_design jsonb NOT NULL DEFAULT '{}'::jsonb,
  back_design jsonb NOT NULL DEFAULT '{}'::jsonb,
  placement_data jsonb,
  custom_data jsonb,
  status text NOT NULL DEFAULT 'Pending Print',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pod_orders_order_id_idx ON public.pod_orders (order_id);
CREATE INDEX IF NOT EXISTS pod_orders_created_at_idx ON public.pod_orders (created_at DESC);

-- ------------------------------------------------------------------------------
-- 4. CATEGORIES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id text PRIMARY KEY,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  extra jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 5. PROMO CODES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id text PRIMARY KEY DEFAULT ('promo-' || replace(gen_random_uuid()::text, '-', '')),
  code text NOT NULL UNIQUE,
  type text NOT NULL DEFAULT 'percent' CHECK (type IN ('percent', 'fixed')),
  value numeric NOT NULL DEFAULT 0,
  min_amount numeric NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  description text NOT NULL DEFAULT '',
  uses integer NOT NULL DEFAULT 0,
  max_uses integer,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 6. SITE CONTENT & SETTINGS (key/value documents: 'content', 'settings')
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY
--    Every table is reached only through the server (service role), which bypasses
--    RLS. Enabling RLS with no policy blocks all direct anon/authenticated access.
-- ------------------------------------------------------------------------------
ALTER TABLE public.pod_orders    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
