import { PartialType } from '@nestjs/mapped-types';
import {
  DegreeLevel,
  ExperienceType,
  SkillCategory,
  TestType,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

// ---------------- Education ----------------
export class CreateEducationDto {
  @IsString() institution!: string;
  @IsEnum(DegreeLevel) degree!: DegreeLevel;
  @IsOptional() @IsString() major?: string;
  @IsOptional() @IsNumber() gpa?: number;
  @IsOptional() @Type(() => Date) @IsDate() startDate?: Date;
  @IsOptional() @Type(() => Date) @IsDate() endDate?: Date;
}
export class UpdateEducationDto extends PartialType(CreateEducationDto) {}

// ---------------- Experience ----------------
export class CreateExperienceDto {
  @IsString() title!: string;
  @IsString() organization!: string;
  @IsOptional() @IsEnum(ExperienceType) type?: ExperienceType;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @Type(() => Date) @IsDate() startDate?: Date;
  @IsOptional() @Type(() => Date) @IsDate() endDate?: Date;
}
export class UpdateExperienceDto extends PartialType(CreateExperienceDto) {}

// ---------------- Research ----------------
export class CreateResearchDto {
  @IsString() title!: string;
  @IsOptional() @IsString() area?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsUrl() link?: string;
}
export class UpdateResearchDto extends PartialType(CreateResearchDto) {}

// ---------------- Project ----------------
export class CreateProjectDto {
  @IsString() name!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsUrl() link?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) techStack?: string[];
}
export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

// ---------------- Skill ----------------
export class CreateSkillDto {
  @IsString() name!: string;
  @IsOptional() @IsEnum(SkillCategory) category?: SkillCategory;
  @IsOptional() @IsInt() @Min(1) @Max(5) level?: number;
}
export class UpdateSkillDto extends PartialType(CreateSkillDto) {}

// ---------------- Language ----------------
export class CreateLanguageDto {
  @IsString() name!: string;
  @IsOptional() @IsString() proficiency?: string;
}
export class UpdateLanguageDto extends PartialType(CreateLanguageDto) {}

// ---------------- Publication ----------------
export class CreatePublicationDto {
  @IsString() title!: string;
  @IsOptional() @IsString() venue?: string;
  @IsOptional() @IsInt() @Min(1900) @Max(2100) year?: number;
  @IsOptional() @IsString() doi?: string;
  @IsOptional() @IsUrl() link?: string;
}
export class UpdatePublicationDto extends PartialType(CreatePublicationDto) {}

// ---------------- Test score (upsert by type) ----------------
export class UpsertTestScoreDto {
  @IsEnum(TestType) type!: TestType;
  @IsNumber() score!: number;
  @IsOptional() @Type(() => Date) @IsDate() takenAt?: Date;
}
