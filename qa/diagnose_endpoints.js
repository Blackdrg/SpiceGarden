const axios = require('axios');
const jwt = require('jsonwebtoken');

async function testAll() {
  const base = 'http://localhost:3001';
  const secret = 'test_jwt_secret_for_development_only_32chars';
  const custToken = jwt.sign({ sub: 'usr_cust_1_0', email: 'cust@test.com', role: 'customer', status: 'active' }, secret);
  const adminToken = jwt.sign({ sub: 'usr_admin_1', email: 'admin@test.com', role: 'super_admin', status: 'active' }, secret);
  const kitchenToken = jwt.sign({ sub: 'usr_kitchen_1', email: 'kitchen@test.com', role: 'super_admin', status: 'active' }, secret);
  const driverToken = jwt.sign({ sub: 'usr_driver_1', email: 'driver@test.com', role: 'delivery_partner', status: 'active' }, secret);

  const endpoints = [
    { name: 'Browse: /restaurants', url: '/restaurants', headers: { Authorization: 'Bearer ' + custToken } },
    { name: 'Browse: /restaurants/mumbai-spice-kitchen', url: '/restaurants/mumbai-spice-kitchen', headers: { Authorization: 'Bearer ' + custToken } },
    { name: 'Browse: /menus/rest_mumbai_spice_01/items', url: '/menus/rest_mumbai_spice_01/items', headers: { Authorization: 'Bearer ' + custToken } },
    { name: 'Search: /restaurants/search?q=biryani', url: '/restaurants/search?q=biryani', headers: { Authorization: 'Bearer ' + custToken } },
    { name: 'Search: /restaurants/nearby?lat=19.0760&lng=72.8777&radius=5', url: '/restaurants/nearby?lat=19.0760&lng=72.8777&radius=5', headers: { Authorization: 'Bearer ' + custToken } },
    { name: 'Cart: /restaurants/mumbai-spice-kitchen', url: '/restaurants/mumbai-spice-kitchen', headers: { Authorization: 'Bearer ' + custToken } },
    { name: 'Cart: /user/addresses', url: '/user/addresses', headers: { Authorization: 'Bearer ' + custToken } },
    { name: 'Orders: /orders (POST)', method: 'POST', url: '/orders', headers: { Authorization: 'Bearer ' + custToken, 'Content-Type': 'application/json', 'x-idempotency-key': 'test_diag_1' }, data: { userId: 'usr_cust_1_0', restaurantId: 'rest_mumbai_spice_01', items: [{ id: 'item_hyderabadi_biryani_01', name: 'Biryani', price: 349, quantity: 1 }], subtotal: 349, tax: 17.45, deliveryFee: 40, grandTotal: 406.45, deliveryAddressId: 'addr_1' } },
    { name: 'Tracking: /orders/health', url: '/orders/health', headers: { Authorization: 'Bearer ' + custToken } },
    { name: 'Tracking: /fleet/performance', url: '/fleet/performance', headers: { Authorization: 'Bearer ' + driverToken } },
    { name: 'Admin: /admin/stats', url: '/admin/stats', headers: { Authorization: 'Bearer ' + adminToken } },
    { name: 'Admin: /admin/orders', url: '/admin/orders?page=1&limit=20', headers: { Authorization: 'Bearer ' + adminToken } },
    { name: 'Kitchen: /kitchen/sla/summary/branch_mum_01', url: '/kitchen/sla/summary/branch_mum_01?period=daily', headers: { Authorization: 'Bearer ' + kitchenToken } },
    { name: 'Kitchen: /kitchen/inventory/low-stock/branch_mum_01', url: '/kitchen/inventory/low-stock/branch_mum_01', headers: { Authorization: 'Bearer ' + kitchenToken } }
  ];

  for (const ep of endpoints) {
    try {
      const res = await axios({
        method: ep.method || 'GET',
        url: base + ep.url,
        headers: ep.headers,
        data: ep.data,
        validateStatus: () => true
      });
      console.log(`[STATUS ${res.status}] ${ep.name} -> ` + JSON.stringify(res.data).slice(0, 100));
    } catch (err) {
      console.log(`[ERR] ${ep.name}: ${err.message}`);
    }
  }
}

testAll();
