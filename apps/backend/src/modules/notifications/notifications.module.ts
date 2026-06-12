import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalRepositoryModule } from '../../db/local-repository.module';
import { NotificationService } from '../../services/notifications/notification.service';
import { UserDeviceEntity } from '../../db/entities/user-device.entity';

@Module({
  imports: [LocalRepositoryModule],
  controllers: [],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationsModule {}

