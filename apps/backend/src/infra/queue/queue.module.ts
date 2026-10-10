import { Module, Global } from '@nestjs/common';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

import { QueueService } from './queue.service';
import { OrderProcessor } from './order.processor';

@Global()
@Module({
  imports: [DbRepositoriesModule],
  providers: [QueueService, OrderProcessor],
  exports: [QueueService, OrderProcessor],
})
export class QueueModule {}
