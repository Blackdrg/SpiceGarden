# Compliance REST API

Base path: `/legal`, `/privacy`, `/agreements`, `/compliance-admin`, `/security-center`,
`/retention`. All endpoints enforce JWT auth, RBAC (`@Roles` + `PermissionGuard`),
rate limiting, audit logging, and (where applicable) DTO validation via `class-validator`.

Common query params: `page` (1-based), `limit`, `search`, `language`, `status`,
`type`, `regulation`, `category`.

## Legal Center

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/legal/center?language=en` | public | lists published documents |
| GET | `/legal/documents/:type?language=en` | public | current published version |
| GET | `/legal/documents/:type/versions` | admin | version history |
| POST | `/legal/documents` | SUPER_ADMIN `legal:write` | create draft |
| POST | `/legal/documents/:documentId/versions` | SUPER_ADMIN/ADMIN `legal:write` | new version |
| POST | `/legal/versions/:versionId/approve` | SUPER_ADMIN `legal:approve` | approve |
| POST | `/legal/versions/:versionId/publish` | SUPER_ADMIN `legal:publish` | publish |
| POST | `/legal/versions/:versionId/rollback` | SUPER_ADMIN `legal:publish` | rollback |
| POST | `/legal/accept` | user | accept current version |
| GET | `/legal/me/acceptances` | user | my acceptances |
| GET | `/legal/required` | user | pending acceptances |
| POST | `/legal/seed` | SUPER_ADMIN `legal:publish` | seed production docs (idempotent) |

## Cookie Consent

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/legal/consent` | public/anon | record granular consent (necessary/analytics/marketing/performance/functional/preference) |
| POST | `/legal/consent/:consentId/withdraw` | public | withdraw |
| GET | `/legal/consent/active?userId=&token=` | public | active consent |
| GET | `/legal/consent/logs` | ADMIN `compliance:read` | consent ledger |
| GET | `/legal/cookie-registry` | public | current registry |

## Privacy / Data Subject Rights (GDPR + DPDP)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/privacy/requests` | user | access/delete/correct/restrict/object/portability |
| GET | `/privacy/requests` | user/admin | list (paginated, filterable) |
| GET | `/privacy/requests/:id` | owner/admin | detail |
| POST | `/privacy/requests/:id/cancel` | owner | cancel |
| POST | `/privacy/requests/:id/review` | ADMIN `compliance:write` | approve/reject |
| POST | `/privacy/exports` | user | create export (json/csv/pdf) |
| GET | `/privacy/exports/:userId` | owner/admin | list |
| GET | `/privacy/exports/:exportId/download` | owner/admin | download (streams file) |
| GET | `/privacy/export-preview/:userId` | owner | right-to-access preview |
| GET | `/privacy/dashboard/:userId` | owner/admin | privacy dashboard summary |
| POST | `/privacy/dpdp/grievances` | user | DPDP grievance |
| GET | `/privacy/dpdp/officer` | public | officer + consent manager |
| POST | `/privacy/consent/withdraw-all` | user | withdraw all non-essential (DPDP) |

## Agreements

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/agreements/current/:party/:type` | public | current published |
| POST | `/agreements` | SUPER_ADMIN/ADMIN `legal:write` | create |
| POST | `/agreements/:id/approve` | SUPER_ADMIN `legal:approve` | approve+publish |
| GET | `/agreements` | ADMIN `compliance:read` | list |
| POST | `/agreements/accept` | user | digital accept (+signature) |
| GET | `/agreements/:id/acceptances` | ADMIN `compliance:read` | list acceptances |
| GET | `/agreements/acceptances/verify/:acceptanceId` | public | verify signature |

## Admin Compliance Dashboard

| Method | Path | Auth |
|--------|------|------|
| GET | `/compliance-admin/overview` | ADMIN `compliance:read` |
| GET | `/compliance-admin/gdpr-requests` | ADMIN |
| GET | `/compliance-admin/dpdp-requests` | ADMIN |
| GET | `/compliance-admin/deletion-queue` | ADMIN |
| GET | `/compliance-admin/export-queue` | ADMIN |
| GET | `/compliance-admin/retention-status` | ADMIN |
| GET | `/compliance-admin/policy-versions` | ADMIN |
| GET | `/compliance-admin/consent-logs` | ADMIN |
| GET | `/compliance-admin/audit-logs` | ADMIN |
| GET | `/compliance-admin/legal-holds` | ADMIN |
| GET | `/compliance-admin/merchant-agreements` | ADMIN |
| GET | `/compliance-admin/driver-agreements` | ADMIN |
| GET | `/compliance-admin/security-events` | ADMIN |
| POST | `/compliance-admin/integrity-scan` | ADMIN `compliance:write` |

## Retention & Security Center

| Method | Path | Auth |
|--------|------|------|
| POST | `/legal/retention/seed` | ADMIN `compliance:write` |
| GET | `/security-center` | public |
| GET | `/security-center/incidents` | ADMIN |

## DTO / Validation

All body/query DTOs live in `src/legal/dto/legal.dto.ts` and use `class-validator`
decorators. Invalid payloads return `400` with field-level errors. Pagination is
server-side (`limit`/`offset`) and all list endpoints are filterable/searchable.
