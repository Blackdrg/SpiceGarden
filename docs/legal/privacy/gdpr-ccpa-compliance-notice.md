# GDPR Compliance Notice

**Draft status:** FIRST DRAFT for human/legal review. Grounded in actual codebase behavior. Must be reviewed by a qualified lawyer before publication.

**Effective date:** [PLACEHOLDER — to be set by business owner]

---

## 1. Applicability

This notice applies if you are a resident of the European Economic Area (EEA), United Kingdom, or Switzerland. It describes our obligations and your rights under the **General Data Protection Regulation (GDPR)**.

**Whether we actually serve EU users is a business decision.** If SpiceGarden does not target or serve EU residents, this notice may not apply. The technical controls described below exist in code regardless, to support compliance if/when EU users are onboarded.

---

## 2. Legal Bases for Processing

Per `legal-seed.service.ts:88`, we rely on the following legal bases:

| Processing Activity | Legal Basis | Data Categories |
|---|---|---|
| Account authentication | Contract | Name, email, phone, password hash |
| Order processing & delivery | Contract | Addresses, location, order details, payment info |
| Payment processing | Contract | Tokenized payment methods, bank account |
| Fraud prevention & security | Legitimate interests | Device fingerprint, IP, session, audit logs |
| Analytics (page views, events) | Legitimate interests / Consent | Analytics events, web vitals |
| Marketing communications | Consent (required) | Email, phone, push token |
| Non-essential cookies | Consent (required) | Analytics, marketing, performance, preference cookies |
| Location tracking (non-delivery) | Consent | Precise location |
| AI chatbot processing | Consent (when active) | Chat messages sent to OpenAI |
| Tax compliance | Legal obligation | GST details, orders, invoices, payments |

---

## 3. Your Rights Under GDPR

| Right | How We Support It (Code) |
|---|---|
| **Right of Access** | `GET /privacy/exports/:userId` + `GET /privacy/exports/:exportId/download` — `data-subject-request.service.ts:443-494` |
| **Right to Rectification** | `POST /privacy/requests` with `type: "correct"` — `data-subject-request.service.ts:55` |
| **Right to Erasure** | `POST /privacy/requests` with `type: "delete"` → `executeDeletion()` — `data-subject-request.service.ts:204-282` |
| **Right to Restrict Processing** | `restrictProcessing()` — `data-subject-request.service.ts:327-341` |
| **Right to Data Portability** | JSON/CSV/PDF export via `buildExportPayload()` — `data-subject-request.service.ts:496-524` |
| **Right to Object** | `POST /legal/consent/:consentId/withdraw` — `consent.service.ts:132-166` |
| **Rights related to automated decision-making** | Not applicable — AI is used for recommendations/forecasting only, not automated decision-making affecting individuals |

---

## 4. Data Subject Request (DSR) Workflow

1. Submit request: `POST /privacy/requests` with `{ userId, type, regulation: "gdpr", reason? }` (`privacy.controller.ts:52-58`)
2. Request is recorded with SLA (`data-subject-request.service.ts:76` — 30 days for access/delete/correct)
3. Admin reviews: `POST /privacy/requests/:id/review` with `decision: "approve"|"reject"` (`privacy.controller.ts:87-94`)
4. Processing: `complete()` method executes deletion/export (`data-subject-request.service.ts:150-196`)
5. Notification: User notified via push/email of completion
6. Audit: All actions logged via `ComplianceAuditService`

---

## 5. International Data Transfers

Data may be transferred to servers in India and the US. We implement Standard Contractual Clauses (EU Commission Implementing Decision 2021/914) for transfers outside the EEA.

---

## 6. Data Protection Officer

**DPO:** privacy@spicegarden.com  
**Postal:** [PLACEHOLDER — registered office address]

---

## 7. Consent Management

- Cookie consent: `POST /legal/consent` records preferences per category (`consent.service.ts:64-130`)
- Consent withdrawal: `POST /legal/consent/:consentId/withdraw` (`consent.service.ts:132-166`)
- Active consent lookup: `GET /legal/consent/active` (`legal.controller.ts:215-221`)
- Consent audit logs: `GET /legal/consent/logs` (admin only) (`legal.controller.ts:225-232`)

---

## 8. Data Breach Notification

In the event of a personal data breach, we will notify:
- The relevant supervisory authority within **72 hours** (where feasible)
- Affected data subjects **without undue delay** (where the breach is likely to result in high risk)

Breach response is coordinated through the **Security Incident Response Plan** (see `docs/legal/compliance/incident-response-plan.md`).

---

## Code Evidence

- `data-subject-request.service.ts:29-37` — SLA by request type (30 days, 15 for consent withdrawal)
- `data-subject-request.service.ts:204-282` — `executeDeletion()` for Right to Erasure
- `data-subject-request.service.ts:496-524` — `buildExportPayload()` for Right to Access/Portability
- `consent.service.ts:64-166` — Consent recording and withdrawal
- `legal.controller.ts:195-257` — Consent and cookie registry API endpoints
- `privacy.controller.ts:51-179` — GDPR/DPDP data subject request and privacy dashboard endpoints
