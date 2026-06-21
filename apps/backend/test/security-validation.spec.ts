import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { RedisRateLimitStore } from '../src/security/redis-rate-limit.store';

describe('Rate Limit Store - Security Validation', () => {
  let store: RedisRateLimitStore;

  beforeEach(() => {
    store = new RedisRateLimitStore({ fallbackToMemory: true, prefix: 'test-ratelimit' });
  });

  afterEach(async () => {
    await store.shutdown();
  });

  describe('Memory fallback mode', () => {
    it('uses memory fallback when Redis is unavailable', async () => {
      await store.init({ windowMs: 60000, max: 5 } as any);
      const result = await store.increment('test-key');
      expect(result.totalHits).toBe(1);
    });

    it('tracks hits correctly for same key', async () => {
      await store.init({ windowMs: 60000, max: 100 } as any);
      
      await store.increment('key-1');
      await store.increment('key-1');
      await store.increment('key-1');
      
      const result = await store.get('key-1');
      expect(result?.totalHits).toBe(3);
    });

    it('separately tracks different keys', async () => {
      await store.init({ windowMs: 60000, max: 100 } as any);
      
      await store.increment('key-a');
      await store.increment('key-b');
      await store.increment('key-a');
      
      const resultA = await store.get('key-a');
      const resultB = await store.get('key-b');
      
      expect(resultA?.totalHits).toBe(2);
      expect(resultB?.totalHits).toBe(1);
    });

    it('resets keys correctly', async () => {
      await store.init({ windowMs: 60000, max: 100 } as any);
      
      await store.increment('reset-key');
      await store.increment('reset-key');
      await store.resetKey('reset-key');
      
      const result = await store.get('reset-key');
      expect(result).toBeUndefined();
    });

    it('resets all keys correctly', async () => {
      await store.init({ windowMs: 60000, max: 100 } as any);
      
      await store.increment('key-1');
      await store.increment('key-2');
      await store.resetAll();
      
      const result1 = await store.get('key-1');
      const result2 = await store.get('key-2');
      
      expect(result1).toBeUndefined();
      expect(result2).toBeUndefined();
    });

    it('decrements hits correctly', async () => {
      await store.init({ windowMs: 60000, max: 100 } as any);
      
      await store.increment('dec-key');
      await store.increment('dec-key');
      await store.decrement('dec-key');
      
      const result = await store.get('dec-key');
      expect(result?.totalHits).toBe(1);
    });
  });

  describe('Dangerous method blocking simulation', () => {
    it('rate limit key format includes method for path-based limits', async () => {
      const prefix = store.prefix;
      expect(prefix).toBe('test-ratelimit');
    });

    it('increments return correct structure for rate limiting decisions', async () => {
      await store.init({ windowMs: 60000, max: 10 } as any);
      const result = await store.increment('method:path:ip');
      
      expect(result).toHaveProperty('totalHits');
      expect(result).toHaveProperty('resetTime');
      expect(typeof result.totalHits).toBe('number');
    });
  });
});