import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { OrderEntity } from '../../db/entities/order.entity';
import { OrderItemEntity } from '../../db/entities/order-item.entity';
import { MenuItemEntity } from '../../db/entities/menu-item.entity';
import { UserEntity } from '../../db/entities/user.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
import { AddressEntity } from '../../db/entities/address.entity';

@Module({
  imports: [
    DbRepositoriesModule,
  ],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
