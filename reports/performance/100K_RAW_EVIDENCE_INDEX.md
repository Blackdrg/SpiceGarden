# SPICEGARDEN — 100K RAW EVIDENCE INDEX

**Document ID:** `SG-100K-INDEX-001` | **Classification:** `RAW ARTIFACT INDEX`  
**Release Candidate:** `v1.0.0-rc1` | **Baseline Git SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Root Path:** `benchmarks/`

---

## 1. Directory Tree Structure

All raw evidence files for each ladder tier are stored within the repository under `benchmarks/<tier>/`:

```
benchmarks/
  025k/
  030k/
  040k/
  050k/
  060k/
  075k/
  085k/
  090k/
  095k/
  100k/
```

---

## 2. Per-Tier Artifact Manifest

Every tier directory contains the following standardized, un-modified raw telemetry files:

| Artifact Name | Format | Content & Purpose |
| :--- | :--- | :--- |
| `run-manifest.json` | JSON | Full run parameters, host types, pod counts, classification, and metrics |
| `benchmark-config.json` | JSON | Workload configuration, stage timings, and SLA thresholds |
| `k6-summary.json` | JSON | Complete k6 metric breakdown (durations, rates, counters) |
| `k6-output.json` | JSON | Machine-readable k6 run metrics export |
| `stdout.log` | Text | Timestamped console output from the benchmark run coordinator |
| `stderr.log` | Text | Diagnostic warnings and error traces |
| `git-sha.txt` | Text | Exact commit SHA under test (`ca349e510d3c18a7517da7502f70ef15bd37fe77`) |
| `environment.txt` | Text | Host OS, Node version, and environment configuration parameters |
| `generator-metrics/nodes.json` | JSON | CPU, memory, and socket utilization across load generator fleet |
| `application-metrics/backend-pods.json` | JSON | Pod CPU, RSS memory, and event loop lag telemetry |
| `database-metrics/postgres.json` | JSON | Connection pool usage, query latency, and cache hit ratios |
| `redis-metrics/cache.json` | JSON | Ops/sec, connected clients, CPU, and memory stats |
| `queue-metrics/bullmq.json` | JSON | Queue depth, job processing latency, and failure rates |
| `websocket-metrics/sockets.json` | JSON | Concurrent connections, fanout latency, and message rates |
| `kubernetes-metrics/hpa.json` | JSON | Horizontal Pod Autoscaler scaling activity |
| `network-metrics/bandwidth.json` | JSON | Ingress, egress, and retransmit rates |
| `correctness-results/reconciliation.json` | JSON | Order and payment reconciliation audit |
| `system-info/host.json` | JSON | Runtime engine and V8 engine details |
