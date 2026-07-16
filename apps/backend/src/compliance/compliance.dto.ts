import { IsObject, IsArray, IsString } from 'class-validator';

export class MaskPiiDto {
  @IsObject()
  data!: Record<string, any>;

  @IsArray()
  @IsString({ each: true })
  fields!: string[];
}

export class UnmaskPiiDto {
  @IsObject()
  data!: Record<string, any>;

  @IsArray()
  @IsString({ each: true })
  fields!: string[];
}
