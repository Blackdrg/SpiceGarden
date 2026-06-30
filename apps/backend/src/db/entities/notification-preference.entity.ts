import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('notification_preferences')
export class NotificationPreferenceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_notification_preferences_user_id')
  @Column()
  userId!: string;

  @ManyToOne(() => UserEntity)
  user!: UserEntity;

  @Column({ default: true })
  pushOrders!: boolean;

  @Column({ default: true })
  pushPromotions!: boolean;

  @Column({ default: true })
  pushDeliveryUpdates!: boolean;

  @Column({ default: true })
  emailOrders!: boolean;

  @Column({ default: false })
  emailPromotions!: boolean;

  @Column({ default: true })
  smsDeliveryUpdates!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
