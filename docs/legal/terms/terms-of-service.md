# Terms of Service

**Effective Date:** 2026-06-10  
**Last Updated:** 2026-06-10  
**Status:** DRAFT — First draft, not yet reviewed by legal counsel. See `apps/backend/src/legal/entities/legal.enums.ts:3` for the backend document type enum.

---

## 1. Agreement

These Terms of Service ("Terms") constitute a legally binding agreement between you ("you", "your", "user") and **SpiceGarden Technologies Pvt. Ltd.** ("SpiceGarden", "we", "us", "our") governing your access to and use of the SpiceGarden platform, including the website (`customer-web`), mobile applications (`customer-mobile`, `delivery-partner`), merchant dashboard (`restaurant-dashboard`), and super-admin portal (`super-admin`).

By accessing or using the SpiceGarden platform, you agree to be bound by these Terms, our Privacy Policy, and all applicable policies referenced herein.

**Backend reference:** `apps/backend/src/legal/legal-seed.service.ts:97-111` (seeded document definition), `apps/backend/src/legal/entities/legal.enums.ts:3` (`LegalDocumentType.TERMS_OF_SERVICE`).

## 2. Eligibility

You must be at least 18 years old to use the SpiceGarden platform. The platform is not directed to individuals under 18. If you are under 18, you may not create an account or use any portion of the service.

By using the platform, you represent and warrant that you are of legal age in your jurisdiction and have the right, capacity, and authority to enter into these Terms.

**Backend reference:** `apps/backend/src/db/entities/user.entity.ts` — no `dateOfBirth` field exists in the user entity, confirming no age-gate is currently implemented in the backend.

## 3. Account Registration and Security

To use most features of the platform, you must register for an account. You agree to:

- Provide accurate, current, and complete information during registration and at all times.
- Maintain the confidentiality of your account credentials, including your password and any authentication tokens.
- Immediately notify us of any unauthorized use of your account or any other breach of security.

We are not liable for any loss or damage arising from your failure to maintain the security of your account.

**Backend references:**
- Password hashing: `apps/backend/src/services/auth/auth.service.ts` — uses bcrypt hashing.
- Session/JWT tokens: `apps/backend/src/services/auth/auth.controller.ts:29-43` — issues `access_token` (1h) and `refresh_token` (30d) as HttpOnly, SameSite=Lax cookies.
- Session entity: `apps/backend/src/db/entities/session.entity.ts:5-38` — stores refresh tokens, IP addresses, and device identifiers.

## 4. Orders and Payments

### 4.1 Order Placement
When you place an order through the platform, you authorize us to charge your selected payment method. All prices, fees, and taxes displayed at checkout are final.

### 4.2 Payment Processing
Payments are processed by third-party payment gateways (Stripe, Razorpay, PhonePay, Paytm). We do not store full card numbers on our servers. Payment tokens are stored per gateway specifications.

**Backend references:**
- Payment gateway configuration: `apps/backend/src/services/payments/gateway/` — gateway classes for Stripe (`stripe-payment.gateway.ts`), Razorpay (`razorpay.gateway.ts`), PhonePe (`phonepe.gateway.ts`), Paytm (`paytm.gateway.ts`).
- Webhook handling: `apps/backend/src/services/payments/webhook/webhook.controller.ts:7-38` — receives and validates payment confirmations via HMAC signatures.

### 4.3 Order Acceptance
Orders are subject to acceptance by the restaurant. We reserve the right to refuse or cancel any order at our sole discretion, including but not limited to suspected fraud, incorrect pricing, or unavailability of items.

**Backend reference:** `apps/backend/src/services/order/order.service.ts:16-93` — `placeOrder()` validates order feasibility before submission.

## 5. Refunds and Cancellations

Refunds and cancellations are governed by our Refund Policy and Cancellation Policy, available at `docs/legal/terms/refund-policy.md` and `docs/legal/terms/cancellation-policy.md` respectively. These policies are incorporated into these Terms by reference.

**Backend references:**
- Refund processing: `apps/backend/src/services/refund/refund.service.ts:46-107` — `createRefundRequest()` with eligibility checks.
- Refund approval workflow: `apps/backend/src/services/refund/refund.service.ts:112-195` — `approveRefundRequest()` and `rejectRefundRequest()` require approver authentication.
- Manager approval threshold: `apps/backend/src/services/refund/refund.service.ts:84` — `REFUND_MANAGER_APPROVAL_THRESHOLD` config (default: ₹1000).

## 6. Delivery

Delivery services are governed by our Delivery Policy, available at `docs/legal/terms/delivery-policy.md`. Delivery times are estimates only and are not guaranteed. Delays due to weather, traffic, or other circumstances beyond our control are not eligible for refunds.

**Backend reference:** `apps/backend/src/services/delivery/delivery-pricing.controller.ts:12-43` — delivery fee calculation API.

## 7. Restaurant and Partner Agreements

Restaurants and delivery partners are subject to separate agreements — the Merchant Agreement and Driver Agreement — which are incorporated into these Terms by reference. These agreements govern the relationship between SpiceGarden and business users of the platform.

**Backend references:**
- Merchant agreement entity: `apps/backend/src/legal/entities/agreement.entity.ts:9` — `AgreementParty.MERCHANT`.
- Driver agreement entity: same file — `AgreementParty.DRIVER`.
- Agreement service: `apps/backend/src/legal/agreement.service.ts:1-240` — manages agreement lifecycle (create, accept, withdraw).

## 8. Acceptable Conduct

You agree not to:

- Misuse the platform (e.g., interfere with its security or functionality).
- Engage in fraudulent, abusive, or harmful activities.
- Scrape, harvest, or collect user data without permission.
- Reverse engineer, decompile, or disassemble the platform.
- Impersonate any person or entity.

Violations may result in immediate suspension or termination of your account.

**Backend reference:** `apps/backend/src/security/rate-limiter.middleware.ts:1-45` — rate limiting for abuse prevention.

## 9. Intellectual Property

All content, trademarks, logos, and intellectual property on the SpiceGarden platform are owned by us or our licensors. You may not use, reproduce, or distribute our IP without prior written permission.

You retain ownership of content you submit, but you grant us a non-exclusive, worldwide, royalty-free license to use, modify, and display that content in connection with the platform.

**Backend reference:** `apps/backend/src/legal/legal-seed.service.ts:305-313` — Copyright Policy seed definition.

## 10. Third-Party Services and Links

The platform may contain links to third-party websites or services. We are not responsible for the content, privacy policies, or practices of third parties, including our payment processors, analytics providers (Google Maps, Firebase), SMS providers (Twilio), and email providers.

You acknowledge that we are not responsible or liable for any damage or loss caused by third-party services.

**Backend reference:** `apps/backend/src/services/payments/webhook/webhook.controller.ts:10-38` — third-party webhook validation.

## 11. Disclaimer

THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT.

WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE, OR THAT DEFECTS WILL BE CORRECTED.

## 12. Limitation of Liability

TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL SPICEGARDEN, ITS AFFILIATES, OR THEIR RESPECTIVE DIRECTORS, OFFICERS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF DATA, PROFITS, REVENUE, OR BUSINESS INTERRUPTION, WHETHER BASED ON CONTRACT, TORT (INCLUDING NEGLIGENCE), OR OTHERWISE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATED TO THESE TERMS OR YOUR USE OF THE PLATFORM SHALL NOT EXCEED THE AMOUNT YOU PAID TO US FOR THE RELEVANT ORDER.

**Backend reference:** `apps/backend/src/compliance/compliance.controller.ts:30-60` — compliance and liability-related endpoints.

## 13. Indemnification

You agree to indemnify, defend, and hold harmless SpiceGarden and its affiliates from and against any claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or in any way connected with your access to or use of the platform, your violation of these Terms, or your violation of any third-party right.

## 14. Governing Law and Dispute Resolution

These Terms shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles.

Any disputes arising under or in connection with these Terms shall be resolved through the following:

1. **Negotiation:** The parties shall attempt to resolve the dispute through good-faith negotiation for 30 days.
2. **Mediation:** If negotiation fails, the dispute shall be submitted to mediation administered by a mutually agreed mediator in Bengaluru, Karnataka.
3. **Arbitration:** If mediation fails, the dispute shall be finally settled by arbitration under the Arbitration and Conciliation Act, 1996. The arbitration shall be conducted by a single arbitrator in Bengaluru, and the seat of arbitration shall be Bengaluru, Karnataka, India. The arbitration shall be conducted in English.

**Backend reference:** `apps/backend/src/legal/legal-seed.service.ts:97-111` (Terms seed).

## 15. Changes to These Terms

We may update these Terms from time to time. Material changes will be communicated to you via the platform, email, or push notification. Your continued use of the platform after changes take effect constitutes your acceptance of the revised Terms.

Where required by law (e.g., GDPR for EU users), we will obtain your consent for material changes that expand the scope of data processing.

## 16. Termination

We may suspend or terminate your account, or restrict your access to the platform, at any time for any reason, with or without cause, with or without notice. We will not be liable to you or any third party for any termination of your account.

Sections 9 (Intellectual Property), 11 (Disclaimer), 12 (Limitation of Liability), 13 (Indemnification), and 14 (Governing Law) shall survive termination.

## 17. Contact Information

For questions about these Terms, please contact us at:

- **Email:** legal@spicegarden.com
- **Postal:** SpiceGarden Legal Department, [Registered Office Address], Bengaluru, Karnataka, India

## 18. Open Source Licenses

The platform incorporates open-source software components licensed under various licenses. See `docs/legal/terms/open-source-licenses.md` for the complete list and license texts.

---

*This document is a DRAFT. For questions about these Terms, contact legal@spicegarden.com.*
