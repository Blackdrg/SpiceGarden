import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalRepositoryModule } from '../../../db/local-repository.module';
import { WebhookRetryQueueEntity } from '../../../db/entities/webhook-retry-queue.entity';
import { WebhookRetryService } from './webhook-retry.service';

@Module({
  imports: [LocalRepositoryModule],
  providers: [WebhookRetryService],
  exports: [WebhookRetryService],
})
export class WebhookRetryModule {}