# SPICEGARDEN — 500K REPRODUCTION & STATISTICAL PARITY REPORT

## 1. Executive Summary
* **Benchmark Target:** Dual-Run 500,000 Active VU Parity
* **Status:** `AUTOMATION_READY / NOT_EXECUTED` (Cloud infrastructure required)
* **Runner Script:** [run-500k-reproduction-suite.js](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/scripts/run-500k-reproduction-suite.js)

---

## 2. Parity Acceptance Criteria & Thresholds
* **Aggregate RPS Variance Threshold:** $\le 2.0\%$
* **P95 Latency Variance Threshold:** $\le 5.0\%$
* **P99 Latency Variance Threshold:** $\le 5.0\%$
* **Business Invariant Parity:** $100\%$ Identical (0 Invariant Violations across both runs)
* **Cooldown Interval:** 5 Minutes between Run 1 and Run 2

---

## 3. Automation Protocol
1. **Run 1:** Execute 30-minute clean hold at 500K VUs via distributed k6 operator.
2. **Reconciliation:** Flush cache buffers, reconcile database WAL archives, verify memory compaction across 160 pods.
3. **Run 2:** Execute identical 30-minute clean hold at 500K VUs.
4. **Variance Computation:** Calculate empirical percentage delta between Run 1 and Run 2 telemetry.
5. **Certificate Emission:** Generate cryptographically signed JSON parity certificate.
