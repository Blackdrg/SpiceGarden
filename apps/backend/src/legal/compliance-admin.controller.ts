import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Req,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { type Request as ExpressRequest } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RetentionService } from './retention.service';
import { DataSubjectRequestService } from './data-subject-request.service';
import { ConsentService } from './consent.service';
import { ComplianceAuditService } from './compliance-audit.service';
import { SecurityCenterService } from './security-center.service';
import { GrievanceService } from './grievance.service';
import { AgreementService } from './agreement.service';
import { LegalDocumentService } from './legal-document.service';
import { RetentionPolicyDto, PaginationQueryDto } from './dto/legal.dto';
import { RetentionJobStatus, DataRequestStatus, AgreementParty } from './entities/legal.enums';
import { UserRole } from '../shared/domain/user.interface';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { RolesGuard } from '../security/roles.guard';
import { PermissionGuard } from '../security/permission.guard';
import { Roles } from '../security/roles.decorator';
import { Permissions } from '../security/permissions.decorator';

@ApiTags('compliance-admin')
@Controller('compliance-admin')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Permissions('compliance:read')
export class ComplianceAdminController {
  constructor(
    private readonly retention: RetentionService,
    private readonly dsr: DataSubjectRequestService,
    private readonly consent: ConsentService,
    private readonly audit: ComplianceAuditService,
    private readonly security: SecurityCenterService,
    private readonly grievance: GrievanceService,
    private readonly agreements: AgreementService,
    private readonly documents: LegalDocumentService,
  ) {}

  @Get('overview')
  @ApiOperation({ summary: 'Compliance overview dashboard' })
  async overview() {
    const [policies, requests, breached, consentLogs, incidents, grievances, agreements, auditScan] = await Promise.all([
      this.documents.listDocuments(),
      this.dsr.listRequests({ limit: 100 }),
      this.dsr.findBreachedSlas(),
      this.consent.getConsentLogs({ limit: 1 }),
      this.security.listIncidents(),
      this.grievance.list(),
      this.agreements.list(),
      this.audit.scanForTampering(500),
    ]);
    return {
      generatedAt: new Date().toISOString(),
      documents: { total: policies.length, published: policies.filter((p) => p.status === 'published').length },
      dataSubjectRequests: {
        total: requests.length,
        pending: requests.filter((r) => r.status === DataRequestStatus.PENDING).length,
        breachedSla: breached.length,
      },
      incidents: { total: incidents.length, open: incidents.filter((i) => i.status === 'open').length },
      grievances: { total: grievances.length, open: grievances.filter((g) => g.status === 'open').length },
      agreements: { total: agreements.length },
      integrity: { recordsScanned: auditScan.checked, tampered: auditScan.tampered },
    };
  }

  @Get('gdpr-requests')
  @ApiOperation({ summary: 'GDPR request queue' })
  async gdprRequests(@Query() q: PaginationQueryDto) {
    return this.dsr.listRequests({ regulation: 'gdpr' as any, limit: q.limit, offset: (q.page! - 1) * q.limit! });
  }

  @Get('dpdp-requests')
  @ApiOperation({ summary: 'DPDP request queue' })
  async dpdpRequests(@Query() q: PaginationQueryDto) {
    return this.dsr.listRequests({ regulation: 'dpdp' as any, limit: q.limit, offset: (q.page! - 1) * q.limit! });
  }

  @Get('deletion-queue')
  @ApiOperation({ summary: 'Deletion queue' })
  async deletionQueue() {
    return this.dsr.listRequests({ type: 'delete' as any, limit: 200 });
  }

  @Get('export-queue')
  @ApiOperation({ summary: 'Export queue' })
  async exportQueue() {
    return this.dsr.listRequests({ type: 'access' as any, limit: 200 });
  }

  @Get('retention-status')
  @ApiOperation({ summary: 'Retention policy status' })
  async retentionStatus() {
    const [policies, jobs] = await Promise.all([
      this.retention.listPolicies(),
      this.retention.listJobs({ limit: 50 }),
    ]);
    return { policies, recentJobs: jobs };
  }

  @Get('policy-versions')
  @ApiOperation({ summary: 'Policy version registry' })
  async policyVersions(@Query('type') type?: string) {
    const docs = type ? [await this.documents.getDocument(type as any)] : await this.documents.listDocuments();
    const versions = (await Promise.all(docs.map((doc) => this.documents.listVersions(doc.id)))).flat();
    return versions;
  }

  @Get('consent-logs')
  @ApiOperation({ summary: 'Consent logs' })
  async consentLogs(@Query('userId') userId?: string, @Query() q?: PaginationQueryDto) {
    return this.consent.getConsentLogs({ userId, limit: q?.limit, offset: ((q?.page ?? 1) - 1) * (q?.limit ?? 50) });
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Immutable compliance audit logs' })
  async auditLogs(@Query('category') category?: string, @Query('actorId') actorId?: string, @Query() q?: PaginationQueryDto) {
    return this.audit.list({ category, actorId, limit: q?.limit, offset: ((q?.page ?? 1) - 1) * (q?.limit ?? 50) });
  }

  @Get('legal-holds')
  @ApiOperation({ summary: 'Retention policies under legal hold' })
  async legalHolds() {
    const policies = await this.retention.listPolicies();
    return policies.filter((p) => !p.enabled && p.legalHoldCapable);
  }

  @Get('merchant-agreements')
  @ApiOperation({ summary: 'Merchant agreements' })
  async merchantAgreements() {
    return this.agreements.list({ party: AgreementParty.MERCHANT });
  }

  @Get('driver-agreements')
  @ApiOperation({ summary: 'Driver agreements' })
  async driverAgreements() {
    return this.agreements.list({ party: AgreementParty.DRIVER });
  }

  @Get('security-events')
  @ApiOperation({ summary: 'Security events/incidents' })
  async securityEvents() {
    return this.security.listIncidents();
  }

  @Post('integrity-scan')
  @ApiOperation({ summary: 'Scan compliance audit records for tampering' })
  @Permissions('compliance:write')
  async integrityScan() {
    return this.audit.scanForTampering(2000);
  }
}

