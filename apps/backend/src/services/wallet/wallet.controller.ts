import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { PermissionGuard } from '../../security/permission.guard';
import { Roles } from '../../security/roles.decorator';
import { Permissions } from '../../security/permissions.decorator';
import { UserRole, UserStatus } from '../../shared/domain/user.interface';

interface AuthenticatedRequest {
  user: { id: string; role: UserRole; status: UserStatus };
}

@Controller('wallet')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) { }

  @Get()
  @Roles(UserRole.CUSTOMER)
  @Permissions('wallet:read_own')
  async getWallet(@Request() req: AuthenticatedRequest) {
    return await this.walletService.getWallet(req.user.id);
  }

  @Get('balance')
  @Roles(UserRole.CUSTOMER)
  @Permissions('wallet:read_own')
  async getBalance(@Request() req: AuthenticatedRequest) {
    return await this.walletService.getWalletBalance(req.user.id);
  }

  @Get('transactions')
  @Roles(UserRole.CUSTOMER)
  @Permissions('wallet:read_own')
  async getTransactions(
    @Request() req: AuthenticatedRequest,
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ) {
    return await this.walletService.getWalletTransactions(req.user.id, limit, offset);
  }

  @Post('credit')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE_STAFF)
  @Permissions('finance:read')
  async creditWallet(
    @Request() req: AuthenticatedRequest,
    @Body('amount') amount: number,
    @Body('description') description: string,
    @Body('referenceId') referenceId?: string,
  ) {
    return await this.walletService.creditWallet(
      req.user.id,
      amount,
      description,
      referenceId,
    );
  }

  @Post('debit')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE_STAFF)
  @Permissions('finance:read')
  async debitWallet(
    @Request() req: AuthenticatedRequest,
    @Body('amount') amount: number,
    @Body('description') description: string,
    @Body('referenceId') referenceId?: string,
  ) {
    return await this.walletService.debitWallet(
      req.user.id,
      amount,
      description,
      referenceId,
    );
  }

  @Post('compensate')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE_STAFF)
  @Permissions('finance:read')
  async compensateUser(
    @Request() req: AuthenticatedRequest,
    @Body('amount') amount: number,
    @Body('reason') reason: string,
  ) {
    return await this.walletService.compensateUser(req.user.id, amount, reason);
  }

  @Post('cod/process')
  @Roles(UserRole.CUSTOMER)
  @Permissions('wallet:transact_own')
  async processCODPayment(
    @Request() req: AuthenticatedRequest,
    @Body('orderId') orderId: string,
    @Body('amount') amount: string | number,
  ) {
    return await this.walletService.processCODPayment(orderId, amount, req.user.id);
  }

  @Post('cod/confirm')
  @Roles(UserRole.DELIVERY_PARTNER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('deliveries:manage_assigned')
  async confirmCODCollection(
    @Request() req: AuthenticatedRequest,
    @Body('orderId') orderId: string,
    @Body('amount') amount: string | number,
  ) {
    return await this.walletService.confirmCODCollection(orderId, amount, req.user.id);
  }

  @Post('cod/refund')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE_STAFF)
  @Permissions('finance:read')
  async refundCOD(
    @Request() req: AuthenticatedRequest,
    @Body('orderId') orderId: string,
    @Body('amount') amount: string | number,
    @Body('reason') reason: string,
  ) {
    return await this.walletService.refundCOD(orderId, amount, req.user.id, reason);
  }

  @Post('prevent-duplicate')
  @Roles(UserRole.CUSTOMER)
  @Permissions('wallet:transact_own')
  async preventDuplicatePayment(
    @Request() req: AuthenticatedRequest,
    @Body('orderId') orderId: string,
    @Body('amount') amount: number,
  ) {
    const isAllowed = await this.walletService.preventDoublePayment(
      req.user.id,
      orderId,
      amount,
    );
    return { allowed: isAllowed };
  }
}