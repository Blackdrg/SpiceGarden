import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { Roles } from '../../security/roles.decorator';
import { UserRole } from '../../shared/domain/user.interface';

interface AuthenticatedRequest {
  user: { id: string };
}

@Controller('wallet')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
export class WalletController {
  constructor(private readonly walletService: WalletService) { }

  @Get()
  async getWallet(@Request() req: AuthenticatedRequest) {
    return await this.walletService.getWallet(req.user.id);
  }

  @Get('balance')
  async getBalance(@Request() req: AuthenticatedRequest) {
    return await this.walletService.getWalletBalance(req.user.id);
  }

  @Get('transactions')
  async getTransactions(
    @Request() req: AuthenticatedRequest,
    @Body('limit') limit: number = 20,
    @Body('offset') offset: number = 0,
  ) {
    return await this.walletService.getWalletTransactions(req.user.id, limit, offset);
  }

  @Post('credit')
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
  async compensateUser(
    @Request() req: AuthenticatedRequest,
    @Body('amount') amount: number,
    @Body('reason') reason: string,
  ) {
    return await this.walletService.compensateUser(req.user.id, amount, reason);
  }

  @Post('cod/process')
  async processCODPayment(
    @Request() req: AuthenticatedRequest,
    @Body('orderId') orderId: string,
    @Body('amount') amount: string | number,
  ) {
    return await this.walletService.processCODPayment(orderId, amount, req.user.id);
  }

  @Post('cod/confirm')
  async confirmCODCollection(
    @Request() req: AuthenticatedRequest,
    @Body('orderId') orderId: string,
    @Body('amount') amount: string | number,
  ) {
    return await this.walletService.confirmCODCollection(orderId, amount, req.user.id);
  }

  @Post('cod/refund')
  async refundCOD(
    @Request() req: AuthenticatedRequest,
    @Body('orderId') orderId: string,
    @Body('amount') amount: string | number,
    @Body('reason') reason: string,
  ) {
    return await this.walletService.refundCOD(orderId, amount, req.user.id, reason);
  }

  @Post('prevent-duplicate')
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