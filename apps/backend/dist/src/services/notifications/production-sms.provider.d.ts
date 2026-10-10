import { ConfigService } from '@nestjs/config';
export interface SMSMessage {
    to: string;
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
export declare class ProductionSMSProvider {
    private configService;
    private readonly logger;
    private primaryProvider;
    constructor(configService: ConfigService);
    normalizePhoneNumber(phone: string): string;
    sendSMS(msg: SMSMessage): Promise<SMSResult>;
    private sendViaTwilio;
    private sendViaAwsSns;
    private sendViaMsg91;
    private sendFallback;
}
