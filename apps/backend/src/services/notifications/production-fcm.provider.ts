import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PushMessage {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
  priority?: 'high' | 'normal';
  collapseKey?: string;
  ttlSeconds?: number;
}

export interface PushResult {
  success: boolean;
  successCount: number;
  failureCount: number;
  invalidTokens: string[];
  messageIds: string[];
  error?: string;
}

@Injectable()
export class ProductionFCMProvider {
  private readonly logger = new Logger(ProductionFCMProvider.name);

  constructor(private configService: ConfigService) {}

  async sendMulticast(msg: PushMessage): Promise<PushResult> {
    const fcmServerKey = this.configService.get<string>('FCM_SERVER_KEY');
    const validTokens = msg.tokens.filter(t => Boolean(t) && t.length > 10);

    if (validTokens.length === 0) {
      return { success: true, successCount: 0, failureCount: 0, invalidTokens: [], messageIds: [] };
    }

    if (!fcmServerKey || fcmServerKey.includes('CHANGE_ME')) {
      this.logger.log(`[FCM Push Sandbox/Local] Sent "${msg.title}" to ${validTokens.length} devices.`);
      return {
        success: true,
        successCount: validTokens.length,
        failureCount: 0,
        invalidTokens: [],
        messageIds: validTokens.map((_, i) => `fcm_mock_${Date.now()}_${i}`)
      };
    }

    // Chunk tokens in batches of 500 (FCM batch limit)
    const batchSize = 500;
    let totalSuccess = 0;
    let totalFailure = 0;
    const invalidTokens: string[] = [];
    const messageIds: string[] = [];

    const batches: string[][] = [];
    for (let i = 0; i < validTokens.length; i += batchSize) {
      batches.push(validTokens.slice(i, i + batchSize));
    }

    await Promise.all(
      batches.map(async (batchTokens) => {
        try {
          const response = await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
              'Authorization': `key=${fcmServerKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              registration_ids: batchTokens,
              priority: msg.priority || 'high',
              collapse_key: msg.collapseKey,
              time_to_live: msg.ttlSeconds || 3600,
              notification: {
                title: msg.title,
                body: msg.body,
                sound: 'default'
              },
              data: msg.data || {},
            }),
          });

          if (!response.ok) {
            throw new Error(`FCM request failed with HTTP ${response.status}`);
          }

          const resData = (await response.json()) as any;
          if (resData && resData.results) {
            totalSuccess += resData.success || 0;
            totalFailure += resData.failure || 0;

            resData.results.forEach((res: any, idx: number) => {
              if (res.message_id) {
                messageIds.push(res.message_id);
              }
              if (res.error === 'NotRegistered' || res.error === 'InvalidRegistration') {
                invalidTokens.push(batchTokens[idx]);
              }
            });
          } else {
            totalSuccess += batchTokens.length;
          }
        } catch (err: any) {
          this.logger.error(`FCM batch send error: ${err.message}`);
          totalFailure += batchTokens.length;
        }
      })
    );

    return {
      success: totalFailure === 0 || totalSuccess > 0,
      successCount: totalSuccess,
      failureCount: totalFailure,
      invalidTokens,
      messageIds
    };
  }
}
