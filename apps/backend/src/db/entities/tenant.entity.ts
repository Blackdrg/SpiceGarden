import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum TenantStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
  INACTIVE = 'inactive',
}

@Entity('tenants')
@Index('idx_tenants_slug', ['slug'], { unique: true })
@Index('idx_tenants_status', ['status'])
export class TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  slug!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  displayName!: string;

  @Column({ type: 'varchar', enum: TenantStatus, default: TenantStatus.ACTIVE })
  status!: TenantStatus;

  @Column({ type: 'varchar', nullable: true })
  customDomain!: string;

  @Column({ type: 'varchar', nullable: true })
  logoUrl!: string;

  @Column({ type: 'varchar', nullable: true })
  primaryColor!: string;

  @Column({ type: 'varchar', nullable: true })
  supportEmail!: string;

  @Column({ type: 'varchar', nullable: true })
  supportPhone!: string;

  @Column('simple-json', { nullable: true })
  branding?: {
    favicon?: string;
    loginBg?: string;
    fontFamily?: string;
    cssOverrides?: string;
  };

  @Column('simple-json', { nullable: true })
  features?: Record<string, boolean>;

  @Column('simple-json', { nullable: true })
  settings?: Record<string, any>;

  @Column('simple-json', { nullable: true })
  billing?: {
    currency?: string;
    taxId?: string;
    billingAddress?: Record<string, any>;
    paymentTerms?: string;
  };

  @Column({ type: 'boolean', default: false })
  isolatedData!: boolean;

  @Column({ type: 'int', default: 0 })
  maxUsers!: number;

  @Column({ type: 'int', default: 0 })
  maxRestaurants!: number;

  @Column({ type: 'date', nullable: true })
  trialEndsAt!: Date;

  @Column({ type: 'date', nullable: true })
  subscriptionEndsAt!: Date;

  @Column({ nullable: true })
  ownerUserId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
