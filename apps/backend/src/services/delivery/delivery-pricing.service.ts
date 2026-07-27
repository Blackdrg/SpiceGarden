import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DeliveryPricingEntity, PricingRuleType, PricingType, DayOfWeek } from '../../db/entities/delivery-pricing.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { AddressEntity } from '../../db/entities/address.entity';

@Injectable()
export class DeliveryPricingService {
  private readonly logger = new Logger(DeliveryPricingService.name);

  constructor(
    @InjectRepository(DeliveryPricingEntity)
    private pricingRepo: Repository<DeliveryPricingEntity>,
    private dataSource: DataSource,
  ) {}

  async calculateDeliveryFee(
    restaurantId: string,
    distanceKm: number,
    durationMinutes: number,
    weatherCondition?: string,
    isHoliday?: boolean,
    orderTime?: Date,
  ): Promise<{
    baseFee: number;
    surgeFee: number;
    weatherFee: number;
    holidayFee: number;
    peakHourFee: number;
    totalFee: number;
    appliedRules: string[];
  }> {
    const rules = await this.pricingRepo.find({
      where: { isActive: true },
      order: { priority: 'DESC', createdAt: 'ASC' },
    });

    let baseFee = 0;
    let surgeMultiplier = 1;
    let weatherMultiplier = 1;
    let holidayMultiplier = 1;
    let peakHourMultiplier = 1;
    const appliedRules: string[] = [];

    for (const rule of rules) {
      if (!this.isRuleApplicable(rule, distanceKm, durationMinutes, orderTime, isHoliday)) {
        continue;
      }

      switch (rule.ruleType) {
        case PricingRuleType.BASE:
          baseFee = Number(rule.basePrice) + (distanceKm * Number(rule.perKmRate || 0));
          appliedRules.push(`base:${rule.id}`);
          break;

        case PricingRuleType.SURGE:
          surgeMultiplier = Math.max(surgeMultiplier, Number(rule.multiplier));
          appliedRules.push(`surge:${rule.id}`);
          break;

        case PricingRuleType.WEATHER:
          if (weatherCondition && this.matchesWeatherCondition(rule, weatherCondition)) {
            weatherMultiplier = Math.max(weatherMultiplier, Number(rule.multiplier));
            appliedRules.push(`weather:${rule.id}`);
          }
          break;

        case PricingRuleType.HOLIDAY:
          if (isHoliday) {
            holidayMultiplier = Math.max(holidayMultiplier, Number(rule.multiplier));
            appliedRules.push(`holiday:${rule.id}`);
          }
          break;

        case PricingRuleType.PEAK_HOUR:
          if (this.isPeakHour(rule, orderTime)) {
            peakHourMultiplier = Math.max(peakHourMultiplier, Number(rule.multiplier));
            appliedRules.push(`peak_hour:${rule.id}`);
          }
          break;

        case PricingRuleType.MINIMUM:
          if (Number(rule.minDeliveryFee) > baseFee) {
            baseFee = Number(rule.minDeliveryFee);
            appliedRules.push(`minimum:${rule.id}`);
          }
          break;

        case PricingRuleType.MAXIMUM:
          appliedRules.push(`maximum:${rule.id}`);
          break;
      }
    }

    const subtotal = baseFee * surgeMultiplier * weatherMultiplier * holidayMultiplier * peakHourMultiplier;
    let totalFee = subtotal;

    for (const rule of rules) {
      if (rule.ruleType === PricingRuleType.MAXIMUM && rule.maxDeliveryFee) {
        totalFee = Math.min(totalFee, Number(rule.maxDeliveryFee));
      }
      if (rule.ruleType === PricingRuleType.MINIMUM && rule.minDeliveryFee) {
        totalFee = Math.max(totalFee, Number(rule.minDeliveryFee));
      }
    }

    return {
      baseFee,
      surgeFee: baseFee * (surgeMultiplier - 1),
      weatherFee: baseFee * surgeMultiplier * (weatherMultiplier - 1),
      holidayFee: baseFee * surgeMultiplier * (holidayMultiplier - 1),
      peakHourFee: baseFee * surgeMultiplier * (peakHourMultiplier - 1),
      totalFee: Math.round(totalFee * 100) / 100,
      appliedRules,
    };
  }

  async createPricingRule(ruleData: Partial<DeliveryPricingEntity>): Promise<DeliveryPricingEntity> {
    const rule = this.pricingRepo.create(ruleData);
    return this.pricingRepo.save(rule);
  }

  async getPricingRules(activeOnly: boolean = true): Promise<DeliveryPricingEntity[]> {
    return this.pricingRepo.find({
      where: activeOnly ? { isActive: true } : {},
      order: { priority: 'DESC', ruleType: 'ASC' },
    });
  }

  async updatePricingRule(ruleId: string, updateData: Partial<DeliveryPricingEntity>): Promise<DeliveryPricingEntity> {
    await this.pricingRepo.update(ruleId, updateData);
    return (await this.pricingRepo.findOne({ where: { id: ruleId } }))!;
  }

  private isRuleApplicable(
    rule: DeliveryPricingEntity,
    distanceKm: number,
    durationMinutes: number,
    orderTime?: Date,
    isHoliday?: boolean,
  ): boolean {
    const now = orderTime || new Date();

    if (rule.validFrom && new Date(rule.validFrom) > now) return false;
    if (rule.validTo && new Date(rule.validTo) < now) return false;

    if (rule.applicableDays && rule.applicableDays.length > 0) {
      const day = now.getDay();
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const currentDay = dayNames[day] as any;
      if (!rule.applicableDays.includes(currentDay)) return false;
    }

    if (rule.startTime && rule.endTime) {
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (currentTime < rule.startTime || currentTime > rule.endTime) return false;
    }

    if (rule.minDistanceKm && distanceKm < rule.minDistanceKm) return false;
    if (rule.maxDistanceKm && distanceKm > rule.maxDistanceKm) return false;

    return true;
  }

  private isPeakHour(rule: DeliveryPricingEntity, orderTime?: Date): boolean {
    if (!rule.startTime || !rule.endTime || rule.ruleType !== PricingRuleType.PEAK_HOUR) {
      return false;
    }

    const now = orderTime || new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return currentTime >= rule.startTime && currentTime <= rule.endTime;
  }

  private matchesWeatherCondition(rule: DeliveryPricingEntity, weatherCondition: string): boolean {
    const conditions = (rule.conditions as any)?.weatherConditions || [];
    return conditions.includes(weatherCondition.toLowerCase());
  }

  async initializeDefaultPricing(): Promise<void> {
    const count = await this.pricingRepo.count();
    if (count > 0) return;

    const defaultRules: Partial<DeliveryPricingEntity>[] = [
      {
        ruleType: PricingRuleType.BASE,
        name: 'Base Delivery Fee',
        pricingType: PricingType.PER_KM,
        basePrice: 30,
        perKmRate: 8,
        perMinuteRate: 0,
        isActive: true,
        priority: 0,
      },
      {
        ruleType: PricingRuleType.MINIMUM,
        name: 'Minimum Delivery Fee',
        pricingType: PricingType.FIXED,
        basePrice: 40,
        minDeliveryFee: 40,
        isActive: true,
        priority: 1,
      },
      {
        ruleType: PricingRuleType.MAXIMUM,
        name: 'Maximum Delivery Fee',
        pricingType: PricingType.FIXED,
        maxDeliveryFee: 200,
        isActive: true,
        priority: 0,
      },
      {
        ruleType: PricingRuleType.PEAK_HOUR,
        name: 'Peak Hour Surge',
        pricingType: PricingType.FIXED,
        multiplier: 1.3,
        startTime: '12:00',
        endTime: '14:00',
        applicableDays: [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY],
        isActive: true,
        priority: 10,
      },
      {
        ruleType: PricingRuleType.PEAK_HOUR,
        name: 'Dinner Peak Surge',
        pricingType: PricingType.FIXED,
        multiplier: 1.4,
        startTime: '19:00',
        endTime: '21:30',
        applicableDays: [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY],
        isActive: true,
        priority: 10,
      },
    ];

    await Promise.all(defaultRules.map((ruleData) => this.pricingRepo.save(this.pricingRepo.create(ruleData))));

    this.logger.log('Initialized default delivery pricing rules');
  }
}
