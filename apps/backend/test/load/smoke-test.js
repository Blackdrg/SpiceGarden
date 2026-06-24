import { runUserFlow, loadOptions, setup } from './common.js';

export const options = loadOptions([
  { duration: '15s', target: 5 },
  { duration: '15s', target: 25 },
  { duration: '30s', target: 50 },
]);

export { setup };

export default function() {
  runUserFlow('smoke test', false);
}
