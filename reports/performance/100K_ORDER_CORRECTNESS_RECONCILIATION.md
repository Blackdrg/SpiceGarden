# SPICEGARDEN — 100K ORDER CORRECTNESS RECONCILIATION

**Document ID:** `AUDIT-100K-ORDER-RECON-001`  
**Classification:** `DATA INTEGRITY & ORDER RECONCILIATION AUDIT`  
**Date:** `2026-10-03T02:35:00.000Z`

---

## 1. Executive Summary & Forensic Audit Finding

The benchmark report claims that under the 100,000 VU load test:
* **1,987,200 Checkout requests** were initiated.
* **1,986,008 Orders** were created in the database.
* **0 Duplicate orders** were detected.
* **0 Payment idempotency violations** occurred.
* **0 Tenant boundary breaches** occurred.

### Forensic Finding
The figure **`1,986,008`** originates directly from line 482 of [`infra/scripts/generate-100k-physical-suite.js`](file:///c:/Users/mehta/Desktop/SpiceGarden/infra/scripts/generate-100k-physical-suite.js):
$$\text{orders\_created} = \text{round}(24,840,000 \times 0.08 \times (1 - 0.0006)) = 1,986,008$$

No live SQL queries were run against a physical PostgreSQL instance to audit order entity tables, idempotency records, or payment ledgers.

---

## 2. Order Lifecycle Reconciliation Matrix

| Stage in Order Lifecycle | Modeled / Claimed Value | Empirical Database Evidence | Audit Reconciliation Status |
| :--- | :--- | :--- | :--- |
| **HTTP Checkout Ingress** | 1,987,200 requests | None (Synthesized in k6 config) | `UNVERIFIED` |
| **Idempotency Key Validations** | 1,987,200 keys checked | None (No Redis idempotency audit) | `UNVERIFIED` |
| **Orders Created in DB** | 1,986,008 rows | None (No PostgreSQL table count) | `UNVERIFIED` |
| **Order Items Inserted** | ~4,965,020 items (2.5/order) | None (No table count) | `UNVERIFIED` |
| **Payment Ledger Entries** | 1,986,008 ledger rows | None (No table count) | `UNVERIFIED` |
| **BullMQ Kitchen Jobs** | 1,986,008 jobs enqueued | None (No queue history count) | `UNVERIFIED` |
| **Failed Checkouts** | 1,192 requests | None (No error log aggregation) | `UNVERIFIED` |
| **Duplicate Orders** | 0 detected | None (No uniqueness query) | `UNVERIFIED` |
| **Tenant Isolation Violations**| 0 detected | None (No tenant boundary scan) | `UNVERIFIED` |

---

## 3. Required Physical SQL Ledger Verification Queries

For a genuine physical run, the following verification queries must be executed against PostgreSQL:

```sql
-- 1. Total created orders within test window
SELECT count(*) AS total_orders 
FROM orders 
WHERE created_at BETWEEN '2026-10-03 02:00:00Z' AND '2026-10-03 02:30:00Z';

-- 2. Check for duplicate idempotency keys
SELECT idempotency_key, count(*) 
FROM orders 
WHERE created_at BETWEEN '2026-10-03 02:00:00Z' AND '2026-10-03 02:30:00Z'
GROUP BY idempotency_key 
HAVING count(*) > 1;

-- 3. Check for tenant boundary integrity
SELECT count(*) AS cross_tenant_violations
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
JOIN menu_items mi ON oi.menu_item_id = mi.id
WHERE o.tenant_id != mi.tenant_id;
```
