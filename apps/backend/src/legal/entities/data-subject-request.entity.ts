import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import {
  DataRequestType,
  DataRequestStatus,
  Regulation,
  ExportFormat,
} from './legal.enums';

@Entity('data_subject_requests')
@Index('idx_dsr_user', ['userId'])
@Index('idx_dsr_status', ['status'])
@Index('idx_dsr_type', ['type'])
@Index('idx_dsr_regulation', ['regulation'])
export class DataSubjectRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 30 })
  type!: DataRequestType;

  @Column({ type: 'varchar', length: 20 })
  regulation!: Regulation;

  @Column({ type: 'varchar', length: 25, default: DataRequestStatus.PENDING })
  status!: DataRequestStatus;

  @Column({ type: 'text', nullable: true })
  reason!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  requestedBy!: string;

  @Column({ type: 'uuid', nullable: true })
  reviewerId!: string;

  @Column({ type: 'text', nullable: true })
  reviewNotes!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  reviewedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  scheduledDate!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  cancelledAt!: Date;

  @Column({ type: 'text', nullable: true })
  cancellationReason!: string;

  @Column({ type: 'int', default: 30 })
  slaDays!: number;

  @Column({ type: 'timestamptz', nullable: true })
  slaDeadline!: Date;

  @Column({ type: 'text', nullable: true })
  resultSummary!: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata!: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
