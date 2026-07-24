import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum IncidentStatus {
  OPEN = 'open',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

@Entity('driver_incidents')
@Index(['driverId'])
@Index(['status'])
export class DriverIncidentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  driverId!: string;

  @Column({ nullable: true })
  orderId?: string;

  @Column({ nullable: true })
  riskZoneId?: string;

  @Column()
  incidentType!: string;

  @Column({ type: 'varchar', length: 50, default: IncidentStatus.OPEN })
  severity!: string;

  @Column('text')
  description!: string;

  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  locationLat?: number;

  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  locationLng?: number;

  @Column({ type: 'varchar', length: 50, default: IncidentStatus.OPEN })
  status!: IncidentStatus;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt?: Date;

  @Column({ nullable: true })
  resolvedBy?: string;

  @Column({ type: 'text', nullable: true })
  resolutionNotes?: string;

  @Column('simple-json', { nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
