import { loadOptions, setup, runDistributedFlow } from './common.js';

export const options = loadOptions([
  { duration: '1h', target: 250000 },
  { duration: '2h', target: 500000 },
  { duration: '2h', target: 1000000 },
  { duration: '1h', target: 0 },
]);

export { setup };

export default function () {
  runDistributedFlow('1m-stage');
}
