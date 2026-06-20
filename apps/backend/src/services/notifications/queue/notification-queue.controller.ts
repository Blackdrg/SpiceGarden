
import { Controller, Post, Get, Param, Body, Request, Query, HttpCode, HttpStatus, NotFoundException, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { NotificationQueueService } from './notification-queue.service';
import { NotificationEntity } from '../../../db/entities/notification.entity';
import { NotificationStatus } from '../../../db/entities/notification-status.enum';
import { JwtAuthGuard } from '../../../security/jwt-auth.guard';
import { RolesGuard } from '../../../security/roles.guard';
import { PermissionGuard } from '../../../security/permission.guard';
import { Roles } from '../../../security/roles.decorator';
import { Permissions } from '../../../security/permissions.decorator';
import { UserRole } from '../../../shared/domain/user.interface';

@Controller('notification-queue')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Permissions('notifications:manage')
export class NotificationQueueController {
  constructor(private readonly notificationQueueService: NotificationQueueService) {}

  @Post('queue')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Queue a notification for reliable delivery' })
  @ApiResponse({ status: 200, description: 'Notification queued successfully' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        recipientId: { type: 'string' },
        recipientType: { type: 'string', enum: ['user', 'device', 'email', 'phone'] },
        notificationType: { type: 'string', enum: ['push', 'sms', 'email', 'apns'] },
        payload: { type: 'object' },
        provider: { type: 'string', enum: ['fcm', 'twilio', 'sendgrid', 'apns'] },
        maxAttempts: { type: 'number' },
        callbackUrl: { type: 'string' },
        metadata: { type: 'object' }
      },
      required: ['recipientId', 'recipientType', 'notificationType', 'payload', 'provider']
    }
  })
  async queueNotification(
    @Body() body: any
  ) {
    return await this.notificationQueueService.queueNotification(
      body.recipientId,
      body.recipientType,
      body.notificationType,
      body.payload,
      body.provider,
      {
        maxAttempts: body.maxAttempts,
        callbackUrl: body.callbackUrl,
        metadata: body.metadata
      }
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiResponse({ status: 200, description: 'Notification retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiParam({ name: 'id', type: 'string' })
  async getNotificationById(
    @Param('id') id: string
  ) {
    return await this.notificationQueueService.getNotificationById(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get notifications by status' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  @ApiQuery({ name: 'status', type: 'string', required: false })
  async getNotificationsByStatus(
    @Query('status') status?: string
  ) {
    if (status) {
      return await this.notificationQueueService.getNotificationsByStatus(status as NotificationStatus);
    }
    // Return all notifications if no status specified
    return await this.notificationQueueService.getNotificationsByStatus(null);
  }

  @Get('recipient/:recipientId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get notifications for a recipient' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  @ApiParam({ name: 'recipientId', type: 'string' })
  @ApiQuery({ name: 'recipientType', type: 'string', required: true })
  async getNotificationsForRecipient(
    @Param('recipientId') recipientId: string,
    @Query('recipientType') recipientType: string
  ) {
    return await this.notificationQueueService.getNotificationsForRecipient(
      recipientId,
      recipientType as 'user' | 'device' | 'email' | 'phone'
    );
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a notification' })
  @ApiResponse({ status: 200, description: 'Notification cancelled successfully' })
  @ApiParam({ name: 'id', type: 'string' })
  async cancelNotification(
    @Param('id') id: string
  ) {
    await this.notificationQueueService.cancelNotification(id);
    return { success: true };
  }

  @Get('stats/overview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get notification statistics' })
  @ApiResponse({ status: 200, description: 'Notification statistics retrieved successfully' })
  async getNotificationStats() {
    return await this.notificationQueueService.getNotificationStats();
  }

  @Post('process')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process the notification queue' })
  @ApiResponse({ status: 200, description: 'Notification queue processed successfully' })
  async processNotificationQueue() {
    await this.notificationQueueService.processNotificationQueue();
    return { success: true };
  }
}

