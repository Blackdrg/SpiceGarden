import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApprovalStatus } from './legal.enums';
import { LegalDocumentType } from './legal.enums';

export interface LegalSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

@Entity('legal_versions')
@Index('idx_legal_versions_document', ['documentId'])
@Index('idx_legal_versions_document_version', ['documentId', 'version'], { unique: true })
export class LegalVersionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  documentId!: string;

  @Column({ type: 'varchar', length: 80 })
  documentType!: LegalDocumentType;

  @Column({ type: 'int' })
  version!: number;

  @Column({ type: 'varchar', length: 20, default: ApprovalStatus.PENDING })
  approvalStatus!: ApprovalStatus;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'simple-json' })
  sections!: LegalSection[];

  @Column({ type: 'text', nullable: true })
  summary!: string;

  @Column({ type: 'varchar', length: 20, default: 'en' })
  language!: string;

  @Column({ type: 'text', nullable: true })
  changeNotes!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  authorId!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  approverId!: string;

  @Column({ type: 'timestamptz', nullable: true })
  approvedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  effectiveDate!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  retiredDate!: Date;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  workflowState!: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  contentHash!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  signature!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
