# Developer Guide — Extending Compliance

## Add a new legal document type

1. Add the enum value in `src/legal/entities/legal.enums.ts` (`LegalDocumentType`).
2. Add seed content in `src/legal/legal-seed.service.ts` (`buildDocuments()`).
3. Re-run `POST /legal/seed` (idempotent — skips existing types).

## Add a new agreement party/type

1. Agreements use `AgreementParty` (merchant/driver/partner) + free-form `type`.
2. Create: `POST /agreements` → approve: `POST /agreements/:id/approve`.
3. Frontends fetch via `GET /agreements/current/:party/:type`.

## Add a retention policy

1. Define in `DEFAULT_POLICIES` (`retention.service.ts`) or POST via admin.
2. Seed: `POST /legal/retention/seed`.
3. Scheduler calls `RetentionService.runPolicy(key)` per cron; `legalHoldCapable`
   policies can be suspended with `setLegalHold`.

## Add an API endpoint

1. Add method to the appropriate controller with `@ApiTags`, `@ApiOperation`.
2. Guard with `@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)` + `@Roles`/`@Permissions`.
3. Define DTO in `dto/legal.dto.ts` with `class-validator`.
4. Audit side-effects via `ComplianceAuditService.record`.

## Integrity

- Sign any new immutable record with `LegalIntegrityService.sign` and verify in
  `ComplianceAuditService.scanForTampering`.
- Tests: `test/legal.services.spec.ts` (covers all services incl. the export
  JSON/CSV/PDF generator and tamper detection).

## Running tests

```
cd apps/backend
npm run test:unit        # includes legal.services.spec.ts
npm run test:integration
npm run test:cov         # coverage gate (>=80%)
```
