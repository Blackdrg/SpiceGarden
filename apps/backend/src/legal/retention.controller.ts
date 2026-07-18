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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RetentionService } from './retention.service';
import { RetentionPolicyDto, PaginationQueryDto } from './dto/legal.dto';
import { RetentionJobStatus } from './entities/legal.enums';
import { UserRole } from '../shared/domain/user.interface';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { RolesGuard } from '../security/roles.guard';
import { PermissionGuard } from '../security/permission.guard';
import { Roles } from '../security/roles.decorator';
import { Permissions } from '../security/permissions.decorator';

@ApiTags('retention')
@Controller('retention')
export class RetentionController {
  constructor(private readonly retention: RetentionService) {}

  @Get('policies')
  @ApiOperation({ summary: 'List retention policies' })
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('compliance:read')
  async policies() {
    return this.retention.listPolicies();
  }

  @Post('policies')
  @ApiOperation({ summary: 'Create or update a retention policy' })
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Permissions('compliance:write')
  async upsert(@Body() dto: RetentionPolicyDto) {
    return this.retention.upsertPolicy(dto);
  }

  @Post('policies/:key/legal-hold')
  @ApiOperation({ summary: 'Toggle legal hold on a policy' })
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Permissions('compliance:write')
  async legalHold(@Param('key') key: string, @Body() dto: { hold: boolean }) {
    return this.retention.setLegalHold(key, dto.hold);
  }

  @Post('policies/:key/run')
  @ApiOperation({ summary: 'Run a single retention policy' })
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Permissions('compliance:write')
  async run(@Param('key') key: string, @Req() req: ExpressRequest) {
    return this.retention.runPolicy(key, (req as any).user?.sub || 'admin');
  }

  @Post('run-all')
  @ApiOperation({ summary: 'Run all enabled retention policies' })
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Permissions('compliance:write')
  async runAll(@Req() req: ExpressRequest) {
    return this.retention.runAllEnabled((req as any).user?.sub || 'scheduler');
  }

  @Get('jobs')
  @ApiOperation({ summary: 'List retention jobs' })
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('compliance:read')
  async jobs(@Query('status') status?: RetentionJobStatus, @Query() q?: PaginationQueryDto) {
    return this.retention.listJobs({ status, limit: q?.limit });
  }
}

