import { Controller, Post, Get, Body, Param, UseGuards, Request, Put } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BankAccountService } from './bank-account.service';
import {
  AddBankAccountDto,
  UpdateBankAccountDto,
  SubmitKycDto,
  VerifyBankAccountDto,
  RejectKycDto,
} from './bank-account.dto';

@Controller('finance/bank-accounts')
@ApiTags('Bank Accounts')
export class BankAccountController {
  constructor(private readonly bankAccountService: BankAccountService) {}

  @Post()
  @ApiOperation({ summary: 'Add bank account' })
  async addBankAccount(@Body() bankData: AddBankAccountDto) {
    return this.bankAccountService.addBankAccount(bankData as any);
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
  async updateBankAccount(@Param('id') id: string, @Body() updateData: UpdateBankAccountDto) {
    return this.bankAccountService.updateBankAccount(id, updateData as any);
  }

  @Post(':id/kyc')
  @ApiOperation({ summary: 'Submit KYC documents' })
  async submitKyc(@Param('id') id: string, @Body() body: SubmitKycDto) {
    return this.bankAccountService.submitKyc(id, body.documents);
  }

  @Post(':id/verify')
  @ApiOperation({ summary: 'Verify bank account' })
  async verify(@Param('id') id: string, @Body() body: VerifyBankAccountDto) {
    return this.bankAccountService.verifyBankAccount(id, body.verifiedBy);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject KYC' })
  async rejectKyc(@Param('id') id: string, @Body() body: RejectKycDto) {
    return this.bankAccountService.rejectKyc(id, body.reason);
  }

  @Get('kyc/pending')
  @ApiOperation({ summary: 'Get pending KYC verifications' })
  async getPendingKyc() {
    return this.bankAccountService.getPendingKyc();
  }
}
