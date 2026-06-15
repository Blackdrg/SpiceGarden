import { UserEntity } from './user.entity';
export declare class NotificationPreferenceEntity {
    id: string;
    userId: string;
    user: UserEntity;
    pushOrders: boolean;
    pushPromotions: boolean;
    pushDeliveryUpdates: boolean;
    emailOrders: boolean;
    emailPromotions: boolean;
    smsDeliveryUpdates: boolean;
    createdAt: Date;
    updatedAt: Date;
}
