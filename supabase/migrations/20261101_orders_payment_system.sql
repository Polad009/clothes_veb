-- ==============================================================================
-- HORVVALLE E-COMMERCE: PAYMENT & ORDER SYSTEM MIGRATION
-- ==============================================================================

-- 1. Ensure columns exist on orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS is_test boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'AZN',
ADD COLUMN IF NOT EXISTS promo_code text,
ADD COLUMN IF NOT EXISTS provider text DEFAULT 'mock',
ADD COLUMN IF NOT EXISTS provider_payment_id text;

-- 2. Ensure order_items table has product snapshot columns
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS product_id text,
ADD COLUMN IF NOT EXISTS is_custom boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS custom_data jsonb;

-- 3. Row Level Security (RLS) setup
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Drop old conflicting policies if any
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
DROP POLICY IF EXISTS "Users can read own order items" ON order_items;

-- Users can view their own orders (based on authenticated user_id)
CREATE POLICY "Users can read own orders" ON orders
FOR SELECT
USING (auth.uid() = user_id);

-- Users can view their own order items
CREATE POLICY "Users can read own order items" ON order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- Service role bypasses RLS automatically in Supabase, allowing backend API full access.

