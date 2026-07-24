import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum RiskEventType {
  ZONE_ENTERED = 'zone_entered',
  ZONE_EXITED = 'zone_exited',
  COD_RESTRICTED = 'cod_restricted',
  DRIVER_WARNED = 'driver_warned',
  SOS_TRIGGERED = 'sos_triggered',
  DELIVERY_IN_RISK_ZONE = 'delivery_in_risk_zone',
}

export enum RiskEventSeverity {
  INFO = 'info',
  WARNING = 'warning',
  DANGER = 'danger',
  CRITICAL = 'critical',
}

@Entity('risk_events')
@Index(['riskZoneId', 'createdAt'])
@Index(['createdAt'])
export class RiskEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  riskZoneId?: string;

  @Column({ type: 'varchar', length: 100 })
  eventType!: RiskEventType;

  @Column({ type: 'varchar', length: 50, default: RiskEventSeverity.INFO })
  severity!: RiskEventSeverity;

  @Column('text')
  description!: string;

  @Column({ nullable: true })
  userId?: string;

  @Column({ nullable: true })
  driverId?: string;

  @Column({ nullable: true })
  orderId?: string;

  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  locationLat?: number;

  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  locationLng?: number;

  @Column('simple-json', { nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;
}
