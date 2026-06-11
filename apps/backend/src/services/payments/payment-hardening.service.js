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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentHardeningService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const stripe_1 = __importDefault(require("stripe"));
let PaymentHardeningService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var PaymentHardeningService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            PaymentHardeningService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        configService;
        auditService;
        idempotencyRepo;
        validationRepo;
        logger = new common_1.Logger(PaymentHardeningService.name);
        stripe;
        constructor(configService, auditService, idempotencyRepo, validationRepo) {
            this.configService = configService;
            this.auditService = auditService;
            this.idempotencyRepo = idempotencyRepo;
            this.validationRepo = validationRepo;
            this.stripe = new stripe_1.default(this.configService.get('STRIPE_SECRET_KEY') || 'sk_test_placeholder', {
                apiVersion: '2024-04-10',
            });
        }
        async validatePayment(amount, userId, request) {
            const errors = [];
            const amountValidation = await this.validateAmount(amount, userId);
            if (!amountValidation.valid) {
                errors.push(...amountValidation.errors);
            }
            const limitValidation = await this.validateLimits(amount, userId);
            if (!limitValidation.valid) {
                errors.push(...limitValidation.errors);
            }
            const velocityValidation = await this.validateVelocity(userId, request);
            if (!velocityValidation.valid) {
                errors.push(...velocityValidation.errors);
            }
            if (errors.length > 0) {
                return { valid: false, errors };
            }
            return { valid: true, errors: [] };
        }
        async validateAmount(amount, userId) {
            const errors = [];
            const maxSingleAmount = this.configService.get('PAYMENT_MAX_SINGLE_AMOUNT', 10000);
            if (amount > maxSingleAmount) {
                errors.push(`Payment amount exceeds maximum allowed: $${maxSingleAmount}`);
            }
            if (amount <= 0) {
                errors.push('Payment amount must be greater than zero');
            }
            const minAmount = this.configService.get('PAYMENT_MIN_AMOUNT', 1);
            if (amount < minAmount) {
                errors.push(`Payment amount must be at least $${minAmount}`);
            }
            await this.validationRepo.save({
                userId,
                validationType: 'amount_check',
                amount,
                passed: errors.length === 0,
                failureReason: errors.join(', ') || null,
            });
            return { valid: errors.length === 0, errors };
        }
        async validateLimits(amount, userId) {
            const errors = [];
            const dailyLimit = this.configService.get('PAYMENT_DAILY_LIMIT_PER_USER', 50000);
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const idem = await this.idempotencyRepo
                .createQueryBuilder('id')
                .select('SUM((id."requestPayload"->>\'amount\')::numeric)', 'total')
                .where('id."userId" = :userId', { userId })
                .andWhere('id."operation" = :op', { op: 'create_payment_intent' })
                .andWhere('id."createdAt" >= :since', { since: todayStart })
                .getRawOne();
            const dailyTotal = (idem?.total || 0) + amount;
            if (dailyTotal > dailyLimit) {
                errors.push(`Daily payment limit exceeded (attempted: $${dailyTotal}, limit: $${dailyLimit})`);
            }
            await this.validationRepo.save({
                userId,
                validationType: 'daily_limit_check',
                amount,
                validationData: { dailyTotal, dailyLimit },
                passed: errors.length === 0,
                failureReason: errors.join(', ') || null,
            });
            return { valid: errors.length === 0, errors };
        }
        async validateVelocity(userId, request) {
            const errors = [];
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const maxPerHour = this.configService.get('PAYMENT_MAX_TRANSACTIONS_PER_HOUR', 10);
            const hourlyCount = await this.idempotencyRepo.count({
                where: {
                    userId,
                    operation: 'create_payment_intent',
                    createdAt: (0, typeorm_1.MoreThanOrEqual)(oneHourAgo)
                }
            });
            if (hourlyCount >= maxPerHour) {
                errors.push(`Too many payment attempts (${hourlyCount} in last hour, max: ${maxPerHour})`);
            }
            if (request) {
                const ip = request.ip || request.connection.remoteAddress;
                const ipAttempts = await this.idempotencyRepo
                    .createQueryBuilder('id')
                    .where('id."metadata"->>\'ip\' = :ip', { ip })
                    .andWhere('id."createdAt" >= :since', { since: oneHourAgo })
                    .getCount();
                const maxPerIp = this.configService.get('PAYMENT_MAX_TRANSACTIONS_PER_IP', 5);
                if (ipAttempts >= maxPerIp) {
                    errors.push(`Too many attempts from this IP (${ipAttempts} in last hour)`);
                }
            }
            await this.validationRepo.save({
                userId,
                validationType: 'velocity_check',
                validationData: { hourlyCount, maxPerHour },
                passed: errors.length === 0,
                failureReason: errors.join(', ') || null,
            });
            return { valid: errors.length === 0, errors };
        }
        async validateIdempotency(idempotencyKey, operation, userId, requestPayload) {
            if (!idempotencyKey) {
                return { isDuplicate: false };
            }
            const existing = await this.idempotencyRepo.findOne({
                where: { key: idempotencyKey, operation }
            });
            if (existing?.isCompleted) {
                this.logger.warn(`Duplicate request detected: ${operation} with key ${idempotencyKey}`);
                return { isDuplicate: true, existingResponse: existing.responsePayload };
            }
            if (existing && !existing.isCompleted) {
                const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
                if (existing.createdAt < fiveMinutesAgo) {
                    await this.idempotencyRepo.remove(existing);
                    return { isDuplicate: false };
                }
                return { isDuplicate: true, existingResponse: existing.responsePayload };
            }
            const newKey = this.idempotencyRepo.create({
                key: idempotencyKey,
                operation,
                userId,
                requestPayload,
                isCompleted: false,
            });
            await this.idempotencyRepo.save(newKey);
            return { isDuplicate: false };
        }
        async completeIdempotency(idempotencyKey, operation, responsePayload, statusCode = 200) {
            await this.idempotencyRepo.update({ key: idempotencyKey, operation }, {
                responsePayload,
                statusCode,
                isCompleted: true,
                completedAt: new Date(),
            });
        }
        async checkFraudRisk(userId, amount, paymentMethodId, request) {
            const reasons = [];
            let riskScore = 0;
            const maxSingleAmount = this.configService.get('PAYMENT_MAX_SINGLE_AMOUNT', 10000);
            if (amount > maxSingleAmount) {
                riskScore += 80;
                reasons.push(`Amount exceeds maximum allowed ($${maxSingleAmount})`);
            }
            if (amount <= 0) {
                riskScore += 100;
                reasons.push('Invalid payment amount');
            }
            const dailyLimit = this.configService.get('PAYMENT_DAILY_LIMIT_PER_USER', 50000);
            const dailyTransactions = await this.idempotencyRepo.count({
                where: {
                    userId,
                    operation: 'create_payment_intent',
                    createdAt: (0, typeorm_1.MoreThanOrEqual)(new Date(Date.now() - 24 * 60 * 60 * 1000))
                }
            });
            if (dailyTransactions > 10) {
                riskScore += 30;
                reasons.push('High transaction velocity (more than 10 payments in 24h)');
            }
            if (request) {
                const ip = request.ip || request.connection.remoteAddress;
                const ipRequests = await this.idempotencyRepo
                    .createQueryBuilder('id')
                    .where('id."metadata"->>\'ip\' = :ip', { ip })
                    .andWhere('id."createdAt" >= :since', { since: new Date(Date.now() - 60 * 60 * 1000) })
                    .getCount();
                if (ipRequests > 5) {
                    riskScore += 25;
                    reasons.push('Multiple requests from same IP in 1 hour');
                }
            }
            if (paymentMethodId && paymentMethodId.startsWith('pm_fake')) {
                riskScore += 40;
                reasons.push('Test payment method detected');
            }
            const isBlocked = riskScore >= 70;
            const riskLevel = riskScore >= 70 ? 'high' : riskScore >= 30 ? 'medium' : 'low';
            return { riskScore, isBlocked, reasons, riskLevel };
        }
        async validateCard(paymentMethodId, currency = 'usd') {
            try {
                if (!paymentMethodId) {
                    return { valid: false, error: 'Payment method ID is required' };
                }
                const paymentMethod = await this.stripe.paymentMethods.retrieve(paymentMethodId);
                if (paymentMethod.type !== 'card') {
                    return { valid: false, error: 'Invalid payment method type' };
                }
                const card = paymentMethod.card;
                const now = new Date();
                const currentYear = now.getFullYear();
                const currentMonth = now.getMonth() + 1;
                if (card) {
                    if (card.exp_year < currentYear ||
                        (card.exp_year === currentYear && card.exp_month < currentMonth)) {
                        return { valid: false, error: 'Card is expired' };
                    }
                    if (!card.checks?.cvc_check || card.checks.cvc_check === 'fail') {
                        return { valid: false, error: 'CVC verification failed' };
                    }
                    if (card.funding === 'prepaid') {
                        await this.auditService.log('suspicious_payment_method', null, 'Payment', paymentMethodId, { cardFunding: card.funding, reason: 'Prepaid card funding type' });
                    }
                }
                return { valid: true, paymentMethod };
            }
            catch (error) {
                this.logger.error(`Card validation failed: ${error.message}`);
                return { valid: false, error: 'Failed to validate payment method' };
            }
        }
        async validateWebhookSignature(payload, signature) {
            const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
            if (!webhookSecret) {
                this.logger.error('Stripe webhook secret not configured');
                return false;
            }
            try {
                this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
                return true;
            }
            catch (error) {
                return false;
            }
        }
        async handleChargeback(paymentIntentId, dispute) {
            await this.auditService.logPaymentEvent('chargeback_received', dispute.customer || 'unknown', dispute.amount ? dispute.amount / 100 : 0, dispute.currency || 'usd', 'stripe', paymentIntentId, false, undefined, `Chargeback reason: ${dispute.reason}`);
            if (dispute.status === 'won') {
                return { status: 'won', reason: dispute.reason };
            }
            const refund = await this.stripe.refunds.create({
                payment_intent: paymentIntentId,
                reason: 'duplicate',
            }).catch(() => null);
            return {
                status: dispute.status,
                reason: dispute.reason,
                autoRefundCreated: !!refund,
                refundId: refund?.id,
            };
        }
        async createPaymentRetry(paymentIntentId, retryAttempt) {
            const existingIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
            if (!existingIntent) {
                throw new common_1.BadRequestException('Payment intent not found');
            }
            const maxRetries = this.configService.get('PAYMENT_MAX_RETRIES', 3);
            if (retryAttempt > maxRetries) {
                throw new common_1.BadRequestException('Max retry attempts exceeded');
            }
            const retryIntent = await this.stripe.paymentIntents.create({
                amount: existingIntent.amount,
                currency: existingIntent.currency,
                metadata: {
                    ...existingIntent.metadata,
                    original_intent: paymentIntentId,
                    retry_attempt: retryAttempt.toString(),
                    retry_reason: 'failed_payment_retry',
                },
            });
            await this.auditService.logPaymentEvent('payment_retry_created', existingIntent.metadata?.userId || 'unknown', existingIntent.amount / 100, existingIntent.currency, 'stripe', retryIntent.id, true, undefined, `Retry attempt ${retryAttempt} for intent ${paymentIntentId}`);
            return retryIntent;
        }
    };
    return PaymentHardeningService = _classThis;
})();
exports.PaymentHardeningService = PaymentHardeningService;
