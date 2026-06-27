import { loadOptions, setup, runDistributedFlow } from './common.js';

export const options = loadOptions([
  { duration: '1h', target: 100000 },
  { duration: '1h', target: 250000 },
  { duration: '1h', target: 500000 },
  { duration: '1h', target: 500000 },
  { duration: '30m', target: 0 },
]);

export { setup };

export default function () {
  runDistributedFlow('500k-stage');
}
