import { runUserFlow, loadOptions, setup } from './common.js';

export const options = loadOptions([
  { duration: __ENV.STAGE_DURATION || '30s', target: 10 },
  { duration: __ENV.STAGE_DURATION || '30s', target: 50 },
  { duration: __ENV.STAGE_DURATION || '30s', target: 100 },
  { duration: __ENV.STAGE_DURATION || '30s', target: 500 },
  { duration: __ENV.STAGE_DURATION || '30s', target: 1000 },
  { duration: __ENV.STAGE_DURATION || '30s', target: 5000 },
  { duration: __ENV.STAGE_DURATION || '30s', target: 10000 },
]);

export { setup };

export default function() {
  runUserFlow('10k user flow');
}
