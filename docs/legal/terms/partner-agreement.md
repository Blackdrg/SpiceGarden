# Partner Agreement

**Effective Date:** 2026-06-10  
**Status:** DRAFT — First draft, not yet reviewed by legal counsel.  
**Backend reference:** `apps/backend/src/legal/entities/legal.enums.ts:13` (`LegalDocumentType.PARTNER_AGREEMENT`), `apps/backend/src/legal/agreement.service.ts:12-240`.

---

## 1. Scope

This Partner Agreement ("Agreement") governs the relationship between SpiceGarden Technologies Pvt. Ltd. ("SpiceGarden") and technology, integration, or channel partners ("Partner"). This agreement covers API access, co-marketing, and integration partnerships.

## 2. API Access and Integration

Partners may be granted access to SpiceGarden APIs for integration purposes. All API usage is subject to:
- Rate limits as specified in the API documentation
- Authentication via API keys provided by SpiceGarden
- Compliance with the Acceptable Use Policy (`docs/legal/terms/acceptable-use-policy.md`)

**Backend reference:** `apps/backend/src/services/partner/partner-api.controller.ts` (if exists) — partner API endpoints. API keys are managed via `apps/backend/src/db/entities/api-key.entity.ts`.

## 3. Data Handling

Partners process personal data only as instructed by SpiceGarden and under a Data Processing Agreement (DPA). Partners must:
- Implement and maintain appropriate security measures
- Not subcontract data processing without SpiceGarden's prior written consent
- Return or delete personal data upon termination of this agreement
- Report data breaches within 24 hours

**Backend reference:**
- API key scopes: `apps/backend/src/db/entities/api-key.entity.ts:16-35` — `scopes` field restricting partner API access.
- Data export API: `apps/backend/src/legal/data-subject-request.service.ts:496-524` — data export logic.
- Data deletion: `apps/backend/src/legal/data-subject-request.service.ts:204-282` — automated deletion logic.

## 4. Branding and Trademarks

Use of SpiceGarden names, logos, designs, and other marks requires prior written approval. Partners must:
- Follow SpiceGarden brand guidelines
- Not modify marks without approval
- Not use marks in a way that implies endorsement or partnership beyond this agreement
- Display the following attribution: "Powered by SpiceGarden" or as otherwise agreed

**Backend reference:** `apps/backend/src/legal/legal-seed.service.ts:316-323` — Trademark Policy seed definition.

## 5. Co-Marketing

Partners may participate in co-marketing activities as mutually agreed, including:
- Joint press releases (with prior approval)
- Co-branded marketing materials
- Event sponsorship and participation

All marketing materials must be reviewed and approved by SpiceGarden before publication.

## 6. Fees and Payment

Partners may receive:
- Referral fees for customer referrals
- Revenue share for integrated services
- Fixed fees for development and integration work

Payment terms are specified in the individual partner's commercial agreement.

## 7. Confidential Information

Each party agrees to keep the other party's confidential information secret, including but not limited to:
- Technical specifications and roadmaps
- Business plans and financial information
- Customer lists and data
- Trade secrets

This obligation survives termination for 3 years.

## 8. Term and Termination

This agreement is effective for the term specified in the commercial agreement and renews automatically unless terminated with 30 days' notice. Upon termination:
- API access is revoked
- Confidential information is returned or destroyed
- Outstanding obligations are fulfilled
- All data is returned or deleted

## 9. Limitation of Liability

To the maximum extent permitted by law, neither party's total liability arising out of or related to this agreement shall exceed the amounts paid by SpiceGarden to the Partner in the 12 months preceding the claim.

---

*This document is a DRAFT. For questions, contact partners@spicegarden.com.*
