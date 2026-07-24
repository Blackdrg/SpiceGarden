import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum EmergencyIncidentStatus {
  OPEN = 'open',
  ACKNOWLEDGED = 'acknowledged',
  RESPONDED = 'responded',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  FALSE_ALARM = 'false_alarm',
  CANCELLED = 'cancelled',
}

export enum EmergencySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('emergency_incidents')
@Index('idx_emergency_incidents_driver_id', ['driverId'])
@Index('idx_emergency_incidents_status', ['status'])
@Index('idx_emergency_incidents_severity', ['severity'])
@Index('idx_emergency_incidents_created_at', ['createdAt'])
@Index('idx_emergency_incidents_incident_number', ['incidentNumber'], { unique: true })
@Index('idx_emergency_incidents_order_id', ['orderId'])
@Index('idx_emergency_incidents_restaurant_id', ['restaurantId'])
export class EmergencyIncidentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  incidentNumber!: string;

  @Column()
  driverId!: string;

  @Column({ nullable: true })
  orderId?: string;

  @Column({ nullable: true })
  restaurantId?: string;

  @Column({ nullable: true })
  customerId?: string;

  @Column({ type: 'varchar', length: 50, default: EmergencyIncidentStatus.OPEN })
  status!: EmergencyIncidentStatus;

  @Column({ type: 'varchar', length: 50, default: EmergencySeverity.MEDIUM })
  severity!: EmergencySeverity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt?: Date;

  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @Column('decimal', { precision: 6, scale: 2, nullable: true })
  accuracy?: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  heading?: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  speed?: number;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ nullable: true })
  deviceBattery?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  networkType?: string;

  @Column('simple-json', { nullable: true })
  notes?: Record<string, any>;

  @Column({ nullable: true })
  resolvedBy?: string;

  @Column({ type: 'text', nullable: true })
  resolutionNotes?: string;

  @Column('simple-json', { nullable: true })
  metadata?: Record<string, any>;
}
