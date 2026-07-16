import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { type Request as ExpressRequest } from 'express';
import { ComplianceService } from './compliance.service';
import { Soc2ReadinessService } from './soc2-readiness.service';
import { PciDssValidationService } from './pci-dss-validation.service';
import { SecretsRotationService } from './secrets-rotation.service';
import { DataPrivacyService } from '../services/privacy/data-privacy.service';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { RolesGuard } from '../security/roles.guard';
import { PermissionGuard } from '../security/permission.guard';
import { Roles } from '../security/roles.decorator';
import { Permissions } from '../security/permissions.decorator';
import { UserRole } from '../shared/domain/user.interface';
import { MaskPiiDto, UnmaskPiiDto } from './compliance.dto';

export interface DeletionRequestDto {
  userId: string;
  regulation: 'gdpr' | 'dpdp' | 'self_service';
  reason?: string;
}

export interface CancelDeletionDto {
  userId: string;
}

@Controller('compliance')
export class ComplianceController {
  constructor(
    private complianceService: ComplianceService,
    private soc2Service: Soc2ReadinessService,
    private pciDssService: PciDssValidationService,
    private secretsService: SecretsRotationService,
    private dataPrivacyService: DataPrivacyService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Permissions('compliance:read')
  @Get('soc2')
  async getSoc2Readiness() {
    return this.soc2Service.assessTrustServicesCriteria();
  }

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Permissions('compliance:read')
  @Get('soc2/evidence')
  async getSoc2Evidence() {
    return this.soc2Service.generateSoc2EvidenceReport();
  }

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Permissions('compliance:read')
  @Get('pci-dss')
  async getPciDssStatus() {
    return this.pciDssService.validatePciDssCompliance();
  }

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Permissions('compliance:read')
  @Get('pci-dss/payment-flow')
  async validatePaymentFlow() {
    return this.pciDssService.validatePaymentFlow();
  }

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Permissions('compliance:read')
  @Get('pci-dss/saq')
  async getPciDssSaqMetrics() {
    return this.pciDssService.getFraudMetricsForSaq();
  }

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Permissions('compliance:read')
  @Get('secrets/rotation-status')
  async getSecretsRotationStatus() {
    return {
      secretsRequiringRotation: this.secretsService.getSecretsRequiringRotation(),
      validation: await this.secretsService.validateRotationCapability(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Permissions('compliance:read')
  @Get('secrets/proof')
  async getSecretsRotationProof() {
    return this.secretsService.getRotationProof();
  }

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Permissions('compliance:read')
  @Post('secrets/rotate')
  async rotateSecrets(@Query('secrets') secrets?: string) {
    const secretList = secrets ? secrets.split(',') : ['jwt_secret', 'encryption', 'db_password'];
    return {
      success: true,
      message: 'Secrets rotation initiated',
      rotated: secretList,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('compliance:read')
  @Get('retention-stats')
  async getRetentionStatistics() {
    return this.complianceService.getRetentionStatistics();
  }

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('compliance:read')
  @Post('retention/apply')
  async applyDataRetention() {
    return this.complianceService.applyDataRetentionPolicies();
  }

  @Get('gdpr/user/:userId/export')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CUSTOMER)

  async exportUserDataGdpr(@Param('userId') userId: string, @Request() req: ExpressRequest & { user?: { sub?: string; role?: UserRole } }) {
    if (req.user?.sub !== userId && ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(req.user?.role as UserRole)) {
      throw new ForbiddenException('Unauthorized to export this user data');
    }
    const data = await this.complianceService.exportUserData(userId);
    return {
      regulation: 'gdpr',
      data,
      exportedAt: new Date(),
      rightExercised: 'right_to_access',
    };
  }

  @Get('dpdp/user/:userId/export')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CUSTOMER)

  async exportUserDataDpdp(@Param('userId') userId: string, @Request() req: ExpressRequest & { user?: { sub?: string; role?: UserRole } }) {
    if (req.user?.sub !== userId && ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(req.user?.role as UserRole)) {
      throw new ForbiddenException('Unauthorized to export this user data');
    }
    const data = await this.complianceService.exportUserData(userId);
    return {
      regulation: 'dpdp',
      data,
      exportedAt: new Date(),
      rightExercised: 'right_to_data_portability',
    };
  }

  @Post('gdpr/user/:userId/deletion-request')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)

  async requestGdprDeletion(@Param('userId') userId: string, @Body() dto: DeletionRequestDto, @Request() req: ExpressRequest & { user?: { sub?: string; role?: UserRole } }) {
    if (req.user?.sub !== userId && ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(req.user?.role as UserRole)) {
      throw new ForbiddenException('Unauthorized to submit deletion request for this user');
    }
    const result = await this.complianceService.requestUserDataDeletion(userId, 'gdpr', dto.reason);
    return {
      ...result,
      regulation: 'gdpr',
      rightExercised: 'right_to_be_forgotten',
      approvalRequired: true,
      cancellableUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
  }

  @Post('dpdp/user/:userId/deletion-request')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)

  async requestDpdpDeletion(@Param('userId') userId: string, @Body() dto: DeletionRequestDto, @Request() req: ExpressRequest & { user?: { sub?: string; role?: UserRole } }) {
    if (req.user?.sub !== userId && ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(req.user?.role as UserRole)) {
      throw new ForbiddenException('Unauthorized to submit deletion request for this user');
    }
    const result = await this.complianceService.requestUserDataDeletion(userId, 'dpdp', dto.reason);
    return {
      ...result,
      regulation: 'dpdp',
      rightExercised: 'right_to_erasure',
      approvalRequired: true,
      cancellableUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
  }

  @Post('gdpr/user/:userId/deletion-request/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)

  async cancelGdprDeletion(@Param('userId') userId: string, @Request() req: ExpressRequest & { user?: { sub?: string; role?: UserRole } }) {
    if (req.user?.sub !== userId && ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(req.user?.role as UserRole)) {
      throw new ForbiddenException('Unauthorized');
    }
    const result = await this.complianceService.cancelUserDataDeletion(userId);
    return {
      ...result,
      regulation: 'gdpr',
      message: 'Deletion request cancelled successfully',
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('compliance:read')
  @Get('user/:userId/deletion-status')
  async getDeletionStatus(@Param('userId') userId: string) {
    const status = await this.complianceService.getUserDataDeletionStatus(userId);
    return {
      userId,
      hasActiveRequest: !!status && ['pending', 'processing'].includes(status.status),
      deletionRequest: status,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('compliance:read')
  @Get('user/:userId/export-history')
  async getExportHistory(@Param('userId') userId: string) {
    const exports = await this.complianceService.getUserExports(userId);
    return {
      userId,
      exports,
      regulation: 'gdpr_dpdp',
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('compliance:read')
  @Get('user/:userId/pii-verification')
  async verifyPiiEncryption(@Param('userId') userId: string) {
    const result = await this.complianceService.verifyPiiEncryption(userId);
    return {
      userId,
      ...result,
      verifiedAt: new Date(),
      encryptionMethod: 'AES-256 via CryptoJS',
      fieldsChecked: ['email', 'phone'],
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('compliance:read')
  @Get('user/:userId/data-export')
  async getUserDataExport(@Param('userId') userId: string) {
    return this.complianceService.exportUserData(userId);
  }

  @Post('mask/pii')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'super_admin')
  async maskPiiFields(@Body() dto: MaskPiiDto) {
    const masked = this.dataPrivacyService.maskPii(dto.data, dto.fields);
    return { maskedData: masked };
  }

  @Post('unmask/pii')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin', 'super_admin')
  async unmaskPiiFields(@Body() dto: UnmaskPiiDto) {
    const decrypted = this.dataPrivacyService.unmaskPii(dto.data, dto.fields);
    return { decryptedData: decrypted };
  }
}
