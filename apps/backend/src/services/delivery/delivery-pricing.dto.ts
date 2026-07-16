import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CalculateDeliveryFeeDto {
  @IsString()
  restaurantId!: string;

  @IsNumber()
  distanceKm!: number;

  @IsNumber()
  durationMinutes!: number;

  @IsOptional()
  @IsString()
  weatherCondition?: string;

  @IsOptional()
  @IsBoolean()
  isHoliday?: boolean;
}

export class CreatePricingRuleDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  baseFee?: number;

  @IsOptional()
  @IsNumber()
  perKmRate?: number;

  @IsOptional()
  @IsNumber()
  perMinuteRate?: number;

  @IsOptional()
  @IsString()
  cityCode?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePricingRuleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  baseFee?: number;

  @IsOptional()
  @IsNumber()
  perKmRate?: number;

  @IsOptional()
  @IsNumber()
  perMinuteRate?: number;

  @IsOptional()
  @IsString()
  cityCode?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
