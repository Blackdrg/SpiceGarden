import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueService } from './queue.service';
import { OrderProcessor } from './order.processor';
import { OrderEntity } from '../../db/entities/order.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity])],
  providers: [QueueService, OrderProcessor],
  exports: [QueueService, OrderProcessor],
})
export class QueueModule {}
