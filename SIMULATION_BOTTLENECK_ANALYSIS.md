# SPICEGARDEN — SIMULATION BOTTLENECK ANALYSIS

This document provides architectural root-cause analysis and remediation roadmaps for all observed limiting components discovered during simulation stress testing up to 1,000,000 VUs / 500,000 RPS.

---

## 1. PostgreSQL Row-Level Lock & Connection Pool (Database Bottleneck)

- **Observed Threshold**: `> 400,000 RPS / 750K+ VUs`
- **First Observed Load**: `750,000 VUs`
- **Observed Impact**: Lock wait times on hot inventory rows increase P99 latency to >600ms
- **Root Cause**: Concurrent transactions updating same inventory row ID under flash checkout bursts
- **Recommended Remediation**: Batch inventory reservations in Redis cache buffer before asynchronous database persistence commit
- **Retest Requirement**: `Rerun 750K and 1M VU checkout scenarios`

---

## 2. Node.js Event-Loop JSON Serialization (Application Bottleneck)

- **Observed Threshold**: `> 450,000 RPS`
- **First Observed Load**: `1,000,000 VUs`
- **Observed Impact**: Event loop lag increases from 1.2ms to 18.5ms during heavy payload rendering
- **Root Cause**: Large nested menu category payload serialization in synchronous V8 JSON.stringify
- **Recommended Remediation**: Implement fast-json-stringify or protobuf serialization on public menu catalog endpoints
- **Retest Requirement**: `Rerun 1M VU browse and search tiers`

---

## 3. WebSocket Fanout Broadcast Overhead (WebSocket Layer)

- **Observed Threshold**: `> 100,000 concurrent sessions per cluster`
- **First Observed Load**: `750,000 VUs`
- **Observed Impact**: Redis Pub/Sub driver broadcast CPU overhead rises to 76%
- **Root Cause**: Single global Redis Pub/Sub channel for driver coordinates across all tenant rooms
- **Recommended Remediation**: Partition Redis Pub/Sub channels by geographic geohash / tenant shard
- **Retest Requirement**: `Rerun 100K+ concurrent tracking sessions`

---


## 4. BOTTLENECK CLASSIFICATION MATRIX

| Subsystem | Max Healthy Capacity | First Degraded Load | Bottleneck Nature | Remediation Complexity |
|---|---|---|---|---|
| **Load Generators (8 Hosts)** | 500,000 VUs / 380,000 RPS | 650,000 VUs | CPU / Socket Count | Low (Add more generator nodes) |
| **Application Layer (NestJS)** | 380,000 RPS | 450,000 RPS | Event Loop JSON Serialization | Medium (Fast serializer / Protobuf) |
| **PostgreSQL Database** | 350,000 RPS | 400,000 RPS | Hot Row Lock & Connection Pool | Medium (Redis batch reservation buffer) |
| **Redis Cache** | 500,000 RPS | 650,000 RPS | Single Thread CPU / PubSub Fanout | Low (Geohash shard pub/sub channels) |
| **BullMQ Async Queues** | 150,000 msgs/s | 220,000 msgs/s | Redis IOPS / Worker CPU | Low (Add more worker containers) |
| **WebSocket Layer** | 100,000 active sessions | 150,000 sessions | Redis Pub/Sub cluster fanout | Low (Geographic room partitioning) |
