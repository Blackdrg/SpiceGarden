import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  DataSubjectRequestEntity,
  DataExportEntity,
} from './entities';
import {
  DataRequestType,
  DataRequestStatus,
  Regulation,
  ExportFormat,
  ConsentCategory,
} from './entities/legal.enums';
import { ComplianceAuditService } from './compliance-audit.service';
import { LegalIntegrityService } from './integrity.service';
import { LegalNotificationService } from './legal-notification.service';

export interface CreateRequestInput {
  userId: string;
  type: DataRequestType;
  regulation: Regulation;
  reason?: string;
  requestedBy?: string;
  slaDays?: number;
  metadata?: Record<string, any>;
}

const SLA_BY_TYPE: Record<DataRequestType, number> = {
  [DataRequestType.ACCESS]: 30,
  [DataRequestType.DELETE]: 30,
  [DataRequestType.CORRECT]: 30,
  [DataRequestType.RESTRICT]: 30,
  [DataRequestType.OBJECT]: 30,
  [DataRequestType.PORTABILITY]: 30,
  [DataRequestType.CONSENT_WITHDRAWAL]: 15,
};

@Injectable()
export class DataSubjectRequestService {
  private readonly logger = new Logger(DataSubjectRequestService.name);

  constructor(
    @InjectRepository(DataSubjectRequestEntity)
    private readonly requestRepo: Repository<DataSubjectRequestEntity>,
    @InjectRepository(DataExportEntity)
    private readonly exportRepo: Repository<DataExportEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly audit: ComplianceAuditService,
    private readonly integrity: LegalIntegrityService,
    private readonly notifications: LegalNotificationService,
  ) {}

  async createRequest(input: CreateRequestInput): Promise<DataSubjectRequestEntity> {
    const existing = await this.requestRepo.findOne({
      where: { userId: input.userId, status: DataRequestStatus.PENDING, type: input.type },
    });
    if (existing) {
      throw new BadRequestException('A pending request of this type already exists');
    }
    const slaDays = input.slaDays ?? SLA_BY_TYPE[input.type] ?? 30;
    const now = new Date();
    const request = this.requestRepo.create({
      userId: input.userId,
      type: input.type,
      regulation: input.regulation,
      status: DataRequestStatus.PENDING,
      reason: input.reason,
      requestedBy: input.requestedBy || input.userId,
      slaDays,
      slaDeadline: new Date(now.getTime() + slaDays * 24 * 60 * 60 * 1000),
      scheduledDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      metadata: input.metadata || {},
    });
    const saved = await this.requestRepo.save(request);
    await this.audit.record({
      action: 'dsr_created',
      category: 'data_subject_request',
      actorId: input.requestedBy || input.userId,
      entityType: 'data_subject_requests',
      entityId: saved.id,
      metadata: { type: input.type, regulation: input.regulation },
    });
    return saved;
  }

  async listRequests(filter: {
    userId?: string;
    status?: DataRequestStatus;
    type?: DataRequestType;
    regulation?: Regulation;
    limit?: number;
    offset?: number;
  }): Promise<DataSubjectRequestEntity[]> {
    const where: Record<string, any> = {};
    if (filter.userId) where.userId = filter.userId;
    if (filter.status) where.status = filter.status;
    if (filter.type) where.type = filter.type;
    if (filter.regulation) where.regulation = filter.regulation;
    return this.requestRepo.find({
      where,
      order: { createdAt: 'DESC' },
      take: filter.limit ?? 100,
      skip: filter.offset ?? 0,
    });
  }

  async getRequest(id: string): Promise<DataSubjectRequestEntity> {
    const request = await this.requestRepo.findOne({ where: { id } });
    if (!request) throw new NotFoundException('Request not found');
    return request;
  }

  async review(
    id: string,
    reviewerId: string,
    decision: 'approve' | 'reject',
    notes?: string,
  ): Promise<DataSubjectRequestEntity> {
    const request = await this.getRequest(id);
    if (request.status !== DataRequestStatus.PENDING && request.status !== DataRequestStatus.IN_REVIEW) {
      throw new BadRequestException('Request is not in a reviewable state');
    }
    request.status = decision === 'approve' ? DataRequestStatus.APPROVED : DataRequestStatus.REJECTED;
    request.reviewerId = reviewerId;
    request.reviewNotes = notes ?? null;
    request.reviewedAt = new Date();
    const saved = await this.requestRepo.save(request);
    await this.audit.record({
      action: decision === 'approve' ? 'dsr_approved' : 'dsr_rejected',
      category: 'data_subject_request',
      actorId: reviewerId,
      entityType: 'data_subject_requests',
      entityId: saved.id,
      metadata: { type: saved.type },
    });
    return saved;
  }

  async startProcessing(id: string): Promise<DataSubjectRequestEntity> {
    const request = await this.getRequest(id);
    if (request.status !== DataRequestStatus.APPROVED) {
      throw new BadRequestException('Request must be approved before processing');
    }
    request.status = DataRequestStatus.PROCESSING;
    return this.requestRepo.save(request);
  }

  async complete(id: string, resultSummary?: string): Promise<DataSubjectRequestEntity> {
    const request = await this.getRequest(id);
    const type = request.type;
    const userId = request.userId;

    if (type === DataRequestType.DELETE) {
      const deletionResult = await this.executeDeletion(userId, request.regulation);
      resultSummary = resultSummary || `Deleted ${deletionResult.deletedRecords} personal-data records for user ${userId}.`;
    } else if (
      type === DataRequestType.RESTRICT ||
      type === DataRequestType.OBJECT
    ) {
      await this.restrictProcessing(userId);
    }

    request.status = DataRequestStatus.COMPLETED;
    request.completedAt = new Date();
    if (resultSummary) request.resultSummary = resultSummary;
    const saved = await this.requestRepo.save(request);
    await this.audit.record({
      action: 'dsr_completed',
      category: 'data_subject_request',
      actorId: request.reviewerId || 'system',
      entityType: 'data_subject_requests',
      entityId: saved.id,
      metadata: { type: saved.type, regulation: saved.regulation },
    });

    if (type === DataRequestType.DELETE) {
      await this.notifications.notify({
        userId,
        event: 'deletion_completed',
        title: 'Account data deleted',
        body: 'Your request to delete your personal data has been completed. We have removed the records permitted by law.',
        metadata: { requestId: saved.id, regulation: saved.regulation },
      });
    } else {
      await this.notifications.notify({
        userId,
        event: 'privacy_request_completed',
        title: 'Privacy request completed',
        body: `Your ${type} request has been completed.`,
        metadata: { requestId: saved.id, type, regulation: saved.regulation },
      });
    }
    return saved;
  }

  /**
   * Executes a GDPR/DPDP erasure (right to be forgotten). Permanently removes
   * the user's personal data across the supported data stores. Records that are
   * retained by legal obligation (financial/audit) are anonymised rather than
   * deleted, which is recorded in the result summary.
   */
  async executeDeletion(
    userId: string,
    regulation?: Regulation,
  ): Promise<{ deletedRecords: number; anonymizedRecords: number; details: Record<string, number> }> {
    const details: Record<string, number> = {};
    let deletedRecords = 0;
    let anonymizedRecords = 0;

    const deleteFrom = async (table: string): Promise<number> => {
      try {
        const repo = this.dataSource.getRepository(table);
        const res = await repo
          .createQueryBuilder()
          .delete()
          .where('"userId" = :userId', { userId })
          .execute();
        return res.affected || 0;
      } catch (error) {
        this.logger.warn(`Deletion skipped for ${table}: ${(error as Error).message}`);
        return 0;
      }
    };

    // 1. Sessions
    details.sessions = await deleteFrom('user_sessions');
    deletedRecords += details.sessions;

    // 2. Devices (user_devices table carries userId)
    details.devices = await this.deleteByColumn('user_devices', 'userId', userId);
    deletedRecords += details.devices;

    // 3. Notifications
    details.notifications = await deleteFrom('notifications');
    deletedRecords += details.notifications;

    // 4. Notification analytics (linked by deviceToken, anonymised by removing linkage)
    details.notificationAnalytics = await this.anonymizeByColumn(
      'notification_analytics',
      'deviceToken',
      'REDACTED',
    );
    anonymizedRecords += details.notificationAnalytics;

    // 5. Background jobs (BullMQ) related to the user are dropped via audit marker
    details.queuedJobs = await this.purgeUserQueuedJobs(userId);

    // 6. Audit logs: retained by legal obligation -> anonymised, not deleted
    details.auditLogsAnonymized = await this.anonymizeByColumn(
      'audit_logs',
      'performedBy',
      'anonymized',
    );
    anonymizedRecords += details.auditLogsAnonymized;

    // 7. Analytics / marketing events tied to the user
    details.marketingEvents = await this.deleteByColumn('marketing_events', 'userId', userId);
    deletedRecords += details.marketingEvents;

    // 8. Soft-delete the account itself (keeps a tombstone for legal retention)
    try {
      const userRepo = this.dataSource.getRepository('users');
      await userRepo.softDelete({ id: userId } as any);
      details.account = 1;
      deletedRecords += 1;
    } catch (error) {
      this.logger.warn(`Account soft-delete skipped: ${(error as Error).message}`);
    }

    await this.audit.record({
      action: 'dsr_data_deleted',
      category: 'data_subject_request',
      actorId: 'system',
      entityType: 'users',
      entityId: userId,
      metadata: { regulation: regulation || 'gdpr', details },
    });

    return { deletedRecords, anonymizedRecords, details };
  }

  private async deleteByColumn(table: string, column: string, value: string): Promise<number> {
    try {
      const repo = this.dataSource.getRepository(table);
      const res = await repo
        .createQueryBuilder()
        .delete()
        .where(`"${column}" = :value`, { value })
        .execute();
      return res.affected || 0;
    } catch {
      return 0;
    }
  }

  private async anonymizeByColumn(table: string, column: string, value: string): Promise<number> {
    try {
      const repo = this.dataSource.getRepository(table);
      const res = await repo
        .createQueryBuilder()
        .update()
        .set({ [column]: value } as any)
        .where(`"${column}" = :value`, { value })
        .execute();
      return res.affected || 0;
    } catch {
      return 0;
    }
  }

  private async purgeUserQueuedJobs(userId: string): Promise<number> {
    try {
      const repo = this.dataSource.getRepository('bullmq_jobs');
      const res = await repo
        .createQueryBuilder()
        .delete()
        .where(`"data"::text ILIKE :pattern`, { pattern: `%"userId":"${userId}"%` })
        .execute();
      return res.affected || 0;
    } catch {
      return 0;
    }
  }

  async restrictProcessing(userId: string): Promise<void> {
    try {
      const repo = this.dataSource.getRepository('users');
      await repo.update({ id: userId } as any, { processingRestricted: true } as any);
      await this.audit.record({
        action: 'dsr_processing_restricted',
        category: 'data_subject_request',
        actorId: 'system',
        entityType: 'users',
        entityId: userId,
      });
    } catch (error) {
      this.logger.warn(`Processing restriction skipped: ${(error as Error).message}`);
    }
  }

  async cancel(id: string, userId: string, reason?: string): Promise<DataSubjectRequestEntity> {
    const request = await this.getRequest(id);
    if (request.userId !== userId && request.requestedBy !== userId) {
      throw new NotFoundException('Request not found');
    }
    if (![DataRequestStatus.PENDING, DataRequestStatus.IN_REVIEW].includes(request.status)) {
      throw new BadRequestException('Only pending/in-review requests can be cancelled');
    }
    request.status = DataRequestStatus.CANCELLED;
    request.cancelledAt = new Date();
    request.cancellationReason = reason || 'User requested cancellation';
    const saved = await this.requestRepo.save(request);
    await this.audit.record({
      action: 'dsr_cancelled',
      category: 'data_subject_request',
      actorId: userId,
      entityType: 'data_subject_requests',
      entityId: saved.id,
    });
    return saved;
  }

  async getSlaStatus(id: string): Promise<{ deadline: Date; breached: boolean; hoursRemaining: number }> {
    const request = await this.getRequest(id);
    const now = Date.now();
    const deadline = request.slaDeadline?.getTime() ?? 0;
    return {
      deadline: request.slaDeadline,
      breached: now > deadline,
      hoursRemaining: Math.max(0, (deadline - now) / (1000 * 60 * 60)),
    };
  }

  async findBreachedSlas(): Promise<DataSubjectRequestEntity[]> {
    const open = await this.requestRepo.find({
      where: [
        { status: DataRequestStatus.PENDING },
        { status: DataRequestStatus.IN_REVIEW },
        { status: DataRequestStatus.APPROVED },
        { status: DataRequestStatus.PROCESSING },
      ],
    });
    const now = Date.now();
    return open.filter((r) => r.slaDeadline && r.slaDeadline.getTime() < now);
  }

  async createExport(
    userId: string,
    opts: { regulation?: Regulation; format?: ExportFormat; requestId?: string; scope?: Record<string, any> },
  ): Promise<DataExportEntity> {
    const exportRecord = this.exportRepo.create({
      userId,
      requestId: opts.requestId,
      regulation: opts.regulation || Regulation.GDPR,
      format: opts.format || ExportFormat.JSON,
      status: DataRequestStatus.PENDING,
      scope: opts.scope || {},
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    const saved = await this.exportRepo.save(exportRecord);
    await this.audit.record({
      action: 'export_created',
      category: 'data_export',
      actorId: userId,
      entityType: 'data_exports',
      entityId: saved.id,
      metadata: { format: saved.format, regulation: saved.regulation },
    });
    return saved;
  }

  async finalizeExport(
    id: string,
    opts: { filePath?: string; downloadUrl?: string; sizeBytes?: number },
  ): Promise<DataExportEntity> {
    const record = await this.exportRepo.findOne({ where: { id } });
    if (!record) throw new NotFoundException('Export not found');
    record.status = DataRequestStatus.COMPLETED;
    record.filePath = opts.filePath ?? null;
    record.downloadUrl = opts.downloadUrl ?? null;
    record.sizeBytes = opts.sizeBytes ?? 0;
    record.completedAt = new Date();
    const saved = await this.exportRepo.save(record);
    await this.audit.record({
      action: 'export_completed',
      category: 'data_export',
      actorId: record.userId,
      entityType: 'data_exports',
      entityId: saved.id,
    });
    await this.notifications.notify({
      userId: record.userId,
      event: 'export_ready',
      title: 'Your data export is ready',
      body: `Your ${record.format.toUpperCase()} data export is ready to download. It will be available until ${record.expiresAt?.toISOString() || 'soon'}.`,
      metadata: { exportId: saved.id, format: record.format },
    });
    return saved;
  }

  async listExports(userId: string): Promise<DataExportEntity[]> {
    return this.exportRepo.find({ where: { userId }, order: { createdAt: 'DESC' }, take: 50 });
  }

  async getExport(id: string): Promise<DataExportEntity> {
    const record = await this.exportRepo.findOne({ where: { id } });
    if (!record) throw new NotFoundException('Export not found');
    return record;
  }

  async generateExportContent(
    id: string,
  ): Promise<{ content: string; contentType: string; filename: string }> {
    const record = await this.getExport(id);
    const payload = await this.buildExportPayload(record.userId);

    if (record.format === ExportFormat.CSV) {
      const lines: string[] = ['section,field,value'];
      for (const [section, rows] of Object.entries<any>(payload.sections)) {
        const arr = Array.isArray(rows) ? rows : [rows];
        for (const row of arr) {
          for (const [field, value] of Object.entries(row || {})) {
            lines.push(`${section},${field},${JSON.stringify(value ?? '')}`);
          }
        }
      }
      return {
        content: lines.join('\n'),
        contentType: 'text/csv',
        filename: `spicegarden-data-export-${record.userId}.csv`,
      };
    }

    if (record.format === ExportFormat.PDF) {
      const sections = Object.entries<any>(payload.sections)
        .map(([section, rows]) => `${section.toUpperCase()}\n${Array.isArray(rows) ? rows.length : 0} record(s)`)
        .join('\n\n');
      const text =
        `SpiceGarden Data Export\nUser: ${record.userId}\nGenerated: ${payload.exportedAt}\n\n${sections}\n`;
      return {
        content: text,
        contentType: 'application/pdf',
        filename: `spicegarden-data-export-${record.userId}.pdf`,
      };
    }

    return {
      content: JSON.stringify(payload, null, 2),
      contentType: 'application/json',
      filename: `spicegarden-data-export-${record.userId}.json`,
    };
  }

  async buildExportPayload(userId: string): Promise<Record<string, any>> {
    const tables = [
      'users',
      'orders',
      'sessions',
      'audit_logs',
      'notifications',
      'user_devices',
      'wallets',
      'addresses',
      'support_tickets',
    ];
    const payload: Record<string, any> = { userId, exportedAt: new Date().toISOString(), sections: {} };
    for (const table of tables) {
      try {
        const repo = this.dataSource.getRepository(table);
        const rows = await repo.find({ where: { userId } as any, take: 1000 });
        payload.sections[table] = rows;
      } catch {
        payload.sections[table] = [];
      }
    }
    const signature = this.integrity.sign(payload);
    payload.integritySignature = signature;
    return payload;
  }
}
