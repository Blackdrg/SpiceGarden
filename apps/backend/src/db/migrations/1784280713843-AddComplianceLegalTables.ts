import { MigrationInterface, QueryRunner } from 'typeorm';

const TABLES: { name: string; ddl: string }[] = [
  {
    name: 'legal_documents',
    ddl: `
      CREATE TABLE "legal_documents" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "type" character varying(80) NOT NULL,
        "title" character varying(255) NOT NULL,
        "slug" character varying(255),
        "status" character varying(20) NOT NULL DEFAULT 'draft',
        "currentVersion" integer NOT NULL DEFAULT 1,
        "approvalStatus" character varying(20) NOT NULL DEFAULT 'approved',
        "approverId" character varying(255),
        "approvedAt" timestamptz,
        "ownerRole" character varying(50),
        "requiresAcceptance" boolean NOT NULL DEFAULT true,
        "multiLanguage" boolean NOT NULL DEFAULT true,
        "defaultLanguage" character varying(20) NOT NULL DEFAULT 'en',
        "workflowState" character varying(20) NOT NULL DEFAULT 'draft',
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_legal_documents" PRIMARY KEY ("id")
      )`,
  },
  {
    name: 'legal_versions',
    ddl: `
      CREATE TABLE "legal_versions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "documentId" uuid NOT NULL,
        "documentType" character varying(80) NOT NULL,
        "version" integer NOT NULL,
        "approvalStatus" character varying(20) NOT NULL DEFAULT 'pending',
        "title" text NOT NULL,
        "sections" jsonb NOT NULL,
        "summary" text,
        "language" character varying(20) NOT NULL DEFAULT 'en',
        "changeNotes" text,
        "authorId" character varying(255),
        "approverId" character varying(255),
        "approvedAt" timestamptz,
        "effectiveDate" timestamptz,
        "retiredDate" timestamptz,
        "contentHash" character varying(128),
        "signature" character varying(255),
        "workflowState" character varying(20) NOT NULL DEFAULT 'draft',
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_legal_versions" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_legal_versions_doc_version" UNIQUE ("documentId","version")
      )`,
  },
  {
    name: 'legal_acceptances',
    ddl: `
      CREATE TABLE "legal_acceptances" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "documentId" uuid NOT NULL,
        "versionId" uuid NOT NULL,
        "version" integer NOT NULL,
        "documentType" character varying(80) NOT NULL,
        "ipAddress" character varying(45),
        "userAgent" character varying(512),
        "acceptanceMethod" character varying(255),
        "signature" character varying(255),
        "acceptedAt" timestamptz,
        "withdrawn" boolean NOT NULL DEFAULT false,
        "withdrawnAt" timestamptz,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_legal_acceptances" PRIMARY KEY ("id")
      )`,
  },
  {
    name: 'cookie_consents',
    ddl: `
      CREATE TABLE "cookie_consents" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid,
        "anonymousToken" character varying(128),
        "region" character varying(20) NOT NULL DEFAULT 'gdpr',
        "language" character varying(10) NOT NULL DEFAULT 'en',
        "necessary" boolean NOT NULL DEFAULT true,
        "analytics" boolean NOT NULL DEFAULT false,
        "marketing" boolean NOT NULL DEFAULT false,
        "performance" boolean NOT NULL DEFAULT false,
        "functional" boolean NOT NULL DEFAULT false,
        "preference" boolean NOT NULL DEFAULT false,
        "consentVersion" character varying(40) NOT NULL DEFAULT '1.0.0',
        "ipAddress" character varying(45),
        "userAgent" character varying(512),
        "consentMethod" character varying(255),
        "withdrawnAt" timestamptz,
        "active" boolean NOT NULL DEFAULT false,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cookie_consents" PRIMARY KEY ("id")
      )`,
  },
  {
    name: 'consent_logs',
    ddl: `
      CREATE TABLE "consent_logs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid,
        "anonymousToken" character varying(128),
        "consentId" uuid,
        "category" character varying(30) NOT NULL,
        "granted" boolean NOT NULL,
        "region" character varying(20) NOT NULL DEFAULT 'gdpr',
        "consentVersion" character varying(40) NOT NULL DEFAULT '1.0.0',
        "action" character varying(40) NOT NULL,
        "ipAddress" character varying(45),
        "userAgent" character varying(512),
        "source" character varying(255),
        "metadata" jsonb,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_consent_logs" PRIMARY KEY ("id")
      )`,
  },
  {
    name: 'data_subject_requests',
    ddl: `
      CREATE TABLE "data_subject_requests" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "type" character varying(30) NOT NULL,
        "regulation" character varying(20) NOT NULL,
        "status" character varying(25) NOT NULL DEFAULT 'pending',
        "reason" text,
        "requestedBy" character varying(255),
        "reviewerId" uuid,
        "reviewNotes" text,
        "reviewedAt" timestamptz,
        "scheduledDate" timestamptz,
        "completedAt" timestamptz,
        "cancelledAt" timestamptz,
        "cancellationReason" text,
        "slaDays" integer NOT NULL DEFAULT 30,
        "slaDeadline" timestamptz,
        "resultSummary" text,
        "metadata" jsonb,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_data_subject_requests" PRIMARY KEY ("id")
      )`,
  },
  {
    name: 'privacy_data_exports',
    ddl: `
      CREATE TABLE "privacy_data_exports" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "requestId" uuid,
        "regulation" character varying(20) NOT NULL DEFAULT 'gdpr',
        "format" character varying(15) NOT NULL DEFAULT 'json',
        "status" character varying(25) NOT NULL DEFAULT 'pending',
        "filePath" text,
        "downloadUrl" text,
        "expiresAt" timestamptz,
        "errorMessage" text,
        "scope" jsonb,
        "sizeBytes" integer NOT NULL DEFAULT 0,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "completedAt" timestamptz
      )`,
  },
  {
    name: 'retention_policies',
    ddl: `
      CREATE TABLE "retention_policies" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "key" character varying(80) NOT NULL,
        "label" character varying(128) NOT NULL,
        "dataType" character varying(80) NOT NULL,
        "retentionDays" integer NOT NULL,
        "action" character varying(20) NOT NULL DEFAULT 'delete',
        "enabled" boolean NOT NULL DEFAULT true,
        "legalHoldCapable" boolean NOT NULL DEFAULT false,
        "scope" jsonb,
        "timezone" character varying(40) NOT NULL DEFAULT 'UTC',
        "description" character varying(255),
        "lastRunAt" timestamptz,
        "lastRunRecordsAffected" integer NOT NULL DEFAULT 0,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_retention_policies" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_retention_policies_key" UNIQUE ("key")
      )`,
  },
  {
    name: 'data_retention_jobs',
    ddl: `
      CREATE TABLE "data_retention_jobs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "policyId" uuid NOT NULL,
        "status" character varying(25) NOT NULL DEFAULT 'pending',
        "action" character varying(20) NOT NULL,
        "dataType" character varying(80) NOT NULL,
        "cutoffDate" timestamptz NOT NULL,
        "recordsScanned" integer NOT NULL DEFAULT 0,
        "recordsAffected" integer NOT NULL DEFAULT 0,
        "errorMessage" text,
        "result" jsonb,
        "triggeredBy" character varying(255),
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "completedAt" timestamptz
      )`,
  },
  {
    name: 'security_incidents',
    ddl: `
      CREATE TABLE "security_incidents" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" character varying(160) NOT NULL,
        "description" text NOT NULL,
        "severity" character varying(15) NOT NULL DEFAULT 'medium',
        "status" character varying(15) NOT NULL DEFAULT 'open',
        "category" character varying(80),
        "publiclyDisclosed" boolean NOT NULL DEFAULT false,
        "disclosureText" text,
        "reporterId" character varying(255),
        "reporterEmail" character varying(80),
        "assignedTo" character varying(255),
        "detectedAt" timestamptz,
        "containedAt" timestamptz,
        "resolvedAt" timestamptz,
        "affectedSystems" jsonb,
        "remediationSteps" jsonb,
        "contentHash" character varying(128),
        "publishedAt" timestamptz,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_security_incidents" PRIMARY KEY ("id")
      )`,
  },
  {
    name: 'grievances',
    ddl: `
      CREATE TABLE "grievances" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid,
        "regulation" character varying(20) NOT NULL DEFAULT 'dpdp',
        "subject" character varying(160) NOT NULL,
        "description" text NOT NULL,
        "status" character varying(20) NOT NULL DEFAULT 'open',
        "complainantName" character varying(160),
        "complainantEmail" character varying(255),
        "complainantPhone" character varying(40),
        "assignedOfficerId" character varying(80),
        "resolution" text,
        "resolvedAt" timestamptz,
        "slaDeadline" timestamptz,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_grievances" PRIMARY KEY ("id")
      )`,
  },
  {
    name: 'agreements',
    ddl: `
      CREATE TABLE "agreements" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "party" character varying(20) NOT NULL,
        "type" character varying(80) NOT NULL,
        "title" character varying(255) NOT NULL,
        "version" integer NOT NULL DEFAULT 1,
        "status" character varying(20) NOT NULL DEFAULT 'draft',
        "approvalStatus" character varying(20) NOT NULL DEFAULT 'approved',
        "content" text NOT NULL,
        "clauses" jsonb,
        "contentHash" character varying(128),
        "language" character varying(30) NOT NULL DEFAULT 'en',
        "authorId" character varying(255),
        "approverId" character varying(255),
        "approvedAt" timestamptz,
        "effectiveDate" timestamptz,
        "expiresAt" timestamptz,
        "changeNotes" text,
        "signatureTemplate" character varying(512),
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_agreements" PRIMARY KEY ("id")
      )`,
  },
  {
    name: 'agreement_acceptances',
    ddl: `
      CREATE TABLE "agreement_acceptances" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "agreementId" uuid NOT NULL,
        "userId" uuid,
        "partyId" character varying(255),
        "partyType" character varying(20) NOT NULL,
        "version" integer NOT NULL,
        "ipAddress" character varying(45),
        "userAgent" character varying(512),
        "signature" character varying(255),
        "digitalSignature" character varying(255),
        "acceptedAt" timestamptz,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_agreement_acceptances" PRIMARY KEY ("id")
      )`,
  },
  {
    name: 'compliance_audits',
    ddl: `
      CREATE TABLE "compliance_audits" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "action" character varying(60) NOT NULL,
        "category" character varying(60) NOT NULL,
        "actorId" character varying(255),
        "actorRole" character varying(40),
        "entityType" character varying(80),
        "entityId" character varying(255),
        "ipAddress" character varying(45),
        "metadata" jsonb,
        "contentHash" character varying(128),
        "signature" character varying(512),
        "tampered" boolean NOT NULL DEFAULT false,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_compliance_audits" PRIMARY KEY ("id")
      )`,
  },
  {
    name: 'cookie_registry',
    ddl: `
      CREATE TABLE "cookie_registry" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(160) NOT NULL,
        "category" character varying(30) NOT NULL DEFAULT 'necessary',
        "domain" character varying(255),
        "provider" character varying(20),
        "purpose" character varying(160),
        "duration" character varying(40),
        "type" character varying(20) NOT NULL DEFAULT 'first_party',
        "active" boolean NOT NULL DEFAULT true,
        "scanVersion" character varying(40) NOT NULL DEFAULT '1.0.0',
        "lastScannedAt" timestamptz,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cookie_registry" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_cookie_registry_name" UNIQUE ("name")
      )`,
  },
];

const INDEXES: string[] = [
  'CREATE INDEX IF NOT EXISTS "idx_legal_documents_type" ON "legal_documents" ("type")',
  'CREATE INDEX IF NOT EXISTS "idx_legal_documents_status" ON "legal_documents" ("status")',
  'CREATE INDEX IF NOT EXISTS "idx_legal_versions_document" ON "legal_versions" ("documentId")',
  'CREATE INDEX IF NOT EXISTS "idx_legal_acceptances_user" ON "legal_acceptances" ("userId")',
  'CREATE INDEX IF NOT EXISTS "idx_legal_acceptances_user_document" ON "legal_acceptances" ("userId","documentId")',
  'CREATE INDEX IF NOT EXISTS "idx_cookie_consents_user" ON "cookie_consents" ("userId")',
  'CREATE INDEX IF NOT EXISTS "idx_cookie_consents_token" ON "cookie_consents" ("anonymousToken")',
  'CREATE INDEX IF NOT EXISTS "idx_consent_logs_user" ON "consent_logs" ("userId")',
  'CREATE INDEX IF NOT EXISTS "idx_consent_logs_consent" ON "consent_logs" ("consentId")',
  'CREATE INDEX IF NOT EXISTS "idx_consent_logs_category" ON "consent_logs" ("category")',
  'CREATE INDEX IF NOT EXISTS "idx_consent_logs_created" ON "consent_logs" ("createdAt")',
  'CREATE INDEX IF NOT EXISTS "idx_dsr_user" ON "data_subject_requests" ("userId")',
  'CREATE INDEX IF NOT EXISTS "idx_dsr_status" ON "data_subject_requests" ("status")',
  'CREATE INDEX IF NOT EXISTS "idx_dsr_type" ON "data_subject_requests" ("type")',
  'CREATE INDEX IF NOT EXISTS "idx_dsr_regulation" ON "data_subject_requests" ("regulation")',
  'CREATE INDEX IF NOT EXISTS "idx_privacy_exports_user" ON "privacy_data_exports" ("userId")',
  'CREATE INDEX IF NOT EXISTS "idx_privacy_exports_request" ON "privacy_data_exports" ("requestId")',
  'CREATE INDEX IF NOT EXISTS "idx_privacy_exports_status" ON "privacy_data_exports" ("status")',
  'CREATE INDEX IF NOT EXISTS "idx_retention_policies_key" ON "retention_policies" ("key")',
  'CREATE INDEX IF NOT EXISTS "idx_retention_jobs_policy" ON "data_retention_jobs" ("policyId")',
  'CREATE INDEX IF NOT EXISTS "idx_retention_jobs_status" ON "data_retention_jobs" ("status")',
  'CREATE INDEX IF NOT EXISTS "idx_security_incidents_status" ON "security_incidents" ("status")',
  'CREATE INDEX IF NOT EXISTS "idx_security_incidents_severity" ON "security_incidents" ("severity")',
  'CREATE INDEX IF NOT EXISTS "idx_security_incidents_created" ON "security_incidents" ("createdAt")',
  'CREATE INDEX IF NOT EXISTS "idx_grievances_user" ON "grievances" ("userId")',
  'CREATE INDEX IF NOT EXISTS "idx_grievances_status" ON "grievances" ("status")',
  'CREATE INDEX IF NOT EXISTS "idx_grievances_regulation" ON "grievances" ("regulation")',
  'CREATE INDEX IF NOT EXISTS "idx_agreements_party" ON "agreements" ("party")',
  'CREATE INDEX IF NOT EXISTS "idx_agreements_status" ON "agreements" ("status")',
  'CREATE INDEX IF NOT EXISTS "idx_agreements_type" ON "agreements" ("type")',
  'CREATE INDEX IF NOT EXISTS "idx_agreement_acceptances_party" ON "agreement_acceptances" ("partyId")',
  'CREATE INDEX IF NOT EXISTS "idx_agreement_acceptances_user" ON "agreement_acceptances" ("userId")',
  'CREATE INDEX IF NOT EXISTS "idx_agreement_acceptances_agreement" ON "agreement_acceptances" ("agreementId")',
  'CREATE INDEX IF NOT EXISTS "idx_compliance_audits_category" ON "compliance_audits" ("category")',
  'CREATE INDEX IF NOT EXISTS "idx_compliance_audits_actor" ON "compliance_audits" ("actorId")',
  'CREATE INDEX IF NOT EXISTS "idx_compliance_audits_created" ON "compliance_audits" ("createdAt")',
  'CREATE INDEX IF NOT EXISTS "idx_cookie_registry_name" ON "cookie_registry" ("name")',
];

export class AddComplianceLegalTables1784280713843 implements MigrationInterface {
  name = 'AddComplianceLegalTables1784280713843';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of TABLES) {
      await queryRunner.query(
        `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '${table.name}') THEN ${table.ddl}; END IF; END $$;`,
      );
    }
    for (const index of INDEXES) {
      await queryRunner.query(index);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const ordered = [...TABLES].reverse().map((t) => t.name);
    for (const name of ordered) {
      await queryRunner.query(`DROP TABLE IF EXISTS "${name}" CASCADE`);
    }
  }
}
