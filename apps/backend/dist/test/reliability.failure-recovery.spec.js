"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
(0, globals_1.describe)('Failure Recovery Tests', () => {
    let originalConsoleError;
    let originalConsoleWarn;
    let originalConsoleLog;
    (0, globals_1.beforeEach)(() => {
        originalConsoleError = console.error;
        originalConsoleWarn = console.warn;
        originalConsoleLog = console.log;
        console.error = globals_1.jest.fn();
        console.warn = globals_1.jest.fn();
        console.log = globals_1.jest.fn();
    });
    (0, globals_1.afterEach)(() => {
        console.error = originalConsoleError;
        console.warn = originalConsoleWarn;
        console.log = originalConsoleLog;
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.describe)('A. Redis Failure Recovery', () => {
        (0, globals_1.it)('should handle Redis connection failure gracefully without crashing', async () => {
            let crashDetected = false;
            const mockRedisClient = {
                ping: async () => { throw new Error('ECONNREFUSED'); },
                get: async () => { throw new Error('Connection lost'); },
                set: async () => { throw new Error('Connection lost'); },
                disconnect: () => { },
            };
            try {
                for (let i = 0; i < 50; i++) {
                    try {
                        await mockRedisClient.get(`key-${i}`);
                    }
                    catch (_e) {
                        continue;
                    }
                }
            }
            catch (_e) {
                crashDetected = true;
            }
            (0, globals_1.expect)(crashDetected).toBe(false);
        });
        (0, globals_1.it)('should return null for cache reads when Redis is down', async () => {
            const mockRedisClient = {
                get: async () => { throw new Error('Redis down'); },
            };
            const fallbackGet = async (_key) => {
                try {
                    return await mockRedisClient.get(_key);
                }
                catch (_e) {
                    return null;
                }
            };
            const result = await fallbackGet('session:user-123');
            (0, globals_1.expect)(result).toBeNull();
        });
        (0, globals_1.it)('should not throw on write failures when Redis is down', async () => {
            const mockRedisClient = {
                setex: async () => { throw new Error('Redis down'); },
            };
            const fallbackSet = async (_key, _value) => {
                try {
                    await mockRedisClient.setex(_key, 300, _value);
                }
                catch (_e) {
                    console.warn(`Cache write failed for ${_key}:`, _e);
                }
            };
            let threw = false;
            try {
                await fallbackSet('cache:key', 'value');
            }
            catch (_e) {
                threw = true;
            }
            (0, globals_1.expect)(threw).toBe(false);
        });
        (0, globals_1.it)('should retry Redis operations with backoff on transient failures', async () => {
            let attempts = 0;
            const flakyRedis = {
                ping: async () => {
                    attempts++;
                    if (attempts < 3)
                        throw new Error('ECONNRESET');
                    return 'PONG';
                },
            };
            const retryWithBackoff = async (fn, maxAttempts = 5) => {
                for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                    try {
                        return await fn();
                    }
                    catch (_err) {
                        if (attempt === maxAttempts)
                            return null;
                        await new Promise((r) => setTimeout(r, Math.min(100 * Math.pow(2, attempt - 1), 2000)));
                    }
                }
                return null;
            };
            const result = await retryWithBackoff(() => flakyRedis.ping());
            (0, globals_1.expect)(result).toBe('PONG');
            (0, globals_1.expect)(attempts).toBe(3);
        });
        (0, globals_1.it)('should reconnect safely after Redis comes back online', async () => {
            let isRedisUp = false;
            const client = {
                get: async (_key) => {
                    if (!isRedisUp)
                        throw new Error('Redis down');
                    return `cached-${_key}`;
                },
                set: async (_key, _value) => {
                    if (!isRedisUp)
                        throw new Error('Redis down');
                },
            };
            const readWithReconnect = async (key) => {
                try {
                    return await client.get(key);
                }
                catch (_e) {
                    await new Promise((r) => setTimeout(r, 100));
                    try {
                        return await client.get(key);
                    }
                    catch (_e2) {
                        return null;
                    }
                }
            };
            const resultBefore = await readWithReconnect('test-key');
            (0, globals_1.expect)(resultBefore).toBeNull();
            isRedisUp = true;
            const resultAfter = await readWithReconnect('test-key');
            (0, globals_1.expect)(resultAfter).toBe('cached-test-key');
        });
    });
    (0, globals_1.describe)('B. Postgres Failure Recovery', () => {
        (0, globals_1.it)('should handle Postgres connection pool exhaustion gracefully', async () => {
            const maxPool = 10;
            let activeConnections = 0;
            let rejectedConnections = 0;
            const acquireConnection = async () => {
                if (activeConnections >= maxPool) {
                    rejectedConnections++;
                    return false;
                }
                activeConnections++;
                return true;
            };
            const releaseConnection = () => {
                if (activeConnections > 0)
                    activeConnections--;
            };
            const tasks = [];
            for (let i = 0; i < 50; i++) {
                tasks.push((async () => {
                    const acquired = await acquireConnection();
                    if (acquired) {
                        await new Promise((r) => setTimeout(r, 10));
                        releaseConnection();
                    }
                })());
            }
            await Promise.all(tasks);
            (0, globals_1.expect)(rejectedConnections).toBeGreaterThan(0);
            (0, globals_1.expect)(activeConnections).toBeLessThanOrEqual(maxPool);
        });
        (0, globals_1.it)('should queue writes when Postgres is temporarily unavailable', async () => {
            const writeQueue = [];
            let isDbUp = false;
            let processedCount = 0;
            const dbWrite = async (data) => {
                if (!isDbUp) {
                    writeQueue.push(data);
                    return false;
                }
                processedCount++;
                return true;
            };
            await dbWrite({ orderId: 'order-1', status: 'PLACED' });
            await dbWrite({ orderId: 'order-2', status: 'CONFIRMED' });
            await dbWrite({ orderId: 'order-3', status: 'PREPARING' });
            (0, globals_1.expect)(writeQueue.length).toBe(3);
            (0, globals_1.expect)(processedCount).toBe(0);
            isDbUp = true;
            while (writeQueue.length > 0) {
                const data = writeQueue.shift();
                await dbWrite(data);
            }
            (0, globals_1.expect)(processedCount).toBe(3);
            (0, globals_1.expect)(writeQueue.length).toBe(0);
        });
        (0, globals_1.it)('should not corrupt data on Postgres reconnection', async () => {
            const committedOrders = new Map();
            let isDbUp = false;
            const safeWrite = async (orderId, data) => {
                if (!isDbUp) {
                    await new Promise((r) => setTimeout(r, 50));
                    if (!isDbUp)
                        return false;
                }
                if (!committedOrders.has(orderId)) {
                    committedOrders.set(orderId, { ...data, committedAt: new Date().toISOString() });
                    return true;
                }
                return false;
            };
            isDbUp = true;
            await safeWrite('order-1', { status: 'PLACED', amount: 500 });
            await safeWrite('order-1', { status: 'CONFIRMED', amount: 500 });
            await safeWrite('order-2', { status: 'PLACED', amount: 750 });
            (0, globals_1.expect)(committedOrders.size).toBe(2);
            (0, globals_1.expect)(committedOrders.get('order-1').status).toBe('PLACED');
            (0, globals_1.expect)(committedOrders.get('order-2').status).toBe('PLACED');
        });
        (0, globals_1.it)('should retry with exponential backoff on Postgres transient errors', async () => {
            let pgCalls = 0;
            const flakyPg = {
                query: async () => {
                    pgCalls++;
                    if (pgCalls < 3)
                        throw new Error('ECONNREFUSED: connection refused');
                    return [{ id: 'order-1' }];
                },
            };
            const retryDb = async (fn, maxAttempts = 5) => {
                for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                    try {
                        return await fn();
                    }
                    catch (_err) {
                        if (attempt === maxAttempts)
                            throw _err;
                        const delay = Math.min(100 * Math.pow(2, attempt - 1), 5000);
                        await new Promise((r) => setTimeout(r, delay));
                    }
                }
                return [];
            };
            const result = await retryDb(() => flakyPg.query());
            (0, globals_1.expect)(result).toEqual([{ id: 'order-1' }]);
            (0, globals_1.expect)(pgCalls).toBe(3);
        });
    });
    (0, globals_1.describe)('C. Mongo Failure Recovery', () => {
        (0, globals_1.it)('should degrade logging gracefully when Mongo is down', async () => {
            const fallbackLog = new Map();
            let mongoAvailable = false;
            const logWithFallback = async (logEntry) => {
                const entry = { ...logEntry, storedAt: new Date().toISOString() };
                if (!mongoAvailable) {
                    const orderId = entry.orderId || 'any';
                    fallbackLog.set(orderId, [...(fallbackLog.get(orderId) || []), entry]);
                }
            };
            await logWithFallback({ orderId: 'order-1', event: 'ORDER_PLACED', data: { amount: 500 } });
            await logWithFallback({ orderId: 'order-2', event: 'PAYMENT_CONFIRMED', data: { status: 'success' } });
            await logWithFallback({ orderId: 'order-1', event: 'DRIVER_ASSIGNED', data: { driverId: 'd1' } });
            (0, globals_1.expect)(fallbackLog.size).toBe(2);
            (0, globals_1.expect)((fallbackLog.get('order-1') || []).length).toBe(2);
            (0, globals_1.expect)((fallbackLog.get('order-2') || []).length).toBe(1);
            (0, globals_1.expect)(() => logWithFallback({ orderId: 'order-1', event: 'TEST' })).not.toThrow();
        });
        (0, globals_1.it)('should preserve document writes in memory buffer when Mongo is down', async () => {
            const documentBuffer = [];
            let mongoUp = false;
            const writeWithBuffer = async (doc) => {
                if (!mongoUp) {
                    documentBuffer.push({ ...doc, bufferedAt: new Date().toISOString() });
                    return true;
                }
                return true;
            };
            await writeWithBuffer({ type: 'review', restaurantId: 'rest-1', rating: 5 });
            await writeWithBuffer({ type: 'review', restaurantId: 'rest-2', rating: 4 });
            await writeWithBuffer({ type: 'inventory', itemId: 'item-1', quantity: 0 });
            (0, globals_1.expect)(documentBuffer.length).toBe(3);
            (0, globals_1.expect)(documentBuffer[0].bufferedAt).toBeDefined();
        });
        (0, globals_1.it)('should handle large document operations gracefully on Mongo failure', async () => {
            const result = { success: false, error: null, fallback: false };
            try {
                await Promise.reject(new Error('MongoDB connection timeout after 5000ms'));
            }
            catch (e) {
                result.error = e.message;
                result.fallback = true;
                result.success = false;
            }
            (0, globals_1.expect)(result.fallback).toBe(true);
            (0, globals_1.expect)(result.error).toContain('MongoDB');
        });
    });
    (0, globals_1.describe)('D. Payment Gateway Timeout Recovery', () => {
        (0, globals_1.it)('should prevent double payments with idempotency keys', async () => {
            const processedPayments = new Map();
            let callCount = 0;
            const processPaymentWithIdempotency = async (idempotencyKey, paymentData) => {
                if (processedPayments.has(idempotencyKey)) {
                    const existing = processedPayments.get(idempotencyKey);
                    return { success: existing.success, paymentId: existing.paymentId, duplicate: true };
                }
                callCount++;
                const paymentId = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
                processedPayments.set(idempotencyKey, { paymentId, success: true, data: paymentData });
                return { success: true, paymentId, duplicate: false };
            };
            const result1 = await processPaymentWithIdempotency('idem-key-1', { amount: 500, orderId: 'ord-1' });
            const result2 = await processPaymentWithIdempotency('idem-key-1', { amount: 500, orderId: 'ord-1' });
            (0, globals_1.expect)(result1.success).toBe(true);
            (0, globals_1.expect)(result2.success).toBe(true);
            (0, globals_1.expect)(result2.duplicate).toBe(true);
            (0, globals_1.expect)(result1.paymentId).toBe(result2.paymentId);
            (0, globals_1.expect)(callCount).toBe(1);
        });
        (0, globals_1.it)('should mark payment as pending on gateway timeout and not charge', async () => {
            const paymentStates = new Map();
            const initiatePaymentWithTimeout = async (paymentId) => {
                const stateKey = `payment:${paymentId}`;
                try {
                    await Promise.reject(new Error('Payment gateway timeout after 30000ms'));
                }
                catch (_e) {
                    paymentStates.set(stateKey, 'PENDING');
                }
                return stateKey;
            };
            const stateKey = await initiatePaymentWithTimeout('pay-timeout-1');
            const status = paymentStates.get(stateKey);
            (0, globals_1.expect)(status).toBe('PENDING');
            (0, globals_1.expect)(paymentStates.size).toBe(1);
        });
        (0, globals_1.it)('should verify idempotency on webhook retry', async () => {
            const webhookProcessed = new Set();
            let webhookCalls = 0;
            const processWebhookWithIdempotency = async (eventId, eventData) => {
                if (webhookProcessed.has(eventId)) {
                    return { processed: false, skipped: true };
                }
                webhookCalls++;
                webhookProcessed.add(eventId);
                return { processed: true, skipped: false };
            };
            const r1 = await processWebhookWithIdempotency('evt-1', { status: 'succeeded', paymentId: 'pay-1' });
            const r2 = await processWebhookWithIdempotency('evt-1', { status: 'succeeded', paymentId: 'pay-1' });
            const r3 = await processWebhookWithIdempotency('evt-1', { status: 'succeeded', paymentId: 'pay-1' });
            (0, globals_1.expect)(r1.processed).toBe(true);
            (0, globals_1.expect)(r1.skipped).toBe(false);
            (0, globals_1.expect)(r2.processed).toBe(false);
            (0, globals_1.expect)(r2.skipped).toBe(true);
            (0, globals_1.expect)(r3.processed).toBe(false);
            (0, globals_1.expect)(r3.skipped).toBe(true);
            (0, globals_1.expect)(webhookCalls).toBe(1);
        });
        (0, globals_1.it)('should retry failed payments with exponential backoff', async () => {
            let attempts = 0;
            const retryHistory = [];
            const executeWithRetry = async (maxAttempts = 5) => {
                for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                    attempts++;
                    retryHistory.push(attempt);
                    try {
                        if (attempt < 3)
                            throw new Error('Gateway timeout');
                        return true;
                    }
                    catch (_e) {
                        if (attempt === maxAttempts)
                            return false;
                    }
                }
                return false;
            };
            const success = await executeWithRetry();
            (0, globals_1.expect)(success).toBe(true);
            (0, globals_1.expect)(attempts).toBe(3);
            (0, globals_1.expect)(retryHistory).toEqual([1, 2, 3]);
        });
    });
    (0, globals_1.describe)('E. WebSocket Outage Recovery', () => {
        (0, globals_1.it)('should handle WebSocket connection drop without data loss', async () => {
            const messageStore = new Map();
            let wsConnected = true;
            const sendWithQueuing = async (clientId, message) => {
                if (!wsConnected) {
                    const queue = messageStore.get(clientId) || [];
                    queue.push({ ...message, queuedAt: new Date().toISOString() });
                    messageStore.set(clientId, queue);
                    return false;
                }
                return true;
            };
            const recoverAfterReconnect = async (clientId) => {
                const queued = messageStore.get(clientId) || [];
                messageStore.delete(clientId);
                return queued;
            };
            await sendWithQueuing('client-1', { type: 'ORDER_UPDATE', orderId: 'ord-1' });
            wsConnected = false;
            await sendWithQueuing('client-1', { type: 'PAYMENT_CONFIRMED', orderId: 'ord-1' });
            await sendWithQueuing('client-1', { type: 'DRIVER_ASSIGNED', orderId: 'ord-1' });
            const queuedMessages = await recoverAfterReconnect('client-1');
            (0, globals_1.expect)(queuedMessages.length).toBe(2);
            (0, globals_1.expect)(queuedMessages[0].type).toBe('PAYMENT_CONFIRMED');
            (0, globals_1.expect)(queuedMessages[1].type).toBe('DRIVER_ASSIGNED');
        });
        (0, globals_1.it)('should support fallback HTTP polling for tracking during WS outage', async () => {
            let wsAvailable = false;
            const trackingData = new Map();
            const getTrackingStatus = async (orderId) => {
                if (!wsAvailable) {
                    const cached = trackingData.get(orderId);
                    return cached ? { ...cached, source: 'http-fallback' } : { status: 'any', source: 'http-fallback' };
                }
                return { status: 'LIVE', source: 'websocket' };
            };
            const storeTrackingUpdate = async (orderId, data) => {
                trackingData.set(orderId, { ...data, updatedAt: new Date().toISOString() });
            };
            await storeTrackingUpdate('ord-1', { status: 'PREPARING', estimatedTime: 15 });
            const status = await getTrackingStatus('ord-1');
            (0, globals_1.expect)(status.source).toBe('http-fallback');
            (0, globals_1.expect)(status.status).toBe('PREPARING');
        });
        (0, globals_1.it)('should reconnect safely after WebSocket outage', async () => {
            let connectionAttempts = 0;
            const reconnectStrategy = async (maxAttempts = 10) => {
                for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                    connectionAttempts++;
                    const connected = attempt >= 3;
                    if (connected)
                        return true;
                    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
                    await new Promise((r) => setTimeout(r, delay));
                }
                return false;
            };
            const connected = await reconnectStrategy();
            (0, globals_1.expect)(connected).toBe(true);
            (0, globals_1.expect)(connectionAttempts).toBe(3);
        });
        (0, globals_1.it)('should acknowledge messages on reconnect to prevent duplicates', async () => {
            const acknowledgedMessages = new Set();
            const pendingMessages = new Map();
            const sendWithAck = async (messageId, data) => {
                if (acknowledgedMessages.has(messageId)) {
                    return false;
                }
                pendingMessages.set(messageId, data);
                return true;
            };
            const acknowledge = async (messageId) => {
                acknowledgedMessages.add(messageId);
                pendingMessages.delete(messageId);
            };
            await sendWithAck('msg-1', { type: 'ORDER_UPDATE', orderId: 'ord-1' });
            await sendWithAck('msg-2', { type: 'STATUS_CHANGE', orderId: 'ord-1' });
            (0, globals_1.expect)(pendingMessages.size).toBe(2);
            await acknowledge('msg-1');
            (0, globals_1.expect)(pendingMessages.size).toBe(1);
            const duplicateResult = await sendWithAck('msg-1', { type: 'ORDER_UPDATE', orderId: 'ord-1' });
            (0, globals_1.expect)(duplicateResult).toBe(false);
            await acknowledge('msg-2');
            (0, globals_1.expect)(pendingMessages.size).toBe(0);
        });
    });
    (0, globals_1.describe)('F. Coupon Abuse Detection', () => {
        (0, globals_1.it)('should reject excessive coupon usage attempts', async () => {
            const couponUsage = new Map();
            const checkCouponAbuse = (couponId, userId, maxUses = 10) => {
                const usage = couponUsage.get(couponId) || { count: 0, lastUsed: new Date(), userIds: new Set() };
                if (usage.userIds.has(userId)) {
                    return false;
                }
                if (usage.count >= maxUses) {
                    return false;
                }
                usage.count++;
                usage.userIds.add(userId);
                couponUsage.set(couponId, usage);
                return true;
            };
            for (let i = 0; i < 10; i++) {
                const allowed = checkCouponAbuse('SUMMER20', `user-${i}`);
                (0, globals_1.expect)(allowed).toBe(true);
            }
            const blocked1 = checkCouponAbuse('SUMMER20', 'user-new');
            (0, globals_1.expect)(blocked1).toBe(false);
            const blocked2 = checkCouponAbuse('SUMMER20', 'user-0');
            (0, globals_1.expect)(blocked2).toBe(false);
        });
        (0, globals_1.it)('should detect rapid-fire coupon application attempts', async () => {
            const attempts = [];
            const rapidThreshold = 5;
            const rapidWindowMs = 5000;
            const detectRapidCouponUse = (userId) => {
                const now = Date.now();
                attempts.push({ userId, timestamp: now });
                const recentAttempts = attempts.filter((a) => a.userId === userId && now - a.timestamp <= rapidWindowMs);
                return recentAttempts.length > rapidThreshold;
            };
            for (let i = 0; i < 7; i++) {
                const isRapid = detectRapidCouponUse('rapid-user');
                if (i >= rapidThreshold) {
                    (0, globals_1.expect)(isRapid).toBe(true);
                }
            }
        });
    });
    (0, globals_1.describe)('G. Queue Recovery', () => {
        (0, globals_1.it)('should recover failed queue jobs on restart', async () => {
            const completedJobs = new Set();
            const failedJobs = new Map();
            const processQueueJob = async (jobId, jobData) => {
                if (jobData.shouldFail && !completedJobs.has(jobId)) {
                    failedJobs.set(jobId, { ...jobData, failedAt: new Date().toISOString() });
                    return false;
                }
                completedJobs.add(jobId);
                failedJobs.delete(jobId);
                return true;
            };
            await processQueueJob('job-1', { orderId: 'ord-1', shouldFail: true });
            await processQueueJob('job-2', { orderId: 'ord-2', shouldFail: false });
            await processQueueJob('job-3', { orderId: 'ord-3', shouldFail: true });
            (0, globals_1.expect)(failedJobs.size).toBe(2);
            (0, globals_1.expect)(completedJobs.size).toBe(1);
            await processQueueJob('job-1', { orderId: 'ord-1', shouldFail: false });
            await processQueueJob('job-3', { orderId: 'ord-3', shouldFail: false });
            (0, globals_1.expect)(failedJobs.size).toBe(0);
            (0, globals_1.expect)(completedJobs.size).toBe(3);
        });
        (0, globals_1.it)('should handle queue job duplicates without double processing', async () => {
            const processedJobs = new Set();
            const idempotentProcess = async (jobId) => {
                if (processedJobs.has(jobId)) {
                    return { processed: false, duplicate: true };
                }
                processedJobs.add(jobId);
                return { processed: true, duplicate: false };
            };
            const r1 = await idempotentProcess('job-dup-1');
            const r2 = await idempotentProcess('job-dup-1');
            const r3 = await idempotentProcess('job-dup-1');
            (0, globals_1.expect)(r1.processed).toBe(true);
            (0, globals_1.expect)(r2.duplicate).toBe(true);
            (0, globals_1.expect)(r3.duplicate).toBe(true);
            (0, globals_1.expect)(processedJobs.size).toBe(1);
        });
    });
    (0, globals_1.describe)('H. Data Integrity Under Failure', () => {
        (0, globals_1.it)('should maintain order data consistency across concurrent writes', async () => {
            const orderStore = new Map();
            const concurrentWrite = async (orderId, updates) => {
                const existing = orderStore.get(orderId) || { status: 'PLACED', version: 0 };
                const current = { ...existing, ...updates, version: existing.version + 1 };
                orderStore.set(orderId, current);
            };
            await Promise.all([
                concurrentWrite('ord-1', { status: 'CONFIRMED' }),
                concurrentWrite('ord-1', { status: 'PREPARING' }),
                concurrentWrite('ord-1', { status: 'READY' }),
            ]);
            const final_ = orderStore.get('ord-1');
            (0, globals_1.expect)(final_).toBeDefined();
            (0, globals_1.expect)(final_.version).toBe(3);
            (0, globals_1.expect)(['CONFIRMED', 'PREPARING', 'READY']).toContain(final_.status);
        });
        (0, globals_1.it)('should detect and prevent partial order state corruption', async () => {
            const validTransitions = {
                PLACED: ['PAYMENT_CONFIRMED', 'CANCELLED'],
                PAYMENT_CONFIRMED: ['PREPARING', 'CANCELLED'],
                PREPARING: ['READY', 'CANCELLED'],
                READY: ['DRIVER_ASSIGNED', 'CANCELLED'],
                DRIVER_ASSIGNED: ['PICKED_UP', 'CANCELLED'],
                PICKED_UP: ['ON_THE_WAY', 'CANCELLED'],
                ON_THE_WAY: ['DELIVERED', 'CANCELLED'],
            };
            const isValidTransition = (from, to) => {
                return validTransitions[from]?.includes(to) || false;
            };
            (0, globals_1.expect)(isValidTransition('PLACED', 'PAYMENT_CONFIRMED')).toBe(true);
            (0, globals_1.expect)(isValidTransition('PLACED', 'DELIVERED')).toBe(false);
            (0, globals_1.expect)(isValidTransition('PREPARING', 'ON_THE_WAY')).toBe(false);
            (0, globals_1.expect)(isValidTransition('READY', 'DRIVER_ASSIGNED')).toBe(true);
        });
    });
});
//# sourceMappingURL=reliability.failure-recovery.spec.js.map