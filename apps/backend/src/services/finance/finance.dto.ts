import { IsString } from 'class-validator';

export class ReconcilePaymentsDto {
  @IsString()
  startDate!: string;

  @IsString()
  endDate!: string;
}

export class ReconcileRestaurantDto {
  @IsString()
  restaurantId!: string;

  @IsString()
  startDate!: string;

  @IsString()
  endDate!: string;
}

export class ReconcileDriverDto {
  @IsString()
  driverId!: string;

  @IsString()
  startDate!: string;

  @IsString()
  endDate!: string;
}

export class RunFullReconciliationDto {
  @IsString()
  startDate!: string;

  @IsString()
  endDate!: string;
}
