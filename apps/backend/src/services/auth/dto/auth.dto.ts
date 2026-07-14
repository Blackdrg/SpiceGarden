import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsOptional()
  @IsString()
  deviceName?: string;

  @IsOptional()
  @IsString()
  deviceType?: string;
}

export class MfaLoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  deviceName?: string;

  @IsOptional()
  @IsString()
  deviceType?: string;
}

export class RegisterDto {
  @IsString()
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  phone!: string;

  @IsOptional()
  @IsString()
  deviceName?: string;

  @IsOptional()
  @IsString()
  deviceType?: string;
}

export class RequestOtpDto {
  @IsEmail()
  email!: string;
}

export class VerifyResetCodeDto {
  @IsEmail()
  email!: string;

  @IsString()
  code!: string;
}

export class ResetPasswordDto {
  @IsEmail()
  email!: string;

  @IsString()
  code!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
