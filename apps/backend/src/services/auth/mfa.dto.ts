import { IsString } from 'class-validator';

export class EnableMfaDto {
  @IsString()
  code!: string;
}

export class DisableMfaDto {
  @IsString()
  code!: string;
}
