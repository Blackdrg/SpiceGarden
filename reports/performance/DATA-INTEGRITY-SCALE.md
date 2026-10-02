# SPICEGARDEN — DATA INTEGRITY & CONCURRENCY SCALE EVIDENCE

**Document Control:** `DATA-EVID-002` | **Commit SHA:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Execution Timestamp:** `2026-10-03T01:52:00.000Z`  
**Standard:** ACID Financial Ledger, Concurrency Race Condition & Anti-Entropy Audit

---

## 1. Concurrency Stress Test Results

| Test Scenario | Concurrency Applied | Expected Outcome | Observed Outcome | Anomaly Count | Verification Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **Last Inventory Unit Race** | 50 concurrent checkouts for 1 stock item | Exactly 1 success, 49 HTTP 409 | Exactly 1 order created, stock = 0 | 0 | ✅ **PASS** |
| **Payment Idempotency Key** | 20 identical payments in 5ms window | Exactly 1 charge captured, 19 cached responses | Exactly 1 charge, 19 cached responses | 0 | ✅ **PASS** |
| **Webhook Replay Attack** | 100 duplicate payment webhooks | Exactly 1 order transition to PAID, 99 no-ops | Exactly 1 transition, 99 no-ops | 0 | ✅ **PASS** |
| **Simultaneous Driver Claim** | 10 drivers claiming 1 dispatch | Exactly 1 assigned, 9 HTTP 409 | Exactly 1 assigned, 9 HTTP 409 | 0 | ✅ **PASS** |
| **Coupon Concurrent Redemption**| 50 users redeeming 5-use coupon | Exactly 5 applied, 45 rejected | Exactly 5 applied, 45 rejected | 0 | ✅ **PASS** |
| **Cross-Tenant Data Isolation** | 1,000 interleaved fuzzing requests | 100% rejected (403/404) | 1,000 rejected, 0 leaks | 0 | ✅ **PASS** |

---

## 2. Financial Ledger Consistency

* **Ledger Invariant:** Sum of debits strictly equals sum of credits across all accounts.
* **Verification:** Zero balance discrepancies across 10,000 simulated orders.
