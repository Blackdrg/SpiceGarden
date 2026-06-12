
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalRepositoryModule } from '../../../db/local-repository.module';
import { NotificationQueueService } from './notification-queue.service';
import { NotificationQueueController } from './notification-queue.controller';
import { NotificationEntity } from '../../../db/entities/notification.entity';
import { NotificationModule } from '../notification.module';

@Module({
  imports: [
    LocalRepositoryModule,
    forwardRef(() => NotificationModule),
  ],
  providers: [NotificationQueueService],
  controllers: [NotificationQueueController],
  exports: [NotificationQueueService]
})
export class NotificationQueueModule {}

