# Compliance Automation — SpiceGarden

## GDPR Automation

### Data Subject Request (DSR) Workflow
1. User submits request via `/privacy/request` endpoint
2. Request is logged in `compliance_audit` table with type, timestamp, and status
3. Automated workflow triggers based on request type:
   - ACCESS: Aggregates user data from all services, generates export package
   - DELETE: Cascades deletion across all connected services, anonymizes references
   - CORRECT: Validates and applies corrections to user records
   - RESTRICT: Temporarily suspends processing of user data
   - OBJECT: Stops processing for the specified purpose
   - WITHDRAW: Revokes consent and stops processing
4. SLA timer starts (30 days for access/delete/correct, 15 days for consent withdrawal)
5. Notification sent to user when request is fulfilled
6. Audit trail entry created with immutable signature

### Cookie Consent Automation
- Cookie consent banner implemented in all frontend apps
- Consent choices stored in `cookie_consent` table with timestamp and version
- Consent changes trigger event to all connected services
- Consent withdrawal propagates to all data processors within 24 hours
- Cookie categories: essential, analytics, marketing, personalization
- Consent versioning tracked for audit purposes

### Data Retention Automation
- Retention policies configured per data type:
  - Orders: 7 years (tax compliance)
  - User profiles: 3 years after account deletion
  - Payment records: 10 years (financial regulations)
  - Audit logs: 5 years
  - Session data: 30 days
- Automated cleanup jobs run daily via K8s CronJob
- Retention policy violations trigger alerts to compliance team

## CCPA/CPRA Automation
- Do Not Sell/Share opt-out respected across all services
- Consumer data export available at `/privacy/ccpa-export`
- Deletion requests honored within 45 days
- Service provider contracts include CCPA provisions

## Data Retention Policy

| Data Type | Retention Period | Legal Basis |
|-----------|-----------------|-------------|
| Orders | 7 years | Tax compliance (GST, VAT) |
| Payment records | 10 years | Financial regulations |
| User profiles | 3 years after deletion | Contract fulfillment |
| Audit logs | 5 years | Regulatory requirement |
| Session data | 30 days | Legitimate interest |
| Marketing consent | Until withdrawal | Consent |
| Cookie consent | Until withdrawal | Consent |
| Support tickets | 3 years | Legitimate interest |

## Automated Compliance Checks

### Daily
- Data retention cleanup job
- Consent expiry notification job
- DSR SLA monitoring

### Weekly
- Cookie consent audit
- Privacy policy version check
- Third-party data sharing audit

### Monthly
- Access/delete request SLA report
- Consent withdrawal propagation report
- Data processing activity report

### Quarterly
- Data Protection Impact Assessment (DPIA) review
- Third-party processor audit
- Cross-border transfer review

## Implementation Status
- Data retention automation: IMPLEMENTED (CronJob in K8s)
- Cookie consent: IMPLEMENTED (frontend banner + backend consent API)
- DSR workflow: IMPLEMENTED (backend endpoints + audit trail)
- Consent withdrawal: IMPLEMENTED (propagation to all services)
- Automated compliance reporting: IMPLEMENTED (scheduled reports)
- DPIA automation: NOT DONE (requires manual legal review each quarter)
- Third-party processor audit: NOT DONE (requires manual review)
- Cross-border transfer review: NOT DONE (requires legal team review)