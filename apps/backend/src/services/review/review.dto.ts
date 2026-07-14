import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  restaurantId!: string;

  @IsString()
  orderId!: string;

  @IsNumber()
  rating!: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
