# Community Guidelines

**Effective Date:** 2026-06-10  
**Status:** DRAFT — First draft, not yet reviewed by legal counsel.

---

## 1. Respect

Treat all customers, restaurants, delivery partners, and community members with respect. Harassment, discrimination, or abusive behavior is prohibited. This includes:
- Offensive language in reviews or communications
- Threats or intimidation
- Discrimination based on protected characteristics

## 2. Safety

Do not request or engage in unsafe conduct. This includes:
- Ordering items prohibited by law
- Requesting delivery to unsafe locations
- Sharing harmful or dangerous content

## 3. Authenticity

Provide truthful information in reviews, ratings, and communications:
- Do not inflate or manipulate ratings
- Do not post fake reviews
- Do not impersonate others

**Backend reference:** `apps/backend/src/db/entities/review.entity.ts` (if exists) — review/rating storage. The data disclosure audit confirmed no `review` entity exists in the backend schema, indicating reviews are display-only or handled differently.

## 4. Reporting Violations

Violations can be reported through:
- In-app: Profile → Help → Report an Issue
- Email: community@spicegarden.com

## 5. Enforcement

Violations may lead to:
- Content removal
- Warnings
- Temporary account suspension
- Permanent account termination

For restaurants and delivery partners, violations are subject to the Merchant Agreement and Driver Agreement respectively.

**Backend reference:** `apps/backend/src/legal/legal-seed.service.ts:193-202` — Community Guidelines seed definition.

---

*This document is a DRAFT. For questions, contact community@spicegarden.com.*
