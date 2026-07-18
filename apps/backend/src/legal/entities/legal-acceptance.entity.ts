import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('legal_acceptances')
@Index('idx_legal_acceptances_user', ['userId'])
@Index('idx_legal_acceptances_user_document', ['userId', 'documentId'])
export class LegalAcceptanceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid' })
  documentId!: string;

  @Column({ type: 'uuid' })
  versionId!: string;

  @Column({ type: 'int' })
  version!: number;

  @Column({ type: 'varchar', length: 80 })
  documentType!: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress!: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  userAgent!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  acceptanceMethod!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  signature!: string;

  @Column({ type: 'timestamptz', nullable: true })
  acceptedAt!: Date;

  @Column({ type: 'boolean', default: false })
  withdrawn!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  withdrawnAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
