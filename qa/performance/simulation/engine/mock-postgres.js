/**
 * SPICEGARDEN SIMULATION - Mock PostgreSQL Adapter
 * High-performance in-memory transactional multi-tenant relational store.
 * Supports row/indexed lookup, unique constraints, foreign keys, optimistic locking,
 * transaction conflicts, deadlocks, connection pool simulation, and latency modeling.
 */

const crypto = require('crypto');

class MockPostgres {
  constructor(options = {}) {
    this.maxPoolSize = options.maxPoolSize || 200;
    this.poolQueueLimit = options.poolQueueLimit || 10000;
    this.activeConnections = 0;
    this.waitingConnections = 0;
    this.baseLatencyMs = options.baseLatencyMs || 1.2;
    this.chaosLatencyMs = 0;
    this.chaosDeadlockRate = 0;
    this.chaosTimeoutRate = 0;
    this.chaosExhaustion = false;

    // Relational Tables (Tenant Isolated)
    this.tables = {
      tenants: new Map(),
      restaurants: new Map(),
      categories: new Map(),
      menu_items: new Map(),
      menu_addons: new Map(),
      inventory: new Map(),
      orders: new Map(),
      order_items: new Map(),
      payments: new Map(),
      drivers: new Map(),
      tracking_sessions: new Map(),
      kitchen_tickets: new Map(),
      coupons: new Map(),
      audit_logs: new Map(),
    };

    // Indexes: table -> indexName -> Map(key -> Set(id))
    this.indexes = {
      restaurants: { tenantId: new Map(), city: new Map(), cuisine: new Map() },
      menu_items: { restaurantId: new Map(), categoryId: new Map(), tenantId: new Map() },
      orders: { tenantId: new Map(), customerId: new Map(), restaurantId: new Map(), status: new Map() },
      payments: { orderId: new Map(), idempotencyKey: new Map(), tenantId: new Map() },
      inventory: { tenantId: new Map(), itemId: new Map() },
      kitchen_tickets: { tenantId: new Map(), restaurantId: new Map(), orderId: new Map() },
      tracking_sessions: { orderId: new Map(), driverId: new Map() }
    };

    // Metrics Tracking
    this.metrics = {
      totalQueries: 0,
      reads: 0,
      writes: 0,
      transactions: 0,
      committedTransactions: 0,
      rolledBackTransactions: 0,
      transactionConflicts: 0,
      lockWaits: 0,
      deadlocks: 0,
      poolExhaustions: 0,
      poolWaitTimeMs: 0,
      latencies: [],
      errorCount: 0
    };
  }

  setChaosMode(config = {}) {
    this.chaosLatencyMs = config.latencyMs || 0;
    this.chaosDeadlockRate = config.deadlockRate || 0;
    this.chaosTimeoutRate = config.timeoutRate || 0;
    this.chaosExhaustion = !!config.exhaustion;
  }

  resetChaosMode() {
    this.chaosLatencyMs = 0;
    this.chaosDeadlockRate = 0;
    this.chaosTimeoutRate = 0;
    this.chaosExhaustion = false;
  }

  async acquireConnection() {
    if (this.chaosExhaustion || this.activeConnections >= this.maxPoolSize) {
      if (this.waitingConnections >= this.poolQueueLimit || this.chaosExhaustion) {
        this.metrics.poolExhaustions++;
        throw new Error('PostgresPoolExhaustionError: Max connections and queue reached');
      }
      this.waitingConnections++;
      this.metrics.lockWaits++;
      // Wait simulated queue time
      await new Promise(res => setTimeout(res, 5));
      this.waitingConnections--;
    }
    this.activeConnections++;
    return {
      release: () => {
        if (this.activeConnections > 0) this.activeConnections--;
      }
    };
  }

  _recordQuery(type, startMs) {
    this.metrics.totalQueries++;
    if (type === 'read') this.metrics.reads++;
    if (type === 'write') this.metrics.writes++;
    const duration = (performance.now() - startMs) + this.baseLatencyMs + this.chaosLatencyMs;
    this.metrics.latencies.push(duration);
    if (this.metrics.latencies.length > 50000) {
      this.metrics.latencies.splice(0, 10000); // keep memory bounded
    }
  }

  // Insert Record with Indexes and Unique Constraints
  async insert(tableName, record, options = {}) {
    const conn = await this.acquireConnection();
    const startMs = performance.now();
    try {
      if (this.chaosTimeoutRate > 0 && Math.random() < this.chaosTimeoutRate) {
        throw new Error('PostgresQueryTimeout: Query exceeded 5000ms threshold');
      }

      const table = this.tables[tableName];
      if (!table) throw new Error(`Table ${tableName} does not exist`);

      if (!record.id) {
        record.id = crypto.randomUUID();
      }
      if (!record.created_at) {
        record.created_at = new Date().toISOString();
      }
      record.version = 1;

      // Unique Constraint Check
      if (table.has(record.id)) {
        throw new Error(`UniqueConstraintViolation: Key (id)=(${record.id}) already exists in ${tableName}`);
      }

      // Foreign Key Validation (tenantId)
      if (record.tenant_id && tableName !== 'tenants') {
        if (!this.tables.tenants.has(record.tenant_id)) {
          throw new Error(`ForeignKeyViolation: tenant_id ${record.tenant_id} does not exist in tenants`);
        }
      }

      // Save
      table.set(record.id, { ...record });

      // Update Indexes
      this._updateIndexes(tableName, record, 'insert');

      this._recordQuery('write', startMs);
      return { ...record };
    } finally {
      conn.release();
    }
  }

  // Find By ID with Tenant Isolation Check
  async findById(tableName, id, tenantId = null) {
    const conn = await this.acquireConnection();
    const startMs = performance.now();
    try {
      const table = this.tables[tableName];
      if (!table) throw new Error(`Table ${tableName} does not exist`);
      const record = table.get(id);
      if (!record) return null;

      if (tenantId) {
        if (record.tenant_id && record.tenant_id !== tenantId) {
          // Cross-tenant leak prevention: return null as if non-existent
          return null;
        }
        if (tableName === 'tenants' && record.id !== tenantId) {
          return null;
        }
      }

      this._recordQuery('read', startMs);
      return { ...record };
    } finally {
      conn.release();
    }
  }

  // Query by Indexed or Filtered Field
  async query(tableName, filter = {}, limit = 100, offset = 0) {
    const conn = await this.acquireConnection();
    const startMs = performance.now();
    try {
      const table = this.tables[tableName];
      if (!table) throw new Error(`Table ${tableName} does not exist`);

      let results = [];

      // Check if we can use an index
      const tableIdx = this.indexes[tableName];
      const filterKeys = Object.keys(filter);
      let matchedIndexKey = filterKeys.find(k => tableIdx && tableIdx[k]);

      if (matchedIndexKey && tableIdx[matchedIndexKey].has(filter[matchedIndexKey])) {
        const idSet = tableIdx[matchedIndexKey].get(filter[matchedIndexKey]);
        for (const id of idSet) {
          const rec = table.get(id);
          if (rec && this._matchesFilter(rec, filter)) {
            results.push({ ...rec });
          }
        }
      } else {
        // Full table scan
        for (const rec of table.values()) {
          if (this._matchesFilter(rec, filter)) {
            results.push({ ...rec });
          }
        }
      }

      const paged = results.slice(offset, offset + limit);
      this._recordQuery('read', startMs);
      return paged;
    } finally {
      conn.release();
    }
  }

  // Optimistic Locking Update
  async update(tableName, id, updates, expectedVersion = null) {
    const conn = await this.acquireConnection();
    const startMs = performance.now();
    try {
      if (this.chaosDeadlockRate > 0 && Math.random() < this.chaosDeadlockRate) {
        this.metrics.deadlocks++;
        throw new Error('PostgresDeadlockDetected: Deadlock detected in transaction graph');
      }

      const table = this.tables[tableName];
      if (!table) throw new Error(`Table ${tableName} does not exist`);
      const existing = table.get(id);
      if (!existing) throw new Error(`Record ${id} not found in ${tableName}`);

      if (expectedVersion !== null && existing.version !== expectedVersion) {
        this.metrics.transactionConflicts++;
        throw new Error(`OptimisticLockConflict: Expected version ${expectedVersion}, found ${existing.version}`);
      }

      const oldRecord = { ...existing };
      const updated = {
        ...existing,
        ...updates,
        id, // immutable
        tenant_id: existing.tenant_id, // immutable
        version: existing.version + 1,
        updated_at: new Date().toISOString()
      };

      table.set(id, updated);
      this._updateIndexes(tableName, updated, 'update', oldRecord);

      this._recordQuery('write', startMs);
      return { ...updated };
    } finally {
      conn.release();
    }
  }

  // Transaction Simulator
  async transaction(fn) {
    this.metrics.transactions++;
    const conn = await this.acquireConnection();
    const rollbackLog = [];
    const txContext = {
      insert: async (tbl, rec) => {
        const created = await this.insert(tbl, rec);
        rollbackLog.push({ type: 'delete', tbl, id: created.id });
        return created;
      },
      update: async (tbl, id, up, ver) => {
        const prev = await this.findById(tbl, id);
        const updated = await this.update(tbl, id, up, ver);
        rollbackLog.push({ type: 'restore', tbl, id, record: prev });
        return updated;
      },
      findById: (tbl, id, tenantId) => this.findById(tbl, id, tenantId),
      query: (tbl, filter, limit) => this.query(tbl, filter, limit)
    };

    try {
      const result = await fn(txContext);
      this.metrics.committedTransactions++;
      return result;
    } catch (err) {
      this.metrics.rolledBackTransactions++;
      // Rollback
      for (const op of rollbackLog.reverse()) {
        if (op.type === 'delete') {
          this.tables[op.tbl].delete(op.id);
        } else if (op.type === 'restore') {
          this.tables[op.tbl].set(op.id, op.record);
        }
      }
      throw err;
    } finally {
      conn.release();
    }
  }

  _matchesFilter(rec, filter) {
    for (const [k, v] of Object.entries(filter)) {
      if (rec[k] !== v) return false;
    }
    return true;
  }

  _updateIndexes(tableName, record, action, oldRecord = null) {
    const tableIdx = this.indexes[tableName];
    if (!tableIdx) return;

    for (const idxKey of Object.keys(tableIdx)) {
      const indexMap = tableIdx[idxKey];
      if (action === 'update' && oldRecord && oldRecord[idxKey]) {
        const oldVal = oldRecord[idxKey];
        if (indexMap.has(oldVal)) {
          indexMap.get(oldVal).delete(oldRecord.id);
        }
      }
      const val = record[idxKey];
      if (val !== undefined && val !== null) {
        if (!indexMap.has(val)) {
          indexMap.set(val, new Set());
        }
        indexMap.get(val).add(record.id);
      }
    }
  }

  getMetrics() {
    const sorted = [...this.metrics.latencies].sort((a, b) => a - b);
    const count = sorted.length;
    return {
      totalQueries: this.metrics.totalQueries,
      reads: this.metrics.reads,
      writes: this.metrics.writes,
      transactions: this.metrics.transactions,
      committedTransactions: this.metrics.committedTransactions,
      rolledBackTransactions: this.metrics.rolledBackTransactions,
      transactionConflicts: this.metrics.transactionConflicts,
      lockWaits: this.metrics.lockWaits,
      deadlocks: this.metrics.deadlocks,
      poolExhaustions: this.metrics.poolExhaustions,
      activeConnections: this.activeConnections,
      maxPoolSize: this.maxPoolSize,
      p50LatencyMs: count ? sorted[Math.floor(count * 0.50)] : 0,
      p95LatencyMs: count ? sorted[Math.floor(count * 0.95)] : 0,
      p99LatencyMs: count ? sorted[Math.floor(count * 0.99)] : 0,
      p999LatencyMs: count ? sorted[Math.floor(count * 0.999)] : 0,
    };
  }
}

module.exports = { MockPostgres };
