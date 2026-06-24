import { runUserFlow, loadOptions, setup } from './common.js';

export const options = loadOptions([
  { duration: '30s', target: 2500 },
]);

export { setup };

export default function() {
  runUserFlow('2500 users stage');
}