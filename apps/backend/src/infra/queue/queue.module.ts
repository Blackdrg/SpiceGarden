import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalRepositoryModule } from '../../db/local-repository.module';
import { QueueService } from './queue.service';
import { OrderProcessor } from './order.processor';
import { OrderEntity } from '../../db/entities/order.entity';

const localSqlite = process.env.LOCAL_DB === 'sqlite' || (!process.env.DB_HOST && process.env.NODE_ENV !== 'production');

@Global()
@Module({
  imports: [localSqlite ? LocalRepositoryModule : TypeOrmModule.forFeature([OrderEntity])],
  providers: [QueueService, OrderProcessor],
  exports: [QueueService, OrderProcessor],
})
export class QueueModule {}
