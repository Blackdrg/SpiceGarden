
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalRepositoryModule } from '../../db/local-repository.module';
import { NotificationService } from './notification.service';
import { ProductionNotificationService } from './production-notification.service';
import { UserDeviceEntity } from '../../db/entities/user-device.entity';
import { NotificationEntity } from '../../db/entities/notification.entity';
import { NotificationQueueModule } from './queue/notification-queue.module';
import { DeviceController } from './device.controller';

@Global()
@Module({
  imports: [
    LocalRepositoryModule,
    NotificationQueueModule,
  ],
  providers: [NotificationService, ProductionNotificationService],
  controllers: [DeviceController],
  exports: [NotificationService, ProductionNotificationService],
})
export class NotificationModule {}

