import { Controller, Get, UseGuards } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { RolesGuard } from '../security/roles.guard';
import { PermissionGuard } from '../security/permission.guard';
import { Roles } from '../security/roles.decorator';
import { Permissions } from '../security/permissions.decorator';
import { UserRole } from '../shared/domain/user.interface';

@Controller('metrics')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('analytics:read')
  async getMetrics() {
    return this.metricsService.getMetrics();
  }
}