import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetEarningsDto {
  @IsString()
  driverId!: string;

  @IsString()
  start!: string;

  @IsString()
  end!: string;
}

export class IssuePenaltyDto {
  @IsString()
  driverId!: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  issuedBy?: string;
}

export class WaivePenaltyDto {
  @IsString()
  waivedBy!: string;

  @IsString()
  reason!: string;
}
