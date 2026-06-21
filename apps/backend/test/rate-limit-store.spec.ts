import { describe, expect, it } from '@jest/globals';
import { RedisRateLimitStore } from '../src/security/redis-rate-limit.store';

describe('RedisRateLimitStore fallback behavior', () => {
  it('falls back to memory when Redis is unavailable', async () => {
    const store = new RedisRateLimitStore({
      redisUrl: 'redis://127.0.0.1:1',
      prefix: 'test:ratelimit',
      fallbackToMemory: true,
    });

    await store.init({ windowMs: 60_000, max: 5 } as any);

    const first = await store.increment('key-a');
    const second = await store.increment('key-a');

    expect(first.totalHits).toBe(1);
    expect(second.totalHits).toBe(2);
    expect((await store.get('key-a'))?.totalHits).toBe(2);

    await store.decrement('key-a');
    expect((await store.get('key-a'))?.totalHits).toBe(1);

    await store.resetKey('key-a');
    expect(await store.get('key-a')).toBeUndefined();
    await store.shutdown();
  });

  it('throws when Redis is unavailable and memory fallback is disabled', async () => {
    const store = new RedisRateLimitStore({
      redisUrl: 'redis://127.0.0.1:1',
      fallbackToMemory: false,
    });

    await expect(store.init({ windowMs: 60_000, max: 5 } as any)).rejects.toThrow();
    await store.shutdown();
  });
});
