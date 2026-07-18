import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan } from 'typeorm';
import { RetentionPolicyEntity, DataRetentionJobEntity } from './entities';
import { RetentionAction, RetentionJobStatus } from './entities/legal.enums';
import { ComplianceAuditService } from './compliance-audit.service';

export interface RetentionConfig {
  key: string;
  label: string;
  dataType: string;
  retentionDays: number;
  action: RetentionAction;
  legalHoldCapable?: boolean;
  description?: string;
  scope?: Record<string, any>;
}

const DEFAULT_POLICIES: RetentionConfig[] = [
  { key: 'orders', label: 'Orders', dataType: 'order', retentionDays: 3650, action: RetentionAction.ARCHIVE, legalHoldCapable: true },
  { key: 'invoices', label: 'Invoices', dataType: 'invoice', retentionDays: 3650, action: RetentionAction.ARCHIVE, legalHoldCapable: true },
  { key: 'chats', label: 'Chats', dataType: 'chat', retentionDays: 730, action: RetentionAction.DELETE, legalHoldCapable: true },
  { key: 'notifications', label: 'Notifications', dataType: 'notification', retentionDays: 365, action: RetentionAction.DELETE },
  { key: 'audit_logs', label: 'Audit Logs', dataType: 'audit_log', retentionDays: 1095, action: RetentionAction.ARCHIVE, legalHoldCapable: true },
  { key: 'sessions', label: 'Sessions', dataType: 'session', retentionDays: 90, action: RetentionAction.DELETE },
  { key: 'otp', label: 'OTP', dataType: 'otp', retentionDays: 1, action: RetentionAction.DELETE },
  { key: 'driver_gps', label: 'Driver GPS', dataType: 'driver_gps', retentionDays: 30, action: RetentionAction.DELETE, legalHoldCapable: true },
  { key: 'restaurant_data', label: 'Restaurant Data', dataType: 'restaurant', retentionDays: 1825, action: RetentionAction.ARCHIVE, legalHoldCapable: true },
  { key: 'analytics', label: 'Analytics', dataType: 'analytics', retentionDays: 540, action: RetentionAction.DELETE },
  { key: 'marketing', label: 'Marketing', dataType: 'marketing', retentionDays: 730, action: RetentionAction.DELETE },
  { key: 'emails', label: 'Emails', dataType: 'email', retentionDays: 365, action: RetentionAction.DELETE },
  { key: 'payments', label: 'Payments', dataType: 'payment', retentionDays: 3650, action: RetentionAction.ARCHIVE, legalHoldCapable: true },
  { key: 'refunds', label: 'Refunds', dataType: 'refund', retentionDays: 3650, action: RetentionAction.ARCHIVE, legalHoldCapable: true },
  { key: 'wallet', label: 'Wallet', dataType: 'wallet', retentionDays: 1825, action: RetentionAction.ARCHIVE, legalHoldCapable: true },
  { key: 'loyalty', label: 'Loyalty', dataType: 'loyalty', retentionDays: 1095, action: RetentionAction.ANONYMIZE },
  { key: 'support_tickets', label: 'Support Tickets', dataType: 'support_ticket', retentionDays: 1095, action: RetentionAction.ARCHIVE, legalHoldCapable: true },
  { key: 'deleted_accounts', label: 'Deleted Accounts', dataType: 'deleted_account', retentionDays: 2555, action: RetentionAction.DELETE, legalHoldCapable: true },
];

@Injectable()
export class RetentionService {
  private readonly logger = new Logger(RetentionService.name);

  constructor(
    @InjectRepository(RetentionPolicyEntity)
    private readonly policyRepo: Repository<RetentionPolicyEntity>,
    @InjectRepository(DataRetentionJobEntity)
    private readonly jobRepo: Repository<DataRetentionJobEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly audit: ComplianceAuditService,
  ) {}

  async seedDefaults(): Promise<number> {
    let created = 0;
    for (const cfg of DEFAULT_POLICIES) {
      const existing = await this.policyRepo.findOne({ where: { key: cfg.key } });
      if (!existing) {
        await this.policyRepo.save(
          this.policyRepo.create({
            ...cfg,
            enabled: true,
            legalHoldCapable: cfg.legalHoldCapable ?? false,
            scope: cfg.scope || {},
          } as any),
        );
        created++;
      }
    }
    return created;
  }

  async listPolicies(): Promise<RetentionPolicyEntity[]> {
    return this.policyRepo.find({ order: { dataType: 'ASC' } });
  }

  async getPolicy(key: string): Promise<RetentionPolicyEntity> {
    const policy = await this.policyRepo.findOne({ where: { key } });
    if (!policy) throw new NotFoundException('Retention policy not found');
    return policy;
  }

  async upsertPolicy(cfg: RetentionConfig): Promise<RetentionPolicyEntity> {
    const existing = await this.policyRepo.findOne({ where: { key: cfg.key } });
    if (existing) {
      Object.assign(existing, cfg, { scope: cfg.scope || {} });
      return this.policyRepo.save(existing);
    }
    const created = this.policyRepo.create({
      key: cfg.key,
      label: cfg.label,
      dataType: cfg.dataType,
      retentionDays: cfg.retentionDays,
      action: cfg.action,
      enabled: true,
      legalHoldCapable: cfg.legalHoldCapable ?? false,
      description: cfg.description,
      scope: cfg.scope || {},
    } as any) as unknown as RetentionPolicyEntity;
    return this.policyRepo.save(created);
  }

  async setLegalHold(key: string, hold: boolean): Promise<RetentionPolicyEntity> {
    const policy = await this.getPolicy(key);
    if (hold && !policy.legalHoldCapable) {
      throw new Error('Policy does not support legal hold');
    }
    policy.legalHoldCapable = hold ? true : policy.legalHoldCapable;
    policy.enabled = hold ? false : policy.enabled;
    return this.policyRepo.save(policy);
  }

  async runPolicy(key: string, triggeredBy = 'scheduler'): Promise<DataRetentionJobEntity> {
    const policy = await this.getPolicy(key);
    if (!policy.enabled) {
      throw new Error('Policy is disabled or under legal hold');
    }
    const cutoff = new Date(Date.now() - policy.retentionDays * 24 * 60 * 60 * 1000);
    const job = this.jobRepo.create({
      policyId: policy.id,
      action: policy.action,
      dataType: policy.dataType,
      cutoffDate: cutoff,
      status: RetentionJobStatus.RUNNING,
      triggeredBy,
    });
    const savedJob = await this.jobRepo.save(job);

    let affected = 0;
    let scanned = 0;
    let errorMessage: string | undefined;
    try {
      const tableName = RetentionService.resolveTableName(policy.dataType);
      if (!tableName) {
        throw new Error(`No table mapping for dataType "${policy.dataType}"`);
      }
      const repo = this.dataSource.getRepository(tableName);
      scanned = await repo.count({ where: { createdAt: LessThan(cutoff) } });
      if (policy.action === RetentionAction.DELETE) {
        const result = await repo
          .createQueryBuilder()
          .delete()
          .where('"createdAt" < :cutoff', { cutoff })
          .execute();
        affected = result.affected || 0;
      } else if (policy.action === RetentionAction.ANONYMIZE) {
        const result = await repo
          .createQueryBuilder()
          .update()
          .set({ userId: 'anonymized' } as any)
          .where('"createdAt" < :cutoff', { cutoff })
          .execute();
        affected = result.affected || 0;
      } else {
        affected = scanned;
      }
      savedJob.status = RetentionJobStatus.COMPLETED;
      savedJob.recordsScanned = scanned;
      savedJob.recordsAffected = affected;
      savedJob.completedAt = new Date();
      savedJob.result = { action: policy.action, cutoff: cutoff.toISOString() };
      policy.lastRunAt = new Date();
      policy.lastRunRecordsAffected = affected;
      await this.policyRepo.save(policy);
    } catch (error) {
      savedJob.status = RetentionJobStatus.FAILED;
      errorMessage = (error as Error).message;
      savedJob.errorMessage = errorMessage;
    }
    const finalJob = await this.jobRepo.save(savedJob);
    await this.audit.record({
      action: 'retention_job_run',
      category: 'retention',
      actorId: triggeredBy,
      entityType: 'data_retention_jobs',
      entityId: finalJob.id,
      metadata: { key, dataType: policy.dataType, affected },
    });
    return finalJob;
  }

  async runAllEnabled(triggeredBy = 'scheduler'): Promise<DataRetentionJobEntity[]> {
    const policies = await this.policyRepo.find({ where: { enabled: true } });
    const jobs: DataRetentionJobEntity[] = [];
    for (const policy of policies) {
      try {
        jobs.push(await this.runPolicy(policy.key, triggeredBy));
      } catch (error) {
        this.logger.error(`Retention policy ${policy.key} failed`, error as Error);
      }
    }
    return jobs;
  }

  async listJobs(filter?: { status?: RetentionJobStatus; limit?: number }): Promise<DataRetentionJobEntity[]> {
    const where: Record<string, any> = {};
    if (filter?.status) where.status = filter.status;
    return this.jobRepo.find({ where, order: { createdAt: 'DESC' }, take: filter?.limit ?? 100 });
  }

  /**
   * Maps a logical data category to the physical table name. Keeps the
   * retention configuration declarative (category names) while guaranteeing the
   * scheduler targets real tables instead of silently no-op'ing on an unknown
   * repository name.
   */
  static resolveTableName(dataType: string): string | null {
    const map: Record<string, string> = {
      order: 'orders',
      invoice: 'invoices',
      chat: 'chats',
      notification: 'notifications',
      audit_log: 'audit_logs',
      session: 'user_sessions',
      otp: 'otp_codes',
      driver_gps: 'driver_gps_tracks',
      restaurant: 'restaurants',
      analytics: 'analytics_events',
      marketing: 'marketing_events',
      email: 'email_logs',
      payment: 'payments',
      refund: 'refunds',
      wallet: 'wallets',
      loyalty: 'loyalty_points',
      support_ticket: 'support_tickets',
      deleted_account: 'users',
    };
    return map[dataType] ?? null;
  }
}
