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
import { AgreementService } from './agreement.service';
import { CreateAgreementDto, AcceptAgreementDto } from './dto/legal.dto';
import { AgreementParty, DocumentStatus } from './entities/legal.enums';
import { UserRole } from '../shared/domain/user.interface';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { RolesGuard } from '../security/roles.guard';
import { PermissionGuard } from '../security/permission.guard';
import { Roles } from '../security/roles.decorator';
import { Permissions } from '../security/permissions.decorator';

@ApiTags('agreements')
@Controller('agreements')
export class AgreementController {
  constructor(private readonly service: AgreementService) {}

  @Get('current/:party/:type')
  @ApiOperation({ summary: 'Get current published agreement' })
  async getCurrent(@Param('party') party: AgreementParty, @Param('type') type: string) {
    const agreement = await this.service.getCurrent(party, type);
    if (!agreement) return null;
    return { id: agreement.id, party, type, title: agreement.title, version: agreement.version, content: agreement.content, clauses: agreement.clauses, effectiveDate: agreement.effectiveDate };
  }

  @Post()
  @ApiOperation({ summary: 'Create an agreement version (draft)' })
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Permissions('legal:write')
  async create(@Body() dto: CreateAgreementDto) {
    return this.service.create(dto);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve and publish an agreement' })
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Permissions('legal:approve')
  async approve(@Param('id') id: string, @Body() dto: { approverId: string }) {
    return this.service.approve(id, dto.approverId);
  }

  @Get()
  @ApiOperation({ summary: 'List agreements' })
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('compliance:read')
  async list(@Query('party') party?: AgreementParty, @Query('type') type?: string, @Query('status') status?: DocumentStatus) {
    return this.service.list({ party, type, status });
  }

  @Post('accept')
  @ApiOperation({ summary: 'Digitally accept an agreement' })
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  async accept(@Req() req: ExpressRequest, @Body() dto: AcceptAgreementDto) {
    return this.service.accept(dto.agreementId, { userId: dto.userId || (req as any).user?.sub, partyId: dto.partyId, partyType: dto.partyType }, { ipAddress: req.ip, userAgent: req.headers['user-agent'], signature: dto.signature });
  }

  @Get(':id/acceptances')
  @ApiOperation({ summary: 'List acceptances of an agreement' })
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('compliance:read')
  async acceptances(@Param('id') id: string) {
    return this.service.listAcceptances({ agreementId: id });
  }

  @Get('acceptances/verify/:acceptanceId')
  @ApiOperation({ summary: 'Verify a digital signature on an acceptance' })
  async verify(@Param('acceptanceId') acceptanceId: string) {
    const ok = await this.service.verifyAcceptance(acceptanceId);
    return { acceptanceId, valid: ok };
  }
}

