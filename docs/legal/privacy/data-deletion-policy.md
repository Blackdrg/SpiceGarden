# Data Deletion Policy

**Draft status:** FIRST DRAFT for human/legal review. Grounded in actual codebase behavior. Must be reviewed by a qualified lawyer before publication.

**Effective date:** [PLACEHOLDER — to be set by business owner]

---

## 1. Right to Erasure (GDPR Article 17 / DPDP Section 12 / CCPA §17928)

You have the right to request deletion of your personal data. We provide two deletion pathways:

### 1.1 Self-Service Deletion (Standard)

When you submit a deletion request via `POST /privacy/requests` with `type: "delete"`:

**What is deleted immediately** (via `DataSubjectRequestService.executeDeletion()` at `data-subject-request.service.ts:204-282`):

| Data | Location | Action |
|------|----------|--------|
| Active sessions | `user_sessions` table | Deleted (`deleteFrom('user_sessions')`) |
| User devices | `user_devices` table | Deleted (`deleteByColumn('user_devices', 'userId', ...)`) |
| Notifications | `notifications` table | Deleted (`deleteFrom('notifications')`) |
| Notification analytics | `notification_analytics` table | Anonymized (device token → `'REDACTED'`) |
| Queued background jobs | `bullmq_jobs` table | Purged by userId pattern |
| Marketing events | `marketing_events` table | Deleted |
| Account record | `users` table | **Soft-deleted** (sets `deletedAt` timestamp, keeps tombstone) |

**What is anonymized (not deleted) due to legal obligation**:

| Data | Location | Action |
|------|----------|--------|
| Audit logs | `audit_logs` table | `performedBy` → `'anonymized'` |

**What is retained per statutory requirements**:

| Data | Location | Retention | Reason |
|------|----------|-----------|--------|
| Orders | `orders` | 10 years | Tax/commercial law |
| Invoices | `invoices` | 10 years | Tax law |
| Payments | `payments` | 10 years | Financial records |
| Refunds | `refunds` | 10 years | Financial records |
| Bank accounts | `bank_accounts` | 5 years | Payout reconciliation |

The account tombstone (`deletedAt` set, status = `'deleted'`) is retained for **7 years** (`retention.service.ts:37`) then hard-deleted.

### 1.2 Protected Deletion (GDPR/DPDP)

For regulated deletions (GDPR Article 17, DPDP Section 12), a **protected deletion** process runs via `DataPrivacyService.processProtectedDeletion()` (`data-privacy.service.ts:118-152`):

1. Verifies an active deletion request exists in the `deletion_requests` table.
2. Ensures data export has been completed or generates one.
3. Cancels all user orders (sets status to `'cancelled'`).
4. Sets user account status to `'deleted'`.
5. Records the completion timestamp in `deletion_requests.completedAt`.

The `DeletionRequestEntity` (`deletion-request.entity.ts:4-35`) tracks: `status` (pending → processing → completed), `regulation` (gdpr/ccpa/dpdp), `scheduledDeletionDate`, `cancellationReason`.

---

## 2. Consent Withdrawal

Withdrawing consent does **not** automatically delete your data. To delete your data:
1. Withdraw consent via `POST /legal/consent/:consentId/withdraw` (`consent.service.ts:132-166`) — this deactivates the consent record.
2. Separately submit a deletion request via `POST /privacy/requests` with `type: "delete"`.

---

## 3. Data Portability (Pre-Deletion)

Before processing a deletion request, we can generate a complete data export. The `buildExportPayload()` method (`data-subject-request.service.ts:496-524`) aggregates data from 8 tables:

```typescript
const tables = [
  'users', 'orders', 'sessions', 'audit_logs',
  'notifications', 'user_devices', 'wallets', 'addresses', 'support_tickets',
];
```

Export formats: JSON, CSV, PDF (`privacy.controller.ts:113-127`). Export links expire 7 days after generation (`createExport` → `expiresAt` at `data-subject-request.service.ts:400`).

---

## 4. SLA and Process

| Step | SLA |
|------|-----|
| Request submitted | `data-subject-request.service.ts:76` — immediately recorded in DB |
| Review/approval (admin) | 24 hours business time |
| Execution | Within 30 days of approval |
| Notification | Sent via push/email notification upon completion |

All deletion actions are audited (`compliance-audit.service.ts`) with the `dsr_data_deleted` action (`data-subject-request.service.ts:272-279`).

---

## 5. Exceptions

Data will **not** be deleted if:
- It is needed for tax, legal, or regulatory compliance (orders, payments, invoices — retained 10 years).
- It is needed for fraud prevention or security (audit logs — retained 3 years, anonymized on deletion).
- There is an active legal hold on the relevant retention policy.
- There are outstanding legal claims or disputes.

---

## 6. How to Request Deletion

1. **Via Privacy Dashboard:** `GET /privacy/dashboard/:userId` shows active requests and exports.
2. **Via API:** `POST /privacy/requests` with `{ userId, type: "delete", regulation: "gdpr|ccpa|dpdp", reason? }`.
3. **Via email:** privacy@spicegarden.com with subject "Data Deletion Request."
4. **Via in-app:** Customer profile → Privacy settings → "Delete Account."

You will receive a confirmation email with your request ID and SLA deadline.

---

## Code Evidence

- `data-subject-request.service.ts:204-282` — `executeDeletion()` method
- `data-subject-request.service.ts:496-524` — `buildExportPayload()` aggregates data for portability
- `data-privacy.service.ts:118-152` — `processProtectedDeletion()` for regulated deletions
- `data-subject-request.service.ts:29-37` — SLA definitions (30 days for delete, 15 for consent withdrawal)
- `retention.service.ts:37` — Deleted accounts retained 7 years then hard-deleted
