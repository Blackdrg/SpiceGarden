import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { INestApplicationContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export class RedisIoAdapter extends IoAdapter {
  private readonly logger = new Logger(RedisIoAdapter.name);
  private adapterConstructor: any = null;
  private pubClient: Redis | null = null;
  private subClient: Redis | null = null;

  constructor(
    appOrHttpServer: INestApplicationContext | any,
    private readonly configService?: ConfigService,
  ) {
    super(appOrHttpServer);
  }

  async connectToRedis(): Promise<void> {
    const redisUrl =
      this.configService?.get<string>('REDIS_URL') ||
      process.env.REDIS_URL ||
      `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;

    if (process.env.DISABLE_REDIS_ADAPTER === 'true' || process.env.LOCAL_DB === 'sqlite') {
      this.logger.log('Redis WebSocket adapter skipped (local/disabled mode)');
      return;
    }

    try {
      this.pubClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => Math.min(times * 100, 2000),
        lazyConnect: true,
      });
      this.subClient = this.pubClient.duplicate();

      await Promise.all([this.pubClient.connect(), this.subClient.connect()]);

      this.adapterConstructor = createAdapter(this.pubClient, this.subClient);
      this.logger.log(`Redis WebSocket adapter connected successfully to ${redisUrl}`);
    } catch (err: any) {
      this.logger.warn(
        `Failed to initialize Redis WebSocket adapter, falling back to default in-memory adapter: ${err?.message || String(err)}`,
      );
      this.pubClient = null;
      this.subClient = null;
      this.adapterConstructor = null;
    }
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }
    return server;
  }

  async close(): Promise<void> {
    if (this.pubClient) {
      await this.pubClient.quit().catch(() => undefined);
    }
    if (this.subClient) {
      await this.subClient.quit().catch(() => undefined);
    }
  }
}
