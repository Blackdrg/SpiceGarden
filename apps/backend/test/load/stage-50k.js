import { loadOptions, setup, runDistributedFlow } from './common.js';

export const options = loadOptions([
  { duration: '15m', target: 10000 },
  { duration: '20m', target: 25000 },
  { duration: '30m', target: 50000 },
  { duration: '25m', target: 50000 },
  { duration: '5m', target: 0 },
]);

export { setup };

export default function () {
  runDistributedFlow('50k-stage');
}
