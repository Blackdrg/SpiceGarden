import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { NotificationEntity } from '../db/entities/notification.entity';
import { NotificationStatus } from '../db/entities/notification-status.enum';

export type LegalNotificationEvent =
  | 'policy_updated'
  | 'consent_required'
  | 'agreement_expires'
  | 'privacy_request_completed'
  | 'export_ready'
  | 'deletion_completed'
  | 'security_incident'
  | 'request_approved'
  | 'request_rejected';

export interface LegalNotificationInput {
  userId: string;
  event: LegalNotificationEvent;
  title: string;
  body: string;
  metadata?: Record<string, any>;
}

/**
 * Emits user-facing in-app notifications for legal/compliance lifecycle events.
 * Falls back gracefully: if the notifications table is unavailable the event is
 * logged and dropped (no privacy request should ever fail because of a
 * notification delivery problem).
 */
@Injectable()
export class LegalNotificationService {
  private readonly logger = new Logger(LegalNotificationService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
  ) {}

  async notify(input: LegalNotificationInput): Promise<void> {
    try {
      const record = this.notificationRepo.create({
        recipientId: input.userId,
        recipientType: 'user',
        notificationType: 'push',
        provider: 'apns',
        status: NotificationStatus.PENDING,
        payload: {
          title: input.title,
          body: input.body,
          type: input.event,
          data: input.metadata || {},
        },
        metadata: { source: 'legal', event: input.event },
      } as any);
      await this.notificationRepo.save(record);
      this.logger.log(`Legal notification ${input.event} queued for user ${input.userId}`);
    } catch (error) {
      this.logger.error(`Failed to persist legal notification ${input.event}`, error as Error);
    }
  }

  async notifyMany(event: LegalNotificationEvent, title: string, body: string, userIds: string[]): Promise<void> {
    await Promise.all(userIds.map((userId) => this.notify({ userId, event, title, body })));
  }
}
