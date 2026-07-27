import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { NotificationEntity } from '../db/entities/notification.entity';
import { NotificationStatus } from '../db/entities/notification-status.enum';

import { LegalDocumentEntity } from './entities/legal-document.entity';
import { LegalVersionEntity } from './entities/legal-version.entity';
import { LegalAcceptanceEntity } from './entities/legal-acceptance.entity';
import { CookieConsentEntity } from './entities/cookie-consent.entity';
import { ConsentLogEntity } from './entities/consent-log.entity';
import { DataSubjectRequestEntity } from './entities/data-subject-request.entity';
import { DataExportEntity } from './entities/data-export.entity';
import { RetentionPolicyEntity } from './entities/retention-policy.entity';
import { DataRetentionJobEntity } from './entities/data-retention-job.entity';
import { SecurityIncidentEntity } from './entities/security-incident.entity';
import { GrievanceEntity } from './entities/grievance.entity';
import { AgreementEntity } from './entities/agreement.entity';
import { AgreementAcceptanceEntity } from './entities/agreement-acceptance.entity';
import { ComplianceAuditEntity } from './entities/compliance-audit.entity';
import { CookieRegistryEntity } from './entities/cookie-registry.entity';

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
