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
exports.FraudHardeningService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let FraudHardeningService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var FraudHardeningService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            FraudHardeningService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        configService;
        auditService;
        fraudFlagRepo;
        logger = new common_1.Logger(FraudHardeningService.name);
        constructor(configService, auditService, fraudFlagRepo) {
            this.configService = configService;
            this.auditService = auditService;
            this.fraudFlagRepo = fraudFlagRepo;
        }
        async checkPaymentFraud(context) {
            const reasons = [];
            let riskScore = 0;
            const velocityCheck = await this.checkVelocity(context.userId, context.amount);
            if (!velocityCheck.allowed) {
                riskScore += velocityCheck.riskScore;
                reasons.push(...velocityCheck.reasons);
            }
            const patternCheck = await this.checkSuspiciousPatterns(context);
            if (!patternCheck.allowed) {
                riskScore += patternCheck.riskScore;
                reasons.push(...patternCheck.reasons);
            }
            const blockThreshold = this.configService.get('PAYMENT_FRAUD_BLOCK_THRESHOLD', 70);
            const allowed = riskScore < blockThreshold;
            if (!allowed) {
                await this.flagFraudulentActivity({
                    ...context,
                    riskScore,
                    reasons,
                });
            }
            return { allowed, riskScore, reasons };
        }
        async checkVelocity(userId, amount) {
            const reasons = [];
            let riskScore = 0;
            const hourlyTransactions = await this.fraudFlagRepo.count({
                where: {
                    userId,
                    createdAt: (0, typeorm_1.MoreThanOrEqual)(new Date(Date.now() - 60 * 60 * 1000))
                }
            });
            const dailyLimit = this.configService.get('PAYMENT_DAILY_LIMIT_PER_USER', 50000);
            const maxTransactionsPerHour = this.configService.get('PAYMENT_MAX_TRANSACTIONS_PER_HOUR', 10);
            if (hourlyTransactions > maxTransactionsPerHour) {
                riskScore += 20;
                reasons.push(`High transaction velocity (${hourlyTransactions} transactions in last hour)`);
            }
            const recentAmount = await this.fraudFlagRepo
                .createQueryBuilder('f')
                .select('SUM(f.amount)', 'total')
                .where('f.userId = :userId', { userId })
                .andWhere('f.createdAt >= :since', { since: new Date(Date.now() - 24 * 60 * 60 * 1000) })
                .getRawOne();
            const dailyTotal = Number(recentAmount?.total || 0) + amount;
            if (dailyTotal > dailyLimit) {
                riskScore += 40;
                reasons.push(`Daily limit exceeded ($${dailyTotal} > $${dailyLimit})`);
            }
            return { allowed: riskScore < 70, riskScore, reasons };
        }
        async checkSuspiciousPatterns(context) {
            const reasons = [];
            let riskScore = 0;
            const ipCheck = await this.checkIpReputation(context.ipAddress);
            if (ipCheck) {
                riskScore += 15;
                reasons.push('Suspicious IP address detected');
            }
            if (context.cardInfo?.funding === 'prepaid') {
                riskScore += 10;
                reasons.push('Prepaid card detected');
            }
            if (context.amount && context.amount <= this.configService.get('PAYMENT_MIN_AMOUNT', 5)) {
                const smallAmountCount = await this.fraudFlagRepo
                    .createQueryBuilder('f')
                    .where('f.userId = :userId', { userId: context.userId })
                    .andWhere('f.amount = :amount', { amount: context.amount })
                    .andWhere('f.createdAt >= :since', { since: new Date(Date.now() - 60 * 60 * 1000) })
                    .getCount();
                if (smallAmountCount > 5) {
                    riskScore += 30;
                    reasons.push('Potential card testing with small amounts');
                }
            }
            return { allowed: riskScore < 70, riskScore, reasons };
        }
        async checkIpReputation(ipAddress) {
            if (!ipAddress)
                return false;
            const suspiciousPatterns = [
                '10.',
                '192.168.',
                '172.16.',
            ];
            return suspiciousPatterns.some(pattern => ipAddress.startsWith(pattern));
        }
        async flagFraudulentActivity(data) {
            const flag = this.fraudFlagRepo.create({
                userId: data.userId,
                paymentIntentId: data.paymentIntentId,
                orderId: data.orderId,
                flagType: this.determineFlagType(data.riskScore, data.reasons),
                amount: data.amount,
                riskScore: data.riskScore,
                evidence: {
                    ipAddress: data.ipAddress,
                    userAgent: data.userAgent,
                    ...data.cardInfo,
                },
                isBlocked: data.riskScore >= 70,
                blockedAt: data.riskScore >= 70 ? new Date() : undefined,
            });
            const saved = await this.fraudFlagRepo.save(flag);
            if (data.riskScore >= 50) {
                await this.auditService.log('fraud_flag_raised', data.userId, 'Payment', data.paymentIntentId, {
                    riskScore: data.riskScore,
                    reasons: data.reasons,
                    flagType: flag.flagType,
                });
            }
            return saved;
        }
        determineFlagType(riskScore, reasons) {
            const reasonsStr = reasons.join(' ').toLowerCase();
            if (reasonsStr.includes('velocity') || reasonsStr.includes('transactions')) {
                return 'velocity_abuse';
            }
            if (reasonsStr.includes('testing') || reasonsStr.includes('small amount')) {
                return 'card_testing';
            }
            if (reasonsStr.includes('prepaid')) {
                return 'high_risk_card';
            }
            if (reasonsStr.includes('ip')) {
                return 'suspicious_pattern';
            }
            return 'other';
        }
        async isUserBlocked(userId) {
            const recentBlock = await this.fraudFlagRepo.findOne({
                where: {
                    userId,
                    isBlocked: true,
                    blockedAt: (0, typeorm_1.MoreThanOrEqual)(new Date(Date.now() - 60 * 60 * 1000))
                }
            });
            return !!recentBlock;
        }
        async getFraudHistory(userId, limit = 50) {
            return this.fraudFlagRepo.find({
                where: { userId },
                order: { createdAt: 'DESC' },
                take: limit,
            });
        }
        async getFraudStats() {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const [totalFlags, blockedUsers, recentFlags, weeklyFlags] = await Promise.all([
                this.fraudFlagRepo.count(),
                this.fraudFlagRepo
                    .createQueryBuilder('f')
                    .select('COUNT(DISTINCT f.userId)', 'count')
                    .where('f.isBlocked = :blocked', { blocked: true })
                    .andWhere('f.blockedAt >= :since', { since: twentyFourHoursAgo })
                    .getRawOne()
                    .then(r => Number(r?.count || 0)),
                this.fraudFlagRepo.count({
                    where: { createdAt: (0, typeorm_1.MoreThanOrEqual)(twentyFourHoursAgo) }
                }),
                this.fraudFlagRepo.count({
                    where: { createdAt: (0, typeorm_1.MoreThanOrEqual)(sevenDaysAgo) }
                }),
            ]);
            return {
                totalFraudFlags: totalFlags,
                blockedUsersLast24h: blockedUsers,
                fraudFlagsLast24h: recentFlags,
                fraudFlagsLast7d: weeklyFlags,
            };
        }
    };
    return FraudHardeningService = _classThis;
})();
exports.FraudHardeningService = FraudHardeningService;
