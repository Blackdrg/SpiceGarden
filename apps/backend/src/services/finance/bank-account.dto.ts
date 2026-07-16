import { IsString, IsOptional, IsObject } from 'class-validator';

export class AddBankAccountDto {
  @IsString()
  entityType!: string;

  @IsString()
  entityId!: string;

  @IsString()
  accountHolderName!: string;

  @IsString()
  accountNumber!: string;

  @IsString()
  ifscCode!: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  branchName?: string;

  @IsOptional()
  @IsString()
  accountType?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateBankAccountDto {
  @IsOptional()
  @IsString()
  accountHolderName?: string;

  @IsOptional()
  @IsString()
  ifscCode?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  branchName?: string;

  @IsOptional()
  @IsString()
  accountType?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class SubmitKycDto {
  @IsObject()
  documents!: Record<string, any>;
}

export class VerifyBankAccountDto {
  @IsString()
  verifiedBy!: string;
}

export class RejectKycDto {
  @IsString()
  reason!: string;
}
