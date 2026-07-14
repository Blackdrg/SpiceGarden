import { IsArray, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsString()
  id!: string;

  @IsString()
  name!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity!: number;
}

export class PlaceOrderDto {
  @IsString()
  userId!: string;

  @IsString()
  restaurantId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  grandTotal!: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items?: OrderItemDto[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  subtotal?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  tax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  deliveryFee?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  tip?: number;

  @IsOptional()
  @IsString()
  couponId?: string;

  @IsOptional()
  @IsString()
  deliveryAddressId?: string;

  @IsOptional()
  @IsString()
  driverId?: string;
}
