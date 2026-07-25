import { ApplicationStage } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateApplicationDto {
  @IsOptional() @IsString() universityId?: string;
  @IsOptional() @IsString() programId?: string;
  @IsOptional() @IsString() scholarshipId?: string;
  @IsOptional() @IsString() professorId?: string;
  @IsOptional() @IsEnum(ApplicationStage) stage?: ApplicationStage;
  @IsOptional() @IsString() @MaxLength(2000) notes?: string;
  @IsOptional() @Type(() => Date) @IsDate() deadline?: Date;
}

export class UpdateApplicationDto {
  @IsOptional() @IsEnum(ApplicationStage) stage?: ApplicationStage;
  @IsOptional() @IsString() @MaxLength(2000) notes?: string;
  @IsOptional() @Type(() => Date) @IsDate() deadline?: Date;
}
