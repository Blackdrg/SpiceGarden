# California Consumer Privacy Act (CCPA) Notice

**Draft status:** FIRST DRAFT for human/legal review. Grounded in actual codebase behavior. Must be reviewed by a qualified lawyer before publication.

**Effective date:** [PLACEHOLDER — to be set by business owner]

---

## 1. Applicability

This notice applies to California residents under the **California Consumer Privacy Act (CCPA)** and **California Privacy Rights Act (CPRA)**.

**Whether we are subject to CCPA (>$25M revenue, >50k users, or >50% sale of personal info) is a business determination.** The technical rights infrastructure exists in code to support CCPA compliance if triggered.

---

## 2. Categories of Personal Information Collected

Per Cal. Civ. Code § 1798.100(d), we collect the following categories (matching OAG categories):

| CCPA Category | Examples | Code Reference |
|---|---|---|
| A. Identifiers | Name, alias, email, phone, IP address, unique device ID | `user.entity.ts:14,17,20`; `session.entity.ts:23`; `user-device.entity.ts:29` |
| B. Personal info (cal. emp. records) | Name, phone, address, payment info | `address.entity.ts`; `payment-method.entity.ts:16-35`; `bank-account.entity.ts` |
| C. Protected classification | None collected | (Not found in codebase) |
| D. Commercial / purchase history | Order history, cart, search history | `order.entity.ts`; `order-item.entity.ts`; `storage.keys.ts:11` (RECENT_SEARCHES) |
| E. Biometric / internet activity | Analytics events, browsing history, search history | `analytics-event.entity.ts` |
| F. Geolocation data | Precise location (address `location`, driver GPS) | `address.entity.ts:30-34`; `driver.entity.ts:41-45` |
| G. Sensory data | None collected beyond crash logs | (Crash logs are under "Professional / Employment" data) |
| H. Professional / employment data | None | (Not collected) |
| I. Non-precious personal info | Preferences, marketing data | `cookie-consent.entity.ts`; `notification-preference.entity.ts` |
| J. Inferences | None | (No profiling yielding inferences) |

---

## 3. Sources of Personal Information

- Directly from you (registration, orders, support tickets, profile updates)
- Automatically via cookies and tracking technologies
- From third parties (payment providers, Google Maps for geocoding)

---

## 4. Business / Commercial Purposes

- Providing the platform (orders, payments, delivery)
- Authentication and account management
- Fraud prevention and security
- Analytics and product improvement
- Marketing communications (with opt-in)
- Tax and regulatory compliance

---

## 5. Categories of Third Parties With Whom We Share

- **Payment processors** (Stripe, Razorpay, PhonePe, Paytm) — payment processing
- **Communications** (Twilio for SMS, SendGrid/email provider for email, Firebase for push)
- **Mapping** (Google Maps) — geocoding, routing, live tracking
- **Error monitoring** (Sentry) — crash reporting
- **AI services** (OpenAI) — chatbot and embeddings (when enabled)

We do **not sell** personal information as defined under the CCPA.

---

## 6. Your CCPA Rights

| Right | How to Exercise | Code Reference |
|---|---|---|
| Right to know (personal info collected) | `GET /privacy/dashboard/:userId` — `privacy.controller.ts:139-157` | Dashboard shows consent, active requests, exports |
| Right to know (specific pieces) | `GET /privacy/exports/:userId` → download | `data-subject-request.service.ts:443-524` |
| Right to delete | `POST /privacy/requests` with `type: "delete"` | `data-subject-request.service.ts:204-282` |
| Right to correct | `POST /privacy/requests` with `type: "correct"` | `data-subject-request.service.ts:55` |
| Right to opt-out of sale/sharing | N/A — we do not sell personal info | — |
| Right to non-discrimination | We will not discriminate for exercising rights | Policy commitment |

---

## 7. Do Not Sell or Share My Info

We do **not sell** your personal information. If we begin selling data in the future, we will provide a "Do Not Sell My Info" link.

---

## 8. Contact

- privacy@spicegarden.com
- [PLACEHOLDER — postal address]
