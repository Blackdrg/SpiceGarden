"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let RetryService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var RetryService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            RetryService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        configService;
        idempotencyRepo;
        logger = new common_1.Logger(RetryService.name);
        defaultConfig = {
            maxAttempts: 5,
            baseDelayMs: 1000,
            maxDelayMs: 30000,
            backoffMultiplier: 2,
            jitterFactor: 0.1,
        };
        constructor(configService, idempotencyRepo) {
            this.configService = configService;
            this.idempotencyRepo = idempotencyRepo;
        }
        getConfig(key) {
            const configKey = `PAYMENT_RETRY_${key.toUpperCase()}`;
            return this.configService.get(configKey, this.defaultConfig[key]);
        }
        calculateDelay(attempt, baseDelay, maxDelay, multiplier, jitter) {
            const exponentialDelay = baseDelay * Math.pow(multiplier, attempt - 1);
            const cappedDelay = Math.min(exponentialDelay, maxDelay);
            const jitterOffset = cappedDelay * jitter * Math.random();
            return Math.floor(cappedDelay + jitterOffset);
        }
        async executeWithRetry(operation, operationName, context = {}) {
            const maxAttempts = this.getConfig('maxAttempts');
            const baseDelay = this.getConfig('baseDelayMs');
            const maxDelay = this.getConfig('maxDelayMs');
            const multiplier = this.getConfig('backoffMultiplier');
            const jitter = this.getConfig('jitterFactor');
            let lastError;
            let attempts = 0;
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                attempts = attempt;
                try {
                    const result = await operation();
                    return { success: true, result, attempts };
                }
                catch (error) {
                    lastError = error;
                    const retryableErrors = [
                        'network_error',
                        'timeout',
                        'rate_limit',
                        'service_unavailable',
                        'temporary_failure',
                    ];
                    const isRetryable = retryableErrors.some(re => lastError.message.toLowerCase().includes(re) ||
                        lastError.type === 'api_connection_error');
                    if (!isRetryable || attempt === maxAttempts) {
                        this.logger.error(`Operation ${operationName} failed after ${attempt} attempts: ${lastError.message}`);
                        return { success: false, error: lastError, attempts };
                    }
                    const delay = this.calculateDelay(attempt, baseDelay, maxDelay, multiplier, jitter);
                    this.logger.warn(`Operation ${operationName} failed (attempt ${attempt}/${maxAttempts}). Retrying in ${delay}ms: ${lastError.message}`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
            return { success: false, error: lastError, attempts };
        }
        async getRetryableFailedPayments() {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            return this.idempotencyRepo
                .createQueryBuilder('id')
                .where('id.operation = :op', { op: 'create_payment_intent' })
                .andWhere('id.isCompleted = :completed', { completed: false })
                .andWhere('id.createdAt <= :threshold', { threshold: oneHourAgo })
                .orderBy('id.createdAt', 'ASC')
                .limit(100)
                .getMany();
        }
        async cleanupStaleRetries() {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const result = await this.idempotencyRepo
                .createQueryBuilder()
                .delete()
                .where('isCompleted = :completed', { completed: false })
                .andWhere('createdAt <= :threshold', { threshold: twentyFourHoursAgo })
                .execute();
            return result.affected || 0;
        }
        async getRetryStats() {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const [pendingRetries, completedRetries, failedRetries, recentCompleted, recentFailed,] = await Promise.all([
                this.idempotencyRepo.count({ where: { isCompleted: false } }),
                this.idempotencyRepo.createQueryBuilder('id')
                    .where('id.isCompleted = :completed', { completed: true })
                    .andWhere('id."responsePayload"->>\'status\' = :status', { status: 'succeeded' })
                    .getCount(),
                this.idempotencyRepo.createQueryBuilder('id')
                    .where('id.isCompleted = :completed', { completed: true })
                    .andWhere('id."responsePayload"->>\'status\' = :status', { status: 'failed' })
                    .getCount(),
                this.idempotencyRepo.count({
                    where: {
                        operation: 'create_payment_intent',
                        isCompleted: true,
                        completedAt: (0, typeorm_1.MoreThanOrEqual)(oneHourAgo)
                    }
                }),
                this.idempotencyRepo.count({
                    where: {
                        operation: 'create_payment_intent',
                        isCompleted: true,
                        createdAt: (0, typeorm_1.MoreThanOrEqual)(oneHourAgo)
                    }
                }),
            ]);
            return {
                pendingRetries,
                completedRetries,
                failedRetries,
                retryAttemptsLastHour: recentCompleted + recentFailed,
            };
        }
    };
    return RetryService = _classThis;
})();
exports.RetryService = RetryService;
