import { NotificationPreferencesService } from './notification-preferences.service';
export declare class NotificationPreferencesController {
    private readonly prefsService;
    constructor(prefsService: NotificationPreferencesService);
    getPreferences(req: any): Promise<import("../../db/entities/notification-preference.entity").NotificationPreferenceEntity>;
    updatePreferences(req: any, updates: any): Promise<import("../../db/entities/notification-preference.entity").NotificationPreferenceEntity>;
}
