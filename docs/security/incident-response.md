# Incident Response Policy

**Version:** 1.0.0
**Owner:** Security Engineering (on-call SRE)
**Applies to:** All SpiceGarden production systems

## 1. Purpose
Define how SpiceGarden detects, responds to, and recovers from security incidents while meeting contractual and regulatory obligations (GDPR 72-hour breach notification, DPDP breach reporting).

## 2. Incident Classification
| Severity | Examples | Response SLA |
|----------|----------|---------------|
| Critical (P1) | Active data breach, auth bypass in prod, payment fraud vector | 15 min acknowledge, 1 h containment |
| High (P2) | Suspected compromise of non-PII system, failed but repeated attacks | 30 min acknowledge, 4 h containment |
| Medium (P3) | Phishing report, misconfiguration without exposure | 4 h acknowledge, 24 h remediation |
| Low (P4) | Informational, policy question | 1 business day |

## 3. Response Lifecycle
1. **Detect** — Alertmanager/Prometheus anomaly, Sentry errors, WAF/rate-limit trips, responsible-disclosure email.
2. **Triage** — On-call SRE classifies severity and opens an incident in the Security Center (`POST /security-center/incidents`).
3. **Contain** — Isolate affected service (scale to zero / disable route / rotate creds).
4. **Eradicate** — Remove root cause, patch, redeploy via CI/CD.
5. **Notify** — DPO notifies affected users and regulators per GDPR Art. 33/34 and DPDP Rules within the statutory window.
6. **Post-mortem** — Blameless review within 5 business days; update runbooks.

## 4. Escalation
See `docs/RELIABILITY_TESTING.md` escalation matrix. P1 pages Security Lead + Engineering Manager + DPO simultaneously.

## 5. Evidence & Audit
All incident actions are recorded via `ComplianceAuditService` (`compliance_audits` table) and the Security Center's `security_incidents` entity.
