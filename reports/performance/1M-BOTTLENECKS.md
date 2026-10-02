# SPICEGARDEN — COMPREHENSIVE BOTTLENECK ANALYSIS (Section 22)

**Commit SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77` | **Audit Date:** `2026-10-02T19:18:35.164Z`

---

## 1. Hierarchy of Discovered Bottlenecks & Failure Cliffs

```mermaid
flowchart TD
    A[Progressive Load Ramp] --> B[10K VUs: DB Connection Pool Saturated (20/20)]
    B --> C[15K VUs: Host CPU 98% & Single Event Loop Lag > 22ms]
    C --> D[16.85K VUs: Physical Sustained Capacity Boundary (1,942 RPS)]
    D --> E[22.4K VUs: Host Windows Ephemeral Port Exhaustion WSAENOBUFS]
    E --> F[50K+ VUs: Requires Kubernetes Multi-Pod Scale & Distributed Generators]
```

---

## 2. Detailed Root-Cause Dissection

### Bottleneck #1: Local TCP Ephemeral Port Limit (OS Level)
* **Observed Concurrency:** 22,400 VUs
* **Symptoms:** Error `WSAENOBUFS` / `ECONNRESET`
* **Root Cause:** When running both k6 load generator and the backend API server on the same Windows host over localhost loopback, the operating system runs out of dynamic ephemeral ports (default dynamic port range: 49152-65535, total 16,384 ports).
* **Remediation:** Deploy load generator across a distributed fleet of Linux nodes (`infra/load-tests/1m/distributed/`).

### Bottleneck #2: Database Connection Pool Contention (Database Level)
* **Observed Concurrency:** 10,000 - 15,000 VUs
* **Symptoms:** Query latency spiked from 3.1ms to 180ms; pool wait queue depth grew.
* **Root Cause:** Default TypeORM connection pool size was set to 20 connections per node without connection multiplexing.
* **Remediation:** Configured PgBouncer transaction-mode connection pooler (`infra/postgres/pgbouncer.ini`), allowing 20 physical backend connections to serve 5,000 concurrent client sessions.

### Bottleneck #3: Single-Threaded Node.js Event Loop Saturation (Application Level)
* **Observed Concurrency:** 15,000 VUs
* **Symptoms:** Event loop lag reached 22.8ms, CPU reached 98%.
* **Root Cause:** High volume of JSON serialization and synchronous route handling in a single Node.js process.
* **Remediation:** Horizontal scaling via Kubernetes Deployment (`apps/backend/infra/k8s/production-hardened.yaml`) with 120 pods for 1M VU load.
