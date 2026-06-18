import { loadOptions, metrics, request, setup } from './common.js';
import { group, sleep } from 'k6';

export const options = loadOptions([
  { duration: '2m', target: 1000 },
  { duration: '5m', target: 5000 },
  { duration: '5m', target: 10000 },
  { duration: '2m', target: 0 },
]);

export { setup };

export default function() {
  group('Redis saturation - metrics probe', () => {
    request(
      'GET',
      `${__ENV.BASE_URL || 'http://localhost:3001'}/metrics`,
      null,
      { tags: { step: 'redis-metrics' } },
      'metrics endpoint',
      [200],
      metrics.browseSuccess,
    );
  });
  sleep(Number(__ENV.THINK_TIME_SECONDS || 0.1));
}
