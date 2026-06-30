import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('subscriptions')
@Index('idx_subscriptions_user_id', ['userId'])
@Index('idx_subscriptions_status', ['status'])
export class SubscriptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => UserEntity)
  user!: UserEntity;

  @Column()
  planName!: string; // e.g., 'Gold', 'Premium'

  @Column()
  status!: string; // 'active', 'expired', 'cancelled'

  @Column()
  expiryDate!: Date;

  @Column({ type: 'jsonb', nullable: true })
  benefits!: any;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
