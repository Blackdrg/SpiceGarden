import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { b64decode } from 'k6/encoding';

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
export const WS_URL = __ENV.WS_URL || 'ws://localhost:3001';

export const metrics = {
  loadSuccess: new Rate('load_success'),
  signupSuccess: new Rate('signup_success'),
  loginSuccess: new Rate('login_success'),
  browseSuccess: new Rate('browse_restaurants_success'),
  addressSuccess: new Rate('address_success'),
  orderSuccess: new Rate('order_success'),
  paymentSuccess: new Rate('payment_success'),
  searchSuccess: new Rate('search_success'),
  trackingSuccess: new Rate('tracking_success'),
  menuSuccess: new Rate('menu_success'),
  notificationsSuccess: new Rate('notifications_success'),
  profileSuccess: new Rate('profile_success'),
  walletSuccess: new Rate('wallet_success'),
  adminSuccess: new Rate('admin_success'),
  failedRequests: new Counter('failed_requests_total'),
  orderDuration: new Trend('order_duration_ms'),
  apiLatency: new Trend('api_latency_ms'),
};

export function loadOptions(stages) {
  const target = Number(__ENV.TARGET_VUS || 0);
  const duration = __ENV.STAGE_DURATION || '30s';
  const p95 = Number(__ENV.P95_LIMIT_MS || 1500);

  if (target > 0) {
    return {
      scenarios: {
        load: {
          executor: 'constant-vus',
          vus: target,
          duration,
          tags: { stage: String(target) },
        },
      },
      thresholds: {
        http_req_failed: ['rate<1.00'],
        load_success: [`rate>${__ENV.LOAD_SUCCESS_MIN || '0.00'}`],
        http_req_duration: [`p(95)<${p95}`],
      },
    };
  }

  return {
    stages,
    thresholds: {
      http_req_failed: ['rate<0.01'],
      load_success: [`rate>${__ENV.LOAD_SUCCESS_MIN || '0.99'}`],
      signup_success: ['rate>0.99'],
      login_success: ['rate>0.99'],
      browse_restaurants_success: ['rate>0.99'],
      address_success: ['rate>0.99'],
      order_success: ['rate>0.99'],
      payment_success: ['rate>0.99'],
      search_success: ['rate>0.99'],
      menu_success: ['rate>0.99'],
      api_latency_ms: ['p(95)<2000'],
    },
  };
}

export function setup() {
  const res = http.get(`${BASE_URL}/health`, { tags: { step: 'health' } });
  const ok = check(res, { 'backend health is 200': (r) => r.status === 200 });
  if (!ok) {
    logFailure('backend health', res);
    throw new Error(
      `Backend health check FAILED (status=${res ? res.status : 'no-response'}) at ${BASE_URL}/health. ` +
        `Aborting load test to avoid generating thousands of doomed requests. ` +
        `Ensure the backend is running and reachable before executing k6.`,
    );
  }
  return { startedAt: new Date().toISOString() };
}

export function parseJson(res) {
  try {
    return res ? res.json() : null;
  } catch (e) {
    return null;
  }
}

export function logFailure(step, res, requestBody, error) {
  const failureDetails = {
    level: 'error',
    step,
    url: res && res.url ? res.url : '',
    status: res ? res.status : 0,
    requestBody: requestBody ? String(requestBody).slice(0, 2000) : '',
    responseBody: res && res.body ? String(res.body).slice(0, 4000) : '',
    responseHeaders: res && res.headers ? res.headers : {},
    timing: res && res.timings ? res.timings : {},
    exception: error ? String(error.stack || error) : '',
  };
  console.log(JSON.stringify(failureDetails));
  metrics.failedRequests.add(1);
}

export function request(method, url, body, params, step, okStatuses, metric) {
  const res = http.request(method, url, body, params);
  const ok = check(res, { [`${step} status ${okStatuses.join('/')}`]: (r) => okStatuses.includes(r.status) });
  if (!ok) {
    logFailure(step, res, body);
  }
  if (metric) {
    metric.add(ok);
  }
  metrics.loadSuccess.add(ok);
  metrics.apiLatency.add(res.timings ? res.timings.duration : 0);
  return { res, ok, body: parseJson(res) };
}

export function userIdFromToken(token) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const normalized = payload.length % 4 === 0 ? payload : `${payload}${'='.repeat((4 - payload.length % 4) % 4)}`;
    return JSON.parse(b64decode(normalized)).sub;
  } catch (e) {
    return null;
  }
}

export function registerUser(prefix) {
  const uniqueId = `${Date.now()}-${__VU}-${__ITER}-${Math.random().toString(36).substring(2, 8)}`;
  const email = `${prefix}-${uniqueId}@load.test`;
  const password = 'Password123!';
  const phone = `+1555${Date.now().toString().slice(-7)}${Math.random().toString().slice(2, 7)}`;
  const payload = JSON.stringify({
    email,
    password,
    fullName: `Load Test ${uniqueId}`,
    phone,
  });
  const { res, ok, body } = request(
    'POST',
    `${BASE_URL}/auth/register`,
    payload,
    { headers: { 'Content-Type': 'application/json' }, tags: { step: 'register' } },
    'register',
    [200, 201],
    metrics.signupSuccess,
  );
  const token = body && body.access_token ? body.access_token : null;
  const userId = body && body.access_token ? userIdFromToken(body.access_token) : null;
  return { email, password, token, userId, registerOk: ok, registerStatus: res.status };
}

export function loginUser(email, password) {
  const { res, ok, body } = request(
    'POST',
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email, password }),
    { headers: { 'Content-Type': 'application/json' }, tags: { step: 'login' } },
    'login',
    [200],
    metrics.loginSuccess,
  );
  const token = body && body.access_token ? body.access_token : null;
  const userId = body && body.access_token ? userIdFromToken(body.access_token) : null;
  return { token, userId, loginOk: ok, loginStatus: res.status };
}

export function ensureToken(prefix) {
  const registered = registerUser(prefix);
  if (registered.token) return registered;
  const loggedIn = loginUser(registered.email, registered.password);
  return {
    ...registered,
    ...loggedIn,
    loginOk: loggedIn.loginOk,
    token: loggedIn.token || registered.token,
    userId: loggedIn.userId || registered.userId,
  };
}

export function browseRestaurants(token) {
  const { res, ok, body } = request(
    'GET',
    `${BASE_URL}/restaurants`,
    null,
    { headers: token ? { Authorization: `Bearer ${token}` } : {}, tags: { step: 'browse' } },
    'browse restaurants',
    [200],
    metrics.browseSuccess,
  );
  if (!ok || !Array.isArray(body)) return null;
  return body;
}

export function searchRestaurants(token, query) {
  const q = encodeURIComponent(query || 'biryani');
  const { res, ok, body } = request(
    'GET',
    `${BASE_URL}/restaurants/search?q=${q}`,
    null,
    { headers: token ? { Authorization: `Bearer ${token}` } : {}, tags: { step: 'search' } },
    'search restaurants',
    [200],
    metrics.searchSuccess,
  );
  if (!ok || !Array.isArray(body)) return null;
  return body;
}

export function getRestaurantMenu(token, restaurantId) {
  return request(
    'GET',
    `${BASE_URL}/menus/${restaurantId}/items`,
    null,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      tags: { step: 'menu' },
    },
    'get restaurant menu',
    [200],
    metrics.menuSuccess,
  );
}

export function createAddress(token, userId) {
  if (!token || !userId) {
    metrics.addressSuccess.add(false);
    metrics.loadSuccess.add(false);
    return null;
  }
  const payload = JSON.stringify({
    label: `Load ${__VU}-${__ITER}`,
    addressLine: `${100 + __VU} Load Test Street`,
    city: 'Load City',
    state: 'LC',
    postalCode: '500001',
    location: { lat: 17.385 + (__VU % 10) / 1000, lng: 78.486 + (__ITER % 10) / 1000 },
    isDefault: true,
  });
  const { ok, body } = request(
    'POST',
    `${BASE_URL}/user/addresses`,
    payload,
    {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      tags: { step: 'address' },
    },
    'create address',
    [200, 201],
    metrics.addressSuccess,
  );
  if (!ok) return null;
  return body && (body.id || body.addressId) ? (body.id || body.addressId) : `addr-${userId}`;
}

export function createOrder(token, userId, restaurantId, addressId) {
  if (!token || !userId || !restaurantId || !addressId) {
    metrics.orderSuccess.add(false);
    metrics.loadSuccess.add(false);
    return null;
  }
  const itemPrice = 100;
  const quantity = 1;
  const subtotal = itemPrice * quantity;
  const tax = 5;
  const deliveryFee = 10;
  const discount = 0;
  const tip = 0;
  const grandTotal = Math.round((subtotal + tax + deliveryFee - discount + tip) * 100) / 100;
  const uniqueItemId = `item-${__VU}-${__ITER}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const payload = JSON.stringify({
    userId,
    restaurantId,
    items: [{ id: uniqueItemId, name: 'Load Test Item', price: itemPrice, quantity }],
    deliveryAddressId: addressId,
    subtotal,
    tax,
    deliveryFee,
    discount,
    tip,
    grandTotal,
  });
  const start = Date.now();
  const { res, ok, body } = request(
    'POST',
    `${BASE_URL}/orders`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'Idempotency-Key': `order-${__VU}-${__ITER}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      },
      tags: { step: 'order' },
    },
    'create order',
    [200, 201],
    metrics.orderSuccess,
  );
  metrics.orderDuration.add(Date.now() - start, { status: String(res.status) });
  return { ok, body, status: res.status };
}

export function createPaymentIntent(token, userId, amount) {
  if (!token || !userId) {
    metrics.paymentSuccess.add(false);
    metrics.loadSuccess.add(false);
    return null;
  }
  return request(
    'POST',
    `${BASE_URL}/payments/create-intent`,
    JSON.stringify({ userId, amount, currency: 'usd', orderId: `order-${__VU}-${__ITER}` }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'Idempotency-Key': `payment-${__VU}-${__ITER}`,
      },
      tags: { step: 'payment' },
    },
    'create payment intent',
    [200],
    metrics.paymentSuccess,
  );
}

export function getUserProfile(token) {
  return request(
    'GET',
    `${BASE_URL}/auth/me`,
    null,
    { headers: token ? { Authorization: `Bearer ${token}` } : {}, tags: { step: 'profile' } },
    'get user profile',
    [200],
    metrics.profileSuccess,
  );
}

export function getWallet(token) {
  return request(
    'GET',
    `${BASE_URL}/wallet`,
    null,
    { headers: token ? { Authorization: `Bearer ${token}` } : {}, tags: { step: 'wallet' } },
    'get wallet',
    [200],
    metrics.walletSuccess,
  );
}

export function getNotifications(token) {
  return request(
    'GET',
    `${BASE_URL}/notification-queue/stats/overview`,
    null,
    { headers: token ? { Authorization: `Bearer ${token}` } : {}, tags: { step: 'notifications' } },
    'get notifications',
    [200, 401, 403],
    metrics.notificationsSuccess,
  );
}

export function getAdminStats(token) {
  return request(
    'GET',
    `${BASE_URL}/admin/dashboard`,
    null,
    { headers: token ? { Authorization: `Bearer ${token}` } : {}, tags: { step: 'admin' } },
    'get admin stats',
    [200, 401, 403],
    metrics.adminSuccess,
  );
}

export function trackOrder(token, orderId) {
  return request(
    'GET',
    `${BASE_URL}/orders/${orderId}`,
    null,
    { headers: token ? { Authorization: `Bearer ${token}` } : {}, tags: { step: 'tracking' } },
    'track order',
    [200, 404],
    metrics.trackingSuccess,
  );
}

export function runUserFlow(label, includePayment = false) {
  group(`${label} - auth`, () => {
    const auth = ensureToken(label);
    if (!auth.token) return;
    const userId = auth.userId || userIdFromToken(auth.token);

    group(`${label} - browse`, () => {
      let restaurants = browseRestaurants(auth.token);
      if (!restaurants || restaurants.length === 0) return;

      const useSearch = Math.random() < 0.15;
      if (useSearch) {
        searchRestaurants(auth.token);
      }

      const restaurant = restaurants[__VU % restaurants.length];
      const restaurantId = restaurant.id || restaurant.slug;
      getRestaurantMenu(auth.token, restaurantId);
      getUserProfile(auth.token);

      group(`${label} - address`, () => {
        const addressId = createAddress(auth.token, userId);
        if (!addressId) return;

        group(`${label} - order`, () => {
          const orderResult = createOrder(auth.token, userId, restaurantId, addressId);
          if (orderResult && orderResult.body && orderResult.body.id) {
            trackOrder(auth.token, orderResult.body.id);
            getNotifications(auth.token);
            getWallet(auth.token);
          }
        });

        if (includePayment && __ENV.EXERCISE_PAYMENT === 'true' && Math.random() < 0.5) {
          group(`${label} - payment`, () => {
            createPaymentIntent(auth.token, userId, 100 + Math.floor(Math.random() * 200));
          });
        }
      });
    });
  });
  sleep(Number(__ENV.THINK_TIME_SECONDS || 1));
}

export function runDistributedFlow(label) {
  const flowRoll = Math.random();
  const auth = ensureToken(label);
  if (!auth.token) return;
  const userId = auth.userId || userIdFromToken(auth.token);

  if (flowRoll < 0.60) {
    browseRestaurants(auth.token);
    const restaurants = searchRestaurants(auth.token);
    if (restaurants && restaurants.length > 0) {
      const rid = restaurants[__VU % restaurants.length].id;
      getRestaurantMenu(auth.token, rid);
    }
    getUserProfile(auth.token);
  } else if (flowRoll < 0.75) {
    searchRestaurants(auth.token);
    browseRestaurants(auth.token);
  } else if (flowRoll < 0.85) {
    createAddress(auth.token, userId);
    const restaurants = browseRestaurants(auth.token);
    if (restaurants && restaurants.length > 0) {
      const rid = restaurants[__VU % restaurants.length].id;
      const addressId = createAddress(auth.token, userId);
      if (addressId) createOrder(auth.token, userId, rid, addressId);
    }
  } else if (flowRoll < 0.90) {
    createPaymentIntent(auth.token, userId, 50 + Math.floor(Math.random() * 300));
    getWallet(auth.token);
  } else if (flowRoll < 0.95) {
    getNotifications(auth.token);
    getUserProfile(auth.token);
  } else {
    getAdminStats(auth.token);
    browseRestaurants(auth.token);
  }
  sleep(0.5 + Math.random() * 2);
}
