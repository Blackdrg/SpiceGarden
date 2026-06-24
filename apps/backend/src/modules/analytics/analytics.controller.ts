import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { PermissionGuard } from '../../security/permission.guard';
import { Roles } from '../../security/roles.decorator';
import { Permissions } from '../../security/permissions.decorator';
import { UserRole } from '../../shared/domain/user.interface';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('top-dishes')
  @Roles(UserRole.RESTAURANT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('analytics:read')
  @ApiOperation({ summary: 'Get top selling dishes' })
  getTopDishes(@Query('restaurantId') restaurantId?: string, @Query('period') period = '30') {
    return this.analyticsService.getTopDishes(restaurantId, parseInt(period));
  }

  @Get('churn')
  @Roles(UserRole.RESTAURANT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('analytics:read')
  @ApiOperation({ summary: 'Get churn analysis' })
  getChurnAnalysis(@Query('restaurantId') restaurantId?: string, @Query('period') period = '90') {
    return this.analyticsService.getChurnAnalysis(restaurantId, parseInt(period));
  }

  @Get('repeat-users')
  @Roles(UserRole.RESTAURANT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('analytics:read')
  @ApiOperation({ summary: 'Get repeat user analytics' })
  getRepeatUsers(@Query('restaurantId') restaurantId?: string, @Query('period') period = '90') {
    return this.analyticsService.getRepeatUsers(restaurantId, parseInt(period));
  }

  @Get('conversion')
  @Roles(UserRole.RESTAURANT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('analytics:read')
  @ApiOperation({ summary: 'Get conversion funnel' })
  getConversion(@Query('restaurantId') restaurantId?: string, @Query('period') period = '30') {
    return this.analyticsService.getConversionRate(restaurantId, parseInt(period));
  }

  @Get('heatmap')
  @Roles(UserRole.RESTAURANT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('analytics:read')
  @ApiOperation({ summary: 'Get delivery heatmap' })
  getHeatmap(@Query('restaurantId') restaurantId?: string, @Query('period') period = '30') {
    return this.analyticsService.getDeliveryHeatmap(restaurantId, parseInt(period));
  }

  @Get('peak-hours')
  @Roles(UserRole.RESTAURANT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('analytics:read')
  @ApiOperation({ summary: 'Get peak hours analysis' })
  getPeakHours(@Query('restaurantId') restaurantId?: string, @Query('period') period = '30') {
    return this.analyticsService.getPeakHours(restaurantId, parseInt(period));
  }

  @Get('restaurant/:id')
  @Roles(UserRole.RESTAURANT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('analytics:read')
  @ApiOperation({ summary: 'Get full restaurant analytics' })
  getRestaurantAnalytics(@Param('id') id: string) {
    return this.analyticsService.getRestaurantAnalytics(id);
  }

  @Get('platform')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('analytics:read')
  @ApiOperation({ summary: 'Get platform-wide analytics' })
  getPlatformAnalytics() {
    return this.analyticsService.getPlatformAnalytics();
  }
}
