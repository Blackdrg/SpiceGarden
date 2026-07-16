import { IsString, IsOptional, IsObject } from 'class-validator';

export class AddressDto {
  @IsString()
  line1!: string;

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
  @IsString()
  country?: string;
}

export class BankAccountDto {
  @IsString()
  accountNumber!: string;

  @IsString()
  ifscCode!: string;

  @IsString()
  accountHolderName!: string;

  @IsOptional()
  @IsString()
  bankName?: string;
}

export class CreateStripeConnectAccountDto {
  @IsString()
  legalBusinessName!: string;

  @IsString()
  businessType!: string;

  @IsString()
  email!: string;

  @IsString()
  phone!: string;

  @IsObject()
  address!: AddressDto;

  @IsOptional()
  @IsString()
  gstin?: string;

  @IsOptional()
  @IsString()
  pan?: string;

  @IsOptional()
  @IsObject()
  bankAccount?: BankAccountDto;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CreateRazorpayFundAccountDto {
  @IsString()
  legalBusinessName!: string;

  @IsString()
  email!: string;

  @IsString()
  phone!: string;

  @IsString()
  businessType!: string;

  @IsOptional()
  @IsString()
  gstin?: string;

  @IsOptional()
  @IsString()
  pan?: string;

  address!: AddressDto;

  @IsObject()
  bankAccount!: BankAccountDto;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
