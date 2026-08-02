# Data Retention Policy

**Draft status:** FIRST DRAFT for human/legal review. Grounded in actual codebase behavior (`retention.service.ts:19-38`). Must be reviewed by a qualified lawyer before publication.

**Effective date:** [PLACEHOLDER — to be set by business owner]

---

## 1. Purpose

This policy defines how long SpiceGarden retains each category of personal data and the disposal method used when retention expires. Retention schedules are implemented in code at `apps/backend/src/legal/retention.service.ts:19-38` (the `DEFAULT_POLICIES` array) and enforced by automated scheduled jobs via `RetentionService.runAllEnabled()`.

---

## 2. Retention Schedule

| Data Category | Table(s) | Retention Period | Action on Expiry | Legal Basis | Supports Legal Hold? | Code Reference |
|---|---|---|---|---|---|---|
| Orders | `orders` | 10 years (3650 days) | Archive | Tax/invoicing law | Yes | `retention.service.ts:20` |
| Invoices | `invoices` | 10 years (3650 days) | Archive | Tax/invoicing law | Yes | `retention.service.ts:21` |
| Chats | `chats` | 2 years (730 days) | Delete | Customer support | Yes | `retention.service.ts:22` |
| Notifications | `notifications` | 1 year (365 days) | Delete | Operational | No | `retention.service.ts:23` |
| Audit Logs | `audit_logs` | 3 years (1095 days) | Archive | Compliance/audit | Yes | `retention.service.ts:24` |
| Sessions | `user_sessions` | 90 days | Delete | Security/session mgmt | No | `retention.service.ts:25` |
| OTP Codes | `otp_verifications` | 1 day | Delete | Security (OTP expiry) | No | `retention.service.ts:26` |
| Driver GPS | `driver_gps_tracks` | 30 days | Delete | Safety/disputes | Yes | `retention.service.ts:27` |
| Restaurant Data | `restaurants`, related tables | 5 years (1825 days) | Archive | Business relationship | Yes | `retention.service.ts:28` |
| Analytics | `analytics_events` | 18 months (540 days) | Delete | Legitimate interests | No | `retention.service.ts:29` |
| Marketing | `marketing_events` | 2 years (730 days) | Delete | Consent/marketing | No | `retention.service.ts:30` |
| Emails | `email_logs` | 1 year (365 days) | Delete | Operational | No | `retention.service.ts:31` |
| Payments | `payments` | 10 years (3650 days) | Archive | Financial records | Yes | `retention.service.ts:32` |
| Refunds | `refunds` | 10 years (3650 days) | Archive | Financial records | Yes | `retention.service.ts:33` |
| Wallet | `wallets`, `wallet_transactions` | 5 years (1825 days) | Archive | Financial records | Yes | `retention.service.ts:34` |
| Loyalty | `loyalty_points` | 3 years (1095 days) | Anonymize | Business relationship | No | `retention.service.ts:35` |
| Support Tickets | `support_tickets` | 3 years (1095 days) | Archive | Customer service | Yes | `retention.service.ts:36` |
| Deleted Accounts (tombstones) | `users` (soft-deleted) | 7 years (2555 days) | Delete | Legal obligation | Yes | `retention.service.ts:37` |

---

## 3. Compliance Actions

- **ARCHIVE** — Data is moved to cold storage (read-only) for the remainder of the legal retention period, then permanently deleted.
- **DELETE** — Records matching the cutoff date (via `createdAt < cutoff`) are hard-deleted from the table.
- **ANONYMIZE** — Identifying columns (e.g., `userId`) are replaced with a placeholder string (`'anonymized'`) via `update().set()`.

Reference: `retention.service.ts:114-152` (the `runPolicy` method computes the cutoff date and executes the action).

---

## 4. Automated Enforcement

Retention jobs are triggered by:
- **Cron scheduler** — NestJS Schedule module enabled in `ComplianceModule` (see Section E). Daily at 2 AM IST.
- **Manual trigger** — `POST /retention/policies/:key/run` and `POST /retention/run-all` (`retention.controller.ts:55-71`), protected by admin/super_admin role + `compliance:write` permission.
- **Legal hold** — `POST /retention/policies/:key/legal-hold` (`retention.controller.ts:46-53`) disables deletion for a specific policy while a legal hold is active.

---

## 5. Legal Hold

When a legal hold is active on a policy:
- `policy.enabled` is set to `false` (via `RetentionService.setLegalHold()` at `retention.service.ts:99-107`)
- The scheduled retention job **skips** that policy
- Audit log entry records the hold (`compliance-audit.service.ts`)

---

## 6. User-Requested Deletion Override

When a user exercises the right to erasure (`POST /privacy/requests` with type `delete`):
- The `executeDeletion()` method (`data-subject-request.service.ts:204-282`) deletes user sessions, devices, notifications, marketing events, and queued jobs immediately.
- Audit logs are **anonymized** (not deleted) due to legal obligation.
- Financial records (orders, payments, refunds) are **retained** per the statutory 10-year requirement, with the user's identity removed where legally permissible.
- The account itself is **soft-deleted** (tombstone retained for 7 years per `retention.service.ts:37`).

---

## 7. Data Retention for AI Features

- **Context memory** — Stored in an in-memory `Map` in `ai.service.ts:67-68`, max 20 messages per session. **Not persisted** to any database or file. Cleared on process restart.
- **RAG documents** — Stored in an in-process array in `ai.service.ts:66`. **Not persisted.**
- **OpenAI API call logs** — Logged via `metricsService.incrementAiCall()` (`ai-control-plane.service.ts:234-245`) for monitoring. No user message content is logged.

---

## Code Evidence

- `retention.service.ts:19-38` — DEFAULT_POLICIES array defines all retention rules
- `retention.service.ts:109-176` — `runPolicy()` method enforces retention with cutoff dates
- `retention.service.ts:178-185` — `runAllEnabled()` runs all active policies
- `retention.service.ts:99-107` — `setLegalHold()` toggles legal hold
- `retention.controller.ts:23-82` — API endpoints for manual retention management
- `data-subject-request.service.ts:204-282` — `executeDeletion()` overrides retention for user deletion
- `legal-seed.service.ts:49-54` — Retention policies are seeded on module init
