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
