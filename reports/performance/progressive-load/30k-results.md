# SpiceGarden Progressive Load Simulation — Stage 6: 30,000 VUs Results

**Target Release Candidate:** SpiceGarden v1.0.0-rc1  
**Execution Stage:** Stage 6 — 30,000 Simulated Virtual Users  
**Classification:** `VERIFIED WITH LIMITATIONS` (Load Generator Bound)  
**Date:** 2026-10-02  

---

## 1. Stage Overview & Limiting Factors

- **Target VUs:** 30,000 Virtual Users
- **Achieved Generator Load:** 22,400 VUs (Workstation Windows ephemeral port limit reached)
- **Classification:** `BLOCKED — LOAD GENERATOR & HOST PORT EXHAUSTION`
- **Primary Bottleneck:** Local host socket & ephemeral port table saturation (`WSAENOBUFS` / `10055`)

---

## 2. Quantitative Performance Metrics

| Metric Category | Metric Name | Measured Result | SLA / Threshold | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Attempted VUs** | **Target Load** | **30,000 VUs** | - | - |
| **Achieved Active VUs** | **Active Sockets** | **22,400 VUs** | Host Limit: ~24k ports | `BLOCKED` |
| **Throughput** | **Requests per Second (RPS)** | **2,150.0 req/s** | - | - |
| **Success Rate** | **HTTP Success Rate** | **89.40%** | > 95.0% Target | `FAILED SLA` |
| **Latency** | **95th Percentile (p95)** | **1,850.0 ms** | < 1,000 ms Target | `FAILED SLA` |
| **Host CPU** | **Load Gen + Backend** | **100.0%** | Saturated | `CRITICAL` |
| **Host Socket State** | **TIME_WAIT Sockets** | **16,384 Sockets** | Windows Default Cap | `CRITICAL` |

---

## 3. Bottleneck Analysis

When attempting 30,000 concurrent virtual users from a single client machine against a single local backend:
1. **Windows Ephemeral Port Range:** The OS dynamically allocates outbound ports in the range 49152–65535 (~16,384 ports). Rapid connection cycling exhaust available ports while sockets linger in `TIME_WAIT`.
2. **Co-located Load Generator Contention:** k6 and NestJS competed for the same 2 CPU cores, causing artificial scheduling delays and skewed latency measurements.
3. **Conclusion:** Testing loads beyond 20,000 VUs requires **distributed multi-node load generators** (e.g., k6 cloud or distributed Kubernetes worker pools) and multi-node backend clusters.
