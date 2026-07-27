import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PlatformFeeEntity, FeeType, FeeApplicableTo } from '../../db/entities/platform-fee.entity';
export { FeeApplicableTo } from '../../db/entities/platform-fee.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';

@Injectable()
export class PlatformFeeService {
  private readonly logger = new Logger(PlatformFeeService.name);

  constructor(
    @InjectRepository(PlatformFeeEntity)
    private feeRepo: Repository<PlatformFeeEntity>,
    private dataSource: DataSource,
  ) {}

  async calculateFee(applicableTo: FeeApplicableTo, amount: number, cityCode?: string): Promise<{
    feeAmount: number;
    feeType: FeeType;
    breakdown: Record<string, any>;
  }> {
    const rules = await this.feeRepo.find({
      where: { applicableTo, isActive: true },
      order: { priority: 'DESC' },
    });

    let applicableRule = rules[0];

    if (cityCode) {
      const cityRule = rules.find(r => r.cityCode === cityCode);
      if (cityRule) applicableRule = cityRule;
    }

    if (!applicableRule) {
      return { feeAmount: 0, feeType: FeeType.FIXED, breakdown: {} };
    }

    let feeAmount = 0;

    switch (applicableRule.feeType) {
      case FeeType.FIXED:
        feeAmount = Number(applicableRule.feeAmount);
        break;

      case FeeType.PERCENTAGE:
        feeAmount = (amount * Number(applicableRule.feePercentage)) / 100;
        if (applicableRule.minAmount && feeAmount < applicableRule.minAmount) {
          feeAmount = applicableRule.minAmount;
        }
        if (applicableRule.maxAmount && feeAmount > applicableRule.maxAmount) {
          feeAmount = applicableRule.maxAmount;
        }
        break;

      case FeeType.TIERED:
        if (applicableRule.tieredRates && applicableRule.tieredRates.length > 0) {
          for (const tier of applicableRule.tieredRates) {
            if (amount >= tier.min && amount <= tier.max) {
              feeAmount = (amount * tier.rate) / 100;
              break;
            }
          }
        }
        break;
    }

    return {
      feeAmount: Math.round(feeAmount * 100) / 100,
      feeType: applicableRule.feeType,
      breakdown: {
        ruleId: applicableRule.id,
        ruleName: applicableRule.name,
        baseAmount: amount,
        percentage: applicableRule.feePercentage,
        fixedAmount: applicableRule.feeAmount,
      },
    };
  }

  async createFee(feeData: Partial<PlatformFeeEntity>): Promise<PlatformFeeEntity> {
    const fee = this.feeRepo.create(feeData);
    return this.feeRepo.save(fee);
  }

  async getFees(applicableTo?: FeeApplicableTo): Promise<PlatformFeeEntity[]> {
    const where: any = { isActive: true };
    if (applicableTo) where.applicableTo = applicableTo;
    return this.feeRepo.find({ where, order: { priority: 'DESC' } });
  }

  async updateFee(feeId: string, updateData: Partial<PlatformFeeEntity>): Promise<PlatformFeeEntity> {
    await this.feeRepo.update(feeId, updateData);
    return (await this.feeRepo.findOne({ where: { id: feeId } }))!;
  }

  async initializeDefaultFees(): Promise<void> {
    const count = await this.feeRepo.count();
    if (count > 0) return;

    const fees: Partial<PlatformFeeEntity>[] = [
      {
        name: 'Platform Fee - Restaurant Commission',
        feeType: FeeType.PERCENTAGE,
        applicableTo: FeeApplicableTo.RESTAURANT,
        feePercentage: 2,
        minAmount: 5,
        maxAmount: 500,
        isActive: true,
        priority: 0,
      },
      {
        name: 'Platform Fee - Delivery Fee',
        feeType: FeeType.FIXED,
        applicableTo: FeeApplicableTo.CUSTOMER,
        feeAmount: 10,
        isActive: true,
        priority: 0,
      },
      {
        name: 'Platform Fee - Order Processing',
        feeType: FeeType.PERCENTAGE,
        applicableTo: FeeApplicableTo.ORDER,
        feePercentage: 1,
        isActive: true,
        priority: 0,
      },
    ];

    await Promise.all(fees.map((feeData) => this.feeRepo.save(this.feeRepo.create(feeData))));

    this.logger.log('Initialized default platform fees');
  }
}
