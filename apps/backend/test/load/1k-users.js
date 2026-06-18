import { runUserFlow, loadOptions, setup } from './common.js';

export const options = loadOptions([
  { duration: '2m', target: 1000 },
  { duration: '5m', target: 1000 },
  { duration: '2m', target: 0 },
]);

export { setup };

export default function() {
  runUserFlow('1k user flow');
}
