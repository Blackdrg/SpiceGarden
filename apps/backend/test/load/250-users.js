import { runUserFlow, loadOptions, setup } from './common.js';

export const options = loadOptions([
  { duration: '30s', target: 250 },
]);

export { setup };

export default function() {
  runUserFlow('250 users stage');
}