import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum QrType {
  DYNAMIC = 'dynamic',
  STATIC_MERCHANT = 'static_merchant',
  STATIC_UPI = 'static_upi',
}

export enum QrStatus {
  PENDING = 'pending',
  WAITING_PAYMENT = 'waiting_payment',
  PAID = 'paid',
  EXPIRED = 'expired',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('payment_qr_codes')
@Index(['orderId'])
@Index(['status'])
export class PaymentQrCodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, default: QrType.DYNAMIC })
  qrType!: QrType;

  @Column({ type: 'varchar', length: 255 })
  upiId!: string;

  @Column({ type: 'varchar', length: 255 })
  upiName!: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  amount?: number;

  @Column({ type: 'varchar', length: 10, default: 'INR' })
  currency!: string;

  @Column({ nullable: true })
  orderId?: string;

  @Column({ nullable: true })
  paymentIntentId?: string;

  @Column('text')
  qrData!: string;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  qrImageUrl?: string;

  @Column({ type: 'varchar', length: 50, default: QrStatus.PENDING })
  status!: QrStatus;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidAt?: Date;

  @Column({ nullable: true })
  paymentRef?: string;

  @Column({ type: 'varchar', length: 50, default: 'razorpay' })
  gateway!: string;

  @Column({ default: 0 })
  attempts!: number;

  @Column('simple-json', { nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
