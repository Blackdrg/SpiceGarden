import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { TrackingGateway } from './tracking.gateway';
import { NotificationEntity } from '../../db/entities/notification.entity';

@Global()
@Module({
  imports: [DbRepositoriesModule],
  providers: [TrackingGateway],
  exports: [TrackingGateway],
})
export class TrackingModule {}