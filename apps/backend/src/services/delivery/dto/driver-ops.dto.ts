import { IsString, IsOptional, IsNumber, IsDateString, IsObject } from 'class-validator';

export class StartOnboardingDto {
  userId!: string;

  data!: Record<string, any>;
}

export class UploadDocumentDto {
  driverId!: string;

  type!: string;

  url!: string;

  @IsOptional()
  expiryDate?: string;
}

export class VerifyDocumentDto {
  status!: string;

  @IsOptional()
  notes?: string;

  @IsOptional()
  verifierId?: string;
}

export class CalculateIncentivesDto {
  driverId!: string;

  weekStart!: string;
}

export class GenerateIncentiveDto {
  driverId!: string;

  type!: string;

  amount!: number;

  description!: string;
}

export class ApproveIncentiveDto {
  approverId!: string;
}
