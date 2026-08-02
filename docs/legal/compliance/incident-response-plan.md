# Incident Response Plan

**Status:** DRAFT — First draft, not yet reviewed by security operations.  
**Backend reference:** `apps/backend/src/legal/security-center.service.ts:66-80` — official IRP definition.

---

## 1. Overview

SpiceGarden operates a documented incident response plan aligned to **NIST SP 800-61**. Security incidents are classified, contained, eradicated, and recovered with defined SLAs. The plan is maintained in the Security Center service and is available via API at `GET /v1/security-center/incident-response`.

**Backend reference:** `apps/backend/src/legal/security-center.controller.ts:40-44` — `incidentResponse()` endpoint.

## 2. Security Contact

| Contact | Details |
|---|---|
| Security Email | security@spicegarden.com |
| PGP Fingerprint | 9F2A 4C1B 8E3D 6A05 7C9F 1B2E 3D4A 5F6B 7C8D 9E0F |
| PGP Public Key | https://spicegarden.com/.well-known/pgp-key.asc |
| Bug Bounty Program | https://bugbounty.spicegarden.com |
| Disclosure Policy | Coordinated disclosure, 90-day embargo after resolution |
| Response SLA | Acknowledgement within 24h, triage within 72h |

**Backend reference:** `apps/backend/src/legal/security-center.service.ts:36-43` — security contact configuration.

## 3. Incident Classification

### Severity Levels

| Severity | Definition | SLA |
|---|---|---|
| **Critical** | Data breach with PII exposure; system compromise; payment processing outage; safety incident | T + 1 hour |
| **High** | Service degradation affecting >10% of users; security vulnerability with public exploit | T + 4 hours |
| **Medium** | Minor service degradation; potential security issue without active exploitation | T + 24 hours |
| **Low** | Informational security events; false positives; minor policy violations | T + 72 hours |

**Backend reference:** `apps/backend/src/db/entities/security-incident.entity.ts:8-11` — severity enum: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.

## 4. Incident Status Lifecycle

| Status | Description |
|---|---|
| `OPEN` | Incident reported and not yet acknowledged |
| `INVESTIGATING` | Being actively investigated |
| `CONTAINED` | Short-term containment measures applied |
| `RESOLVED` | Root cause identified and remediation applied |
| `CLOSED` | Post-mortem complete; all actions finished |

**Backend reference:** `apps/backend/src/db/entities/security-incident.entity.ts:12-15` — status enum.

## 5. Response Phases and SLAs

### Phase 1: Identification
- **SLA:** Triage within 1 hour
- **Steps:** Alert ingestion, severity classification, owner assignment
- Incident owners are assigned from the Security Operations team via PagerDuty.

### Phase 2: Containment
- **SLA:** Short-term within 4 hours
- **Steps:** Isolate affected systems, revoke credentials, preserve evidence
- For credential compromise: Rotate all affected credentials immediately. Keys rotation is automated via `infra/scripts/rotate-secrets.js` and `apps/backend/src/security/vault.service.ts:127-135`.

### Phase 3: Eradication
- **SLA:** Within 24 hours
- **Steps:** Root-cause analysis, remove persistence, patch vulnerabilities
- Patches follow the monthly baseline cadence with emergency 24h CVE response.

### Phase 4: Recovery
- **SLA:** Within 72 hours
- **Steps:** Restore from clean backups, monitor for recurrence, validation testing
- Restores use the disaster recovery procedure at `infra/scripts/disaster-recovery.sh`.

### Phase 5: Post-Mortem
- **SLA:** Within 14 days
- **Steps:** Blameless retrospective, publish disclosure if required, update runbooks

**Backend reference:** `apps/backend/src/legal/security-center.service.ts:71-77` — official phase definitions.

## 6. Incident Reporting

Incidents can be reported via:
1. **API:** `POST /v1/security-center/incidents` — open endpoint, does not require authentication
2. **Email:** security@spicegarden.com (PGP encrypted)
3. **Bug bounty:** https://bugbounty.spicegarden.com

**Backend reference:** `apps/backend/src/legal/security-center.controller.ts:79-83` — `reportIncident()` endpoint, no auth guard.

## 7. Compliance Frameworks

| Framework | Status | Last Audit |
|---|---|---|
| SOC 2 Type II | In progress | 2026-Q1 |
| ISO 27001 | Certified | 2025-11 |
| PCI DSS SAQ A | Attested | 2026-02 |

**Backend reference:** `apps/backend/src/legal/security-center.service.ts:104-110` — SOC report status. PCI DSS SAQ A validates that no cardholder data is stored (`security-center.service.ts:114`).

## 8. Patch Management

- **Cadence:** Monthly baseline patching
- **Emergency:** Patches within 24h of critical CVE disclosure
- **Severity SLAs:** Critical: 24h, High: 72h, Medium: 14d, Low: 30d
- **Process:** CVE monitoring → automated CI updates → staged rollout → rollback validation

**Backend reference:** `apps/backend/src/legal/security-center.service.ts:82-92` — patch policy.

## 9. Encryption Standards

| Control | Standard |
|---|---|
| At Rest | AES-256-GCM for sensitive data (PII, legal records, agreement content) |
| In Transit | TLS 1.2+ on all public endpoints; HSTS enabled |
| Key Management | HashiCorp Vault; no secrets committed to source control |
| Key Rotation | Symmetric data keys rotated every 90 days; signing keys rotated on incident |

**Backend reference:** `apps/backend/src/legal/security-center.service.ts:95-101` — encryption policy.

## 10. Incident Register

All reported incidents are stored in the `security_incidents` database table with a content hash for integrity verification.

**Backend references:**
- Incident entity: `apps/backend/src/db/entities/security-incident.entity.ts:1-20`
- Integrity hashing: `apps/backend/src/legal/integrity.service.ts` — `hashContent()` computes SHA-256 hash of incident details
- Audit trail: `apps/backend/src/legal/compliance-audit.service.ts` — records all incident actions

---

*This document is a DRAFT. For security incidents, contact security@spicegarden.com.*
