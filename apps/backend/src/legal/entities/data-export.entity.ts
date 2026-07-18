import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DataRequestStatus, Regulation, ExportFormat } from './legal.enums';

@Entity('privacy_data_exports')
@Index('idx_data_exports_user', ['userId'])
@Index('idx_data_exports_request', ['requestId'])
@Index('idx_data_exports_status', ['status'])
export class DataExportEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid', nullable: true })
  requestId!: string;

  @Column({ type: 'varchar', length: 20, default: Regulation.GDPR })
  regulation!: Regulation;

  @Column({ type: 'varchar', length: 15, default: ExportFormat.JSON })
  format!: ExportFormat;

  @Column({ type: 'varchar', length: 25, default: DataRequestStatus.PENDING })
  status!: DataRequestStatus;

  @Column({ type: 'text', nullable: true })
  filePath!: string | null;

  @Column({ type: 'text', nullable: true })
  downloadUrl!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt!: Date;

  @Column({ type: 'text', nullable: true })
  errorMessage!: string;

  @Column({ type: 'simple-json', nullable: true })
  scope!: Record<string, any>;

  @Column({ type: 'int', default: 0 })
  sizeBytes!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt!: Date;
}
