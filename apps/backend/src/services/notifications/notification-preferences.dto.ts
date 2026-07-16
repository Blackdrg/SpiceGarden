import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsBoolean()
  pushOrders?: boolean;

  @IsOptional()
  @IsBoolean()
  pushPromotions?: boolean;

  @IsOptional()
  @IsBoolean()
  pushDeliveryUpdates?: boolean;

  @IsOptional()
  @IsBoolean()
  emailOrders?: boolean;

  @IsOptional()
  @IsBoolean()
  emailPromotions?: boolean;

  @IsOptional()
  @IsBoolean()
  smsOrders?: boolean;

  @IsOptional()
  @IsBoolean()
  smsPromotions?: boolean;
}
