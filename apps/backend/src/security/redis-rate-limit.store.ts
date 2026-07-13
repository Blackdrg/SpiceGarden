import Redis from 'ioredis';
import type { ClientRateLimitInfo, IncrementResponse, Options, Store } from 'express-rate-limit';

type MemoryBucket = {
  hits: number;
  expiresAt: number;
};

type RedisRateLimitStoreOptions = {
  redisUrl?: string;
  prefix?: string;
  fallbackToMemory?: boolean;
};

export class RedisRateLimitStore implements Store {
  public readonly prefix: string;
  public readonly localKeys = false;

  private readonly redisUrl: string;
  private readonly fallbackToMemory: boolean;
  private readonly memory = new Map<string, MemoryBucket>();
  private client: Redis | null = null;
  private options: Options | null = null;
  private redisAvailable = false;

  constructor(options: RedisRateLimitStoreOptions = {}) {
    this.redisUrl = options.redisUrl || 'redis://127.0.0.1:6379';
    this.prefix = options.prefix || 'spicegarden:ratelimit';
    this.fallbackToMemory = options.fallbackToMemory ?? true;
  }

  async init(options: Options): Promise<void> {
    this.options = options;
    this.client = new Redis(this.redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
      connectTimeout: 750,
    });

    this.client.on('error', (error) => {
      this.redisAvailable = false;
      if (process.env.NODE_ENV === 'production') {
        console.error('[rate-limit] Redis rate-limit store error:', error.message);
      }
    });

    try {
      await this.client.connect();
      await this.client.ping();
      this.redisAvailable = true;
      console.log(`[rate-limit] Redis rate-limit store connected: ${this.redisUrl}`);
    } catch (error) {
      this.redisAvailable = false;
      this.client.disconnect();
      this.client = null;
      if (this.fallbackToMemory) {
        console.warn(`[rate-limit] Redis unavailable, using process-local fallback: ${error instanceof Error ? error.message : String(error)}`);
      } else {
        throw error;
      }
    }
  }

  async get(key: string): Promise<ClientRateLimitInfo | undefined> {
    if (this.redisAvailable && this.client) {
      const redisKey = this.redisKey(key);
      const hits = await this.client.get(redisKey);
      if (hits === null) return undefined;

      const ttlMs = await this.client.pttl(redisKey);
      return {
        totalHits: Number(hits),
        resetTime: ttlMs > 0 ? new Date(Date.now() + ttlMs) : undefined,
      };
    }

    const bucket = this.memory.get(key);
    if (!bucket) return undefined;
    return {
      totalHits: bucket.hits,
      resetTime: new Date(bucket.expiresAt),
    };
  }

  async increment(key: string): Promise<IncrementResponse> {
    const windowMs = this.options?.windowMs || 60_000;

    if (this.redisAvailable && this.client) {
      const redisKey = this.redisKey(key);
      const result = await this.client.multi()
        .incr(redisKey)
        .pexpire(redisKey, windowMs)
        .exec();

      if (result) {
        const first = result[0];
        const totalHits = Array.isArray(first) && typeof first[1] === 'number' ? first[1] : 0;
        return { totalHits, resetTime: new Date(Date.now() + windowMs) };
      }
    }

    const now = Date.now();
    const existing = this.memory.get(key);
    const hits = existing && existing.expiresAt > now ? existing.hits + 1 : 1;
    this.memory.set(key, { hits, expiresAt: now + windowMs });
    return { totalHits: hits, resetTime: new Date(now + windowMs) };
  }

  async decrement(key: string): Promise<void> {
    if (this.redisAvailable && this.client) {
      await this.client.decr(this.redisKey(key)).catch(() => undefined);
      return;
    }

    const bucket = this.memory.get(key);
    if (!bucket) return;
    bucket.hits = Math.max(0, bucket.hits - 1);
  }

  async resetKey(key: string): Promise<void> {
    if (this.redisAvailable && this.client) {
      await this.client.del(this.redisKey(key));
      return;
    }

    this.memory.delete(key);
  }

  async resetAll(): Promise<void> {
    if (this.redisAvailable && this.client) {
      const keys = await this.client.keys(`${this.prefix}:*`);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
      return;
    }

    this.memory.clear();
  }

  async shutdown(): Promise<void> {
    this.memory.clear();
    if (this.client) {
      this.client.disconnect();
      this.client = null;
    }
  }

  private redisKey(key: string): string {
    return `${this.prefix}:${key}`;
  }
}
