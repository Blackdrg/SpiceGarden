import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { UserEntity } from './user.entity';
import { TenantEntity } from './tenant.entity';

export enum ApiKeyStatus {
  ACTIVE = 'active',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
}

export enum ApiKeyScope {
  READ = 'read',
  WRITE = 'write',
  ADMIN = 'admin',
}

@Entity('api_keys')
@Index('idx_api_keys_key_hash', ['keyHash'], { unique: true })
@Index('idx_api_keys_user_id', ['userId'])
@Index('idx_api_keys_tenant_id', ['tenantId'])
export class ApiKeyEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 64 })
  keyHash!: string;

  @Column({ length: 16 })
  keyPrefix!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => UserEntity)
  user!: UserEntity;

  @Column({ nullable: true })
  tenantId!: string;

  @ManyToOne(() => TenantEntity)
  tenant?: TenantEntity;

  @Column('simple-array')
  scopes!: ApiKeyScope[];

  @Column('simple-json', { nullable: true })
  allowedEndpoints?: string[];

  @Column({ type: 'varchar', enum: ApiKeyStatus, default: ApiKeyStatus.ACTIVE })
  status!: ApiKeyStatus;

  @Column({ type: 'bigint', default: 0 })
  usageCount!: number;

  @Column({ type: 'bigint', default: 0 })
  dailyLimit!: number;

  @Column({ type: 'bigint', default: 0 })
  monthlyLimit!: number;

  @Column({ type: 'date', nullable: true })
  lastUsedAt!: Date;

  @Column({ type: 'date', nullable: true })
  expiresAt!: Date;

  @Column({ nullable: true })
  revokedAt!: Date;

  @Column({ nullable: true })
  revokedBy!: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
