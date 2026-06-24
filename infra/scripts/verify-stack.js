#!/usr/bin/env node
/**
 * Stack Verification Script — SpiceGarden
 * Checks that the full local staging stack is reachable and healthy.
 * Run after: docker-compose -f compose.dev.yaml up -d
 */

const http = require('http');

const CHECKS = [
  {
    name: 'Backend Health',
    url: process.env.BACKEND_URL || 'http://localhost:3001/health',
    expectStatus: 200,
  },
  {
    name: 'Backend Metrics',
    url: process.env.BACKEND_URL || 'http://localhost:3001/metrics',
    expectStatus: 200,
  },
  {
    name: 'Grafana',
    url: 'http://localhost:3000/api/health',
    expectStatus: 200,
  },
  {
    name: 'Prometheus',
    url: 'http://localhost:9090/-/healthy',
    expectStatus: 200,
  },
  {
    name: 'OpenSearch',
    url: 'http://localhost:9200/_cluster/health',
    expectStatus: 200,
  },
];

function check(url, timeout = 5000) {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          ok: res.statusCode === 200,
          durationMs: Date.now() - start,
          snippet: data.slice(0, 200),
        });
      });
    });
    req.on('error', (err) => {
      resolve({
        url,
        status: 0,
        ok: false,
        durationMs: Date.now() - start,
        error: err.message,
      });
    });
    req.setTimeout(timeout, () => {
      req.destroy();
      resolve({
        url,
        status: 0,
        ok: false,
        durationMs: Date.now() - start,
        error: 'timeout',
      });
    });
  });
}

async function runSmokeRequest() {
  const base = process.env.BACKEND_URL || 'http://localhost:3001';
  try {
    await check(`${base}/api/restaurants`, 5000);
    return { ok: true, name: 'Restaurant list smoke' };
  } catch {
    return { ok: false, name: 'Restaurant list smoke' };
  }
}

async function main() {
  console.log('=== SpiceGarden Stack Verification ===\n');

  let failed = 0;
  for (const c of CHECKS) {
    process.stdout.write(`Checking ${c.name} (${c.url}) ... `);
    const result = await check(c.url);
    if (result.ok) {
      console.log(`OK (${result.durationMs}ms)`);
    } else {
      console.log(`FAIL (status=${result.status}${result.error ? `, error=${result.error}` : ''})`);
      failed++;
    }
  }

  console.log('\nSmoke request:');
  const smoke = await runSmokeRequest();
  if (smoke.ok) {
    console.log(`  ${smoke.name}: OK`);
  } else {
    console.log(`  ${smoke.name}: FAIL — backend may not have seeded data`);
  }

  console.log('\n============================');
  if (failed === 0) {
    console.log('RESULT: PASS — stack is reachable');
    process.exit(0);
  } else {
    console.log(`RESULT: FAIL — ${failed} check(s) failed`);
    process.exit(1);
  }
}

main();
