import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalRepositoryModule } from '../../db/local-repository.module';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { MenuItemEntity } from '../../db/entities/menu-item.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';

@Module({
  imports: [LocalRepositoryModule],
  providers: [SearchService],
  controllers: [SearchController],
  exports: [SearchService],
})
export class SearchServiceModule {}
