export const config = {
    BASE_URL: __ENV.BASE_URL || 'http://localhost:3001',
    API_KEY: __ENV.API_KEY || '',
    DURATION_SECONDS: parseInt(__ENV.DURATION_SECONDS || '1800'),
    RAMP_UP_SECONDS: parseInt(__ENV.RAMP_UP_SECONDS || '120'),
    RAMP_DOWN_SECONDS: parseInt(__ENV.RAMP_DOWN_SECONDS || '120'),
    TARGET_VUS: parseInt(__ENV.TARGET_VUS || '1000'),
    THINK_TIME_MIN: parseInt(__ENV.THINK_TIME_MIN || '1'),
    THINK_TIME_MAX: parseInt(__ENV.THINK_TIME_MAX || '5'),
    BASELINE_LATENCY_MS: parseInt(__ENV.BASELINE_LATENCY_MS || '200'),
    ERROR_THRESHOLD: parseFloat(__ENV.ERROR_THRESHOLD || '0.01'),
    LATENCY_P95_THRESHOLD_MS: parseInt(__ENV.LATENCY_P95_THRESHOLD_MS || '500'),
    LATENCY_P99_THRESHOLD_MS: parseInt(__ENV.LATENCY_P99_THRESHOLD_MS || '1000'),
    PAYMENT_SUCCESS_THRESHOLD: parseFloat(__ENV.PAYMENT_SUCCESS_THRESHOLD || '0.999'),
};

export const endpoints = {
    health: '/health',
    metrics: '/metrics',
    auth: {
        login: '/auth/login',
        register: '/auth/register',
        refresh: '/auth/refresh-token',
    },
    restaurants: {
        list: '/restaurants',
        search: '/restaurants/search',
    },
    orders: {
        create: '/orders',
        list: '/orders',
    },
    wallet: {
        balance: '/wallet/balance',
        transactions: '/wallet/transactions',
    },
    payments: {
        intent: '/payments/create-intent',
        confirm: '/payments/confirm',
        refund: '/payments/refund',
    },
    users: {
        profile: '/auth/me',
        addresses: '/user/addresses',
    },
    notifications: '/notification-queue/stats/overview',
};

export const thresholds = {
    http_success: ['rate>' + (1 - config.ERROR_THRESHOLD)],
    http_duration_p95: ['p(95)<' + config.LATENCY_P95_THRESHOLD_MS],
    http_duration_p99: ['p(99)<' + config.LATENCY_P99_THRESHOLD_MS],
};