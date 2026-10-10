// infra/load-tests/stage-7-500k.js
/**
 * SpiceGarden Stage 7: 500,000 Concurrent VU Workload
 * Direct delegate to full six-scenario distributed test suite
 */
export { options, execBrowse, execSearch, execCart, execCheckout, execTracking, execAdmin } from './500k/main.js';