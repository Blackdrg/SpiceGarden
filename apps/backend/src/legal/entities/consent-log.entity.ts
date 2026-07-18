import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ConsentCategory, Regulation } from './legal.enums';

@Entity('consent_logs')
@Index('idx_consent_logs_user', ['userId'])
@Index('idx_consent_logs_consent', ['consentId'])
@Index('idx_consent_logs_category', ['category'])
@Index('idx_consent_logs_created', ['createdAt'])
export class ConsentLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  userId!: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  anonymousToken!: string;

  @Column({ type: 'uuid', nullable: true })
  consentId!: string;

  @Column({ type: 'varchar', length: 30 })
  category!: ConsentCategory;

  @Column({ type: 'boolean' })
  granted!: boolean;

  @Column({ type: 'varchar', length: 20, default: Regulation.GDPR })
  region!: Regulation;

  @Column({ type: 'varchar', length: 40, default: '1.0.0' })
  consentVersion!: string;

  @Column({ type: 'varchar', length: 40 })
  action!: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress!: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  userAgent!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  source!: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata!: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;
}
