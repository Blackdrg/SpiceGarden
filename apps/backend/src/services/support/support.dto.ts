import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { DisputeType, DisputeStatus } from '../../db/entities/dispute.entity';
import { RefundType } from '../../db/entities/refund.entity';

export class RaiseDisputeDto {
  @IsString()
  orderId!: string;

  @IsString()
  customerId!: string;

  @IsEnum(DisputeType)
  type!: DisputeType;

  @IsString()
  description!: string;
}

export class ReviewDisputeDto {
  @IsString()
  reviewerId!: string;

  @IsEnum(DisputeStatus)
  status!: DisputeStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class RequestRefundDto {
  @IsString()
  orderId!: string;

  @IsString()
  requestedBy!: string;

  @IsEnum(RefundType)
  type!: RefundType;

  @IsNumber()
  amount!: number;

  @IsString()
  reason!: string;
}

export class ProcessRefundDto {
  @IsString()
  processedBy!: string;

  @IsOptional()
  @IsString()
  paymentReference?: string;
}

export class EscalateTicketDto {
  @IsOptional()
  @IsNumber()
  level?: number;
}
