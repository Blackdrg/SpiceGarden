import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { OnboardingStep } from '../../db/entities/restaurant-onboarding.entity';
import { ModerationAction, ModerationStatus } from '../../db/entities/menu-moderation.entity';
import { CommissionType } from '../../db/entities/commission-rule.entity';

export class RestaurantOnboardingDataDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  businessDetails?: Record<string, any>;
}

export class StartOnboardingDto {
  @IsString()
  userId!: string;

  @ValidateNested()
  @Type(() => RestaurantOnboardingDataDto)
  restaurantData!: RestaurantOnboardingDataDto;
}

export class UpdateOnboardingStepDto {
  @IsEnum(OnboardingStep)
  step!: OnboardingStep;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}

export class SubmitForModerationDto {
  @IsString()
  menuItemId!: string;

  @IsString()
  restaurantId!: string;

  @IsEnum(ModerationAction)
  action!: ModerationAction;

  @IsObject()
  data!: Record<string, any>;

  @IsOptional()
  @IsObject()
  originalData?: Record<string, any>;
}

export class ReviewModerationDto {
  @IsEnum(ModerationStatus)
  status!: ModerationStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class GeneratePayoutDto {
  @IsString()
  restaurantId!: string;

  @IsString()
  periodStart!: string;

  @IsString()
  periodEnd!: string;
}

export class ProcessPayoutDto {
  @IsString()
  reference!: string;
}

export class BranchDataDto {
  @IsString()
  branchName!: string;

  @IsString()
  address!: string;

  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;

  @IsOptional()
  @IsString()
  openingTime?: string;

  @IsOptional()
  @IsString()
  closingTime?: string;
}

export class CreateBranchDto {
  @IsString()
  restaurantId!: string;

  @ValidateNested()
  @Type(() => BranchDataDto)
  branchData!: BranchDataDto;
}

export class ToggleBranchStatusDto {
  @IsBoolean()
  isOnline!: boolean;
}

export class CommissionRuleDataDto {
  @IsEnum(CommissionType)
  type!: CommissionType;

  @IsNumber()
  value!: number;

  @IsOptional()
  @IsNumber()
  minOrderValue?: number;

  @IsOptional()
  @IsNumber()
  maxOrderValue?: number;

  @IsOptional()
  @Type(() => Date)
  validFrom?: Date;

  @IsOptional()
  @Type(() => Date)
  validTo?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableCategories?: string[];
}

export class CreateCommissionRuleDto {
  @IsString()
  restaurantId!: string;

  @ValidateNested()
  @Type(() => CommissionRuleDataDto)
  ruleData!: CommissionRuleDataDto;
}

export class CalculateCommissionDto {
  @IsString()
  restaurantId!: string;

  @IsNumber()
  orderAmount!: number;
}
