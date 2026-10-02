// infra/load-tests/1m/config.js
export const CONFIG = {
  baseUrl: __ENV.API_BASE_URL || 'http://localhost:3001',
  wsUrl: __ENV.WS_BASE_URL || 'ws://localhost:3001',
  thinkTimeMin: 1.5, // seconds
  thinkTimeMax: 4.5, // seconds
  timeout: '5s',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-SpiceGarden-Client': 'k6-distributed-1m-suite',
    'X-Load-Test-Run-Id': __ENV.LOAD_TEST_RUN_ID || 'run_1m_master_20261002'
  }
};
