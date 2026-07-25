import { FundingRequirement, Intake } from '@prisma/client';
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

/** Partial update of the student's core profile fields. */
export class UpdateProfileDto {
  @IsOptional() @IsString() fullName?: string;
  @IsOptional() @IsString() countryId?: string;
  @IsOptional() @IsString() currentUniversity?: string;
  @IsOptional() @IsString() department?: string;

  @IsOptional() @IsNumber() @Min(0) @Max(4) cgpa?: number;
  @IsOptional() @IsNumber() @Min(0) cgpaScale?: number;

  @IsOptional() @Type(() => Date) @IsDate() expectedGraduation?: Date;

  @IsOptional() @IsString() researchInterest?: string;

  @IsOptional() @IsUrl() githubUrl?: string;
  @IsOptional() @IsUrl() portfolioUrl?: string;
  @IsOptional() @IsUrl() linkedinUrl?: string;

  @IsOptional() @IsInt() @Min(0) budgetUsd?: number;

  @IsOptional() @IsEnum(FundingRequirement) fundingRequirement?: FundingRequirement;
  @IsOptional() @IsEnum(Intake) preferredIntake?: Intake;

  @IsOptional() @IsArray() @IsString({ each: true }) targetCountries?: string[];
}
