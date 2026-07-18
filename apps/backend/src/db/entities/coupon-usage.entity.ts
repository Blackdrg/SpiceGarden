import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum CouponUsageStatus {
  ACTIVE = 'active',
  USED = 'used',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('coupon_usages')
export class CouponUsageEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  couponId!: string;

  @Column('uuid')
  userId!: string;

  @Column({ type: 'varchar', enum: CouponUsageStatus, default: CouponUsageStatus.ACTIVE })
  status!: CouponUsageStatus;

  @Column('uuid', { nullable: true })
  orderId!: string;

  @Column({ nullable: true })
  discountApplied!: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  orderAmount!: number;

  @CreateDateColumn()
  usedAt!: Date;
}
