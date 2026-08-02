import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { OrderEntity } from '../../db/entities/order.entity';
import { MenuItemEntity } from '../../db/entities/menu-item.entity';
import { MetricsService } from '../../metrics/metrics.service';

@Module({
  imports: [
    DbRepositoriesModule,
  ],
  providers: [AiService, MetricsService],
  controllers: [AiController],
  exports: [AiService],
})
export class AiServiceModule {}
