import { IsString } from 'class-validator';

export class BanUserDto {
  @IsString()
  userId!: string;

  @IsString()
  reason!: string;
}
