// infra/load-tests/500k/validation/validate-scenarios.js
/**
 * Lightweight test runner to validate all 6 scenarios functionally
 */
import { CONFIG } from '../helpers/config.js';
import { runBrowse } from '../scenarios/browse.js';
import { runSearch } from '../scenarios/search.js';
import { runCart } from '../scenarios/cart.js';
import { runCheckout } from '../scenarios/checkout.js';
import { runTracking } from '../scenarios/tracking.js';
import { runAdmin } from '../scenarios/admin.js';

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    'http_req_failed': ['rate<0.10'],
  },
};

export default function () {
  const target = __ENV.SCENARIO || 'all';

  if (target === 'browse' || target === 'all') {
    runBrowse();
  }
  if (target === 'search' || target === 'all') {
    runSearch();
  }
  if (target === 'cart' || target === 'all') {
    runCart();
  }
  if (target === 'checkout' || target === 'all') {
    runCheckout();
  }
  if (target === 'tracking' || target === 'all') {
    runTracking();
  }
  if (target === 'admin' || target === 'all') {
    runAdmin();
  }
}
