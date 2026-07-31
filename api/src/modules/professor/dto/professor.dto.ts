import { PartialType } from '@nestjs/mapped-types';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

export class CreateProfessorDto {
  @IsString() name!: string;
  @IsString() universityId!: string;
  @IsOptional() @IsString() departmentId?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsUrl() facultyWebsite?: string;
  @IsOptional() @IsUrl() googleScholarUrl?: string;
  @IsOptional() @IsString() orcid?: string;
  @IsOptional() @IsBoolean() acceptingStudents?: boolean;
  @IsOptional() @IsBoolean() hasFunding?: boolean;
  @IsOptional() @IsString() lab?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) keywords?: string[];
}

export class UpdateProfessorDto extends PartialType(CreateProfessorDto) {}

export class CreatePublicationDto {
  @IsString() title!: string;
  @IsOptional() @IsString() venue?: string;
  @IsOptional() @IsInt() @Min(1900) @Max(2100) year?: number;
  @IsOptional() @IsUrl() link?: string;
}

export class SetResearchAreasDto {
  @IsArray() @IsString({ each: true }) areas!: string[];
}

export class QueryProfessorDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() universityId?: string;
  @IsOptional() @IsString() researchArea?: string;
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  acceptingStudents?: boolean;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(200) limit?: number = 20;
}
