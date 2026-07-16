import { Controller, Post, Get, Body, Param, UseGuards, Request, Put } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TenantService, TenantStatus } from './tenant.service';
import {
  CreateTenantDto,
  UpdateTenantDto,
  UpdateBrandingDto,
  UpdateSettingsDto,
  ListTenantsQueryDto,
} from './tenant.dto';

@Controller('admin/tenants')
@ApiTags('Tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @ApiOperation({ summary: 'Create tenant' })
  async create(@Body() tenantData: CreateTenantDto) {
    return this.tenantService.createTenant(tenantData);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by ID' })
  async getTenant(@Param('id') id: string) {
    return this.tenantService.getTenantById(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get tenant by slug' })
  async getTenantBySlug(@Param('slug') slug: string) {
    return this.tenantService.getTenant(slug);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update tenant' })
  async updateTenant(@Param('id') id: string, @Body() updateData: UpdateTenantDto) {
    return this.tenantService.updateTenant(id, updateData);
  }

  @Post(':id/suspend')
  @ApiOperation({ summary: 'Suspend tenant' })
  async suspend(@Param('id') id: string) {
    return this.tenantService.suspendTenant(id);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate tenant' })
  async activate(@Param('id') id: string) {
    return this.tenantService.activateTenant(id);
  }

  @Get()
  @ApiOperation({ summary: 'List tenants' })
  async listTenants(@Body() body: ListTenantsQueryDto) {
    return this.tenantService.listTenants(body as any);
  }

  @Put(':id/branding')
  @ApiOperation({ summary: 'Update tenant branding' })
  async updateBranding(@Param('id') id: string, @Body() branding: UpdateBrandingDto) {
    return this.tenantService.updateBranding(id, branding);
  }

  @Put(':id/settings')
  @ApiOperation({ summary: 'Update tenant settings' })
  async updateSettings(@Param('id') id: string, @Body() settings: UpdateSettingsDto) {
    return this.tenantService.updateSettings(id, settings);
  }
}
