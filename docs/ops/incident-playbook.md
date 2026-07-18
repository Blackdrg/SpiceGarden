# Incident Playbook

**Version:** 1.0.0
**Companion:** `docs/security/incident-response.md`, `docs/ops/production-runbook.md`

## 1. Declare
- Open incident in Security Center: `POST /security-center/incidents` (or internal tracker).
- Assign Incident Commander (IC). P1 → IC + Security Lead + EM + DPO paged.

## 2. Triage (first 15 min, P1)
1. Confirm impact: error rate, affected users, $ exposure.
2. Identify blast radius (which service/region/tenant).
3. Communicate: post in #incident; user-facing note if P1.

## 3. Mitigate
- Scale-to-zero / disable route for the bad deploy.
- Rotate creds if leak suspected (`secrets-rotation.ps1.js`).
- Failover DB if primary down (`disaster-recovery.sh --production`).

## 4. Resolve
- Root-cause fix → PR → CI → staged rollout (see `deployment-runbook.md`).
- Verify `/health` + smoke order flow.

## 5. Communicate resolution
- Update #incident; close user note.
- Schedule blameless post-mortem (5 business days).

## 6. Follow-up
- Update runbooks / OWASP checklist / threat model.
- Log actions to `compliance_audits`.
