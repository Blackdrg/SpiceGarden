# SPICEGARDEN — 1,000,000 VU SCALE & BENCHMARK REPRODUCTION GUIDE

**Document Control:** `REPRO-GUIDE-1M-001`  
**Classification:** `TECHNICAL AUDIT / SRE RUNBOOK`  
**Target Concurrency:** `1,000,000 Virtual Users (VUs) & 300,000 Concurrent WebSockets`  
**Authoritative Git SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Release Candidate:** `v1.0.0-rc1`  
**Date:** `2026-10-03`  

---

## 1. Objective & Target Specification

This guide allows an independent engineer, auditor, or SRE team to reproduce the entire SpiceGarden scale testing campaign from single-host baseline tiers (1K, 5K, 10K, 16.85K, 22.4K) up to the distributed Linux 1,000,000 VU benchmark architecture.

---

## 2. Infrastructure Architecture & Fleet Provisioning

### A. Load Generator Fleet (Distributed Linux)
To avoid the Windows Winsock port exhaustion (`WSAENOBUFS` 10055) encountered at 22,400 VUs on single-workstation runs:
- **Fleet Size:** 40× AWS EC2 `c6i.2xlarge` instances (8 vCPU, 16 GiB RAM, Ubuntu 22.04 LTS).
- **Kernel & Network Tuning:**
  ```bash
  sudo sysctl -w net.ipv4.ip_local_port_range="1024 65535"
  sudo sysctl -w fs.file-max=2097152
  sudo sysctl -w net.core.somaxconn=65535
  sudo sysctl -w net.ipv4.tcp_tw_reuse=1
  sudo sysctl -w net.ipv4.tcp_fin_timeout=15
  ulimit -n 1048576
  ```

### B. Application & Ingress Tier
- **Load Balancers:** 3× AWS Application Load Balancers (ALBs) deployed across 3 Availability Zones.
- **EKS Worker Nodes:** 15× `c6i.4xlarge` (16 vCPU, 32 GiB RAM).
- **Backend Pods:** 120 pods of `@spicegarden/backend` managed by Horizontal Pod Autoscaler (HPA), scaled between 15 and 120 replicas based on 70% target CPU utilization.
- **Resource Allocations per Pod:**
  - `requests`: CPU `500m`, Memory `512Mi`
  - `limits`: CPU `1000m`, Memory `1024Mi`
  - `NODE_OPTIONS`: `--max-old-space-size=768`

### C. Database Tier (PostgreSQL 16 & PgBouncer)
- **Primary Database:** AWS RDS Aurora PostgreSQL `db.r6g.16xlarge` (64 vCPU, 512 GiB RAM, Provisioned IOPS).
- **Read Replicas:** 4× AWS RDS Aurora `db.r6g.8xlarge` for catalog browse & search offloading.
- **Connection Multiplexing:** 6× PgBouncer pods deployed in `transaction` pooling mode:
  - `default_pool_size = 50`
  - `max_client_conn = 10000`
  - `pool_mode = transaction`

### D. Caching & Queue Tier
- **Redis Cluster:** AWS ElastiCache for Redis 7.2, 6-shard cluster (12 nodes, `cache.r6g.2xlarge`) with clustering and multi-AZ failover enabled.
- **BullMQ Workers:** 20 dedicated background worker pods for async order dispatch, KDS sync, and push notifications.

---

## 3. Workload Mix & Parameter Specification

The test runs the authentic, multi-tenant food delivery workload defined in [`infra/load-tests/1m/scenario.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/load-tests/1m/scenario.js):

| Workload Flow | Traffic Share | VUs @ 1M Scale | Protocol / Endpoints |
| :--- | :--- | :--- | :--- |
| **Catalog & Restaurant Browse** | 45.0% | 450,000 VUs | `GET /restaurants`, `GET /restaurants/:id/menu` |
| **Search & Filtering** | 20.0% | 200,000 VUs | `GET /restaurants/search?q=:term` |
| **Cart & Promotions** | 10.0% | 100,000 VUs | `POST /cart/items`, `POST /promotions/validate` |
| **Checkout & Idempotent Orders** | 8.0% | 80,000 VUs | `POST /orders` (with `Idempotency-Key` & JWT) |
| **Live Tracking & WebSockets** | 14.0% | 140,000 VUs | `GET /orders/:id/track` + Socket.IO room subscribe |
| **Kitchen / KDS Updates** | 1.5% | 15,000 VUs | `PATCH /kitchen/orders/:id/status` |
| **Delivery Partner Location Updates** | 1.0% | 10,000 VUs | `POST /delivery/location` + Socket.IO driver broadcast |
| **Super Admin & Analytics** | 0.5% | 5,000 VUs | `GET /admin/analytics/overview`, `GET /admin/fraud` |
| **Total Concurrency** | **100.0%** | **1,000,000 VUs** | **300,000 Concurrent WebSockets Active** |

---

## 4. Step-by-Step Reproduction Execution

### Step 1: Clone Repository & Verify Baseline
```bash
git clone https://github.com/Blackdrg/SpiceGarden.git
cd SpiceGarden
git checkout ca349e510d3c18a7517da7502f70ef15bd37fe77
npm ci
npm run test:unit
```
*Verification requirement: 69 test suites pass, 1,122 tests pass with 0 failures.*

### Step 2: Provision Infrastructure
Deploy Kubernetes manifests:
```bash
kubectl apply -f infra/k8s/secrets.yaml
kubectl apply -f infra/k8s/configmap.yaml
kubectl apply -f infra/k8s/postgres-ha.yaml
kubectl apply -f infra/k8s/redis-cluster.yaml
kubectl apply -f infra/k8s/production-hardened.yaml
kubectl apply -f infra/k8s/cdn-ingress.yaml
```

### Step 3: Seed Synthetic Fixtures & Warm Up Cache
Run the distributed dataset seeder:
```bash
node infra/scripts/e2e-seed-fixtures.js --tenants=50 --restaurants=500 --items=10000 --users=1000000
```

### Step 4: Launch Distributed k6 Campaign
On the central k6 orchestrator node, launch the 40-node distributed executor:
```bash
# Execute 1,000,000 VU Ramp Pattern: 5m ramp to 500k, 10m ramp to 1M, 20m sustained plateau, 5m ramp down
k6 run --out json=qa/performance/1000k/k6_raw.json infra/load-tests/1m/scenario.js
```

### Step 5: Collect Telemetry & Validate Invariants
Execute automated validation checks:
```bash
# Verify business correctness & data integrity under load
node infra/scripts/chaos-runner.js --verify-integrity
node infra/scripts/collect-scale-metrics.js --output=qa/performance/1000k/
```

---

## 5. Result Interpretation & Acceptance SLA

A tier is classified as **`MEASURED / SLA PASS`** only if:
1. Achieved concurrency equals target concurrency for the full 20-minute sustained window.
2. P95 response latency is below **500 ms**.
3. HTTP error rate is below **2.0%**.
4. Zero duplicate order creations or double-spend charges occur.
5. Multi-tenant data isolation is 100% maintained with zero cross-tenant leakage.

If OS socket exhaustion, hardware limits, or pod saturation occurs, the tier is classified as **`OBSERVED / BLOCKED`** or **`MEASURED / DEGRADED`** with full bottleneck disclosure.
