import { IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DeviceInfoDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  ip?: string;
}

export class RegisterDeviceDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  fcmToken?: string;

  @IsOptional()
  @IsString()
  apnsToken?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DeviceInfoDto)
  deviceInfo?: DeviceInfoDto;
}

export class UpdateDeviceDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  fcmToken?: string;

  @IsOptional()
  @IsString()
  apnsToken?: string;
}

export class UnregisterDeviceDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  fcmToken?: string;

  @IsOptional()
  @IsString()
  apnsToken?: string;
}
