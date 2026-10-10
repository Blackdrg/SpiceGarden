# SPICEGARDEN — 500K DATABASE & PGBOUNCER RECONCILIATION

**Document ID:** `AUDIT-500K-DB-001`  
**Classification:** `DATABASE ARCHITECTURE & CAPACITY AUDIT`  
**Date:** `2026-10-03T02:45:00.000Z`

---

## 1. Database Workload Profile at 500K Concurrency

At a 500K concurrency workload delivering $58,000\text{ HTTP RPS}$:
* **Total Database Query Rate:** $\approx 34,800\text{ QPS}$ (across reads and writes)
  * **Write Transaction Rate:** $\approx 4,640\text{ Write TPS}$ (8% checkout $+ 1.5\%$ KDS $+ 1\%$ driver updates)
  * **Read Query Rate:** $\approx 30,160\text{ Read QPS}$ (cached read pass-through)
* **Average Transaction Duration:** $\le 3.8\text{ ms}$ with TypeORM prepared statements and primary key indexing.

---

## 2. Infrastructure Sizing for 500K Database Layer

| Component | Sizing Specification | Planned Capacity | Target Utilization |
| :--- | :--- | :--- | :--- |
| **Primary Instance** | AWS RDS Aurora PostgreSQL `db.r6g.8xlarge` | 32 vCPU, 256 GB RAM, 25,000 IOPS | $65\% - 72\%$ CPU |
| **Read Replicas** | 2x `db.r6g.4xlarge` Read Replicas | 32 vCPU, 128 GB RAM total | $40\% - 50\%$ CPU |
| **PgBouncer Cluster** | 4x PgBouncer Pods (Transaction Pooling) | 40,000 max client connections | $220 / 400$ backend server pool |
| **Buffer Cache** | Aurora 256 GB RAM | $> 99.0\%$ cache hit ratio | $99.4\%$ projected hit ratio |

---

## 3. PgBouncer Pool Metrics (Modeled vs Empirical)

| Metric | Modeled Target (500K) | Empirical Runtime Logs | Status |
| :--- | :--- | :--- | :--- |
| **`cl_active` (Client Connections)** | 2,500 active pool handles | None | `UNVERIFIED` |
| **`cl_waiting` (Queued Clients)** | 0 queued clients | None | `UNVERIFIED` |
| **`sv_active` (Active Server Conns)** | 220 server connections | None | `UNVERIFIED` |
| **`sv_idle` (Idle Server Conns)** | 80 server connections | None | `UNVERIFIED` |
| **`maxwait` (Max Pool Wait Time)** | $< 4.5\text{ ms}$ | None | `UNVERIFIED` |
| **Replication Lag** | $< 15\text{ ms}$ across AZs | None | `UNVERIFIED` |

---

## 4. Forensic Finding

The database and PgBouncer architecture is properly dimensioned for 500K VUs via transaction pooling and Aurora read-scaling. However, all metrics reflect a **theoretical engineering model** rather than live database query execution.
