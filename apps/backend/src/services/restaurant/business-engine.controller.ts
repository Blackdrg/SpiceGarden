import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { BusinessEngineService, BusinessMetrics } from './business-engine.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { PermissionGuard } from '../../security/permission.guard';
import { Roles } from '../../security/roles.decorator';
import { Permissions } from '../../security/permissions.decorator';
import { UserRole } from '../../shared/domain/user.interface';
import { SetDriverAvailabilityDto, UpdateDriverLocationDto } from './business-engine.dto';

@Controller('business')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
export class BusinessEngineController {
  constructor(private readonly businessEngine: BusinessEngineService) {}

  @Get('metrics')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('analytics:read')
  async getMetrics(): Promise<BusinessMetrics> {
    return this.businessEngine.getBusinessMetrics();
  }

  @Get('restaurants')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.RESTAURANT)
  @Permissions('restaurants:manage_own')
  async getRestaurants() {
    return this.businessEngine.getActiveRestaurants();
  }

  @Get('restaurants/:id/menu')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.RESTAURANT, UserRole.CUSTOMER)
  @Permissions('orders:read_own')
  async getMenu(@Param('id') restaurantId: string) {
    return this.businessEngine.getRestaurantMenu(restaurantId);
  }

  @Get('drivers/live')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('deliveries:manage_assigned')
  async getLiveDrivers() {
    return this.businessEngine.getLiveDrivers();
  }

  @Post('drivers/:id/location')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('deliveries:manage_assigned')
  async updateDriverLocation(
    @Param('id') driverId: string,
    @Body() location: UpdateDriverLocationDto
  ) {
    return this.businessEngine.registerDriverLocation(driverId, location);
  }

  @Post('drivers/:id/availability')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('deliveries:manage_assigned')
  async setDriverAvailability(
    @Param('id') driverId: string,
    @Body() body: SetDriverAvailabilityDto
  ) {
    return this.businessEngine.toggleDriverAvailability(driverId, body.isAvailable);
  }

  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('analytics:read')
  async getDashboard() {
    return this.businessEngine.getRealtimeDashboard();
  }

  @Get('uptime')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('analytics:read')
  async getUptime() {
    return this.businessEngine.getSystemUptime();
  }
}