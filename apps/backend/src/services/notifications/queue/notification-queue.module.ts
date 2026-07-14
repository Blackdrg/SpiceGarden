
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../../db/db-repositories.module';

import { NotificationQueueService } from './notification-queue.service';
import { NotificationQueueController } from './notification-queue.controller';
import { NotificationEntity } from '../../../db/entities/notification.entity';

@Module({
  imports: [
    DbRepositoriesModule,
  ],
  providers: [NotificationQueueService],
  controllers: [NotificationQueueController],
  exports: [NotificationQueueService]
})
export class NotificationQueueModule {}

