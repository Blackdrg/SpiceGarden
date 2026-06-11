import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { BusinessEngineService, BusinessMetrics } from './business-engine.service';

@Controller('business')
export class BusinessEngineController {
  constructor(private readonly businessEngine: BusinessEngineService) {}

  @Get('metrics')
  async getMetrics(): Promise<BusinessMetrics> {
    return this.businessEngine.getBusinessMetrics();
  }

  @Get('restaurants')
  async getRestaurants() {
    return this.businessEngine.getActiveRestaurants();
  }

  @Get('restaurants/:id/menu')
  async getMenu(@Param('id') restaurantId: string) {
    return this.businessEngine.getRestaurantMenu(restaurantId);
  }

  @Get('drivers/live')
  async getLiveDrivers() {
    return this.businessEngine.getLiveDrivers();
  }

  @Post('drivers/:id/location')
  async updateDriverLocation(
    @Param('id') driverId: string,
    @Body() location: { lat: number; lng: number; heading?: number; speed?: number }
  ) {
    return this.businessEngine.registerDriverLocation(driverId, location);
  }

  @Post('drivers/:id/availability')
  async setDriverAvailability(
    @Param('id') driverId: string,
    @Body() body: { isAvailable: boolean }
  ) {
    return this.businessEngine.toggleDriverAvailability(driverId, body.isAvailable);
  }

  @Get('dashboard')
  async getDashboard() {
    return this.businessEngine.getRealtimeDashboard();
  }

  @Get('uptime')
  async getUptime() {
    return this.businessEngine.getSystemUptime();
  }
}