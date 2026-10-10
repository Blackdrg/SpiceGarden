// infra/load-tests/500k/helpers/config.js

export const CONFIG = {
  baseUrl: __ENV.BASE_URL || 'http://localhost:3001',
  wsUrl: __ENV.WS_URL || 'ws://localhost:3001',
  
  // Timing configuration
  thinkTimeMin: parseFloat(__ENV.THINK_TIME_MIN || '0.5'),
  thinkTimeMax: parseFloat(__ENV.THINK_TIME_MAX || '1.5'),
  requestTimeout: __ENV.REQUEST_TIMEOUT || '10s',
  wsTimeout: __ENV.WS_TIMEOUT || '15s',
  
  // Weights (Total 500k VUs)
  weights: {
    browse: 0.45,   // 225,000 VUs (45%)
    search: 0.20,   // 100,000 VUs (20%)
    cart: 0.10,     // 50,000 VUs  (10%)
    checkout: 0.08, // 40,000 VUs  (8%)
    tracking: 0.14, // 70,000 VUs  (14%)
    admin: 0.03,    // 15,000 VUs  (3%)
  },

  // Standard SLA Thresholds
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    'http_req_failed': ['rate<0.02'],
    'scenario_browse_duration': ['p(95)<400'],
    'scenario_search_duration': ['p(95)<400'],
    'scenario_cart_duration': ['p(95)<500'],
    'scenario_checkout_duration': ['p(95)<800'],
    'scenario_admin_duration': ['p(95)<500'],
    'ws_connecting_duration': ['p(95)<500'],
    'ws_session_duration': ['p(95)<2000'],
    'ws_errors_total': ['count<100'],
  },

  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'k6-spicegarden-distributed/2.2.0',
  },
};
