-- =========================================================
-- ATELIER DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('tshirt', 'hoodie', 'longsleeve', 'accessories')),
    gender TEXT NOT NULL DEFAULT 'unisex' CHECK (gender IN ('men', 'women', 'unisex')),
    is_new BOOLEAN DEFAULT false,
    in_stock BOOLEAN DEFAULT true,
    can_customize BOOLEAN DEFAULT true,
    composition TEXT,
    fit TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. PRODUCT VARIANTS (COLOR, SIZE, STOCK)
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    sku TEXT UNIQUE,
    color_name TEXT NOT NULL,
    color_hex TEXT NOT NULL,
    size TEXT NOT NULL,
    stock_quantity INTEGER DEFAULT 0 NOT NULL,
    price_override NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    color_name TEXT,
    view_type TEXT DEFAULT 'flat' CHECK (view_type IN ('flat', 'model', 'detail', '3d_texture')),
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. PROFILES (AUTH USERS)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    address TEXT,
    city TEXT DEFAULT 'Bakı',
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. CUSTOM DESIGNS (STUDIO CREATIONS)
CREATE TABLE IF NOT EXISTS custom_designs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    product_slug TEXT NOT NULL,
    color_name TEXT NOT NULL,
    size TEXT NOT NULL,
    design_json JSONB NOT NULL,
    print_file_url TEXT,
    preview_url TEXT,
    status TEXT DEFAULT 'göndərildi' CHECK (status IN ('göndərildi', 'təsdiqləndi', 'çapdadır', 'hazırdır', 'ləğv_edildi')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. ORDERS
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

-- 7. ORDER ITEMS (READY vs CUSTOM)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    custom_design_id UUID REFERENCES custom_designs(id) ON DELETE SET NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('ready', 'custom')),
    item_name TEXT NOT NULL,
    color TEXT NOT NULL,
    size TEXT NOT NULL,
    quantity INTEGER DEFAULT 1 NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    transaction_id TEXT UNIQUE NOT NULL,
    provider TEXT NOT NULL DEFAULT 'local_gateway',
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'AZN',
    status TEXT NOT NULL,
    response_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_custom_designs_status ON custom_designs(status);
