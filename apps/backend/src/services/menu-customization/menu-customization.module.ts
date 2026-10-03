import { Module } from '@nestjs/common';
import { MenuCustomizationService } from './menu-customization.service';
import { MenuCustomizationController } from './menu-customization.controller';
import { DbRepositoriesModule } from '../../db/db-repositories.module';

@Module({
  imports: [DbRepositoriesModule],
  providers: [MenuCustomizationService],
  controllers: [MenuCustomizationController],
  exports: [MenuCustomizationService],
})
export class MenuCustomizationModule {}