import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Injectable()
export class RedisAdapter implements OnModuleInit, OnModuleDestroy {
  private client: unknown = null;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async connect(): Promise<void> {
    const host = this.configService.get<string>('REDIS_HOST') || 'localhost';
    const port = this.configService.get<number>('REDIS_PORT') || 6379;
    const password = this.configService.get<string>('REDIS_PASSWORD') || undefined;

    try {
      const ioredis = await import('ioredis');
      const Redis = ioredis.default || ioredis;
      this.client = new Redis({
        host,
        port,
        password: password || undefined,
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => Math.min(times * 100, 2000),
      });

      this.client.on('connect', () => {
        console.log(`Redis connected successfully at ${host}:${port}`);
      });

      this.client.on('error', (err) => {
        console.error('Redis connection error:', err);
      });

      await this.client.ping();
      console.log('Redis ping successful');
    } catch (e) {
      console.warn('ioredis not installed or Redis unavailable, using fallback mode');
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
      console.error('Redis GET error:', e);
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
      console.error('Redis SET error:', e);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.del(key);
    } catch (e) {
      console.error('Redis DEL error:', e);
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
