import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { UserEntity } from './user.entity';

export enum OtpType {
  EMAIL_VERIFICATION = 'email_verification',
  PHONE_VERIFICATION = 'phone_verification',
  LOGIN_2FA = 'login_2fa',
  LOGIN = 'login',
  PASSWORD_RESET = 'password_reset',
  DELIVERY_CONFIRMATION = 'delivery_confirmation',
}

export enum OtpStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  EXPIRED = 'expired',
}

@Entity('otp_verifications')
export class OtpEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_otp_verifications_user_id')
  @Column()
  userId!: string;

  @ManyToOne(() => UserEntity)
  user!: UserEntity;

  @Column({ nullable: true })
  orderId!: string;

  @Column({ type: 'varchar', enum: OtpType })
  type!: OtpType;

  @Column({ length: 6 })
  code!: string;

  @Column({ type: 'varchar', enum: OtpStatus, default: OtpStatus.PENDING })
  status!: OtpStatus;

  @Column()
  expiresAt!: Date;

  @Column({ nullable: true })
  verifiedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
