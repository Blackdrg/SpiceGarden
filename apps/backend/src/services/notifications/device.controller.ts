import { Controller, Post, Delete, Body, HttpCode, HttpStatus, UseGuards, Req, Request } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { Roles } from '../../security/roles.decorator';
import { PermissionGuard } from '../../security/permission.guard';
import { Permissions } from '../../security/permissions.decorator';
import { UserRole } from '../../shared/domain/user.interface';
import { DeviceInfoDto, RegisterDeviceDto, UnregisterDeviceDto, UpdateDeviceDto } from './device.dto';

@Controller('devices')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
@Permissions('orders:read_own')
export class DeviceController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('register')
  @Roles(UserRole.CUSTOMER, UserRole.DELIVERY_PARTNER, UserRole.RESTAURANT, UserRole.KITCHEN_STAFF)
  @HttpCode(HttpStatus.OK)
  async registerDevice(
    @Req() req: Request & { user: { userId?: string; sub?: string } },
    @Body() body: RegisterDeviceDto
  ) {
    const { fcmToken, apnsToken, deviceInfo } = body;
    const authenticatedUserId = req.user?.userId || req.user?.sub;
    const targetUserId = (authenticatedUserId || body.userId || 'anonymous') as string;

    if (fcmToken) {
      await this.notificationService.registerDevice(targetUserId, fcmToken, deviceInfo ?? {});
    }

    if (apnsToken) {
      await this.notificationService.registerDevice(targetUserId, apnsToken, { ...(deviceInfo || {}), type: 'ios' });
    }

    return { success: true, message: 'Device registered successfully' };
  }

  @Delete('unregister')
  @Roles(UserRole.CUSTOMER, UserRole.DELIVERY_PARTNER, UserRole.RESTAURANT, UserRole.KITCHEN_STAFF)
  @HttpCode(HttpStatus.OK)
  async unregisterDevice(
    @Req() req: Request & { user: { userId?: string; sub?: string; role?: string } },
    @Body() body: UnregisterDeviceDto
  ) {
    const authenticatedUserId = req.user?.userId || req.user?.sub;
    const targetUserId = authenticatedUserId;

    if (!targetUserId) {
      return { success: false, message: 'Authenticated user ID is required' };
    }

    const { fcmToken, apnsToken } = body;

    if (fcmToken) {
      await this.notificationService.unregisterDevice(targetUserId, fcmToken);
    }

    if (apnsToken) {
      await this.notificationService.unregisterDevice(targetUserId, apnsToken);
    }

    return { success: true, message: 'Device unregistered successfully' };
  }
}