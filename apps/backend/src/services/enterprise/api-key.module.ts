import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { ApiKeyService } from './api-key.service';
import { ApiKeyController } from './api-key.controller';
import { ApiKeyEntity } from '../../db/entities/api-key.entity';
import { UserEntity } from '../../db/entities/user.entity';
import { TenantEntity } from '../../db/entities/tenant.entity';

@Module({
  imports: [DbRepositoriesModule],
  providers: [ApiKeyService],
  controllers: [ApiKeyController],
  exports: [ApiKeyService],
})
export class ApiKeyModule {}
