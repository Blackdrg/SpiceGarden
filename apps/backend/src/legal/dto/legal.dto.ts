import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  IsObject,
  IsInt,
  IsDateString,
  IsUUID,
  IsIn,
  ValidateNested,
  Min,
  Max,
  IsEmail,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  LegalDocumentType,
  DocumentStatus,
  ApprovalStatus,
  ConsentCategory,
  Regulation,
  DataRequestType,
  DataRequestStatus,
  ExportFormat,
  RetentionAction,
  AgreementParty,
  SecurityIncidentSeverity,
  SecurityIncidentStatus,
} from '../entities/legal.enums';

export class SectionDto {
  @ApiProperty() @IsString() id!: string;
  @ApiProperty() @IsString() @MaxLength(255) title!: string;
  @ApiProperty() @IsString() content!: string;
  @ApiProperty() @IsInt() @Min(0) order!: number;
}

export class CreateDocumentDto {
  @ApiProperty({ enum: LegalDocumentType }) @IsEnum(LegalDocumentType) type!: LegalDocumentType;
  @ApiProperty() @IsString() @MaxLength(255) title!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() slug?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ownerRole?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() requiresAcceptance?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() multiLanguage?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() defaultLanguage?: string;
}

export class CreateVersionDto {
  @ApiProperty() @IsString() @MaxLength(255) title!: string;
  @ApiProperty({ type: [SectionDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => SectionDto) sections!: SectionDto[];
  @ApiPropertyOptional() @IsOptional() @IsString() summary?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() language?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() changeNotes?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() authorId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() effectiveDate?: string;
}

export class ApproveVersionDto {
  @ApiProperty() @IsString() approverId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class AcceptDocumentDto {
  @ApiProperty() @IsUUID() documentId!: string;
  @ApiProperty() @IsUUID() versionId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() method?: string;
}

export class RecordConsentDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() userId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() anonymousToken?: string;
  @ApiProperty({ enum: Regulation }) @IsEnum(Regulation) region!: Regulation;
  @ApiPropertyOptional() @IsOptional() @IsString() language?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() consentVersion?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() analytics?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() marketing?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() performance?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() functional?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() preference?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() method?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() source?: string;
}

export class CreateRequestDto {
  @ApiProperty() @IsUUID() userId!: string;
  @ApiProperty({ enum: DataRequestType }) @IsEnum(DataRequestType) type!: DataRequestType;
  @ApiProperty({ enum: Regulation }) @IsEnum(Regulation) regulation!: Regulation;
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Max(365) slaDays?: number;
  @ApiPropertyOptional() @IsOptional() @IsObject() metadata?: Record<string, any>;
}

export class ReviewRequestDto {
  @ApiProperty() @IsString() reviewerId!: string;
  @ApiProperty({ enum: ['approve', 'reject'] }) @IsIn(['approve', 'reject']) decision!: 'approve' | 'reject';
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class CreateExportDto {
  @ApiProperty() @IsUUID() userId!: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(Regulation) regulation?: Regulation;
  @ApiPropertyOptional() @IsOptional() @IsEnum(ExportFormat) format?: ExportFormat;
  @ApiPropertyOptional() @IsOptional() @IsUUID() requestId?: string;
}

export class RetentionPolicyDto {
  @ApiProperty() @IsString() @MaxLength(80) key!: string;
  @ApiProperty() @IsString() @MaxLength(128) label!: string;
  @ApiProperty() @IsString() @MaxLength(80) dataType!: string;
  @ApiProperty() @IsInt() @Min(0) retentionDays!: number;
  @ApiProperty({ enum: RetentionAction }) @IsEnum(RetentionAction) action!: RetentionAction;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() enabled?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() legalHoldCapable?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() scope?: Record<string, any>;
}

export class CreateAgreementDto {
  @ApiProperty({ enum: AgreementParty }) @IsEnum(AgreementParty) party!: AgreementParty;
  @ApiProperty() @IsString() @MaxLength(80) type!: string;
  @ApiProperty() @IsString() @MaxLength(255) title!: string;
  @ApiProperty() @IsString() content!: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() clauses?: { id: string; title: string; text: string }[];
  @ApiPropertyOptional() @IsOptional() @IsString() language?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() authorId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() effectiveDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() expiresAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() changeNotes?: string;
}

export class AcceptAgreementDto {
  @ApiProperty() @IsUUID() agreementId!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() userId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() partyId?: string;
  @ApiProperty() @IsString() partyType!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() signature?: string;
}

export class ReportIncidentDto {
  @ApiProperty() @IsString() @MaxLength(160) title!: string;
  @ApiProperty() @IsString() description!: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(SecurityIncidentSeverity) severity?: SecurityIncidentSeverity;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() reporterId?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() reporterEmail?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) affectedSystems?: string[];
}

export class UpdateIncidentDto {
  @ApiPropertyOptional() @IsOptional() @IsEnum(SecurityIncidentStatus) status?: SecurityIncidentStatus;
  @ApiPropertyOptional() @IsOptional() @IsEnum(SecurityIncidentSeverity) severity?: SecurityIncidentSeverity;
  @ApiPropertyOptional() @IsOptional() @IsString() assignedTo?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) remediationSteps?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() publiclyDisclosed?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() disclosureText?: string;
}

export class CreateGrievanceDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() userId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() regulation?: string;
  @ApiProperty() @IsString() @MaxLength(160) subject!: string;
  @ApiProperty() @IsString() description!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() complainantName?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() complainantEmail?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() complainantPhone?: string;
}

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @ApiPropertyOptional({ default: 50 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(500) limit?: number = 50;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
}

export class ConsentCategoryFilterDto {
  @ApiProperty({ enum: ConsentCategory }) @IsEnum(ConsentCategory) category!: ConsentCategory;
}
