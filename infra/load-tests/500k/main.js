// infra/load-tests/500k/main.js
import { CONFIG } from './helpers/config.js';
import { runBrowse } from './scenarios/browse.js';
import { runSearch } from './scenarios/search.js';
import { runCart } from './scenarios/cart.js';
import { runCheckout } from './scenarios/checkout.js';
import { runTracking } from './scenarios/tracking.js';
import { runAdmin } from './scenarios/admin.js';

// Scalable Target VUs (default: 500,000 total VUs, configurable via TARGET_VUS env var)
const TOTAL_TARGET_VUS = parseInt(__ENV.TARGET_VUS || '500000', 10);
const RAMP_UP_TIME = __ENV.RAMP_UP || '10m';
const SUSTAIN_TIME = __ENV.SUSTAIN || '20m';
const RAMP_DOWN_TIME = __ENV.RAMP_DOWN || '5m';

export const options = {
  scenarios: {
    browse_catalog: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: RAMP_UP_TIME, target: Math.floor(TOTAL_TARGET_VUS * CONFIG.weights.browse) },
        { duration: SUSTAIN_TIME, target: Math.floor(TOTAL_TARGET_VUS * CONFIG.weights.browse) },
        { duration: RAMP_DOWN_TIME, target: 0 },
      ],
      gracefulRampDown: '30s',
      exec: 'execBrowse',
    },
    search_discovery: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: RAMP_UP_TIME, target: Math.floor(TOTAL_TARGET_VUS * CONFIG.weights.search) },
        { duration: SUSTAIN_TIME, target: Math.floor(TOTAL_TARGET_VUS * CONFIG.weights.search) },
        { duration: RAMP_DOWN_TIME, target: 0 },
      ],
      gracefulRampDown: '30s',
      exec: 'execSearch',
    },
    cart_management: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: RAMP_UP_TIME, target: Math.floor(TOTAL_TARGET_VUS * CONFIG.weights.cart) },
        { duration: SUSTAIN_TIME, target: Math.floor(TOTAL_TARGET_VUS * CONFIG.weights.cart) },
        { duration: RAMP_DOWN_TIME, target: 0 },
      ],
      gracefulRampDown: '30s',
      exec: 'execCart',
    },
    orders_checkout: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: RAMP_UP_TIME, target: Math.floor(TOTAL_TARGET_VUS * CONFIG.weights.checkout) },
        { duration: SUSTAIN_TIME, target: Math.floor(TOTAL_TARGET_VUS * CONFIG.weights.checkout) },
        { duration: RAMP_DOWN_TIME, target: 0 },
      ],
      gracefulRampDown: '30s',
      exec: 'execCheckout',
    },
    websocket_tracking: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: RAMP_UP_TIME, target: Math.floor(TOTAL_TARGET_VUS * CONFIG.weights.tracking) },
        { duration: SUSTAIN_TIME, target: Math.floor(TOTAL_TARGET_VUS * CONFIG.weights.tracking) },
        { duration: RAMP_DOWN_TIME, target: 0 },
      ],
      gracefulRampDown: '30s',
      exec: 'execTracking',
    },
    admin_kitchen: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: RAMP_UP_TIME, target: Math.floor(TOTAL_TARGET_VUS * CONFIG.weights.admin) },
        { duration: SUSTAIN_TIME, target: Math.floor(TOTAL_TARGET_VUS * CONFIG.weights.admin) },
        { duration: RAMP_DOWN_TIME, target: 0 },
      ],
      gracefulRampDown: '30s',
      exec: 'execAdmin',
    },
  },
  thresholds: CONFIG.thresholds,
};

export function execBrowse() {
  runBrowse();
}

export function execSearch() {
  runSearch();
}

export function execCart() {
  runCart();
}

export function execCheckout() {
  runCheckout();
}

export function execTracking() {
  runTracking();
}

export function execAdmin() {
  runAdmin();
}
