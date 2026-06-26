import argon2 from 'argon2';
import { Client } from 'pg';

const DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  user: 'spicegarden',
  password: 'spicegarden_dev_password',
  database: 'spicegarden',
};

const API_BASE = 'http://localhost:3001';

async function waitForBackend() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error('Backend did not become ready in time');
}

async function seedUser(name: string, email: string, password: string, role: string) {
  const checkRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (checkRes.ok) {
    console.log(`[SKIP] User ${email} already exists`);
    return checkRes.json();
  }
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, phone: '+1234567890', fullName: name }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to seed user ${email}: ${res.status} ${text}`);
  }
  return res.json();
}

async function seedRestaurants(pg: Client) {
  await pg.query(`
    INSERT INTO restaurants (id, name, slug, description, status, location, "createdAt", "updatedAt")
    VALUES
      ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Spice Garden - Downtown', 'downtown', 'Downtown Branch', 'active', '{"lat": 40.7128, "lng": -74.0060}', NOW(), NOW()),
      ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Spice Garden - Mall Road', 'mall-road', 'Mall Road Branch', 'active', '{"lat": 40.7138, "lng": -74.0070}', NOW(), NOW()),
      ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Spice Garden - Gulshan', 'gulshan', 'Gulshan Branch', 'active', '{"lat": 40.7148, "lng": -74.0080}', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, status = EXCLUDED.status;
  `);
}

async function seedBranches(pg: Client) {
  await pg.query(`
    INSERT INTO restaurant_branches (id, "restaurantId", "branchName", address, "openingTime", "closingTime", "isOnline", location, "createdAt", "updatedAt")
    VALUES
      ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Downtown Main', '123 Main St', '09:00:00', '22:00:00', true, '(-74.0060,40.7128)', NOW(), NOW()),
      ('b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Mall Road Branch', '456 Mall Rd', '10:00:00', '23:00:00', true, '(-74.0070,40.7138)', NOW(), NOW()),
      ('b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Gulshan Branch', '789 Gulshan Ave', '11:00:00', '00:00:00', true, '(-74.0080,40.7148)', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
  `);
}

async function seedMenuItems(pg: Client) {
  await pg.query(`
    INSERT INTO menu_items (id, name, description, "basePrice", "categoryId", status, "createdAt", "updatedAt")
    VALUES
      ('11111111-1111-1111-1111-111111111111', 'Butter Chicken', 'Creamy tomato curry', 12.99, 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'available', NOW(), NOW()),
      ('22222222-2222-2222-2222-222222222222', 'Naan Bread', 'Fresh baked naan', 3.99, 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'available', NOW(), NOW()),
      ('33333333-3333-3333-3333-333333333333', 'Biryani', 'Aromatic rice dish', 14.99, 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'available', NOW(), NOW()),
      ('44444444-4444-4444-4444-444444444444', 'Paneer Tikka', 'Grilled cottage cheese', 10.99, 'c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'available', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
  `);
}

async function seedMenuCategories(pg: Client) {
  await pg.query(`
    INSERT INTO menu_categories (id, name, "sortOrder", "branchId", "createdAt", "updatedAt")
    VALUES
      ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Main Course', 1, 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW(), NOW()),
      ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Breads', 2, 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW(), NOW()),
      ('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Rice', 1, 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NOW(), NOW()),
      ('c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Starters', 1, 'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
  `);
}

async function main() {
  console.log('=== SpiceGarden Local Seed ===');

  console.log('[STEP] Waiting for backend...');
  await waitForBackend();
  console.log('[OK] Backend is ready');

  const pg = new Client(DB_CONFIG);
  await pg.connect();
  console.log('[OK] Connected to PostgreSQL');

  try {
    console.log('[STEP] Seeding users...');
    const customer = await seedUser('Test Customer', 'customer@test.com', 'password123', 'customer');
    console.log(`[OK] Seeded customer: customer@test.com / password123`);

    const admin = await seedUser('Test Admin', 'admin@test.com', 'password123', 'admin');
    console.log(`[OK] Seeded admin: admin@test.com / password123`);

    const operator = await seedUser('Test Operator', 'operator@test.com', 'password123', 'restaurant');
    console.log(`[OK] Seeded operator: operator@test.com / password123`);

    const driver = await seedUser('Test Driver', 'driver@test.com', 'password123', 'driver');
    console.log(`[OK] Seeded driver: driver@test.com / password123`);

    console.log('[STEP] Seeding restaurants...');
    await seedRestaurants(pg);
    console.log('[OK] Seeded 3 restaurants');

    console.log('[STEP] Seeding branches...');
    await seedBranches(pg);
    console.log('[OK] Seeded 3 branches');

    console.log('[STEP] Seeding menu categories...');
    await seedMenuCategories(pg);
    console.log('[OK] Seeded menu categories');

    console.log('[STEP] Seeding menu items...');
    await seedMenuItems(pg);
    console.log('[OK] Seeded menu items');

    console.log('\n=== Seed Complete ===');
    console.log('Demo accounts:');
    console.log('  Customer:  customer@test.com / password123');
    console.log('  Admin:     admin@test.com / password123');
    console.log('  Operator:  operator@test.com / password123');
    console.log('  Driver:    driver@test.com / password123');
  } finally {
    await pg.end();
  }
}

main().catch((err) => {
  console.error('[FATAL] Seed failed:', err);
  process.exit(1);
});
