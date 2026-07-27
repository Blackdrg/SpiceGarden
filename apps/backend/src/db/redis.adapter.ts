import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisAdapter implements OnModuleInit, OnModuleDestroy {
  private client: Redis | null = null;
  private readonly logger = new Logger(RedisAdapter.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async connect(): Promise<void> {
    const host = this.configService.get<string>('REDIS_HOST') || '127.0.0.1';
    const port = this.configService.get<number>('REDIS_PORT') || 6379;
    const password = this.configService.get<string>('REDIS_PASSWORD') || undefined;

    try {
      const RedisClass = Redis as any;
      const client = new RedisClass({
        host,
        port,
        password: password || undefined,
        maxRetriesPerRequest: 3,
        retryStrategy: (times: number) => Math.min(times * 100, 2000),
      });

      this.client = client;
      
 client.on('connect', () => {
         this.logger.log('Redis connected successfully');
       });

       client.on('error', (err: Error) => {
         this.logger.error('Redis connection error', err.message);
       });

       await client.ping();
    } catch (e) {
      this.logger.warn('ioredis not installed or Redis unavailable, using fallback mode');
      this.client = null;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) return null;
    try {
      return await this.client.get(key);
    } catch (e) {
      this.logger.error('Redis GET error', e instanceof Error ? e.message : String(e));
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.client) return;
    try {
      if (ttl) {
        await this.client.setex(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (e) {
      this.logger.error('Redis SET error', e instanceof Error ? e.message : String(e));
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.del(key);
    } catch (e) {
      this.logger.error('Redis DEL error', e instanceof Error ? e.message : String(e));
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client) return false;
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (e) {
      return false;
    }
  }

  async incr(key: string): Promise<number> {
    if (!this.client) return 0;
    try {
      return await this.client.incr(key);
    } catch (e) {
      return 0;
    }
  }
}
