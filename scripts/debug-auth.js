const http = require('http');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('=== SpiceGarden Auth Debug Script ===');
  console.log('Target:', BASE_URL);

  // Health check
  try {
    const health = await request('GET', '/health');
    if (health.status !== 200) {
      console.error('Health check failed. Start backend first.');
      process.exit(1);
    }
    console.log('Health: 200 OK');
  } catch (e) {
    console.error('Backend not running at', BASE_URL);
    process.exit(1);
  }

  const ts = Date.now();
  const email1 = `debug-${ts}-1@spicegarden.test`;
  const email2 = `debug-${ts}-2@spicegarden.test`;
  const password = 'TestPass123!';

  // Register user 1
  console.log('\n--- Register User 1 ---');
  const reg1 = await request('POST', '/auth/register', {
    email: email1, password, fullName: 'Debug Test 1', phone: '+15551230001',
  });
  console.log(`Status: ${reg1.status} ${reg1.status === 200 ? 'OK' : 'FAIL'}`);
  console.log('Has token:', !!reg1.body?.access_token);
  const token1 = reg1.body?.access_token || null;

  // Register user 2 (different email)
  console.log('\n--- Register User 2 ---');
  const reg2 = await request('POST', '/auth/register', {
    email: email2, password, fullName: 'Debug Test 2', phone: '+15551230002',
  });
  console.log(`Status: ${reg2.status} ${reg2.status === 200 ? 'OK' : 'FAIL'}`);
  console.log('Has token:', !!reg2.body?.access_token);

  // Duplicate email
  console.log('\n--- Duplicate Email (expect 409) ---');
  const dup = await request('POST', '/auth/register', {
    email: email1, password: 'AnotherPass!', fullName: 'Duplicate', phone: '+15551230003',
  });
  console.log(`Status: ${dup.status} ${dup.status === 409 ? 'OK (409 Conflict)' : 'FAIL'}`);
  console.log('Message:', dup.body?.message || dup.body);

  // Login correct
  console.log('\n--- Login (correct) ---');
  const login = await request('POST', '/auth/login', { email: email1, password });
  console.log(`Status: ${login.status} ${login.status === 200 ? 'OK' : 'FAIL'}`);
  console.log('Has token:', !!login.body?.access_token);

  // Login wrong password
  console.log('\n--- Login (wrong password, expect 401) ---');
  const badLogin = await request('POST', '/auth/login', { email: email1, password: 'Wrong!' });
  console.log(`Status: ${badLogin.status} ${badLogin.status === 401 ? 'OK (401)' : 'FAIL'}`);

  console.log('\n=== Auth Debug Complete ===');
}

run().catch((e) => { console.error(e); process.exit(1); });
