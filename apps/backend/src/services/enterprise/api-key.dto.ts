import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiKeyScope } from '../../db/entities/api-key.entity';

export class GenerateApiKeyDto {
  @IsString()
  userId!: string;

  @IsString()
  name!: string;

  @IsArray()
  @IsString({ each: true })
  scopes!: ApiKeyScope[];

  @IsOptional()
  @IsString()
  tenantId?: string;
}

export class RevokeApiKeyDto {
  @IsString()
  revokedBy!: string;
}
