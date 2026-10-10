# SPICEGARDEN DATABASE INTEGRITY & TRANSACTION VALIDATION
**Database:** PostgreSQL 16 (PgBouncer Connection Pooling) + TypeORM 0.3.20
**Target Schema:** 16 Tables / Entities

## 1. Entity Constraint & Transaction Verification

| Entity / Table | Primary Key | Foreign Keys & Unique Constraints | Transactional Rollback Test | Concurrency / Race Test | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **users** | UUID (v4) | UNIQUE(`email`), UNIQUE(`phone`) | Pass (Duplicate register rolls back) | Handled via PG Unique Lock | **PASS** |
| **orders** | UUID (v4) | FK -> users.id, FK -> restaurants.id | Pass (Payment fail rolls back order) | Optimistic lock on status transition | **PASS** |
| **order_items** | UUID (v4) | FK -> orders.id (CASCADE), FK -> menu_items.id | Pass (Order cancel cascades items) | Atomic insert batch | **PASS** |
| **restaurants** | UUID (v4) | Spatial Index (`lat`, `lng`) | Pass (Branch update rollback) | Read-committed isolation | **PASS** |
| **menu_items** | UUID (v4) | FK -> restaurants.id, CHECK(`price >= 0`) | Pass (Invalid price rolls back) | Stock atomic decrement | **PASS** |
| **payments** | UUID (v4) | FK -> orders.id, UNIQUE(`provider_intent_id`) | Pass (Duplicate webhook ignored) | Idempotency key verified | **PASS** |
| **wallets** | UUID (v4) | FK -> users.id, CHECK(`balance >= 0`) | Pass (Negative balance aborts) | Atomic balance increments/decrements | **PASS** |
| **audit_logs** | UUID (v4) | FK -> users.id, Append-Only Constraint | N/A (Write-only audit trail) | High-throughput async insert | **PASS** |

## 2. Multi-Step Transactional Integrity
- **Scenario:** Customer checkout with partial wallet credit + online payment.
- **Rollback Test:** If payment intent fails or times out, wallet balance is unreserved within same DB transaction block.
- **Result:** **PASS** (Zero orphan transactions, zero balance discrepancies).
