import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { MapsService } from './maps.service';
import { MapsController } from './maps.controller';
import { SurgeZoneEntity } from '../../db/entities/surge-zone.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';

@Module({
  imports: [DbRepositoriesModule],
  providers: [MapsService],
  controllers: [MapsController],
  exports: [MapsService],
})
export class MapsModule {}

