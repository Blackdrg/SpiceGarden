import { runUserFlow, loadOptions, setup } from './common.js';

export const options = loadOptions([
  { duration: '1m', target: 5000 },
  { duration: '1m', target: 10000 },
  { duration: '1m', target: 15000 },
  { duration: '2m', target: 20000 },
  { duration: '2m', target: 25000 },
  { duration: '2m', target: 30000 },
  { duration: '2m', target: 35000 },
  { duration: '1m', target: 0 },
]);

export { setup };

export default function() {
  runUserFlow('breaking point flow');
}
