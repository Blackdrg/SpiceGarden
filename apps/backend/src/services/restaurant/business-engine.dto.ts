import { IsBoolean } from 'class-validator';

export class SetDriverAvailabilityDto {
  @IsBoolean()
  isAvailable!: boolean;
}
