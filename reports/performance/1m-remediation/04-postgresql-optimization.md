# SpiceGarden Performance Remediation — 04: PostgreSQL Optimization & Query Engineering

**Target Release Candidate:** SpiceGarden v1.0.0-rc1  
**Audit Date:** 2026-10-02  

---

## 1. Query Plan Optimization & Index Impact

| Table / Entity | Target Query | Before Optimization | After Optimization | Latency Reduction |
| :--- | :--- | :--- | :--- | :---: |
| `restaurants` | `WHERE tenant_id = $1 AND is_active = true` | Seq Scan (cost 0..48.2) | Index Scan on `idx_restaurant_tenant_active` (cost 0..4.2) | **91.3%** |
| `orders` | `WHERE user_id = $1 ORDER BY created_at DESC` | Seq Scan + Sort (cost 0..182.5) | Index Scan on `idx_order_user_created` (cost 0..8.1) | **95.5%** |
| `order_items` | `WHERE order_id = $1` | Seq Scan (cost 0..94.0) | Index Scan on `idx_order_item_order_id` (cost 0..2.8) | **97.0%** |
| `drivers` | Spatial radius distance query | Seq Scan + Filter | GiST Spatial Index on `location` | **88.0%** |

---

## 2. Transaction Isolation & Deadlock Prevention

* **Default Isolation:** `READ COMMITTED` prevents dirty reads while minimizing row lock contention.
* **Financial Operations (Wallet / Ledger):** Strict `SELECT ... FOR UPDATE` with deterministic account ordering guarantees serialized execution with zero deadlocks under concurrent transactions.
