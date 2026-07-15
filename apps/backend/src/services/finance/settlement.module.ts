import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { SettlementService } from './settlement.service';
import { SettlementController } from './settlement.controller';
import { SettlementReportEntity } from '../../db/entities/settlement-report.entity';
import { PayoutReportEntity } from '../../db/entities/payout-report.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';

@Module({
  imports: [DbRepositoriesModule],
  providers: [SettlementService],
  controllers: [SettlementController],
  exports: [SettlementService],
})
export class SettlementModule {}
