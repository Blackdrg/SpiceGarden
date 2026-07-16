import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateFeeDto {
  @IsString()
  applicableTo!: string;

  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsString()
  cityCode?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateFeeDto {
  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  cityCode?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: string;
}

export class CalculateFeeDto {
  @IsString()
  applicableTo!: string;

  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsString()
  cityCode?: string;
}

