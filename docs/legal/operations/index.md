# Operations Documentation (Section M)

This section covers operational procedures, FAQs, and support documentation for SpiceGarden.

## Documents

| Document | Description |
|---|---|
| `backup-recovery-sop.md` | Backup and disaster recovery procedures for PostgreSQL, MongoDB, and Redis |
| `secrets-rotation-sop.md` | Secrets rotation procedures with 90-day schedule and K8s integration |
| `gdpr-automation-sop.md` | GDPR/DPDP data subject request processing with daily 2 AM IST cron |
| `operations-faq.md` | Common operational questions and answers |
| `help-center-guide.md` | Customer, delivery partner, and restaurant support resources |

## Key Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/compliance/backup-integrity` | GET | Verify backup archive integrity |
| `/compliance/secrets/rotate` | POST | Rotate specified secrets |
| `/compliance/secrets/rotation-status` | GET | List secrets requiring rotation |
| `/compliance/retention/apply` | POST | Trigger retention policy application |
| `/compliance/gdpr/user/:userId/deletion-request` | POST | Submit GDPR deletion request |
| `/health` | GET | System health check |

## Scheduled Jobs

| Job | Cron | Timezone | Purpose |
|---|---|---|---|
| Compliance Scan | `0 0 2 * * *` | Asia/Kolkata | Data retention + deletion processing |
| DSR Processing | `0 4 * * *` | Asia/Kolkata | DSR batch processing + SLA checks |
