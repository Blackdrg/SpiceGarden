import { runUserFlow, loadOptions, setup } from './common.js';

export const options = loadOptions([
  { duration: '1m', target: 100 },
  { duration: '3m', target: 100 },
  { duration: '1m', target: 0 },
]);

export { setup };

export default function() {
  runUserFlow('concurrent users flow');
}
