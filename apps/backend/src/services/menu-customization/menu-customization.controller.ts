import { Controller, Get, Param, Query } from '@nestjs/common';
import { MenuCustomizationService } from './menu-customization.service';

@Controller('menus')
export class MenuCustomizationController {
  constructor(private readonly menuService: MenuCustomizationService) {}

  @Get(':restaurantId/items')
  async getMenuItems(
    @Param('restaurantId') restaurantId: string,
    @Query('category') category?: string,
  ) {
    return this.menuService.getMenuItems(restaurantId, category);
  }

  @Get('items/:itemId')
  async getItemDetails(@Param('itemId') itemId: string) {
    return this.menuService.getItemDetails(itemId);
  }

  @Get('items/:itemId/addons')
  async getItemAddons(@Param('itemId') itemId: string) {
    return this.menuService.getItemAddons(itemId);
  }

  @Get('categories/:restaurantId')
  async getCategories(@Param('restaurantId') restaurantId: string) {
    return this.menuService.getCategories(restaurantId);
  }
}