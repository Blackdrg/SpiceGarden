import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum CampaignType {
  FEATURED_RESTAURANT = 'featured_restaurant',
  HOMEPAGE_BANNER = 'homepage_banner',
  SEARCH_PROMOTION = 'search_promotion',
  CATEGORY_PROMOTION = 'category_promotion',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum BillingModel {
  CPC = 'cpc',
  CPM = 'cpm',
  CPA = 'cpa',
  FLAT = 'flat',
}

@Entity('campaigns')
@Index('idx_campaigns_type', ['campaignType'])
@Index('idx_campaigns_status', ['status'])
@Index('idx_campaigns_dates', ['startDate', 'endDate'])
export class CampaignEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'varchar', enum: CampaignType })
  campaignType!: CampaignType;

  @Column({ type: 'varchar', enum: CampaignStatus, default: CampaignStatus.DRAFT })
  status!: CampaignStatus;

  @Column({ type: 'varchar', enum: BillingModel, default: BillingModel.FLAT })
  billingModel!: BillingModel;

  @Column('decimal', { precision: 12, scale: 2 })
  budget!: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  spentBudget!: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  bidAmount!: number;

  @Column({ type: 'date' })
  startDate!: Date;

  @Column({ type: 'date' })
  endDate!: Date;

  @Column({ type: 'int', default: 0 })
  impressions!: number;

  @Column({ type: 'int', default: 0 })
  clicks!: number;

  @Column({ type: 'int', default: 0 })
  conversions!: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  ctr!: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  cpc!: number;

  @Column('simple-json', { nullable: true })
  targeting?: {
    cities?: string[];
    categories?: string[];
    userSegments?: string[];
    devices?: string[];
    minOrderValue?: number;
  };

  @Column('simple-json', { nullable: true })
  creatives?: {
    imageUrl?: string;
    title?: string;
    description?: string;
    ctaText?: string;
    landingUrl?: string;
  };

  @Column({ nullable: true })
  restaurantId!: string;

  @Column({ nullable: true })
  restaurantName!: string;

  @Column({ type: 'simple-json', nullable: true })
  dailyStats?: Record<string, { impressions: number; clicks: number; spent: number }>;

  @Column({ nullable: true })
  createdBy!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
