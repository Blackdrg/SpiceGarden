import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('user_payment_methods')
export class PaymentMethodEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  userId!: string;

  @ManyToOne(() => UserEntity)
  user!: UserEntity;

  @Column()
  type!: string; // 'card', 'upi', 'wallet'

  @Column({ nullable: true })
  cardLast4!: string;

  @Column({ nullable: true })
  cardBrand!: string;

  @Column({ nullable: true })
  cardExpiry!: string;

  @Column({ nullable: true })
  upiId!: string;

  @Column({ nullable: true })
  walletProvider!: string;

  @Column({ nullable: true })
  externalPaymentMethodId!: string;

  @Column({ default: false })
  isDefault!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
