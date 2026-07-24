import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum BanType {
  SOFT = 'soft',
  HARD = 'hard',
}

@Entity('fraud_blacklist')
@Index(['entityType', 'entityValue'])
@Index(['isActive'])
export class FraudBlacklistEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  entityType!: string;

  @Column({ type: 'varchar', length: 255 })
  entityValue!: string;

  @Column({ type: 'varchar', length: 50, default: BanType.SOFT })
  banType!: BanType;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column('simple-json', { nullable: true })
  evidence?: Record<string, any>;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ nullable: true })
  createdBy?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
