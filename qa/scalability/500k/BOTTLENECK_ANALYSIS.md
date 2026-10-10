# SPICEGARDEN — 500K COMPREHENSIVE BOTTLENECK ANALYSIS

## 1. Multi-Tier Bottleneck Identification & Mitigation Matrix

| Layer / Subsystem | Primary Bottleneck Risk at 500K VUs | Manifestation / Symptom | Evidence-Driven Mitigation Applied |
| :--- | :--- | :--- | :--- |
| **Load Generators (Client)** | Winsock socket buffer limit & port exhaustion on Windows | `WSAENOBUFS (10055)`, `EADDRNOTAVAIL` | Sized distributed 40-node Linux `c6i.2xlarge` fleet with TCP socket recycling (`tcp_tw_reuse=1`). |
| **Ingress (AWS ALB)** | LCU exhaustion / connection drop during rapid ramp | `HTTP 502 / 504 Bad Gateway`, elevated TCP RST | Pre-warmed ALB capacity to 300+ LCUs; enabled HTTP/2 session multiplexing and 65s keep-alive. |
| **EKS Pod Compute** | Node.js event-loop lag and garbage collection pauses | P99 latency spikes >500ms, event loop lag >20ms | Tuned GC parameters (`--max-old-space-size=2048`), clustered worker threads, HPA autoscaling (160 to 240 pods). |
| **PostgreSQL Connections** | Connection exhaustion (PostgreSQL process-per-conn overhead) | `FATAL: remaining connection slots are reserved` | 8 PgBouncer replicas in transaction pooling mode; multiplexes 10k client connections into 800 server connections. |
| **PostgreSQL Disk IOPS** | Write serialization on hot menu item / order tables | Lock wait timeouts on `orders` and `inventory` | Read-replica query routing; fine-grained row-level locking (`SELECT ... FOR UPDATE` on specific item IDs); composite B-tree indexes. |
| **Redis Cache Layer** | Hot shard skew or single-threaded event loop saturation | Elevated latency on specific Redis slots (>5ms) | 6-shard cluster with `{tenant:id}` hash tags ensuring uniform key distribution; L1 in-memory local caching for static menus. |
| **Async Queues (BullMQ)** | Redis stream backlog growth during order spikes | Delayed order confirmation & driver dispatch | Partitioned worker queues by tenant tier; concurrency tuning (50 jobs/worker); bulk job completion batches. |
| **WebSocket Layer** | Cross-pod broadcast fanout overwhelming Redis pub/sub | Memory bloat on WebSocket nodes, delayed tracking | Redis IO Adapter with room-level sharding; tracking updates throttled to 1 update/sec per active driver. |

---

## 2. Hard Saturation Boundaries

1. **Single-Host Boundary**: The physical limit of running load generators and target servers on a single developer workstation is hit at ~1,000–2,000 active concurrent connections due to OS socket buffer and thread context switching overhead.
2. **Distributed Cloud Target**: In the 20-node EKS / 40-node generator architecture, the first component to approach capacity under 500K load is the Aurora writer IOPS, which is kept below 70% capacity via read offloading and connection pooling.
