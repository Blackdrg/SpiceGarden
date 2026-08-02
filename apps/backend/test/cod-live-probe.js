const http = require('http');
const crypto = require('crypto');

const BASE = 'http://localhost:3001';
let customerToken = null;
let driverToken = null;
let customerId = null;
let orderId = null;

function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    const r = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

async function psqlUpdate(query) {
  const { execSync } = require('child_process');
  const cmd = `docker compose -f D:/SpiceGarden/compose.dev.yaml exec -T postgres psql -U spicegarden -d spicegarden -c "${query.replace(/"/g, '\\"')}"`;
  try {
    const out = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return out.trim();
  } catch (e) {
    return e.stderr?.toString() || e.message;
  }
}

async function main() {
  const timestamp = `${Date.now()}_${process.pid}`;
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const customerEmail = `codprobe_c_${timestamp}_${randomSuffix}@test.local`;
  const dpEmail = `codprobe_dp_${timestamp}_${randomSuffix}@test.local`;
  const customerPhone = `+91${Math.floor(Math.random() * 9000000000 + 1000000000)}`;
  const dpPhone = `+91${Math.floor(Math.random() * 9000000000 + 1000000000)}`;
  const password = 'TestPass123!';

  console.log('=== COD Live Probe (post-fix) ===\n');

  // 1. Register customer
  console.log('1. Register customer');
  let res = await req('POST', '/v1/auth/register', { email: customerEmail, password, fullName: 'COD Probe Customer', phone: customerPhone });
  console.log(`   POST /v1/auth/register -> ${res.status}`, JSON.stringify(res.body));
  customerToken = res.body.access_token;
  customerId = res.body.user.id;

  // 2. Login customer
  console.log('\n2. Login customer');
  res = await req('POST', '/v1/auth/login', { email: customerEmail, password });
  console.log(`   POST /v1/auth/login -> ${res.status}`);
  customerToken = res.body.access_token;

  // 3. Check wallet balance
  console.log('\n3. Check customer wallet balance');
  res = await req('GET', '/v1/wallet/balance', null, customerToken);
  console.log(`   GET /v1/wallet/balance -> ${res.status}`, JSON.stringify(res.body));

  // 4. Create order via direct SQL
  console.log('\n4. Create order directly in DB for COD');
  orderId = crypto.randomUUID();
  await psqlUpdate(`INSERT INTO orders (id, "userId", "restaurantId", "branchId", "orderNumber", status, "paymentStatus", subtotal, tax, "deliveryFee", discount, tip, "grandTotal", "deliveryAddressId") VALUES ('${orderId}', '${customerId}', 'restaurant-123', NULL, 'ORD-COD-${timestamp}', 'PLACED', 'PENDING', 150, 15, 20, 0, 0, 185, 'addr-1')`);
  console.log(`   Created order: ${orderId}`);

  // 5. Process COD payment
  console.log('\n5. Process COD payment');
  res = await req('POST', '/v1/wallet/cod/process', { orderId, amount: 150 }, customerToken);
  console.log(`   POST /v1/wallet/cod/process -> ${res.status}`, JSON.stringify(res.body));

  // 6. Check transactions
  console.log('\n6. Check customer transactions (should show pending COD)');
  res = await req('GET', '/v1/wallet/transactions', null, customerToken);
  console.log(`   GET /v1/wallet/transactions -> ${res.status}`);
  const txns = res.body || [];
  const codTxn = txns.find(t => t.description && t.description.includes('COD Payment Pending'));
  console.log(`   Found pending COD txn: ${codTxn ? 'YES' : 'NO'}`);
  if (codTxn) console.log(`   Txn: ${JSON.stringify(codTxn)}`);

  // 7. Register delivery partner (as customer first)
  console.log('\n7. Register delivery partner user');
  res = await req('POST', '/v1/auth/register', { email: dpEmail, password, fullName: 'COD Probe DP', phone: dpPhone });
  console.log(`   POST /v1/auth/register (dp) -> ${res.status}`);
  const dpUserId = res.body.user.id;

  // Update role to delivery_partner in DB
  await psqlUpdate(`UPDATE users SET role='delivery_partner' WHERE id='${dpUserId}'`);
  console.log(`   Updated user ${dpUserId} role to delivery_partner`);

  // Login as delivery partner
  res = await req('POST', '/v1/auth/login', { email: dpEmail, password });
  console.log(`   POST /v1/auth/login (dp) -> ${res.status}`);
  driverToken = res.body.access_token;

  // 8. Confirm COD as delivery partner
  console.log('\n8. Confirm COD collection (as delivery partner)');
  res = await req('POST', '/v1/wallet/cod/confirm', { orderId, amount: 150 }, driverToken);
  console.log(`   POST /v1/wallet/cod/confirm -> ${res.status}`, JSON.stringify(res.body));

  // 9. Re-check customer balance
  console.log('\n9. Re-check customer wallet balance (should be updated)');
  res = await req('GET', '/v1/wallet/balance', null, customerToken);
  console.log(`   GET /v1/wallet/balance -> ${res.status}`, JSON.stringify(res.body));

  // 10. Re-check transactions
  console.log('\n10. Re-check customer transactions (should show "Collected")');
  res = await req('GET', '/v1/wallet/transactions', null, customerToken);
  console.log(`   GET /v1/wallet/transactions -> ${res.status}`);
  const txnsAfter = res.body || [];
  const collectedTxn = txnsAfter.find(t => t.description && t.description.includes('COD Payment Collected'));
  console.log(`   Found collected COD txn: ${collectedTxn ? 'YES' : 'NO'}`);
  if (collectedTxn) console.log(`   Txn: ${JSON.stringify(collectedTxn)}`);

  console.log('\n=== Probe complete ===');
}

main().catch((e) => { console.error('Probe error:', e); process.exit(1); });
