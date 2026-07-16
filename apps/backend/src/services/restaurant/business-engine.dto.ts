import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class SetDriverAvailabilityDto {
  @IsBoolean()
  isAvailable!: boolean;
}

export class UpdateDriverLocationDto {
  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;

  @IsOptional()
  @IsNumber()
  heading?: number;

  @IsOptional()
  @IsNumber()
  speed?: number;
}
