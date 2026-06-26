
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../../db/db-repositories.module';

import { ChargebackService } from './chargeback.service';
import { ChargebackController } from './chargeback.controller';
import { PaymentDisputeEntity } from '../../../db/entities/payment-dispute.entity';
import { OrderEntity } from '../../../db/entities/order.entity';
import { UserEntity } from '../../../db/entities/user.entity';
import { NotificationModule } from '../../notifications/notification.module';

@Module({
  imports: [
    DbRepositoriesModule,
    NotificationModule,
  ],
  providers: [ChargebackService],
  controllers: [ChargebackController],
  exports: [ChargebackService]
})
export class ChargebackModule {}

