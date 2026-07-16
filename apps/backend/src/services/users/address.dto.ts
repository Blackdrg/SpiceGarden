import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class AddAddressDto {
  @IsString()
  label!: string;

  @IsString()
  street!: string;

  @IsOptional()
  @IsString()
  landmark?: string;

  @IsString()
  city!: string;

  @IsString()
  state!: string;

  @IsString()
  country!: string;

  @IsString()
  postalCode!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsObject()
  coordinates?: { lat: number; lng: number };
}
