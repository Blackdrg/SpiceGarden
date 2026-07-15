import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { DeliveryPricingService } from './delivery-pricing.service';
import { DeliveryPricingController } from './delivery-pricing.controller';
import { DeliveryPricingEntity } from '../../db/entities/delivery-pricing.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { AddressEntity } from '../../db/entities/address.entity';

@Module({
  imports: [DbRepositoriesModule],
  providers: [DeliveryPricingService],
  controllers: [DeliveryPricingController],
  exports: [DeliveryPricingService],
})
export class DeliveryPricingModule {}
