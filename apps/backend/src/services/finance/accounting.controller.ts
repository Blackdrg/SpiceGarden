import { Controller, Post, Get, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AccountingService } from './accounting.service';
import {
  PostJournalEntryDto,
  ReverseJournalEntryDto,
  TrialBalanceQueryDto,
  ProfitLossQueryDto,
  GetJournalEntriesQueryDto,
} from './accounting.dto';

@Controller('finance/accounting')
@ApiTags('Accounting')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Post('journal')
  @ApiOperation({ summary: 'Post journal entry' })
  async postJournal(@Body() entries: PostJournalEntryDto) {
    return this.accountingService.postJournalEntry(entries.entries as any);
  }

  @Post('journal/reverse/:transactionId')
  @ApiOperation({ summary: 'Reverse journal entry' })
  async reverseJournal(@Param('transactionId') transactionId: string, @Body() body: ReverseJournalEntryDto) {
    return this.accountingService.reverseJournalEntry(transactionId, body.reversedBy);
  }

  @Get('trial-balance')
  @ApiOperation({ summary: 'Get trial balance' })
  async getTrialBalance(@Query() query: TrialBalanceQueryDto) {
    return this.accountingService.getTrialBalance(new Date(query.startDate), new Date(query.endDate));
  }

  @Get('profit-loss')
  @ApiOperation({ summary: 'Get profit and loss' })
  async getProfitLoss(@Query() query: ProfitLossQueryDto) {
    return this.accountingService.getProfitAndLoss(new Date(query.startDate), new Date(query.endDate));
  }

  @Get('journal-entries')
  @ApiOperation({ summary: 'Get journal entries' })
  async getJournalEntries(@Query() query: GetJournalEntriesQueryDto) {
    return this.accountingService.getJournalEntries(query);
  }
}
