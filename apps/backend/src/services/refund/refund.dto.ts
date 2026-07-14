import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { RefundRequestType } from './refund.service';

export class CreateRefundRequestDto {
  @IsString()
  orderId!: string;

  @IsString()
  requestedBy!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  reason!: string;

  @IsOptional()
  @IsEnum(RefundRequestType)
  requestType?: RefundRequestType;
}

export class ApproveRefundRequestDto {
  @IsString()
  approverId!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectRefundRequestDto {
  @IsString()
  approverId!: string;

  @IsString()
  reason!: string;
}

export class ProcessRefundDto {
  @IsString()
  processedBy!: string;

  @IsOptional()
  @IsString()
  gateway?: string;
}
