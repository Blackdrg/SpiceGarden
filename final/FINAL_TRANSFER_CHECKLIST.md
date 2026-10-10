# SpiceGarden v1.0.0-rc1 — Final Commercial Software Transfer Checklist

**Release**: `v1.0.0-rc1`  
**Git Baseline Commit**: `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
**Transfer Classification**: **`TRANSFER READY`**  

---

## 1. PRE-CLOSING (Technical & Legal Diligence)

- [ ] **Buyer NDA / Diligence Access**: Mutual Non-Disclosure Agreement executed; virtual data room access granted.
- [ ] **IP Documents Reviewed**: Contributor matrix, assignment agreements, and chain of title verified.
- [ ] **SBOM Reviewed**: SPDX 2.3 JSON and CycloneDX 1.5 XML software bills of materials audited.
- [ ] **License Audit Reviewed**: Permissive open-source license breakdown confirmed (zero copyleft/GPL).
- [ ] **Source Repository Verified**: Monorepo build (12 workspaces), linting, and 69 backend test suites (1,122 tests) verified.
- [ ] **Architecture & Performance Reviewed**: 20k VU qualification report, Chromium frontend results (44 routes, 148 tests), and DR drill report (RTO 9m30s, RPO 12m) approved.

---

## 2. CLOSING (Asset & Infrastructure Transfer)

- [ ] **Repository Transfer**: GitHub / GitLab repository ownership transferred to Buyer organization.
- [ ] **Domain Transfer**: Domain registrar auth/EPP transfer codes released for `spicegarden.app`, `spicegarden.io`, and `spicegarden.dev`.
- [ ] **Cloud Tenant Transfer**: Target cloud infrastructure (AWS/GCP/Azure) and Kubernetes cluster access provisioned.
- [ ] **Container Registry Transfer**: Docker images tagged (`v1.0.0-rc1`) and pushed to Buyer private container registry.
- [ ] **DNS Transfer**: Nameserver records updated to point to Buyer authoritative DNS zone.
- [ ] **Merchant Accounts**: Buyer Stripe and Razorpay accounts provisioned and webhook endpoints bound.
- [ ] **Monitoring & Observability**: Prometheus Alertmanager routing configured for Buyer PagerDuty/Slack.
- [ ] **Backups**: Buyer object storage bucket configured for automated database backup snapshots.
- [ ] **Mobile Signing Handover**: App Store and Google Play package ownership and developer accounts assigned.
- [ ] **Secret Rotation Protocol**: Eight-Step Secret Rotation procedure initiated.

---

## 3. POST-CLOSING (Operational Validation & Sign-Off)

- [ ] **New Secrets Active**: Fresh passwords, JWT secret, encryption keys, and third-party API keys deployed via Kubernetes Secrets.
- [ ] **Old Secrets Revoked**: Legacy API keys revoked in Seller vendor portals.
- [ ] **DNS Confirmed**: Global DNS propagation verified; TLS certificates issued via `cert-manager`.
- [ ] **Payment Confirmed**: Live micro-transactions ($1.00 / ₹10.00) successfully captured and settled in Buyer merchant account.
- [ ] **Mobile Binaries Signed**: Customer Mobile and Delivery Partner AAB/IPA release bundles signed with Buyer keystore.
- [ ] **Monitoring Active**: Telemetry metrics, structured logs, and alert triggers verified active.
- [ ] **Backup Verified**: Fresh database snapshot successfully captured and test-restored to verify disaster recovery readiness.
- [ ] **Recipient Deployment Verified**: Final production cluster health checks pass with 100% service availability.
- [ ] **Commercial Handover Acceptance Certificate**: Fully executed by authorized representatives of Buyer and Seller.
