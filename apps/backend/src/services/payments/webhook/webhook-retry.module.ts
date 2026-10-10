import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbRepositoriesModule } from '../../../db/db-repositories.module';

import { WebhookRetryQueueEntity } from '../../../db/entities/webhook-retry-queue.entity';
import { WebhookRetryService } from './webhook-retry.service';

@Module({
  imports: [DbRepositoriesModule],
  providers: [WebhookRetryService],
  exports: [WebhookRetryService],
})
export class WebhookRetryModule {}