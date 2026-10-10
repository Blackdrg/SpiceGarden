import { Module } from '@nestjs/common';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { MapsService } from './maps.service';
import { ProductionMapsService } from './production-maps.service';
import { MapsController } from './maps.controller';

@Module({
  imports: [DbRepositoriesModule],
  providers: [MapsService, ProductionMapsService],
  controllers: [MapsController],
  exports: [MapsService, ProductionMapsService],
})
export class MapsModule {}

