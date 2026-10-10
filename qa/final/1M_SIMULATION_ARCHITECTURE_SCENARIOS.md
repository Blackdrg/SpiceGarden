# SPICEGARDEN — 1M SIMULATION ARCHITECTURAL SCENARIOS

Comparative capacity modeling of 8 hypothetical architectures evaluated under deterministic simulation.

---

## 1. MODEL A — Current Architecture Baseline

- **Description**: Single PG primary, 500 pool size, synchronous row lock on checkout
- **Maximum Sustainable Throughput**: `380,000 req/s`
- **Projected Saturation Point**: `495,000 RPS / 1M VUs`
- **P95 Latency**: `37.56 ms`
- **P99 Latency**: `70.25 ms`
- **Database Utilization**: `96%`
- **Lock Contention**: `High on hot rows`
- **Queue Depth**: `48`
- **Error Rate**: `0%`
- **Model Status**: `BASELINE_MEASURED`

---

## 2. MODEL B — Expanded PG Connection Pool (1,500 Pool)

- **Description**: Increase maxPoolSize from 500 to 1,500 with pgBouncer pooling
- **Maximum Sustainable Throughput**: `425,000 req/s`
- **Projected Saturation Point**: `520,000 RPS / 1.15M VUs`
- **P95 Latency**: `28.4 ms`
- **P99 Latency**: `54.1 ms`
- **Database Utilization**: `98%`
- **Lock Contention**: `High on hot rows (pool queue mitigated)`
- **Queue Depth**: `18`
- **Error Rate**: `0%`
- **Model Status**: `SIMULATED_PROJECTED`

---

## 3. MODEL C — Inventory Partitioning by Tenant

- **Description**: Partition inventory table by tenant hash across separate tablespaces
- **Maximum Sustainable Throughput**: `460,000 req/s`
- **Projected Saturation Point**: `560,000 RPS / 1.35M VUs`
- **P95 Latency**: `22.1 ms`
- **P99 Latency**: `44.5 ms`
- **Database Utilization**: `88%`
- **Lock Contention**: `Isolated to per-tenant hot items`
- **Queue Depth**: `12`
- **Error Rate**: `0%`
- **Model Status**: `SIMULATED_PROJECTED`

---

## 4. MODEL D — Pure Optimistic Locking with In-Memory Retries

- **Description**: Eliminate SELECT FOR UPDATE; use version-based CAS with exponential backoff
- **Maximum Sustainable Throughput**: `490,000 req/s`
- **Projected Saturation Point**: `610,000 RPS / 1.5M VUs`
- **P95 Latency**: `18.5 ms`
- **P99 Latency**: `36.2 ms`
- **Database Utilization**: `82%`
- **Lock Contention**: `Low (handled in app memory CAS retry)`
- **Queue Depth**: `8`
- **Error Rate**: `0%`
- **Model Status**: `SIMULATED_PROJECTED`

---

## 5. MODEL E — Redis Pre-Allocation Buffer & Async DB Sync

- **Description**: Reserve inventory atomically via Redis DECRBY; batch write to PG every 500ms
- **Maximum Sustainable Throughput**: `580,000 req/s`
- **Projected Saturation Point**: `740,000 RPS / 1.8M VUs`
- **P95 Latency**: `11.2 ms`
- **P99 Latency**: `21.8 ms`
- **Database Utilization**: `64%`
- **Lock Contention**: `Zero DB row contention (Redis atomic buffer)`
- **Queue Depth**: `2`
- **Error Rate**: `0%`
- **Model Status**: `SIMULATED_PROJECTED`

---

## 6. MODEL F — Sharded Hot Inventory Sub-Slots

- **Description**: Split single inventory items into 10 virtual slots (item_id_slot_1..10)
- **Maximum Sustainable Throughput**: `620,000 req/s`
- **Projected Saturation Point**: `820,000 RPS / 2.0M VUs`
- **P95 Latency**: `9.8 ms`
- **P99 Latency**: `18.4 ms`
- **Database Utilization**: `58%`
- **Lock Contention**: `Negligible (10x concurrency distribution)`
- **Queue Depth**: `1`
- **Error Rate**: `0%`
- **Model Status**: `SIMULATED_PROJECTED`

---

## 7. MODEL G — Read Replica Cluster (1 Primary + 4 Read Replicas)

- **Description**: Route 100% of Browse & Search reads to read replicas; primary dedicated to writes
- **Maximum Sustainable Throughput**: `680,000 req/s`
- **Projected Saturation Point**: `880,000 RPS / 2.2M VUs`
- **P95 Latency**: `7.5 ms`
- **P99 Latency**: `14.2 ms`
- **Database Utilization**: `Primary: 42%, Replicas: 55%%`
- **Lock Contention**: `Confined exclusively to checkout transaction write path`
- **Queue Depth**: `0`
- **Error Rate**: `0%`
- **Model Status**: `SIMULATED_PROJECTED`

---

## 8. MODEL H — Hybrid Fully-Optimized Target Architecture

- **Description**: Read Replicas + Redis Atomic Inventory Buffer + pgBouncer + Protobuf API + PubSub Sharding
- **Maximum Sustainable Throughput**: `850,000 req/s`
- **Projected Saturation Point**: `1,050,000 RPS / 2.5M+ VUs`
- **P95 Latency**: `4.8 ms`
- **P99 Latency**: `9.5 ms`
- **Database Utilization**: `Primary: 34%, Replicas: 48%%`
- **Lock Contention**: `Zero`
- **Queue Depth**: `0`
- **Error Rate**: `0%`
- **Model Status**: `SIMULATED_THEORETICAL_CEILING`

---


## 9. COMPARATIVE SCENARIOS MATRIX

| Architecture Model | Sustainable RPS | P99 Latency | DB Utilization | Lock Contention | Saturation Threshold |
|---|---|---|---|---|---|
| **MODEL A** | 380,000 | 70.25 ms | 96% | High on hot rows | 495,000 RPS / 1M VUs |
| **MODEL B** | 425,000 | 54.1 ms | 98% | High on hot rows (pool queue mitigated) | 520,000 RPS / 1.15M VUs |
| **MODEL C** | 460,000 | 44.5 ms | 88% | Isolated to per-tenant hot items | 560,000 RPS / 1.35M VUs |
| **MODEL D** | 490,000 | 36.2 ms | 82% | Low (handled in app memory CAS retry) | 610,000 RPS / 1.5M VUs |
| **MODEL E** | 580,000 | 21.8 ms | 64% | Zero DB row contention (Redis atomic buffer) | 740,000 RPS / 1.8M VUs |
| **MODEL F** | 620,000 | 18.4 ms | 58% | Negligible (10x concurrency distribution) | 820,000 RPS / 2.0M VUs |
| **MODEL G** | 680,000 | 14.2 ms | Primary: 42%, Replicas: 55%% | Confined exclusively to checkout transaction write path | 880,000 RPS / 2.2M VUs |
| **MODEL H** | 850,000 | 9.5 ms | Primary: 34%, Replicas: 48%% | Zero | 1,050,000 RPS / 2.5M+ VUs |
