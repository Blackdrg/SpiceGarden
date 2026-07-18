import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ConsentCategory, Regulation } from './legal.enums';

@Entity('cookie_consents')
@Index('idx_cookie_consents_user', ['userId'])
@Index('idx_cookie_consents_token', ['anonymousToken'])
export class CookieConsentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  userId!: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  anonymousToken!: string;

  @Column({ type: 'varchar', length: 20, default: Regulation.GDPR })
  region!: Regulation;

  @Column({ type: 'varchar', length: 10, default: 'en' })
  language!: string;

  @Column({ type: 'boolean', default: true })
  necessary!: boolean;

  @Column({ type: 'boolean', default: false })
  analytics!: boolean;

  @Column({ type: 'boolean', default: false })
  marketing!: boolean;

  @Column({ type: 'boolean', default: false })
  performance!: boolean;

  @Column({ type: 'boolean', default: false })
  functional!: boolean;

  @Column({ type: 'boolean', default: false })
  preference!: boolean;

  @Column({ type: 'varchar', length: 40, default: '1.0.0' })
  consentVersion!: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress!: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  userAgent!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  consentMethod!: string;

  @Column({ type: 'timestamptz', nullable: true })
  withdrawnAt!: Date;

  @Column({ type: 'boolean', default: false })
  active!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
