import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('risk_notifications')
@Index(['recipientId', 'recipientType'])
@Index(['isRead'])
export class RiskNotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  riskZoneId?: string;

  @Column()
  recipientId!: string;

  @Column({ type: 'varchar', length: 50, default: 'driver' })
  recipientType!: string;

  @Column({ type: 'varchar', length: 100 })
  notificationType!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column('text')
  message!: string;

  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  locationLat?: number;

  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  locationLng?: number;

  @Column({ default: false })
  isRead!: boolean;

  @Column({ default: false })
  isAcknowledged!: boolean;

  @Column({ default: false })
  isSos!: boolean;

  @Column('simple-json', { nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;
}
