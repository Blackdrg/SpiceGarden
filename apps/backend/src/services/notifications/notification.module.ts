
import { Global, Module } from '@nestjs/common';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { NotificationService } from './notification.service';
import { ProductionNotificationService } from './production-notification.service';
import { ProductionSMSProvider } from './production-sms.provider';
import { ProductionFCMProvider } from './production-fcm.provider';
import { ProductionAPNsProvider } from './production-apns.provider';
import { NotificationPreferencesService } from './notification-preferences.service';
import { NotificationEngineService } from './notification-engine.service';
import { NotificationQueueModule } from './queue/notification-queue.module';
import { DeviceController } from './device.controller';
import { NotificationPreferencesController } from './notification-preferences.controller';

@Global()
@Module({
  imports: [
    DbRepositoriesModule,
    NotificationQueueModule,
  ],
  providers: [
    NotificationService,
    ProductionNotificationService,
    ProductionSMSProvider,
    ProductionFCMProvider,
    ProductionAPNsProvider,
    NotificationPreferencesService,
    NotificationEngineService,
  ],
  controllers: [DeviceController, NotificationPreferencesController],
  exports: [
    NotificationService,
    ProductionNotificationService,
    ProductionSMSProvider,
    ProductionFCMProvider,
    ProductionAPNsProvider,
    NotificationPreferencesService,
    NotificationEngineService,
  ],
})
export class NotificationModule {}

