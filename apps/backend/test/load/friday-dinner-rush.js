import { createOrder, ensureToken, loadOptions, metrics, setup, userIdFromToken } from './common.js';
import { group, sleep } from 'k6';

export const options = loadOptions([
  { duration: '2m', target: 1000 },
  { duration: '10m', target: 3000 },
  { duration: '5m', target: 5000 },
  { duration: '5m', target: 5000 },
  { duration: '3m', target: 0 },
]);

export { setup };

export default function() {
  const auth = ensureToken('friday-rush');
  if (!auth.token) {
    return;
  }
  const userId = auth.userId || userIdFromToken(auth.token);
  group('Friday dinner rush - order', () => {
    createOrder(auth.token, userId, `rest-${(__VU % 5) + 1}`, `addr-${userId}`);
  });
  sleep(Number(__ENV.THINK_TIME_SECONDS || 0.5));
}
