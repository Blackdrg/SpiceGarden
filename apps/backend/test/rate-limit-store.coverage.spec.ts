// @ts-nocheck
import { describe, expect, it, jest } from '@jest/globals';
import { RedisRateLimitStore } from '../src/security/redis-rate-limit.store';

describe('RedisRateLimitStore coverage', () => {
  function createStore() {
    const store = new RedisRateLimitStore({
      redisUrl: 'redis://localhost:6379',
      prefix: 'test:rl',
      fallbackToMemory: true,
    });
    return store;
  }

  function mockRedisClient(): any {
    return {
      get: jest.fn(),
      pttl: jest.fn(),
      multi: jest.fn(() => ({
        incr: jest.fn().mockReturnThis(),
        pexpire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([['OK', 3]]),
      })),
      pexpire: jest.fn().mockResolvedValue(1),
      incr: jest.fn().mockResolvedValue(1),
      decr: jest.fn().mockResolvedValue(0),
      del: jest.fn().mockResolvedValue(1),
      keys: jest.fn().mockResolvedValue(['test:rl:key1', 'test:rl:key2']),
      disconnect: jest.fn(),
      on: jest.fn(),
    };
  }

  function setupRedis(store: any) {
    const client = mockRedisClient();
    (store as any).client = client;
    (store as any).redisAvailable = true;
    (store as any).options = { windowMs: 60_000, max: 5 };
    return client;
  }

  it('should expose prefix and localKeys', () => {
    const store = createStore();
    expect(store.prefix).toBe('test:rl');
    expect(store.localKeys).toBe(false);
  });

  it('should use default options', () => {
    const store = new RedisRateLimitStore();
    expect(store.prefix).toBe('spicegarden:ratelimit');
  });

  it('should increment via Redis', async () => {
    const store = createStore();
    const client = setupRedis(store);

    (client.get as jest.Mock).mockResolvedValue('3');
    (client.pttl as jest.Mock).mockResolvedValue(45000);

    const result = await store.increment('user-1');
    expect(result.totalHits).toBe(3);
    expect(result.resetTime).toBeInstanceOf(Date);
  });

  it('should get via Redis when available', async () => {
    const store = createStore();
    const client = setupRedis(store);

    (client.get as jest.Mock).mockResolvedValue('5');
    (client.pttl as jest.Mock).mockResolvedValue(30000);

    const info = await store.get('user-1');
    expect(info?.totalHits).toBe(5);
    expect(info?.resetTime).toBeInstanceOf(Date);
  });

  it('should return undefined when Redis key missing', async () => {
    const store = createStore();
    const client = setupRedis(store);

    (client.get as jest.Mock).mockResolvedValue(null);

    const info = await store.get('missing');
    expect(info).toBeUndefined();
  });

  it('should return hits without resetTime when pttl is 0', async () => {
    const store = createStore();
    const client = setupRedis(store);

    (client.get as jest.Mock).mockResolvedValue('1');
    (client.pttl as jest.Mock).mockResolvedValue(0);

    const info = await store.get('expired');
    expect(info?.totalHits).toBe(1);
    expect(info?.resetTime).toBeUndefined();
  });

  it('should decrement via Redis', async () => {
    const store = createStore();
    const client = setupRedis(store);

    (client.decr as jest.Mock).mockResolvedValue(2);

    await store.decrement('user-1');
    expect(client.decr).toHaveBeenCalledWith('test:rl:user-1');
  });

  it('should swallow Redis decrement errors', async () => {
    const store = createStore();
    const client = setupRedis(store);

    (client.decr as jest.Mock).mockRejectedValue(new Error('redis down'));

    await expect(store.decrement('user-1')).resolves.toBeUndefined();
  });

  it('should resetKey via Redis', async () => {
    const store = createStore();
    const client = setupRedis(store);

    await store.resetKey('user-1');
    expect(client.del).toHaveBeenCalledWith('test:rl:user-1');
  });

  it('should resetAll via Redis with keys', async () => {
    const store = createStore();
    const client = setupRedis(store);

    (client.keys as jest.Mock).mockResolvedValue(['test:rl:a', 'test:rl:b']);

    await store.resetAll();
    expect(client.keys).toHaveBeenCalledWith('test:rl:*');
    expect(client.del).toHaveBeenCalledWith('test:rl:a', 'test:rl:b');
  });

  it('should resetAll via Redis with no keys', async () => {
    const store = createStore();
    const client = setupRedis(store);

    (client.keys as jest.Mock).mockResolvedValue([]);

    await store.resetAll();
    expect(client.del).not.toHaveBeenCalled();
  });

  it('should shutdown and clear memory', async () => {
    const store = createStore();
    const client = setupRedis(store);
    (store as any).memory.set('k1', { hits: 5, expiresAt: Date.now() + 10000 });

    await store.shutdown();
    expect((store as any).memory.size).toBe(0);
    expect(client.disconnect).toHaveBeenCalled();
    expect((store as any).client).toBeNull();
  });

  it('should shutdown with no client', async () => {
    const store = createStore();
    (store as any).client = null;

    await store.shutdown();
    expect((store as any).memory.size).toBe(0);
  });

  it('should generate redisKey', () => {
    const store = createStore();
    expect((store as any).redisKey('user-123')).toBe('test:rl:user-123');
  });

  it('should fallback to memory get when Redis unavailable', async () => {
    const store = new RedisRateLimitStore({ redisUrl: 'redis://127.0.0.1:1', fallbackToMemory: true });
    await store.init({ windowMs: 60_000, max: 5 } as any);

    await store.increment('key-b');
    const info = await store.get('key-b');
    expect(info?.totalHits).toBe(1);
    await store.shutdown();
  });

  it('should create new memory bucket on first increment', async () => {
    const store = new RedisRateLimitStore({ redisUrl: 'redis://127.0.0.1:1', fallbackToMemory: true });
    await store.init({ windowMs: 60_000, max: 5 } as any);

    const result = await store.increment('fresh-key');
    expect(result.totalHits).toBe(1);
    expect(result.resetTime).toBeInstanceOf(Date);
    await store.shutdown();
  });

  it('should reuse existing memory bucket when not expired', async () => {
    const store = new RedisRateLimitStore({ redisUrl: 'redis://127.0.0.1:1', fallbackToMemory: true });
    await store.init({ windowMs: 60_000, max: 5 } as any);

    await store.increment('key-c');
    const result = await store.increment('key-c');
    expect(result.totalHits).toBe(2);
    await store.shutdown();
  });

  it('should create new memory bucket when expired', async () => {
    const store = new RedisRateLimitStore({ redisUrl: 'redis://127.0.0.1:1', fallbackToMemory: true });
    await store.init({ windowMs: 60_000, max: 5 } as any);

    await store.increment('key-d');
    (store as any).memory.set('key-d', { hits: 5, expiresAt: Date.now() - 1000 });
    const result = await store.increment('key-d');
    expect(result.totalHits).toBe(1);
    await store.shutdown();
  });

  it('should not decrement memory bucket below zero', async () => {
    const store = new RedisRateLimitStore({ redisUrl: 'redis://127.0.0.1:1', fallbackToMemory: true });
    await store.init({ windowMs: 60_000, max: 5 } as any);

    await store.increment('key-e');
    await store.decrement('key-e');
    await store.decrement('key-e');
    await store.decrement('key-e');

    const info = await store.get('key-e');
    expect(info?.totalHits).toBe(0);
    await store.shutdown();
  });

  it('should resetKey via memory', async () => {
    const store = new RedisRateLimitStore({ redisUrl: 'redis://127.0.0.1:1', fallbackToMemory: true });
    await store.init({ windowMs: 60_000, max: 5 } as any);

    await store.increment('key-f');
    await store.resetKey('key-f');
    expect(await store.get('key-f')).toBeUndefined();
    await store.shutdown();
  });

  it('should resetAll via memory', async () => {
    const store = new RedisRateLimitStore({ redisUrl: 'redis://127.0.0.1:1', fallbackToMemory: true });
    await store.init({ windowMs: 60_000, max: 5 } as any);

    await store.increment('key-g');
    await store.increment('key-h');
    await store.resetAll();
    expect(await store.get('key-g')).toBeUndefined();
    expect(await store.get('key-h')).toBeUndefined();
    await store.shutdown();
  });

  it('should return totalHits 1 when Redis exec returns falsy (falls back to memory)', async () => {
    const store = createStore();
    const client = setupRedis(store);
    const multiChain = {
      incr: jest.fn().mockReturnThis(),
      pexpire: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(null),
    };
    client.multi = jest.fn(() => multiChain);

    const result = await store.increment('user-1');
    expect(result.totalHits).toBe(1);
  });
});
