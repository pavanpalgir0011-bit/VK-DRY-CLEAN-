-- ==========================================================
-- VK DRY CLEAN — COMPLETE SUPABASE DATABASE SCHEMA (POSTGRESQL)
-- ==========================================================
-- Instructions:
-- 1. Log into your Supabase Dashboard (https://supabase.com/dashboard)
-- 2. Open your project -> Navigate to the "SQL Editor" in the left menu.
-- 3. Paste and run this script to create all tables, indexes, and initial data.
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(128) UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    phone VARCHAR(32) DEFAULT '',
    role VARCHAR(32) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    address TEXT DEFAULT '',
    city VARCHAR(128) DEFAULT '',
    state VARCHAR(128) DEFAULT 'Delhi',
    pincode VARCHAR(32) DEFAULT '',
    landmark VARCHAR(255) DEFAULT '',
    avatar TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. SERVICES CATALOG TABLE
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    category VARCHAR(128) NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    unit VARCHAR(64) DEFAULT 'Piece',
    image TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT TRUE,
    turnaround_time VARCHAR(128) DEFAULT '24-48 Hours',
    popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. BUSINESS & PRICING SETTINGS TABLE (Delivery Fee, GST, Store Info)
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_fee NUMERIC(10, 2) DEFAULT 50.00,
    free_delivery_threshold NUMERIC(10, 2) DEFAULT 499.00,
    gst_rate NUMERIC(5, 2) DEFAULT 5.00,
    gst_number VARCHAR(64) DEFAULT '07AAAAA0000A1Z5',
    store_phone VARCHAR(64) DEFAULT '+91 98765 43210',
    store_address TEXT DEFAULT '104, VK House, Connaught Place, New Delhi — 110001',
    store_email VARCHAR(255) DEFAULT 'care@vkdryclean.com',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(64) UNIQUE NOT NULL,
    invoice_number VARCHAR(64) UNIQUE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    customer JSONB NOT NULL,
    items JSONB NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    delivery_fee NUMERIC(10, 2) DEFAULT 0.00,
    gst_rate NUMERIC(5, 2) DEFAULT 5.00,
    gst_amount NUMERIC(10, 2) DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(64) DEFAULT 'Cash on Delivery',
    payment_status VARCHAR(32) DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid')),
    pickup_address JSONB NOT NULL,
    pickup_date VARCHAR(64) NOT NULL,
    pickup_time VARCHAR(64) NOT NULL,
    special_instructions TEXT DEFAULT '',
    status VARCHAR(64) DEFAULT 'Order Placed',
    status_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CONTACT INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(64) DEFAULT '',
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================================
-- DEFAULT SEED DATA (Clean 12 Services + Admin + Settings)
-- ==========================================================

-- Insert Default Settings
INSERT INTO public.settings (delivery_fee, free_delivery_threshold, gst_rate, gst_number, store_phone, store_address, store_email)
VALUES (50.00, 499.00, 5.00, '07AAAAA0000A1Z5', '+91 98765 43210', '104, VK House, Connaught Place, New Delhi — 110001', 'care@vkdryclean.com')
ON CONFLICT DO NOTHING;

-- Insert Production Admin (pavanpalgir0011@gmail.com)
INSERT INTO public.users (name, email, role, phone, city, address, pincode)
VALUES (
    'Pavan Pal',
    'pavanpalgir0011@gmail.com',
    'admin',
    '+91 98765 43210',
    'New Delhi',
    'VK Dry Clean Main Office, Connaught Place',
    '110001'
)
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Insert Base Clean 12 Services Catalog
INSERT INTO public.services (name, description, category, price, unit, image, is_active, turnaround_time, popular)
VALUES
('Standard Dry Cleaning', 'Specialized chemical wash and finish for delicate garments, blazers, and trousers.', 'Dry Cleaning', 100, 'Piece', 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&auto=format&fit=crop&q=80', true, '24-48 Hours', true),
('Shirt Wash & Fold', 'Deep sanitized wash, fabric conditioning, and crisp machine fold for shirts.', 'Wash & Fold', 50, 'Piece', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80', true, '24 Hours', true),
('Pant Wash & Press', 'Wash, stain removal, and sharp crease steam pressing for all trousers & chinos.', 'Wash & Fold', 60, 'Piece', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=80', true, '24 Hours', false),
('Steam Iron', 'High-temperature wrinkle removal and crease perfection without fabric damage.', 'Steam Iron', 15, 'Piece', 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=600&auto=format&fit=crop&q=80', true, '12-24 Hours', true),
('Suit Dry Cleaning (2 Pc)', 'Executive care for coat and trousers with micro-suction steam finish.', 'Dry Cleaning', 350, 'Set', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80', true, '48 Hours', true),
('Saree Dry Cleaning', 'Gentle hand-handling for silk, chiffon, georgette, and embroidered sarees.', 'Premium Care', 250, 'Piece', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80', true, '48 Hours', true),
('Heavy Blanket / Quilt', 'Deep dust-mite sterilization, anti-bacterial rinse, and fluff drying for heavy blankets.', 'Household', 300, 'Piece', 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80', true, '48-72 Hours', true),
('Shoe Deep Clean', 'Hand cleaning, sole revivor, deodorizing, and anti-fungal treatment for sneakers.', 'Footwear', 200, 'Pair', 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop&q=80', true, '48 Hours', true),
('Curtain Dry Cleaning', 'Dust extraction, gentle wash, and anti-static steam press per panel.', 'Household', 100, 'Piece', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80', true, '48-72 Hours', false),
('Woolen Sweater Cleaning', 'Zero-shrinkage specialized conditioning for pashmina, cashmere, and woolen knits.', 'Dry Cleaning', 140, 'Piece', 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&auto=format&fit=crop&q=80', true, '48 Hours', false),
('Designer Sherwani / Lehenga', 'Heavy stonework and zari preservation with bespoke hand dry-cleaning.', 'Premium Care', 550, 'Piece', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80', true, '72 Hours', false),
('Carpet Deep Extraction', 'Industrial shampooing, stain lifting, and moisture-free dry vacuuming.', 'Household', 400, 'Piece', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80', true, '72 Hours', false)
ON CONFLICT DO NOTHING;

-- Create indexes for super-fast lookups
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(is_active);
