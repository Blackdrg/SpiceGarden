# Cookie Policy

**Effective Date:** 2026-06-10  
**Status:** DRAFT — First draft, not yet reviewed by legal counsel.

---

## 1. What Are Cookies

Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and to provide information to site operators. We also use similar tracking technologies such as web beacons, pixel tags, and local storage.

## 2. How We Use Cookies

We use cookies for the following purposes:

| Purpose | Description | Legal Basis |
|---|---|---|
| Strictly Necessary | Enable core functionality (authentication, cart, security) | Contract / Legitimate interest |
| Functional | Remember your language and region preferences | Consent (where required) |
| Analytics | Measure usage and performance of the platform | Consent |
| Performance | Monitor site performance, debug errors | Consent |
| Marketing | Deliver personalized offers and measure campaigns | Consent |
| Preferences | Store UI and personalization choices | Consent |

## 3. Cookie Categories

### Strictly Necessary Cookies (Always Active)
These cookies are essential for the platform to function. You cannot disable these.

- `spicegarden_session` — Session identifier (HttpOnly, SameSite=Lax)
- `_csrf` — Cross-site request forgery token

**Backend reference:** `apps/backend/src/security/csrf.middleware.ts:20` — CSRF token cookie name and configuration.

### Functional Cookies
- `sg_locale` — Language preference (expires: 365 days)

### Analytics Cookies
- `sg_analytics_id` — Anonymous analytics identifier
- `sg_cookie_consent` — Stores your consent preferences

### Performance Cookies
- `sg_perf_metrics` — Performance measurement identifier

**Frontend reference:** `apps/customer-web/src/hooks/useCookieConsent.ts:4` — `CONSENT_STORAGE_KEY` definition.

### Marketing Cookies
- `sg_campaign_id` — Campaign attribution identifier

### Preference Cookies
- `sg_ui_prefs` — UI customization preferences

## 4. Cookie Registry

A full, up-to-date registry of cookies is maintained in `docs/legal/data-disclosure-audit.md` (Section N: Data Disclosure Audit). This registry includes:

- Cookie name
- Purpose
- Data collected
- Expiry period
- Provider
- Whether consent is required

## 5. Third-Party Cookies

We use services from third parties that may set cookies:

- **Google Maps** — For restaurant location maps and routing
- **Firebase** — For push notifications and crash reporting
- **Stripe / Razorpay** — For payment processing
- **Twilio** — For SMS delivery notifications

For details on third-party SDKs, see `docs/legal/privacy/third-party-sdk-disclosure.md`.

## 6. Managing Your Cookie Preferences

You can manage your cookie preferences at any time through:

1. **Cookie Consent Banner** — Appears on your first visit to the platform (for EU and Indian users)
2. **Consent Dashboard** — Available at `apps/customer-web/src/pages/cookie-preferences.tsx`
3. **Privacy Dashboard** — Available at `apps/customer-web/src/pages/privacy-dashboard.tsx`

**Frontend references:**
- Consent banner component: `apps/customer-web/src/components/CookieConsentBanner.tsx:19-24`
- Consent hook: `apps/customer-web/src/hooks/useCookieConsent.ts:45-108`
- Consent storage key: `apps/customer-web/src/hooks/useCookieConsent.ts:4` (`sg_cookie_consent`)
- Consent persistence: `apps/customer-web/src/hooks/useCookieConsent.ts:61-64` — saves to localStorage
- Consent API (backend): `apps/backend/src/legal/consent.service.ts:15-80` — `recordConsent()` endpoint

## 7. Withdrawing Consent

You may withdraw your consent for non-essential cookies at any time through the Consent Dashboard or Cookie Preferences page. Withdrawing consent will not affect the lawfulness of processing based on consent before withdrawal.

**Backend reference:** `apps/backend/src/legal/consent.service.ts:82-110` — `withdrawConsent()` method.

## 8. Analytics and Performance Gating

Analytics events are only sent after `analytics` or `performance` consent is granted. The platform checks the `sg_cookie_consent` localStorage key before sending any tracking events.

**Code reference:** `packages/ui/analytics.ts:14-23` — `sendAnalyticsEvent()` checks `hasAnalyticsConsent()` before sending via `navigator.sendBeacon`. Same pattern in `apps/customer-web/src/analytics.ts:4-12`.

## 9. Do Not Track

The platform does not currently respond to Do Not Track (DNT) browser signals. Please use the Consent Dashboard to manage your preferences.

## 10. Updates to This Policy

We may update this Cookie Policy. When we do, we will revise the "Effective Date" at the top. Material changes will be communicated through the platform.

## 11. Contact

For questions about this Cookie Policy, contact: cookie@spicegarden.com

---

*This document is a DRAFT. For questions about cookies, contact cookie@spicegarden.com.*
