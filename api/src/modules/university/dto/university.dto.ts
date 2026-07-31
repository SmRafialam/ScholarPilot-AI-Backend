import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

export class CreateUniversityDto {
  @IsString() name!: string;
  @IsString() countryId!: string;
  @IsOptional() @IsString() cityId?: string;
  @IsOptional() @IsInt() @Min(1) qsRanking?: number;
  @IsOptional() @IsInt() @Min(1) worldRanking?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(100) acceptanceRate?: number;
  @IsOptional() @IsInt() @Min(0) applicationFeeUsd?: number;
  @IsOptional() @IsInt() @Min(0) tuitionFeeUsd?: number;
  @IsOptional() @IsUrl() website?: string;
  @IsOptional() @IsUrl() applicationPortal?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsUrl() logoUrl?: string;
}

export class UpdateUniversityDto extends PartialType(CreateUniversityDto) {}

export class QueryUniversityDto {
  @IsOptional() @IsString() q?: string;
  /** ISO alpha-2 country code, e.g. "DE". */
  @IsOptional() @IsString() country?: string;
  /** City name, e.g. "London". Usually combined with `country`. */
  @IsOptional() @IsString() city?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) maxRanking?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(200) limit?: number = 20;
  /** "ranking" (default) or "name". */
  @IsOptional() @IsString() sort?: 'ranking' | 'name';
}
