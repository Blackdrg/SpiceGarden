# SPICEGARDEN — AUTHORITATIVE SLA / SLO CONTRACT

## 1. Scope & Authority
This document defines the single authoritative Service Level Agreement (SLA) and Service Level Objective (SLO) contract for SpiceGarden. It supersedes all historical notes and contradictory target definitions.

---

## 2. Production Service Level Objectives (SLOs)

### Tier 1: Core API & Order Processing (Steady-State Production)
* **Availability**: `99.9%` uptime across rolling 30-day window.
* **Error Rate**: `< 0.1%` (5xx errors / total valid requests).
* **Latency Gates (P50)**: `≤ 80 ms`
* **Latency Gates (P95)**: `≤ 250 ms`
* **Latency Gates (P99)**: `≤ 500 ms`
* **Latency Gates (P99.9)**: `≤ 1,000 ms`

### Tier 2: Extreme Peak & Burst Operations (High Concurrency Flash Sales)
* **Availability**: `99.5%` during burst scaling events.
* **Error Rate**: `< 1.0%` during rapid autoscaler scale-out events.
* **Latency Gates (P95)**: `≤ 500 ms`
* **Latency Gates (P99)**: `≤ 1,200 ms`

---

## 3. SLA Compliance Evaluation Rules

1. **All Gates Mandatory**: A test or execution run cannot be designated `OVERALL_SLA_PASS` unless **every** declared gate for the applicable tier passes.
2. **Error Rate Enforcement**: If a benchmark exhibits `1.15%` error rate, it must be reported as failing the steady-state `<0.1%` error gate and categorized under stress analysis rather than zero-error SLA compliance.
3. **Latency Compliance**: If observed `P99 = 588 ms`, it fails Tier 1 steady-state SLA (`≤ 500 ms`) but satisfies Tier 2 burst tolerance (`≤ 1,200 ms`).
4. **Environment Disambiguation**: SLA compliance on local or single-instance test environments must not be extrapolated to multi-region cloud SLA without physical distributed validation.

---

## 4. Recovery Objectives (RTO / RPO)
* **Target Recovery Time Objective (RTO)**: `< 15 minutes` (Automated container redeploy & failover).
* **Target Recovery Point Objective (RPO)**: `< 5 minutes` (Point-in-time continuous WAL archiving).
* **Measured Status**: `READY_NOT_EXECUTED` (Full physical DR restore test requires active AWS RDS instance).
