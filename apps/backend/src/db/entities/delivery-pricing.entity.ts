import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum PricingType {
  FIXED = 'fixed',
  PER_KM = 'per_km',
  PER_MINUTE = 'per_minute',
  TIERED = 'tiered',
  POLYGON = 'polygon',
}

export enum PricingRuleType {
  BASE = 'base',
  SURGE = 'surge',
  WEATHER = 'weather',
  HOLIDAY = 'holiday',
  PEAK_HOUR = 'peak_hour',
  MINIMUM = 'minimum',
  MAXIMUM = 'maximum',
}

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

@Entity('delivery_pricing')
@Index('idx_delivery_pricing_rule_type', ['ruleType'])
@Index('idx_delivery_pricing_active', ['isActive'])
@Index('idx_delivery_pricing_priority', ['priority'])
export class DeliveryPricingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', enum: PricingRuleType })
  ruleType!: PricingRuleType;

  @Column()
  name!: string;

  @Column({ type: 'varchar', enum: PricingType, default: PricingType.FIXED })
  pricingType!: PricingType;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  basePrice!: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  perKmRate!: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  perMinuteRate!: number;

  @Column('decimal', { precision: 5, scale: 2, default: 1 })
  multiplier!: number;

  @Column({ type: 'int', nullable: true })
  minDistanceKm!: number;

  @Column({ type: 'int', nullable: true })
  maxDistanceKm!: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  minDeliveryFee!: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  maxDeliveryFee!: number;

  @Column('simple-json', { nullable: true })
  zonePolygon?: { lat: number; lng: number }[];

  @Column({ type: 'simple-array', nullable: true })
  applicableDays?: DayOfWeek[];

  @Column({ type: 'time', nullable: true })
  startTime!: string;

  @Column({ type: 'time', nullable: true })
  endTime!: string;

  @Column({ type: 'date', nullable: true })
  validFrom!: Date;

  @Column({ type: 'date', nullable: true })
  validTo!: Date;

  @Column({ type: 'simple-json', nullable: true })
  conditions?: Record<string, any>;

  @Column({ type: 'int', default: 0 })
  priority!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
