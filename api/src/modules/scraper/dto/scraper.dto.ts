import { ReviewStatus, ScrapeEntityType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateScrapeSourceDto {
  @IsString() name!: string;
  @IsUrl() baseUrl!: string;
  @IsEnum(ScrapeEntityType) type!: ScrapeEntityType;
}

export class ReviewQueueQueryDto {
  @IsOptional() @IsEnum(ReviewStatus) status?: ReviewStatus;
  @IsOptional() @IsEnum(ScrapeEntityType) type?: ScrapeEntityType;
}
