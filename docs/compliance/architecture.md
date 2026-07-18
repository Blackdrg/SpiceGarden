# Compliance Architecture

## High-Level Flow

```
┌─────────────────────────┐      ┌──────────────────────────┐
│  Frontends               │      │  Backend (NestJS)         │
│  customer-web            │ HTTP │  LegalModule              │
│  super-admin            │─────▶│   LegalController          │
│  restaurant-dashboard   │      │   PrivacyController        │
│  delivery-partner (RN)  │      │   AgreementController      │
└─────────────────────────┘      │   ComplianceAdminController│
                                  │   SecurityCenterController │
                                  │   RetentionController       │
                                  └────────────┬─────────────┘
                                               │
                          ┌────────────────────┼────────────────────┐
                          ▼                    ▼                    ▼
                   ┌────────────┐      ┌──────────────┐     ┌──────────────┐
                   │ PostgreSQL │      │ Compliance    │     │ LegalIntegrity│
                   │ (entities) │      │ Audit (signed)│     │ Service (HMAC)│
                   └────────────┘      └──────────────┘     └──────────────┘
```

## Persistence

Legal data lives in PostgreSQL via TypeORM. Entities (see `src/legal/entities`):

- `LegalDocumentEntity` / `LegalVersionEntity` / `LegalAcceptanceEntity` — policy lifecycle.
- `CookieConsentEntity` / `ConsentLogEntity` / `CookieRegistryEntity` — consent.
- `DataSubjectRequestEntity` / `DataExportEntity` — GDPR/DPDP requests & exports.
- `RetentionPolicyEntity` / `DataRetentionJobEntity` — retention engine.
- `AgreementEntity` / `AgreementAcceptanceEntity` — merchant/driver/partner agreements.
- `SecurityIncidentEntity` / `GrievanceEntity` — security & DPDP grievances.
- `ComplianceAuditEntity` — immutable, signed audit trail.

Sensitive legal records are encrypted at rest (AES-256 via `EncryptionService`);
audit records and agreement acceptances carry HMAC signatures (`LegalIntegrityService`)
for tamper detection.

## Key Services

| Service | Responsibility |
|---------|----------------|
| `LegalDocumentService` | draft → approve → publish → rollback, version hashes |
| `ConsentService` | record/withdraw granular consent, consent ledger, geo behavior |
| `DataSubjectRequestService` | access/delete/correct/restrict/object/portability, SLA, export (JSON/CSV/PDF) |
| `AgreementService` | party agreements, digital signature, verify |
| `RetentionService` | configurable per-data-category rules, scheduler hook, legal hold |
| `GrievanceService` | DPDP officer & consent manager, grievance lifecycle |
| `SecurityCenterService` | incident registry, responsible disclosure metadata |
| `ComplianceAuditService` | signed audit writes, tamper scan |
| `LegalIntegrityService` | HMAC sign/verify, content hashing |

## Request Lifecycle (Data Subject Request)

1. User submits via Privacy Dashboard → `POST /privacy/requests` (RBAC + ownership).
2. Request stored with SLA deadline (GDPR 30d, consent withdrawal 15d).
3. Admin reviews → approve/reject (`POST /privacy/requests/:id/review`).
4. Approved → processing → completed; deletion cascades to owned PII via retention jobs.
5. Every state transition writes a signed `ComplianceAuditEntity`.
6. User notified on completion (Part 15).

## Integrity

- `LegalIntegrityService.sign(payload)` → HMAC-SHA256 over canonical JSON.
- `ComplianceAuditService.scanForTampering(limit)` re-verifies every record; tampered
  rows are flagged (`tampered=true`) and reported to the admin dashboard.
- Version hashes (`contentHash`) detect altered policy content.
