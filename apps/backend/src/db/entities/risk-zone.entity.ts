import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum ZoneType {
  RADIUS = 'radius',
  POLYGON = 'polygon',
}

export enum RiskSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('risk_zones')
@Index('idx_risk_zones_is_active', ['isActive'])
@Index('idx_risk_zones_risk_score', ['riskScore'])
export class RiskZoneEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50, default: ZoneType.RADIUS })
  zoneType!: ZoneType;

  @Column('simple-json', { nullable: true })
  polygon?: { lat: number; lng: number }[];

  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  centerLat?: number;

  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  centerLng?: number;

  @Column({ default: 500 })
  radiusMeters!: number;

  @Column({ default: 0 })
  riskScore!: number;

  @Column({ nullable: true })
  crimeCategory?: string;

  @Column({ type: 'varchar', length: 50, default: RiskSeverity.LOW })
  severity!: RiskSeverity;

  @Column({ nullable: true })
  activeTimeStart?: string;

  @Column({ nullable: true })
  activeTimeEnd?: string;

  @Column('simple-json', { default: '[]' })
  activeDays!: string[];

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ nullable: true })
  verificationSource?: string;

  @Column({ type: 'text', nullable: true })
  adminNotes?: string;

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
