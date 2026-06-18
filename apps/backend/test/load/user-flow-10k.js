import { runUserFlow, loadOptions, setup } from './common.js';

export const options = loadOptions([
  { duration: '2m', target: 10000 },
  { duration: '5m', target: 10000 },
  { duration: '2m', target: 0 },
]);

export { setup };

export default function() {
  runUserFlow('user flow 10k', __ENV.EXERCISE_PAYMENT === 'true');
}
