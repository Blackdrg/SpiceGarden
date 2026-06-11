import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('deletion_requests')
export class DeletionRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status!: string;

  @Column({ type: 'varchar', length: 50, default: 'self_service' })
  regulation!: string;

  @Column({ type: 'text', nullable: true })
  reason!: string;

  @Column({ type: 'date' })
  scheduledDeletionDate!: Date;

  @Column({ type: 'jsonb', nullable: true })
  cancellationReason!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'date', nullable: true })
  completedAt!: Date;

  @ManyToOne(() => UserEntity)
  user!: UserEntity;

  @Column({ unique: true })
  userId!: string;
}
