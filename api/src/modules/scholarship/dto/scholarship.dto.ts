import { PartialType } from '@nestjs/mapped-types';
import { DegreeLevel, FundingType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

export class CreateScholarshipDto {
  @IsString() name!: string;
  @IsOptional() @IsString() provider?: string;
  @IsOptional() @IsString() countryId?: string;
  @IsOptional() @IsString() universityId?: string;
  @IsOptional() @IsEnum(FundingType) fundingType?: FundingType;
  @IsOptional() @IsString() coverage?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) benefits?: string[];
  @IsOptional() @Type(() => Date) @IsDate() deadline?: Date;
  @IsOptional() @IsUrl() applicationLink?: string;
  @IsOptional() @IsString() description?: string;
}

export class UpdateScholarshipDto extends PartialType(CreateScholarshipDto) {}

export class UpsertEligibilityDto {
  @IsOptional() @IsNumber() @Min(0) @Max(4) minCgpa?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(9) minIelts?: number;
  @IsOptional() @IsArray() @IsEnum(DegreeLevel, { each: true }) degreeLevels?: DegreeLevel[];
  @IsOptional() @IsArray() @IsString({ each: true }) eligibleCountries?: string[];
  @IsOptional() @IsObject() criteria?: Record<string, unknown>;
}

export class QueryScholarshipDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsEnum(FundingType) fundingType?: FundingType;
  @IsOptional() @Type(() => Date) @IsDate() deadlineBefore?: Date;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(200) limit?: number = 20;
  @IsOptional() @IsString() sort?: 'deadline' | 'name';
}
