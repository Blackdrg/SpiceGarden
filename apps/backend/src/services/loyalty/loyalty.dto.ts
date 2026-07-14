import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ApplyCouponDto {
  @IsString()
  code!: string;

  @IsString()
  userId!: string;

  @IsNumber()
  orderAmount!: number;

  @IsOptional()
  @IsString()
  orderId?: string;
}

export class GenerateReferralCodeDto {
  @IsString()
  userId!: string;
}

export class ProcessReferralDto {
  @IsString()
  code!: string;

  @IsString()
  refereeId!: string;

  @IsString()
  firstOrderId!: string;
}

export class ProcessCashbackDto {
  @IsString()
  userId!: string;

  @IsString()
  orderId!: string;

  @IsNumber()
  orderAmount!: number;
}
