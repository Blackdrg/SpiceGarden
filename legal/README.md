# SpiceGarden Legal Documents — Version Index

**Version:** 1.0.0
**Effective date:** 2026-06-10
**Owner:** Super Admin
**Source of truth:** `apps/backend/src/legal/legal-seed.service.ts` (seeded into `legal_documents` / `legal_versions` at boot)

These documents are served to clients via the Legal API (`GET /legal/documents/:type`, `GET /legal/center`) and stored versioned in PostgreSQL. The markdown here is the human-reviewable mirror.

| Document | Slug / Type | Requires Acceptance | File |
|----------|--------------|--------------------|------|
| Privacy Policy | `privacy_policy` | Yes | [privacy-policy.md](v1/privacy-policy.md) |
| Terms of Service | `terms_of_service` | Yes | [terms-of-service.md](v1/terms-of-service.md) |
| Cookie Policy | `cookie_policy` | No | [cookie-policy.md](v1/cookie-policy.md) |
| Refund Policy | `refund_policy` | No | [refund-policy.md](v1/refund-policy.md) |
| Cancellation Policy | `cancellation_policy` | No | [cancellation-policy.md](v1/cancellation-policy.md) |
| Delivery Policy | `delivery_policy` | No | [delivery-policy.md](v1/delivery-policy.md) |
| Community Guidelines | `community_guidelines` | No | [community-guidelines.md](v1/community-guidelines.md) |
| Merchant Agreement | `merchant_agreement` | Yes | [merchant-agreement.md](v1/merchant-agreement.md) |
| Driver Agreement | `driver_agreement` | Yes | [driver-agreement.md](v1/driver-agreement.md) |
| Partner Agreement | `partner_agreement` | No | [partner-agreement.md](v1/partner-agreement.md) |
| Security Policy | `security_policy` | No | [security-policy.md](v1/security-policy.md) |
| Responsible Disclosure | `responsible_disclosure` | No | [responsible-disclosure.md](v1/responsible-disclosure.md) |
| Accessibility Statement | `accessibility_statement` | No | [accessibility-statement.md](v1/accessibility-statement.md) |
| Data Retention Policy | `data_retention_policy` | No | [data-retention-policy.md](v1/data-retention-policy.md) |
| Acceptable Use Policy | `acceptable_use_policy` | No | [acceptable-use-policy.md](v1/acceptable-use-policy.md) |
| Copyright Policy | `copyright_policy` | No | [copyright-policy.md](v1/copyright-policy.md) |
| Trademark Policy | `trademark_policy` | No | [trademark-policy.md](v1/trademark-policy.md) |
| Open Source Licenses | `open_source_licenses` | No | [open-source-licenses.md](v1/open-source-licenses.md) |

## Integration points (current)
- **Backend / DB:** `LegalSeedService` seeds these on module init into `legal_documents` + `legal_versions` (idempotent). Acceptance records stored in `legal_acceptances`.
- **API:** `LegalController` (`/legal/...`), `PrivacyController` (`/privacy/...`), `AgreementController` (`/agreements/...`).
- **Frontend wiring (footer / signup / account settings):** NOT YET WIRED. Requires a Feature-Freeze exception (see `docs/v1-architecture-freeze.md`). Tracked as a known gap.

## Change process
1. Edit the relevant `v1/<slug>.md`.
2. Bump version in `legal-seed.service.ts` spec `changeNotes` and re-seed (or use the `/legal` admin endpoints to create/approve/publish a new version).
3. Update this index.
