import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { WalletEntity } from './wallet.entity';

@Entity('wallet_transactions')
@Index('idx_wallet_transactions_wallet_id', ['walletId'])
@Index('idx_wallet_transactions_type', ['type'])
@Index('idx_wallet_transactions_created_at', ['createdAt'])
@Index('idx_wallet_transactions_wallet_created', ['walletId', 'createdAt'])
export class WalletTransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  walletId!: string;

  @ManyToOne(() => WalletEntity)
  wallet!: WalletEntity;

  @Column('decimal', { precision: 12, scale: 2 })
  amount!: number;

  @Column()
  type!: 'credit' | 'debit';

  @Column()
  description!: string;

  @Column({ nullable: true })
  referenceId!: string; // Order ID or Payout ID

  @CreateDateColumn()
  createdAt!: Date;
}
