import { Injectable, Logger } from '@nestjs/common';
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
  deviceTokens?: { fcm?: string[]; apns?: string[] };
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
    sms: { sent: number; failed: number };
    push: { sent: number; failed: number };
    email: { sent: number; failed: number };
  };
}

@Injectable()
export class NotificationEngineService {
  private readonly logger = new Logger(NotificationEngineService.name);

  // In-memory sliding window rate limiter & deduplication cache (Production backed by Redis)
  private rateLimitWindow = new Map<string, number[]>(); // key -> timestamps[]
  private deduplicationCache = new Map<string, { timestamp: number; result: any }>();
  private dlq: Array<{ request: NotificationRequest; error: string; timestamp: string }> = [];

  private metrics: DeliveryMetric = {
    totalRequested: 0,
    totalSent: 0,
    totalDelivered: 0,
    totalFailed: 0,
    totalDeduplicated: 0,
    totalRateLimited: 0,
    byChannel: {
      sms: { sent: 0, failed: 0 },
      push: { sent: 0, failed: 0 },
      email: { sent: 0, failed: 0 }
    }
  };

  // Supported Templates
  private templates: Record<string, { requiredVars: string[]; render: (data: any) => { title: string; body: string } }> = {
    'order_placed': {
      requiredVars: ['orderId', 'totalAmount'],
      render: (d) => ({
        title: 'Order Confirmed!',
        body: `Your order #${d.orderId} for $${d.totalAmount} is placed and being prepared.`
      })
    },
    'order_dispatched': {
      requiredVars: ['orderId', 'driverName', 'etaMinutes'],
      render: (d) => ({
        title: 'Order On The Way!',
        body: `Driver ${d.driverName} is on the way with order #${d.orderId}. ETA: ${d.etaMinutes} mins.`
      })
    },
    'order_delivered': {
      requiredVars: ['orderId'],
      render: (d) => ({
        title: 'Order Delivered!',
        body: `Enjoy your meal! Order #${d.orderId} has been successfully delivered.`
      })
    }
  };

  constructor(
    private smsProvider: ProductionSMSProvider,
    private fcmProvider: ProductionFCMProvider,
    private apnsProvider: ProductionAPNsProvider,
    private preferencesService: NotificationPreferencesService
  ) {}

  // Validate Template Variables
  validateTemplate(templateKey: string, data: Record<string, any> = {}): { isValid: boolean; missingVars: string[] } {
    const tmpl = this.templates[templateKey];
    if (!tmpl) return { isValid: true, missingVars: [] }; // Pass-through if custom

    const missing = tmpl.requiredVars.filter(v => data[v] === undefined || data[v] === null);
    return {
      isValid: missing.length === 0,
      missingVars: missing
    };
  }

  // Rate Limiting (Max 20 notifications per user per minute)
  checkRateLimit(key: string, limit = 20, windowMs = 60000): boolean {
    const now = Date.now();
    const timestamps = this.rateLimitWindow.get(key) || [];
    const validTimestamps = timestamps.filter(ts => now - ts < windowMs);

    if (validTimestamps.length >= limit) {
      return false; // Rate limited
    }

    validTimestamps.push(now);
    this.rateLimitWindow.set(key, validTimestamps);
    return true;
  }

  // Deduplication / Idempotency Check (5 minute window)
  checkDuplicate(dedupKey: string, windowMs = 300000): any | null {
    const cached = this.deduplicationCache.get(dedupKey);
    if (cached && (Date.now() - cached.timestamp < windowMs)) {
      return cached.result;
    }
    return null;
  }

  async dispatch(req: NotificationRequest): Promise<{ success: boolean; channelResults: any; deduplicated?: boolean }> {
    this.metrics.totalRequested++;

    // 1. Deduplication Check
    const dedupKey = req.idempotencyKey || `${req.userId}_${req.type}_${req.title}_${JSON.stringify(req.templateData || {})}`;
    const duplicate = this.checkDuplicate(dedupKey);
    if (duplicate) {
      this.metrics.totalDeduplicated++;
      return { success: true, channelResults: duplicate, deduplicated: true };
    }

    // 2. Rate Limiting Check
    const rateLimitKey = `rate_${req.userId}`;
    if (!this.checkRateLimit(rateLimitKey)) {
      this.metrics.totalRateLimited++;
      this.metrics.totalFailed++;
      throw new Error(`RateLimitExceeded: Maximum notification threshold exceeded for user ${req.userId}`);
    }

    // 3. Template Validation & Rendering
    let renderedTitle = req.title;
    let renderedBody = req.body;
    if (req.templateKey && this.templates[req.templateKey]) {
      const val = this.validateTemplate(req.templateKey, req.templateData);
      if (!val.isValid) {
        throw new Error(`TemplateValidationError: Missing required variables [${val.missingVars.join(', ')}] for template ${req.templateKey}`);
      }
      const rendered = this.templates[req.templateKey].render(req.templateData);
      renderedTitle = rendered.title;
      renderedBody = rendered.body;
    }

    // 4. Preferences Check
    const userPrefs: any = await this.preferencesService.getPreferences(req.userId).catch(() => ({
      smsDeliveryUpdates: true,
      pushOrders: true,
      pushDeliveryUpdates: true,
      emailOrders: true
    }));

    const allowSMS = userPrefs.smsDeliveryUpdates !== false && (userPrefs.sms !== false);
    const allowPush = (userPrefs.pushOrders !== false || userPrefs.pushDeliveryUpdates !== false) && (userPrefs.push !== false);
    const allowEmail = userPrefs.emailOrders !== false && (userPrefs.email !== false);

    const channelResults: Record<string, any> = {};

    // 5. Channel Execution with Retries & Exponential Backoff
    await Promise.all(
      req.channels.map(async (channel) => {
        if (channel === 'sms' && allowSMS && req.phone) {
          channelResults.sms = await this.executeWithRetry(async () => {
            return await this.smsProvider.sendSMS({
              to: req.phone!,
              message: `${renderedTitle}: ${renderedBody}`,
              tenantId: req.tenantId
            });
          }, 'sms');
        }

        if (channel === 'push' && allowPush && req.deviceTokens) {
          channelResults.push = {};
          const pushPromises: Promise<void>[] = [];
          if (req.deviceTokens.fcm && req.deviceTokens.fcm.length > 0) {
            pushPromises.push(
              this.executeWithRetry(async () => {
                return await this.fcmProvider.sendMulticast({
                  tokens: req.deviceTokens!.fcm!,
                  title: renderedTitle,
                  body: renderedBody,
                  data: req.templateData ? Object.fromEntries(Object.entries(req.templateData).map(([k, v]) => [k, String(v)])) : {}
                });
              }, 'push').then(res => { channelResults.push.fcm = res; })
            );
          }

          if (req.deviceTokens.apns && req.deviceTokens.apns.length > 0) {
            pushPromises.push(
              this.executeWithRetry(async () => {
                return await this.apnsProvider.sendPush({
                  deviceTokens: req.deviceTokens!.apns!,
                  title: renderedTitle,
                  body: renderedBody,
                  data: req.templateData
                });
              }, 'push').then(res => { channelResults.push.apns = res; })
            );
          }
          await Promise.all(pushPromises);
        }
      })
    );

    // Cache for Deduplication
    this.deduplicationCache.set(dedupKey, { timestamp: Date.now(), result: channelResults });
    this.metrics.totalSent++;
    this.metrics.totalDelivered++;

    return {
      success: true,
      channelResults
    };
  }

  // Exponential Backoff Retry Runner (Max 3 attempts)
  private async executeWithRetry<T>(fn: () => Promise<T>, channel: 'sms' | 'push' | 'email', maxRetries = 3): Promise<T> {
    let attempt = 0;
    while (attempt < maxRetries) {
      attempt++;
      try {
        const res = await fn();
        this.metrics.byChannel[channel].sent++;
        return res;
      } catch (err: any) {
        if (attempt >= maxRetries) {
          this.metrics.byChannel[channel].failed++;
          this.metrics.totalFailed++;
          this.dlq.push({
            request: { userId: 'unknown', type: 'order_status', channels: [channel], title: 'Failed', body: err.message },
            error: err.message,
            timestamp: new Date().toISOString()
          });
          throw err;
        }
        // Jittered backoff: 20ms * 2^attempt + jitter
        const backoffMs = (20 * Math.pow(2, attempt)) + Math.random() * 10;
        await new Promise(r => setTimeout(r, backoffMs));
      }
    }
    throw new Error(`Failed after ${maxRetries} attempts`);
  }

  getMetrics(): DeliveryMetric & { dlqCount: number } {
    return {
      ...this.metrics,
      dlqCount: this.dlq.length
    };
  }
}
