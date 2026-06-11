-- Seed: Restaurants, branches, menu categories, and menu items
-- Idempotent: uses ON CONFLICT DO NOTHING

-- Restaurants (hardcoded UUIDs for consistency with existing seeder)
INSERT INTO restaurants (id, name, slug, address, phone, is_active)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Spice Garden - Downtown', 'downtown', 'Downtown Branch', '+1234567890', true),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Spice Garden - Mall Road', 'mall-road', 'Mall Road Branch', '+1234567891', true),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Spice Garden - Gulshan', 'gulshan', 'Gulshan Branch', '+1234567892', true)
ON CONFLICT (id) DO NOTHING;

-- Branches
INSERT INTO restaurant_branches (id, restaurant_id, branch_name, address, location, opening_time, closing_time, is_online)
VALUES
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Downtown Branch', '123 Main Street, Downtown', '{"lat": 30.7333, "lng": 76.7794}', '10:00:00', '23:00:00', true),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Mall Road Branch', '456 Mall Road, Shopping District', '{"lat": 30.74, "lng": 76.78}', '09:00:00', '22:00:00', true),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Gulshan Branch', '789 Gulshan Avenue, Upmarket District', '{"lat": 30.72, "lng": 76.77}', '11:00:00', '23:30:00', true)
ON CONFLICT (id) DO NOTHING;

-- Menu Categories
INSERT INTO menu_categories (id, branch_id, name, description, sort_order, is_active)
VALUES
    (uuid_generate_v4(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Main Course', 'Signature dishes', 1, true),
    (uuid_generate_v4(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Sides', 'Accompaniments', 2, true),
    (uuid_generate_v4(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Main Course', 'Fast food favorites', 1, true),
    (uuid_generate_v4(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Beverages', 'Refreshing drinks', 2, true),
    (uuid_generate_v4(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'Main Course', 'Italian & Continental', 1, true),
    (uuid_generate_v4(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'Appetizers', 'Light starters', 2, true)
ON CONFLICT DO NOTHING;

-- Menu Items (Downtown)
INSERT INTO menu_items (id, category_id, name, description, base_price, image_url, is_veg, spice_level, status)
SELECT uuid_generate_v4(), mc.id, 'Chicken Biryani', 'Aromatic basmati rice with tender chicken', 350.00, null, false, 3, 'available'
FROM menu_categories mc WHERE mc.name = 'Main Course' AND mc.branch_id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (id, category_id, name, description, base_price, image_url, is_veg, spice_level, status)
SELECT uuid_generate_v4(), mc.id, 'Beef Karahi', 'Traditional beef curry cooked in wok', 420.00, null, false, 4, 'available'
FROM menu_categories mc WHERE mc.name = 'Main Course' AND mc.branch_id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (id, category_id, name, description, base_price, image_url, is_veg, spice_level, status)
SELECT uuid_generate_v4(), mc.id, 'Dal Makhani', 'Creamy black lentils', 280.00, null, true, 2, 'available'
FROM menu_categories mc WHERE mc.name = 'Main Course' AND mc.branch_id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (id, category_id, name, description, base_price, image_url, is_veg, spice_level, status)
SELECT uuid_generate_v4(), mc.id, 'Garlic Naan', 'Fresh baked bread with garlic', 40.00, null, true, 1, 'available'
FROM menu_categories mc WHERE mc.name = 'Sides' AND mc.branch_id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
ON CONFLICT DO NOTHING;

-- Menu Items (Mall Road)
INSERT INTO menu_items (id, category_id, name, description, base_price, image_url, is_veg, spice_level, status)
SELECT uuid_generate_v4(), mc.id, 'Zinger Burger', 'Spicy crispy chicken burger', 250.00, null, false, 3, 'available'
FROM menu_categories mc WHERE mc.name = 'Main Course' AND mc.branch_id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (id, category_id, name, description, base_price, image_url, is_veg, spice_level, status)
SELECT uuid_generate_v4(), mc.id, 'Chicken Burger', 'Grilled chicken burger', 220.00, null, false, 2, 'available'
FROM menu_categories mc WHERE mc.name = 'Main Course' AND mc.branch_id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (id, category_id, name, description, base_price, image_url, is_veg, spice_level, status)
SELECT uuid_generate_v4(), mc.id, 'Large Fries', 'Crispy golden fries', 120.00, null, true, 0, 'available'
FROM menu_categories mc WHERE mc.name = 'Main Course' AND mc.branch_id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (id, category_id, name, description, base_price, image_url, is_veg, spice_level, status)
SELECT uuid_generate_v4(), mc.id, 'Chocolate Shake', 'Rich chocolate milkshake', 180.00, null, true, 0, 'available'
FROM menu_categories mc WHERE mc.name = 'Beverages' AND mc.branch_id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'
ON CONFLICT DO NOTHING;

-- Menu Items (Gulshan)
INSERT INTO menu_items (id, category_id, name, description, base_price, image_url, is_veg, spice_level, status)
SELECT uuid_generate_v4(), mc.id, 'Margherita Pizza', 'Classic tomato and mozzarella', 380.00, null, true, 1, 'available'
FROM menu_categories mc WHERE mc.name = 'Main Course' AND mc.branch_id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (id, category_id, name, description, base_price, image_url, is_veg, spice_level, status)
SELECT uuid_generate_v4(), mc.id, 'Pepperoni Pizza', 'Spicy pepperoni topping', 450.00, null, false, 2, 'available'
FROM menu_categories mc WHERE mc.name = 'Main Course' AND mc.branch_id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (id, category_id, name, description, base_price, image_url, is_veg, spice_level, status)
SELECT uuid_generate_v4(), mc.id, 'Pasta Alfredo', 'Creamy white sauce pasta', 320.00, null, true, 0, 'available'
FROM menu_categories mc WHERE mc.name = 'Main Course' AND mc.branch_id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (id, category_id, name, description, base_price, image_url, is_veg, spice_level, status)
SELECT uuid_generate_v4(), mc.id, 'Caesar Salad', 'Romaine with parmesan', 220.00, null, false, 0, 'available'
FROM menu_categories mc WHERE mc.name = 'Appetizers' AND mc.branch_id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23'
ON CONFLICT DO NOTHING;
