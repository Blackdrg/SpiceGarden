import { Repository } from 'typeorm';
import { NotificationPreferenceEntity } from '../../db/entities/notification-preference.entity';
export declare class NotificationPreferencesService {
    private readonly prefRepo;
    constructor(prefRepo: Repository<NotificationPreferenceEntity>);
    getPreferences(userId: string): Promise<any>;
    updatePreferences(userId: string, updates: Partial<NotificationPreferenceEntity>): Promise<any>;
    shouldSendPush(userId: string, category: 'orders' | 'promotions' | 'deliveryUpdates'): Promise<any>;
}
