import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('drivers')
export class DriverEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_drivers_user_id')
  @Column()
  userId!: string;

  @OneToOne(() => UserEntity)
  @JoinColumn()
  user!: UserEntity;

  @Column({ nullable: true })
  licenseNumber!: string;

  @Column({ nullable: true })
  vehicleNumber!: string;

  @Column({ nullable: true })
  vehicleType!: string;

  @Index('idx_drivers_kyc_status')
  @Column({ default: 'pending' })
  kycStatus!: string;

  @Index('idx_drivers_is_online')
  @Column({ default: false })
  isOnline!: boolean;

  @Index('idx_drivers_is_available')
  @Column({ default: false })
  isAvailable!: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating!: number;

  @Column({ type: 'text', nullable: true, transformer: {
    from: (v: any) => v as any,
    to: (v: { lat: number; lng: number }) => `(${v.lng} ${v.lat})`,
  }})
  currentLocation!: { lat: number; lng: number };

  @Column({ default: 0 })
  totalDeliveries!: number;

  @Column({ default: 0 })
  totalDistance!: number;

  @Column({ default: 0 })
  failureCount!: number;

  @Column({ nullable: true })
  lastLocationUpdate?: Date;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  averageSpeed!: number;

  @Column('decimal', { precision: 5, scale: 2, default: 100 })
  fraudScore!: number;

  @Column({ default: false })
  isFraudSuspicious!: boolean;

  @Column({ nullable: true })
  lastFraudCheck!: Date;

  @Column('simple-json', { nullable: true })
  fraudFlags!: {
    gpsSpoofingRisk?: number;
    routeDeviationRisk?: number;
    timingAbuseRisk?: number;
    fakeDeliveryRisk?: number;
  };

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}