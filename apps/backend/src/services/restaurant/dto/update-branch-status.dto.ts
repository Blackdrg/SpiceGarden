import { IsBoolean } from 'class-validator';

export class UpdateBranchStatusDto {
  @IsBoolean()
  isOnline!: boolean;
}
