import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { EnhancedDeliveryService } from './enhanced-delivery.service';
import { GeoModule } from '../geo/geo.module';

@Module({
  imports: [
    DbRepositoriesModule,
    GeoModule,
  ],
  providers: [EnhancedDeliveryService],
  exports: [EnhancedDeliveryService],
})
export class EnhancedDeliveryServiceModule {}