# Children's Privacy Policy

**Draft status:** FIRST DRAFT for human/legal review. Grounded in actual codebase behavior. Must be reviewed by a qualified lawyer before publication.

**Effective date:** [PLACEHOLDER — to be set by business owner]

---

## 1. Age Requirement

SpiceGarden is **not directed to children under 18**. By using the platform, you represent and warrant that you are at least 18 years old.

---

## 2. Current Implementation

### Registration
- Registration API: `POST /auth/register` (`auth.controller.ts:63`, `authApi.register` in `packages/shared/api.ts:104-108`).
- The `UserEntity` (`user.entity.ts:9-51`) has fields for `fullName`, `email`, `phone`, `passwordHash` but **no `dateOfBirth` field** and **no age-gate verification** in the signup flow.
- Age eligibility is declared in the Terms of Service: "You must be at least 18 years old and provide accurate information" (`legal-seed.service.ts:104`).

### Mobile App Permissions
- `customer-mobile/app.config.js:35` requests camera access (`NSCameraUsageDescription`)
- `customer-mobile/app.config.js:36` requests photo library access (`NSPhotoLibraryUsageDescription`)
- These permissions are for QR code payment scanning and receipt upload — not specifically age-gated

### What We Do NOT Collect From Children
- We do not knowingly collect personal data from children under 18.
- If we discover we have collected such data, we will delete it within a reasonable time.

---

## 3. COPPA (US) and DPDP (India)

- **COPPA (US):** The platform is designed for users 18+. We do not knowingly collect personal information from children under 13.
- **DPDP Act (India):** Section 11 requires verifiable parental consent for children (defined as under 18) for any data processing. If the platform serves Indian users, a parental consent mechanism must be implemented before launch.

---

## 4. Identified Gap

**Gap:** There is currently no age-gate in the registration flow. The `UserEntity` does not store date of birth, and the auth controller does not validate age. This must be addressed before serving markets with strict age-verification requirements (EU, California, India).

**Recommendation:** Add a `dateOfBirth` field to `UserEntity` and implement age validation in `auth.controller.ts` before account creation.

---

## 5. Parental Contact

If you believe we have collected personal information from a child under 18:
- Email: privacy@spicegarden.com
- Phone: [PLACEHOLDER — support phone number]

We will investigate and delete the information within 30 days.

---

## Code Evidence

- `user.entity.ts:9-51` — UserEntity has no dateOfBirth field
- `auth.controller.ts:63-79` — No age verification in login/register flow
- `legal-seed.service.ts:104` — Age requirement stated in Terms of Service
- `customer-mobile/app.config.js:35-36` — Camera/photo permissions requested
- `otp.entity.ts` — OTP types include email/phone verification (not age-gated)
