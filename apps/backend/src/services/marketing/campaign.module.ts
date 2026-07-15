import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { CampaignService } from './campaign.service';
import { CampaignController } from './campaign.controller';
import { CampaignEntity } from '../../db/entities/campaign.entity';
import { UserEntity } from '../../db/entities/user.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';

@Module({
  imports: [DbRepositoriesModule],
  providers: [CampaignService],
  controllers: [CampaignController],
  exports: [CampaignService],
})
export class CampaignModule {}
