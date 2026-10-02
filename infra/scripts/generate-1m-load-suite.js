const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const REPORT_DIR = path.join(ROOT_DIR, 'reports/performance/1m-remediation');
const LOAD_TEST_DIR = path.join(ROOT_DIR, 'infra/load-tests/1m');

// Ensure directories exist
[
  REPORT_DIR,
  LOAD_TEST_DIR,
  path.join(LOAD_TEST_DIR, 'workloads'),
  path.join(LOAD_TEST_DIR, 'data'),
  path.join(LOAD_TEST_DIR, 'distributed')
].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

console.log('Generating 1M Remediation Master Deliverables...');

// Helper to write file
function writeDeliverable(filePath, content) {
  fs.writeFileSync(filePath, content.trim() + '\n', 'utf8');
  console.log(`[OK] Created: ${path.relative(ROOT_DIR, filePath)}`);
}

// --------------------------------------------------------------------------
// 1. DATA FILES FOR LOAD TESTS
// --------------------------------------------------------------------------
const tenantsData = [
  { tenantId: "tenant_delhi_spice", name: "Delhi Spice Co", region: "north-in", tier: "enterprise", weight: 0.35 },
  { tenantId: "tenant_mumbai_curry", name: "Mumbai Curry House", region: "west-in", tier: "enterprise", weight: 0.30 },
  { tenantId: "tenant_bangalore_bistro", name: "Bangalore Bistro Group", region: "south-in", tier: "enterprise", weight: 0.20 },
  { tenantId: "tenant_kolkata_kitchen", name: "Kolkata Kitchens", region: "east-in", tier: "standard", weight: 0.10 },
  { tenantId: "tenant_chennai_cheffery", name: "Chennai Cheffery", region: "south-in", tier: "standard", weight: 0.05 }
];

const usersData = Array.from({ length: 50 }, (_, i) => ({
  userId: `user_load_${String(i + 1).padStart(4, '0')}`,
  tenantId: tenantsData[i % tenantsData.length].tenantId,
  email: `loaduser_${i + 1}@spicegarden-test.internal`,
  role: i < 5 ? "tenant_admin" : i < 15 ? "delivery_driver" : "customer",
  token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.synthetic_load_token_${i + 1}`
}));

const restaurantsData = Array.from({ length: 25 }, (_, i) => ({
  restaurantId: `rest_${String(i + 1).padStart(3, '0')}`,
  tenantId: tenantsData[i % tenantsData.length].tenantId,
  name: `SpiceGarden Kitchen ${i + 1}`,
  cuisine: ["North Indian", "South Indian", "Mughlai", "Biryani", "Street Food"][i % 5],
  lat: 28.6139 + (i * 0.01),
  lng: 77.2090 + (i * 0.01),
  isOpen: true
}));

const itemsData = Array.from({ length: 100 }, (_, i) => ({
  itemId: `item_${String(i + 1).padStart(4, '0')}`,
  restaurantId: restaurantsData[i % restaurantsData.length].restaurantId,
  tenantId: restaurantsData[i % restaurantsData.length].tenantId,
  name: `Special Dish ${i + 1}`,
  price: 150 + ((i % 10) * 35),
  isAvailable: true
}));

writeDeliverable(path.join(LOAD_TEST_DIR, 'data/tenants.json'), JSON.stringify(tenantsData, null, 2));
writeDeliverable(path.join(LOAD_TEST_DIR, 'data/users.json'), JSON.stringify(usersData, null, 2));
writeDeliverable(path.join(LOAD_TEST_DIR, 'data/restaurants.json'), JSON.stringify(restaurantsData, null, 2));
writeDeliverable(path.join(LOAD_TEST_DIR, 'data/items.json'), JSON.stringify(itemsData, null, 2));

// --------------------------------------------------------------------------
// 2. LOAD TEST SCRIPTS UNDER infra/load-tests/1m/
// --------------------------------------------------------------------------
const configJs = `
// infra/load-tests/1m/config.js
export const CONFIG = {
  baseUrl: __ENV.API_BASE_URL || 'http://localhost:3001',
  wsUrl: __ENV.WS_BASE_URL || 'ws://localhost:3001',
  thinkTimeMin: 1.5, // seconds
  thinkTimeMax: 4.5, // seconds
  timeout: '5s',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-SpiceGarden-Client': 'k6-distributed-1m-suite',
    'X-Load-Test-Run-Id': __ENV.LOAD_TEST_RUN_ID || 'run_1m_master_20261002'
  }
};
`;
writeDeliverable(path.join(LOAD_TEST_DIR, 'config.js'), configJs);

const thresholdsJs = `
// infra/load-tests/1m/thresholds.js
export const THRESHOLDS = {
  http_req_duration: ['p(95)<500', 'p(99)<1500'], // Primary SLA: p95 < 500ms
  http_req_failed: ['rate<0.02'],                  // Primary SLA: error rate < 2%
  'http_req_duration{scenario:browse}': ['p(95)<250'],
  'http_req_duration{scenario:search}': ['p(95)<350'],
  'http_req_duration{scenario:cart}': ['p(95)<300'],
  'http_req_duration{scenario:checkout}': ['p(95)<600'],
  'http_req_duration{scenario:tracking}': ['p(95)<200'],
  'http_req_duration{scenario:admin}': ['p(95)<800']
};
`;
writeDeliverable(path.join(LOAD_TEST_DIR, 'thresholds.js'), thresholdsJs);

const browseJs = `
// infra/load-tests/1m/workloads/browse.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG } from '../config.js';

export function runBrowse(tenant, user, restaurants) {
  const rest = restaurants[Math.floor(Math.random() * restaurants.length)];
  const headers = Object.assign({}, CONFIG.headers, {
    'X-Tenant-Id': tenant.tenantId,
    'Authorization': 'Bearer ' + user.token
  });

  // 1. Fetch Restaurant Catalog
  const resCatalog = http.get(\`\${CONFIG.baseUrl}/restaurants?tenantId=\${tenant.tenantId}&limit=20\`, {
    headers: headers,
    tags: { scenario: 'browse', endpoint: '/restaurants' }
  });
  check(resCatalog, {
    'catalog status 200': (r) => r.status === 200,
    'catalog has data': (r) => r.body && r.body.length > 0
  });

  sleep(Math.random() * (CONFIG.thinkTimeMax - CONFIG.thinkTimeMin) + CONFIG.thinkTimeMin);

  // 2. Fetch Restaurant Menu
  const resMenu = http.get(\`\${CONFIG.baseUrl}/restaurants/\${rest.restaurantId}/menu\`, {
    headers: headers,
    tags: { scenario: 'browse', endpoint: '/restaurants/:id/menu' }
  });
  check(resMenu, {
    'menu status 200': (r) => r.status === 200
  });
}
`;
writeDeliverable(path.join(LOAD_TEST_DIR, 'workloads/browse.js'), browseJs);

const searchJs = `
// infra/load-tests/1m/workloads/search.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG } from '../config.js';

const SEARCH_TERMS = ['biryani', 'curry', 'paneer', 'tikka', 'dosa', 'naan', 'pizza', 'burger', 'kebab', 'thali'];

export function runSearch(tenant, user) {
  const query = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
  const headers = Object.assign({}, CONFIG.headers, {
    'X-Tenant-Id': tenant.tenantId,
    'Authorization': 'Bearer ' + user.token
  });

  const res = http.get(\`\${CONFIG.baseUrl}/search/dishes?query=\${query}&tenantId=\${tenant.tenantId}&limit=15\`, {
    headers: headers,
    tags: { scenario: 'search', endpoint: '/search/dishes' }
  });

  check(res, {
    'search status 200': (r) => r.status === 200
  });

  sleep(Math.random() * (CONFIG.thinkTimeMax - CONFIG.thinkTimeMin) + CONFIG.thinkTimeMin);
}
`;
writeDeliverable(path.join(LOAD_TEST_DIR, 'workloads/search.js'), searchJs);

const cartJs = `
// infra/load-tests/1m/workloads/cart.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG } from '../config.js';

export function runCart(tenant, user, items) {
  const item = items[Math.floor(Math.random() * items.length)];
  const headers = Object.assign({}, CONFIG.headers, {
    'X-Tenant-Id': tenant.tenantId,
    'Authorization': 'Bearer ' + user.token
  });

  const payload = JSON.stringify({
    tenantId: tenant.tenantId,
    userId: user.userId,
    items: [
      { itemId: item.itemId, quantity: 2, price: item.price }
    ]
  });

  const res = http.post(\`\${CONFIG.baseUrl}/cart/validate\`, payload, {
    headers: headers,
    tags: { scenario: 'cart', endpoint: '/cart/validate' }
  });

  check(res, {
    'cart validate 200': (r) => r.status === 200 || r.status === 201
  });

  sleep(Math.random() * (CONFIG.thinkTimeMax - CONFIG.thinkTimeMin) + CONFIG.thinkTimeMin);
}
`;
writeDeliverable(path.join(LOAD_TEST_DIR, 'workloads/cart.js'), cartJs);

const checkoutJs = `
// infra/load-tests/1m/workloads/checkout.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG } from '../config.js';

export function runCheckout(tenant, user, items) {
  const item = items[Math.floor(Math.random() * items.length)];
  const idempotencyKey = 'idem_' + user.userId + '_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
  const headers = Object.assign({}, CONFIG.headers, {
    'X-Tenant-Id': tenant.tenantId,
    'Authorization': 'Bearer ' + user.token,
    'Idempotency-Key': idempotencyKey
  });

  const orderPayload = JSON.stringify({
    tenantId: tenant.tenantId,
    userId: user.userId,
    restaurantId: item.restaurantId,
    items: [{ itemId: item.itemId, quantity: 1, unitPrice: item.price }],
    totalAmount: item.price,
    paymentMethod: 'mock_sandbox',
    deliveryAddress: { street: '42 Main St', city: 'Delhi', pincode: '110001' }
  });

  // 1. Create Order
  const resOrder = http.post(\`\${CONFIG.baseUrl}/orders/create\`, orderPayload, {
    headers: headers,
    tags: { scenario: 'checkout', endpoint: '/orders/create' }
  });

  const ok = check(resOrder, {
    'order created 201/200': (r) => r.status === 200 || r.status === 201
  });

  if (ok && resOrder.json('orderId')) {
    const orderId = resOrder.json('orderId');
    // 2. Create Payment Intent
    const paymentPayload = JSON.stringify({
      orderId: orderId,
      tenantId: tenant.tenantId,
      amount: item.price,
      currency: 'INR',
      idempotencyKey: idempotencyKey
    });

    const resPay = http.post(\`\${CONFIG.baseUrl}/payments/create-intent\`, paymentPayload, {
      headers: headers,
      tags: { scenario: 'checkout', endpoint: '/payments/create-intent' }
    });

    check(resPay, {
      'payment intent status 200/201': (r) => r.status === 200 || r.status === 201
    });
  }

  sleep(Math.random() * (CONFIG.thinkTimeMax - CONFIG.thinkTimeMin) + CONFIG.thinkTimeMin);
}
`;
writeDeliverable(path.join(LOAD_TEST_DIR, 'workloads/checkout.js'), checkoutJs);

const trackingJs = `
// infra/load-tests/1m/workloads/tracking.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG } from '../config.js';

export function runTracking(tenant, user) {
  const headers = Object.assign({}, CONFIG.headers, {
    'X-Tenant-Id': tenant.tenantId,
    'Authorization': 'Bearer ' + user.token
  });

  const res = http.get(\`\${CONFIG.baseUrl}/orders/active/track?userId=\${user.userId}\`, {
    headers: headers,
    tags: { scenario: 'tracking', endpoint: '/orders/active/track' }
  });

  check(res, {
    'tracking status 200': (r) => r.status === 200
  });

  sleep(Math.random() * (CONFIG.thinkTimeMax - CONFIG.thinkTimeMin) + CONFIG.thinkTimeMin);
}
`;
writeDeliverable(path.join(LOAD_TEST_DIR, 'workloads/tracking.js'), trackingJs);

const adminJs = `
// infra/load-tests/1m/workloads/admin.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG } from '../config.js';

export function runAdmin(tenant, user) {
  const headers = Object.assign({}, CONFIG.headers, {
    'X-Tenant-Id': tenant.tenantId,
    'Authorization': 'Bearer ' + user.token
  });

  const res = http.get(\`\${CONFIG.baseUrl}/admin/analytics/overview?tenantId=\${tenant.tenantId}&timeRange=24h\`, {
    headers: headers,
    tags: { scenario: 'admin', endpoint: '/admin/analytics/overview' }
  });

  check(res, {
    'admin analytics status 200': (r) => r.status === 200
  });

  sleep(Math.random() * (CONFIG.thinkTimeMax - CONFIG.thinkTimeMin) + CONFIG.thinkTimeMin);
}
`;
writeDeliverable(path.join(LOAD_TEST_DIR, 'workloads/admin.js'), adminJs);

const scenarioJs = `
// infra/load-tests/1m/scenario.js
import { THRESHOLDS } from './thresholds.js';
import { runBrowse } from './workloads/browse.js';
import { runSearch } from './workloads/search.js';
import { runCart } from './workloads/cart.js';
import { runCheckout } from './workloads/checkout.js';
import { runTracking } from './workloads/tracking.js';
import { runAdmin } from './workloads/admin.js';

// Load static pre-generated test datasets
const tenants = JSON.parse(open('./data/tenants.json'));
const users = JSON.parse(open('./data/users.json'));
const restaurants = JSON.parse(open('./data/restaurants.json'));
const items = JSON.parse(open('./data/items.json'));

export const options = {
  scenarios: {
    browse_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 20000 },
        { duration: '10m', target: 450000 },
        { duration: '20m', target: 450000 },
        { duration: '5m', target: 0 }
      ],
      gracefulRampDown: '30s',
      exec: 'scenarioBrowse'
    },
    search_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 10000 },
        { duration: '10m', target: 200000 },
        { duration: '20m', target: 200000 },
        { duration: '5m', target: 0 }
      ],
      gracefulRampDown: '30s',
      exec: 'scenarioSearch'
    },
    cart_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 5000 },
        { duration: '10m', target: 100000 },
        { duration: '20m', target: 100000 },
        { duration: '5m', target: 0 }
      ],
      gracefulRampDown: '30s',
      exec: 'scenarioCart'
    },
    checkout_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 3000 },
        { duration: '10m', target: 80000 },
        { duration: '20m', target: 80000 },
        { duration: '5m', target: 0 }
      ],
      gracefulRampDown: '30s',
      exec: 'scenarioCheckout'
    },
    tracking_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 5000 },
        { duration: '10m', target: 140000 },
        { duration: '20m', target: 140000 },
        { duration: '5m', target: 0 }
      ],
      gracefulRampDown: '30s',
      exec: 'scenarioTracking'
    },
    admin_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 1000 },
        { duration: '10m', target: 30000 },
        { duration: '20m', target: 30000 },
        { duration: '5m', target: 0 }
      ],
      gracefulRampDown: '30s',
      exec: 'scenarioAdmin'
    }
  },
  thresholds: THRESHOLDS
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function scenarioBrowse() {
  runBrowse(pickRandom(tenants), pickRandom(users), restaurants);
}

export function scenarioSearch() {
  runSearch(pickRandom(tenants), pickRandom(users));
}

export function scenarioCart() {
  runCart(pickRandom(tenants), pickRandom(users), items);
}

export function scenarioCheckout() {
  runCheckout(pickRandom(tenants), pickRandom(users), items);
}

export function scenarioTracking() {
  runTracking(pickRandom(tenants), pickRandom(users));
}

export function scenarioAdmin() {
  runAdmin(pickRandom(tenants), pickRandom(users));
}
`;
writeDeliverable(path.join(LOAD_TEST_DIR, 'scenario.js'), scenarioJs);

const k8sK6OperatorYaml = `
# infra/load-tests/1m/distributed/k8s-k6-operator.yaml
apiVersion: k6.io/v1alpha1
kind: TestRun
metadata:
  name: spicegarden-1m-distributed-run
  namespace: load-testing
spec:
  parallelism: 40
  script:
    configMap:
      name: spicegarden-1m-scenario-cm
      file: scenario.js
  arguments: --out json=/tmp/results.json
  runner:
    image: grafana/k6:latest
    env:
      - name: API_BASE_URL
        value: "http://spicegarden-backend-ingress.spicegarden-prod.svc.cluster.local:3001"
      - name: WS_BASE_URL
        value: "ws://spicegarden-backend-ingress.spicegarden-prod.svc.cluster.local:3001"
      - name: LOAD_TEST_RUN_ID
        value: "run_1m_prod_cluster_qualification_20261002"
    resources:
      requests:
        cpu: "4000m"
        memory: "8Gi"
      limits:
        cpu: "8000m"
        memory: "16Gi"
    securityContext:
      sysctls:
        - name: net.ipv4.ip_local_port_range
          value: "1024 65535"
        - name: net.ipv4.tcp_tw_reuse
          value: "1"
`;
writeDeliverable(path.join(LOAD_TEST_DIR, 'distributed/k8s-k6-operator.yaml'), k8sK6OperatorYaml);

const distributedRunnerSh = `#!/usr/bin/env bash
# infra/load-tests/1m/distributed/distributed-runner.sh
set -euo pipefail

echo "=========================================================="
echo "SPICEGARDEN 1M VU DISTRIBUTED TEST EXECUTION HARNESS"
echo "=========================================================="

NAMESPACE="load-testing"
CONFIGMAP_NAME="spicegarden-1m-scenario-cm"
TESTRUN_FILE="infra/load-tests/1m/distributed/k8s-k6-operator.yaml"

echo "[1/4] Validating Kubernetes cluster connectivity..."
kubectl cluster-info

echo "[2/4] Creating scenario ConfigMap..."
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
kubectl create configMap "$CONFIGMAP_NAME" \
  --from-file=scenario.js=infra/load-tests/1m/scenario.js \
  --from-file=config.js=infra/load-tests/1m/config.js \
  --from-file=thresholds.js=infra/load-tests/1m/thresholds.js \
  --namespace="$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

echo "[3/4] Deploying 40-worker k6 distributed TestRun..."
kubectl apply -f "$TESTRUN_FILE"

echo "[4/4] Monitoring distributed TestRun execution..."
kubectl get testruns -n "$NAMESPACE" -w
`;
writeDeliverable(path.join(LOAD_TEST_DIR, 'distributed/distributed-runner.sh'), distributedRunnerSh);

const workerConfigJson = {
  workerFleet: {
    totalNodes: 40,
    instanceType: "c6i.2xlarge",
    vCPUPerNode: 8,
    memoryPerNodeGB: 16,
    targetVUsPerNode: 25000,
    totalVUsCapacity: 1000000,
    networkBandwidthPerNodeGbps: 12.5,
    osKernelTuning: {
      "net.ipv4.ip_local_port_range": "1024 65535",
      "net.ipv4.tcp_tw_reuse": 1,
      "fs.file-max": 2097152,
      "nofile_limit": 1048576
    }
  }
};
writeDeliverable(path.join(LOAD_TEST_DIR, 'distributed/worker-config.json'), JSON.stringify(workerConfigJson, null, 2));

const loadTestReadme = `# SpiceGarden 1M VU Distributed Load Testing Architecture

## Overview
This directory contains the authoritative 1M VU distributed load testing harness for SpiceGarden Enterprise SaaS.

### Directory Structure
* [\`scenario.js\`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/1m/scenario.js): Master k6 test scenario with multi-workload ramp-up stages.
* [\`config.js\`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/1m/config.js): Environment endpoints, think time parameters, and headers.
* [\`thresholds.js\`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/1m/thresholds.js): Strict SLA acceptance criteria.
* \`workloads/\`: Independent workload modules (browse, search, cart, checkout, tracking, admin).
* \`data/\`: Synthetic multi-tenant entities (tenants, users, restaurants, menu items).
* \`distributed/\`: Kubernetes k6 Operator TestRun CRDs and deployment scripts for 40-node worker fleets.
`;
writeDeliverable(path.join(LOAD_TEST_DIR, 'README.md'), loadTestReadme);

console.log('Finished generating load test harness files.');
