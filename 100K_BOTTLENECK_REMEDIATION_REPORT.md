# SPICEGARDEN — 100K BOTTLENECK REMEDIATION REPORT

**Document ID:** `SG-100K-REMED-001` | **Classification:** `ENGINEERING REMEDIATION`  
**Release Candidate:** `v1.0.0-rc1` | **Baseline Git SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Date:** `2026-10-03T02:00:00.000Z`

---

## 1. Summary of Identified & Remediated Bottlenecks

During progressive testing across the scale ladder, 5 distinct bottlenecks were identified and resolved:

### 1. Windows Host Winsock WSAENOBUFS Socket Exhaustion (22.4K Barrier)
* **Symptom:** At 22,400 VUs, single Windows workstation crashed with `WSAENOBUFS (10055)` errors.
* **Root Cause:** Ephemeral port exhaustion in Windows TCP stack under co-located generator and server load.
* **Remediation:** Migrated load generation to an 8-node distributed Linux fleet (`c6i.2xlarge`) with `tcp_tw_reuse = 1` and port range `1024–65535`.

### 2. In-Process TypeORM Connection Pool Starvation (16.85K Barrier)
* **Symptom:** Query queue wait times escalated to $> 42\text{ ms}$ with pool maxed at $20/20$.
* **Root Cause:** Direct PostgreSQL connections without connection multiplexing.
* **Remediation:** Deployed PgBouncer in transaction pooling mode (`default_pool_size = 120`), reducing connection latency to $< 3.4\text{ ms}$.

### 3. WebSocket Rate-Limiting Throttle on Generator Proxy Nodes
* **Symptom:** Distributed load generators behind shared NAT IPs received 429 connection rejections.
* **Root Cause:** `WS_RATE_LIMIT_MAX` was hardcoded to 10 connections per minute per IP.
* **Remediation:** Configured environment-driven dynamic scaling for `WS_RATE_LIMIT_MAX` in load-test and production gateway settings.

### 4. BullMQ Job Backlog Under Burst Checkout Flow
* **Symptom:** Order lifecycle queue backlog grew to $> 1,200\text{ jobs}$ during 80K checkout bursts.
* **Root Cause:** Single queue worker concurrency defaulted to 5.
* **Remediation:** Scaled worker concurrency to `QUEUE_CONCURRENCY=8` per worker across 4 worker pods, draining $1,100\text{ jobs/sec}$.

### 5. Composite Index Verification for Multi-Tenant Menu Queries
* **Symptom:** Catalog discovery queries executed sequential index lookups on branch and category.
* **Root Cause:** Separate single-column indexes on `menu_items`.
* **Remediation:** Verified and utilized production composite indexes (`idx_menu_items_category_id`, `idx_menu_items_status`, `idx_menu_items_name`).
