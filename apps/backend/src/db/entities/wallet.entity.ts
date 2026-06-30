import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('wallets')
export class WalletEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_wallets_user_id')
  @Column()
  userId!: string;

  @ManyToOne(() => UserEntity)
  user!: UserEntity;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  balance!: number;

  @Column({ default: 'INR' })
  currency!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
