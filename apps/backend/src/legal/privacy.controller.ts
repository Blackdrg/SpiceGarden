import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  Res,
  ForbiddenException,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { type Request as ExpressRequest, type Response as ExpressResponse } from 'express';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DataSubjectRequestService } from './data-subject-request.service';
import { ConsentService } from './consent.service';
import { GrievanceService } from './grievance.service';
import { CreateRequestDto, ReviewRequestDto, CreateExportDto, PaginationQueryDto } from './dto/legal.dto';
import {
  DataRequestType,
  DataRequestStatus,
  Regulation,
  ExportFormat,
} from './entities/legal.enums';
import { UserRole } from '../shared/domain/user.interface';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { RolesGuard } from '../security/roles.guard';
import { PermissionGuard } from '../security/permission.guard';
import { Roles } from '../security/roles.decorator';
import { Permissions } from '../security/permissions.decorator';

interface ReqUser extends ExpressRequest {
  user?: { sub?: string; role?: UserRole };
}

@ApiTags('privacy')
@Controller('privacy')
export class PrivacyController {
  constructor(
    private readonly dsr: DataSubjectRequestService,
    private readonly consent: ConsentService,
    private readonly grievanceService: GrievanceService,
  ) {}

  private owns(req: ReqUser, userId: string): boolean {
    const u = req.user;
    if (!u) return false;
    return u.sub === userId || [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(u.role!);
  }

  // ---- GDPR / DPDP data subject requests ----
  @Post('requests')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @ApiOperation({ summary: 'Submit a data subject request (access, delete, correct, etc.)' })
  async createRequest(@Req() req: ReqUser, @Body() dto: CreateRequestDto) {
    if (!this.owns(req, dto.userId)) throw new ForbiddenException();
    return this.dsr.createRequest(dto);
  }

  @Get('requests')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @ApiOperation({ summary: 'List data subject requests (self or admin)' })
  async listRequests(@Req() req: ReqUser, @Query() q: PaginationQueryDto, @Query('status') status?: DataRequestStatus, @Query('type') type?: DataRequestType, @Query('regulation') regulation?: Regulation) {
    const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(req.user!.role!);
    const userId = isAdmin ? q.search : req.user!.sub!;
    return this.dsr.listRequests({ userId, status, type, regulation, limit: q.limit, offset: (q.page! - 1) * q.limit! });
  }

  @Get('requests/:id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @ApiOperation({ summary: 'Get a data subject request' })
  async getRequest(@Req() req: ReqUser, @Param('id') id: string) {
    const r = await this.dsr.getRequest(id);
    if (!this.owns(req, r.userId)) throw new ForbiddenException();
    return r;
  }

  @Post('requests/:id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @ApiOperation({ summary: 'Cancel a pending request' })
  async cancel(@Req() req: ReqUser, @Param('id') id: string, @Body() body: { reason?: string }) {
    const r = await this.dsr.getRequest(id);
    if (!this.owns(req, r.userId)) throw new ForbiddenException();
    return this.dsr.cancel(id, req.user!.sub!, body.reason);
  }

  @Post('requests/:id/review')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('compliance:write')
  @ApiOperation({ summary: 'Review (approve/reject) a request' })
  async review(@Param('id') id: string, @Body() dto: ReviewRequestDto) {
    return this.dsr.review(id, dto.reviewerId, dto.decision, dto.notes);
  }

  // ---- Exports ----
  @Post('exports')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @ApiOperation({ summary: 'Create a data export (JSON/CSV/PDF)' })
  async createExport(@Req() req: ReqUser, @Body() dto: CreateExportDto) {
    if (!this.owns(req, dto.userId)) throw new ForbiddenException();
    return this.dsr.createExport(dto.userId, { regulation: dto.regulation, format: dto.format, requestId: dto.requestId });
  }

  @Get('exports/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @ApiOperation({ summary: 'List exports for a user' })
  async listExports(@Req() req: ReqUser, @Param('userId') userId: string) {
    if (!this.owns(req, userId)) throw new ForbiddenException();
    return this.dsr.listExports(userId);
  }

  @Get('exports/:exportId/download')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @ApiOperation({ summary: 'Download a generated data export (right to portability)' })
  async downloadExport(
    @Req() req: ReqUser,
    @Param('exportId') exportId: string,
    @Res() res: ExpressResponse,
  ) {
    const record = await this.dsr.getExport(exportId);
    if (!this.owns(req, record.userId)) throw new ForbiddenException();
    const { content, contentType, filename } = await this.dsr.generateExportContent(exportId);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(content);
  }

  @Get('export-preview/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @ApiOperation({ summary: 'Preview export payload (right to access)' })
  async preview(@Req() req: ReqUser, @Param('userId') userId: string) {
    if (!this.owns(req, userId)) throw new ForbiddenException();
    const payload = await this.dsr.buildExportPayload(userId);
    return { preview: true, sections: Object.keys(payload.sections), exportedAt: payload.exportedAt };
  }

  // ---- User Privacy Dashboard ----
  @Get('dashboard/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @ApiOperation({ summary: 'Privacy dashboard summary for a user' })
  async dashboard(@Req() req: ReqUser, @Param('userId') userId: string) {
    if (!this.owns(req, userId)) throw new ForbiddenException();
    const [consent, requests, exports] = await Promise.all([
      this.consent.getActiveConsent(userId, true),
      this.dsr.listRequests({ userId, limit: 10 }),
      this.dsr.listExports(userId),
    ]);
    return {
      userId,
      consent: consent ? { version: consent.consentVersion, analytics: consent.analytics, marketing: consent.marketing } : null,
      activeRequests: requests.filter((r) => ['pending', 'in_review', 'approved', 'processing'].includes(r.status)).length,
      exportsAvailable: exports.filter((e) => e.status === DataRequestStatus.COMPLETED).length,
      dpdpOfficer: this.grievanceService.getOfficer(),
      consentManager: this.grievanceService.getConsentManager(),
    };
  }

  // ---- DPDP ----
  @Post('dpdp/grievances')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @ApiOperation({ summary: 'Submit a DPDP grievance' })
  async grievance(@Req() req: ReqUser, @Body() dto: { subject: string; description: string; complainantName?: string; complainantEmail?: string; complainantPhone?: string }) {
    return this.grievanceService.create({ userId: req.user!.sub!, regulation: 'dpdp', ...dto });
  }

  @Get('dpdp/officer')
  @ApiOperation({ summary: 'DPDP Grievance Officer and Consent Manager info' })
  async dpdpInfo() {
    return { officer: this.grievanceService.getOfficer(), consentManager: this.grievanceService.getConsentManager() };
  }

  @Post('consent/withdraw-all')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @ApiOperation({ summary: 'Withdraw all non-essential consent (DPDP consent withdrawal)' })
  async withdrawAll(@Req() req: ReqUser, @Body() body: { consentId: string }) {
    return this.consent.withdrawConsent(body.consentId, req.user!.sub);
  }
}

