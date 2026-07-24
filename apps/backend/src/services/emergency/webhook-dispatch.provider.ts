import { Injectable, Logger } from '@nestjs/common';
import { IEmergencyDispatchProvider, EmergencyDispatchResult } from './dispatch-provider.interface';

@Injectable()
export class WebhookDispatchProvider implements IEmergencyDispatchProvider {
  name = 'webhook_dispatch_provider';
  private readonly logger = new Logger(WebhookDispatchProvider.name);
  private webhookUrl: string;
  private apiKey: string;

  constructor() {
    this.webhookUrl = process.env.EMERGENCY_WEBHOOK_URL || '';
    this.apiKey = process.env.EMERGENCY_WEBHOOK_API_KEY || '';
  }

  async dispatch(data: {
    incidentId: string;
    incidentNumber: string;
    driverId: string;
    latitude: number;
    longitude: number;
    address: string;
    severity: string;
    notes?: Record<string, any>;
  }): Promise<EmergencyDispatchResult> {
    if (!this.webhookUrl) {
      return {
        success: false,
        message: 'Webhook URL not configured',
      };
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'X-API-Key': this.apiKey } : {}),
        },
        body: JSON.stringify({
          incidentId: data.incidentId,
          incidentNumber: data.incidentNumber,
          driverId: data.driverId,
          location: { latitude: data.latitude, longitude: data.longitude },
          address: data.address,
          severity: data.severity,
          notes: data.notes,
          timestamp: new Date().toISOString(),
        }),
      });

      const result = await response.text();
      this.logger.log(`Webhook dispatch for incident ${data.incidentNumber}: status=${response.status}`);

      return {
        success: response.ok,
        providerResponseId: result.substring(0, 50),
        message: response.ok ? 'Webhook dispatch successful' : 'Webhook dispatch failed',
        metadata: {
          provider: this.name,
          statusCode: response.status,
          incidentId: data.incidentId,
        },
      };
    } catch (error) {
      this.logger.error(`Webhook dispatch failed for incident ${data.incidentNumber}:`, error);
      return {
        success: false,
        message: `Webhook dispatch error: ${(error as Error).message}`,
      };
    }
  }
}
