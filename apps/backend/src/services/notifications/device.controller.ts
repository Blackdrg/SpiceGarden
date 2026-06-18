import { Controller, Post, Delete, Body, HttpCode, HttpStatus, UseGuards, Req, Request } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { Roles } from '../../security/roles.decorator';
import { UserRole } from '../../shared/domain/user.interface';

@Controller('devices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeviceController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('register')
  @Roles(UserRole.CUSTOMER, UserRole.DELIVERY_PARTNER, UserRole.RESTAURANT, UserRole.KITCHEN_STAFF)
  @HttpCode(HttpStatus.OK)
  async registerDevice(
    @Req() req: Request & { user: { userId?: string; sub?: string } },
    @Body() body: { userId?: string; fcmToken?: string; apnsToken?: string; deviceInfo?: { name?: string; type?: string; userAgent?: string; ip?: string } }
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
    @Body() body: { userId?: string; fcmToken?: string; apnsToken?: string }
  ) {
    const authenticatedUserId = req.user?.userId || req.user?.sub;
    const targetUserId = (authenticatedUserId || body.userId || 'anonymous') as string;

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