import { Controller, Post, Get, Body, Param, UseGuards, Request, Put } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BankAccountService } from './bank-account.service';

@Controller('finance/bank-accounts')
@ApiTags('Bank Accounts')
export class BankAccountController {
  constructor(private readonly bankAccountService: BankAccountService) {}

  @Post()
  @ApiOperation({ summary: 'Add bank account' })
  async addBankAccount(@Body() bankData: any) {
    return this.bankAccountService.addBankAccount(bankData);
  }

  @Get(':entityType/:entityId')
  @ApiOperation({ summary: 'Get bank accounts for entity' })
  async getBankAccounts(@Param('entityType') entityType: string, @Param('entityId') entityId: string) {
    return this.bankAccountService.getBankAccounts(entityType, entityId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bank account details' })
  async getBankAccount(@Param('id') id: string) {
    return this.bankAccountService.getBankAccount(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update bank account' })
  async updateBankAccount(@Param('id') id: string, @Body() updateData: any) {
    return this.bankAccountService.updateBankAccount(id, updateData);
  }

  @Post(':id/kyc')
  @ApiOperation({ summary: 'Submit KYC documents' })
  async submitKyc(@Param('id') id: string, @Body() body: { documents: any }) {
    return this.bankAccountService.submitKyc(id, body.documents);
  }

  @Post(':id/verify')
  @ApiOperation({ summary: 'Verify bank account' })
  async verify(@Param('id') id: string, @Body() body: { verifiedBy: string }) {
    return this.bankAccountService.verifyBankAccount(id, body.verifiedBy);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject KYC' })
  async rejectKyc(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.bankAccountService.rejectKyc(id, body.reason);
  }

  @Get('kyc/pending')
  @ApiOperation({ summary: 'Get pending KYC verifications' })
  async getPendingKyc() {
    return this.bankAccountService.getPendingKyc();
  }
}
