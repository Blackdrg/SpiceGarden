import { IsArray, IsString, IsNumber, IsOptional, IsDate } from 'class-validator';

export class JournalEntryDto {
  @IsString()
  accountCode!: string;

  @IsString()
  accountName!: string;

  @IsString()
  accountType!: string;

  @IsNumber()
  debitAmount!: number;

  @IsNumber()
  creditAmount!: number;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  referenceType?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;
}

export class PostJournalEntryDto {
  @IsArray()
  entries!: JournalEntryDto[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDate()
  date?: Date;
}

export class ReverseJournalEntryDto {
  @IsString()
  reversedBy!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class TrialBalanceQueryDto {
  @IsString()
  startDate!: string;

  @IsString()
  endDate!: string;
}

export class ProfitLossQueryDto {
  @IsString()
  startDate!: string;

  @IsString()
  endDate!: string;
}

export class GetJournalEntriesQueryDto {
  @IsOptional()
  @IsString()
  accountCode?: string;

  @IsOptional()
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
