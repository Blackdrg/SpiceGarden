import { NotificationPreferencesService } from './notification-preferences.service';
export declare class NotificationPreferencesController {
    private readonly prefsService;
    constructor(prefsService: NotificationPreferencesService);
    getPreferences(req: any): Promise<any>;
    updatePreferences(req: any, updates: any): Promise<any>;
}
