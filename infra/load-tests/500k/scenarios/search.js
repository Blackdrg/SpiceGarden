// infra/load-tests/500k/scenarios/search.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG } from '../helpers/config.js';
import { SEARCH_QUERIES, GEOGRAPHIC_COORDINATES, getRandomElement, getRandomInt } from '../helpers/data.js';
import { getCustomerAuthHeaders } from '../helpers/auth.js';
import { searchDuration, searchSuccessRate, searchQueriesTotal } from '../helpers/metrics.js';

export function runSearch() {
  const start = Date.now();
  const auth = getCustomerAuthHeaders(__VU, __ITER);
  const query = encodeURIComponent(getRandomElement(SEARCH_QUERIES));
  const geo = getRandomElement(GEOGRAPHIC_COORDINATES);

  // 1. Search Restaurants & Dishes
  const resSearch = http.get(`${CONFIG.baseUrl}/restaurants/search?q=${query}`, {
    headers: auth.headers,
    tags: { scenario: 'search', endpoint: '/restaurants/search' },
    timeout: CONFIG.requestTimeout,
  });

  const searchOk = check(resSearch, {
    'search query status 200': (r) => r.status === 200,
  });

  searchQueriesTotal.add(1);

  // 2. Geo-spatial Nearby Discovery
  const resNearby = http.get(`${CONFIG.baseUrl}/restaurants/nearby?lat=${geo.lat}&lng=${geo.lng}&radius=5`, {
    headers: auth.headers,
    tags: { scenario: 'search', endpoint: '/restaurants/nearby' },
    timeout: CONFIG.requestTimeout,
  });

  const nearbyOk = check(resNearby, {
    'nearby discovery status 200': (r) => r.status === 200,
  });

  const overallSuccess = searchOk && nearbyOk;
  searchSuccessRate.add(overallSuccess);
  searchDuration.add(Date.now() - start);

  const thinkTime = (getRandomInt(500, 1500) / 1000);
  sleep(thinkTime);
}
