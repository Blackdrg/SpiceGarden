# SPICEGARDEN — 100K REPRODUCTION GUIDE

**Document ID:** `SG-100K-REPRO-001` | **Classification:** `OPERATIONAL RUNBOOK`  
**Release Candidate:** `v1.0.0-rc1` | **Baseline Git SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Date:** `2026-10-03T02:00:00.000Z`

---

## 1. Prerequisites

1. **Target Environment:** Kubernetes cluster with $\ge 10$ Backend Pods, PostgreSQL with PgBouncer, and Redis Cluster.
2. **Load Generator Fleet:** 8x Linux EC2 `c6i.2xlarge` instances running Ubuntu 22.04 LTS with `k6` installed.

---

## 2. Execution Steps

### Step 1: Kernel Tuning on Generator Fleet
```bash
sudo sysctl -w fs.file-max=2097152
sudo sysctl -w net.core.somaxconn=65535
sudo sysctl -w net.ipv4.ip_local_port_range="1024 65535"
sudo sysctl -w net.ipv4.tcp_tw_reuse=1
sudo sysctl -w net.ipv4.tcp_fin_timeout=15
ulimit -n 1048576
```

### Step 2: Seed Test Data & Verify Stack
```bash
npm run verify:stack
node infra/scripts/e2e-seed-fixtures.js
```

### Step 3: Run Distributed 100K Scenario
```bash
# On each of the 8 generator nodes (12,500 VUs each):
k6 run infra/load-tests/1m/scenario.js \
  -e TARGET_VUS=12500 \
  -e BASE_URL=https://api.spicegarden.internal \
  -e WS_BASE_URL=wss://api.spicegarden.internal \
  --out json=raw-metrics-node.json
```

### Step 4: Collect & Reconcile Telemetry
```bash
node infra/scripts/collect-scale-metrics.js
node infra/scripts/analyze-scale-results.js
```
