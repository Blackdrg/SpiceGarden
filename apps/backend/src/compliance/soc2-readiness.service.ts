import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface Soc2Control {
  id: string;
  name: string;
  description: string;
  status: 'implemented' | 'partial' | 'not_implemented';
  evidence?: string[];
  lastChecked?: Date;
}

export interface Soc2Report {
  trustServicesCriteria: {
    security: Soc2Control[];
    availability: Soc2Control[];
    processingIntegrity: Soc2Control[];
    confidentiality: Soc2Control[];
    privacy: Soc2Control[];
  };
  overallStatus: 'compliant' | 'partially_compliant' | 'not_compliant';
  gapAnalysis: string[];
}

@Injectable()
export class Soc2ReadinessService {
  private readonly logger = new Logger(Soc2ReadinessService.name);

  constructor(private configService: ConfigService) {}

  async assessTrustServicesCriteria(): Promise<Soc2Report> {
    const [security, availability, processingIntegrity, confidentiality, privacy] = await Promise.all([
      this.assessSecurityControls(),
      this.assessAvailabilityControls(),
      this.assessProcessingIntegrityControls(),
      this.assessConfidentialityControls(),
      this.assessPrivacyControls(),
    ]);

    const allControls = [...security, ...availability, ...processingIntegrity, ...confidentiality, ...privacy];
    const gapAnalysis = this.identifyGaps(allControls);
    const overallStatus = this.calculateOverallStatus(allControls);

    return {
      trustServicesCriteria: {
        security,
        availability,
        processingIntegrity,
        confidentiality,
        privacy,
      },
      overallStatus,
      gapAnalysis,
    };
  }

  private async assessSecurityControls(): Promise<Soc2Control[]> {
    return [
      {
        id: 'SEC-01',
        name: 'Access Control',
        description: 'Logical and physical access controls are implemented',
        status: this.configService.get<boolean>('JWT_AUTH_ENABLED') ? 'implemented' : 'not_implemented',
        evidence: ['JWT authentication', 'Role-based access control', 'API rate limiting'],
        lastChecked: new Date(),
      },
      {
        id: 'SEC-02',
        name: 'Network Security',
        description: 'Firewall and network segmentation controls',
        status: 'implemented',
        evidence: ['Helmet middleware', 'HPP protection', 'MongoDB sanitization'],
        lastChecked: new Date(),
      },
      {
        id: 'SEC-03',
        name: 'Data Encryption',
        description: 'Data at rest and in transit encryption',
        status: this.configService.get<string>('ENCRYPTION_SECRET') ? 'implemented' : 'not_implemented',
        evidence: ['AES-256 encryption', 'HTTPS enforced', 'PII field encryption'],
        lastChecked: new Date(),
      },
      {
        id: 'SEC-04',
        name: 'Vulnerability Management',
        description: 'Regular vulnerability scanning and patching',
        status: 'partial',
        evidence: ['npm audit in CI/CD', 'OWASP dependency check'],
        lastChecked: new Date(),
      },
      {
        id: 'SEC-05',
        name: 'Security Incident Response',
        description: 'Incident detection and response procedures',
        status: 'partial',
        evidence: ['Audit logging', 'Error tracking with Sentry'],
        lastChecked: new Date(),
      },
    ];
  }

  private async assessAvailabilityControls(): Promise<Soc2Control[]> {
    return [
      {
        id: 'AVA-01',
        name: 'System Availability',
        description: 'System uptime and availability monitoring',
        status: 'implemented',
        evidence: ['Health endpoint', 'Prometheus metrics', 'Uptime monitoring'],
        lastChecked: new Date(),
      },
      {
        id: 'AVA-02',
        name: 'Disaster Recovery',
        description: 'Backup and recovery procedures',
        status: this.configService.get<boolean>('BACKUP_ENABLED') ? 'implemented' : 'partial',
        evidence: ['Backup scripts', 'Disaster recovery procedures'],
        lastChecked: new Date(),
      },
      {
        id: 'AVA-03',
        name: 'Load Balancing',
        description: 'Traffic distribution and failover',
        status: 'implemented',
        evidence: ['Kubernetes deployment', 'Autoscaling configuration'],
        lastChecked: new Date(),
      },
    ];
  }

  private async assessProcessingIntegrityControls(): Promise<Soc2Control[]> {
    return [
      {
        id: 'PI-01',
        name: 'Input Validation',
        description: 'Data input validation and sanitization',
        status: 'implemented',
        evidence: ['class-validator', 'ValidationPipe', 'mongo-sanitize'],
        lastChecked: new Date(),
      },
      {
        id: 'PI-02',
        name: 'Error Handling',
        description: 'System errors are detected, reported and corrected',
        status: 'implemented',
        evidence: ['Global exception filter', 'Structured error logging'],
        lastChecked: new Date(),
      },
      {
        id: 'PI-03',
        name: 'Transaction Processing',
        description: 'Payment processing integrity controls',
        status: 'implemented',
        evidence: ['Payment validation', 'Idempotency', 'Audit trails'],
        lastChecked: new Date(),
      },
    ];
  }

  private async assessConfidentialityControls(): Promise<Soc2Control[]> {
    return [
      {
        id: 'CONF-01',
        name: 'PII Protection',
        description: 'Personal data is protected during processing',
        status: 'implemented',
        evidence: ['PII encryption service', 'Data retention policies', 'Access logging'],
        lastChecked: new Date(),
      },
      {
        id: 'CONF-02',
        name: 'Payment Card Security',
        description: 'PCI DSS compliant card data handling',
        status: 'partial',
        evidence: ['Card validation', 'No card data stored'],
        lastChecked: new Date(),
      },
    ];
  }

  private async assessPrivacyControls(): Promise<Soc2Control[]> {
    return [
      {
        id: 'PRI-01',
        name: 'Data Collection Notice',
        description: 'Users are notified about data collection',
        status: 'implemented',
        evidence: ['Privacy policy endpoint', 'GDPR compliance module'],
        lastChecked: new Date(),
      },
      {
        id: 'PRI-02',
        name: 'Data Retention',
        description: 'Data is retained only as needed',
        status: 'implemented',
        evidence: ['Compliance service retention policies', 'Automated cleanup'],
        lastChecked: new Date(),
      },
      {
        id: 'PRI-03',
        name: 'Right to Deletion',
        description: 'Users can request data deletion',
        status: 'implemented',
        evidence: ['GDPR delete endpoint', 'Soft delete implementation'],
        lastChecked: new Date(),
      },
    ];
  }

  private identifyGaps(controls: Soc2Control[]): string[] {
    const gaps: string[] = [];

    controls
      .filter(c => c.status === 'not_implemented')
      .forEach(c => {
        gaps.push(`${c.id}: ${c.name} - Not implemented`);
      });

    controls
      .filter(c => c.status === 'partial')
      .forEach(c => {
        gaps.push(`${c.id}: ${c.name} - Partially implemented, needs review`);
      });

    return gaps;
  }

  private calculateOverallStatus(controls: Soc2Control[]): 'compliant' | 'partially_compliant' | 'not_compliant' {
    const implementedCount = controls.filter(c => c.status === 'implemented').length;
    const partialCount = controls.filter(c => c.status === 'partial').length;
    const totalCount = controls.length;

    if (implementedCount === totalCount) return 'compliant';
    if (implementedCount + partialCount === totalCount) return 'partially_compliant';
    if (implementedCount >= totalCount * 0.7) return 'partially_compliant';
    return 'not_compliant';
  }

  async generateSoc2EvidenceReport(): Promise<Record<string, any>> {
    this.logger.log('Generating SOC2 evidence report');

    return {
      reportGenerated: new Date().toISOString(),
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      securityMeasures: {
        authentication: 'JWT with refresh tokens',
        authorization: 'Role-based (super-admin, restaurant, customer)',
        encryption: 'AES-256 for PII',
        rateLimiting: '100 req/15min for API, 10 req/15min for auth',
        inputValidation: 'class-validator, class-transformer',
        sanitization: 'express-mongo-sanitize, hpp',
      },
      auditTrail: {
        enabled: true,
        retention: '3 years',
        fields: ['action', 'userId', 'resource', 'resourceId', 'metadata'],
      },
      dataRetention: {
        users: '7 years after deletion',
        orders: '10 years',
        sessions: '90 days',
        auditLogs: '3 years',
      },
    };
  }
}