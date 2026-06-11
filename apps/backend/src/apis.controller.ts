import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApisService } from './apis.service';

@Controller('apis')
export class ApisController {
  constructor(private readonly apisService: ApisService) {}

  @Get()
  async getApis(@Query('restaurantId') restaurantId?: string) {
    const menuId = restaurantId ?? 'default-menu';
    return this.apisService.getMenu(menuId);
  }

  @Get(':menuId')
  async getApisById(@Param('menuId') menuId: string) {
    return this.apisService.getMenu(menuId);
  }
}
