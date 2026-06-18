import { createOrder, ensureToken, loadOptions, setup, userIdFromToken } from './common.js';
import { group, sleep } from 'k6';

export const options = loadOptions([
  { duration: '1m', target: 100 },
  { duration: '5m', target: 500 },
  { duration: '5m', target: 1000 },
  { duration: '5m', target: 2000 },
  { duration: '2m', target: 0 },
]);

export { setup };

export default function() {
  const auth = ensureToken('order-placement');
  if (!auth.token) {
    return;
  }
  const userId = auth.userId || userIdFromToken(auth.token);
  group('Order placement stress', () => {
    createOrder(auth.token, userId, `rest-${(__VU % 10) + 1}`, `addr-${userId}`);
  });
  sleep(Number(__ENV.THINK_TIME_SECONDS || 0.1));
}
