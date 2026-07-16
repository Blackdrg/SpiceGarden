
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { NotificationService } from './notification.service';
import { ProductionNotificationService } from './production-notification.service';
import { NotificationPreferencesService } from './notification-preferences.service';
import { NotificationPreferencesController } from './notification-preferences.controller';
import { UserDeviceEntity } from '../../db/entities/user-device.entity';
import { NotificationEntity } from '../../db/entities/notification.entity';
import { NotificationQueueModule } from './queue/notification-queue.module';
import { DeviceController } from './device.controller';

@Global()
@Module({
  imports: [
    DbRepositoriesModule,
    NotificationQueueModule,
  ],
  providers: [NotificationService, ProductionNotificationService, NotificationPreferencesService],
  controllers: [DeviceController, NotificationPreferencesController],
  exports: [NotificationService, ProductionNotificationService],
})
export class NotificationModule {}

