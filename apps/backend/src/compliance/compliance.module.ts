import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalRepositoryModule } from '../db/local-repository.module';
import { ComplianceService } from './compliance.service';
import { UserEntity } from '../db/entities/user.entity';
import { SessionEntity } from '../db/entities/session.entity';
import { AuditLogEntity } from '../db/entities/audit-log.entity';
import { DeletionRequestEntity } from '../db/entities/deletion-request.entity';
import { DataExportRequestEntity } from '../db/entities/data-export-request.entity';
import { EncryptionService } from '../security/encryption.service';

@Module({
  imports: [LocalRepositoryModule],
  providers: [ComplianceService, EncryptionService],
  exports: [ComplianceService],
})
export class ComplianceModule {}