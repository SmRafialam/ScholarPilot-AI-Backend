import { DocumentType, MatchTargetType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDocumentDto {
  @IsEnum(DocumentType) type!: DocumentType;
  @IsOptional() @IsEnum(MatchTargetType) targetType?: MatchTargetType;
  @IsOptional() @IsString() targetId?: string;
  /** Optional extra instructions, e.g. "emphasize my robotics project". */
  @IsOptional() @IsString() @MaxLength(1000) context?: string;
}

export class UpdateDocumentDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() content?: string;
}
