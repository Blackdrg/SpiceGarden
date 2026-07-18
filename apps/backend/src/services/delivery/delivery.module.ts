import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { DeliveryService } from './delivery.service';
import { DeliveryPricingModule } from './delivery-pricing.module';
import { GeoModule } from '../geo/geo.module';

@Module({
  imports: [
    DbRepositoriesModule,
    DeliveryPricingModule,
    GeoModule,
  ],
  providers: [DeliveryService],
  controllers: [],
  exports: [DeliveryService, DeliveryPricingModule],
})
export class DeliveryServiceModule {}
