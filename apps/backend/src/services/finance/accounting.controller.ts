import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AccountingService } from './accounting.service';

@Controller('finance/accounting')
@ApiTags('Accounting')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Post('journal')
  @ApiOperation({ summary: 'Post journal entry' })
  async postJournal(@Body() entries: any[]) {
    return this.accountingService.postJournalEntry(entries);
  }

  @Post('journal/reverse/:transactionId')
  @ApiOperation({ summary: 'Reverse journal entry' })
  async reverseJournal(@Param('transactionId') transactionId: string, @Body() body: { reversedBy: string }) {
    return this.accountingService.reverseJournalEntry(transactionId, body.reversedBy);
  }

  @Get('trial-balance')
  @ApiOperation({ summary: 'Get trial balance' })
  async getTrialBalance(@Body() body: { startDate: string; endDate: string }) {
    return this.accountingService.getTrialBalance(new Date(body.startDate), new Date(body.endDate));
  }

  @Get('profit-loss')
  @ApiOperation({ summary: 'Get profit and loss' })
  async getProfitLoss(@Body() body: { startDate: string; endDate: string }) {
    return this.accountingService.getProfitAndLoss(new Date(body.startDate), new Date(body.endDate));
  }

  @Get('journal-entries')
  @ApiOperation({ summary: 'Get journal entries' })
  async getJournalEntries(@Body() body?: any) {
    return this.accountingService.getJournalEntries(body);
  }
}
