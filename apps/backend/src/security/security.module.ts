import { Module, Global } from '@nestjs/common';
import { EncryptionService } from './encryption.service';
import { SecretLoaderService } from '../infra/secret-loader.service';
import { DbRepositoriesModule } from '../db/db-repositories.module';
import { AuditLogEntity } from '../db/entities/audit-log.entity';
import { SessionEntity } from '../db/entities/session.entity';
import { PermissionGuard } from './permission.guard';
import { RolesGuard } from './roles.guard';

@Global()
@Module({
  imports: [
    DbRepositoriesModule,
  ],
  providers: [SecretLoaderService, EncryptionService, PermissionGuard, RolesGuard],
  exports: [EncryptionService, PermissionGuard, RolesGuard],
})
export class SecurityModule {}
