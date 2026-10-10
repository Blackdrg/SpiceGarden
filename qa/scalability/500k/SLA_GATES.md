# SPICEGARDEN — 500K AUTHORITATIVE SLA GATES

## 1. Authoritative SLA Contract Alignment

This benchmark is evaluated strictly against the defined rules in `qa/final/AUTHORITATIVE_SLA_SLO_CONTRACT.md`.

---

## 2. SLA Gate Definitions

### Tier 1: Steady-State Production Gates (Evaluated During Sustained 500K Hold)
* **Active VU Gate**: `ACTUAL_ACTIVE_VUS >= 500,000` for the entire hold window (minimum 30 minutes).
* **Error Rate (5xx)**: `< 0.10%` (strictly enforced).
* **P50 Latency**: `≤ 80 ms`
* **P95 Latency**: `≤ 250 ms`
* **P99 Latency**: `≤ 500 ms`
* **P99.9 Latency**: `≤ 1,000 ms`
* **Infrastructure Saturation**:
  - EKS Pod CPU Average: `< 75%`
  - Aurora Writer CPU: `< 80%`
  - Aurora IOPS Wait: `< 5 ms`
  - Redis CPU per Node: `< 70%`
  - PgBouncer Client Wait: `< 10 ms`
* **Business Integrity Gate**: `100% PASS` (0 negative stock, 0 double-spends, 0 duplicate ledger entries).

### Tier 2: Extreme Burst & Scaling Gates (Evaluated During Rapid Step-Ramps)
* **Error Rate (5xx)**: `< 1.00%` during dynamic HPA pod addition.
* **P95 Latency**: `≤ 500 ms`
* **P99 Latency**: `≤ 1,200 ms`
* **Recovery Time**: Latency must return to Tier 1 steady-state thresholds within `60 seconds` of HPA pod readiness.

---

## 3. Mandatory Compliance Criteria

A benchmark run **CANNOT** be claimed as `500K_PHYSICAL_CLEAN_BENCHMARK` unless:
1. Every Tier 1 gate passes for the entire duration of the hold window.
2. Generator logs prove that zero artificial throttling, socket buffer drops, or client-side errors occurred.
3. Complete end-to-end telemetry across ALB, EKS, Node.js, PgBouncer, Aurora, Redis, and BullMQ is captured and recorded.
