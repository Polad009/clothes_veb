-- =========================================================
-- ATELIER SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================

-- Enable RLS on all core tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. PRODUCTS POLICIES (Public read, Admin write)
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (is_admin());

-- 2. PRODUCT VARIANTS & IMAGES POLICIES
CREATE POLICY "Public can view product variants"
  ON product_variants FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage product variants"
  ON product_variants FOR ALL
  USING (is_admin());

CREATE POLICY "Public can view product images"
  ON product_images FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage product images"
  ON product_images FOR ALL
  USING (is_admin());

-- 3. PROFILES POLICIES
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 4. CUSTOM DESIGNS POLICIES
CREATE POLICY "Users can view own custom designs or admin"
  ON custom_designs FOR SELECT
  USING (auth.uid() = user_id OR is_admin() OR user_id IS NULL);

CREATE POLICY "Users can insert custom designs"
  ON custom_designs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update custom designs status"
  ON custom_designs FOR UPDATE
  USING (is_admin());

-- 5. ORDERS & ORDER ITEMS POLICIES
CREATE POLICY "Users can view own orders or admin"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (is_admin());

CREATE POLICY "Users can view own order items or admin"
  ON order_items FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- 6. PAYMENTS POLICIES
CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (is_admin());

CREATE POLICY "System can insert payments"
  ON payments FOR INSERT
  WITH CHECK (true);
