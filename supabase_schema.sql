-- ==========================================================
-- WASH & WOW — COMPLETE SUPABASE DATABASE SCHEMA (POSTGRESQL)
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
    gst_rate NUMERIC(5, 2) DEFAULT 0.00,
    gst_number VARCHAR(64) DEFAULT '',
    store_phone VARCHAR(64) DEFAULT '+91 85868 25438',
    store_address TEXT DEFAULT 'Noida Sec 68, Garhi Chaukhandi, Uttar Pradesh 201301',
    store_email VARCHAR(255) DEFAULT 'jkmdryclean68@gmail.com',
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
VALUES (50.00, 499.00, 0.00, '', '+91 85868 25438', 'Noida Sec 68, Garhi Chaukhandi, Uttar Pradesh 201301', 'jkmdryclean68@gmail.com')
ON CONFLICT DO NOTHING;

-- Insert Production Admin (pavanpalgir0011@gmail.com)
INSERT INTO public.users (name, email, role, phone, city, address, pincode)
VALUES (
    'Pavan Pal',
    'pavanpalgir0011@gmail.com',
    'admin',
    '+91 85868 25438',
    'Noida',
    'Noida Sec 68, Garhi Chaukhandi, Uttar Pradesh 201301',
    '201301'
)
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Insert Wash & Wow 60 Services Catalog (10 products per category across 6 categories)
INSERT INTO public.services (name, description, category, price, unit, image, is_active, turnaround_time, popular)
VALUES
('Men''s 2-Piece Suit (Coat + Pant)', 'Executive dry cleaning with closed-loop hydrocarbon solvent, stain removal, and micro-suction steam pressing for coat and trousers.', 'Dry Cleaning', 350, 'Set', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80', true, '48 Hours', true),
('Men''s 3-Piece Suit (Coat + Waistcoat + Pant)', 'Complete three-piece formal suit dry cleaning with specialized lapel shaping, waistcoat rejuvenation, and sharp crease press.', 'Dry Cleaning', 450, 'Set', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80', true, '48-72 Hours', true),
('Blazer / Sports Coat', 'Premium blazer dry cleaning with inner lining disinfection, shoulder pad contour retention, and zero-shine steam finish.', 'Dry Cleaning', 220, 'Piece', 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=600&auto=format&fit=crop&q=80', true, '48 Hours', false),
('Executive Formal Shirt', 'Delicate chemical wash for formal shirts, cuff and collar grime removal, followed by German tension steam pressing.', 'Dry Cleaning', 90, 'Piece', 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80', true, '24-48 Hours', false),
('Formal Trousers / Chinos', 'Gentle dry cleaning for trousers, food/oil stain spotting, fiber softening, and long-lasting knife-edge crease alignment.', 'Dry Cleaning', 110, 'Piece', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=80', true, '24-48 Hours', false),
('Puffer Jacket / Winter Bomber', 'Specialized down-feather and polyfill safe wash that restores puffiness, repels water stains, and deodorizes thoroughly.', 'Dry Cleaning', 280, 'Piece', 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&auto=format&fit=crop&q=80', true, '48 Hours', true),
('Heavy Trench Coat / Overcoat', 'Full-length overcoat dry cleaning with moth-proofing, deep dust-trap cleaning, and structured mannequin steaming.', 'Dry Cleaning', 380, 'Piece', 'https://images.unsplash.com/photo-1539533018447-63fcce667883?w=600&auto=format&fit=crop&q=80', true, '48-72 Hours', false),
('Woolen Sweater / Pullover', 'Zero-shrinkage conditioning for pure wool, angora, and cashmere knitwear. Prevents pilling and restores soft touch.', 'Dry Cleaning', 140, 'Piece', 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&auto=format&fit=crop&q=80', true, '48 Hours', true),
('Ethnic Kurta Pajama (Men)', 'Dry cleaning for traditional cotton, raw silk, and linen kurta pajamas with crisp starch balancing and steam finish.', 'Dry Cleaning', 190, 'Set', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80', true, '48 Hours', false),
('Ladies Designer Top / Blouse', 'Gentle solvent care for chiffon, crepe, organza, and embroidered blouses with lace and button protection.', 'Dry Cleaning', 120, 'Piece', 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&auto=format&fit=crop&q=80', true, '24-48 Hours', false),
('Daily Wash & Fold (By Weight / KG)', 'Everyday laundry washed with bio-detergents and fabric softener, tumble dried, and neatly machine-folded by kilogram.', 'Wash & Fold', 89, 'Kg', 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=600&auto=format&fit=crop&q=80', true, '24-48 Hours', true),
('Casual Shirt (Wash & Fold)', 'Sanitized water wash with collar scrubbing, gentle fabric conditioning, and crisp square fold ready for the wardrobe.', 'Wash & Fold', 50, 'Piece', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80', true, '24 Hours', true),
('T-Shirt / Polo (Wash & Fold)', 'Color-protecting enzyme wash for round neck and polo tees with zero collar twisting or color fade.', 'Wash & Fold', 45, 'Piece', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80', true, '24 Hours', true),
('Jeans / Denim Trousers (Wash & Fold)', 'Deep denim cleansing that protects indigo pigments, cleans heavy soil from cuffs, and delivers clean tumble-dried jeans.', 'Wash & Fold', 65, 'Piece', 'https://images.unsplash.com/photo-1542272604-780c96856592?w=600&auto=format&fit=crop&q=80', true, '24-48 Hours', false),
('Casual Trousers / Chinos (Wash & Fold)', 'Gentle wash cycle with anti-wrinkle conditioning and neat fold for chinos, khakis, and cargo pants.', 'Wash & Fold', 60, 'Piece', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=80', true, '24 Hours', false),
('Cotton Kurti (Wash & Fold)', 'Daily wear cotton and rayon kurtis washed with mild conditioning agents to retain bright colors and soft texture.', 'Wash & Fold', 55, 'Piece', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80', true, '24 Hours', false),
('Shorts / Track Pants / Bermudas', 'Fresh hygiene wash for gym tracks, running shorts, and sleep bermudas with antimicrobial rinse.', 'Wash & Fold', 45, 'Piece', 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&auto=format&fit=crop&q=80', true, '24 Hours', false),
('Bath Towel / Hand Towel (Wash & Fold)', 'Thermal disinfection wash for plush cotton towels followed by warm air tumble drying for ultimate fluffiness.', 'Wash & Fold', 40, 'Piece', 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=600&auto=format&fit=crop&q=80', true, '24 Hours', false),
('Gym & Sports Activewear', 'Sweat odor eliminator wash designed specifically for spandex, polyester, and Dri-FIT workout apparel.', 'Wash & Fold', 50, 'Piece', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80', true, '24 Hours', false),
('Nightwear / Pajama Set (Wash & Fold)', 'Complete sleep set wash with calming lavender fabric softening and wrinkle-free fold.', 'Wash & Fold', 70, 'Set', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80', true, '24 Hours', false),
('Shirt Steam Press', 'High-temperature steam pressing with crisp collar, cuff, and placket perfection without scorching or shine marks.', 'Steam Iron', 15, 'Piece', 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=600&auto=format&fit=crop&q=80', true, '12-24 Hours', true),
('Pant / Trouser Steam Press', 'Dual-vacuum industrial table pressing that delivers razor-sharp front and back leg crease alignment.', 'Steam Iron', 18, 'Piece', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=80', true, '12-24 Hours', true),
('Jeans / Denim Steam Press', 'Heavy steam penetration for thick denim fabric, smoothing pockets, seams, and waistband.', 'Steam Iron', 20, 'Piece', 'https://images.unsplash.com/photo-1542272604-780c96856592?w=600&auto=format&fit=crop&q=80', true, '12-24 Hours', false),
('T-Shirt / Polo Steam Press', 'Gentle temperature steam gliding to remove all wrinkles and creases without stretching necklines.', 'Steam Iron', 15, 'Piece', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80', true, '12-24 Hours', false),
('Ethnic Kurta Steam Press', 'Extended flatbed steam alignment for cotton, silk, and linen kurtas, preserving embroidery and buttons.', 'Steam Iron', 25, 'Piece', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80', true, '12-24 Hours', true),
('Saree Steam Press (Standard)', 'Uniform roller steam pressing that flattens wrinkles across 6 yards of fabric without damaging pallu or borders.', 'Steam Iron', 60, 'Piece', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80', true, '24 Hours', true),
('Suit / Blazer Steam Press', 'Form-finishing steam mannequin press that restores 3D shoulder shape, chest drape, and lapel curvature.', 'Steam Iron', 100, 'Piece', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80', true, '24 Hours', false),
('Ladies Salwar Suit Steam Press', 'Complete 3-piece pressing for kameez, bottom/salwar, and dupatta with wrinkle-free packaging.', 'Steam Iron', 40, 'Set', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80', true, '24 Hours', false),
('Bedsheet Steam Press (Single/Double)', 'Industrial flatwork ironer pressing that delivers crisp five-star hotel quality finish to bed linens.', 'Steam Iron', 50, 'Piece', 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80', true, '24 Hours', false),
('Curtain Steam Press (Per Panel)', 'Vertical heavy steam finish to remove packing wrinkles and crease folds on home curtains.', 'Steam Iron', 70, 'Piece', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80', true, '24 Hours', false),
('Pure Silk Saree Dry Clean', 'Bespoke hand dry-cleaning for Banarasi, Kanjeevaram, and Tussar silks using zero-water Italian hydrocarbon solvents.', 'Premium Care', 250, 'Piece', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80', true, '48 Hours', true),
('Heavy Zari / Embroidered Saree', 'Ultrasonic spot lifting and mesh net wrapping for heavy golden zari, beadwork, and cutdana embroidery.', 'Premium Care', 350, 'Piece', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80', true, '48-72 Hours', true),
('Bridal Wedding Lehenga Set', 'Royal bridal couture cleaning for lehenga skirt, embellished choli, and dual dupattas with acid-free tissue wrapping.', 'Premium Care', 750, 'Set', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80', true, '72 Hours', true),
('Designer Groom Sherwani Set', 'Specialist dry clean for raw silk, jacquard, and velvet sherwanis with jeweled button preservation and churidar press.', 'Premium Care', 550, 'Set', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80', true, '72 Hours', true),
('Pashmina & Cashmere Shawl Care', 'Ultra-gentle temperature-controlled conditioning that protects fragile goat hair fibers and natural cashmere softness.', 'Premium Care', 220, 'Piece', 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&auto=format&fit=crop&q=80', true, '48 Hours', false),
('Genuine Leather Jacket Restoration', 'Deep surface dirt removal, leather hydration balm treatment, color enhancement, and water-repellent seal.', 'Premium Care', 650, 'Piece', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80', true, '4-5 Days', false),
('Evening Gown / Anarkali Dress', 'Multi-layer flare care for satin, net, and velvet ball gowns with delicate hand spotting and hemline stain extraction.', 'Premium Care', 390, 'Piece', 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=600&auto=format&fit=crop&q=80', true, '48-72 Hours', false),
('Tuxedo (With Silk/Satin Lapels)', 'Black-tie tuxedo chemical dry clean with specialized sheen protection on satin lapels and trousers braid.', 'Premium Care', 480, 'Set', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80', true, '48 Hours', false),
('Saree Roll Polish & Charak', 'Traditional heated roller calendering polish that restores natural silk shine and smooth fall without chemical damage.', 'Premium Care', 180, 'Piece', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80', true, '48 Hours', false),
('Heavy Embellished Dupatta / Chunni', 'Hand cleaning for net, organza, and velvet dupattas with gota-patti and sequin work.', 'Premium Care', 130, 'Piece', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80', true, '24-48 Hours', false),
('Double Blanket / Quilt / Razai', 'Anti-bacterial steam cleaning, dust mite extermination, and high-volume warm air fluff drying for king/queen blankets.', 'Household', 300, 'Piece', 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80', true, '48-72 Hours', true),
('Single Blanket / Comforter', 'Deep fiber sanitization, stain spot removal, and fragrant tumble drying for single beds and winter dohars.', 'Household', 200, 'Piece', 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80', true, '48 Hours', false),
('Double Bedsheet Set (With 2 Pillows)', 'Deep bio-wash to remove body oils and sweat, fabric brightening treatment, and crisp flatwork iron pressing.', 'Household', 120, 'Set', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop&q=80', true, '24-48 Hours', true),
('Single Bedsheet (With 1 Pillow)', 'Hygienic disinfectant wash with hot water rinse and smooth flatbed pressing.', 'Household', 80, 'Set', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop&q=80', true, '24-48 Hours', false),
('Window Curtains (Per Panel)', 'High-suction dust extraction followed by gentle solvent wash and anti-static vertical steam pressing per panel.', 'Household', 100, 'Piece', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80', true, '48-72 Hours', true),
('Door & Blackout Curtains (Per Panel)', 'Heavy thermal drape cleaning that lifts environmental pollutants without peeling light-blocking rubber backing.', 'Household', 150, 'Piece', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80', true, '48-72 Hours', false),
('Carpet & Rug Deep Cleaning (Per Sq. Ft.)', 'Industrial rotary shampooing, active stain lifting, hot water extraction, and rapid moisture-free drying.', 'Household', 35, 'Sq Ft', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80', true, '3-4 Days', false),
('Sofa / Cushion Cover (Set of 5)', 'Fabric-safe stain removal for living room sofa cushion covers with anti-allergen treatment.', 'Household', 150, 'Set', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop&q=80', true, '24-48 Hours', false),
('Mattress Protector / Topper', 'Waterproof membrane safe sanitization, anti-dust-mite treatment, and deodorizing rinse.', 'Household', 220, 'Piece', 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80', true, '48 Hours', false),
('Bed Pillow / Cushion (Wash & Fluff)', 'Pillow core wash, sweat stain extraction, and ultra-fluff air drying with soothing fragrance.', 'Household', 90, 'Piece', 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80', true, '24-48 Hours', false),
('Sneakers Deep Clean & Deodorize', 'Detailed hand scrub, midsole brightening, lace wash, insole sterilization, and anti-fungal UV deodorizing treatment.', 'Footwear', 200, 'Pair', 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop&q=80', true, '48 Hours', true),
('Formal Leather Shoes Spa & Polish', 'Gentle leather wax cleansing, crease reduction, natural essential oil nourishment, and hand buffed mirror-shine polish.', 'Footwear', 250, 'Pair', 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&auto=format&fit=crop&q=80', true, '48 Hours', true),
('Suede & Nubuck Shoe Restoration', 'Specialist brass-bristle suede nap rejuvenation, liquid stain eraser, color revival spray, and nano water-barrier coat.', 'Footwear', 300, 'Pair', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80', true, '48-72 Hours', true),
('Sports & Running Shoes Cleaning', 'Breathable mesh stain extraction, odor-neutralizing insole rinse, and high-traction sole dirt removal.', 'Footwear', 180, 'Pair', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80', true, '48 Hours', false),
('Canvas Shoes (Converse / Vans) Wash', 'Deep soil scrub for canvas uppers, white rubber sidewall restoration, and brand-new lace brightening.', 'Footwear', 160, 'Pair', 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop&q=80', true, '48 Hours', false),
('Winter Boots / High Tops Care', 'Heavy mud and salt extraction, ankle collar sanitization, and moisture-resistant conditioning for tall boots.', 'Footwear', 290, 'Pair', 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&auto=format&fit=crop&q=80', true, '48-72 Hours', false),
('Casual Loafers & Slip-Ons', 'Insole disinfectant rinse, outer fabric stain lifting, and moisture-shield protective spray.', 'Footwear', 200, 'Pair', 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&auto=format&fit=crop&q=80', true, '48 Hours', false),
('Ladies Heels & Party Stilettos', 'Delicate care for satin, patent, and glitter party heels with sole grime removal and heel-tip protection.', 'Footwear', 220, 'Pair', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80', true, '48 Hours', false),
('Ethnic Mojaris / Juttis Cleaning', 'Embroidery and zari thread protection, hand foam cleaning, and leather sole softening for traditional wedding juttis.', 'Footwear', 190, 'Pair', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80', true, '48 Hours', false),
('Sole Un-Yellowing & Scuff Eraser', 'Special chemical de-oxidation therapy that turns yellowed rubber soles back to icy white.', 'Footwear', 150, 'Pair', 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop&q=80', true, '24-48 Hours', false)
ON CONFLICT DO NOTHING;

-- Create indexes for super-fast lookups
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(is_active);
