import { IsString, IsOptional, IsNumber, IsDate } from 'class-validator';

export class CreateSettlementDto {
  @IsString()
  restaurantId!: string;

  @IsOptional()
  @IsString()
  payoutReportId?: string;

  @IsOptional()
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @IsOptional()
  @IsNumber()
  platformFee?: number;

  @IsOptional()
  @IsNumber()
  netAmount?: number;
}

export class GetSettlementsQueryDto {
  @IsOptional()
  @IsString()
  restaurantId?: string;

  @IsOptional()
  @IsString()
  status?: string;

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

export class FailSettlementDto {
  @IsString()
  reason!: string;
}

export class GetSettlementSummaryDto {
  @IsNumber()
  month!: number;

  @IsNumber()
  year!: number;
}
