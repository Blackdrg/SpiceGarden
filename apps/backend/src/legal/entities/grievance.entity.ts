import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum GrievanceStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  ESCALATED = 'escalated',
}

@Entity('grievances')
@Index('idx_grievances_user', ['userId'])
@Index('idx_grievances_status', ['status'])
@Index('idx_grievances_regulation', ['regulation'])
export class GrievanceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  userId!: string;

  @Column({ type: 'varchar', length: 20, default: 'dpdp' })
  regulation!: string;

  @Column({ type: 'varchar', length: 160 })
  subject!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', length: 20, default: GrievanceStatus.OPEN })
  status!: GrievanceStatus;

  @Column({ type: 'varchar', length: 160, nullable: true })
  complainantName!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  complainantEmail!: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  complainantPhone!: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  assignedOfficerId!: string;

  @Column({ type: 'text', nullable: true })
  resolution!: string;

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  slaDeadline!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
