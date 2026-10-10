import { Module, Global } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { EncryptionService } from './encryption.service';
import { SecretLoaderService } from '../infra/secret-loader.service';
import { DbRepositoriesModule } from '../db/db-repositories.module';
import { AuditLogEntity } from '../db/entities/audit-log.entity';
import { SessionEntity } from '../db/entities/session.entity';
import { PermissionGuard } from './permission.guard';
import { RolesGuard } from './roles.guard';

const loadTestLimit = parseInt(process.env.LOAD_TEST_LIMIT || '1000000', 10);

@Global()
@Module({
  imports: [
    DbRepositoriesModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: process.env.LOAD_TEST_MODE === 'true' && process.env.NODE_ENV !== 'production' ? loadTestLimit : 10,
    }]),
  ],
  providers: [SecretLoaderService, EncryptionService, PermissionGuard, RolesGuard],
  exports: [EncryptionService, ThrottlerModule, PermissionGuard, RolesGuard],
})
export class SecurityModule {}
