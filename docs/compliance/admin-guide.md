# Admin Compliance Guide

Access the Compliance Center in **Super Admin** (`/compliance`) or via the API
(`/compliance-admin/*`, role `ADMIN`/`SUPER_ADMIN`, permission `compliance:read`).

## Overview

`GET /compliance-admin/overview` returns a live snapshot:
- Documents published vs draft
- Data subject requests: total / pending / SLA-breached
- Open security incidents & DPDP grievances
- Tamper scan result (records checked vs tampered)

## Queues

- **GDPR Requests** / **DPDP Requests** — review with `POST /privacy/requests/:id/review`
  (`{ "reviewerId", "decision": "approve"|"reject", "notes" }`).
- **Deletion Queue** — approved delete requests awaiting execution.
- **Export Queue** — access/portability requests; generate via
  `POST /privacy/exports` then download `/privacy/exports/:id/download`.

## Retention & Legal Holds

- `GET /compliance-admin/retention-status` shows policies + recent jobs.
- `GET /compliance-admin/legal-holds` lists suspended (legal-hold) policies.
- Trigger a run: `RetentionService.runPolicy(key)` (scheduler or manual).

## Policy Governance

- `GET /compliance-admin/policy-versions` — full version registry.
- `GET /compliance-admin/consent-logs` / `audit-logs` — immutable ledgers.
- `POST /compliance-admin/integrity-scan` — force a tamper rescan.

## Incidents

- `GET /compliance-admin/security-events` — security incident registry.
- Users are notified automatically on policy update, consent requirement,
  agreement expiry, privacy request completion, export ready, deletion complete,
  and security incident (Part 15).
