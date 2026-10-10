import { loadOptions, setup, runDistributedFlow } from './common.js';

export const options = loadOptions([
  { duration: '10m', target: 1000 },
  { duration: '20m', target: 1000 },
  { duration: '5m', target: 0 },
]);

export { setup };

export default function () {
  runDistributedFlow('1k-stage');
}
