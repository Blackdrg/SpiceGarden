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
import { BadRequestException } from '@nestjs/common';

describe('LoyaltyService Edge Cases', () => {
  let service: LoyaltyService;

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
});