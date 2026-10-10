# SpiceGarden Performance Remediation — 05: PgBouncer Connection Multiplexing

**Target Release Candidate:** SpiceGarden v1.0.0-rc1  
**Audit Date:** 2026-10-02  

---

## 1. Connection Multiplexing Architecture

```mermaid
graph TD
    P1[Backend Pod 1 (20 conns)] --> PB[PgBouncer Multiplexer]
    P2[Backend Pod 2 (20 conns)] --> PB
    PN[Backend Pod N (20 conns)] --> PB
    PB -->|50-100 Physical Sockets| DB[(PostgreSQL 16 Primary)]
```

---

## 2. Configuration Parameters

* **Pool Mode:** `transaction` pooling mode.
* **Max Client Connections:** 5,000 client sockets.
* **Default Pool Size:** 50 physical PostgreSQL connections.
* **Reserve Pool Size:** 10 connections for traffic surges.
* **Server Idle Timeout:** 600 seconds.
* **Prepared Statement Compatibility:** TypeORM configured with anonymous prepared statements (`prepareThreshold: 0`) ensuring complete compatibility with transaction-mode pooling.
