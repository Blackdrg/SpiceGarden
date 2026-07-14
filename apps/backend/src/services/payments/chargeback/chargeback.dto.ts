import { IsOptional, IsString } from 'class-validator';

export class InitiateRefundForWonDisputeDto {
  @IsString()
  processedBy!: string;

  @IsOptional()
  @IsString()
  gateway?: string;
}
