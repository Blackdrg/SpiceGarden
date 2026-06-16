import { NotificationQueueService } from './notification-queue.service';
export declare class NotificationQueueController {
    private readonly notificationQueueService;
    constructor(notificationQueueService: NotificationQueueService);
    queueNotification(body: any): unknown;
    getNotificationById(id: string): unknown;
    getNotificationsByStatus(status?: string): unknown;
    getNotificationsForRecipient(recipientId: string, recipientType: string): unknown;
    cancelNotification(id: string): unknown;
    getNotificationStats(): unknown;
    processNotificationQueue(): unknown;
}
