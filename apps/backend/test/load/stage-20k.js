import { loadOptions, setup, runDistributedFlow } from './common.js';

export const options = loadOptions([
  { duration: '10m', target: 5000 },
  { duration: '15m', target: 10000 },
  { duration: '20m', target: 20000 },
  { duration: '15m', target: 20000 },
  { duration: '5m', target: 0 },
]);

export { setup };

export default function () {
  runDistributedFlow('20k-stage');
}
