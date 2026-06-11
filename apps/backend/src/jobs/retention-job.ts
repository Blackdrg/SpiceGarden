import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource, LessThan } from 'typeorm';
import { ComplianceService } from '../compliance/compliance.service';
import { DataPrivacyService } from '../services/privacy/data-privacy.service';
import { DeletionRequestEntity } from '../db/entities/deletion-request.entity';

@Injectable()
export class RetentionJob {
  private readonly logger = new Logger(RetentionJob.name);

  constructor(
    private complianceService: ComplianceService,
    private dataPrivacyService: DataPrivacyService,
    private dataSource: DataSource,
  ) {}

  @Cron('0 3 * * *')
  async handleDailyRetention() {
    this.logger.log('Starting daily data retention job');
    try {
      await this.complianceService.applyDataRetentionPolicies();
      await this.autoProcessDeletionRequests();
      this.logger.log('Daily retention job completed');
    } catch (error) {
      this.logger.error('Daily retention job failed', error);
    }
  }

  private async autoProcessDeletionRequests() {
    const now = new Date();

    const deletionRepo = this.dataSource.getRepository(DeletionRequestEntity);
    const expiredDeletions = await deletionRepo.find({
      where: {
        status: 'pending',
        scheduledDeletionDate: LessThan(now),
      },
    });

    const updatePromises = expiredDeletions.map((request) =>
      deletionRepo.update(request.id, { status: 'approaching' }).then(() => {
        this.logger.log(`Deletion request ${request.id} approaching retention stage for user ${request.userId}`);
      }).catch((error) => {
        this.logger.error(`Failed to update deletion request ${request.id}: ${(error as Error).message}`);
      })
    );
    await Promise.all(updatePromises);
  }
}
