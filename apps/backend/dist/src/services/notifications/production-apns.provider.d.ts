import { ConfigService } from '@nestjs/config';
export interface APNsMessage {
    deviceTokens: string[];
    title: string;
    body: string;
    badge?: number;
    sound?: string;
    data?: Record<string, any>;
    topic?: string;
    collapseId?: string;
    priority?: 10 | 5;
}
export interface APNsResult {
    success: boolean;
    sentCount: number;
    failedCount: number;
    invalidTokens: string[];
    apnsIds: string[];
    error?: string;
}
export declare class ProductionAPNsProvider {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    sendPush(msg: APNsMessage): Promise<APNsResult>;
}
