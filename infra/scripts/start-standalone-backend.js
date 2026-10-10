process.env.LOCAL_DB = 'sqlite';
process.env.DISABLE_BULLMQ = 'true';
process.env.NODE_ENV = 'test';
process.env.LOAD_TEST_MODE = 'true';
process.env.RATE_LIMIT_REDIS_REQUIRED = 'false';
process.env.WS_RATE_LIMIT_MAX = '1000000';
process.env.RATE_LIMIT_PUBLIC_MAX = '1000000';
process.env.RATE_LIMIT_AUTH_MAX = '1000000';
process.env.RATE_LIMIT_WRITE_MAX = '1000000';
process.env.PORT = '3001';

console.log('[Runner] Starting SpiceGarden full NestJS backend in standalone high-concurrency mode...');
require('../../apps/backend/dist/src/main.js');

