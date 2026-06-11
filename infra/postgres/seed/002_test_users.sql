-- Seed: Sample users for testing
-- Idempotent: uses ON CONFLICT DO NOTHING

-- Admin user (password: admin123 - change in production)
INSERT INTO users (id, email, phone, password_hash, full_name, role)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'admin@spicegarden.com', '+919999999999', '$2b$10$dummy.hash.for.testing', 'System Admin', 'admin'),
    ('22222222-2222-2222-2222-222222222222', 'support@spicegarden.com', '+919999999998', '$2b$10$dummy.hash.for.testing', 'Support Staff', 'support_staff'),
    ('33333333-3333-3333-3333-333333333333', 'finance@spicegarden.com', '+919999999997', '$2b$10$dummy.hash.for.testing', 'Finance Staff', 'finance_staff'),
    ('44444444-4444-4444-4444-444444444444', 'kitchen@spicegarden.com', '+919999999996', '$2b$10$dummy.hash.for.testing', 'Kitchen Staff', 'kitchen_staff')
ON CONFLICT (email) DO NOTHING;

-- Customer users
INSERT INTO users (id, email, phone, password_hash, full_name, role)
VALUES
    ('55555555-5555-5555-5555-555555555555', 'customer1@test.com', '+919999999995', '$2b$10$dummy.hash.for.testing', 'Test Customer One', 'customer'),
    ('66666666-6666-6666-6666-666666666666', 'customer2@test.com', '+919999999994', '$2b$10$dummy.hash.for.testing', 'Test Customer Two', 'customer')
ON CONFLICT (email) DO NOTHING;

-- Restaurant user accounts (linked to restaurants)
INSERT INTO users (id, email, phone, password_hash, full_name, role)
SELECT
    '77777777-7777-7777-7777-777777777777',
    'restaurant-downtown@spicegarden.com',
    '+919999999993',
    '$2b$10$dummy.hash.for.testing',
    'Downtown Manager',
    'restaurant'
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, email, phone, password_hash, full_name, role)
SELECT
    '88888888-8888-8888-8888-888888888888',
    'restaurant-mallroad@spicegarden.com',
    '+919999999992',
    '$2b$10$dummy.hash.for.testing',
    'Mall Road Manager',
    'restaurant'
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, email, phone, password_hash, full_name, role)
SELECT
    '99999999-9999-9999-9999-999999999999',
    'restaurant-gulshan@spicegarden.com',
    '+919999999991',
    '$2b$10$dummy.hash.for.testing',
    'Gulshan Manager',
    'restaurant'
ON CONFLICT (email) DO NOTHING;
