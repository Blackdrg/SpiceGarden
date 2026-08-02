# Phase 7 — Out-of-Repo-Scope Items

These items require external parties, credentials, legal entities, or accounts that do not exist inside the repository. Engineering preparation is provided; the remaining actions require a human with the right credentials/authority.

## PCI DSS Certification
- **Status:** OUT OF REPO SCOPE
- **What's prepared:** Payment gateway integrations (PhonePe, Paytm, BHIM UPI, Google Pay, Razorpay) are configured with real sandbox/production API endpoints. The backend uses TLS, encrypted secret storage, and PCI-compliant payment processors (Razorpay is PCI DSS Level 1 certified).
- **What's needed:** Formal PCI DSS certification requires a QSA (Qualified Security Assessor) audit, network segmentation validation, and annual attestation. The business team must engage a PCI QSA and complete the ROC (Report on Compliance).
- **Next action:** Business team to engage PCI QSA and schedule audit.

## SOC 2 Audit
- **Status:** OUT OF REPO SCOPE
- **What's prepared:** Security controls are implemented (rate limiting, CSRF, CORS, Helmet, HPP, input sanitization, audit logging, encrypted secrets). The `ComplianceAuditService` provides immutable audit trails.
- **What's needed:** SOC 2 Type II audit requires an independent auditor to evaluate controls over a 6-12 month period. The organization must engage a CPA firm with SOC 2 expertise.
- **Next action:** Business team to engage SOC 2 audit firm and provide access to systems.

## ISO 27001 Certification
- **Status:** OUT OF REPO SCOPE
- **What's prepared:** Information security controls are implemented (encryption at rest, TLS in transit, access control, audit logging).
- **What's needed:** ISO 27001 certification requires a formal ISMS (Information Security Management System), risk assessment, and certification audit by an accredited body.
- **Next action:** Business team to engage ISO 27001 certification body.

## Independent Penetration Test
- **Status:** OUT OF REPO SCOPE
- **What's prepared:** Internal penetration tests are implemented (`infra/scripts/penetration-tests.js`). Security tests pass (0 vulnerabilities).
- **What's needed:** An independent third-party pen test by a CREST-certified or OSCP-certified firm is required for certification.
- **Next action:** Business team to engage independent pen test firm.

## DNS/Domain Ownership
- **Status:** OUT OF REPO SCOPE
- **What's prepared:** DNS configuration documented in `infra/k8s/dns-waf-ddos.md`. CDN/Ingress configured with TLS via cert-manager.
- **What's needed:** Domain registration (spicegarden.com) and DNS management must be set up by the business/IT team. SSL certificates require domain ownership verification.
- **Next action:** IT team to register domain and configure DNS.

## App Store / Play Store Submission Accounts
- **Status:** OUT OF REPO SCOPE
- **What's prepared:** Mobile app build configuration is complete (`apps/customer-mobile/eas.json`, `apps/customer-mobile/android/`, `apps/customer-mobile/ios/`). Store assets and metadata template created.
- **What's needed:** Apple Developer Program membership ($99/year) and Google Play Console developer account ($25 one-time). These require business entity verification.
- **Next action:** Business team to enroll in Apple Developer Program and Google Play Console.

## Production Payment Gateway Merchant Activation
- **Status:** OUT OF REPO SCOPE
- **What's prepared:** All payment gateway integrations are implemented with real API endpoints (PhonePe, Paytm, Razorpay). Sandbox credentials are documented in `.env.example`.
- **What's needed:** Production merchant accounts must be activated with each payment provider. This requires business registration, GST registration, bank account verification, and provider onboarding.
- **Next action:** Business team to activate merchant accounts with PhonePe, Paytm, and Razorpay.

## SSL/TLS Certificate Issuance
- **Status:** OUT OF REPO SCOPE
- **What's prepared:** cert-manager is configured in K8s manifests (`cdn-ingress.yaml`). Let's Encrypt staging issuer configured for staging, production issuer for production.
- **What's needed:** Domain ownership must be verified before certificates can be issued. Production certificates require the domain to be publicly resolvable.
- **Next action:** IT team to verify domain ownership and configure DNS for production.

## Cloud Infrastructure Provisioning
- **Status:** OUT OF REPO SCOPE
- **What's prepared:** All K8s manifests are ready for deployment (`kubectl apply -f infra/k8s/`). Terraform/Helm charts can be generated from the existing manifests.
- **What's needed:** Cloud provider account (AWS/GCP/Azure) with appropriate IAM permissions, VPC setup, and cluster provisioning.
- **Next action:** DevOps team to provision cloud infrastructure and deploy K8s cluster.

## Legal Entity / Banking / GST Setup
- **Status:** OUT OF REPO SCOPE
- **What's prepared:** GST compliance code is implemented in the backend (`apps/backend/src/modules/`). Tax calculation and invoicing are functional.
- **What's needed:** Business registration, GST registration, bank account setup, and tax authority registration are all external legal/financial processes.
- **Next action:** Business/legal team to complete entity registration and GST enrollment.

## Summary of External Dependencies

| Item | Required By | Blocking |
|------|------------|----------|
| PCI DSS certification | Business team + QSA | Yes — cannot process payments in production |
| SOC 2 audit | Business team + CPA firm | No — can operate without, but required for enterprise sales |
| ISO 27001 certification | Business team + certification body | No — can operate without, but required for enterprise sales |
| Independent pen test | Business team + pen test firm | No — can operate without, but recommended |
| DNS/domain ownership | IT team | Yes — required for production deployment |
| App Store/Play Store accounts | Business team | Yes — required for mobile app distribution |
| Payment gateway merchant accounts | Business team | Yes — required for payment processing |
| SSL/TLS certificates | IT team | Yes — required for HTTPS in production |
| Cloud infrastructure | DevOps team | Yes — required for production deployment |
| Legal entity / banking / GST | Business/legal team | Yes — required for legal operation |