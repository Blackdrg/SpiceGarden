import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { LegalDocumentType, DocumentStatus, ApprovalStatus } from './legal.enums';

@Entity('legal_documents')
@Index('idx_legal_documents_type', ['type'])
@Index('idx_legal_documents_status', ['status'])
export class LegalDocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 80, unique: true })
  type!: LegalDocumentType;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  slug!: string;

  @Column({ type: 'varchar', length: 20, default: DocumentStatus.DRAFT })
  status!: DocumentStatus;

  @Column({ type: 'int', default: 1 })
  currentVersion!: number;

  @Column({ type: 'varchar', length: 20, default: ApprovalStatus.PENDING })
  approvalStatus!: ApprovalStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  approverId!: string;

  @Column({ type: 'timestamptz', nullable: true })
  approvedAt!: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ownerRole!: string;

  @Column({ type: 'boolean', default: true })
  requiresAcceptance!: boolean;

  @Column({ type: 'boolean', default: false })
  multiLanguage!: boolean;

  @Column({ type: 'varchar', length: 20, default: 'en' })
  defaultLanguage!: string;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  workflowState!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
