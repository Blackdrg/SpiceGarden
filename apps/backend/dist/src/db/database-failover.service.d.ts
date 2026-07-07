import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { DataSource } from 'typeorm';
interface FailoverState {
    isPrimaryDown: boolean;
    failoverStartedAt: Date | null;
    degradedMode: boolean;
    reconnectionAttempts: number;
    lastSuccessfulConnection: Date | null;
}
export declare class DatabaseFailoverService implements OnModuleInit, OnModuleDestroy {
    private dataSource;
    private readonly state;
    private readonly maxReconnectionAttempts;
    private readonly reconnectionDelayMs;
    private healthCheckInterval;
    constructor(dataSource: DataSource);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private startHealthCheck;
    private stopHealthCheck;
    performHealthCheck(): Promise<{
        healthy: boolean;
        latencyMs: number;
        degraded: boolean;
    }>;
    attemptReconnection(): Promise<boolean>;
    private exitDegradedMode;
    getState(): Readonly<FailoverState>;
    isDegraded(): boolean;
    getFailoverDuration(): number | null;
    executeWithFallback<T>(primaryQuery: () => Promise<T>, fallbackQuery: () => Promise<T>): Promise<T>;
}
export {};
