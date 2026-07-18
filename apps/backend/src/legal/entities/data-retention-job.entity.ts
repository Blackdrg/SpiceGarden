import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { RetentionAction, RetentionJobStatus } from './legal.enums';

@Entity('data_retention_jobs')
@Index('idx_retention_jobs_policy', ['policyId'])
@Index('idx_retention_jobs_status', ['status'])
export class DataRetentionJobEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  policyId!: string;

  @Column({ type: 'varchar', length: 25, default: RetentionJobStatus.PENDING })
  status!: RetentionJobStatus;

  @Column({ type: 'varchar', length: 20 })
  action!: RetentionAction;

  @Column({ type: 'varchar', length: 80 })
  dataType!: string;

  @Column({ type: 'timestamptz' })
  cutoffDate!: Date;

  @Column({ type: 'int', default: 0 })
  recordsScanned!: number;

  @Column({ type: 'int', default: 0 })
  recordsAffected!: number;

  @Column({ type: 'text', nullable: true })
  errorMessage!: string;

  @Column({ type: 'simple-json', nullable: true })
  result!: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  triggeredBy!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt!: Date;
}
