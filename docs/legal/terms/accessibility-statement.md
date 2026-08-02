# Accessibility Statement

**Effective Date:** 2026-06-10  
**Status:** DRAFT — First draft, not yet reviewed by legal counsel.  
**Backend reference:** `apps/backend/src/legal/entities/legal.enums.ts:16` (`LegalDocumentType.ACCESSIBILITY_STATEMENT`), `apps/backend/src/legal/legal-seed.service.ts:272-280`.

---

## 1. Commitment

SpiceGarden is committed to ensuring digital accessibility for all users, including people with disabilities. We aim to meet Web Content Accessibility Guidelines (WCAG) 2.1 AA standards across our web and mobile applications.

## 2. Measures

We implement the following accessibility measures:
- Semantic HTML markup in web applications
- Keyboard navigation support
- ARIA labels for screen readers
- Adequate color contrast (minimum 4.5:1 for normal text)
- Resizable text up to 200% without loss of functionality
- Alt text for all images and icons
- Captions and transcripts for multimedia content
- Screen reader testing

**Backend reference:** `apps/backend/src/legal/legal-seed.service.ts:277` — "Semantic markup, keyboard navigation, contrast, and screen-reader testing."

## 3. Platforms

Accessibility is monitored across:
- **customer-web** — Next.js web application
- **customer-mobile** — React Native (iOS and Android)
- **restaurant-dashboard** — Next.js admin dashboard
- **super-admin** — Next.js admin portal
- **delivery-partner** — React Native (Android)

## 4. Feedback

We welcome feedback on the accessibility of the SpiceGarden platform. If you encounter accessibility barriers, please contact us:

**Email:** accessibility@spicegarden.com  
**Phone:** +91-0000000000  
**Response time:** Within 2 business days

**Backend reference:** `apps/backend/src/legal/legal-seed.service.ts:279` — accessibility@spicegarden.com

## 6. Testing and Evaluation

We conduct periodic accessibility evaluations including:
- Automated testing with axe-core and Lighthouse
- Manual testing with screen readers (NVDA, VoiceOver)
- Keyboard-only navigation testing
- Color contrast analysis

## 7. Limitations

While we strive for WCAG 2.1 AA compliance, there may be some limitations:
- Third-party embedded content (Google Maps, videos) — accessibility depends on the third-party provider
- Legacy components — may not fully meet current standards
- Mobile app features — native platform accessibility features are relied upon

We are actively working to address these limitations.

## 8. Contact

Accessibility inquiries: accessibility@spicegarden.com

**Backend reference:** `apps/backend/src/legal/legal-seed.service.ts:272-280` — Accessibility Statement seed definition.

---

*This document is a DRAFT. For accessibility inquiries, contact accessibility@spicegarden.com.*
