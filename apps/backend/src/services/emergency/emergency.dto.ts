import { IsString, IsNumber, IsOptional, IsBoolean, IsObject, IsUUID, Min, Max, IsEnum } from 'class-validator';

export class CreateSosDto {
  @IsUUID('4')
  driverId!: string;

  @IsUUID('4')
  @IsOptional()
  orderId?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  accuracy?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(360)
  heading?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  speed?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  deviceBattery!: number;

  @IsString()
  @IsOptional()
  networkType?: string;

  @IsObject()
  @IsOptional()
  notes?: Record<string, any>;

  @IsString()
  @IsOptional()
  restaurantId?: string;

  @IsString()
  @IsOptional()
  customerId?: string;
}

export class EmergencyLocationDto {
  @IsUUID('4')
  incidentId!: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  accuracy?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(360)
  heading?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  speed?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  deviceBattery?: number;

  @IsString()
  @IsOptional()
  networkType?: string;
}

export class UpdateIncidentStatusDto {
  @IsEnum(['open', 'acknowledged', 'responded', 'in_progress', 'resolved', 'false_alarm', 'cancelled'])
  status!: string;

  @IsString()
  @IsOptional()
  resolutionNotes?: string;

  @IsObject()
  @IsOptional()
  notes?: Record<string, any>;
}

export class CreateEmergencyContactDto {
  @IsUUID('4')
  driverId!: string;

  @IsString()
  name!: string;

  @IsString()
  relationship!: string;

  @IsString()
  phone!: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsNumber()
  @Min(0)
  priority!: number;
}

export class EmergencyIncidentFilterDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  severity?: string;

  @IsString()
  @IsOptional()
  driverId?: string;

  @IsString()
  @IsOptional()
  restaurantId?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  orderNumber?: string;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsNumber()
  @IsOptional()
  offset?: number;
}
