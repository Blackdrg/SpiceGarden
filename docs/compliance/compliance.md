# Compliance Controls Mapping

## GDPR (EU 2016/679)

| Requirement | Implementation | Evidence |
|-------------|----------------|-----------|
| Art. 12–14 Transparency | Versioned privacy policy, legal center | `LegalDocumentService`, seeded `privacy_policy` |
| Art. 15 Right of access | Export preview + JSON/CSV/PDF export | `DataSubjectRequestService.buildExportPayload`, `/privacy/export-preview` |
| Art. 16 Rectification | Correct request type | `DataRequestType.CORRECT` |
| Art. 17 Erasure | Delete request + retention cascade | `DataRequestType.DELETE`, deletion queue |
| Art. 18 Restriction | Restrict request | `DataRequestType.RESTRICT` |
| Art. 21 Objection | Object request | `DataRequestType.OBJECT` |
| Art. 20 Portability | Machine-readable export | `ExportFormat.JSON/CSV` |
| Art. 7(3) Withdraw consent | Consent withdrawal + withdraw-all | `ConsentService.withdrawConsent` |
| Art. 9 Special categories | Location/device collected only with consent | consent categories |
| Art. 32 Security | Encryption at rest, signed audit, RBAC | `EncryptionService`, `LegalIntegrityService` |
| Art. 33–34 Breach | Incident registry + notification | `SecurityCenterService`, Part 15 |
| Art. 5(2) Accountability | Immutable signed audit trail | `ComplianceAuditService` |

SLA: 30 days for access/delete/correct; 15 days for consent withdrawal.

## CCPA / CPRA (California)

| Requirement | Implementation |
|-------------|----------------|
| Right to know | Export + policy disclosure |
| Right to delete | `DataRequestType.DELETE` |
| Right to opt-out of sale | Marketing consent category, withdraw-all |
| Non-discrimination | Consent is never required for core service |

## Indian DPDP Act, 2023

| Requirement | Implementation |
|-------------|----------------|
| S. 6 Notice / consent | `CookieConsent` + consent ledger; purpose-bound |
| S. 7 Consent manager | `GrievanceService.getConsentManager()` |
| S. 8 Withdraw consent | `/privacy/consent/withdraw-all`, `ConsentService.withdrawConsent` |
| S. 9 Grievance officer | `GrievanceService.getOfficer()` |
| S. 8(5) Erase data | Delete request |
| S. 11 Transfer | International transfer disclosure in privacy policy |
| Children (S. 9) | Age-gated collection; no targeted profiling |

## PCI DSS (v4.0)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| No PAN storage | Card data tokenized by Stripe/Razorpay; backend stores only tokens/last4 | `payments` module; no card fields in entities |
| Hosted checkout | Stripe/Razorpay hosted fields | payment gateways |
| Webhook verification | Signature verification on inbound webhooks | `webhook` module |
| Secrets rotation | Automated key rotation | `SecretsRotationService` |
| Key management | Vault-backed; KMS envelope | `EncryptionService` |
| Audit logging | Signed compliance audit | `ComplianceAuditService` |
| Tokenization | Gateway tokens referenced only | order/payment entities |
| Admin permissions | RBAC on all compliance/admin routes | `PermissionGuard` |
| Report | `PCI Compliance Report` generated via compliance module | `compliance` module |

## Retention Schedule (configurable)

Orders 10y · Invoices 10y · Audit Logs 3y · Sessions 90d · OTP 24h · Driver GPS 30d ·
Chats 24m · Notifications 18m · Analytics 18m · Deleted Accounts 7y · Marketing 24m ·
Emails 36m · Payments/Refunds/Wallet/Loyalty per policy. Each category supports
archive / anonymize / delete / legal-hold and an automatic scheduler hook
(`RetentionService.runPolicy`).
