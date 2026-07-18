import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../db/db-repositories.module';
import { ConfigModule } from '@nestjs/config';

import { ComplianceService } from './compliance.service';
import { ComplianceController } from './compliance.controller';
import { Soc2ReadinessService } from './soc2-readiness.service';
import { PciDssValidationService } from './pci-dss-validation.service';
import { SecretsRotationService } from './secrets-rotation.service';
import { DataPrivacyService } from '../services/privacy/data-privacy.service';
import { PaymentFraudFlagEntity } from '../services/payments/payment-fraud.entity';

@Module({
  imports: [DbRepositoriesModule, ConfigModule, TypeOrmModule.forFeature([PaymentFraudFlagEntity])],
  providers: [ComplianceService, Soc2ReadinessService, PciDssValidationService, SecretsRotationService, DataPrivacyService],
  controllers: [ComplianceController],
  exports: [ComplianceService, DataPrivacyService],
})
export class ComplianceModule {}