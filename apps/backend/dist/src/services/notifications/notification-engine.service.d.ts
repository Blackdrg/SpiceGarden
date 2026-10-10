import { ProductionSMSProvider } from './production-sms.provider';
import { ProductionFCMProvider } from './production-fcm.provider';
import { ProductionAPNsProvider } from './production-apns.provider';
import { NotificationPreferencesService } from './notification-preferences.service';
export interface NotificationRequest {
    userId: string;
    tenantId?: string;
    type: 'order_status' | 'delivery_tracking' | 'payment_receipt' | 'promo' | 'security_alert';
    channels: ('sms' | 'push' | 'email' | 'in_app')[];
    title: string;
    body: string;
    templateKey?: string;
    templateData?: Record<string, any>;
    phone?: string;
    email?: string;
    deviceTokens?: {
        fcm?: string[];
        apns?: string[];
    };
    idempotencyKey?: string;
}
export interface DeliveryMetric {
    totalRequested: number;
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    totalDeduplicated: number;
    totalRateLimited: number;
    byChannel: {
        sms: {
            sent: number;
            failed: number;
        };
        push: {
            sent: number;
            failed: number;
        };
        email: {
            sent: number;
            failed: number;
        };
    };
}
export declare class NotificationEngineService {
    private smsProvider;
    private fcmProvider;
    private apnsProvider;
    private preferencesService;
    private readonly logger;
    private rateLimitWindow;
    private deduplicationCache;
    private dlq;
    private metrics;
    private templates;
    constructor(smsProvider: ProductionSMSProvider, fcmProvider: ProductionFCMProvider, apnsProvider: ProductionAPNsProvider, preferencesService: NotificationPreferencesService);
    validateTemplate(templateKey: string, data?: Record<string, any>): {
        isValid: boolean;
        missingVars: string[];
    };
    checkRateLimit(key: string, limit?: number, windowMs?: number): boolean;
    checkDuplicate(dedupKey: string, windowMs?: number): any | null;
    dispatch(req: NotificationRequest): Promise<{
        success: boolean;
        channelResults: any;
        deduplicated?: boolean;
    }>;
    private executeWithRetry;
    getMetrics(): DeliveryMetric & {
        dlqCount: number;
    };
}
