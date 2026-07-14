import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class GeoLocationDto {
  @Type(() => Number)
  @IsNumber()
  lat!: number;

  @Type(() => Number)
  @IsNumber()
  lng!: number;
}

export class AddressDto {
  @IsString()
  label!: string;

  @IsString()
  addressLine!: string;

  @IsString()
  city!: string;

  @IsString()
  state!: string;

  @IsString()
  postalCode!: string;

  @ValidateNested()
  @Type(() => GeoLocationDto)
  location!: GeoLocationDto;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  addressLine?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => GeoLocationDto)
  location?: GeoLocationDto;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class PaymentMethodDto {
  @IsString()
  @IsIn(['card', 'upi', 'wallet'])
  type!: 'card' | 'upi' | 'wallet';

  @IsOptional()
  @IsString()
  cardLast4?: string;

  @IsOptional()
  @IsString()
  cardBrand?: string;

  @IsOptional()
  @IsString()
  cardExpiry?: string;

  @IsOptional()
  @IsString()
  upiId?: string;

  @IsOptional()
  @IsString()
  walletProvider?: string;

  @IsOptional()
  @IsString()
  externalPaymentMethodId?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
