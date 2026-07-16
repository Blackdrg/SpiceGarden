import { Injectable, OnModuleInit, OnModuleDestroy, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';

interface FailoverState {
  isPrimaryDown: boolean;
  failoverStartedAt: Date | null;
  degradedMode: boolean;
  reconnectionAttempts: number;
  lastSuccessfulConnection: Date | null;
}

@Injectable()
export class DatabaseFailoverService implements OnModuleInit, OnModuleDestroy {
  private readonly state: FailoverState = {
    isPrimaryDown: false,
    failoverStartedAt: null,
    degradedMode: false,
    reconnectionAttempts: 0,
    lastSuccessfulConnection: new Date(),
  };

  private readonly maxReconnectionAttempts = 10;
  private readonly reconnectionDelayMs = 5000;
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null;

  constructor(private dataSource: DataSource) {}

  onModuleInit() {
    this.startHealthCheck();
  }

  onModuleDestroy() {
    this.stopHealthCheck();
  }

  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, 30000);
    (this.healthCheckInterval as { unref?: () => void }).unref?.();
  }

  private stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  async performHealthCheck(): Promise<{ healthy: boolean; latencyMs: number; degraded: boolean }> {
    const startTime = Date.now();

    try {
      await this.dataSource.query('SELECT 1');
      const latencyMs = Date.now() - startTime;

      this.state.lastSuccessfulConnection = new Date();
      this.state.reconnectionAttempts = 0;

      if (this.state.isPrimaryDown && latencyMs > 1000) {
        this.state.degradedMode = true;
      } else if (this.state.isPrimaryDown && latencyMs <= 500) {
        this.exitDegradedMode();
      }

      return { healthy: true, latencyMs, degraded: this.state.degradedMode };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      this.state.reconnectionAttempts++;

      if (!this.state.isPrimaryDown) {
        this.state.isPrimaryDown = true;
        this.state.failoverStartedAt = new Date();
      }

      if (this.state.reconnectionAttempts >= this.maxReconnectionAttempts) {
        this.state.degradedMode = true;
      }

      return { healthy: false, latencyMs, degraded: this.state.degradedMode };
    }
  }

  async attemptReconnection(): Promise<boolean> {
    try {
      if (!this.dataSource.isInitialized) {
        await this.dataSource.initialize();
      }

      await this.dataSource.query('SELECT 1');
      this.exitDegradedMode();
      return true;
    } catch (error) {
      return false;
    }
  }

  private exitDegradedMode(): void {
    this.state.isPrimaryDown = false;
    this.state.failoverStartedAt = null;
    this.state.degradedMode = false;
    this.state.reconnectionAttempts = 0;
  }

  getState(): Readonly<FailoverState> {
    return { ...this.state };
  }

  isDegraded(): boolean {
    return this.state.degradedMode;
  }

  getFailoverDuration(): number | null {
    if (!this.state.failoverStartedAt) return null;
    return Date.now() - this.state.failoverStartedAt.getTime();
  }

  async executeWithFallback<T>(
    primaryQuery: () => Promise<T>,
    fallbackQuery: () => Promise<T>,
  ): Promise<T> {
    if (this.state.degradedMode) {
      try {
        return await fallbackQuery();
      } catch (fallbackError) {
        throw new InternalServerErrorException(`Both primary and fallback queries failed: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`);
      }
    }

    try {
      return await primaryQuery();
    } catch (primaryError) {
      if (this.state.reconnectionAttempts >= this.maxReconnectionAttempts) {
        try {
          return await fallbackQuery();
        } catch (fallbackError) {
          throw new InternalServerErrorException(`Primary failed after max retries, fallback also failed: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`);
        }
      }
      throw primaryError;
    }
  }
}
