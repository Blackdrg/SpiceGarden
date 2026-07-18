import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import {
  DataSubjectRequestEntity,
  DataExportEntity,
} from './entities';
import {
  DataRequestType,
  DataRequestStatus,
} from './entities/legal.enums';
import { DataSubjectRequestService } from './data-subject-request.service';
import { ComplianceAuditService } from './compliance-audit.service';

@Injectable()
export class DsrProcessorJob {
  private readonly logger = new Logger(DsrProcessorJob.name);
  private readonly BATCH_SIZE = 50;

  constructor(
    @InjectRepository(DataSubjectRequestEntity)
    private readonly requestRepo: Repository<DataSubjectRequestEntity>,
    @InjectRepository(DataExportEntity)
    private readonly exportRepo: Repository<DataExportEntity>,
    private readonly dsrService: DataSubjectRequestService,
    private readonly audit: ComplianceAuditService,
  ) {}

  @Cron('0 4 * * *')
  async processPendingDsrs() {
    this.logger.log('Starting daily DSR processing job');
    try {
      const approved = await this.requestRepo.find({
        where: { status: DataRequestStatus.APPROVED },
        take: this.BATCH_SIZE,
        order: { slaDeadline: 'ASC' },
      });

      for (const request of approved) {
        try {
          await this.dsrService.startProcessing(request.id);
          await this.dsrService.complete(request.id);
          this.logger.log(`DSR ${request.id} processed (type: ${request.type}, user: ${request.userId})`);
        } catch (error) {
          this.logger.error(`Failed to process DSR ${request.id}: ${(error as Error).message}`);
          await this.audit.record({
            action: 'dsr_processing_failed',
            category: 'data_subject_request',
            actorId: 'system',
            entityType: 'data_subject_requests',
            entityId: request.id,
            metadata: { error: (error as Error).message },
          });
        }
      }

      await this.processPendingExports();
      await this.checkSlaBreaches();

      this.logger.log(`DSR processing job completed — ${approved.length} requests processed`);
    } catch (error) {
      this.logger.error('Daily DSR processing job failed', error);
    }
  }

  private async processPendingExports() {
    const pendingExports = await this.exportRepo.find({
      where: { status: DataRequestStatus.PENDING },
      take: this.BATCH_SIZE,
      order: { createdAt: 'ASC' },
    });

    for (const exportRecord of pendingExports) {
      try {
        const content = await this.dsrService.generateExportContent(exportRecord.id);
        await this.dsrService.finalizeExport(exportRecord.id, {
          filePath: `/tmp/exports/${exportRecord.id}.${exportRecord.format}`,
          downloadUrl: `/api/privacy/exports/${exportRecord.id}/download`,
          sizeBytes: Buffer.byteLength(content.content),
        });
        this.logger.log(`Export ${exportRecord.id} finalized for user ${exportRecord.userId}`);
      } catch (error) {
        this.logger.error(`Failed to finalize export ${exportRecord.id}: ${(error as Error).message}`);
      }
    }
  }

  private async checkSlaBreaches() {
    const breached = await this.dsrService.findBreachedSlas();
    for (const request of breached) {
      await this.audit.record({
        action: 'dsr_sla_breached',
        category: 'data_subject_request',
        actorId: 'system',
        entityType: 'data_subject_requests',
        entityId: request.id,
        metadata: { type: request.type, slaDeadline: request.slaDeadline?.toISOString() },
      });
      this.logger.warn(`DSR SLA breached for request ${request.id} (type: ${request.type})`);
    }
  }
}
