
import { Injectable, InternalServerErrorException, Logger, NotFoundException, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual, IsNull } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { NotificationEntity } from '../../../db/entities/notification.entity';
import { NotificationStatus } from '../../../db/entities/notification-status.enum';
import { NotificationService } from '../notification.service';
import { QueueService } from '../../../infra/queue/queue.service';

@Injectable()
export class NotificationQueueService {
  private readonly logger = new Logger(NotificationQueueService.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationService,
    private readonly queueService: QueueService,
  ) {}

  /**
   * Queue a notification for reliable delivery
   */
  async queueNotification(
    recipientId: string,
    recipientType: 'user' | 'device' | 'email' | 'phone',
    notificationType: 'push' | 'sms' | 'email' | 'apns',
    payload: any,
    provider: 'fcm' | 'twilio' | 'sendgrid' | 'apns',
    options: {
      maxAttempts?: number;
      callbackUrl?: string;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<NotificationEntity> {
    const notification = this.notificationRepo.create({
      recipientId,
      recipientType,
      notificationType,
      payload,
      provider,
      status: NotificationStatus.PENDING,
      maxAttempts: options.maxAttempts || 3,
      callbackUrl: options.callbackUrl,
      metadata: options.metadata || {},
    });

    const savedNotification = await this.notificationRepo.save(notification);
    
    // Process the queue
    await this.processNotificationQueue();
    
    return savedNotification;
  }

  /**
   * Process the notification queue
   */
  async processNotificationQueue(): Promise<void> {
    // Get pending notifications that are ready to be processed
    const notifications = await this.notificationRepo.find({
      where: [
        { status: NotificationStatus.PENDING },
        { status: NotificationStatus.RETRYING, nextAttemptAt: LessThanOrEqual(new Date()) }
      ],
      order: { createdAt: 'ASC' },
      take: 10 // Process in batches
    });

for (const notification of notifications) {
      try {
        await this.processNotification(notification);
    } catch (error: any) {
        this.logger.error(`Failed to process notification ${notification.id}:`, error);
      }
    }
  }

  /**
   * Process a single notification
   */
  async processNotification(notification: NotificationEntity): Promise<void> {
    // Mark as processing
    notification.status = NotificationStatus.PROCESSING;
    notification.lastAttemptAt = new Date();
    notification.attemptCount += 1;
    
    await this.notificationRepo.save(notification);

    try {
      let result: any;
      
      // Send notification based on type and provider
      switch (notification.notificationType) {
        case 'push':
          if (notification.provider === 'fcm') {
            result = await this.notificationService.sendPush(
              notification.recipientId,
              notification.payload.title,
              notification.payload.body,
              notification.payload.data
            );
          } else if (notification.provider === 'apns') {
            result = await this.notificationService.sendAPNs(
              notification.recipientId,
              notification.payload.title,
              notification.payload.body,
              notification.payload.data
            );
          }
          break;
          
        case 'sms':
          if (notification.provider === 'twilio') {
            result = await this.notificationService.sendSMS(
              notification.recipientId,
              notification.payload.body
            );
          }
          break;
          
        case 'email':
          if (notification.provider === 'sendgrid') {
            result = await this.notificationService.sendEmail(
              notification.recipientId,
              notification.payload.subject,
              notification.payload.template,
              notification.payload.context
            );
          }
          break;
      }

      // Check if successful
      if (result?.success) {
        notification.status = NotificationStatus.SENT;
        notification.completedAt = new Date();
        
        // Call callback URL if provided
        if (notification.callbackUrl) {
          await this.queueService.enqueue('NOTIFICATION_CALLBACK', {
            notificationId: notification.id,
            status: 'sent',
            url: notification.callbackUrl,
            data: { result }
          });
        }
      } else {
        throw new InternalServerErrorException(result?.error || 'Notification delivery failed');
      }
    } catch (error: any) {
      notification.errorInfo = {
        message: error?.message || 'any error',
        code: error?.code || 'UNKNOWN_ERROR',
        providerResponse: error?.response || null
      };

      // Check if we should retry
      if (notification.attemptCount < (notification.maxAttempts || 3)) {
        notification.status = NotificationStatus.RETRYING;
        // Exponential backoff: 1 minute, 2 minutes, 4 minutes, etc.
        const delayMinutes = Math.pow(2, notification.attemptCount - 1);
        notification.nextAttemptAt = new Date(Date.now() + (delayMinutes * 60 * 1000));
      } else {
        notification.status = NotificationStatus.FAILED;
        notification.completedAt = new Date();
        
        // Call callback URL if provided for failed notifications
        if (notification.callbackUrl) {
          await this.queueService.enqueue('NOTIFICATION_CALLBACK', {
            notificationId: notification.id,
            status: 'failed',
            url: notification.callbackUrl,
            data: { error: notification.errorInfo }
          });
        }
      }
    } finally {
      await this.notificationRepo.save(notification);
    }
  }

  /**
   * Get notification by ID
   */
async getNotificationById(id: string): Promise<NotificationEntity> {
    const notification = await this.notificationRepo.findOne({ where: { id } });
    if (!notification) {
      throw new NotFoundException(`Notification ${id} not found`);
    }
    return notification;
  }

  /**
   * Get notifications by status
   */
  async getNotificationsByStatus(status: NotificationStatus | null): Promise<NotificationEntity[]> {
    return await this.notificationRepo.find({
      where: status ? { status } : {},
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Get notifications for a recipient
   */
  async getNotificationsForRecipient(
    recipientId: string,
    recipientType: 'user' | 'device' | 'email' | 'phone'
  ): Promise<NotificationEntity[]> {
    return await this.notificationRepo.find({
      where: { recipientId, recipientType },
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Cancel a notification
   */
async cancelNotification(id: string): Promise<void> {
    const notification = await this.notificationRepo.findOne({ where: { id } });
    if (!notification) {
      throw new NotFoundException(`Notification ${id} not found`);
    }
    
    notification.status = NotificationStatus.CANCELLED;
    notification.completedAt = new Date();
    await this.notificationRepo.save(notification);
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(): Promise<any> {
    const [pending, processing, sent, failed, retrying, cancelled] = await Promise.all([
      this.notificationRepo.count({ where: { status: NotificationStatus.PENDING } }),
      this.notificationRepo.count({ where: { status: NotificationStatus.PROCESSING } }),
      this.notificationRepo.count({ where: { status: NotificationStatus.SENT } }),
      this.notificationRepo.count({ where: { status: NotificationStatus.FAILED } }),
      this.notificationRepo.count({ where: { status: NotificationStatus.RETRYING } }),
      this.notificationRepo.count({ where: { status: NotificationStatus.CANCELLED } }),
    ]);

    const total = pending + processing + sent + failed + retrying + cancelled;
    
    return {
      total,
      pending,
      processing,
      sent,
      failed,
      retrying,
      cancelled,
      successRate: total > 0 ? (sent / total) * 100 : 0,
      failureRate: total > 0 ? (failed / total) * 100 : 0
    };
  }
}

