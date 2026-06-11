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
exports.LoyaltyService = void 0;
const common_1 = require("@nestjs/common");
const coupon_entity_1 = require("../../db/entities/coupon.entity");
const coupon_usage_entity_1 = require("../../db/entities/coupon-usage.entity");
let LoyaltyService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var LoyaltyService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            LoyaltyService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        couponRepo;
        couponUsageRepo;
        referralRepo;
        subscriptionRepo;
        userRepo;
        orderRepo;
        dataSource;
        logger = new common_1.Logger(LoyaltyService.name);
        constructor(couponRepo, couponUsageRepo, referralRepo, subscriptionRepo, userRepo, orderRepo, dataSource) {
            this.couponRepo = couponRepo;
            this.couponUsageRepo = couponUsageRepo;
            this.referralRepo = referralRepo;
            this.subscriptionRepo = subscriptionRepo;
            this.userRepo = userRepo;
            this.orderRepo = orderRepo;
            this.dataSource = dataSource;
        }
        async createCoupon(data) {
            const coupon = this.couponRepo.create();
            Object.assign(coupon, data);
            return this.couponRepo.save(coupon);
        }
        async applyCoupon(code, userId, orderAmount, orderId) {
            const coupon = await this.couponRepo.findOne({ where: { code: code.toUpperCase() } });
            if (!coupon)
                throw new common_1.BadRequestException('Invalid coupon code');
            if (coupon.status !== coupon_entity_1.CouponStatus.ACTIVE)
                throw new common_1.BadRequestException('Coupon is not active');
            if (new Date() > coupon.validUntil)
                throw new common_1.BadRequestException('Coupon has expired');
            if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit)
                throw new common_1.BadRequestException('Coupon usage limit reached');
            const userUsage = await this.couponUsageRepo.count({
                where: { couponId: coupon.id, userId, status: coupon_usage_entity_1.CouponUsageStatus.USED }
            });
            if (userUsage >= coupon.usagePerUser)
                throw new common_1.BadRequestException('You have already used this coupon');
            if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
                throw new common_1.BadRequestException(`Minimum order amount of ₹${coupon.minOrderAmount} required`);
            }
            let discount = 0;
            switch (coupon.type) {
                case 'percentage':
                    discount = (orderAmount * coupon.discountValue) / 100;
                    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
                        discount = coupon.maxDiscountAmount;
                    }
                    break;
                case 'fixed_amount':
                    discount = coupon.discountValue;
                    break;
                case 'free_delivery':
                    discount = 40;
                    break;
            }
            const usage = this.couponUsageRepo.create({
                couponId: coupon.id,
                userId,
                orderId,
                discountApplied: discount,
                orderAmount,
                status: coupon_usage_entity_1.CouponUsageStatus.USED,
            });
            await this.couponUsageRepo.save(usage);
            coupon.usageCount++;
            if (coupon.usageCount >= coupon.usageLimit)
                coupon.status = coupon_entity_1.CouponStatus.DEPLETED;
            await this.couponRepo.save(coupon);
            return { discount, finalAmount: orderAmount - discount, couponId: coupon.id };
        }
        async generateReferralCode(userId) {
            const existing = await this.referralRepo.findOne({ where: { referrerId: userId } });
            if (existing)
                return existing;
            const user = await this.userRepo.findOne({ where: { id: userId } });
            const code = `SG${user.email.substring(0, 3).toUpperCase()}${Date.now().toString(36).toUpperCase().slice(-4)}`;
            const referral = this.referralRepo.create();
            Object.assign(referral, {
                code,
                referrerId: userId,
                refereeId: '',
                status: 'pending',
                rewardType: 'wallet_cashback',
                referrerReward: 50,
                refereeReward: 50,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            });
            return this.referralRepo.save(referral);
        }
        async processReferral(code, refereeId, firstOrderId) {
            const referral = await this.referralRepo.findOne({ where: { code: code.toUpperCase() } });
            if (!referral)
                throw new common_1.BadRequestException('Invalid referral code');
            if (referral.referrerId === refereeId)
                throw new common_1.BadRequestException('Cannot refer yourself');
            if (new Date() > referral.expiresAt)
                throw new common_1.BadRequestException('Referral code has expired');
            if (referral.status === 'completed')
                throw new common_1.BadRequestException('Referral already completed');
            referral.refereeId = refereeId;
            referral.refereeFirstOrderId = firstOrderId;
            referral.status = 'completed';
            referral.completedAt = new Date();
            referral.rewardGivenAt = new Date();
            await this.referralRepo.save(referral);
            return {
                referrerReward: referral.referrerReward,
                refereeReward: referral.refereeReward,
                message: 'Referral completed. Rewards processed on next payout cycle.',
            };
        }
        async processCashback(userId, orderId, orderAmount) {
            const subscription = await this.subscriptionRepo.findOne({
                where: { userId, status: 'active' }
            });
            let cashbackAmount = 0;
            if (subscription) {
                const benefits = subscription.benefits || {};
                cashbackAmount = (orderAmount * (benefits.cashbackPercentage || 5)) / 100;
                if (benefits.maxCashback && cashbackAmount > benefits.maxCashback) {
                    cashbackAmount = benefits.maxCashback;
                }
            }
            else {
                cashbackAmount = (orderAmount * 2) / 100;
                if (cashbackAmount > 20)
                    cashbackAmount = 20;
            }
            return { cashbackAmount, applied: cashbackAmount > 0 };
        }
        async getWalletCashback(userId) {
            const usages = await this.couponUsageRepo.find({
                where: { userId, status: coupon_usage_entity_1.CouponUsageStatus.USED },
                order: { usedAt: 'DESC' },
                take: 50,
            });
            const totalCashback = usages.reduce((sum, u) => sum + (u.discountApplied || 0), 0);
            return {
                totalCashback,
                transactionCount: usages.length,
                recentTransactions: usages.slice(0, 10),
            };
        }
        async getReferralHistory(userId) {
            const sent = await this.referralRepo.find({
                where: { referrerId: userId },
                order: { createdAt: 'DESC' },
            });
            const received = await this.referralRepo.find({
                where: { refereeId: userId },
                order: { createdAt: 'DESC' },
            });
            return {
                totalSent: sent.length,
                totalCompleted: sent.filter(r => r.status === 'completed').length,
                totalEarned: sent
                    .filter((r) => r.status === 'completed')
                    .reduce((sum, r) => sum + r.referrerReward, 0),
                sentReferrals: sent,
                receivedReferrals: received,
            };
        }
        async getAllCoupons(filters) {
            const query = this.couponRepo.createQueryBuilder('coupon');
            if (filters?.status)
                query.andWhere('coupon.status = :status', { status: filters.status });
            if (filters?.scope)
                query.andWhere('coupon.scope = :scope', { scope: filters.scope });
            return query.orderBy('coupon.createdAt', 'DESC').getMany();
        }
        async getCouponAnalytics(couponId) {
            const coupon = await this.couponRepo.findOne({ where: { id: couponId } });
            if (!coupon)
                throw new common_1.NotFoundException('Coupon not found');
            const usages = await this.couponUsageRepo.find({
                where: { couponId },
                order: { usedAt: 'DESC' },
            });
            const totalDiscount = usages.reduce((sum, u) => sum + (u.discountApplied || 0), 0);
            const totalOrders = usages.filter(u => u.orderId).length;
            return {
                coupon,
                totalUsages: usages.length,
                totalDiscountGiven: totalDiscount,
                totalOrdersGenerated: totalOrders,
                usageTrend: usages.slice(0, 30),
            };
        }
        async deactivateCoupon(couponId) {
            const coupon = await this.couponRepo.findOne({ where: { id: couponId } });
            if (!coupon)
                throw new common_1.NotFoundException('Coupon not found');
            coupon.status = coupon_entity_1.CouponStatus.INACTIVE;
            return this.couponRepo.save(coupon);
        }
    };
    return LoyaltyService = _classThis;
})();
exports.LoyaltyService = LoyaltyService;
