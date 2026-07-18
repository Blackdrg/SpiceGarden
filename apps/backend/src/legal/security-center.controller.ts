import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { type Request as ExpressRequest } from 'express';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { SecurityCenterService } from './security-center.service';
import { ReportIncidentDto, UpdateIncidentDto, PaginationQueryDto } from './dto/legal.dto';
import { SecurityIncidentStatus, SecurityIncidentSeverity } from './entities/legal.enums';
import { UserRole } from '../shared/domain/user.interface';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { RolesGuard } from '../security/roles.guard';
import { PermissionGuard } from '../security/permission.guard';
import { Roles } from '../security/roles.decorator';
import { Permissions } from '../security/permissions.decorator';

@ApiTags('security-center')
@Controller('security-center')
export class SecurityCenterController {
  constructor(private readonly service: SecurityCenterService) {}

  @Get('contact')
  @ApiOperation({ summary: 'Security contact, PGP key, bug bounty info' })
  async contact() {
    return this.service.getContact();
  }

  @Get('changelog')
  @ApiOperation({ summary: 'Security changelog' })
  async changelog() {
    return this.service.getChangelog();
  }

  @Get('incident-response')
  @ApiOperation({ summary: 'Incident response policy' })
  async incidentResponse() {
    return this.service.getIncidentResponsePolicy();
  }

  @Get('patch-policy')
  @ApiOperation({ summary: 'Patch management policy' })
  async patchPolicy() {
    return this.service.getPatchPolicy();
  }

  @Get('encryption-policy')
  @ApiOperation({ summary: 'Encryption policy' })
  async encryptionPolicy() {
    return this.service.getEncryptionPolicy();
  }

  @Get('soc-reports')
  @ApiOperation({ summary: 'SOC / compliance reports' })
  async socReports() {
    return this.service.getSocReports();
  }

  @Get('faqs')
  @ApiOperation({ summary: 'Security FAQs' })
  async faqs() {
    return this.service.getSecurityFaqs();
  }

  @Get('report')
  @ApiOperation({ summary: 'Security posture report' })
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('compliance:read')
  async report() {
    return this.service.generateSecurityReport();
  }

  @Post('incidents')
  @ApiOperation({ summary: 'Report a security incident / vulnerability' })
  async reportIncident(@Req() req: ExpressRequest, @Body() dto: ReportIncidentDto) {
    return this.service.reportIncident({ ...dto, reporterId: (req as any).user?.sub });
  }

  @Get('incidents')
  @ApiOperation({ summary: 'List security incidents' })
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT_STAFF)
  @Permissions('compliance:read')
  async listIncidents(@Query('status') status?: SecurityIncidentStatus, @Query('severity') severity?: SecurityIncidentSeverity, @Query('public') pub?: string) {
    return this.service.listIncidents({ status, severity, publiclyDisclosed: pub === 'true' ? true : pub === 'false' ? false : undefined });
  }

  @Get('incidents/public')
  @ApiOperation({ summary: 'Publicly disclosed incidents' })
  async publicIncidents() {
    return this.service.listIncidents({ publiclyDisclosed: true });
  }

  @Get('incidents/:id')
  @ApiOperation({ summary: 'Get incident detail' })
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT_STAFF)
  @Permissions('compliance:read')
  async getIncident(@Param('id') id: string) {
    return this.service.getIncident(id);
  }

  @Post('incidents/:id')
  @ApiOperation({ summary: 'Update incident (status, remediation, disclosure)' })
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('compliance:write')
  async updateIncident(@Param('id') id: string, @Body() dto: UpdateIncidentDto) {
    return this.service.updateIncident(id, dto);
  }
}

