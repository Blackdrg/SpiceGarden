"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const loyalty_service_1 = require("../src/services/loyalty/loyalty.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const coupon_entity_1 = require("../src/db/entities/coupon.entity");
const coupon_usage_entity_1 = require("../src/db/entities/coupon-usage.entity");
const referral_entity_1 = require("../src/db/entities/referral.entity");
const subscription_entity_1 = require("../src/db/entities/subscription.entity");
const user_entity_1 = require("../src/db/entities/user.entity");
const order_entity_1 = require("../src/db/entities/order.entity");
describe('LoyaltyService Edge Cases', () => {
    let service;
    const mockCouponRepo = {
        findOne: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
    };
    const mockCouponUsageRepo = {
        count: jest.fn(),
        findOne: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
        find: jest.fn(),
    };
    const mockReferralRepo = {
        findOne: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        createQueryBuilder: jest.fn(() => ({
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getMany: jest.fn(),
        })),
    };
    const mockSubscriptionRepo = {
        findOne: jest.fn(),
    };
    const mockUserRepo = {
        findOne: jest.fn(),
    };
    const mockOrderRepo = {
        findOne: jest.fn(),
    };
    const mockDataSource = {
        manager: {
            transaction: jest.fn(),
        },
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                loyalty_service_1.LoyaltyService,
                { provide: (0, typeorm_1.getRepositoryToken)(coupon_entity_1.CouponEntity), useValue: mockCouponRepo },
                { provide: (0, typeorm_1.getRepositoryToken)(coupon_usage_entity_1.CouponUsageEntity), useValue: mockCouponUsageRepo },
                { provide: (0, typeorm_1.getRepositoryToken)(referral_entity_1.ReferralEntity), useValue: mockReferralRepo },
                { provide: (0, typeorm_1.getRepositoryToken)(subscription_entity_1.SubscriptionEntity), useValue: mockSubscriptionRepo },
                { provide: (0, typeorm_1.getRepositoryToken)(user_entity_1.UserEntity), useValue: mockUserRepo },
                { provide: (0, typeorm_1.getRepositoryToken)(order_entity_1.OrderEntity), useValue: mockOrderRepo },
                { provide: typeorm_2.DataSource, useValue: mockDataSource },
            ],
        }).compile();
        service = module.get(loyalty_service_1.LoyaltyService);
        jest.clearAllMocks();
    });
    describe('checkCouponStacking', () => {
        it('should return true when coupon already applied to order', async () => {
            mockCouponUsageRepo.findOne.mockResolvedValue({ id: 'cu1', orderId: 'ord1', couponId: 'c1' });
            const result = await service.checkCouponStacking('ord1', 'user1');
            expect(result).toBe(true);
        });
        it('should return false when no coupon applied to order', async () => {
            mockCouponUsageRepo.findOne.mockResolvedValue(null);
            const result = await service.checkCouponStacking('ord1', 'user1');
            expect(result).toBe(false);
        });
    });
    describe('detectReferralFraud', () => {
        it('should detect multiple referral usage within 24h', async () => {
            const referrals = [
                { id: 'r1', refereeId: 'user1', createdAt: new Date(Date.now() - 100000) },
                { id: 'r2', refereeId: 'user1', createdAt: new Date(Date.now() - 50000) },
                { id: 'r3', refereeId: 'user1', createdAt: new Date() },
            ];
            mockReferralRepo.find.mockResolvedValue(referrals);
            const result = await service.detectReferralFraud('SGTEST', 'user1');
            expect(result.isFraud).toBe(true);
            expect(result.reason).toContain('Multiple referral usage');
        });
        it('should detect possible referral farming', async () => {
            mockReferralRepo.findOne.mockResolvedValue({
                id: 'r1',
                code: 'SGTEST',
                referrerId: 'other-user',
            });
            mockReferralRepo.createQueryBuilder().getMany.mockResolvedValue([
                { id: 'otherRef1' }, { id: 'otherRef2' }, { id: 'otherRef3' },
                { id: 'otherRef4' }, { id: 'otherRef5' }, { id: 'otherRef6' },
            ]);
            const result = await service.detectReferralFraud('SGTEST', 'user1');
            expect(result.isFraud).toBe(true);
            expect(result.reason).toContain('farming');
        });
        it('should return no fraud for valid referral', async () => {
            mockReferralRepo.findOne.mockResolvedValue({
                id: 'r1',
                code: 'SGTEST',
                referrerId: 'other-user',
            });
            mockReferralRepo.find.mockResolvedValue([
                { id: 'r1', createdAt: new Date(Date.now() - 100000) },
            ]);
            const result = await service.detectReferralFraud('SGTEST', 'user1');
            expect(result.isFraud).toBe(false);
        });
        it('should return no fraud when referral code not found', async () => {
            mockReferralRepo.findOne.mockResolvedValue(null);
            const result = await service.detectReferralFraud('INVALID', 'user1');
            expect(result.isFraud).toBe(false);
        });
    });
    describe('revocableReferral', () => {
        it('should revoke referral and log warning', async () => {
            const referral = { id: 'r1', status: referral_entity_1.ReferralStatus.COMPLETED };
            mockReferralRepo.findOne.mockResolvedValue(referral);
            mockReferralRepo.save.mockResolvedValue({ ...referral, status: referral_entity_1.ReferralStatus.REVOKED });
            await service.revocableReferral('r1', 'Fraud detected');
            expect(referral.status).toBe(referral_entity_1.ReferralStatus.REVOKED);
            expect(mockReferralRepo.save).toHaveBeenCalled();
        });
        it('should handle missing referral gracefully', async () => {
            mockReferralRepo.findOne.mockResolvedValue(null);
            await expect(service.revocableReferral('r1', 'Test')).resolves.not.toThrow();
        });
    });
    describe('applyCoupon - stacking prevention', () => {
        it('should throw when coupon already applied to order', async () => {
            mockCouponRepo.findOne.mockResolvedValue({
                id: 'c1',
                code: 'TEST10',
                status: coupon_entity_1.CouponStatus.ACTIVE,
                validUntil: new Date(Date.now() + 86400000),
                usageCount: 0,
                usageLimit: 100,
                discountValue: 10,
            });
            mockCouponUsageRepo.count.mockResolvedValue(1);
            await expect(service.applyCoupon('TEST10', 'user1', 100, 'ord1')).rejects.toThrow('You have already used this coupon');
        });
    });
});
//# sourceMappingURL=loyalty-edge-cases.spec.js.map