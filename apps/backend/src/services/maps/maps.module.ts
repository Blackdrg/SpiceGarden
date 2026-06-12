import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalRepositoryModule } from '../../db/local-repository.module';
import { MapsService } from './maps.service';
import { MapsController } from './maps.controller';
import { SurgeZoneEntity } from '../../db/entities/surge-zone.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';

@Module({
  imports: [LocalRepositoryModule],
  providers: [MapsService],
  controllers: [MapsController],
  exports: [MapsService],
})
export class MapsModule {}

