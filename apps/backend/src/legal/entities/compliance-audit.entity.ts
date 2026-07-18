import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('compliance_audits')
@Index('idx_compliance_audits_category', ['category'])
@Index('idx_compliance_audits_actor', ['actorId'])
@Index('idx_compliance_audits_created', ['createdAt'])
export class ComplianceAuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 60 })
  action!: string;

  @Column({ type: 'varchar', length: 60 })
  category!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  actorId!: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  actorRole!: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  entityType!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  entityId!: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress!: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata!: Record<string, any>;

  @Column({ type: 'varchar', length: 128, nullable: true })
  contentHash!: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  signature!: string;

  @Column({ type: 'boolean', default: false })
  tampered!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
