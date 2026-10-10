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
export declare class ProductionFCMProvider {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    sendMulticast(msg: PushMessage): Promise<PushResult>;
}
