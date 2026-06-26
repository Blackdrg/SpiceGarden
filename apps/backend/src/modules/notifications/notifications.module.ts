import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { NotificationService } from '../../services/notifications/notification.service';
import { UserDeviceEntity } from '../../db/entities/user-device.entity';

@Module({
  imports: [DbRepositoriesModule],
  controllers: [],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationsModule {}

