import { createPaymentIntent, ensureToken, loadOptions, setup, userIdFromToken } from './common.js';
import { group, sleep } from 'k6';

export const options = loadOptions([
  { duration: '30s', target: 200 },
  { duration: '2m', target: 2000 },
  { duration: '30s', target: 0 },
]);

export { setup };

export default function() {
  const auth = ensureToken('payment-spike');
  if (!auth.token) {
    return;
  }
  const userId = auth.userId || userIdFromToken(auth.token);
  group('Payment spike - create intent', () => {
    createPaymentIntent(auth.token, userId, 500 + (__VU % 10) * 100);
  });
  sleep(Number(__ENV.THINK_TIME_SECONDS || 0.3));
}
