import { EmailType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEmailDto {
  @IsEnum(EmailType) type!: EmailType;
  /** Optional professor to address (pulls their research context). */
  @IsOptional() @IsString() professorId?: string;
  /** Extra instructions, e.g. "mention my CVPR paper". */
  @IsOptional() @IsString() @MaxLength(1000) context?: string;
}

export class UpdateEmailDto {
  @IsOptional() @IsString() subject?: string;
  @IsOptional() @IsString() body?: string;
}
