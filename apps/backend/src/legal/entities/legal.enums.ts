export enum LegalDocumentType {
  PRIVACY_POLICY = 'privacy_policy',
  TERMS_OF_SERVICE = 'terms_of_service',
  COOKIE_POLICY = 'cookie_policy',
  REFUND_POLICY = 'refund_policy',
  CANCELLATION_POLICY = 'cancellation_policy',
  DELIVERY_POLICY = 'delivery_policy',
  COMMUNITY_GUIDELINES = 'community_guidelines',
  MERCHANT_AGREEMENT = 'merchant_agreement',
  DRIVER_AGREEMENT = 'driver_agreement',
  PARTNER_AGREEMENT = 'partner_agreement',
  SECURITY_POLICY = 'security_policy',
  RESPONSIBLE_DISCLOSURE = 'responsible_disclosure',
  ACCESSIBILITY_STATEMENT = 'accessibility_statement',
  DATA_RETENTION_POLICY = 'data_retention_policy',
  ACCEPTABLE_USE_POLICY = 'acceptable_use_policy',
  COPYRIGHT_POLICY = 'copyright_policy',
  TRADEMARK_POLICY = 'trademark_policy',
  OPEN_SOURCE_LICENSES = 'open_source_licenses',
}

export enum DocumentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  SUPERSEDED = 'superseded',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum ConsentCategory {
  NECESSARY = 'necessary',
  ANALYTICS = 'analytics',
  MARKETING = 'marketing',
  PERFORMANCE = 'performance',
  FUNCTIONAL = 'functional',
  PREFERENCE = 'preference',
}

export enum Regulation {
  GDPR = 'gdpr',
  CCPA = 'ccpa',
  DPDP = 'dpdp',
  SELF_SERVICE = 'self_service',
}

export enum DataRequestStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export enum DataRequestType {
  ACCESS = 'access',
  DELETE = 'delete',
  CORRECT = 'correct',
  RESTRICT = 'restrict',
  OBJECT = 'object',
  PORTABILITY = 'portability',
  CONSENT_WITHDRAWAL = 'consent_withdrawal',
}

export enum RetentionAction {
  ARCHIVE = 'archive',
  ANONYMIZE = 'anonymize',
  DELETE = 'delete',
  LEGAL_HOLD = 'legal_hold',
}

export enum RetentionJobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ON_HOLD = 'on_hold',
}

export enum SecurityIncidentSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum SecurityIncidentStatus {
  OPEN = 'open',
  INVESTIGATING = 'investigating',
  CONTAINED = 'contained',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum AgreementParty {
  MERCHANT = 'merchant',
  DRIVER = 'driver',
  PARTNER = 'partner',
}

export enum ExportFormat {
  JSON = 'json',
  CSV = 'csv',
  PDF = 'pdf',
}
