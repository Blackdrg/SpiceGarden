# Escalation Standard Operating Procedure (SOP)

**Effective Date:** 2026-06-10  
**Status:** DRAFT — First draft, not yet reviewed by legal counsel.  
**Applies to:** Support agents, supervisors, operations managers, and executives

---

## 1. Overview

This SOP defines escalation paths for incidents ranging from delayed deliveries to safety emergencies. All personnel must follow the prescribed tiers and SLAs.

**Backend reference:** `apps/backend/src/legal/legal-seed.service.ts:177-190` — Escalation SOP seed definition.

## 2. Tier 1 — Frontline Resolution

| Criterion | Details |
|---|---|
| **Who** | Support agent or delivery partner |
| **SLA** | 15 minutes |
| **Scope** | Missing items, minor delays, wrong address, payment discrepancies |
| **Action** | Acknowledge, investigate, resolve or offer compensation within authority limits (up to ₹500) |

## 3. Tier 2 — Supervisor Escalation

| Criterion | Details |
|---|---|
| **Who** | Supervisor |
| **SLA** | 30 minutes |
| **When** | Tier 1 cannot resolve within 15 minutes; customer requests a supervisor; food safety concerns; harassment; vehicle accident; financial exposure exceeds ₹500 |
| **Action** | Review case, contact customer within 30 minutes, issue resolution or escalate to Tier 3 |

## 4. Tier 3 — Management Escalation

| Criterion | Details |
|---|---|
| **Who** | Operations Manager |
| **SLA** | 1 hour |
| **When** | Tier 2 cannot resolve within 30 minutes; serious injury; police involvement; media risk; financial exposure exceeds ₹5,000; systemic failure |
| **Action** | Engage ops manager, coordinate with legal/compliance, communicate status to affected parties within 1 hour |

## 5. Tier 4 — Executive and External Escalation

| Criterion | Details |
|---|---|
| **Who** | CTO, COO, Legal Counsel |
| **SLA** | 15 minutes notification |
| **When** | Regulatory inquiry or legal notice; data breach; mass order failure (>50 orders); customer fatality or serious injury |
| **Action** | CTO/COO notified within 15 minutes. External stakeholders (law enforcement, regulators, insurers) contacted per legal counsel guidance. PR hold until approved. |

**Backend reference:** `apps/backend/src/legal/security-center.service.ts:74` — security incident response SLA ("Within 24 hours").

## 6. SOS / Emergency Protocol

For immediate danger:
1. Customer or partner triggers SOS in-app.
2. System automatically alerts:
   - Operations center
   - Nearest available delivery partners within 5 km
   - Emergency contacts on file
3. If police or ambulance is needed, operations center dials 100/108 immediately and logs the incident.

**Backend reference:** `apps/backend/src/db/entities/security-incident.entity.ts` — `SecurityIncidentStatus.OPEN` → `INVESTIGATING` → `CONTAINED` → `RESOLVED` → `CLOSED`.

## 7. Communication Standards

1. All escalations must be logged in the ticketing system with:
   - Severity level
   - Affected parties
   - Actions taken
   - Resolution timeline
2. No promise of compensation beyond authority limits without manager approval.
3. Keep the customer informed every 30 minutes during active escalation.

**Backend reference:** `apps/backend/src/services/support/support.controller.ts:44-51` — `requestRefund()` support ticketing.

## 8. Post-Incident Review

Within 24 hours of Tier 3/4 resolution:
1. Conduct a blameless post-mortem.
2. Document root cause, remediation steps, and process improvements.
3. Update this SOP if a new failure mode is identified.

**Backend reference:** `apps/backend/src/legal/security-center.service.ts:74` — incident response SLA ("Within 24 hours").

---

*This document is a DRAFT. For operational questions, contact ops@spicegarden.com.*
