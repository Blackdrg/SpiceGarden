import { IsString, IsOptional } from 'class-validator';

export class SubscribeDto {
  @IsString()
  restaurantId!: string;

  @IsString()
  planId!: string;

  @IsString()
  billingCycle!: string;
}

export class UpgradeSubscriptionDto {
  @IsString()
  restaurantId!: string;

  @IsString()
  newPlanId!: string;
}

export class CancelSubscriptionDto {
  @IsString()
  restaurantId!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
