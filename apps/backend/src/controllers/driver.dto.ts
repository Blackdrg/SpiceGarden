import { IsBoolean, IsEnum, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateLocationDto {
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

export class ToggleAvailabilityDto {
  @IsBoolean()
  isAvailable!: boolean;
}

export class AcceptOrderDto {
  @IsString()
  driverId!: string;
}

export class RejectOrderDto {
  @IsString()
  driverId!: string;
}

export class UpdateStatusDto {
  @IsIn(['pickedUp', 'onTheWay', 'delivered', 'failed'])
  status!: 'pickedUp' | 'onTheWay' | 'delivered' | 'failed';

  @IsOptional()
  @IsNumber()
  actualTimeMinutes?: number;

  @IsOptional()
  @IsString()
  failureReason?: string;
}

export class VerifyOtpDto {
  @IsString()
  otp!: string;

  @IsString()
  driverId!: string;
}

export class ReportIssueDto {
  @IsString()
  issue!: string;

  @IsString()
  details!: string;
}
