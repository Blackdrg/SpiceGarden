import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentIntentDto {
  @IsString()
  userId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  paymentMethodId?: string;

  @IsOptional()
  @IsString()
  gateway?: string;

  @IsOptional()
  @IsString()
  addressId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;
}

export class RefundPaymentDto {
  @IsString()
  userId!: string;

  @IsString()
  paymentIntentId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
