import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { NotificationEntity } from '../db/entities/notification.entity';
import { NotificationStatus } from '../db/entities/notification-status.enum';

import {
  LegalDocumentEntity,
  LegalVersionEntity,
  LegalAcceptanceEntity,
  CookieConsentEntity,
  ConsentLogEntity,
  DataSubjectRequestEntity,
  DataExportEntity,
  RetentionPolicyEntity,
  DataRetentionJobEntity,
  SecurityIncidentEntity,
  GrievanceEntity,
  AgreementEntity,
  AgreementAcceptanceEntity,
  ComplianceAuditEntity,
  CookieRegistryEntity,
} from './entities';

import { LegalIntegrityService } from './integrity.service';
import { ComplianceAuditService } from './compliance-audit.service';
import { LegalDocumentService } from './legal-document.service';
import { ConsentService } from './consent.service';
import { DataSubjectRequestService } from './data-subject-request.service';
import { RetentionService } from './retention.service';
import { AgreementService } from './agreement.service';
import { SecurityCenterService } from './security-center.service';
import { GrievanceService } from './grievance.service';
import { LegalSeedService } from './legal-seed.service';
import { LegalNotificationService } from './legal-notification.service';
import { LegalEncryptionService } from './legal-encryption.service';
import { DsrProcessorJob } from './dsr-processor-job.service';

import { LegalController } from './legal.controller';
import { PrivacyController } from './privacy.controller';
import { SecurityCenterController } from './security-center.controller';
import { AgreementController } from './agreement.controller';
import { ComplianceAdminController } from './compliance-admin.controller';
import { RetentionController } from './retention.controller';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      LegalDocumentEntity,
      LegalVersionEntity,
      LegalAcceptanceEntity,
      CookieConsentEntity,
      ConsentLogEntity,
      DataSubjectRequestEntity,
      DataExportEntity,
      RetentionPolicyEntity,
      DataRetentionJobEntity,
      SecurityIncidentEntity,
      GrievanceEntity,
      AgreementEntity,
      AgreementAcceptanceEntity,
      ComplianceAuditEntity,
      CookieRegistryEntity,
      NotificationEntity,
    ]),
  ],
  controllers: [
    LegalController,
    PrivacyController,
    SecurityCenterController,
    AgreementController,
    ComplianceAdminController,
    RetentionController,
  ],
  providers: [
    LegalIntegrityService,
    ComplianceAuditService,
    LegalDocumentService,
    ConsentService,
    DataSubjectRequestService,
    RetentionService,
    AgreementService,
    SecurityCenterService,
    GrievanceService,
    LegalSeedService,
    LegalNotificationService,
    LegalEncryptionService,
    DsrProcessorJob,
  ],
  exports: [
    LegalDocumentService,
    ConsentService,
    DataSubjectRequestService,
    RetentionService,
    AgreementService,
    SecurityCenterService,
    GrievanceService,
    ComplianceAuditService,
    LegalIntegrityService,
    LegalSeedService,
    DsrProcessorJob,
  ],
})
export class LegalModule {}
