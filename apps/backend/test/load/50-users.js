import { runUserFlow, loadOptions, setup } from './common.js';

export const options = loadOptions([
  { duration: '30s', target: 50 },
]);

export { setup };

export default function() {
  runUserFlow('50 users stage');
}