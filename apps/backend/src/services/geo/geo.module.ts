import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
import { DriverEntity } from '../../db/entities/driver.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { EnhancedGeoService } from './enhanced-geo.service';

@Module({
  imports: [DbRepositoriesModule],
  providers: [EnhancedGeoService],
  exports: [EnhancedGeoService],
})
export class GeoModule {}