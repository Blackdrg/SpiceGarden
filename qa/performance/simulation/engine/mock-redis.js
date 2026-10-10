/**
 * SPICEGARDEN SIMULATION - Mock Redis Adapter
 * High-performance in-memory key-value, hash, list, pub/sub, distributed locking,
 * TTL management, LRU eviction simulation, and hot-key contention modeling.
 */

class MockRedis {
  constructor(options = {}) {
    this.maxMemoryBytes = options.maxMemoryBytes || 512 * 1024 * 1024; // 512MB
    this.baseLatencyMs = options.baseLatencyMs || 0.15;
    this.failureMode = 'normal'; // 'normal', 'slow', 'overloaded', 'timeout', 'connection_exhaustion', 'partial_failure'

    this.store = new Map(); // key -> { value, type, expireAt, lastAccessed, size }
    this.locks = new Map(); // key -> { lockId, expireAt }
    this.subscribers = new Map(); // channel -> Set(cb)
    this.usedMemoryBytes = 0;

    this.metrics = {
      totalOps: 0,
      gets: 0,
      sets: 0,
      dels: 0,
      hits: 0,
      misses: 0,
      evictions: 0,
      lockAttempts: 0,
      lockAcquisitions: 0,
      lockContention: 0,
      pubSubMessages: 0,
      hotKeyAccesses: new Map(),
      latencies: [],
      errorCount: 0
    };
  }

  setFailureMode(mode) {
    this.failureMode = mode;
  }

  _checkFailure() {
    if (this.failureMode === 'timeout') {
      this.metrics.errorCount++;
      throw new Error('RedisTimeoutError: Command timed out after 1000ms');
    }
    if (this.failureMode === 'connection_exhaustion') {
      this.metrics.errorCount++;
      throw new Error('RedisConnectionError: Maximum client connections reached');
    }
    if (this.failureMode === 'partial_failure' && Math.random() < 0.3) {
      this.metrics.errorCount++;
      throw new Error('RedisClusterError: MOVED / Cluster node temporarily unreachable');
    }
  }

  _recordOp(type, isHit = null, key = '') {
    this.metrics.totalOps++;
    if (type === 'get') this.metrics.gets++;
    if (type === 'set') this.metrics.sets++;
    if (type === 'del') this.metrics.dels++;
    if (isHit === true) this.metrics.hits++;
    if (isHit === false) this.metrics.misses++;

    if (key) {
      const current = this.metrics.hotKeyAccesses.get(key) || 0;
      this.metrics.hotKeyAccesses.set(key, current + 1);
    }

    let latency = this.baseLatencyMs;
    if (this.failureMode === 'slow') latency += 45.0;
    if (this.failureMode === 'overloaded') latency += 120.0;
    this.metrics.latencies.push(latency);
    if (this.metrics.latencies.length > 50000) {
      this.metrics.latencies.splice(0, 10000);
    }
  }

  _evictIfNecessary() {
    while (this.usedMemoryBytes > this.maxMemoryBytes && this.store.size > 0) {
      // Find oldest accessed key (LRU)
      let oldestKey = null;
      let oldestTime = Infinity;
      for (const [k, v] of this.store.entries()) {
        if (v.lastAccessed < oldestTime) {
          oldestTime = v.lastAccessed;
          oldestKey = k;
        }
      }
      if (oldestKey) {
        const item = this.store.get(oldestKey);
        this.usedMemoryBytes -= item.size;
        this.store.delete(oldestKey);
        this.metrics.evictions++;
      } else {
        break;
      }
    }
  }

  _isExpired(item) {
    if (item.expireAt && Date.now() > item.expireAt) {
      return true;
    }
    return false;
  }

  async get(key) {
    this._checkFailure();
    const item = this.store.get(key);
    if (!item || this._isExpired(item)) {
      if (item) {
        this.usedMemoryBytes -= item.size;
        this.store.delete(key);
      }
      this._recordOp('get', false, key);
      return null;
    }
    item.lastAccessed = Date.now();
    this._recordOp('get', true, key);
    return item.value;
  }

  async set(key, value, options = {}) {
    this._checkFailure();
    const expireAt = options.ex ? Date.now() + options.ex * 1000 : (options.px ? Date.now() + options.px : null);
    const size = Buffer.byteLength(JSON.stringify(value) || '') + key.length + 32;

    if (this.store.has(key)) {
      const existing = this.store.get(key);
      this.usedMemoryBytes -= existing.size;
    }

    this.store.set(key, {
      value,
      type: 'string',
      expireAt,
      lastAccessed: Date.now(),
      size
    });

    this.usedMemoryBytes += size;
    this._evictIfNecessary();
    this._recordOp('set', null, key);
    return 'OK';
  }

  async mget(keys) {
    this._checkFailure();
    const results = [];
    for (const k of keys) {
      const val = await this.get(k);
      results.push(val);
    }
    return results;
  }

  async del(key) {
    this._checkFailure();
    if (this.store.has(key)) {
      const existing = this.store.get(key);
      this.usedMemoryBytes -= existing.size;
      this.store.delete(key);
      this._recordOp('del', true, key);
      return 1;
    }
    this._recordOp('del', false, key);
    return 0;
  }

  async incr(key) {
    this._checkFailure();
    let item = this.store.get(key);
    let num = 0;
    if (item && !this._isExpired(item)) {
      num = parseInt(item.value, 10) || 0;
    }
    num += 1;
    await this.set(key, num);
    return num;
  }

  // Hash Operations
  async hset(key, field, value) {
    this._checkFailure();
    let item = this.store.get(key);
    if (!item || this._isExpired(item) || item.type !== 'hash') {
      item = {
        value: new Map(),
        type: 'hash',
        expireAt: null,
        lastAccessed: Date.now(),
        size: 64
      };
      this.store.set(key, item);
    }
    item.value.set(field, value);
    item.lastAccessed = Date.now();
    this._recordOp('set', null, key);
    return 1;
  }

  async hget(key, field) {
    this._checkFailure();
    const item = this.store.get(key);
    if (!item || this._isExpired(item) || item.type !== 'hash') {
      this._recordOp('get', false, key);
      return null;
    }
    item.lastAccessed = Date.now();
    const val = item.value.get(field) || null;
    this._recordOp('get', !!val, key);
    return val;
  }

  async hgetall(key) {
    this._checkFailure();
    const item = this.store.get(key);
    if (!item || this._isExpired(item) || item.type !== 'hash') {
      this._recordOp('get', false, key);
      return {};
    }
    item.lastAccessed = Date.now();
    const obj = {};
    for (const [f, v] of item.value.entries()) {
      obj[f] = v;
    }
    this._recordOp('get', true, key);
    return obj;
  }

  // Distributed Lock
  async acquireLock(resourceKey, ttlMs = 5000) {
    this._checkFailure();
    this.metrics.lockAttempts++;
    const lockKey = `lock:${resourceKey}`;
    const now = Date.now();

    if (this.locks.has(lockKey)) {
      const lock = this.locks.get(lockKey);
      if (now < lock.expireAt) {
        this.metrics.lockContention++;
        return null; // Lock failed
      }
    }

    const lockId = Math.random().toString(36).substring(2);
    this.locks.set(lockKey, { lockId, expireAt: now + ttlMs });
    this.metrics.lockAcquisitions++;
    return lockId;
  }

  async releaseLock(resourceKey, lockId) {
    this._checkFailure();
    const lockKey = `lock:${resourceKey}`;
    if (this.locks.has(lockKey)) {
      const lock = this.locks.get(lockKey);
      if (lock.lockId === lockId) {
        this.locks.delete(lockKey);
        return true;
      }
    }
    return false;
  }

  // Pub/Sub
  subscribe(channel, callback) {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel).add(callback);
    return () => {
      if (this.subscribers.has(channel)) {
        this.subscribers.get(channel).delete(callback);
      }
    };
  }

  publish(channel, message) {
    this._checkFailure();
    this.metrics.pubSubMessages++;
    if (this.subscribers.has(channel)) {
      for (const cb of this.subscribers.get(channel)) {
        try {
          cb(message);
        } catch (e) {}
      }
    }
  }

  getMetrics() {
    const sorted = [...this.metrics.latencies].sort((a, b) => a - b);
    const count = sorted.length;
    const hitRate = this.metrics.gets > 0 ? (this.metrics.hits / this.metrics.gets) * 100 : 100;
    
    // Top 5 Hot Keys
    const hotKeys = [...this.metrics.hotKeyAccesses.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k, cnt]) => ({ key: k, accesses: cnt }));

    return {
      totalOps: this.metrics.totalOps,
      gets: this.metrics.gets,
      sets: this.metrics.sets,
      dels: this.metrics.dels,
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      hitRatePercent: parseFloat(hitRate.toFixed(2)),
      evictions: this.metrics.evictions,
      memoryBytes: this.usedMemoryBytes,
      maxMemoryBytes: this.maxMemoryBytes,
      lockAttempts: this.metrics.lockAttempts,
      lockAcquisitions: this.metrics.lockAcquisitions,
      lockContention: this.metrics.lockContention,
      pubSubMessages: this.metrics.pubSubMessages,
      hotKeys,
      p50LatencyMs: count ? sorted[Math.floor(count * 0.50)] : 0,
      p95LatencyMs: count ? sorted[Math.floor(count * 0.95)] : 0,
      p99LatencyMs: count ? sorted[Math.floor(count * 0.99)] : 0,
    };
  }
}

module.exports = { MockRedis };
