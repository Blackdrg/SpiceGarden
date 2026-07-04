import { Request } from '@nestjs/common';
import { NotificationService } from './notification.service';
export declare class DeviceController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    registerDevice(req: Request & {
        user: {
            userId?: string;
            sub?: string;
        };
    }, body: {
        userId?: string;
        fcmToken?: string;
        apnsToken?: string;
        deviceInfo?: {
            name?: string;
            type?: string;
            userAgent?: string;
            ip?: string;
        };
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    unregisterDevice(req: Request & {
        user: {
            userId?: string;
            sub?: string;
            role?: string;
        };
    }, body: {
        userId?: string;
        fcmToken?: string;
        apnsToken?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
