# SPICEGARDEN — 500K BENCHMARK RESULTS & GATE MATRIX

## 1. Staged Execution Matrix (Physical Local Host vs Distributed AWS Target)

| Escalation Stage | Target Active VUs | Local Host Measurement (Windows Dev Rig) | Distributed AWS Target (40x c6i.2xlarge + EKS) | SLA Tier Compliance | Status / Classification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Stage 1 (100 - 500 VU)** | `500` | **1,278.63 RPS**, P95: `351.7ms`, Err: `0.00%` | Supported | Tier 1 **PASS** | `PROVEN_PHYSICAL` (Local Host) |
| **Stage 2 (1K - 10K VU)** | `10,000` | **1,373.30 RPS**, P95: `482.1ms`, Err: `1.15%` | Modeled: 5,400 RPS, P95 <80ms | Stress Boundary | `PROVEN_PHYSICAL` (Stress Rig) |
| **Stage 3 (25K VU)** | `25,000` | Host Saturated (`WSAENOBUFS 10055`) | Modeled: 13,500 RPS, P95 <120ms | Tier 1 Target | `READY_NOT_EXECUTED` (Cloud) |
| **Stage 4 (50K VU)** | `50,000` | Host Saturated | Modeled: 27,000 RPS, P95 <150ms | Tier 1 Target | `READY_NOT_EXECUTED` (Cloud) |
| **Stage 5 (100K VU Gate)** | `100,000` | Host Saturated | Modeled: 54,000 RPS, P95 <180ms | Tier 1 Target | `READY_NOT_EXECUTED` (Cloud) |
| **Stage 6 (250K VU Gate)** | `250,000` | Host Saturated | Modeled: 135,000 RPS, P95 <220ms | Tier 1 Target | `READY_NOT_EXECUTED` (Cloud) |
| **Stage 7 (350K - 475K)** | `475,000` | Host Saturated | Modeled: 256,500 RPS, P95 <245ms | Tier 1 Target | `READY_NOT_EXECUTED` (Cloud) |
| **Stage 8 (500K Final Gate)**| `500,000` | Host Saturated | Modeled: 270,000 RPS, P95 <250ms | Tier 1 Target | `BLOCKED_EXTERNAL` (Cloud) |

---

## 2. Evidence Reconciliation & Authoritative Classification

In accordance with Section 1 ("Non-Negotiable Evidence Rule") and Section 27 ("Final Classifications"):
* **Local Physical Execution**: Sustained up to 500 VUs cleanly (0.00% errors) and demonstrated physical breaking point at 10,000–22,400 VUs on single host.
* **Distributed Cloud 500K Benchmark**: Classified strictly as **`BLOCKED_EXTERNAL`** pending provisioning of live AWS infrastructure and 40-node generator fleet.
* **No Unsubstantiated Upgrade**: The theoretical capacity model (270k RPS / 500k VUs) remains classified as `MODEL_ONLY` until live distributed telemetry is captured.
