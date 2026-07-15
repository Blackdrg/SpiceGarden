import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { CustomerSubscriptionService } from './customer-subscription.service';
import { CustomerSubscriptionController } from './customer-subscription.controller';
import { CustomerSubscriptionEntity } from '../../db/entities/customer-subscription.entity';
import { SubscriptionPlanEntity } from '../../db/entities/subscription-plan.entity';
import { UserEntity } from '../../db/entities/user.entity';
import { WalletEntity } from '../../db/entities/wallet.entity';
import { WalletTransactionEntity } from '../../db/entities/wallet-transaction.entity';
import { OrderEntity } from '../../db/entities/order.entity';

@Module({
  imports: [DbRepositoriesModule],
  providers: [CustomerSubscriptionService],
  controllers: [CustomerSubscriptionController],
  exports: [CustomerSubscriptionService],
})
export class CustomerSubscriptionModule {}
