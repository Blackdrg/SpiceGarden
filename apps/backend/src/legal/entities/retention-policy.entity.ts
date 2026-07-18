import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { RetentionAction } from './legal.enums';

export interface RetentionScope {
  entity: string;
  filter?: Record<string, any>;
}

@Entity('retention_policies')
@Index('idx_retention_policies_key', ['key'], { unique: true })
export class RetentionPolicyEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 80, unique: true })
  key!: string;

  @Column({ type: 'varchar', length: 128 })
  label!: string;

  @Column({ type: 'varchar', length: 80 })
  dataType!: string;

  @Column({ type: 'int' })
  retentionDays!: number;

  @Column({ type: 'varchar', length: 20, default: RetentionAction.DELETE })
  action!: RetentionAction;

  @Column({ type: 'boolean', default: true })
  enabled!: boolean;

  @Column({ type: 'boolean', default: false })
  legalHoldCapable!: boolean;

  @Column({ type: 'simple-json', nullable: true })
  scope!: RetentionScope;

  @Column({ type: 'varchar', length: 40, default: 'UTC' })
  timezone!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description!: string;

  @Column({ type: 'timestamptz', nullable: true })
  lastRunAt!: Date;

  @Column({ type: 'int', default: 0 })
  lastRunRecordsAffected!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
