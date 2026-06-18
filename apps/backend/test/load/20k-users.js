import { runUserFlow, loadOptions, setup } from './common.js';

export const options = loadOptions([
  { duration: '3m', target: 10000 },
  { duration: '10m', target: 20000 },
  { duration: '3m', target: 0 },
]);

export { setup };

export default function() {
  runUserFlow('20k user flow');
}
