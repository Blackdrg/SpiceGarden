import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalRepositoryModule } from '../../db/local-repository.module';
import { MenuCustomizationService } from './menu-customization.service';
import { MenuCustomizationController } from './menu-customization.controller';
import { MenuItemEntity } from '../../db/entities/menu-item.entity';
import { MenuCategoryEntity } from '../../db/entities/menu-category.entity';
import { MenuAddonEntity } from '../../db/entities/menu-addon.entity';

@Module({
  imports: [LocalRepositoryModule],
  providers: [MenuCustomizationService],
  controllers: [MenuCustomizationController],
  exports: [MenuCustomizationService],
})
export class MenuCustomizationModule {}