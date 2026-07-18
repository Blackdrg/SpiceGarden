# Security Audit Guide

**Version:** 1.0.0
**Owner:** Security Engineering

## 1. Internal Audit (self-service)
Run from repo root:
```bash
node infra/scripts/security-tests.js      # SQLi, XSS, rate-limit, auth-bypass, path-traversal
node infra/scripts/penetration-tests.js   # port scan, headers, CORS, HTTP methods
npm run lint                            # static analysis
npm audit --audit-level=high           # dependency CVEs
```
Evidence captured in `docs/prod-readiness/00-command-output/`.

## 2. CI Gating
`ci-cd.yml` stages `security-audit` (npm audit + Snyk) and `build-test` (Trivy image scan). Any high/critical fails the pipeline.

## 3. Compliance Mapping
| Framework | Where demonstrated |
|-----------|--------------------|
| GDPR Art. 32 (security of processing) | Encryption, access control, logging |
| DPDP Act 2023 (security safeguards) | Same + `ComplianceAuditService` |
| PCI-DSS (scope reduction) | No card storage; tokenized gateways |
| SOC 2 (Security/Availability) | Monitoring, SDLC, incident response |
| ISO 27001 (Annex A) | Policies in `docs/security/`, threat model |

## 4. External Audit
- Annual third-party pentest + SOC 2 Type II.
- Provide auditors: repo read access, `docs/security/`, `docs/architecture/`, CI logs, and the seed/legal compliance module.
- Remediation SLA per Incident Response Policy severity table.
