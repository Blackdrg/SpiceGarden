import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('audit_logs')
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_audit_logs_action')
  @Column()
  action!: string;

  @Index('idx_audit_logs_performed_by')
  @Column({ nullable: true })
  performedBy!: string; // userId or 'system'

  @Column({ nullable: true })
  entityType!: string;

  @Column({ nullable: true })
  entityId!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: any;

  @Column({ nullable: true })
  ipAddress!: string;

  @CreateDateColumn()
  timestamp!: Date;
}
