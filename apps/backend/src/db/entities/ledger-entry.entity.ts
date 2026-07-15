import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('ledger_entries')
export class LedgerEntryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  transactionId!: string;

  @Column()
  account!: string;

  @Column({ nullable: true })
  accountName!: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount!: number;

  @Column({ default: 'INR' })
  currency!: string;

  @Column()
  type!: string;

  @Column({ nullable: true })
  referenceId!: string;

  @Column()
  description!: string;

  @CreateDateColumn()
  createdAt!: Date;
}