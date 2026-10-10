
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { NotificationStatus } from './notification-status.enum';

@Entity('notifications')
@Index('idx_notifications_recipient_id', ['recipientId'])
@Index('idx_notifications_status', ['status'])
@Index('idx_notifications_recipient_status', ['recipientId', 'status'])
@Index('idx_notifications_next_attempt', ['nextAttemptAt'])
@Index('idx_notifications_created_at', ['createdAt'])
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  recipientId!: string; // User ID or device token

  @Column()
  recipientType!: 'user' | 'device' | 'email' | 'phone'; // Type of recipient

  @Column()
  notificationType!: 'push' | 'sms' | 'email' | 'apns'; // Type of notification

  @Column('simple-json')
  payload!: any; // The notification data (title, body, etc.)

  @Column()
  provider!: 'fcm' | 'twilio' | 'sendgrid' | 'apns'; // Service provider

  @Column({ type: 'enum', enum: NotificationStatus, default: NotificationStatus.PENDING })
  status!: NotificationStatus;

  @Column({ default: 0 })
  attemptCount!: number;

  @Column({ nullable: true })
  maxAttempts!: number;

  @Column({ nullable: true })
  lastAttemptAt!: Date;

  @Column({ nullable: true })
  nextAttemptAt!: Date;

  @Column({ nullable: true })
  completedAt!: Date;

  @Column('simple-json', { nullable: true })
  errorInfo!: { // Error information if failed
    message?: string;
    code?: string;
    providerResponse?: any;
  };

  @Column({ nullable: true })
  callbackUrl!: string; // URL to call when notification is processed

  @Column('simple-json', { nullable: true })
  metadata!: {}; // Additional metadata

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

