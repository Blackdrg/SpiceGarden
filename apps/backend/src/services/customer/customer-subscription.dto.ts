import { IsString } from 'class-validator';

export class SubscribeCustomerDto {
  @IsString()
  userId!: string;

  @IsString()
  planId!: string;

  @IsString()
  billingCycle!: string;
}

export class CancelCustomerSubscriptionDto {
  @IsString()
  userId!: string;
}
