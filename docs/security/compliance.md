# Security Compliance Documentation

This document outlines the security compliance measures implemented in SpiceGarden.

## Implemented Security Features ✓

### Fraud Scoring
- **Location**: `apps/backend/src/services/payments/fraud-hardening.service.ts`
- **Features**:
  - Velocity-based fraud detection (hourly/daily transaction limits)
  - Suspicious pattern detection (prepaid cards, card testing)
  - IP reputation checks
  - Risk scoring with configurable thresholds
  - Automatic fraud flagging and blocking

### Device Fingerprinting
- **Location**: `apps/backend/src/db/entities/device-fingerprint.entity.ts`
- **Features**:
  - Device fingerprint storage with uniqueness constraints
  - Device type and name tracking
  - IP address association
  - Trusted device management

### Rate Limiting
- **Location**: `apps/backend/src/security/security.module.ts`, `apps/backend/src/main.ts`
- **Features**:
  - ThrottlerModule (10 requests per 60s)
  - express-rate-limit for API endpoints (100 req/15min)
  - Stricter auth endpoint limiting (10 req/15min)
  - Request size limits (10kb) to prevent DoS

### Audit Logs
- **Location**: `apps/backend/src/audit/audit.service.ts`
- **Features**:
  - Payment event logging
  - User action auditing
  - Structured JSON logging
  - 3-year retention policy

### Sanitization
- **Location**: `apps/backend/src/main.ts`
- **Features**:
  - express-mongo-sanitize for NoSQL injection prevention
  - hpp (HTTP parameter pollution) protection
  - Helmet for security headers
  - Body size limiting

### Encryption
- **Location**: `apps/backend/src/security/encryption.service.ts`
- **Features**:
  - AES encryption for PII fields
  - Configurable encryption secret
  - Field-level encryption/decryption helpers

### Idempotency
- **Location**: `apps/backend/src/services/payments/idempotency.service.ts`, `apps/backend/src/services/payments/idempotency.entity.ts`
- **Features**:
  - Idempotency key validation
  - Duplicate request detection
  - Automatic cleanup of stale keys
  - Response caching for idempotent operations

### Payment Hardening
- **Location**: `apps/backend/src/services/payments/payment-hardening.service.ts`
- **Features**:
  - Amount validation
  - Daily limit enforcement
  - Velocity checking
  - Webhook signature validation
  - Card validation with Stripe

## Compliance Frameworks

### SOC2 Readiness
- **Service**: `apps/backend/src/compliance/soc2-readiness.service.ts`
- **Trust Services Criteria Assessed**:
  - Security: Access control, network security, encryption, vulnerability management
  - Availability: System uptime, disaster recovery, load balancing
  - Processing Integrity: Input validation, error handling, transaction processing
  - Confidentiality: PII protection, payment card security
  - Privacy: Data collection notice, retention policies, right to deletion

### PCI DSS Validation
- **Service**: `apps/backend/src/compliance/pci-dss-validation.service.ts`
- **Requirements Covered**:
  - 1.1: Firewall configuration
  - 1.2: Password policy
  - 2.1: No card data storage
  - 2.2: Encryption of transmission
  - 3.1: Data retention
  - 4.1: Encryption across networks
  - 4.2: No default credentials
  - 5.1: Anti-virus protection
  - 6.1: Vulnerability scanning
  - 6.2: System updates
  - 7.1: Least privilege access
  - 8.1: Authentication
  - 9.1: Audit trails
  - 9.2: Log all access
  - 9.3: Log retention

### Security Automation
- **Script**: `infra/scripts/security-automation.js`
- **Commands**:
  - `sast-scan`: Static code analysis via npm audit
  - `dast-scan`: Dynamic application security testing
  - `pentest`: Penetration testing (nmap, SSL checks)
  - `owasp-check`: OWASP Top 10 compliance verification
  - `full-audit`: Comprehensive security audit

### Secrets Rotation
- **Script**: `infra/scripts/secrets-rotation.ps1.js`
- **Commands**:
  - `validate`: Check rotation capability
  - `rotate <secrets...>`: Rotate specified secrets
- **Features**:
  - Cryptographic random generation
  - Rotation history tracking
  - Proof of rotation capability

### OWASP Threat Modeling
- **Document**: `docs/security/threat-model.json`
- **Threats Modeled**:
  - T001: User Credential Theft (High)
  - T002: Payment Fraud (Medium)
  - T003: Session Hijacking (Medium)
  - T004: Database Injection (High)
  - T005: Rate Limiting Bypass (Medium)
  - T006: PII Data Exposure (Medium)
  - T007: Webhook Replay Attack (High)
  - T008: Insecure Direct Object Reference (Medium)

## Compliance Endpoints

### API Routes
- `GET /compliance/soc2` - SOC2 readiness assessment
- `GET /compliance/soc2/evidence` - SOC2 evidence report
- `GET /compliance/pci-dss` - PCI DSS status
- `GET /compliance/pci-dss/payment-flow` - Payment flow validation
- `GET /compliance/secrets/rotation-status` - Secrets rotation status
- `GET /compliance/secrets/proof` - Rotation proof
- `POST /compliance/secrets/rotate` - Rotate secrets
- `GET /compliance/retention-stats` - Data retention statistics

## Running Compliance Checks

```bash
# SAST Scan
node infra/scripts/security-automation.js sast-scan

# Full Security Audit
node infra/scripts/security-automation.js full-audit

# Validate Secrets Rotation
node infra/scripts/secrets-rotation.ps1.js validate

# Rotate Secrets
node infra/scripts/secrets-rotation.ps1.js rotate jwt_secret encryption
```

## CI/CD Integration
Security checks run automatically in GitHub Actions on the `security-audit` job:
- Daily at 2 AM UTC via scheduled trigger
- On push to main/develop branches
- On pull requests to main