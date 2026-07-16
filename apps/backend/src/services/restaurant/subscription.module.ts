import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionPlanEntity } from '../../db/entities/subscription-plan.entity';
import { RestaurantSubscriptionEntity } from '../../db/entities/restaurant-subscription.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { CommissionRuleEntity } from '../../db/entities/commission-rule.entity';
import { PaymentServiceModule } from '../payments/payments.module';

@Module({
  imports: [DbRepositoriesModule, PaymentServiceModule],
  providers: [SubscriptionService],
  controllers: [SubscriptionController],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
