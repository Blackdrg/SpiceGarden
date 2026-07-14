import { Controller, Get, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { PermissionGuard } from '../../security/permission.guard';
import { Roles } from '../../security/roles.decorator';
import { Permissions } from '../../security/permissions.decorator';
import { UserRole } from '../../shared/domain/user.interface';
import { type Request } from 'express';
import { BanUserDto } from './admin.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('analytics:read')
  async getStats(@Query() query: any) {
    return this.adminService.getDashboardStats(query.branchId);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('analytics:read')
  async getFullStats(@Query() query: any) {
    return this.adminService.getDashboardStats(query.branchId);
  }

  @Get('orders')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('orders:manage')
  async getOrders(@Query('page') page: string, @Query('limit') limit: string) {
    return this.adminService.getAllOrders(Number(page) || 1, Number(limit) || 10);
  }

  @Post('users/ban')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('users:manage')
  async banUser(@Body() body: BanUserDto, @Req() req: Request & { user: { id: string; role: string } }) {
    return this.adminService.banUser(body.userId, body.reason);
  }
}
