import { Test, TestingModule } from '@nestjs/testing';
import { LoyaltyService } from '../src/services/loyalty/loyalty.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CouponEntity, CouponStatus } from '../src/db/entities/coupon.entity';
import { CouponUsageEntity, CouponUsageStatus } from '../src/db/entities/coupon-usage.entity';
import { ReferralEntity, ReferralStatus, ReferralRewardType } from '../src/db/entities/referral.entity';
import { SubscriptionEntity } from '../src/db/entities/subscription.entity';
import { UserEntity } from '../src/db/entities/user.entity';
import { OrderEntity } from '../src/db/entities/order.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('LoyaltyService Edge Cases', () => {
  let service: LoyaltyService;

  const mockCouponRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    createQueryBuilder: jest.fn(),
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
    create: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockReferralQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
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
    mockReferralRepo.createQueryBuilder.mockReturnValue(mockReferralQueryBuilder);
    mockReferralQueryBuilder.getMany.mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoyaltyService,
        { provide: getRepositoryToken(CouponEntity), useValue: mockCouponRepo },
        { provide: getRepositoryToken(CouponUsageEntity), useValue: mockCouponUsageRepo },
        { provide: getRepositoryToken(ReferralEntity), useValue: mockReferralRepo },
        { provide: getRepositoryToken(SubscriptionEntity), useValue: mockSubscriptionRepo },
        { provide: getRepositoryToken(UserEntity), useValue: mockUserRepo },
        { provide: getRepositoryToken(OrderEntity), useValue: mockOrderRepo },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<LoyaltyService>(LoyaltyService);

    jest.clearAllMocks();
  });

  describe('checkCouponStacking', () => {
    it('should return true when coupon already applied to order', async () => {
      mockCouponUsageRepo.findOne.mockResolvedValue({ id: 'cu1', orderId: 'ord1', couponId: 'c1' } as CouponUsageEntity);
      
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
      
      mockReferralRepo.findOne.mockResolvedValue({
        id: 'r1',
        code: 'SGTEST',
        referrerId: 'other-user',
      } as ReferralEntity);
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
      } as ReferralEntity);
      mockReferralRepo.find.mockResolvedValue([]);

      mockReferralQueryBuilder.getMany.mockResolvedValue([
        { id: 'otherRef1' }, { id: 'otherRef2' }, { id: 'otherRef3' },
        { id: 'otherRef4' }, { id: 'otherRef5' }, { id: 'otherRef6' },
      ] as ReferralEntity[]);

      const result = await service.detectReferralFraud('SGTEST', 'user1');
      expect(result.isFraud).toBe(true);
      expect(result.reason).toContain('farming');
    });

    it('should return no fraud for valid referral', async () => {
      mockReferralRepo.findOne.mockResolvedValue({
        id: 'r1',
        code: 'SGTEST',
        referrerId: 'other-user',
      } as ReferralEntity);

      mockReferralRepo.find.mockResolvedValue([
        { id: 'r1', createdAt: new Date(Date.now() - 100000) },
      ]);
      mockReferralQueryBuilder.getMany.mockResolvedValue([]);

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
      const referral = { id: 'r1', status: ReferralStatus.COMPLETED } as ReferralEntity;
      
      mockReferralRepo.findOne.mockResolvedValue(referral);
      mockReferralRepo.save.mockResolvedValue({ ...referral, status: ReferralStatus.REVOKED });

      await service.revocableReferral('r1', 'Fraud detected');

      expect(referral.status).toBe(ReferralStatus.REVOKED);
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
        status: CouponStatus.ACTIVE,
        validUntil: new Date(Date.now() + 86400000),
        usageCount: 0,
        usageLimit: 100,
        discountValue: 10,
      } as CouponEntity);

      mockCouponUsageRepo.count.mockResolvedValue(1);

      await expect(service.applyCoupon('TEST10', 'user1', 100, 'ord1')).rejects.toThrow('You have already used this coupon');
    });
  });

  describe('createCoupon', () => {
    it('should create and save a coupon via service', async () => {
      mockCouponRepo.create.mockReturnValue({ id: 'c-new', code: 'NEW50' });
      mockCouponRepo.save.mockResolvedValue({ id: 'c-new', code: 'NEW50', discountValue: 50 });

      const result = await service.createCoupon({ code: 'NEW50', type: 'percentage', discountValue: 50, validUntil: new Date(Date.now() + 86400000) });

      expect(mockCouponRepo.create).toHaveBeenCalled();
      expect(mockCouponRepo.save).toHaveBeenCalled();
      expect(result.code).toBe('NEW50');
    });
  });

  describe('applyCoupon - happy path and error branches', () => {
    const baseCoupon = () => ({
      id: 'c1',
      code: 'TEST10',
      status: CouponStatus.ACTIVE,
      validUntil: new Date(Date.now() + 86400000),
      usageCount: 0,
      usageLimit: 100,
      discountValue: 10,
      type: 'percentage',
      usagePerUser: 1,
      minOrderAmount: 0,
    } as CouponEntity);

    beforeEach(() => {
      mockCouponUsageRepo.count.mockResolvedValue(0);
      mockCouponUsageRepo.create.mockReturnValue({});
      mockCouponUsageRepo.save.mockResolvedValue({});
    });

    it('should apply percentage discount', async () => {
      mockCouponRepo.findOne.mockResolvedValue({ ...baseCoupon(), type: 'percentage', discountValue: 20 });
      mockCouponRepo.save.mockResolvedValue({ ...baseCoupon() });

      const result = await service.applyCoupon('TEST10', 'user1', 500);

      expect(result.discount).toBe(100);
      expect(result.finalAmount).toBe(400);
    });

    it('should cap percentage discount at maxDiscountAmount', async () => {
      mockCouponRepo.findOne.mockResolvedValue({ ...baseCoupon(), type: 'percentage', discountValue: 50, maxDiscountAmount: 100 } as CouponEntity);
      mockCouponRepo.save.mockResolvedValue({ ...baseCoupon() });

      const result = await service.applyCoupon('TEST10', 'user1', 1000);

      expect(result.discount).toBe(100);
    });

    it('should apply fixed_amount discount', async () => {
      mockCouponRepo.findOne.mockResolvedValue({ ...baseCoupon(), type: 'fixed_amount', discountValue: 80 } as CouponEntity);
      mockCouponRepo.save.mockResolvedValue({ ...baseCoupon() });

      const result = await service.applyCoupon('TEST10', 'user1', 500);

      expect(result.discount).toBe(80);
      expect(result.finalAmount).toBe(420);
    });

    it('should apply free_delivery discount', async () => {
      mockCouponRepo.findOne.mockResolvedValue({ ...baseCoupon(), type: 'free_delivery', discountValue: 0 } as CouponEntity);
      mockCouponRepo.save.mockResolvedValue({ ...baseCoupon() });

      const result = await service.applyCoupon('TEST10', 'user1', 500);

      expect(result.discount).toBe(40);
    });

    it('should throw for invalid coupon code', async () => {
      mockCouponRepo.findOne.mockResolvedValue(null);

      await expect(service.applyCoupon('INVALID', 'user1', 100)).rejects.toThrow('Invalid coupon code');
    });

    it('should throw for inactive coupon', async () => {
      mockCouponRepo.findOne.mockResolvedValue({ ...baseCoupon(), status: CouponStatus.INACTIVE } as CouponEntity);

      await expect(service.applyCoupon('TEST10', 'user1', 100)).rejects.toThrow('Coupon is not active');
    });

    it('should throw for expired coupon', async () => {
      mockCouponRepo.findOne.mockResolvedValue({ ...baseCoupon(), validUntil: new Date(Date.now() - 86400000) } as CouponEntity);

      await expect(service.applyCoupon('TEST10', 'user1', 100)).rejects.toThrow('Coupon has expired');
    });

    it('should throw when usage limit reached', async () => {
      mockCouponRepo.findOne.mockResolvedValue({ ...baseCoupon(), usageCount: 100, usageLimit: 100 } as CouponEntity);

      await expect(service.applyCoupon('TEST10', 'user1', 100)).rejects.toThrow('Coupon usage limit reached');
    });

    it('should throw when minimum order amount not met', async () => {
      mockCouponRepo.findOne.mockResolvedValue({ ...baseCoupon(), minOrderAmount: 200 } as CouponEntity);

      await expect(service.applyCoupon('TEST10', 'user1', 100)).rejects.toThrow('Minimum order amount');
    });
  });

  describe('processCashback', () => {
    it('should calculate cashback for subscribed user with benefits', async () => {
      mockSubscriptionRepo.findOne.mockResolvedValue({
        id: 'sub1',
        userId: 'user1',
        status: 'active',
        benefits: { cashbackPercentage: 10, maxCashback: 50 },
      });

      const result = await service.processCashback('user1', 'ord1', 500);

      expect(result.cashbackAmount).toBe(50);
      expect(result.applied).toBe(true);
    });

    it('should cap cashback for subscribed user', async () => {
      mockSubscriptionRepo.findOne.mockResolvedValue({
        id: 'sub1',
        userId: 'user1',
        status: 'active',
        benefits: { cashbackPercentage: 10, maxCashback: 30 },
      });

      const result = await service.processCashback('user1', 'ord1', 500);

      expect(result.cashbackAmount).toBe(30);
    });

    it('should calculate 2% cashback for non-subscribed user', async () => {
      mockSubscriptionRepo.findOne.mockResolvedValue(null);

      const result = await service.processCashback('user1', 'ord1', 1000);

      expect(result.cashbackAmount).toBe(20);
      expect(result.applied).toBe(true);
    });

    it('should cap non-subscribed cashback at 20', async () => {
      mockSubscriptionRepo.findOne.mockResolvedValue(null);

      const result = await service.processCashback('user1', 'ord1', 2000);

      expect(result.cashbackAmount).toBe(20);
    });
  });

  describe('generateReferralCode', () => {
    it('should generate unique referral code', async () => {
      const user = { id: 'user1', email: 'john@example.com' } as UserEntity;
      mockUserRepo.findOne.mockResolvedValue(user);
      mockReferralRepo.findOne.mockResolvedValue(null);
      mockReferralRepo.create.mockReturnValue({});
      mockReferralRepo.save.mockResolvedValue({ id: 'ref1', code: 'SGJOH1234', referrerId: 'user1' });

      const result = await service.generateReferralCode('user1');

      expect(result.code).toMatch(/^SG[A-Z]{3}/);
      expect(result.referrerId).toBe('user1');
    });

    it('should return existing referral code', async () => {
      const existing = { id: 'ref1', code: 'SGJOHNxxxx', referrerId: 'user1' } as ReferralEntity;
      mockReferralRepo.findOne.mockResolvedValue(existing);

      const result = await service.generateReferralCode('user1');

      expect(result).toBe(existing);
      expect(mockUserRepo.findOne).not.toHaveBeenCalled();
    });
  });

  describe('processReferral', () => {
    it('should complete referral and return rewards', async () => {
      const referral = {
        id: 'ref1',
        code: 'SGJOHNxxxx',
        referrerId: 'referrer1',
        refereeId: '',
        status: 'pending',
        referrerReward: 50,
        refereeReward: 50,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      } as ReferralEntity;
      mockReferralRepo.findOne.mockResolvedValue(referral);
      mockReferralRepo.save.mockResolvedValue({ ...referral, status: 'completed' });

      const result = await service.processReferral('SGJOHNxxxx', 'referee1', 'ord1');

      expect(referral.status).toBe('completed');
      expect(result.referrerReward).toBe(50);
      expect(result.refereeReward).toBe(50);
    });

    it('should throw for invalid referral code', async () => {
      mockReferralRepo.findOne.mockResolvedValue(null);

      await expect(service.processReferral('INVALID', 'referee1', 'ord1')).rejects.toThrow('Invalid referral code');
    });

    it('should throw for self-referral', async () => {
      mockReferralRepo.findOne.mockResolvedValue({
        id: 'ref1', code: 'SGJOHNxxxx', referrerId: 'user1', status: 'pending',
      } as ReferralEntity);

      await expect(service.processReferral('SGJOHNxxxx', 'user1', 'ord1')).rejects.toThrow('Cannot refer yourself');
    });

    it('should throw for expired referral', async () => {
      mockReferralRepo.findOne.mockResolvedValue({
        id: 'ref1', code: 'SGJOHNxxxx', referrerId: 'user1', status: 'pending',
        expiresAt: new Date(Date.now() - 86400000),
      } as ReferralEntity);

      await expect(service.processReferral('SGJOHNxxxx', 'referee1', 'ord1')).rejects.toThrow('Referral code has expired');
    });

    it('should throw for already completed referral', async () => {
      mockReferralRepo.findOne.mockResolvedValue({
        id: 'ref1', code: 'SGJOHNxxxx', referrerId: 'user1', status: 'completed',
      } as ReferralEntity);

      await expect(service.processReferral('SGJOHNxxxx', 'referee1', 'ord1')).rejects.toThrow('Referral already completed');
    });
  });

  describe('getWalletCashback', () => {
    it('should return total cashback and recent transactions', async () => {
      const usages = [
        { id: 'u1', discountApplied: 50, usedAt: new Date() },
        { id: 'u2', discountApplied: 30, usedAt: new Date() },
      ] as CouponUsageEntity[];
      mockCouponUsageRepo.find.mockResolvedValue(usages);

      const result = await service.getWalletCashback('user1');

      expect(result.totalCashback).toBe(80);
      expect(result.transactionCount).toBe(2);
      expect(result.recentTransactions).toHaveLength(2);
    });
  });

  describe('getReferralHistory', () => {
    it('should return sent and received referrals with stats', async () => {
      const sent = [
        { id: 'r1', status: 'completed', referrerReward: 50 },
        { id: 'r2', status: 'pending', referrerReward: 50 },
      ] as ReferralEntity[];
      const received = [
        { id: 'r3', status: 'completed' },
      ] as ReferralEntity[];
      mockReferralRepo.find
        .mockImplementationOnce(() => sent)
        .mockImplementationOnce(() => received);

      const result = await service.getReferralHistory('user1');

      expect(result.totalSent).toBe(2);
      expect(result.totalCompleted).toBe(1);
      expect(result.totalEarned).toBe(50);
      expect(result.sentReferrals).toHaveLength(2);
      expect(result.receivedReferrals).toHaveLength(1);
    });
  });

  describe('getAllCoupons', () => {
    it('should return coupons filtered by status', async () => {
      const mockQB = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ id: 'c1', status: 'active' }]),
      };
      mockCouponRepo.createQueryBuilder.mockReturnValue(mockQB as any);

      const result = await service.getAllCoupons({ status: 'active' });

      expect(mockQB.andWhere).toHaveBeenCalledWith('coupon.status = :status', { status: 'active' });
      expect(result).toHaveLength(1);
    });

    it('should return coupons filtered by scope', async () => {
      const mockQB = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ id: 'c1', scope: 'global' }]),
      };
      mockCouponRepo.createQueryBuilder.mockReturnValue(mockQB as any);

      const result = await service.getAllCoupons({ scope: 'global' });

      expect(mockQB.andWhere).toHaveBeenCalledWith('coupon.scope = :scope', { scope: 'global' });
    });
  });

  describe('getCouponAnalytics', () => {
    it('should return analytics with usages', async () => {
      mockCouponRepo.findOne.mockResolvedValue({ id: 'c1', code: 'TEST10' } as CouponEntity);
      mockCouponUsageRepo.find.mockResolvedValue([
        { id: 'u1', discountApplied: 100, orderId: 'ord1', usedAt: new Date() },
        { id: 'u2', discountApplied: 50, orderId: 'ord2', usedAt: new Date() },
      ] as CouponUsageEntity[]);

      const result = await service.getCouponAnalytics('c1');

      expect(result.totalUsages).toBe(2);
      expect(result.totalDiscountGiven).toBe(150);
      expect(result.totalOrdersGenerated).toBe(2);
    });

    it('should throw NotFoundException for missing coupon', async () => {
      mockCouponRepo.findOne.mockResolvedValue(null);

      await expect(service.getCouponAnalytics('missing')).rejects.toThrow('Coupon not found');
    });
  });

  describe('deactivateCoupon', () => {
    it('should set coupon status to inactive', async () => {
      const coupon = { id: 'c1', status: CouponStatus.ACTIVE } as CouponEntity;
      mockCouponRepo.findOne.mockResolvedValue(coupon);
      mockCouponRepo.save.mockResolvedValue({ ...coupon, status: CouponStatus.INACTIVE });

      const result = await service.deactivateCoupon('c1');

      expect(coupon.status).toBe(CouponStatus.INACTIVE);
      expect(result.status).toBe(CouponStatus.INACTIVE);
    });

    it('should throw NotFoundException for missing coupon', async () => {
      mockCouponRepo.findOne.mockResolvedValue(null);

      await expect(service.deactivateCoupon('missing')).rejects.toThrow('Coupon not found');
    });
  });
});