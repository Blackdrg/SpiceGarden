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
exports.WebhookRetryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let WebhookRetryService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var WebhookRetryService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            WebhookRetryService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        retryRepo;
        logger = new common_1.Logger(WebhookRetryService.name);
        constructor(retryRepo) {
            this.retryRepo = retryRepo;
        }
        async enqueueWebhook(webhookId, gateway, eventType, payload, maxAttempts = 5) {
            const job = this.retryRepo.create({
                webhookId,
                gateway,
                eventType,
                payload,
                attempt: 0,
                maxAttempts,
                status: 'pending',
                scheduledAt: new Date(),
            });
            return await this.retryRepo.save(job);
        }
        async getNextJob() {
            const now = new Date();
            const job = await this.retryRepo.findOne({
                where: {
                    status: 'pending',
                    scheduledAt: (0, typeorm_1.LessThan)(now),
                },
                order: { scheduledAt: 'ASC' },
            });
            if (!job)
                return null;
            await this.retryRepo.update(job.id, { status: 'processing' });
            return {
                webhookId: job.webhookId,
                gateway: job.gateway,
                eventType: job.eventType,
                payload: job.payload,
                attempt: job.attempt + 1,
                maxAttempts: job.maxAttempts,
            };
        }
        async success(jobId) {
            await this.retryRepo.update(jobId, { status: 'succeeded', processedAt: new Date() });
        }
        async fail(jobId, error) {
            const job = await this.retryRepo.findOne({ where: { id: jobId } });
            if (!job)
                return;
            const nextAttempt = job.attempt + 1;
            const delay = this.calculateDelay(nextAttempt);
            if (nextAttempt >= job.maxAttempts) {
                await this.retryRepo.update(jobId, {
                    status: 'discarded',
                    lastError: error,
                    processedAt: new Date(),
                });
                this.logger.error(`Webhook ${job.webhookId} discarded after ${job.maxAttempts} attempts: ${error}`);
            }
            else {
                const nextScheduled = new Date(Date.now() + delay);
                await this.retryRepo.update(jobId, {
                    status: 'pending',
                    attempt: nextAttempt,
                    scheduledAt: nextScheduled,
                    lastError: error,
                });
                this.logger.warn(`Webhook ${job.webhookId} retry scheduled for attempt ${nextAttempt}/${job.maxAttempts}`);
            }
        }
        calculateDelay(attempt) {
            const baseDelay = 60000;
            const delay = baseDelay * Math.pow(2, attempt - 1);
            const jitter = delay * 0.1 * Math.random();
            return Math.min(delay + jitter, 1800000);
        }
        async getStats() {
            const [pending, processing, succeeded, failed, discarded] = await Promise.all([
                this.retryRepo.count({ where: { status: 'pending' } }),
                this.retryRepo.count({ where: { status: 'processing' } }),
                this.retryRepo.count({ where: { status: 'succeeded' } }),
                this.retryRepo.count({
                    where: {
                        status: (0, typeorm_1.In)(['pending', 'processing']),
                        attempt: (0, typeorm_1.MoreThan)(0),
                    }
                }),
                this.retryRepo.count({ where: { status: 'discarded' } }),
            ]);
            return {
                pending,
                processing,
                succeeded,
                retrying: failed,
                discarded,
            };
        }
        async processRetryQueue() {
            const job = await this.getNextJob();
            if (!job)
                return;
            this.logger.log(`Processing webhook retry ${job.webhookId} (attempt ${job.attempt})`);
        }
    };
    return WebhookRetryService = _classThis;
})();
exports.WebhookRetryService = WebhookRetryService;
