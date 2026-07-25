import { PartialType } from '@nestjs/mapped-types';
import { DegreeLevel, Intake } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

// ---------------- Department ----------------
export class CreateDepartmentDto {
  @IsString() name!: string;
}
export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {}

// ---------------- Program ----------------
export class CreateProgramDto {
  @IsString() name!: string;
  @IsEnum(DegreeLevel) degree!: DegreeLevel;
  @IsOptional() @IsInt() @Min(1) durationMonths?: number;
  @IsOptional() @IsInt() @Min(0) tuitionFeeUsd?: number;
  /** e.g. { "ielts": 6.5, "toefl": 90 } */
  @IsOptional() @IsObject() englishRequirement?: Record<string, unknown>;
  @IsOptional() @IsObject() greRequirement?: Record<string, unknown>;
  @IsOptional() @Type(() => Date) @IsDate() applicationDeadline?: Date;
  @IsOptional() @IsEnum(Intake) intake?: Intake;
}
export class UpdateProgramDto extends PartialType(CreateProgramDto) {}

// ---------------- Research area ----------------
export class CreateResearchAreaDto {
  @IsString() name!: string;
}
