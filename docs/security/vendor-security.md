# Vendor & Third-Party Security Policy

**Version:** 1.0.0
**Owner:** Security Engineering / Procurement

## 1. In-Scope Vendors
| Vendor | Purpose | Data Shared | DPA |
|--------|---------|-------------|-----|
| Stripe | Card payments | Tokenized card, amount | Yes (PCI-DSS) |
| Razorpay | UPI/Card (IN) | Tokenized card, amount | Yes |
| Google Maps | Geocoding/routing | Coordinates | Yes |
| Firebase | Messaging/analytics | Device tokens | Yes |
| Twilio | SMS OTP | Phone | Yes |
| Cloud storage | Artifacts/media | Order media | Yes |
| SMTP provider | Transactional email | Email | Yes |

(See Privacy Policy §Third-Party Service Providers.)

## 2. Assessment
- Vendor must provide SOC 2 / ISO 27001 or equivalent before production onboarding.
- Annual re-assessment; critical vendors quarterly.
- Pen-test summary or bug-bounty presence reviewed.

## 3. Contractual Controls
- Data Processing Agreements (DPAs) required for any vendor processing personal data (GDPR Art. 28 / DPDP).
- Sub-processor list maintained and disclosed.

## 4. Monitoring
- Vendor outage tracked via status pages; reflected in dependency diagram (`docs/architecture/`).
- Incident at vendor triggers our Incident Response Policy.
