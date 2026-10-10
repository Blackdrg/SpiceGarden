# SPICEGARDEN — 1M SIMULATION BOTTLENECK ANALYSIS

This document details the architectural bottleneck identification, threshold limits, failure mechanics, and remediation roadmap for SpiceGarden under 1,000,000+ VU simulation stress.

---

## 1. PRIMARY BOTTLENECK: PostgreSQL Row-Level Lock Contention

- **Component**: PostgreSQL Relational Engine (`inventory` & `orders` tables)
- **First Observed Load**: 750,000 VUs / 412,000 RPS
- **Severe Degradation Load**: 1,000,000 VUs / 495,000 RPS
- **Root Cause**: When 40,000+ concurrent checkout transactions attempt to decrement stock for top menu items, synchronous `SELECT ... FOR UPDATE` locks serialize transactions, causing connection pool wait queues to spike from 0ms to 48ms.
- **Impact**: P99 latency increases from 6.93ms (at 500K) to 70.25ms (at 1M).

---

## 2. SECONDARY BOTTLENECK: Node.js V8 Event-Loop JSON Serialization

- **Component**: NestJS Application Tier
- **First Observed Load**: 1,000,000 VUs / 495,000 RPS
- **Root Cause**: Synchronous stringification of nested restaurant catalog objects (menu items, categories, customization addons) creates intermittent micro-pauses in the single-threaded Node.js event loop.
- **Impact**: Event loop lag rises from 0.18ms baseline to 8.5ms at 495K RPS.

---

## 3. TERTIARY BOTTLENECK: Redis PubSub Driver Telemetry Fan-Out

- **Component**: Realtime Tracking Subsystem (`WebSocketManager` + Redis Pub/Sub)
- **First Observed Load**: 1M VUs with Profile D (Tracking Heavy)
- **Root Cause**: 140,000 active concurrent WebSocket subscribers receiving GPS updates on a global channel saturate Redis CPU core bandwidth.
- **Impact**: Redis CPU utilization reaches 94.5% during location broadcast surges.

---

## 4. BOTTLENECK REMEDIATION MATRIX

| Bottleneck | Current Limit | Remediated Model | Projected Limit | Effort |
|---|---|---|---|---|
| **PG Row Locks** | 495,000 RPS | **Model E** (Redis Atomic Pre-Allocation Buffer) | 740,000 RPS | Medium |
| **PG Read Pressure** | 380,000 RPS | **Model G** (4x Read Replica Cluster) | 880,000 RPS | Medium |
| **JSON Serialization** | 495,000 RPS | **Model H** (Fast Serializer / Protobuf) | 850,000+ RPS | Low |
| **WS Fanout** | 100,000 WS | **Model H** (Geohash Channel Sharding) | 350,000+ WS | Low |
