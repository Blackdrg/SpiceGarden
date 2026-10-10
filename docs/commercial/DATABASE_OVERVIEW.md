# SpiceGarden — Database Architecture & Schema Overview

## 1. Multi-Model Data Architecture
SpiceGarden uses a polyglot persistence model to optimize for transactional integrity, operational logging, and low-latency cache requirements:
1. **PostgreSQL (TypeORM):** Primary ACID transactional data store.
2. **MongoDB (Mongoose):** Unstructured event logging, audit trail, and driver route history.
3. **Redis (ioredis):** In-memory session store, distributed mutex locks, rate-limiting tokens, and BullMQ queues.

## 2. PostgreSQL Relational Entities

### Core Entities & Relationships
- **UserEntity (`users`):** `id` (UUID), `email`, `phone`, `fullName`, `passwordHash`, `role`, `status`, `createdAt`.
- **RestaurantEntity (`restaurants`):** `id`, `name`, `address`, `latitude`, `longitude`, `rating`, `isOpen`, `ownerId`.
- **MenuItemEntity (`menu_items`):** `id`, `restaurantId`, `categoryId`, `name`, `description`, `price`, `isAvailable`.
- **OrderEntity (`orders`):** `id`, `userId`, `restaurantId`, `driverId`, `status`, `subtotal`, `tax`, `deliveryFee`, `discount`, `total`, `paymentMethod`, `paymentStatus`.
- **OrderItemEntity (`order_items`):** `id`, `orderId`, `menuItemId`, `quantity`, `unitPrice`, `selectedModifiers`.
- **WalletEntity (`wallets`):** `id`, `userId`, `balance`, `currency`, `updatedAt`.
- **LedgerTransactionEntity (`ledger_transactions`):** `id`, `walletId`, `amount`, `type` (CREDIT/DEBIT), `referenceType`, `referenceId`.
- **OtpEntity (`otps`):** `id`, `userId`, `type`, `code`, `status`, `expiresAt`, `verifiedAt`.
- **IdempotencyKeyEntity (`idempotency_keys`):** `key`, `userId`, `responseBody`, `statusCode`, `expiresAt`.

### Indexes & Constraints
- Unique indexes on `users(email)` and `idempotency_keys(key)`.
- Foreign key constraints with `ON DELETE RESTRICT` on financial and order relationships to prevent orphaned records.
- Composite indexes are defined on frequently queried order dimensions to support efficient query execution.

## 3. MongoDB Collections
- **`audit_logs`:** Comprehensive immutable change log for administrative actions and security events.
- **`driver_location_history`:** High-resolution GPS coordinate breadcrumbs for delivery route optimization.
- **`event_logs`:** Telemetry and webhook execution logs.

## 4. Redis Queues & Structures
- **BullMQ Queues:**
  - `order-processing`: Asynchronous order dispatch and lifecycle workflows.
  - `notification-dispatch`: Push/SMS/Email queue workers with retry policies.
  - `payment-reconciliation`: Webhook reconciliation and retry workers.
