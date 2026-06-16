import { NotificationService } from './notification.service';
export declare class DeviceController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    registerDevice(body: {
        userId: string;
        fcmToken?: string;
        apnsToken?: string;
        deviceInfo?: {
            name?: string;
            type?: string;
            userAgent?: string;
            ip?: string;
        };
    }): unknown;
    unregisterDevice(body: {
        userId: string;
        fcmToken?: string;
        apnsToken?: string;
    }): unknown;
}
