import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { DeliveryService } from './delivery.service';
import { DriverEntity } from '../../db/entities/driver.entity';
import { WalletEntity } from '../../db/entities/wallet.entity';
import { WalletTransactionEntity } from '../../db/entities/wallet-transaction.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { BatchEntity } from '../../db/entities/batch.entity';
import { DriverAssignmentEntity } from '../../db/entities/driver-assignment.entity';
import { DriverScoreEntity } from '../../db/entities/driver-score.entity';
import { DriverFraudEntity } from '../../db/entities/driver-fraud.entity';
import { GeoService } from '../../services/geo/geo.service';
import { DeliveryPricingModule } from './delivery-pricing.module';

@Module({
  imports: [
    DbRepositoriesModule,
    DeliveryPricingModule,
  ],
  providers: [DeliveryService, GeoService],
  controllers: [],
  exports: [DeliveryService, DeliveryPricingModule],
})
export class DeliveryServiceModule {}
