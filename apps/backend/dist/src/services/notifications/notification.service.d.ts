import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { UserDeviceEntity } from '../../db/entities/user-device.entity';
export declare class NotificationService {
    private configService;
    private readonly userDeviceRepo;
    private readonly logger;
    constructor(configService: ConfigService, userDeviceRepo: Repository<UserDeviceEntity>);
    registerDevice(userId: string, fcmToken: string, deviceInfo: {
        name?: string;
        type?: string;
        userAgent?: string;
        ip?: string;
    }): unknown;
    unregisterDevice(userId: string, fcmToken: string): any;
    sendPush(userId: string, title: string, body: string, data?: any): unknown;
    sendSMS(phone: string, message: string): unknown;
    sendEmail(email: string, subject: string, template: string, context: any): unknown;
    notifyOrderUpdate(userId: string, orderId: string, status: string, phone?: string): any;
    sendOTP(phone: string, otp: string): unknown;
    sendAPNs(userId: string, title: string, body: string, data?: any): unknown;
    private generateJWT;
    notifyDeliveryLifecycle(orderId: string, event: 'driver_assigned' | 'picked_up' | 'nearby' | 'delivered', userId: string, driverInfo?: any): any;
    notifyRestaurant(orderId: string, alertType: 'new_order' | 'order_cancelled' | 'order_delayed', restaurantId: string): unknown;
    notifyDriver(driverId: string, orderId: string, event: 'assigned' | 'reassigned'): unknown;
}
