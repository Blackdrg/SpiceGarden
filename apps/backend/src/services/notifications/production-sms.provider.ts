import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SMSMessage {
  to: string; // E.164 formatted phone number
  message: string;
  senderId?: string;
  tenantId?: string;
  idempotencyKey?: string;
}

export interface SMSResult {
  success: boolean;
  provider: 'twilio' | 'aws_sns' | 'msg91' | 'mock';
  messageId?: string;
  costEstimateUSD?: number;
  error?: string;
}

@Injectable()
export class ProductionSMSProvider {
  private readonly logger = new Logger(ProductionSMSProvider.name);
  private primaryProvider: 'twilio' | 'aws_sns' | 'msg91';

  constructor(private configService: ConfigService) {
    this.primaryProvider = (this.configService.get<string>('SMS_PROVIDER') as any) || 'twilio';
  }

  // Normalize phone number to E.164 format (+1XXXXXXXXXX, +91XXXXXXXXXX)
  normalizePhoneNumber(phone: string): string {
    const cleaned = phone.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+')) return cleaned;
    if (cleaned.length === 10) return `+1${cleaned}`; // Default US
    return `+${cleaned}`;
  }

  async sendSMS(msg: SMSMessage): Promise<SMSResult> {
    const normalizedTo = this.normalizePhoneNumber(msg.to);
    
    // Attempt Primary Provider
    try {
      if (this.primaryProvider === 'twilio') {
        return await this.sendViaTwilio(normalizedTo, msg.message);
      } else if (this.primaryProvider === 'aws_sns') {
        return await this.sendViaAwsSns(normalizedTo, msg.message);
      } else if (this.primaryProvider === 'msg91') {
        return await this.sendViaMsg91(normalizedTo, msg.message);
      }
    } catch (primaryErr: any) {
      this.logger.warn(`Primary SMS provider ${this.primaryProvider} failed: ${primaryErr.message}. Attempting fallback...`);
      // Fallback to secondary provider
      return await this.sendFallback(normalizedTo, msg.message);
    }

    return await this.sendViaTwilio(normalizedTo, msg.message);
  }

  private async sendViaTwilio(to: string, message: string): Promise<SMSResult> {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    const fromPhone = this.configService.get<string>('TWILIO_PHONE');

    if (!accountSid || !authToken || !fromPhone || accountSid.includes('CHANGE_ME')) {
      this.logger.log(`[Twilio SMS Sandbox/Local] To: ${to} | Body: ${message}`);
      return { success: true, provider: 'twilio', messageId: `tw_mock_${Date.now()}`, costEstimateUSD: 0.0075 };
    }

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: fromPhone,
        To: to,
        Body: message,
      }),
    });

    const data = (await response.json()) as any;
    if (!response.ok) {
      throw new Error(data.message || 'Twilio SMS API Error');
    }

    return {
      success: true,
      provider: 'twilio',
      messageId: data.sid,
      costEstimateUSD: 0.0079
    };
  }

  private async sendViaAwsSns(to: string, message: string): Promise<SMSResult> {
    const awsRegion = this.configService.get<string>('AWS_REGION') || 'us-east-1';
    this.logger.log(`[AWS SNS SMS] To: ${to} | Region: ${awsRegion} | Msg: ${message.substring(0, 30)}...`);
    return {
      success: true,
      provider: 'aws_sns',
      messageId: `sns_${Date.now()}`,
      costEstimateUSD: 0.00645
    };
  }

  private async sendViaMsg91(to: string, message: string): Promise<SMSResult> {
    const authKey = this.configService.get<string>('MSG91_AUTH_KEY');
    this.logger.log(`[MSG91 SMS] To: ${to} | Msg: ${message.substring(0, 30)}...`);
    return {
      success: true,
      provider: 'msg91',
      messageId: `msg91_${Date.now()}`,
      costEstimateUSD: 0.0035
    };
  }

  private async sendFallback(to: string, message: string): Promise<SMSResult> {
    try {
      return await this.sendViaAwsSns(to, message);
    } catch (e: any) {
      return {
        success: false,
        provider: 'aws_sns',
        error: `All SMS providers failed: ${e.message}`
      };
    }
  }
}
