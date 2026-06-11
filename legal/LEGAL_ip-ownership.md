# Intellectual Property Ownership Document

**Company:** SpiceGarden Technologies Private Limited  
**Date:** June 10, 2026  
**Version:** 1.0

## 1. Ownership Statement

**SpiceGarden** is the sole owner of all intellectual property created for the SpiceGarden food delivery platform.

## 2. Owned Assets

### 2.1 Source Code
- All backend services (61 service.ts files, 28 controller.ts files, 44 module.ts files)
- Frontend applications (customer-web, super-admin, restaurant-dashboard, delivery-partner, customer-mobile)
- Shared packages (@spicegarden/shared, @spicegarden/ui)
- All located in `apps/` and `packages/` directories

### 2.2 Brand Assets
- SpiceGarden trademark (pending registration)
- Logo design (leaf + fire icon)
- Color palette (#FF5A1F primary orange)
- UI design system and components

### 2.3 Documentation
- All technical documentation
- Business requirements and specifications
- API documentation

## 3. Third-Party Licenses

### MIT License Dependencies
All project dependencies use permissive licenses compatible with commercial use:

| Package | License | Usage |
|---------|---------|-------|
| React | MIT | Frontend framework |
| NestJS | MIT | Backend framework |
| Next.js | MIT | Frontend framework |
| Express | MIT | HTTP server |
| TypeORM | MIT | Database ORM |
| Mongoose | MIT | MongoDB ODM |
| Jest | MIT | Testing framework |
| Socket.IO | MIT | Real-time communication |

### Commercial Dependencies
| Service | License | Notes |
|---------|---------|-------|
| Stripe | Commercial | Payment processing (SAQ-A compliant) |
| Razorpay | Commercial | Payment processing |
| Twilio | Commercial | SMS notifications |
| SendGrid | Commercial | Email delivery |

### Attribution
No attribution required beyond standard LICENSE file inclusion for MIT-licensed packages.

## 4. Employee/Contributor Agreements

All contributors have signed agreements granting SpiceGarden perpetual rights to contributed code. See `LEGAL_contractor-agreements.md` for details.

## 5. Open Source Compliance

### Policy
- All dependencies verified for license compatibility
- No GPL/LGPL viral licenses included
- All third-party code properly attributed
- No code copied from stackoverflow or other sources without attribution

### Audit Trail
- `package-lock.json` serves as dependency audit trail
- `infra/scripts/security-automation.js` includes license checking
- Annual license audit recommended

## 6. Copyright Registration

| Asset | Registration Status | Registration Number |
|-------|---------------------|---------------------|
| Source Code | Not registered (copyright automatic) | - |
| Logo | Ready for filing | Pending |
| Documentation | Not registered | - |

## 7. Contact

For IP inquiries: legal@spicegarden.com