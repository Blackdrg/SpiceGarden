import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class AddPaymentMethodDto {
  @IsString()
  type!: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  last4?: string;

  @IsOptional()
  @IsString()
  expiryMonth?: string;

  @IsOptional()
  @IsString()
  expiryYear?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
