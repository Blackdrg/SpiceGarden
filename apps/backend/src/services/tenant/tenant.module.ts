import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { TenantEntity } from '../../db/entities/tenant.entity';
import { UserEntity } from '../../db/entities/user.entity';
import { SubscriptionPlanEntity } from '../../db/entities/subscription-plan.entity';

@Module({
  imports: [DbRepositoriesModule],
  providers: [TenantService],
  controllers: [TenantController],
  exports: [TenantService],
})
export class TenantModule {}
