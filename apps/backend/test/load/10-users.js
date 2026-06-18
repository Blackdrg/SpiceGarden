import { runUserFlow, loadOptions, setup } from './common.js';

export const options = loadOptions([
  { duration: '30s', target: 10 },
]);

export { setup };

export default function() {
  runUserFlow('10 users stage');
}