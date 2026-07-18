import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { type Request as ExpressRequest } from 'express';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { LegalDocumentService } from './legal-document.service';
import { ConsentService } from './consent.service';
import { LegalSeedService } from './legal-seed.service';
import { RetentionService } from './retention.service';
import {
  CreateDocumentDto,
  CreateVersionDto,
  ApproveVersionDto,
  AcceptDocumentDto,
  RecordConsentDto,
  PaginationQueryDto,
} from './dto/legal.dto';
import { LegalDocumentType, DocumentStatus, ApprovalStatus, ConsentCategory, Regulation } from './entities/legal.enums';
import { UserRole } from '../shared/domain/user.interface';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { RolesGuard } from '../security/roles.guard';
import { PermissionGuard } from '../security/permission.guard';
import { Roles } from '../security/roles.decorator';
import { Permissions } from '../security/permissions.decorator';
import { ComplianceAuditService } from './compliance-audit.service';

@ApiTags('legal')
@Controller('legal')
export class LegalController {
  constructor(
    private readonly documentService: LegalDocumentService,
    private readonly consentService: ConsentService,
    private readonly seedService: LegalSeedService,
    private readonly retentionService: RetentionService,
    private readonly audit: ComplianceAuditService,
  ) {}

  @Get('center')
  @ApiOperation({ summary: 'List all legal documents in the Legal Center' })
  async legalCenter(@Query('language') language = 'en') {
    const docs = await this.documentService.listDocuments({ status: DocumentStatus.PUBLISHED });
    return {
      categories: [
        'policies',
        'agreements',
        'security',
        'transparency',
      ],
      documents: docs.map((d) => ({
        type: d.type,
        title: d.title,
        slug: d.slug,
        currentVersion: d.currentVersion,
        lastUpdated: d.updatedAt,
        language,
      })),
    };
  }

  @Get('documents/:type')
  @ApiOperation({ summary: 'Get published legal document by type' })
  @ApiParam({ name: 'type', enum: LegalDocumentType })
  async getDocument(@Param('type') type: LegalDocumentType, @Query('language') language = 'en') {
    const published = await this.documentService.getPublishedVersion(type, language);
    if (!published) {
      const doc = await this.documentService.getDocument(type).catch(() => null);
      if (!doc) throw new NotFoundException('Document not found');
      throw new NotFoundException('No published version available');
    }
    return {
      type: published.document.type,
      title: published.version.title,
      version: published.version.version,
      currentVersionId: published.version.id,
      id: published.document.id,
      effectiveDate: published.version.effectiveDate,
      lastUpdated: published.version.updatedAt,
      language: published.version.language,
      sections: published.version.sections,
      summary: published.version.summary,
    };
  }

  @Get('documents/:type/versions')
  @ApiOperation({ summary: 'Version history for a document' })
  async versionHistory(@Param('type') type: LegalDocumentType, @Query('language') language?: string) {
    const doc = await this.documentService.getDocument(type);
    const versions = await this.documentService.listVersions(doc.id, language);
    return {
      document: doc.type,
      currentVersion: doc.currentVersion,
      versions: versions.map((v) => ({
        id: v.id,
        version: v.version,
        title: v.title,
        approvalStatus: v.approvalStatus,
        language: v.language,
        effectiveDate: v.effectiveDate,
        changeNotes: v.changeNotes,
        createdAt: v.createdAt,
      })),
    };
  }

  @Post('documents')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Permissions('legal:write')
  @ApiOperation({ summary: 'Create a legal document (draft)' })
  async createDocument(@Body() dto: CreateDocumentDto) {
    return this.documentService.createDocument(dto);
  }

  @Post('documents/:documentId/versions')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Permissions('legal:write')
  @ApiOperation({ summary: 'Create a new draft version' })
  async createVersion(@Param('documentId') documentId: string, @Body() dto: CreateVersionDto) {
    return this.documentService.createVersion(documentId, dto);
  }

  @Post('versions/:versionId/approve')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Permissions('legal:approve')
  @ApiOperation({ summary: 'Approve a version' })
  async approveVersion(@Param('versionId') versionId: string, @Body() dto: ApproveVersionDto) {
    return this.documentService.approveVersion(versionId, dto.approverId, dto.notes);
  }

  @Post('versions/:versionId/publish')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Permissions('legal:publish')
  @ApiOperation({ summary: 'Publish a version' })
  async publishVersion(@Param('versionId') versionId: string, @Body() dto: ApproveVersionDto) {
    return this.documentService.publishVersion(versionId, dto.approverId);
  }

  @Post('versions/:versionId/rollback')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Permissions('legal:publish')
  @ApiOperation({ summary: 'Rollback to a prior version' })
  async rollback(@Param('versionId') versionId: string, @Body() dto: ApproveVersionDto) {
    const version = await this.documentService.getVersion(versionId);
    return this.documentService.rollback(version.documentId, versionId, dto.approverId);
  }

  @Post('accept')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @ApiOperation({ summary: 'Accept a legal document version' })
  async acceptDocument(@Req() req: ExpressRequestWithUser, @Body() dto: AcceptDocumentDto) {
    const ctx = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      method: dto.method || 'click_accept',
    };
    return this.documentService.acceptDocument(req.user!.sub!, dto.documentId, dto.versionId, ctx);
  }

  @Get('me/acceptances')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @ApiOperation({ summary: 'Current user document acceptances' })
  async myAcceptances(@Req() req: ExpressRequestWithUser) {
    return this.documentService.getUserAcceptances(req.user!.sub!);
  }

  @Get('required')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @ApiOperation({ summary: 'Documents the user still needs to accept' })
  async requiredAcceptances(@Req() req: ExpressRequestWithUser) {
    const all = await this.documentService.listDocuments({ status: DocumentStatus.PUBLISHED });
    const required = all.filter((d) => d.requiresAcceptance);
    const pending = [];
    for (const doc of required) {
      const ok = await this.documentService.hasAcceptedCurrent(req.user!.sub!, doc.type);
      if (!ok) pending.push({ type: doc.type, title: doc.title, currentVersion: doc.currentVersion });
    }
    return { pending };
  }

  // ---- Cookie Consent ----
  @Post('consent')
  @ApiOperation({ summary: 'Record cookie/consent preferences' })
  async recordConsent(@Req() req: ExpressRequest, @Body() dto: RecordConsentDto) {
    if (!dto.userId && !dto.anonymousToken) {
      dto.anonymousToken = require('crypto').randomUUID();
    }
    const consent = await this.consentService.recordConsent({
      ...dto,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return { consentId: consent.id, region: consent.region, version: consent.consentVersion };
  }

  @Post('consent/:consentId/withdraw')
  @ApiOperation({ summary: 'Withdraw consent' })
  async withdrawConsent(@Req() req: ExpressRequest, @Param('consentId') consentId: string, @Body() body: { userId?: string }) {
    return this.consentService.withdrawConsent(consentId, body.userId);
  }

  @Get('consent/active')
  @ApiOperation({ summary: 'Get active consent for user or token' })
  async getActiveConsent(@Query('userId') userId?: string, @Query('token') token?: string) {
    if (userId) return this.consentService.getActiveConsent(userId, true);
    if (token) return this.consentService.getActiveConsent(token, false);
    return null;
  }

  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'category', required: false, enum: ConsentCategory })
  @Get('consent/logs')
  @ApiOperation({ summary: 'Consent audit logs' })
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('compliance:read')
  async consentLogs(@Query('userId') userId?: string, @Query('category') category?: ConsentCategory, @Query() q?: PaginationQueryDto) {
    return this.consentService.getConsentLogs({ userId, category, limit: q?.limit, offset: ((q?.page ?? 1) - 1) * (q?.limit ?? 50) });
  }

  @Get('cookie-registry')
  @ApiOperation({ summary: 'Current cookie registry' })
  async cookieRegistry() {
    return this.consentService.getCookieRegistry();
  }

  @Post('seed')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Permissions('legal:publish')
  @ApiOperation({ summary: 'Seed production legal documents (idempotent)' })
  async seed() {
    return this.seedService.seedAll();
  }

  @Post('retention/seed')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Permissions('compliance:write')
  @ApiOperation({ summary: 'Seed default retention policies' })
  async seedRetention() {
    const created = await this.retentionService.seedDefaults();
    return { created };
  }
}

function UseGuardsJwt() {
  return UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard);
}

interface ExpressRequestWithUser extends ExpressRequest {
  user?: { sub?: string; role?: UserRole };
}


