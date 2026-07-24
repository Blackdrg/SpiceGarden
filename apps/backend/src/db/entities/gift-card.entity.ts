import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum GiftCardStatus {
  ACTIVE = 'active',
  USED = 'used',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('gift_cards')
@Index(['code'])
@Index(['status'])
export class GiftCardEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  code!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  initialBalance!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  currentBalance!: number;

  @Column({ type: 'varchar', length: 50, default: GiftCardStatus.ACTIVE })
  status!: GiftCardStatus;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  discountPercentage!: number;

  @Column({ nullable: true })
  minOrderAmount?: number;

  @Column()
  validFrom!: Date;

  @Column()
  validUntil!: Date;

  @Column({ nullable: true })
  userId?: string;

  @Column({ default: 0 })
  usageCount!: number;

  @Column({ default: 1 })
  usagePerUser!: number;

  @Column({ nullable: true })
  createdBy?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
