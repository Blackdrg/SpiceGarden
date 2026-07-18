import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecurityIncidentEntity } from './entities';
import {
  SecurityIncidentSeverity,
  SecurityIncidentStatus,
} from './entities/legal.enums';
import { LegalIntegrityService } from './integrity.service';
import { ComplianceAuditService } from './compliance-audit.service';

export interface CreateIncidentInput {
  title: string;
  description: string;
  severity?: SecurityIncidentSeverity;
  category?: string;
  reporterId?: string;
  reporterEmail?: string;
  affectedSystems?: string[];
  detectedAt?: Date;
}

export interface SecurityContact {
  securityEmail: string;
  pgpFingerprint: string;
  pgpPublicKeyUrl: string;
  bugBountyProgram: string;
  disclosurePolicy: string;
  responseTimeSla: string;
}

@Injectable()
export class SecurityCenterService {
  private readonly logger = new Logger(SecurityCenterService.name);

  private readonly contact: SecurityContact = {
    securityEmail: 'security@spicegarden.com',
    pgpFingerprint: '9F2A 4C1B 8E3D 6A05 7C9F 1B2E 3D4A 5F6B 7C8D 9E0F',
    pgpPublicKeyUrl: 'https://spicegarden.com/.well-known/pgp-key.asc',
    bugBountyProgram: 'https://bugbounty.spicegarden.com',
    disclosurePolicy: 'Coordinated disclosure, 90-day embargo after resolution.',
    responseTimeSla: 'Acknowledgement within 24h, triage within 72h.',
  };

  constructor(
    @InjectRepository(SecurityIncidentEntity)
    private readonly repo: Repository<SecurityIncidentEntity>,
    private readonly integrity: LegalIntegrityService,
    private readonly audit: ComplianceAuditService,
  ) {}

  getContact(): SecurityContact {
    return this.contact;
  }

  getChangelog(): { version: string; date: string; changes: string[] }[] {
    return [
      { version: '1.4.0', date: '2026-06-01', changes: ['Added DPDP consent manager integration', 'Expanded audit logging coverage'] },
      { version: '1.3.0', date: '2026-03-15', changes: ['Launched bug bounty program', 'Added PGP-encrypted vulnerability reporting'] },
      { version: '1.2.0', date: '2025-12-01', changes: ['PCI DSS SAQ validation automation', 'Quarterly penetration testing cadence'] },
      { version: '1.1.0', date: '2025-09-10', changes: ['Responsible disclosure policy published', 'Security incident register introduced'] },
      { version: '1.0.0', date: '2025-06-01', changes: ['Initial Security Center launch'] },
    ];
  }

  getIncidentResponsePolicy(): { summary: string; phases: { name: string; sla: string; steps: string[] }[]; contacts: string[] } {
    return {
      summary:
        'SpiceGarden operates a documented incident response plan aligned to NIST SP 800-61. ' +
        'Security incidents are classified, contained, eradicated, and recovered with defined SLAs.',
      phases: [
        { name: 'Identification', sla: 'Triage within 1 hour', steps: ['Alert ingestion', 'Severity classification', 'Owner assignment'] },
        { name: 'Containment', sla: 'Short-term within 4 hours', steps: ['Isolate affected systems', 'Revoke credentials', 'Preserve evidence'] },
        { name: 'Eradication', sla: 'Within 24 hours', steps: ['Root-cause analysis', 'Remove persistence', 'Patch vulnerabilities'] },
        { name: 'Recovery', sla: 'Within 72 hours', steps: ['Restore from clean backups', 'Monitor for recurrence', 'Validation testing'] },
        { name: 'Post-Mortem', sla: 'Within 14 days', steps: ['Blameless retrospective', 'Publish disclosure if required', 'Update runbooks'] },
      ],
      contacts: ['security@spicegarden.com', 'On-call PagerDuty (internal)'],
    };
  }

  getPatchPolicy(): { cadence: string; severitySlas: Record<string, string>; process: string[] } {
    return {
      cadence: 'Monthly baseline patching; emergency patches within 24h of critical CVE disclosure.',
      severitySlas: { critical: '24h', high: '72h', medium: '14d', low: '30d' },
      process: [
        'CVE monitoring via dependency scanners and vendor advisories',
        'Automated CI dependency updates with test gating',
        'Staged rollout: staging -> canary -> production',
        'Rollback plan validated for every release',
      ],
    };
  }

  getEncryptionPolicy(): { atRest: string; inTransit: string; keyManagement: string; rotation: string } {
    return {
      atRest: 'AES-256-GCM for sensitive data (PII, legal records, agreement content). Database volumes encrypted at the storage layer.',
      inTransit: 'TLS 1.2+ enforced on all public endpoints; HSTS enabled; internal mesh mTLS where supported.',
      keyManagement: 'Application keys sourced from HashiCorp Vault; no secrets committed to source control.',
      rotation: 'Symmetric data keys rotated on a 90-day schedule; signing keys rotated on incident or suspected compromise.',
    };
  }

  getSocReports(): { framework: string; status: string; lastAudit: string; controls: string[] }[] {
    return [
      { framework: 'SOC 2 Type II', status: 'In progress', lastAudit: '2026-Q1', controls: ['Security', 'Availability', 'Confidentiality'] },
      { framework: 'ISO 27001', status: 'Certified', lastAudit: '2025-11', controls: ['Annex A control set'] },
      { framework: 'PCI DSS SAQ A', status: 'Attested', lastAudit: '2026-02', controls: ['No cardholder data stored'] },
    ];
  }

  getSecurityFaqs(): { question: string; answer: string }[] {
    return [
      { question: 'Where do you store my card data?', answer: 'We never store cardholder data. Payments are processed by PCI-DSS compliant gateways (Stripe, Razorpay) via hosted checkout.' },
      { question: 'How can I report a vulnerability?', answer: 'Email security@spicegarden.com with PGP encryption, or use our coordinated disclosure program with a 90-day embargo.' },
      { question: 'How is my data encrypted?', answer: 'Sensitive data is encrypted at rest with AES-256-GCM and in transit with TLS 1.2+.' },
      { question: 'Can I request deletion of my data?', answer: 'Yes, via the Privacy Dashboard or by submitting a data-subject request under GDPR/DPDP.' },
    ];
  }

  async reportIncident(input: CreateIncidentInput): Promise<SecurityIncidentEntity> {
    const contentHash = this.integrity.hashContent({
      title: input.title,
      description: input.description,
      severity: input.severity || SecurityIncidentSeverity.MEDIUM,
    });
    const incident = this.repo.create({
      title: input.title,
      description: input.description,
      severity: input.severity || SecurityIncidentSeverity.MEDIUM,
      status: SecurityIncidentStatus.OPEN,
      category: input.category,
      reporterId: input.reporterId,
      reporterEmail: input.reporterEmail,
      affectedSystems: input.affectedSystems || [],
      detectedAt: input.detectedAt || new Date(),
      contentHash,
    });
    const saved = await this.repo.save(incident);
    await this.audit.record({
      action: 'security_incident_reported',
      category: 'security',
      actorId: input.reporterId,
      entityType: 'security_incidents',
      entityId: saved.id,
      metadata: { severity: saved.severity },
    });
    return saved;
  }

  async listIncidents(filter?: { status?: SecurityIncidentStatus; severity?: SecurityIncidentSeverity; publiclyDisclosed?: boolean }): Promise<SecurityIncidentEntity[]> {
    const where: Record<string, any> = {};
    if (filter?.status) where.status = filter.status;
    if (filter?.severity) where.severity = filter.severity;
    if (filter?.publiclyDisclosed !== undefined) where.publiclyDisclosed = filter.publiclyDisclosed;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async getIncident(id: string): Promise<SecurityIncidentEntity> {
    const incident = await this.repo.findOne({ where: { id } });
    if (!incident) throw new NotFoundException('Incident not found');
    return incident;
  }

  async updateIncident(
    id: string,
    update: {
      status?: SecurityIncidentStatus;
      severity?: SecurityIncidentSeverity;
      assignedTo?: string;
      remediationSteps?: string[];
      publiclyDisclosed?: boolean;
      disclosureText?: string;
    },
  ): Promise<SecurityIncidentEntity> {
    const incident = await this.getIncident(id);
    Object.assign(incident, update);
    if (update.status === SecurityIncidentStatus.RESOLVED && !incident.resolvedAt) {
      incident.resolvedAt = new Date();
    }
    if (update.publiclyDisclosed && !incident.publishedAt) {
      incident.publishedAt = new Date();
    }
    incident.contentHash = this.integrity.hashContent({
      title: incident.title,
      description: incident.description,
      severity: incident.severity,
      status: incident.status,
    });
    const saved = await this.repo.save(incident);
    await this.audit.record({
      action: 'security_incident_updated',
      category: 'security',
      entityType: 'security_incidents',
      entityId: saved.id,
      metadata: { status: saved.status },
    });
    return saved;
  }

  async generateSecurityReport(): Promise<Record<string, any>> {
    const [open, critical, publiclyDisclosed, total] = await Promise.all([
      this.repo.count({ where: { status: SecurityIncidentStatus.OPEN } }),
      this.repo.count({ where: { severity: SecurityIncidentSeverity.CRITICAL } }),
      this.repo.count({ where: { publiclyDisclosed: true } }),
      this.repo.count(),
    ]);
    return {
      generatedAt: new Date().toISOString(),
      openIncidents: open,
      criticalIncidents: critical,
      publiclyDisclosed,
      totalIncidents: total,
      encryption: 'AES-256-GCM at rest, TLS 1.2+ in transit',
      keyRotation: 'Automated 90-day rotation via Vault',
      compliance: ['SOC 2 Type II (in progress)', 'PCI DSS SAQ A', 'ISO 27001 controls'],
    };
  }
}
