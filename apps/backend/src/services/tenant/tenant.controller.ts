import { Controller, Post, Get, Body, Param, UseGuards, Request, Put } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TenantService, TenantStatus } from './tenant.service';

@Controller('admin/tenants')
@ApiTags('Tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @ApiOperation({ summary: 'Create tenant' })
  async create(@Body() tenantData: any) {
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
  async updateTenant(@Param('id') id: string, @Body() updateData: any) {
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
  async listTenants(@Body() body?: { status?: TenantStatus }) {
    return this.tenantService.listTenants(body);
  }

  @Put(':id/branding')
  @ApiOperation({ summary: 'Update tenant branding' })
  async updateBranding(@Param('id') id: string, @Body() branding: any) {
    return this.tenantService.updateBranding(id, branding);
  }

  @Put(':id/settings')
  @ApiOperation({ summary: 'Update tenant settings' })
  async updateSettings(@Param('id') id: string, @Body() settings: any) {
    return this.tenantService.updateSettings(id, settings);
  }
}
