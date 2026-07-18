import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { AgreementParty, ApprovalStatus, DocumentStatus } from './legal.enums';

@Entity('agreements')
@Index('idx_agreements_party', ['party'])
@Index('idx_agreements_status', ['status'])
@Index('idx_agreements_type', ['type'])
export class AgreementEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 20 })
  party!: AgreementParty;

  @Column({ type: 'varchar', length: 80 })
  type!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'int', default: 1 })
  version!: number;

  @Column({ type: 'varchar', length: 20, default: DocumentStatus.DRAFT })
  status!: DocumentStatus;

  @Column({ type: 'varchar', length: 20, default: ApprovalStatus.APPROVED })
  approvalStatus!: ApprovalStatus;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'simple-json', nullable: true })
  clauses!: { id: string; title: string; text: string }[];

  @Column({ type: 'varchar', length: 128, nullable: true })
  contentHash!: string;

  @Column({ type: 'varchar', length: 30, default: 'en' })
  language!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  authorId!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  approverId!: string;

  @Column({ type: 'timestamptz', nullable: true })
  approvedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  effectiveDate!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt!: Date;

  @Column({ type: 'text', nullable: true })
  changeNotes!: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  signatureTemplate!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
