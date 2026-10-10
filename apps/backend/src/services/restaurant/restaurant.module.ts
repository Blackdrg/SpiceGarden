import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { RestaurantService } from './restaurant.service';
import { RestaurantController } from './restaurant.controller';
import { RestaurantOpsController } from './restaurant-ops.controller';
import { RestaurantOpsService } from './restaurant-ops.service';
import { MenuModerationService } from './menu-moderation.service';
import { PayoutService } from './payout.service';
import { BranchManagementService } from './branch-management.service';
import { CommissionService } from './commission.service';
import { RestaurantOnboardingService } from './onboarding.service';
import { RestaurantOnboardingController } from './onboarding.controller';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
import { MenuCategoryEntity } from '../../db/entities/menu-category.entity';
import { MenuItemEntity } from '../../db/entities/menu-item.entity';
import { InventoryItemEntity } from '../../db/entities/inventory-item.entity';
import { RestaurantOnboardingEntity } from '../../db/entities/restaurant-onboarding.entity';
import { MenuModerationEntity } from '../../db/entities/menu-moderation.entity';
import { PayoutReportEntity } from '../../db/entities/payout-report.entity';
import { CommissionRuleEntity } from '../../db/entities/commission-rule.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { GSTDetailEntity } from '../../db/entities/gst-detail.entity';
import { UserEntity } from '../../db/entities/user.entity';
import { KdsGateway } from './kds.gateway';

@Module({
imports: [
  DbRepositoriesModule,
],
providers: [
  RestaurantService,
  RestaurantOpsService,
  MenuModerationService,
  PayoutService,
  BranchManagementService,
   CommissionService,
   RestaurantOnboardingService
 ],
 controllers: [
   RestaurantController,
   RestaurantOpsController,
   RestaurantOnboardingController
 ],
 exports: [
   RestaurantService,
   RestaurantOpsService,
   MenuModerationService,
   PayoutService,
   BranchManagementService,
   CommissionService,
   RestaurantOnboardingService
 ],
})
export class RestaurantServiceModule {}
