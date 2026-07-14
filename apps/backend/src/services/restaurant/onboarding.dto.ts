import { IsBoolean, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { OnboardingStep } from '../../db/entities/restaurant-onboarding.entity';

export class UpdateOnboardingStepDto {
  @IsEnum(OnboardingStep)
  step!: OnboardingStep;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}

export class CompleteOnboardingDto {
  @IsString()
  reviewedBy!: string;
}

export class RejectOnboardingDto {
  @IsString()
  reviewedBy!: string;

  @IsString()
  reason!: string;
}

export class SubmitGstConfigDto {
  @IsString()
  gstin!: string;

  @IsString()
  legalNameOfBusiness!: string;

  @IsString()
  tradeName!: string;

  @IsString()
  address!: string;

  @IsString()
  stateCode!: string;

  @IsString()
  state!: string;

  @IsOptional()
  @IsString()
  registrationDate?: string;

  @IsOptional()
  @IsString()
  cancellationDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class SetupPricingDto {
  @IsObject()
  data!: Record<string, any>;
}

export class SetupPayoutDto {
  @IsString()
  accountHolderName?: string;

  @IsString()
  accountNumber?: string;

  @IsString()
  ifscCode?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  branchName?: string;

  @IsOptional()
  @IsBoolean()
  verified?: boolean;
}
