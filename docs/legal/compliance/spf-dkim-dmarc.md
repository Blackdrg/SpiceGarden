# SPF, DKIM, and DMARC DNS Configuration

**Status:** DRAFT — First draft, not yet reviewed by security counsel.  
**Last verified:** 2026-08-02  
**Domain:** `spicegarden.com`

---

## 1. Overview

This document specifies the SPF, DKIM, and DMARC DNS records required to secure email delivery from SpiceGarden and prevent email spoofing. All outbound email is sent via **SendGrid** (SMTP: `smtp.sendgrid.net`, port 587).

## 2. Email Infrastructure

| Provider | SMTP Host | Port | Auth Method | FROM Address |
|---|---|---|---|---|
| SendGrid | `smtp.sendgrid.net` | 587 | API key (`apikey` user) | `noreply@spicegarden.com` |

**Backend references:**
- SMTP config: `.env.example:64-69` — `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER=apikey`, `SMTP_PASS`, `SMTP_FROM=noreply@spicegarden.com`
- SendGrid API: `apps/backend/src/services/auth/password-reset.service.ts:30-49` — direct API calls to `https://api.sendgrid.com/v3/mail/send`
- SendGrid API: `apps/backend/src/services/notifications/notification.service.ts:119-135` — notification emails
- SendGrid API: `apps/backend/src/services/notifications/production-notification.service.ts:167-185` — operational alerts

## 3. Required DNS Records

### 3.1 SPF Record (TXT)

**Record Name:** `spicegarden.com` (or `@` in some DNS UIs)  
**Record Type:** TXT  
**Value:** `v=spf1 include:sendgrid.net ~all`

**Purpose:** Authorizes SendGrid's mail servers to send email on behalf of `spicegarden.com`. All other mail sources are "soft fail" (~all).

**Status:** `ENGINEERABLE NOW` — Add this TXT record to the DNS zone for `spicegarden.com`.

### 3.2 DKIM Record (TXT)

SendGrid provides DKIM signing automatically when you authenticate your sender identity. For `spicegarden.com` with SendGrid:

**Option A: SendGrid Default DKIM (automated)**
- SendGrid generates DKIM records when you set up domain authentication in the SendGrid console.
- Three CNAME records are typically provided:
  - `s1._domainkey.spicegarden.com` → CNAME → `s1.domainkey.sendgrid.org`
  - `s2._domainkey.spicegarden.com` → CNAME → `s2.domainkey.sendgrid.org`
  - `s3._domainkey.spicegarden.com` → CNAME → `s3.domainkey.sendgrid.org`

**Option B: SendGrid Manual DKIM (if not using automated domain auth)**
**Record Name:** `s1._domainkey.spicegarden.com` (and `s2`, `s3`)  
**Record Type:** CNAME  
**Value:** Provided by SendGrid console under "Sender Authentication" → "Domain Authentication"

**Status:** `PARKED — CREDENTIAL/ACCOUNT` — Requires SendGrid account access to generate DKIM keys. Steps:
1. Sign in to SendGrid console (account held by operations team)
2. Navigate to Settings → Sender Authentication → Domain Authentication
3. Add `spicegarden.com` and follow the wizard
4. Add the three CNAME records to DNS
5. Verify in SendGrid console

### 3.3 DMARC Record (TXT)

**Record Name:** `_dmarc.spicegarden.com`  
**Record Type:** TXT  
**Recommended Value (monitor):**
```
v=DMARC1; p=none; rua=mailto:dmarc@spicegarden.com; ruf=mailto:dmarc@spicegarden.com; fo=1; adkim=r; aspf=r; pct=100
```

**Recommended Value (after monitoring proves no spoofing):**
```
v=DMARC1; p=quarantine; rua=mailto:dmarc@spicegarden.com; ruf=mailto:dmarc@spicegarden.com; fo=1; adkim=r; aspf=r; pct=100
```

**Recommended Value (full enforcement):**
```
v=DMARC1; p=reject; rua=mailto:dmarc@spicegarden.com; ruf=mailto:dmarc@spicegarden.com; fo=1; adkim=r; aspf=r; pct=100
```

| Tag | Value | Purpose |
|---|---|---|
| `v` | `DMARC1` | Protocol version |
| `p` | `none` / `quarantine` / `reject` | Policy for failed messages |
| `rua` | `mailto:dmarc@spicegarden.com` | Aggregate report URI |
| `ruf` | `mailto:dmarc@spicegarden.com` | Forensic report URI |
| `fo` | `1` | Failure reporting (any DMARC failure) |
| `adkim` | `r` | Relaxed DKIM alignment |
| `aspf` | `r` | Relaxed SPF alignment |
| `pct` | `100` | Apply to 100% of mail |

**Status:** `ENGINEERABLE NOW` — Add this TXT record. Start with `p=none` for monitoring, then escalate to `p=quarantine` after 30 days, then `p=reject` after 60 days.

## 4. DNS Records Summary

| Record | Type | Name | Value | Status |
|---|---|---|---|---|
| SPF | TXT | `spicegarden.com` | `v=spf1 include:sendgrid.net ~all` | `ENGINEERABLE NOW` |
| DKIM (s1) | CNAME | `s1._domainkey.spicegarden.com` | (provided by SendGrid) | `PARKED — CREDENTIAL/ACCOUNT` |
| DKIM (s2) | CNAME | `s2._domainkey.spicegarden.com` | (provided by SendGrid) | `PARKED — CREDENTIAL/ACCOUNT` |
| DKIM (s3) | CNAME | `s3._domainkey.spicegarden.com` | (provided by SendGrid) | `PARKED — CREDENTIAL/ACCOUNT` |
| DMARC | TXT | `_dmarc.spicegarden.com` | `v=DMARC1; p=none; rua=mailto:dmarc@spicegarden.com; ...` | `ENGINEERABLE NOW` |

## 5. Email Security Controls in Code

| Control | Implementation | Backend Reference |
|---|---|---|
| API key auth | `Bearer ${sendgridKey}` | `password-reset.service.ts:44`, `notification.service.ts:126` |
| Key validation | Rejects `CHANGE_ME` placeholders | `password-reset.service.ts:31`, `notification.service.ts:120` |
| Required in prod | `SENDGRID_API_KEY` in `main.ts:95` | `main.ts:95` |
| Secret loader | SendGrid key loaded via secret loader | `secret-loader.service.ts:28` |
| Rate limiting | Email endpoints rate-limited | `main.ts:174-177` — password reset rate limits |

## 6. Email Categories

| Category | Provider | Template | Backend Reference |
|---|---|---|---|
| Password reset | SendGrid API | Dynamic template | `password-reset.service.ts:30-49` |
| Order notifications | SendGrid API | Dynamic template | `notification.service.ts:119-135` |
| Refund notifications | SendGrid API | Dynamic template | `production-notification.service.ts:167-185` |
| Welcome / verification | SendGrid API | Dynamic template | (in notification service) |
| Operational alerts | SendGrid API | Dynamic template | `production-notification.service.ts` |

## 7. DMARC Monitoring

Aggregate and forensic reports will be sent to `dmarc@spicegarden.com`. A mailbox should be set up for this address. Monitoring should be reviewed monthly.

---

*This document is a DRAFT. SPF/DKIM/DMARC records must be configured by the domain administrator. Requires SendGrid account access for DKIM setup.*
