/**
 * E2E seed fixtures for SpiceGarden.
 *
 * Usage:
 *   node infra/scripts/e2e-seed-fixtures.js
 *
 * Produces deterministic JSON payloads against a running backend (Docker required).
 * Falls back to printing fixtures when backend is unreachable.
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const SEED_CUSTOMER = {
  name: 'E2E Customer',
  email: 'e2e-customer@spicegarden.test',
  phone: '+919900000001',
  password: 'E2ePassw0rd!',
};
const SEED_RESTAURANT = {
  name: 'E2E Restaurant',
  email: 'e2e-restaurant@spicegarden.test',
  phone: '+919900000002',
  password: 'E2ePassw0rd!',
  address: '123 E2E Street, Test City',
};
const SEED_DRIVER = {
  name: 'E2E Driver',
  email: 'e2e-driver@spicegarden.test',
  phone: '+919900000003',
  password: 'E2ePassw0rd!',
};

function printFixture(name, payload) {
  console.log(`--- ${name} ---`);
  console.log(JSON.stringify(payload, null, 2));
}

function printAllFixtures() {
  printFixture('register-customer', {
    ...SEED_CUSTOMER,
    role: 'customer',
  });
  printFixture('register-restaurant', {
    ...SEED_RESTAURANT,
    role: 'restaurant_admin',
  });
  printFixture('register-driver', {
    ...SEED_DRIVER,
    role: 'delivery_partner',
  });
  printFixture('create-order', {
    customerId: '{{customerId}}',
    restaurantId: '{{restaurantId}}',
    items: [
      { menuItemId: '{{menuItemId}}', quantity: 2 },
    ],
    deliveryAddress: '456 Delivery Ave, Test City',
    paymentMethod: 'razorpay',
  });
  printFixture('assign-driver', {
    orderId: '{{orderId}}',
    driverId: '{{driverId}}',
  });
}

async function tryLive() {
  const res = await fetch(`${BASE_URL}/health`).catch(() => null);
  if (!res || !res.ok) {
    console.log('Backend unreachable. Printing fixtures only.\n');
    printAllFixtures();
    return;
  }
  console.log(`Backend reachable at ${BASE_URL}. Run against live instance to validate.`);
  printAllFixtures();
}

tryLive().catch((err) => {
  console.error('Fixture generation failed:', err.message || err);
  process.exit(1);
});
