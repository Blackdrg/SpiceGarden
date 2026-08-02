# GDPR/DPDP Data Request Automation SOP

**Status:** DRAFT — First draft, not yet reviewed by legal or compliance.  
**Backend reference:** `apps/backend/src/compliance/compliance.service.ts:108-220`, `apps/backend/src/compliance/compliance.controller.ts:126-267`, `apps/backend/src/legal/dsr-processor-job.service.ts:1-103`

---

## 1. Overview

SpiceGarden automates GDPR and DPDP data subject request (DSR) processing through scheduled cron jobs and API endpoints. The system supports data export, deletion requests, and automated cleanup on a daily schedule.

## 2. Data Subject Rights

| Right | API Endpoint | Method | Roles |
|---|---|---|---|
| Right to Access / Data Export | `/compliance/gdpr/user/:userId/export` | GET | ADMIN, SUPER_ADMIN, CUSTOMER (own data) |
| Right to Data Portability (DPDP) | `/compliance/dpdp/user/:userId/export` | GET | ADMIN, SUPER_ADMIN, CUSTOMER (own data) |
| Right to Erasure (GDPR) | `/compliance/gdpr/user/:userId/deletion-request` | POST | ADMIN, CUSTOMER (own data) |
| Right to Erasure (DPDP) | `/compliance/dpdp/user/:userId/deletion-request` | POST | ADMIN, CUSTOMER (own data) |
| Cancel Deletion | `/compliance/gdpr/user/:userId/deletion-request/cancel` | POST | ADMIN, CUSTOMER (own data) |

## 3. Scheduled Automation

### Daily Compliance Scan — 2:00 AM IST
**Backend reference:** `compliance.service.ts:108-121`

```typescript
@Cron('0 0 2 * * *', {
  name: 'compliance-scan',
  timeZone: 'Asia/Kolkata',
})
async handleComplianceScan() {
  const retention = await this.applyDataRetentionPolicies();
  const processed = await this.processPendingDeletionRequests();
}
```

This job runs at 2:00 AM India Standard Time every day and performs:
1. **Data retention policy application** — purges expired sessions (90 days) and old audit logs (3 years)
2. **Pending deletion processing** — processes approved GDPR/DPDP deletion requests

### Daily DSR Processing — 4:00 AM IST
**Backend reference:** `dsr-processor-job.service.ts:30-65`

```typescript
@Cron('0 4 * * *')
async processPendingDsrs() { ... }
```

This job runs at 4:00 AM IST and:
1. Processes approved DSRs in batches of 50 (ordered by SLA deadline)
2. Generates and finalizes pending data exports
3. Checks for SLA breaches and logs audit warnings

## 4. Data Retention Policies

**Backend reference:** `compliance.service.ts:34-40`

| Data Type | Retention Period | Rationale |
|---|---|---|
| User data (after account deletion) | 7 years | Legal/tax requirement |
| Order data | 10 years | Tax and financial audit |
| Session data | 90 days after expiration | Security hygiene |
| Audit logs | 3 years | Security/compliance |

## 5. GDPR Deletion Workflow

### Step 1: Request Submission
Customer or admin submits deletion request via API:
```
POST /compliance/gdpr/user/:userId/deletion-request
Body: { reason: "Right to be forgotten" }
```
**Backend reference:** `compliance.service.ts:237-264`

- A deletion request is created with `status: 'pending'`
- `scheduledDeletionDate` is set to 24 hours from submission
- `approvalRequired: true` — request must be approved before processing
- Customer has 24 hours to cancel

### Step 2: Approval
Admin approves the deletion request through the admin dashboard.

### Step 3: Automated Processing
The daily compliance scan at 2 AM IST (`compliance.service.ts:67`) calls `processPendingDeletionRequests()` which:
- Finds all approved requests with `scheduledDeletionDate <= now`
- Soft-deletes the user record (`userRepo.softDelete`)
- Deactivates all sessions for the user
- Logs the action

**Backend reference:** `compliance.service.ts:67-106`

### Step 4: Data Purge (7 Years)
The `shouldRetainUserData()` method checks if 7 years have passed since account deletion. When the retention period expires, data is permanently purged.

## 6. SLA Tracking

- DSR requests are assigned a 30-day SLA by default
- The `processPendingDsrs` job checks for SLA breaches every 4 AM
- Breached requests are logged to the compliance audit trail
- Audit log entries created for each breach: `dsr_sla_breached`

## 7. Audit Trail

All DSR activities are recorded via `ComplianceAuditService`:
- `dsr_processing_failed` — when a DSR fails to process
- `dsr_sla_breached` — when a DSR exceeds its SLA

## 8. Monitoring

### Compliance Dashboard Endpoints
| Endpoint | Description |
|---|---|
| `GET /compliance/retention-stats` | Data retention statistics |
| `GET /compliance/user/:userId/deletion-status` | Check deletion request status |
| `GET /compliance/user/:userId/export-history` | View export history |
| `GET /compliance/user/:userId/pii-verification` | Verify PII encryption status |

### Health Check
```
GET /health
```
Returns `database: healthy, redis: healthy` — confirms compliance services are operational.

## 9. Incident Response for DSR Failures

If the daily compliance scan fails:
1. Check backend logs for `Scheduled compliance scan failed`
2. Manually run `POST /compliance/retention/apply` to trigger retention
3. Manually review pending deletions in admin dashboard
4. Ensure no SLA breaches exceed 30 days

## 10. Contact

Compliance questions: compliance@spicegarden.com

---

*This document is a DRAFT. GDPR/DPDP procedures must be reviewed annually by legal counsel.*
