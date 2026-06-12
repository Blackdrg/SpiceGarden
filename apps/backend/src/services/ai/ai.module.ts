import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalRepositoryModule } from '../../db/local-repository.module';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { OrderEntity } from '../../db/entities/order.entity';
import { MenuItemEntity } from '../../db/entities/menu-item.entity';

@Module({
  imports: [
    LocalRepositoryModule,
  ],
  providers: [AiService],
  controllers: [AiController],
  exports: [AiService],
})
export class AiServiceModule {}
