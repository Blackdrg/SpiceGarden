# Operations FAQ

**Status:** DRAFT — First draft, not yet reviewed by operations.

---

## Q1: How do I check if a backup completed successfully?

Run the backup verification script:
```bash
bash infra/scripts/backup-verification.sh
```
Alternatively, check the API endpoint:
```
GET /compliance/backup-integrity
```
**Backend reference:** `apps/backend/src/compliance/compliance.controller.ts:241-244`

## Q2: When does the GDPR daily compliance scan run?

The compliance scan runs at 2:00 AM India Standard Time every day.
**Backend reference:** `apps/backend/src/compliance/compliance.service.ts:108-121`

```typescript
@Cron('0 0 2 * * *', {
  name: 'compliance-scan',
  timeZone: 'Asia/Kolkata',
})
```

## Q3: When does the DSR processing job run?

The DSR processor runs at 4:00 AM IST every day, processing approved deletion requests and pending data exports.
**Backend reference:** `apps/backend/src/legal/dsr-processor-job.service.ts:30`

```typescript
@Cron('0 4 * * *')
```

## Q4: What is the SLA for GDPR data subject requests?

DSRs are assigned a 30-day SLA. The system checks for SLA breaches during the 4 AM DSR processing job and logs them to the compliance audit trail.

## Q5: How do I rotate secrets?

Manual rotation:
```bash
node infra/scripts/secrets-rotation.ps1.js rotate jwt_secret encryption db_password
```
Or via API:
```
POST /compliance/secrets/rotate?secrets=jwt_secret,encryption,db_password
```
Check status:
```
GET /compliance/secrets/rotation-status
```
**Backend reference:** `apps/backend/src/compliance/secrets-rotation.service.ts:1-200`

## Q6: What data retention periods are enforced?

| Data Type | Retention |
|---|---|
| User data (after deletion) | 7 years |
| Order data | 10 years |
| Session data | 90 days after expiration |
| Audit logs | 3 years |

## Q7: How do I restore from a backup?

```bash
bash infra/scripts/disaster-recovery.sh --production
```
To restore from a specific backup:
```bash
bash infra/scripts/disaster-recovery.sh --production --backup-date YYYYMMDD_HHMMSS
```

## Q8: How do I verify PII encryption status for a user?

```
GET /compliance/user/:userId/pii-verification
```
This checks if email, phone, and fullName fields are encrypted (AES-256 via CryptoJS).

## Q9: What is the feature freeze status?

Feature growth is completely frozen per `AGENTS.md`. Only bug fixes, reliability improvements, deployment fixes, and production hardening are permitted.

## Q10: What are the development ports?

| Service | Port |
|---|---|
| Backend API | 3001 |
| Grafana | 3000 |
| Prometheus | 9090 |
| Alertmanager | 9093 |
| OpenSearch | 9200 |
| OpenSearch Dashboards | 5601 |

## Q11: How do I run all tests?

```bash
cd apps/backend && npm run test
```

For specific test types:
- `npm run test:unit` — Unit tests
- `npm run test:integration` — Integration tests
- `npm run test:e2e` — End-to-end tests

## Q12: How do I check the NestJS logger API constraint?

NestJS 11 removed `.info()` from the Logger API. Use `.log()` instead.
**Project constraint:** `project.md_Constraints_nestjs.logger.api`

---

*For questions not covered here, contact ops@spicegarden.com.*
