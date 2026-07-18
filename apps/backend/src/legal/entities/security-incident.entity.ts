import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import {
  SecurityIncidentSeverity,
  SecurityIncidentStatus,
} from './legal.enums';

@Entity('security_incidents')
@Index('idx_security_incidents_status', ['status'])
@Index('idx_security_incidents_severity', ['severity'])
@Index('idx_security_incidents_created', ['createdAt'])
export class SecurityIncidentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 160 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    type: 'varchar',
    length: 15,
    default: SecurityIncidentSeverity.MEDIUM,
  })
  severity!: SecurityIncidentSeverity;

  @Column({
    type: 'varchar',
    length: 15,
    default: SecurityIncidentStatus.OPEN,
  })
  status!: SecurityIncidentStatus;

  @Column({ type: 'varchar', length: 80, nullable: true })
  category!: string;

  @Column({ type: 'boolean', default: false })
  publiclyDisclosed!: boolean;

  @Column({ type: 'text', nullable: true })
  disclosureText!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reporterId!: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  reporterEmail!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  assignedTo!: string;

  @Column({ type: 'timestamptz', nullable: true })
  detectedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  containedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt!: Date;

  @Column({ type: 'simple-json', nullable: true })
  affectedSystems!: string[];

  @Column({ type: 'simple-json', nullable: true })
  remediationSteps!: string[];

  @Column({ type: 'varchar', length: 128, nullable: true })
  contentHash!: string;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
